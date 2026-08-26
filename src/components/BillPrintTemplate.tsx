import React from 'react';

export interface BillPrintProduct {
  particular: string;
  quantity: string | number;
  rate: string | number;
  pktUnit: string | number;
  amount: string | number;
}

export interface BillPrintData {
  billNo: string;
  date: string;
  customerName: string;
  companyName: string;
  preparedBy?: string;
  phone?: string;
  email?: string;
  website?: string;
  transport?: string;
  caseCount?: string | number;
  products: BillPrintProduct[];
  amount?: string | number;
  discount?: string | number;
  packing?: string | number;
  tax?: string | number;
  total?: string | number;
}

interface BillPrintTemplateProps {
  bill: BillPrintData;
}

export const BillPrintTemplate: React.FC<BillPrintTemplateProps> = ({ bill }) => {
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

  const hasAdjustments = discountAmt > 0 || packingAmt > 0 || taxAmt > 0 || Math.abs(subtotal - finalTotalNum) > 0.01;

  const computedCases = bill.caseCount
    ? bill.caseCount
    : (bill.products || []).reduce((acc, p) => acc + (parseFloat(String(p.quantity)) || 0), 0);

  const preparedBy = bill.preparedBy || 'S.Nagaraj';
  const phone = bill.phone || '+91 98765 43210';
  const email = bill.email || 'info@dheekshatrade.com';
  const website = bill.website || 'www.dheekshatrade.com';
  const transportName = bill.transport && bill.transport !== '-' ? bill.transport : 'VARMA TRANSPORT';

  const numItems = bill.products?.length || 0;
  const dynamicSpacerHeight = Math.max(220, 520 - numItems * 38);

  return (
    <div
      className="dheeksha-bill-container"
      style={{
        width: '100%',
        minHeight: '850px',
        margin: '0 auto',
        backgroundColor: '#FFFFFF',
        color: '#000000',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        border: '1.5px solid #000000',
        padding: '24px 28px 18px 28px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* Top Header Section */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '20px',
          marginBottom: '18px',
        }}
      >
        {/* Left Side: BILL & Billed To Card */}
        <div style={{ flex: '1 1 50%', maxWidth: '380px' }}>
          <h1
            style={{
              fontSize: '38px',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              margin: '0',
              lineHeight: 1,
              color: '#000000',
            }}
          >
            BILL
          </h1>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.12em',
              color: '#475569',
              marginTop: '4px',
              textTransform: 'uppercase',
            }}
          >
            TAX INVOICE
          </div>

          {/* BILLED TO Box */}
          <div
            style={{
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              padding: '12px 16px',
              marginTop: '12px',
              backgroundColor: '#FFFFFF',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                fontWeight: 800,
                color: '#000000',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              BILLED TO
            </div>
            <div
              style={{
                height: '1.5px',
                backgroundColor: '#1E293B',
                margin: '6px 0 10px 0',
              }}
            />

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '3px 0', color: '#0F172A', fontWeight: 600, width: '110px', verticalAlign: 'top' }}>
                    Customer Name
                  </td>
                  <td style={{ padding: '3px 8px', color: '#0F172A', fontWeight: 600, width: '10px', verticalAlign: 'top' }}>
                    :
                  </td>
                  <td style={{ padding: '3px 0', color: '#000000', fontWeight: 800, textTransform: 'uppercase', verticalAlign: 'top' }}>
                    {bill.customerName || '-'}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '3px 0', color: '#0F172A', fontWeight: 600, verticalAlign: 'top' }}>
                    Company Name
                  </td>
                  <td style={{ padding: '3px 8px', color: '#0F172A', fontWeight: 600, verticalAlign: 'top' }}>
                    :
                  </td>
                  <td style={{ padding: '3px 0', color: '#000000', fontWeight: 600, textTransform: 'uppercase', verticalAlign: 'top' }}>
                    {bill.companyName || '-'}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '3px 0', color: '#0F172A', fontWeight: 600, verticalAlign: 'top' }}>
                    Bill No.
                  </td>
                  <td style={{ padding: '3px 8px', color: '#0F172A', fontWeight: 600, verticalAlign: 'top' }}>
                    :
                  </td>
                  <td style={{ padding: '3px 0', color: '#000000', fontWeight: 600, verticalAlign: 'top' }}>
                    {bill.billNo || '-'}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '3px 0', color: '#0F172A', fontWeight: 600, verticalAlign: 'top' }}>
                    Date
                  </td>
                  <td style={{ padding: '3px 8px', color: '#0F172A', fontWeight: 600, verticalAlign: 'top' }}>
                    :
                  </td>
                  <td style={{ padding: '3px 0', color: '#000000', fontWeight: 600, verticalAlign: 'top' }}>
                    {bill.date || '-'}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '3px 0', color: '#0F172A', fontWeight: 600, verticalAlign: 'top' }}>
                    Prepared By
                  </td>
                  <td style={{ padding: '3px 8px', color: '#0F172A', fontWeight: 600, verticalAlign: 'top' }}>
                    :
                  </td>
                  <td style={{ padding: '3px 0', color: '#000000', fontWeight: 600, verticalAlign: 'top' }}>
                    {preparedBy}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Company Header & Contact Details */}
        <div style={{ flex: '1 1 50%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2
            style={{
              fontSize: '24px',
              fontWeight: 800,
              textAlign: 'center',
              letterSpacing: '0.02em',
              margin: '0',
              color: '#000000',
              lineHeight: 1.15,
            }}
          >
            DHEEKSHA TRADE
            <br />
            LINK
          </h2>
          <div
            style={{
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: '#64748B',
              marginTop: '4px',
              textTransform: 'uppercase',
            }}
          >
            WHOLESALE & RETAIL
          </div>
          <div
            style={{
              fontSize: '14px',
              fontWeight: 700,
              color: '#000000',
              marginTop: '3px',
              marginBottom: '18px',
            }}
          >
            Sivakasi
          </div>

          {/* Contact Details Block */}
          <div
            style={{
              borderLeft: '1px solid #CBD5E1',
              paddingLeft: '18px',
              width: '100%',
              maxWidth: '300px',
              boxSizing: 'border-box',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '3px 0', fontWeight: 700, color: '#0F172A', width: '65px' }}>
                    Phone
                  </td>
                  <td style={{ padding: '3px 6px', fontWeight: 700, color: '#0F172A', width: '8px' }}>
                    :
                  </td>
                  <td style={{ padding: '3px 0', fontWeight: 500, color: '#000000' }}>
                    {phone}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '3px 0', fontWeight: 700, color: '#0F172A' }}>
                    Email
                  </td>
                  <td style={{ padding: '3px 6px', fontWeight: 700, color: '#0F172A', width: '8px' }}>
                    :
                  </td>
                  <td style={{ padding: '3px 0', fontWeight: 500, color: '#000000' }}>
                    {email}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '3px 0', fontWeight: 700, color: '#0F172A' }}>
                    Website
                  </td>
                  <td style={{ padding: '3px 6px', fontWeight: 700, color: '#0F172A', width: '8px' }}>
                    :
                  </td>
                  <td style={{ padding: '3px 0', fontWeight: 500, color: '#000000' }}>
                    {website}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Main Products Table & Footer Wrapper */}
      <div style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
        <table
          style={{
            width: '100%',
            flex: '1 1 auto',
            borderCollapse: 'collapse',
            border: '1.5px solid #000000',
            fontSize: '12.5px',
          }}
        >
          <thead>
            <tr style={{ borderBottom: '1.5px solid #000000', backgroundColor: '#FFFFFF' }}>
              <th
                style={{
                  width: '45px',
                  padding: '8px 4px',
                  textAlign: 'center',
                  fontWeight: 800,
                  color: '#000000',
                  borderRight: '1.5px solid #000000',
                }}
              >
                Sl.No
              </th>
              <th
                style={{
                  padding: '8px 14px',
                  textAlign: 'left',
                  fontWeight: 800,
                  color: '#000000',
                  borderRight: '1.5px solid #000000',
                }}
              >
                Particular
              </th>
              <th
                style={{
                  width: '75px',
                  padding: '8px 6px',
                  textAlign: 'center',
                  fontWeight: 600,
                  color: '#000000',
                  borderRight: '1.5px solid #000000',
                }}
              >
                Quantity
              </th>
              <th
                style={{
                  width: '75px',
                  padding: '8px 6px',
                  textAlign: 'center',
                  fontWeight: 600,
                  color: '#000000',
                  borderRight: '1.5px solid #000000',
                }}
              >
                Rate
              </th>
              <th
                style={{
                  width: '85px',
                  padding: '8px 6px',
                  textAlign: 'center',
                  fontWeight: 600,
                  color: '#000000',
                  borderRight: '1.5px solid #000000',
                }}
              >
                Pkt / Unit
              </th>
              <th
                style={{
                  width: '115px',
                  padding: '8px 14px',
                  textAlign: 'right',
                  fontWeight: 800,
                  color: '#000000',
                }}
              >
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {bill.products && bill.products.length > 0 ? (
              bill.products.map((item, idx) => {
                const numAmt = parseFloat(String(item.amount).replace(/,/g, '')) || 0;
                const formattedAmt = numAmt.toFixed(2);
                return (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: '1px solid #E2E8F0',
                      height: '34px',
                    }}
                  >
                    <td
                      style={{
                        textAlign: 'center',
                        fontWeight: 700,
                        color: '#000000',
                        borderRight: '1.5px solid #000000',
                        padding: '6px 4px',
                      }}
                    >
                      {idx + 1}
                    </td>
                    <td
                      style={{
                        textAlign: 'left',
                        fontWeight: 700,
                        color: '#000000',
                        textTransform: 'uppercase',
                        borderRight: '1.5px solid #000000',
                        padding: '6px 14px',
                      }}
                    >
                      {item.particular}
                    </td>
                    <td
                      style={{
                        textAlign: 'center',
                        fontWeight: 600,
                        color: '#000000',
                        borderRight: '1.5px solid #000000',
                        padding: '6px',
                      }}
                    >
                      {item.quantity}
                    </td>
                    <td
                      style={{
                        textAlign: 'center',
                        fontWeight: 600,
                        color: '#000000',
                        borderRight: '1.5px solid #000000',
                        padding: '6px',
                      }}
                    >
                      {item.rate}
                    </td>
                    <td
                      style={{
                        textAlign: 'center',
                        fontWeight: 600,
                        color: '#000000',
                        borderRight: '1.5px solid #000000',
                        padding: '6px',
                      }}
                    >
                      {item.pktUnit && item.pktUnit !== '-' ? item.pktUnit : ''}
                    </td>
                    <td
                      style={{
                        textAlign: 'right',
                        fontWeight: 800,
                        color: '#000000',
                        padding: '6px 14px',
                      }}
                    >
                      {formattedAmt}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr style={{ height: '50px' }}>
                <td style={{ borderRight: '1.5px solid #000000' }} />
                <td style={{ borderRight: '1.5px solid #000000', padding: '12px', color: '#64748B', textAlign: 'center' }}>
                  No items in bill
                </td>
                <td style={{ borderRight: '1.5px solid #000000' }} />
                <td style={{ borderRight: '1.5px solid #000000' }} />
                <td style={{ borderRight: '1.5px solid #000000' }} />
                <td />
              </tr>
            )}

            {/* Spacer row ensuring vertical borders stretch to fill the full A4 page */}
            <tr style={{ height: `${dynamicSpacerHeight}px` }}>
              <td style={{ borderRight: '1.5px solid #000000', borderBottom: 'none' }} />
              <td style={{ borderRight: '1.5px solid #000000', borderBottom: 'none' }} />
              <td style={{ borderRight: '1.5px solid #000000', borderBottom: 'none' }} />
              <td style={{ borderRight: '1.5px solid #000000', borderBottom: 'none' }} />
              <td style={{ borderRight: '1.5px solid #000000', borderBottom: 'none' }} />
              <td style={{ borderBottom: 'none' }} />
            </tr>
          </tbody>

          {/* Footer Rows: Breakdown (Subtotal, Discount, Packing, Tax) & Grand Total */}
          <tfoot>
            {hasAdjustments && (
              <>
                <tr style={{ borderTop: '1.5px solid #000000', fontSize: '12px' }}>
                  <td colSpan={2} style={{ borderRight: '1.5px solid #000000', borderBottom: 'none' }} />
                  <td colSpan={3} style={{ padding: '4px 12px', textAlign: 'right', fontWeight: 600, color: '#1E293B', borderBottom: '1px solid #E2E8F0' }}>
                    Subtotal:
                  </td>
                  <td style={{ padding: '4px 14px', textAlign: 'right', fontWeight: 700, color: '#000000', borderBottom: '1px solid #E2E8F0' }}>
                    ₹ {subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
                {(discountAmt > 0 || discNum > 0) && (
                  <tr style={{ fontSize: '12px' }}>
                    <td colSpan={2} style={{ borderRight: '1.5px solid #000000', borderBottom: 'none' }} />
                    <td colSpan={3} style={{ padding: '3px 12px', textAlign: 'right', fontWeight: 600, color: '#DC2626', borderBottom: '1px solid #E2E8F0' }}>
                      Discount ({bill.discount || discNum}{rawDiscStr.includes('%') || discNum <= 100 ? '%' : ''}):
                    </td>
                    <td style={{ padding: '3px 14px', textAlign: 'right', fontWeight: 700, color: '#DC2626', borderBottom: '1px solid #E2E8F0' }}>
                      - ₹ {discountAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                )}
                {(packingAmt > 0 || packNum > 0) && (
                  <tr style={{ fontSize: '12px' }}>
                    <td colSpan={2} style={{ borderRight: '1.5px solid #000000', borderBottom: 'none' }} />
                    <td colSpan={3} style={{ padding: '3px 12px', textAlign: 'right', fontWeight: 600, color: '#0F172A', borderBottom: '1px solid #E2E8F0' }}>
                      Packing Charges ({bill.packing || packNum}{rawPackStr.includes('%') || packNum <= 100 ? '%' : ''}):
                    </td>
                    <td style={{ padding: '3px 14px', textAlign: 'right', fontWeight: 700, color: '#0F172A', borderBottom: '1px solid #E2E8F0' }}>
                      + ₹ {packingAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                )}
                {(taxAmt > 0 || taxNum > 0) && (
                  <tr style={{ fontSize: '12px' }}>
                    <td colSpan={2} style={{ borderRight: '1.5px solid #000000', borderBottom: 'none' }} />
                    <td colSpan={3} style={{ padding: '3px 12px', textAlign: 'right', fontWeight: 600, color: '#0F172A', borderBottom: '1px solid #E2E8F0' }}>
                      Tax ({bill.tax || taxNum}{rawTaxStr.includes('%') || taxNum <= 100 ? '%' : ''}):
                    </td>
                    <td style={{ padding: '3px 14px', textAlign: 'right', fontWeight: 700, color: '#0F172A', borderBottom: '1px solid #E2E8F0' }}>
                      + ₹ {taxAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                )}
              </>
            )}

            <tr style={{ borderTop: '1.5px solid #000000', height: '42px' }}>
              <td
                colSpan={2}
                style={{
                  borderRight: '1.5px solid #000000',
                  padding: '8px 12px',
                  borderBottom: 'none',
                }}
              />
              <td
                colSpan={4}
                style={{
                  padding: '10px 14px',
                  textAlign: 'right',
                  verticalAlign: 'middle',
                  borderBottom: 'none',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    gap: '18px',
                    fontSize: '15px',
                    fontWeight: 800,
                    color: '#000000',
                    letterSpacing: '0.02em',
                  }}
                >
                  <span>GRAND TOTAL</span>
                  <span>:</span>
                  <span style={{ fontSize: '16px', fontWeight: 900 }}>₹ {formattedTotal}</span>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>

        {/* Transport Details Footer Section */}
        <div
          style={{
            border: '1.5px solid #000000',
            borderTop: 'none',
            padding: '12px 16px',
            backgroundColor: '#FFFFFF',
            fontSize: '12.5px',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: 800,
              color: '#000000',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '3px',
            }}
          >
            TRANSPORT DETAILS:
          </div>
          <div style={{ fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>
            Transport Name: {transportName}
          </div>
          <div style={{ fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>
            Total No. of Cases: {computedCases}
          </div>
        </div>
      </div>
    </div>
  );
};
