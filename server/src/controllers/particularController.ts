import type { Request, Response, NextFunction } from 'express';
import { Particular } from '../models/Particular';
import { AccountLedger } from '../models/AccountLedger';
import { escapeRegex, recalculateCustomerBalance } from '../utils/ledgerUtils';

export const getParticulars = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { customerName } = req.query;
    const filter: any = {};
    if (customerName && typeof customerName === 'string' && customerName.trim() !== '' && customerName.toLowerCase() !== 'all') {
      filter.customerName = { $regex: new RegExp(`^${escapeRegex(customerName.trim())}$`, 'i') };
    }

    const particulars = await Particular.find(filter).sort({ createdAt: -1, _id: -1 });
    res.status(200).json({ success: true, count: particulars.length, data: particulars });
  } catch (error) {
    next(error);
  }
};

export const getParticularById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const particular = await Particular.findById(req.params.id);
    if (!particular) {
      res.status(404).json({ success: false, error: 'Particular bill not found' });
      return;
    }
    res.status(200).json({ success: true, data: particular });
  } catch (error) {
    next(error);
  }
};

export const getNextBillNo = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const allParticulars = await Particular.find({}, 'billNo');
    let maxNum = 0;
    for (const p of allParticulars) {
      if (p.billNo) {
        const match = p.billNo.match(/\d+/);
        if (match) {
          const num = parseInt(match[0], 10);
          if (num > maxNum) maxNum = num;
        }
      }
    }
    const nextBillNo = (maxNum + 1).toString().padStart(4, '0');
    res.status(200).json({ success: true, data: { nextBillNo } });
  } catch (error) {
    next(error);
  }
};

export const createParticular = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      customerName,
      caseCount,
      companyName,
      discount,
      transport,
      packing,
      billNo,
      tax,
      amount,
      total,
      date,
      products,
    } = req.body;

    let finalBillNo = billNo ? String(billNo).trim() : '';
    if (!finalBillNo) {
      const allParticulars = await Particular.find({}, 'billNo');
      let maxNum = 0;
      for (const p of allParticulars) {
        if (p.billNo) {
          const match = p.billNo.match(/\d+/);
          if (match) {
            const num = parseInt(match[0], 10);
            if (num > maxNum) maxNum = num;
          }
        }
      }
      finalBillNo = (maxNum + 1).toString().padStart(4, '0');
    }

    const particular = await Particular.create({
      customerName: customerName || 'General',
      caseCount: caseCount || '0',
      companyName: companyName || 'General',
      discount: discount || '0',
      transport: transport || '-',
      packing: packing || '0',
      billNo: finalBillNo,
      tax: tax || '0',
      amount: amount || total || '0.00',
      total: total || amount || '0.00',
      date: date || new Date().toISOString().split('T')[0],
      products: products || [],
    });

    // Automatically log to Account Ledger
    const billTotalNum = parseFloat(String(particular.total || particular.amount).replace(/,/g, '')) || 0;
    if (billTotalNum > 0) {
      await AccountLedger.create({
        particularId: String(particular._id),
        billNo: particular.billNo,
        customerName: particular.customerName,
        date: particular.date,
        companyName: particular.companyName,
        debit: billTotalNum.toFixed(2),
        credit: '0.00',
        balance: '0.00',
        type: 'BILL',
      });

      await recalculateCustomerBalance(particular.customerName);
    }

    res.status(201).json({ success: true, data: particular });
  } catch (error) {
    next(error);
  }
};

export const deleteParticular = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const particular = await Particular.findById(req.params.id);
    if (!particular) {
      res.status(404).json({ success: false, error: 'Particular bill not found' });
      return;
    }

    const customerName = particular.customerName;

    // 1. Delete Particular
    await Particular.findByIdAndDelete(req.params.id);

    // 2. Cascade Delete: Delete matching AccountLedger entry comprehensively
    const orConditions: any[] = [
      { particularId: String(req.params.id) },
      { particularId: String(particular._id) },
    ];
    if (particular.billNo && String(particular.billNo).trim() !== '') {
      orConditions.push({ billNo: String(particular.billNo).trim() });
    }
    if (particular.customerName && particular.date) {
      orConditions.push({
        customerName: { $regex: new RegExp(`^${escapeRegex(particular.customerName.trim())}$`, 'i') },
        companyName: { $regex: new RegExp(`^${escapeRegex(particular.companyName.trim())}$`, 'i') },
        date: particular.date,
        type: 'BILL',
      });
    }

    await AccountLedger.deleteMany({ $or: orConditions });

    // 3. Recalculate balance for this customer
    await recalculateCustomerBalance(customerName);

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

