import type { BillPrintData } from '../components/BillPrintTemplate';

export const generateBillHtml = (bill: BillPrintData): string => {
  // Calculate Subtotal from Products or bill.amount
  const prodSubtotal = (bill.products || []).reduce((acc, p) => {
    const amt = parseFloat(String(p.amount).replace(/,/g, '')) || 0;
    return acc + amt;
  }, 0);
  const subtotal = prodSubtotal > 0 ? prodSubtotal : (parseFloat(String(bill.amount || bill.total || '0').replace(/,/g, '')) || 0);

  // Discount calculation
  const rawDiscStr = String(bill.discount ?? '').trim();
  const cleanDisc = rawDiscStr.replace(/[^0-9.]/g, '');
  const discNum = parseFloat(cleanDisc) || 0;
  let discountAmt = 0;
  if (discNum > 0) {
    if (rawDiscStr.includes('%') || discNum <= 100) {
      discountAmt = (subtotal * discNum) / 100;
    } else {
      discountAmt = discNum;
    }
  }

  // Packing calculation
  const rawPackStr = String(bill.packing ?? '').trim();
  const cleanPack = rawPackStr.replace(/[^0-9.]/g, '');
  const packNum = parseFloat(cleanPack) || 0;
  let packingAmt = 0;
  if (packNum > 0) {
    if (rawPackStr.includes('%') || packNum <= 100) {
      packingAmt = (subtotal * packNum) / 100;
    } else {
      packingAmt = packNum;
    }
  }

  // Tax calculation
  const rawTaxStr = String(bill.tax ?? '').trim();
  const cleanTax = rawTaxStr.replace(/[^0-9.]/g, '');
  const taxNum = parseFloat(cleanTax) || 0;
  let taxAmt = 0;
  if (taxNum > 0) {
    const baseForTax = Math.max(0, subtotal - discountAmt + packingAmt);
    if (rawTaxStr.includes('%') || taxNum <= 100) {
      taxAmt = (baseForTax * taxNum) / 100;
    } else {
      taxAmt = taxNum;
    }
  }

  // Grand Total calculation
  const calculatedTotal = Math.max(0, subtotal - discountAmt + packingAmt + taxAmt);
  const rawTotalNum = parseFloat(String(bill.total ?? bill.amount ?? '0').replace(/,/g, '')) || 0;
  const finalTotalNum = rawTotalNum > 0 ? rawTotalNum : calculatedTotal;
  const formattedTotal = finalTotalNum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // If subtotal is different from final total or any adjustments exist, show adjustments
  const hasAdjustments = discountAmt > 0 || packingAmt > 0 || taxAmt > 0 || Math.abs(subtotal - finalTotalNum) > 0.01;

  const computedCases = bill.caseCount
    ? bill.caseCount
    : (bill.products || []).reduce((acc, p) => acc + (parseFloat(String(p.quantity)) || 0), 0);

  const preparedBy = bill.preparedBy || 'S.Nagaraj';
  const phone = bill.phone || '+91 98765 43210';
  const email = bill.email || 'info@dheekshatrade.com';
  const website = bill.website || 'www.dheekshatrade.com';
  const transportName = bill.transport && bill.transport.trim() !== '' && bill.transport !== '-' ? bill.transport.trim() : '-';

  const productRowsHtml = (bill.products || []).map((item, idx) => {
    const numAmt = parseFloat(String(item.amount).replace(/,/g, '')) || 0;
    const formattedAmt = numAmt.toFixed(2);
    return `
      <tr class="item-row">
        <td class="col-sno">${idx + 1}</td>
        <td class="col-part">${item.particular || '-'}</td>
        <td class="col-qty">${item.quantity || '-'}</td>
        <td class="col-rate">${item.rate || '-'}</td>
        <td class="col-pkt">${item.pktUnit && item.pktUnit !== '-' ? item.pktUnit : ''}</td>
        <td class="col-amt">${formattedAmt}</td>
      </tr>
    `;
  }).join('');

  const numItems = bill.products?.length || 0;
  // Calculate spacer height so the invoice fills the entire A4 page vertically
  const dynamicSpacerHeight = Math.max(220, 520 - numItems * 38);

  const adjustmentsHtml = hasAdjustments
    ? `
      <tr class="summary-sub-row" style="border-top: 1.5px solid #000000;">
        <td colspan="2" class="noborder-left"></td>
        <td colspan="3" class="summary-label">Subtotal:</td>
        <td class="summary-val">₹ ${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
      </tr>
      ${
        discountAmt > 0 || discNum > 0
          ? `<tr class="summary-sub-row">
              <td colspan="2" class="noborder-left"></td>
              <td colspan="3" class="summary-label discount-text">Discount (${bill.discount || discNum}${rawDiscStr.includes('%') || discNum <= 100 ? '%' : ''}):</td>
              <td class="summary-val discount-text">- ₹ ${discountAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>`
          : ''
      }
      ${
        packingAmt > 0 || packNum > 0
          ? `<tr class="summary-sub-row">
              <td colspan="2" class="noborder-left"></td>
              <td colspan="3" class="summary-label">Packing Charges (${bill.packing || packNum}${rawPackStr.includes('%') || packNum <= 100 ? '%' : ''}):</td>
              <td class="summary-val">+ ₹ ${packingAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>`
          : ''
      }
      ${
        taxAmt > 0 || taxNum > 0
          ? `<tr class="summary-sub-row">
              <td colspan="2" class="noborder-left"></td>
              <td colspan="3" class="summary-label">Tax (${bill.tax || taxNum}${rawTaxStr.includes('%') || taxNum <= 100 ? '%' : ''}):</td>
              <td class="summary-val">+ ₹ ${taxAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>`
          : ''
      }
    `
    : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Tax Invoice - ${bill.billNo || 'Bill'}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 8mm 10mm;
    }
    *, *:before, *:after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      height: 100%;
      width: 100%;
      background-color: #ffffff;
      color: #000000;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .page-wrapper {
      width: 100%;
      min-height: 98vh;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border: 1.5px solid #000000;
      padding: 22px 26px 16px 26px;
      background: #ffffff;
    }
    .top-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 18px;
    }
    .header-left {
      width: 48%;
    }
    .bill-title {
      font-size: 38px;
      font-weight: 900;
      letter-spacing: -0.02em;
      line-height: 1;
      color: #000000;
    }
    .tax-invoice-sub {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.12em;
      color: #475569;
      margin-top: 4px;
      text-transform: uppercase;
    }
    .billed-to-box {
      border: 1px solid #CBD5E1;
      border-radius: 8px;
      padding: 12px 16px;
      margin-top: 12px;
      background-color: #ffffff;
    }
    .billed-to-title {
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .billed-to-divider {
      height: 1.5px;
      background-color: #1E293B;
      margin: 6px 0 10px 0;
    }
    .info-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12.5px;
    }
    .info-table td {
      padding: 3px 0;
      vertical-align: top;
    }
    .info-table .label {
      color: #0F172A;
      font-weight: 600;
      width: 110px;
    }
    .info-table .colon {
      color: #0F172A;
      font-weight: 600;
      width: 12px;
    }
    .info-table .value {
      color: #000000;
      font-weight: 600;
    }
    .info-table .value-bold {
      color: #000000;
      font-weight: 800;
      text-transform: uppercase;
    }
    .header-right {
      width: 48%;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .company-name {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: 0.02em;
      line-height: 1.15;
      color: #000000;
    }
    .wholesale-sub {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.12em;
      color: #64748B;
      margin-top: 4px;
      text-transform: uppercase;
    }
    .city-name {
      font-size: 14px;
      font-weight: 700;
      color: #000000;
      margin-top: 3px;
      margin-bottom: 18px;
    }
    .contact-box {
      border-left: 1px solid #CBD5E1;
      padding-left: 18px;
      width: 100%;
      max-width: 290px;
      text-align: left;
    }
    .contact-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    .contact-table td {
      padding: 3px 0;
    }
    .contact-table .c-label {
      font-weight: 700;
      color: #0F172A;
      width: 65px;
    }
    .contact-table .c-colon {
      font-weight: 700;
      color: #0F172A;
      width: 10px;
    }
    .contact-table .c-val {
      font-weight: 500;
      color: #000000;
    }
    .table-container {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      margin-bottom: 0;
    }
    .prod-table {
      width: 100%;
      flex: 1 1 auto;
      border-collapse: collapse;
      border: 1.5px solid #000000;
      font-size: 12.5px;
    }
    .prod-table th {
      border-bottom: 1.5px solid #000000;
      border-right: 1.5px solid #000000;
      padding: 8px 6px;
      font-weight: 800;
      color: #000000;
      background-color: #ffffff;
    }
    .prod-table th:last-child {
      border-right: none;
    }
    .item-row td {
      border-right: 1.5px solid #000000;
      border-bottom: 1px solid #E2E8F0;
      padding: 7px 8px;
      color: #000000;
    }
    .item-row td:last-child {
      border-right: none;
    }
    .col-sno {
      width: 45px;
      text-align: center;
      font-weight: 700;
    }
    .col-part {
      text-align: left;
      font-weight: 700;
      padding-left: 14px !important;
      text-transform: uppercase;
    }
    .col-qty {
      width: 75px;
      text-align: center;
      font-weight: 600;
    }
    .col-rate {
      width: 75px;
      text-align: center;
      font-weight: 600;
    }
    .col-pkt {
      width: 85px;
      text-align: center;
      font-weight: 600;
    }
    .col-amt {
      width: 115px;
      text-align: right;
      font-weight: 800;
      padding-right: 14px !important;
    }
    .spacer-row td {
      border-right: 1.5px solid #000000;
      border-bottom: none !important;
    }
    .spacer-row td:last-child {
      border-right: none;
    }
    .summary-sub-row td {
      border-bottom: 1px solid #E2E8F0;
      font-size: 12px;
    }
    .noborder-left {
      border-right: 1.5px solid #000000;
      border-bottom: none !important;
    }
    .summary-label {
      padding: 4px 12px;
      text-align: right;
      font-weight: 600;
      color: #1E293B;
    }
    .summary-val {
      padding: 4px 14px;
      text-align: right;
      font-weight: 700;
      color: #000000;
    }
    .discount-text {
      color: #DC2626 !important;
    }
    .grand-total-row {
      border-top: 1.5px solid #000000 !important;
    }
    .grand-total-row td {
      border-bottom: none !important;
      padding: 10px 14px;
      vertical-align: middle;
    }
    .grand-total-content {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 18px;
      font-size: 15px;
      font-weight: 800;
      letter-spacing: 0.02em;
    }
    .grand-total-amount {
      font-size: 16px;
      font-weight: 900;
    }
    .transport-box {
      border: 1.5px solid #000000;
      border-top: none;
      padding: 12px 16px;
      background-color: #ffffff;
      font-size: 12.5px;
      margin-top: 0;
    }
    .transport-title {
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      margin-bottom: 3px;
    }
    .transport-line {
      font-weight: 600;
      color: #0F172A;
      margin-top: 2px;
    }
  </style>
</head>
<body>
  <div class="page-wrapper">
    <!-- Top Header -->
    <div class="top-header">
      <!-- Left Column: BILL & Billed To -->
      <div class="header-left">
        <h1 class="bill-title">BILL</h1>
        <div class="tax-invoice-sub">TAX INVOICE</div>

        <div class="billed-to-box">
          <div class="billed-to-title">BILLED TO</div>
          <div class="billed-to-divider"></div>
          <table class="info-table">
            <tbody>
              <tr>
                <td class="label">Customer Name</td>
                <td class="colon">:</td>
                <td class="value-bold">${bill.customerName || '-'}</td>
              </tr>
              <tr>
                <td class="label">Company Name</td>
                <td class="colon">:</td>
                <td class="value">${bill.companyName || '-'}</td>
              </tr>
              <tr>
                <td class="label">Bill No.</td>
                <td class="colon">:</td>
                <td class="value">${bill.billNo || '-'}</td>
              </tr>
              <tr>
                <td class="label">Date</td>
                <td class="colon">:</td>
                <td class="value">${bill.date || '-'}</td>
              </tr>
              <tr>
                <td class="label">Prepared By</td>
                <td class="colon">:</td>
                <td class="value">${preparedBy}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Right Column: Dheeksha Trade Link Info -->
      <div class="header-right">
        <h2 class="company-name">DHEEKSHA TRADE<br />LINK</h2>
        <div class="wholesale-sub">WHOLESALE & RETAIL</div>
        <div class="city-name">Sivakasi</div>

        <div class="contact-box">
          <table class="contact-table">
            <tbody>
              <tr>
                <td class="c-label">Phone</td>
                <td class="c-colon">:</td>
                <td class="c-val">${phone}</td>
              </tr>
              <tr>
                <td class="c-label">Email</td>
                <td class="c-colon">:</td>
                <td class="c-val">${email}</td>
              </tr>
              <tr>
                <td class="c-label">Website</td>
                <td class="c-colon">:</td>
                <td class="c-val">${website}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Products Table & Footer Wrapper -->
    <div class="table-container">
      <table class="prod-table">
        <thead>
          <tr>
            <th class="col-sno">Sl.No</th>
            <th class="col-part">Particular</th>
            <th class="col-qty">Quantity</th>
            <th class="col-rate">Rate</th>
            <th class="col-pkt">Pkt / Unit</th>
            <th class="col-amt">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${productRowsHtml || '<tr><td colspan="6" style="text-align:center; padding: 16px; color:#64748B;">No items in bill</td></tr>'}
          <tr class="spacer-row" style="height: ${dynamicSpacerHeight}px;">
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        </tbody>
        <tfoot>
          ${adjustmentsHtml}
          <tr class="grand-total-row">
            <td colspan="2" class="noborder-left"></td>
            <td colspan="4">
              <div class="grand-total-content">
                <span>GRAND TOTAL</span>
                <span>:</span>
                <span class="grand-total-amount">₹ ${formattedTotal}</span>
              </div>
            </td>
          </tr>
        </tfoot>
      </table>

      <!-- Transport Details Box (Stuck to bottom of table) -->
      <div class="transport-box">
        <div class="transport-title">TRANSPORT DETAILS:</div>
        <div class="transport-line">Transport Name: ${transportName}</div>
        <div class="transport-line">Total No. of Cases: ${computedCases}</div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Direct print function that opens an isolated, clean print window
 * Guaranteed to print ONLY the full-page A4 bill document!
 */
export const printBillDirectly = (bill: BillPrintData) => {
  const htmlContent = generateBillHtml(bill);

  // Use a hidden iframe for seamless instant printing
  let iframe = document.getElementById('dheeksha-print-iframe') as HTMLIFrameElement | null;
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.id = 'dheeksha-print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
  }

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (doc) {
    doc.open();
    doc.write(htmlContent);
    doc.close();

    setTimeout(() => {
      iframe?.contentWindow?.focus();
      iframe?.contentWindow?.print();
    }, 250);
  }
};
