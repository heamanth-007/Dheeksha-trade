import mongoose from 'mongoose';
import { Performa, type IPerforma } from '../models/Performa';
import { PerformaAudit } from '../models/PerformaAudit';
import { Customer } from '../models/Customer';
import { escapeRegex } from '../utils/ledgerUtils';

export interface BillProductInput {
  particular: string;
  quantity: string;
  rate: string;
  pktUnit?: string;
  amount: string;
}

export interface ConsumptionResultItem {
  performaId: string;
  performaNumber: string;
  productId?: string;
  productName: string;
  casesConsumed: number;
  amountConsumed: number;
  remainingCasesInPerforma: number;
}

export interface BillConsumptionResult {
  consumed: boolean;
  totalCasesConsumed: number;
  totalAmountConsumed: number;
  items: ConsumptionResultItem[];
  warnings: string[];
  remainingCustomerAdvance: number;
}

export const consumeBillAgainstPerforma = async (
  particularId: string,
  billNo: string,
  customerName: string,
  billDate: string,
  products: BillProductInput[],
  _billTotal: number
): Promise<BillConsumptionResult> => {
  const result: BillConsumptionResult = {
    consumed: false,
    totalCasesConsumed: 0,
    totalAmountConsumed: 0,
    items: [],
    warnings: [],
    remainingCustomerAdvance: 0,
  };

  if (!customerName || !products || products.length === 0) {
    return result;
  }

  try {
    const escapedCustomerName = escapeRegex(customerName.trim());
    // Find customer to obtain accurate ID
    const customer = await Customer.findOne({
      name: { $regex: new RegExp(`^${escapedCustomerName}$`, 'i') },
    });

    const customerQuery: any = {
      $or: [
        { 'customerSnapshot.name': { $regex: new RegExp(`^${escapedCustomerName}$`, 'i') } },
      ],
    };
    if (customer?._id) {
      customerQuery.$or.push({ customerId: customer._id });
    }

    // Find all ACTIVE and PARTIALLY_USED Performas for this customer, sorted FIFO (oldest first)
    const activePerformas: IPerforma[] = await Performa.find({
      ...customerQuery,
      status: { $in: ['ACTIVE', 'PARTIALLY_USED'] },
    }).sort({ date: 1, createdAt: 1, _id: 1 });

    if (activePerformas.length === 0) {
      return result;
    }

    // Process each bill item against available Performas
    for (const billItem of products) {
      const billedCases = parseFloat(billItem.quantity) || 0;
      const itemAmount = parseFloat(String(billItem.amount || '0').replace(/,/g, '')) || 0;
      const itemRate = parseFloat(String(billItem.rate || '0').replace(/,/g, '')) || 0;
      const billedNameNormalized = billItem.particular.trim().toLowerCase();

      if (billedCases <= 0) continue;

      let remainingCasesToConsume = billedCases;
      let totalAvailableForProduct = 0;

      // Count total available across active performas for warning detection
      for (const p of activePerformas) {
        for (const pProd of p.products) {
          const pName = pProd.productSnapshot.productName.trim().toLowerCase();
          const pCode = (pProd.productSnapshot.productCode || '').trim().toLowerCase();
          if (pName === billedNameNormalized || (pCode && pCode === billedNameNormalized)) {
            totalAvailableForProduct += pProd.remainingCases;
          }
        }
      }

      if (totalAvailableForProduct > 0 && billedCases > totalAvailableForProduct) {
        result.warnings.push(
          `Performa allocation available only for ${totalAvailableForProduct} cases of "${billItem.particular}". ${billedCases - totalAvailableForProduct} additional cases are outside the Performa.`
        );
      }

      for (const performa of activePerformas) {
        if (remainingCasesToConsume <= 0) break;
        if (performa.status === 'COMPLETED' || performa.status === 'CANCELLED') continue;

        for (const pProd of performa.products) {
          if (remainingCasesToConsume <= 0) break;

          const pName = pProd.productSnapshot.productName.trim().toLowerCase();
          const pCode = (pProd.productSnapshot.productCode || '').trim().toLowerCase();

          // Match by SKU or Name
          if (pName === billedNameNormalized || (pCode && pCode === billedNameNormalized)) {
            const availableCases = pProd.remainingCases || 0;
            if (availableCases <= 0) continue;

            const casesToConsume = Math.min(remainingCasesToConsume, availableCases);
            if (casesToConsume <= 0) continue;

            // Calculate consumption amount proportionally to actual billed amount
            let consumedAmount = 0;
            if (billedCases > 0 && itemAmount > 0) {
              consumedAmount = Number(((casesToConsume / billedCases) * itemAmount).toFixed(2));
            } else {
              consumedAmount = Number((casesToConsume * itemRate).toFixed(2));
            }

            // Update product item inside performa
            pProd.usedCases = Number((pProd.usedCases + casesToConsume).toFixed(2));
            pProd.caseOut = Number((pProd.caseOut + casesToConsume).toFixed(2));
            pProd.remainingCases = Math.max(0, Number((pProd.requiredCases - pProd.usedCases).toFixed(2)));
            pProd.usedAmount = Number((pProd.usedAmount + consumedAmount).toFixed(2));
            pProd.remainingAmount = Math.max(0, Number((pProd.allocatedAmount - pProd.usedAmount).toFixed(2)));

            // Update performa overall totals
            performa.totalUsedCases = Number(
              performa.products.reduce((acc, curr) => acc + curr.usedCases, 0).toFixed(2)
            );
            performa.totalRemainingCases = Math.max(
              0,
              Number((performa.totalRequiredCases - performa.totalUsedCases).toFixed(2))
            );
            performa.advanceUsedAmount = Number((performa.advanceUsedAmount + consumedAmount).toFixed(2));
            performa.remainingAdvanceAmount = Math.max(
              0,
              Number((performa.advanceAmount - performa.advanceUsedAmount).toFixed(2))
            );
            performa.totalUsedAmount = Number(
              performa.products.reduce((acc, curr) => acc + curr.usedAmount, 0).toFixed(2)
            );
            performa.totalRemainingAmount = Math.max(
              0,
              Number((performa.totalAllocatedAmount - performa.totalUsedAmount).toFixed(2))
            );

            // Update Performa status
            const allItemsFulfilled = performa.products.every((p) => p.remainingCases <= 0);
            if (allItemsFulfilled) {
              performa.status = 'COMPLETED';
            } else if (performa.totalUsedCases > 0) {
              performa.status = 'PARTIALLY_USED';
            }

            await performa.save();

            // Record audit log
            await PerformaAudit.create({
              customerId: customer?._id || performa.customerId,
              customerName: customerName.trim(),
              performaId: performa._id,
              performaNumber: performa.performaNumber,
              particularId: new mongoose.Types.ObjectId(particularId),
              billNo: billNo,
              productId: pProd.productId,
              productName: pProd.productSnapshot.productName,
              cases: casesToConsume,
              amount: consumedAmount,
              type: 'PERFORMA_CONSUMED',
              date: billDate,
              reference: `Bill #${billNo}`,
              notes: `Consumed ${casesToConsume} cases for bill #${billNo}`,
              createdBy: 'System',
            });

            result.consumed = true;
            result.totalCasesConsumed += casesToConsume;
            result.totalAmountConsumed += consumedAmount;
            result.items.push({
              performaId: String(performa._id),
              performaNumber: performa.performaNumber,
              productId: pProd.productId ? String(pProd.productId) : undefined,
              productName: pProd.productSnapshot.productName,
              casesConsumed: casesToConsume,
              amountConsumed: consumedAmount,
              remainingCasesInPerforma: pProd.remainingCases,
            });

            remainingCasesToConsume -= casesToConsume;
          }
        }
      }
    }

    // Recalculate remaining customer advance
    const summary = await getCustomerPerformaSummary(customerName);
    result.remainingCustomerAdvance = summary.availableAdvance;

    return result;
  } catch (err) {
    console.error(`[Performa Consumption Error for Bill ${billNo}]:`, err);
    return result;
  }
};

export const reverseBillConsumption = async (particularId: string): Promise<void> => {
  if (!particularId) return;

  try {
    const consumedAudits = await PerformaAudit.find({
      particularId: new mongoose.Types.ObjectId(particularId),
      type: 'PERFORMA_CONSUMED',
    });

    if (consumedAudits.length === 0) return;

    for (const audit of consumedAudits) {
      if (!audit.performaId) continue;

      const performa = await Performa.findById(audit.performaId);
      if (!performa) continue;

      const auditCases = audit.cases || 0;
      const auditAmount = audit.amount || 0;

      // Find matching product in performa
      const pProd = performa.products.find((p) => {
        if (audit.productId && p.productId) {
          return String(p.productId) === String(audit.productId);
        }
        return (
          p.productSnapshot.productName.trim().toLowerCase() ===
          (audit.productName || '').trim().toLowerCase()
        );
      });

      if (pProd) {
        pProd.usedCases = Math.max(0, Number((pProd.usedCases - auditCases).toFixed(2)));
        pProd.caseOut = Math.max(0, Number((pProd.caseOut - auditCases).toFixed(2)));
        pProd.remainingCases = Math.min(
          pProd.requiredCases,
          Number((pProd.requiredCases - pProd.usedCases).toFixed(2))
        );
        pProd.usedAmount = Math.max(0, Number((pProd.usedAmount - auditAmount).toFixed(2)));
        pProd.remainingAmount = Math.min(
          pProd.allocatedAmount,
          Number((pProd.allocatedAmount - pProd.usedAmount).toFixed(2))
        );
      }

      performa.totalUsedCases = Number(
        performa.products.reduce((acc, curr) => acc + curr.usedCases, 0).toFixed(2)
      );
      performa.totalRemainingCases = Math.max(
        0,
        Number((performa.totalRequiredCases - performa.totalUsedCases).toFixed(2))
      );
      performa.advanceUsedAmount = Math.max(0, Number((performa.advanceUsedAmount - auditAmount).toFixed(2)));
      performa.remainingAdvanceAmount = Math.min(
        performa.advanceAmount,
        Number((performa.advanceAmount - performa.advanceUsedAmount).toFixed(2))
      );
      performa.totalUsedAmount = Number(
        performa.products.reduce((acc, curr) => acc + curr.usedAmount, 0).toFixed(2)
      );
      performa.totalRemainingAmount = Math.min(
        performa.totalAllocatedAmount,
        Number((performa.totalAllocatedAmount - performa.totalUsedAmount).toFixed(2))
      );

      // Re-evaluate status
      if (performa.status !== 'CANCELLED') {
        if (performa.totalUsedCases === 0 && performa.advanceUsedAmount === 0) {
          performa.status = 'ACTIVE';
        } else if (performa.totalRemainingCases > 0) {
          performa.status = 'PARTIALLY_USED';
        }
      }

      await performa.save();

      // Log reversal audit
      await PerformaAudit.create({
        customerId: audit.customerId,
        customerName: audit.customerName,
        performaId: performa._id,
        performaNumber: performa.performaNumber,
        particularId: new mongoose.Types.ObjectId(particularId),
        billNo: audit.billNo,
        productId: audit.productId,
        productName: audit.productName,
        cases: auditCases,
        amount: auditAmount,
        type: 'PERFORMA_REVERSED',
        date: new Date().toISOString().split('T')[0],
        reference: `Reversal for Bill #${audit.billNo || particularId}`,
        notes: `Reversed ${auditCases} cases upon bill update/deletion`,
        createdBy: 'System',
      });
    }

    // Remove or neutralize previous PERFORMA_CONSUMED logs for this particularId
    await PerformaAudit.deleteMany({
      particularId: new mongoose.Types.ObjectId(particularId),
      type: 'PERFORMA_CONSUMED',
    });
  } catch (err) {
    console.error(`[Performa Reversal Error for Particular ${particularId}]:`, err);
  }
};

export const getCustomerPerformaSummary = async (customerIdentifier: string): Promise<any> => {
  if (!customerIdentifier || customerIdentifier.trim() === '' || customerIdentifier.toLowerCase() === 'all') {
    return {
      customerId: null,
      customerName: '',
      totalAdvanceReceived: 0,
      totalAdvanceUsed: 0,
      availableAdvance: 0,
      totalAllocatedCases: 0,
      totalUsedCases: 0,
      totalRemainingCases: 0,
      activePerformasCount: 0,
      activePerformas: [],
    };
  }

  const isObjectId = mongoose.Types.ObjectId.isValid(customerIdentifier);
  let customer: any = null;
  if (isObjectId) {
    customer = await Customer.findById(customerIdentifier);
  }
  if (!customer) {
    const escaped = escapeRegex(customerIdentifier.trim());
    customer = await Customer.findOne({
      name: { $regex: new RegExp(`^${escaped}$`, 'i') },
    });
  }

  const customerName = customer ? customer.name : customerIdentifier.trim();
  const customerId = customer ? customer._id : null;

  const query: any = {
    $or: [
      { 'customerSnapshot.name': { $regex: new RegExp(`^${escapeRegex(customerName)}$`, 'i') } },
    ],
  };
  if (customerId) {
    query.$or.push({ customerId });
  }

  const performas: IPerforma[] = await Performa.find(query).sort({ date: -1, createdAt: -1 });

  // Calculate AccountLedger total credit & debit for customer (Add Credit entries)
  const { AccountLedger } = await import('../models/AccountLedger');
  const ledgerEntries = await AccountLedger.find({
    customerName: { $regex: new RegExp(`^${escapeRegex(customerName)}$`, 'i') },
  }).lean();

  let ledgerTotalCredit = 0;
  let ledgerTotalDebit = 0;
  for (const entry of ledgerEntries) {
    const cred = parseFloat(String(entry.credit || '0').replace(/,/g, '')) || 0;
    const deb = parseFloat(String(entry.debit || '0').replace(/,/g, '')) || 0;
    ledgerTotalCredit += cred;
    ledgerTotalDebit += deb;
  }
  const ledgerCreditBalance = Number((ledgerTotalCredit - ledgerTotalDebit).toFixed(2));

  // Calculate audit-based ledger for advances
  const auditQuery: any = {
    $or: [
      { customerName: { $regex: new RegExp(`^${escapeRegex(customerName)}$`, 'i') } },
    ],
  };
  if (customerId) {
    auditQuery.$or.push({ customerId });
  }

  const audits = await PerformaAudit.find(auditQuery).lean();

  let performaAdvanceReceived = 0;
  let performaAdvanceUsed = 0;

  for (const audit of audits) {
    if (audit.type === 'ADVANCE_RECEIVED' || audit.type === 'PERFORMA_ADVANCE') {
      performaAdvanceReceived += Number(audit.amount) || 0;
    } else if (audit.type === 'PERFORMA_CONSUMED') {
      performaAdvanceUsed += Number(audit.amount) || 0;
    } else if (audit.type === 'PERFORMA_REVERSED') {
      performaAdvanceUsed = Math.max(0, performaAdvanceUsed - (Number(audit.amount) || 0));
    }
  }

  // If there are performas created directly with advance amounts not in audits (fallback):
  if (performaAdvanceReceived === 0) {
    performaAdvanceReceived = performas.reduce((acc, p) => acc + (p.advanceAmount || 0), 0);
    performaAdvanceUsed = performas.reduce((acc, p) => acc + (p.advanceUsedAmount || 0), 0);
  }

  // Total Advance includes Performa advances + Account Credit entries
  const totalAdvanceReceived = Number((performaAdvanceReceived + ledgerTotalCredit).toFixed(2));
  const totalAdvanceUsed = Number(Math.max(ledgerTotalDebit, performaAdvanceUsed).toFixed(2));
  const availableAdvance = Math.max(0, Number((totalAdvanceReceived - totalAdvanceUsed).toFixed(2)));

  const totalAllocatedCases = performas.reduce((acc, p) => acc + (p.totalRequiredCases || 0), 0);
  const totalUsedCases = performas.reduce((acc, p) => acc + (p.totalUsedCases || 0), 0);
  const totalRemainingCases = Math.max(0, totalAllocatedCases - totalUsedCases);

  const activePerformas = performas.filter(
    (p) => p.status === 'ACTIVE' || p.status === 'PARTIALLY_USED'
  );

  return {
    customerId: customerId ? String(customerId) : null,
    customerName,
    ledgerTotalCredit: Number(ledgerTotalCredit.toFixed(2)),
    ledgerTotalDebit: Number(ledgerTotalDebit.toFixed(2)),
    ledgerCreditBalance,
    performaAdvanceReceived: Number(performaAdvanceReceived.toFixed(2)),
    totalAdvanceReceived,
    totalAdvanceUsed,
    availableAdvance,
    totalAllocatedCases,
    totalUsedCases,
    totalRemainingCases,
    activePerformasCount: activePerformas.length,
    activePerformas: activePerformas.map((p) => ({
      _id: String(p._id),
      performaNumber: p.performaNumber,
      date: p.date,
      advanceAmount: p.advanceAmount,
      remainingAdvanceAmount: p.remainingAdvanceAmount,
      totalRemainingCases: p.totalRemainingCases,
      status: p.status,
      products: p.products.map((prod) => ({
        productId: prod.productId ? String(prod.productId) : undefined,
        productCode: prod.productSnapshot.productCode,
        productName: prod.productSnapshot.productName,
        companyName: prod.productSnapshot.companyName,
        requiredCases: prod.requiredCases,
        usedCases: prod.usedCases,
        remainingCases: prod.remainingCases,
        rate: prod.rate,
        pktPerUnit: prod.pktPerUnit,
        allocatedAmount: prod.allocatedAmount,
        remainingAmount: prod.remainingAmount,
      })),
    })),
  };
};
