import { useState, useEffect, useMemo, useRef, type FC } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import {
  CustomersApi,
  CompaniesApi,
  ProductsApi,
  ParticularsApi,
  AccountsApi,
} from '../services/api';
import { BillPrintModal } from './BillPrintModal';
import type { BillPrintData } from './BillPrintTemplate';
import { printBillDirectly } from '../utils/printUtils';

export type ParticularSubTab =
  | 'Select Customer'
  | 'Create Particular'
  | 'Account Details'
  | 'Particular Details'
  | 'Add Credit';

const SUB_TABS: ParticularSubTab[] = [
  'Select Customer',
  'Create Particular',
  'Account Details',
  'Particular Details',
  'Add Credit',
];

interface ProductRowItem {
  id: string;
  particular: string;
  quantity: string;
  rate: string;
  pktUnit: string;
  amount: string;
}

interface ParticularsPageProps {
  initialCustomerName?: string;
  initialSubTab?: ParticularSubTab;
}

export const ParticularsPage: FC<ParticularsPageProps> = ({ initialCustomerName, initialSubTab }) => {
  const [activeSubTab, setActiveSubTab] = useState<ParticularSubTab>(initialSubTab || 'Select Customer');

  // Live Dropdown options
  const [customerOptions, setCustomerOptions] = useState<{ id: string; name: string }[]>([]);
  const [companyOptions, setCompanyOptions] = useState<{ id: string; name: string }[]>([]);
  const [productOptions, setProductOptions] = useState<{ id: string; name: string }[]>([]);

  // Persistent Selected Customer for Creation & Filter
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [currentCustomerName, setCurrentCustomerName] = useState<string>(() => {
    return (
      localStorage.getItem('dheeksha_active_customer') ||
      initialCustomerName ||
      ''
    );
  });
  const [filterCustomer, setFilterCustomer] = useState<string>(() => {
    return (
      localStorage.getItem('dheeksha_active_customer') ||
      initialCustomerName ||
      ''
    );
  });

  // Subtab 2: Create Particular Form State
  const [caseCount, setCaseCount] = useState<string>('0');
  const [company, setCompany] = useState<string>('');
  const [discount, setDiscount] = useState<string>('');
  const [transport, setTransport] = useState<string>('');
  const [packing, setPacking] = useState<string>('');
  const [billNo, setBillNo] = useState<string>('');
  const [tax, setTax] = useState<string>('');
  const [date, setDate] = useState<string>(() => {
    const today = new Date();
    return today.toLocaleDateString('en-GB').replace(/\//g, '-');
  });

  // Product Entry Form State
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [rate, setRate] = useState<string>('');
  const [pkt, setPkt] = useState<string>('');
  const [productRows, setProductRows] = useState<ProductRowItem[]>([]);
  const [createLoading, setCreateLoading] = useState(false);

  // Subtab 3: Account Details State
  const [accountDetails, setAccountDetails] = useState<any[]>([]);
  const [accountLoading, setAccountLoading] = useState(false);

  // Subtab 4: Particular Details State
  const [particularDetails, setParticularDetails] = useState<any[]>([]);
  const [particularLoading, setParticularLoading] = useState(false);

  // Subtab 5: Add Credit Form State
  const [addCreditCustomerName, setAddCreditCustomerName] = useState<string>('');
  const [addCreditCompanyName, setAddCreditCompanyName] = useState<string>('');
  const [creditAmount, setCreditAmount] = useState<string>('');
  const [creditDate, setCreditDate] = useState<string>(() => {
    const today = new Date();
    return today.toLocaleDateString('en-GB').replace(/\//g, '-');
  });
  const [creditLoading, setCreditLoading] = useState(false);

  // Bill Print Modal State
  const [selectedBillForPrint, setSelectedBillForPrint] = useState<BillPrintData | null>(null);
  const [printModalOpen, setPrintModalOpen] = useState(false);

  // PDF Upload & Preview State (under 1 MB)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTargetBillId, setUploadTargetBillId] = useState<string | null>(null);
  const [uploadingBillId, setUploadingBillId] = useState<string | null>(null);
  const [pdfPreviewModal, setPdfPreviewModal] = useState<{
    open: boolean;
    url: string;
    name: string;
    id: string;
    billNo?: string;
  } | null>(null);
  const [pdfToast, setPdfToast] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Automatically calculate total case count from added product rows
  useEffect(() => {
    if (productRows.length > 0) {
      const totalCases = productRows.reduce((acc, row) => acc + (parseFloat(row.quantity) || 0), 0);
      setCaseCount(String(totalCases));
    } else {
      setCaseCount('0');
    }
  }, [productRows]);

  // Update customer when prop changes
  useEffect(() => {
    if (initialCustomerName) {
      setCurrentCustomerName(initialCustomerName);
      setFilterCustomer(initialCustomerName);
      setAddCreditCustomerName(initialCustomerName);
      localStorage.setItem('dheeksha_active_customer', initialCustomerName);
    }
  }, [initialCustomerName]);

  // Update subtab when prop changes
  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Load Dropdown Options
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [custRes, compRes, prodRes] = await Promise.all([
          CustomersApi.getAll(),
          CompaniesApi.getAll(),
          ProductsApi.getAll(),
        ]);

        if (custRes && custRes.length > 0) {
          const mapped = custRes.map((c: any) => ({ id: c._id || c.id, name: c.name }));
          setCustomerOptions(mapped);

          const existing = mapped.find((c: any) => c.name === currentCustomerName);
          if (existing) {
            setSelectedCustomerId(existing.id);
            setAddCreditCustomerName(existing.name);
            setFilterCustomer(existing.name);
          } else {
            setSelectedCustomerId(mapped[0].id);
            setCurrentCustomerName(mapped[0].name);
            setAddCreditCustomerName(mapped[0].name);
            setFilterCustomer(mapped[0].name);
            localStorage.setItem('dheeksha_active_customer', mapped[0].name);
          }
        }

        if (compRes && compRes.length > 0) {
          const mapped = compRes.map((c: any) => ({ id: c._id || c.id, name: c.name }));
          setCompanyOptions(mapped);
          if (!company) setCompany(mapped[0].name);
          if (!addCreditCompanyName) setAddCreditCompanyName(mapped[0].name);
        }

        if (prodRes && prodRes.length > 0) {
          const mapped = prodRes.map((p: any) => ({ id: p._id || p.id, name: p.name }));
          setProductOptions(mapped);
          if (!selectedProduct) setSelectedProduct(mapped[0].name);
        }

        // Fetch Next Bill Number Automatically
        fetchNextBillNo();
      } catch (err) {
        console.error('Error loading dropdown options:', err);
      }
    };
    loadOptions();
  }, []);

  const fetchNextBillNo = async () => {
    try {
      const res: any = await ParticularsApi.getNextBillNo();
      if (res && res.nextBillNo) {
        setBillNo(res.nextBillNo);
      }
    } catch (err) {
      console.error('Failed to load next bill no:', err);
    }
  };

  // Fetch Accounts
  const fetchAccounts = async (targetCustomer?: string) => {
    try {
      setAccountLoading(true);
      const cust = targetCustomer !== undefined ? targetCustomer : (filterCustomer || currentCustomerName);
      const data = await AccountsApi.getAll(cust && cust !== 'ALL' ? cust : undefined);
      setAccountDetails(data || []);
    } catch (err) {
      console.error('Failed to load accounts:', err);
    } finally {
      setAccountLoading(false);
    }
  };

  // Fetch Particulars (Loads all bills across all customers, sorted with latest first)
  const fetchParticulars = async () => {
    try {
      setParticularLoading(true);
      const data = await ParticularsApi.getAll();
      setParticularDetails(data || []);
    } catch (err) {
      console.error('Failed to load particulars:', err);
    } finally {
      setParticularLoading(false);
    }
  };

  useEffect(() => {
    const custToFetch = filterCustomer || currentCustomerName;
    if (activeSubTab === 'Account Details') {
      fetchAccounts(custToFetch);
    } else if (activeSubTab === 'Particular Details') {
      fetchParticulars();
    }
  }, [activeSubTab, filterCustomer, currentCustomerName]);

  // Overall totals
  const overallTotals = useMemo(() => {
    let totalDebit = 0;
    let totalCredit = 0;
    accountDetails.forEach((row) => {
      totalDebit += parseFloat(String(row.debit || '0').replace(/,/g, '')) || 0;
      totalCredit += parseFloat(String(row.credit || '0').replace(/,/g, '')) || 0;
    });
    return {
      totalDebit,
      totalCredit,
      netBalance: totalCredit - totalDebit,
    };
  }, [accountDetails]);

  const handleSelectCustomerClick = () => {
    setActiveSubTab('Create Particular');
  };

  // Subtab 2: Product Line Addition
  const handleAddProductRow = () => {
    if (!selectedProduct || !quantity || !rate) {
      alert('Please select Product, enter Case and Rate');
      return;
    }
    const caseVal = parseFloat(quantity) || 0;
    const piecesPerCase = parseFloat(pkt) || 1;
    const totalPieces = caseVal * piecesPerCase;
    const lineAmt = (totalPieces * (parseFloat(rate) || 0)).toFixed(2);

    const newRow: ProductRowItem = {
      id: Date.now().toString(),
      particular: selectedProduct,
      quantity,
      rate,
      pktUnit: pkt ? pkt : '-',
      amount: lineAmt,
    };
    setProductRows((prev) => [...prev, newRow]);
    setQuantity('');
    setRate('');
    setPkt('');
  };

  // Subtotal (Sum of all products)
  const subtotalAmount = useMemo(() => {
    return productRows.reduce((acc, row) => acc + (parseFloat(row.amount) || 0), 0);
  }, [productRows]);

  // Discount Calculation (Supports % like 5% or flat rupees like 500)
  const discountVal = useMemo(() => {
    if (!discount) return 0;
    const cleanDisc = String(discount).trim();
    const num = parseFloat(cleanDisc) || 0;
    if (num <= 0) return 0;
    if (cleanDisc.endsWith('%') || num <= 100) {
      return (subtotalAmount * num) / 100;
    }
    return num;
  }, [discount, subtotalAmount]);

  // Packing Calculation (Supports % like 2% or flat rupees)
  const packingVal = useMemo(() => {
    if (!packing) return 0;
    const cleanPack = String(packing).trim();
    const num = parseFloat(cleanPack) || 0;
    if (num <= 0) return 0;
    if (cleanPack.endsWith('%') || (num <= 100 && !cleanPack.includes('.'))) {
      return (subtotalAmount * num) / 100;
    }
    return num;
  }, [packing, subtotalAmount]);

  // Tax Calculation (Supports % like 5%, 18% or flat rupees)
  const taxVal = useMemo(() => {
    if (!tax) return 0;
    const cleanTax = String(tax).trim();
    const num = parseFloat(cleanTax) || 0;
    if (num <= 0) return 0;
    const baseForTax = Math.max(0, subtotalAmount - discountVal + packingVal);
    if (cleanTax.endsWith('%') || num <= 100) {
      return (baseForTax * num) / 100;
    }
    return num;
  }, [tax, subtotalAmount, discountVal, packingVal]);

  // Final Net Total Amount
  const finalTotalAmount = useMemo(() => {
    const net = Math.max(0, subtotalAmount - discountVal + packingVal + taxVal);
    return net.toFixed(2);
  }, [subtotalAmount, discountVal, packingVal, taxVal]);

  // Subtab 2: Submit Particular Bill
  const handleCreateParticular = async () => {
    try {
      setCreateLoading(true);
      const created = await ParticularsApi.create({
        customerName: currentCustomerName || 'General',
        caseCount: caseCount || '0',
        companyName: company || (companyOptions[0]?.name ?? 'General'),
        discount: discount || '0',
        transport: transport || '-',
        packing: packing || '0',
        billNo: billNo.trim(),
        tax: tax || '0',
        amount: subtotalAmount.toFixed(2),
        total: finalTotalAmount,
        date: date,
        products: productRows,
      });

      const assignedBillNo = created?.billNo || billNo || '';
      const createdBillData: BillPrintData = {
        billNo: assignedBillNo,
        customerName: currentCustomerName || 'General',
        companyName: company || (companyOptions[0]?.name ?? 'General'),
        preparedBy: 'S.Nagaraj',
        phone: '+91 98765 43210',
        email: 'info@dheekshatrade.com',
        website: 'www.dheekshatrade.com',
        transport: transport && transport.trim() !== '' && transport !== '-' ? transport.trim() : '-',
        caseCount: caseCount || '0',
        date: date,
        products: productRows.map((p) => ({
          particular: p.particular,
          quantity: p.quantity,
          rate: p.rate,
          pktUnit: p.pktUnit,
          amount: p.amount,
        })),
        amount: subtotalAmount.toFixed(2),
        discount: discount || '0',
        packing: packing || '0',
        tax: tax || '0',
        total: finalTotalAmount,
      };

      alert(`Particular bill #${assignedBillNo} for ${company || 'General'} created successfully!`);
      setProductRows([]);
      setCaseCount('0');
      setDiscount('');
      setTransport('');
      setPacking('');
      setTax('');
      fetchNextBillNo();
      fetchAccounts(filterCustomer);
      fetchParticulars();
      setActiveSubTab('Particular Details');

      // Open the print invoice modal automatically
      setSelectedBillForPrint(createdBillData);
      setPrintModalOpen(true);
    } catch (err) {
      console.error('Failed to create particular:', err);
      alert('Error creating particular bill');
    } finally {
      setCreateLoading(false);
    }
  };

  // Subtab 5: Submit Credit
  const handleAddCreditSubmit = async () => {
    if (!creditAmount || parseFloat(creditAmount) <= 0) {
      alert('Please enter a valid credit amount');
      return;
    }

    try {
      setCreditLoading(true);
      await AccountsApi.addCredit({
        customerName: addCreditCustomerName || currentCustomerName || (customerOptions[0]?.name ?? 'General'),
        companyName: addCreditCompanyName || (companyOptions[0]?.name ?? 'General'),
        creditAmount: creditAmount.trim(),
        date: creditDate,
      });

      alert('Credit added successfully!');
      setCreditAmount('');
      fetchAccounts(filterCustomer);
      fetchParticulars();
      setActiveSubTab('Account Details');
    } catch (err) {
      console.error('Failed to add credit:', err);
      alert('Error adding credit');
    } finally {
      setCreditLoading(false);
    }
  };

  // Delete handlers
  const handleDeleteAccountEntry = async (id: string) => {
    if (!window.confirm('Delete this account ledger transaction?')) return;
    try {
      const entryToDelete = accountDetails.find((a) => (a._id || a.id) === id);
      await AccountsApi.delete(id);
      setAccountDetails((prev) => prev.filter((a) => (a._id || a.id) !== id));
      if (entryToDelete) {
        setParticularDetails((prev) =>
          prev.filter((p) => {
            const pId = p._id || p.id;
            if (entryToDelete.particularId && (pId === entryToDelete.particularId || p._id === entryToDelete.particularId)) return false;
            if (entryToDelete.billNo && p.billNo === entryToDelete.billNo) return false;
            return true;
          })
        );
      }
      fetchAccounts(filterCustomer);
      fetchParticulars();
    } catch (err) {
      console.error('Failed to delete account entry:', err);
    }
  };

  const handleDeleteParticular = async (id: string) => {
    if (!window.confirm('Delete this particular bill?')) return;
    try {
      const billToDelete = particularDetails.find((p) => (p._id || p.id) === id);
      await ParticularsApi.delete(id);
      setParticularDetails((prev) => prev.filter((p) => (p._id || p.id) !== id));
      setAccountDetails((prev) =>
        prev.filter((a) => {
          if (a.particularId && (a.particularId === id || (billToDelete && a.particularId === (billToDelete._id || billToDelete.id)))) {
            return false;
          }
          if (billToDelete?.billNo && a.billNo && a.billNo === billToDelete.billNo) {
            return false;
          }
          return true;
        })
      );
      fetchAccounts(filterCustomer);
      fetchParticulars();
    } catch (err) {
      console.error('Failed to delete particular bill:', err);
    }
  };

  const handleOpenBillPrint = (billData: any, autoTrigger = false) => {
    const formattedBill: BillPrintData = {
      billNo: billData.billNo || '',
      date: billData.date || '',
      customerName: billData.customerName || currentCustomerName || '',
      companyName: billData.companyName || company || '',
      preparedBy: billData.preparedBy || 'S.Nagaraj',
      phone: '+91 98765 43210',
      email: 'info@dheekshatrade.com',
      website: 'www.dheekshatrade.com',
      transport: billData.transport && billData.transport.trim() !== '' && billData.transport !== '-' ? billData.transport.trim() : '-',
      caseCount: billData.caseCount || billData.cases || (billData.products ? billData.products.reduce((acc: number, p: any) => acc + (parseFloat(p.quantity) || 0), 0) : 0),
      products: (billData.products || []).map((p: any) => ({
        particular: p.particular || p.particularName || p.name || '',
        quantity: p.quantity || '',
        rate: p.rate || '',
        pktUnit: p.pktUnit || p.pkt || '',
        amount: p.amount || '',
      })),
      amount: billData.amount || billData.total || '0.00',
      discount: billData.discount !== undefined && billData.discount !== null ? String(billData.discount) : '0',
      packing: billData.packing !== undefined && billData.packing !== null ? String(billData.packing) : '0',
      tax: billData.tax !== undefined && billData.tax !== null ? String(billData.tax) : '0',
      total: billData.total || billData.amount || '0.00',
    };

    setSelectedBillForPrint(formattedBill);

    if (autoTrigger) {
      printBillDirectly(formattedBill);
    } else {
      setPrintModalOpen(true);
    }
  };

  const handlePrint = async () => {
    try {
      const cust = filterCustomer || currentCustomerName;
      // Fetch latest particular bills for the customer
      const parts = await ParticularsApi.getAll(cust && cust !== 'ALL' ? cust : undefined);
      if (parts && parts.length > 0) {
        handleOpenBillPrint(parts[0], true);
      } else if (accountDetails.length > 0) {
        handleOpenBillPrint({
          billNo: 'STATEMENT',
          date: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
          customerName: cust || 'Customer',
          companyName: accountDetails[0]?.companyName || 'General',
          transport: '-',
          caseCount: '0',
          products: accountDetails.map((acc) => ({
            particular: `${acc.companyName} (${acc.date})`,
            quantity: '1',
            rate: acc.debit || acc.credit || '0',
            pktUnit: acc.credit > 0 ? 'CR' : 'DR',
            amount: acc.debit || acc.credit || '0',
          })),
          amount: overallTotals.totalDebit.toFixed(2),
          total: overallTotals.totalDebit.toFixed(2),
        }, true);
      } else {
        alert('No bill records found to print.');
      }
    } catch (err) {
      console.error('Failed to print:', err);
    }
  };

  // PDF Upload Handlers (Under 1 MB Limit)
  const MAX_PDF_SIZE_BYTES = 1 * 1024 * 1024; // 1 MB (1,048,576 bytes)

  const handleTriggerPdfUpload = (id: string) => {
    setUploadTargetBillId(id);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handlePdfFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const targetId = uploadTargetBillId;
    if (!file || !targetId) return;

    // Reset input so same file can be selected again if needed
    e.target.value = '';

    // 1. Verify file type is PDF
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setPdfToast({
        open: true,
        message: 'Invalid file format. Please upload a valid PDF (.pdf) file only.',
        severity: 'error',
      });
      return;
    }

    // 2. Verify file size is under 1 MB
    if (file.size > MAX_PDF_SIZE_BYTES) {
      const sizeInMb = (file.size / (1024 * 1024)).toFixed(2);
      setPdfToast({
        open: true,
        message: `File size (${sizeInMb} MB) exceeds 1 MB limit. Please select a PDF under 1 MB.`,
        severity: 'error',
      });
      return;
    }

    try {
      setUploadingBillId(targetId);
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          await ParticularsApi.uploadPdf(targetId, base64Data, file.name);

          // Update local state in particularDetails
          setParticularDetails((prev) =>
            prev.map((p) => {
              const pId = p._id || p.id;
              if (pId === targetId) {
                return { ...p, pdfData: base64Data, pdfName: file.name };
              }
              return p;
            })
          );

          setPdfToast({
            open: true,
            message: `PDF "${file.name}" uploaded successfully!`,
            severity: 'success',
          });
        } catch (uploadErr) {
          console.error('Failed to save PDF to server:', uploadErr);
          setPdfToast({
            open: true,
            message: 'Failed to upload PDF. Please try again.',
            severity: 'error',
          });
        } finally {
          setUploadingBillId(null);
        }
      };

      reader.onerror = () => {
        setUploadingBillId(null);
        setPdfToast({
          open: true,
          message: 'Error reading PDF file.',
          severity: 'error',
        });
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Failed to initiate upload:', err);
      setUploadingBillId(null);
    }
  };

  const handleOpenPdfPreview = (row: any) => {
    const rowId = row._id || row.id || '';
    if (!row.pdfData) {
      handleTriggerPdfUpload(rowId);
      return;
    }

    setPdfPreviewModal({
      open: true,
      url: row.pdfData,
      name: row.pdfName || `Bill-${row.billNo || 'document'}.pdf`,
      id: rowId,
      billNo: row.billNo,
    });
  };

  const handleDeleteAttachedPdf = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove the attached PDF from this bill?')) return;
    try {
      await ParticularsApi.deletePdf(id);
      setParticularDetails((prev) =>
        prev.map((p) => {
          const pId = p._id || p.id;
          if (pId === id) {
            return { ...p, pdfData: '', pdfName: '' };
          }
          return p;
        })
      );
      if (pdfPreviewModal?.id === id) {
        setPdfPreviewModal(null);
      }
      setPdfToast({
        open: true,
        message: 'Attached PDF deleted successfully.',
        severity: 'success',
      });
    } catch (err) {
      console.error('Failed to delete attached PDF:', err);
      setPdfToast({
        open: true,
        message: 'Failed to delete attached PDF.',
        severity: 'error',
      });
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        p: { xs: 2, sm: 2.5, md: 3 },
        boxSizing: 'border-box',
      }}
    >
      {/* Subtabs Bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 2, sm: 3, md: 4 },
          mb: 2.5,
          flexWrap: 'wrap',
          borderBottom: '1px solid #EEF2F6',
          pb: 0.5,
        }}
      >
        {SUB_TABS.map((tab) => {
          const isActive = activeSubTab === tab;
          return (
            <Box
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              sx={{
                position: 'relative',
                pb: 1.2,
                cursor: 'pointer',
              }}
            >
              <Typography
                sx={{
                  fontSize: '14px',
                  fontWeight: isActive ? 700 : 600,
                  color: isActive ? '#0B4DB7' : '#475569',
                  backgroundColor: isActive && tab === 'Add Credit' ? '#EFF6FF' : 'transparent',
                  px: isActive && tab === 'Add Credit' ? 1.5 : 0.5,
                  py: isActive && tab === 'Add Credit' ? 0.6 : 0,
                  borderRadius: '6px',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    color: '#0B4DB7',
                  },
                }}
              >
                {tab}
              </Typography>

              {/* Active Tab Underline Bar */}
              {isActive && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '2.5px',
                    backgroundColor: '#0B4DB7',
                    borderTopLeftRadius: '2px',
                    borderTopRightRadius: '2px',
                  }}
                />
              )}
            </Box>
          );
        })}
      </Box>

      {/* View 1: Select Customer View */}
      {activeSubTab === 'Select Customer' && (
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              backgroundColor: '#0B4DB7',
              px: { xs: 2, sm: 3 },
              py: 1.6,
              minHeight: '52px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Typography
              sx={{
                color: '#FFFFFF',
                fontSize: '16px',
                fontWeight: 700,
                letterSpacing: '-0.01em',
              }}
            >
              Select Customer
            </Typography>
          </Box>

          <Box
            sx={{
              p: { xs: 3, sm: 4, md: 5 },
              pt: { xs: 4, md: 5 },
              pb: { xs: 5, md: 6 },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: { xs: 1.5, sm: 4 },
                maxWidth: '800px',
              }}
            >
              <Typography
                sx={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#0F172A',
                  minWidth: '140px',
                }}
              >
                Select Customer
              </Typography>

              <Box sx={{ width: { xs: '100%', sm: '380px', md: '420px' } }}>
                <Autocomplete
                  fullWidth
                  size="small"
                  autoHighlight
                  options={customerOptions}
                  getOptionLabel={(option) => (typeof option === 'string' ? option : option.name || '')}
                  isOptionEqualToValue={(option, val) => option.id === val.id || option.name === val.name}
                  value={customerOptions.find((c) => c.id === selectedCustomerId) || null}
                  onChange={(_, val) => {
                    if (val) {
                      setSelectedCustomerId(val.id);
                      setCurrentCustomerName(val.name);
                      setFilterCustomer(val.name);
                      setAddCreditCustomerName(val.name);
                      localStorage.setItem('dheeksha_active_customer', val.name);
                    } else {
                      setSelectedCustomerId('');
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Type or select customer..."
                      sx={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '6px',
                        '& .MuiOutlinedInput-root': {
                          height: '40px',
                          borderRadius: '6px',
                          fontSize: '13.5px',
                          fontWeight: 500,
                          '& fieldset': {
                            borderColor: '#CBD5E1',
                          },
                          '&:hover fieldset': {
                            borderColor: '#94A3B8',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#0B4DB7',
                            borderWidth: '1.5px',
                          },
                        },
                      }}
                    />
                  )}
                />

                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    disableElevation
                    onClick={handleSelectCustomerClick}
                    sx={{
                      backgroundColor: '#0B4DB7',
                      color: '#FFFFFF',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      textTransform: 'none',
                      px: 2.6,
                      py: 0.9,
                      borderRadius: '6px',
                      lineHeight: 1.3,
                      '&:hover': {
                        backgroundColor: '#083B8D',
                      },
                    }}
                  >
                    Click to Select
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </Paper>
      )}

      {/* View 2: Create Particular View */}
      {activeSubTab === 'Create Particular' && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            gap: 2.5,
            width: '100%',
            alignItems: 'flex-start',
          }}
        >
          {/* Left Card: Create Particular Form */}
          <Paper
            elevation={0}
            sx={{
              width: { xs: '100%', lg: '360px', xl: '380px' },
              flexShrink: 0,
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                backgroundColor: '#0B4DB7',
                px: 2.2,
                py: 1.4,
                minHeight: '48px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Typography
                sx={{
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                }}
              >
                Create Particular - {currentCustomerName || 'Customer'}
              </Typography>
            </Box>

            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.6 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 1.5 }}>
                <Box>
                  <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#475569', mb: 0.5 }}>
                    Customer
                  </Typography>
                  <Autocomplete
                    fullWidth
                    size="small"
                    autoHighlight
                    options={customerOptions}
                    getOptionLabel={(option) => (typeof option === 'string' ? option : option.name || '')}
                    isOptionEqualToValue={(option, val) => option.id === val.id || option.name === val.name}
                    value={customerOptions.find((c) => c.name === currentCustomerName) || null}
                    onChange={(_, val) => {
                      const name = val ? val.name : '';
                      setCurrentCustomerName(name);
                      localStorage.setItem('dheeksha_active_customer', name);
                      if (val) {
                        setSelectedCustomerId(val.id);
                        setFilterCustomer(val.name);
                        setAddCreditCustomerName(val.name);
                      } else {
                        setSelectedCustomerId('');
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Search Customer..."
                        sx={{
                          backgroundColor: '#FFFFFF',
                          borderRadius: '6px',
                          '& .MuiOutlinedInput-root': {
                            height: '36px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#0F172A',
                            '& fieldset': {
                              borderColor: '#CBD5E1',
                            },
                            '&:hover fieldset': {
                              borderColor: '#94A3B8',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#0B4DB7',
                              borderWidth: '1.5px',
                            },
                          },
                        }}
                      />
                    )}
                  />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#475569', mb: 0.5 }}>
                    Case Count
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={caseCount}
                    onChange={(e) => setCaseCount(e.target.value)}
                    slotProps={{
                      input: {
                        sx: {
                          fontSize: '13px',
                          fontWeight: 600,
                          height: '36px',
                          backgroundColor: '#F8FAFC',
                          borderRadius: '6px',
                          color: '#0F172A',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#CBD5E1',
                          },
                        },
                      },
                    }}
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 1.5 }}>
                <Box>
                  <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#475569', mb: 0.5 }}>
                    Company
                  </Typography>
                  <Autocomplete
                    fullWidth
                    size="small"
                    autoHighlight
                    options={companyOptions}
                    getOptionLabel={(option) => (typeof option === 'string' ? option : option.name || '')}
                    isOptionEqualToValue={(option, val) => option.id === val.id || option.name === val.name}
                    value={companyOptions.find((c) => c.name === company) || null}
                    onChange={(_, val) => setCompany(val ? val.name : '')}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Search Company..."
                        sx={{
                          backgroundColor: '#FFFFFF',
                          borderRadius: '6px',
                          '& .MuiOutlinedInput-root': {
                            height: '36px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: 500,
                            color: '#0F172A',
                            '& fieldset': {
                              borderColor: '#CBD5E1',
                            },
                            '&:hover fieldset': {
                              borderColor: '#94A3B8',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#0B4DB7',
                              borderWidth: '1.5px',
                            },
                          },
                        }}
                      />
                    )}
                  />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#475569', mb: 0.5 }}>
                    Discount (%)
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    slotProps={{
                      input: {
                        sx: {
                          fontSize: '13px',
                          fontWeight: 500,
                          height: '36px',
                          backgroundColor: '#FFFFFF',
                          borderRadius: '6px',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#CBD5E1',
                          },
                        },
                      },
                    }}
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 1.5 }}>
                <Box>
                  <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#475569', mb: 0.5 }}>
                    Transport
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={transport}
                    onChange={(e) => setTransport(e.target.value)}
                    slotProps={{
                      input: {
                        sx: {
                          fontSize: '13px',
                          fontWeight: 500,
                          height: '36px',
                          backgroundColor: '#FFFFFF',
                          borderRadius: '6px',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#CBD5E1',
                          },
                        },
                      },
                    }}
                  />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#475569', mb: 0.5 }}>
                    Packing (%)
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={packing}
                    onChange={(e) => setPacking(e.target.value)}
                    slotProps={{
                      input: {
                        sx: {
                          fontSize: '13px',
                          fontWeight: 500,
                          height: '36px',
                          backgroundColor: '#FFFFFF',
                          borderRadius: '6px',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#CBD5E1',
                          },
                        },
                      },
                    }}
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 1.5 }}>
                <Box>
                  <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#475569', mb: 0.5 }}>
                    Bill No (Auto)
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Auto-generated"
                    value={billNo}
                    onChange={(e) => setBillNo(e.target.value)}
                    slotProps={{
                      input: {
                        sx: {
                          fontSize: '13px',
                          fontWeight: 700,
                          color: '#0B4DB7',
                          height: '36px',
                          backgroundColor: '#F0F9FF',
                          borderRadius: '6px',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#BAE6FD',
                          },
                        },
                      },
                    }}
                  />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#475569', mb: 0.5 }}>
                    Tax
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={tax}
                    onChange={(e) => setTax(e.target.value)}
                    slotProps={{
                      input: {
                        sx: {
                          fontSize: '13px',
                          fontWeight: 500,
                          height: '36px',
                          backgroundColor: '#FFFFFF',
                          borderRadius: '6px',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#CBD5E1',
                          },
                        },
                      },
                    }}
                  />
                </Box>
              </Box>

              <Box
                sx={{
                  backgroundColor: '#F8FAFC',
                  p: 1.4,
                  borderRadius: '6px',
                  border: '1px solid #E2E8F0',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 1.5,
                }}
              >
                <Box>
                  <Typography sx={{ fontSize: '11.5px', fontWeight: 600, color: '#64748B', mb: 0.5 }}>
                    Amount
                  </Typography>
                  <Box
                    sx={{
                      backgroundColor: '#E2E8F0',
                      borderRadius: '4px',
                      px: 1.5,
                      py: 0.7,
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#0F172A',
                      textAlign: 'right',
                    }}
                  >
                    {subtotalAmount.toFixed(2)}
                  </Box>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '11.5px', fontWeight: 600, color: '#64748B', mb: 0.5 }}>
                    Total
                  </Typography>
                  <Box
                    sx={{
                      backgroundColor: '#E2E8F0',
                      borderRadius: '4px',
                      px: 1.5,
                      py: 0.7,
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#0B4DB7',
                      textAlign: 'right',
                    }}
                  >
                    {finalTotalAmount}
                  </Box>
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 1.5, mt: 0.5 }}>
                <Box>
                  <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#475569', mb: 0.5 }}>
                    Date
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="dd-mm-yyyy"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <CalendarTodayOutlinedIcon sx={{ fontSize: 16, color: '#1E293B' }} />
                        ),
                        sx: {
                          fontSize: '12.5px',
                          fontWeight: 500,
                          height: '36px',
                          backgroundColor: '#FFFFFF',
                          borderRadius: '6px',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#CBD5E1',
                          },
                        },
                      },
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                  <Button
                    variant="contained"
                    disableElevation
                    fullWidth
                    onClick={handleCreateParticular}
                    disabled={createLoading}
                    sx={{
                      backgroundColor: '#0284C7',
                      color: '#FFFFFF',
                      height: '36px',
                      fontSize: '13px',
                      fontWeight: 700,
                      textTransform: 'none',
                      borderRadius: '6px',
                      '&:hover': {
                        backgroundColor: '#0369A1',
                      },
                    }}
                  >
                    {createLoading ? 'Creating...' : 'Click to Create'}
                  </Button>
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* Right Card: Product Grid & Entry */}
          <Paper
            elevation={0}
            sx={{
              flex: 1,
              width: '100%',
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                backgroundColor: '#0B4DB7',
                px: 2.2,
                py: 1.4,
                minHeight: '48px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Typography
                sx={{
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                }}
              >
                Product
              </Typography>
            </Box>

            <Box
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1.2,
                flexWrap: { xs: 'wrap', sm: 'nowrap' },
                borderBottom: '1px solid #E2E8F0',
              }}
            >
              <Autocomplete
                size="small"
                autoHighlight
                sx={{ flex: { xs: '1 1 100%', sm: 2.5 }, minWidth: '160px' }}
                options={productOptions}
                getOptionLabel={(option) => (typeof option === 'string' ? option : option.name || '')}
                isOptionEqualToValue={(option, val) => option.id === val.id || option.name === val.name}
                value={productOptions.find((p) => p.name === selectedProduct) || null}
                onChange={(_, val) => setSelectedProduct(val ? val.name : '')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Search Product..."
                    sx={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '6px',
                      '& .MuiOutlinedInput-root': {
                        height: '36px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: 500,
                        color: '#0F172A',
                        '& fieldset': {
                          borderColor: '#CBD5E1',
                        },
                        '&:hover fieldset': {
                          borderColor: '#94A3B8',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#0B4DB7',
                          borderWidth: '1.5px',
                        },
                      },
                    }}
                  />
                )}
              />

              <TextField
                size="small"
                placeholder="Case"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                sx={{
                  flex: { xs: '1 1 45%', sm: 1 },
                  '& .MuiOutlinedInput-root': {
                    height: '36px',
                    fontSize: '13px',
                    fontWeight: 500,
                    borderRadius: '6px',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' },
                  },
                }}
              />

              <TextField
                size="small"
                placeholder="Rate"
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                sx={{
                  flex: { xs: '1 1 45%', sm: 1 },
                  '& .MuiOutlinedInput-root': {
                    height: '36px',
                    fontSize: '13px',
                    fontWeight: 500,
                    borderRadius: '6px',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' },
                  },
                }}
              />

              <TextField
                size="small"
                placeholder="Pkt / Units"
                type="number"
                value={pkt}
                onChange={(e) => setPkt(e.target.value)}
                sx={{
                  flex: { xs: '1 1 45%', sm: 1 },
                  '& .MuiOutlinedInput-root': {
                    height: '36px',
                    fontSize: '13px',
                    fontWeight: 500,
                    borderRadius: '6px',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' },
                  },
                }}
              />

              <TextField
                size="small"
                placeholder="Amount"
                value={
                  quantity && rate
                    ? (((parseFloat(quantity) || 0) * (parseFloat(pkt) || 1)) * (parseFloat(rate) || 0)).toFixed(2)
                    : ''
                }
                slotProps={{
                  input: {
                    readOnly: true,
                    sx: {
                      height: '36px',
                      fontSize: '13px',
                      fontWeight: 600,
                      backgroundColor: '#F1F5F9',
                      borderRadius: '6px',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' },
                    },
                  },
                }}
                sx={{ flex: { xs: '1 1 45%', sm: 1.2 } }}
              />

              <Button
                variant="contained"
                disableElevation
                onClick={handleAddProductRow}
                sx={{
                  backgroundColor: '#0B4DB7',
                  color: '#FFFFFF',
                  minWidth: '36px',
                  width: '36px',
                  height: '36px',
                  p: 0,
                  borderRadius: '6px',
                  '&:hover': {
                    backgroundColor: '#083B8D',
                  },
                }}
              >
                <AddRoundedIcon sx={{ fontSize: 20 }} />
              </Button>
            </Box>

            <TableContainer>
              <Table sx={{ width: '100%', borderCollapse: 'collapse' }} aria-label="particular product table">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                    <TableCell
                      sx={{
                        py: 1.4,
                        px: 2,
                        fontSize: '11.5px',
                        fontWeight: 700,
                        color: '#1E293B',
                        letterSpacing: '0.04em',
                        textAlign: 'center',
                        borderBottom: '1px solid #E2E8F0',
                        borderRight: '1px solid #E2E8F0',
                        width: '30%',
                      }}
                    >
                      PARTICULAR
                    </TableCell>
                    <TableCell
                      sx={{
                        py: 1.4,
                        px: 1.5,
                        fontSize: '11.5px',
                        fontWeight: 700,
                        color: '#1E293B',
                        letterSpacing: '0.04em',
                        textAlign: 'center',
                        borderBottom: '1px solid #E2E8F0',
                        borderRight: '1px solid #E2E8F0',
                        width: '14%',
                      }}
                    >
                      CASE
                    </TableCell>
                    <TableCell
                      sx={{
                        py: 1.4,
                        px: 1.5,
                        fontSize: '11.5px',
                        fontWeight: 700,
                        color: '#1E293B',
                        letterSpacing: '0.04em',
                        textAlign: 'center',
                        borderBottom: '1px solid #E2E8F0',
                        borderRight: '1px solid #E2E8F0',
                        width: '14%',
                      }}
                    >
                      RATE
                    </TableCell>
                    <TableCell
                      sx={{
                        py: 1.4,
                        px: 1.5,
                        fontSize: '11.5px',
                        fontWeight: 700,
                        color: '#1E293B',
                        letterSpacing: '0.04em',
                        textAlign: 'center',
                        borderBottom: '1px solid #E2E8F0',
                        borderRight: '1px solid #E2E8F0',
                        width: '14%',
                      }}
                    >
                      PKT / UNITS
                    </TableCell>
                    <TableCell
                      sx={{
                        py: 1.4,
                        px: 1.5,
                        fontSize: '11.5px',
                        fontWeight: 700,
                        color: '#1E293B',
                        letterSpacing: '0.04em',
                        textAlign: 'center',
                        borderBottom: '1px solid #E2E8F0',
                        width: '14%',
                      }}
                    >
                      AMOUNT
                    </TableCell>
                    <TableCell
                      sx={{
                        py: 1.4,
                        px: 1.5,
                        fontSize: '11.5px',
                        fontWeight: 700,
                        color: '#1E293B',
                        letterSpacing: '0.04em',
                        textAlign: 'center',
                        borderBottom: '1px solid #E2E8F0',
                        width: '14%',
                      }}
                    >
                      ACTION
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {productRows.length > 0 ? (
                    productRows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell sx={{ borderBottom: '1px solid #E2E8F0', borderRight: '1px solid #E2E8F0', fontWeight: 600, fontSize: '13px', color: '#0F172A' }}>
                          {row.particular}
                        </TableCell>
                        <TableCell align="center" sx={{ borderBottom: '1px solid #E2E8F0', borderRight: '1px solid #E2E8F0', fontWeight: 500, fontSize: '13px' }}>
                          {row.quantity}
                        </TableCell>
                        <TableCell align="center" sx={{ borderBottom: '1px solid #E2E8F0', borderRight: '1px solid #E2E8F0', fontWeight: 500, fontSize: '13px' }}>
                          {row.rate}
                        </TableCell>
                        <TableCell align="center" sx={{ borderBottom: '1px solid #E2E8F0', borderRight: '1px solid #E2E8F0', fontWeight: 500, fontSize: '13px' }}>
                          {row.pktUnit}
                        </TableCell>
                        <TableCell align="center" sx={{ borderBottom: '1px solid #E2E8F0', borderRight: '1px solid #E2E8F0', fontWeight: 600, fontSize: '13px' }}>
                          {row.amount}
                        </TableCell>
                        <TableCell align="center" sx={{ borderBottom: '1px solid #E2E8F0' }}>
                          <IconButton
                            size="small"
                            onClick={() => setProductRows((prev) => prev.filter((p) => p.id !== row.id))}
                            sx={{ color: '#DC2626', p: 0.3 }}
                          >
                            <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <>
                      <TableRow sx={{ height: '65px' }}>
                        <TableCell sx={{ borderBottom: '1px solid #E2E8F0', borderRight: '1px solid #E2E8F0' }} />
                        <TableCell sx={{ borderBottom: '1px solid #E2E8F0', borderRight: '1px solid #E2E8F0' }} />
                        <TableCell sx={{ borderBottom: '1px solid #E2E8F0', borderRight: '1px solid #E2E8F0' }} />
                        <TableCell sx={{ borderBottom: '1px solid #E2E8F0', borderRight: '1px solid #E2E8F0' }} />
                        <TableCell sx={{ borderBottom: '1px solid #E2E8F0', borderRight: '1px solid #E2E8F0' }} />
                        <TableCell sx={{ borderBottom: '1px solid #E2E8F0' }} />
                      </TableRow>
                    </>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}

      {/* View 3: Account Details View */}
      {activeSubTab === 'Account Details' && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Top Metric Cards */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
              gap: 2,
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 2.2,
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '10px',
                  backgroundColor: '#FEF2F2',
                  color: '#DC2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ReceiptLongRoundedIcon sx={{ fontSize: 24 }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>
                  Total Purchases (Debit)
                </Typography>
                <Typography sx={{ fontSize: '18px', fontWeight: 800, color: '#DC2626' }}>
                  ₹{overallTotals.totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Typography>
              </Box>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 2.2,
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '10px',
                  backgroundColor: '#F0FDF4',
                  color: '#16A34A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AccountBalanceWalletRoundedIcon sx={{ fontSize: 24 }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>
                  Total Paid / Credits
                </Typography>
                <Typography sx={{ fontSize: '18px', fontWeight: 800, color: '#16A34A' }}>
                  ₹{overallTotals.totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Typography>
              </Box>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 2.2,
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '10px',
                  backgroundColor: overallTotals.netBalance < 0 ? '#FEF2F2' : '#F0FDF4',
                  color: overallTotals.netBalance < 0 ? '#DC2626' : '#16A34A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AccountBalanceWalletRoundedIcon sx={{ fontSize: 24 }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>
                  Net Outstanding Balance
                </Typography>
                <Typography
                  sx={{
                    fontSize: '18px',
                    fontWeight: 800,
                    color: overallTotals.netBalance < 0 ? '#DC2626' : '#16A34A',
                  }}
                >
                  ₹{overallTotals.netBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Typography>
              </Box>
            </Paper>
          </Box>

          {/* Account Details Table */}
          <Paper
            elevation={0}
            sx={{
              width: '100%',
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                backgroundColor: '#0B4DB7',
                px: { xs: 2, sm: 3 },
                py: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1.5,
                minHeight: '52px',
              }}
            >
              <Typography
                sx={{
                  color: '#FFFFFF',
                  fontSize: '15.5px',
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                }}
              >
                Account Details {currentCustomerName || filterCustomer ? `- ${currentCustomerName || filterCustomer}` : ''}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  disableElevation
                  onClick={handlePrint}
                  startIcon={<PrintOutlinedIcon sx={{ fontSize: '18px !important', color: '#0F172A' }} />}
                  sx={{
                    backgroundColor: '#FFFFFF',
                    color: '#0F172A',
                    fontSize: '13px',
                    fontWeight: 700,
                    textTransform: 'none',
                    px: 2.2,
                    py: 0.7,
                    borderRadius: '6px',
                    lineHeight: 1.2,
                    '&:hover': {
                      backgroundColor: '#F8FAFC',
                    },
                  }}
                >
                  Click to Print
                </Button>
              </Box>
            </Box>

            <TableContainer>
              <Table sx={{ width: '100%' }} aria-label="account details table">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                    <TableCell sx={{ py: 1.5, px: { xs: 2, sm: 3 }, fontSize: '11.5px', fontWeight: 700, color: '#1E293B', width: '60px' }}>
                      SL.NO
                    </TableCell>
                    <TableCell sx={{ py: 1.5, px: { xs: 1.5, sm: 2.5 }, fontSize: '11.5px', fontWeight: 700, color: '#1E293B', width: '110px' }}>
                      DATE
                    </TableCell>
                    <TableCell sx={{ py: 1.5, px: { xs: 1.5, sm: 2.5 }, fontSize: '11.5px', fontWeight: 700, color: '#1E293B', width: '140px' }}>
                      CUSTOMER
                    </TableCell>
                    <TableCell sx={{ py: 1.5, px: { xs: 2, sm: 2.5 }, fontSize: '11.5px', fontWeight: 700, color: '#1E293B' }}>
                      COMPANY NAME
                    </TableCell>
                    <TableCell align="right" sx={{ py: 1.5, px: { xs: 1.5, sm: 2.5 }, fontSize: '11.5px', fontWeight: 700, color: '#1E293B', width: '110px' }}>
                      DEBIT
                    </TableCell>
                    <TableCell align="right" sx={{ py: 1.5, px: { xs: 1.5, sm: 2.5 }, fontSize: '11.5px', fontWeight: 700, color: '#1E293B', width: '110px' }}>
                      CREDIT
                    </TableCell>
                    <TableCell align="right" sx={{ py: 1.5, px: { xs: 1.5, sm: 2.5 }, fontSize: '11.5px', fontWeight: 700, color: '#1E293B', width: '120px' }}>
                      BALANCE
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1.5, px: { xs: 2, sm: 3 }, fontSize: '11.5px', fontWeight: 700, color: '#1E293B', width: '70px' }}>
                      DELETE
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {accountLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                        <CircularProgress size={32} sx={{ color: '#0B4DB7' }} />
                      </TableCell>
                    </TableRow>
                  ) : accountDetails.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6, color: '#64748B' }}>
                        No account details found {filterCustomer && filterCustomer !== 'ALL' ? `for ${filterCustomer}` : ''}.
                      </TableCell>
                    </TableRow>
                  ) : (
                    accountDetails.map((row: any, index: number) => {
                      const isLast = index === accountDetails.length - 1;
                      const rowId = row._id || row.id || '';
                      return (
                        <TableRow
                          key={rowId || index}
                          sx={{
                            '&:hover': {
                              backgroundColor: '#F8FAFC',
                            },
                          }}
                        >
                          <TableCell sx={{ py: 1.6, px: { xs: 2, sm: 3 }, fontSize: '13.5px', fontWeight: 600, color: '#1E293B', borderBottom: isLast ? 'none' : '1px solid #EEF2F6' }}>
                            {index + 1}
                          </TableCell>
                          <TableCell sx={{ py: 1.6, px: { xs: 1.5, sm: 2.5 }, fontSize: '13.5px', fontWeight: 500, color: '#475569', borderBottom: isLast ? 'none' : '1px solid #EEF2F6' }}>
                            {row.date}
                          </TableCell>
                          <TableCell sx={{ py: 1.6, px: { xs: 1.5, sm: 2.5 }, fontSize: '13.5px', fontWeight: 700, color: '#0B4DB7', borderBottom: isLast ? 'none' : '1px solid #EEF2F6' }}>
                            {row.customerName}
                          </TableCell>
                          <TableCell sx={{ py: 1.6, px: { xs: 2, sm: 2.5 }, fontSize: '13.5px', fontWeight: 600, color: '#0F172A', borderBottom: isLast ? 'none' : '1px solid #EEF2F6' }}>
                            {row.companyName}
                          </TableCell>
                          <TableCell align="right" sx={{ py: 1.6, px: { xs: 1.5, sm: 2.5 }, fontSize: '13.5px', fontWeight: 500, color: '#DC2626', borderBottom: isLast ? 'none' : '1px solid #EEF2F6' }}>
                            {row.debit}
                          </TableCell>
                          <TableCell align="right" sx={{ py: 1.6, px: { xs: 1.5, sm: 2.5 }, fontSize: '13.5px', fontWeight: 600, color: '#16A34A', borderBottom: isLast ? 'none' : '1px solid #EEF2F6' }}>
                            {row.credit}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              py: 1.6,
                              px: { xs: 1.5, sm: 2.5 },
                              fontSize: '13.5px',
                              fontWeight: 700,
                              color: String(row.balance).startsWith('-') ? '#DC2626' : '#16A34A',
                              borderBottom: isLast ? 'none' : '1px solid #EEF2F6',
                            }}
                          >
                            {row.balance}
                          </TableCell>
                          <TableCell align="center" sx={{ py: 1.6, px: { xs: 2, sm: 3 }, borderBottom: isLast ? 'none' : '1px solid #EEF2F6' }}>
                            <Tooltip title="Delete Record" arrow>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteAccountEntry(rowId)}
                                sx={{
                                  color: '#64748B',
                                  backgroundColor: '#F8FAFC',
                                  border: '1px solid #E2E8F0',
                                  borderRadius: '6px',
                                  p: 0.7,
                                  transition: 'all 0.15s ease',
                                  '&:hover': {
                                    color: '#DC2626',
                                    backgroundColor: '#FEF2F2',
                                    borderColor: '#FECACA',
                                  },
                                }}
                              >
                                <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}

      {/* View 4: Particular Details View */}
      {activeSubTab === 'Particular Details' && (
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              backgroundColor: '#0B4DB7',
              px: { xs: 2, sm: 3 },
              py: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1.5,
              minHeight: '52px',
            }}
          >
            <Typography
              sx={{
                color: '#FFFFFF',
                fontSize: '16px',
                fontWeight: 700,
                letterSpacing: '-0.01em',
              }}
            >
              Particular Details (All Bills)
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Chip
                label={`${particularDetails.length} Bills`}
                size="small"
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '12px',
                }}
              />
            </Box>
          </Box>

          <TableContainer>
            <Table sx={{ width: '100%', borderCollapse: 'collapse' }} aria-label="particular details table">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                  <TableCell align="center" sx={{ py: 1.4, px: 1.5, fontSize: '11.5px', fontWeight: 700, color: '#1E293B', letterSpacing: '0.04em', borderBottom: '1px solid #E2E8F0', borderRight: '1px solid #E2E8F0', width: '80px' }}>
                    BILL.NO
                  </TableCell>
                  <TableCell align="center" sx={{ py: 1.4, px: 1.5, fontSize: '11.5px', fontWeight: 700, color: '#1E293B', letterSpacing: '0.04em', borderBottom: '1px solid #E2E8F0', borderRight: '1px solid #E2E8F0', width: '130px' }}>
                    CUSTOMER
                  </TableCell>
                  <TableCell align="center" sx={{ py: 1.4, px: 1.5, fontSize: '11.5px', fontWeight: 700, color: '#1E293B', letterSpacing: '0.04em', borderBottom: '1px solid #E2E8F0', borderRight: '1px solid #E2E8F0', width: '140px' }}>
                    COMPANY NAME
                  </TableCell>
                  <TableCell align="center" sx={{ py: 1.4, px: 1.5, fontSize: '11.5px', fontWeight: 700, color: '#1E293B', letterSpacing: '0.04em', borderBottom: '1px solid #E2E8F0', borderRight: '1px solid #E2E8F0', width: '95px' }}>
                    DATE
                  </TableCell>
                  <TableCell align="right" sx={{ py: 1.4, px: 1.5, fontSize: '11.5px', fontWeight: 700, color: '#1E293B', letterSpacing: '0.04em', borderBottom: '1px solid #E2E8F0', borderRight: '1px solid #E2E8F0', width: '100px' }}>
                    SUBTOTAL
                  </TableCell>
                  <TableCell align="center" sx={{ py: 1.4, px: 1, fontSize: '11.5px', fontWeight: 700, color: '#1E293B', letterSpacing: '0.04em', borderBottom: '1px solid #E2E8F0', borderRight: '1px solid #E2E8F0', width: '80px' }}>
                    DISCOUNT
                  </TableCell>
                  <TableCell align="center" sx={{ py: 1.4, px: 1, fontSize: '11.5px', fontWeight: 700, color: '#1E293B', letterSpacing: '0.04em', borderBottom: '1px solid #E2E8F0', borderRight: '1px solid #E2E8F0', width: '80px' }}>
                    PACKING
                  </TableCell>
                  <TableCell align="center" sx={{ py: 1.4, px: 1, fontSize: '11.5px', fontWeight: 700, color: '#1E293B', letterSpacing: '0.04em', borderBottom: '1px solid #E2E8F0', borderRight: '1px solid #E2E8F0', width: '75px' }}>
                    TAX
                  </TableCell>
                  <TableCell align="right" sx={{ py: 1.4, px: 1.5, fontSize: '11.5px', fontWeight: 700, color: '#1E293B', letterSpacing: '0.04em', borderBottom: '1px solid #E2E8F0', borderRight: '1px solid #E2E8F0', width: '110px' }}>
                    NET TOTAL
                  </TableCell>
                  <TableCell align="center" sx={{ py: 1.4, px: 1.5, fontSize: '11.5px', fontWeight: 700, color: '#1E293B', letterSpacing: '0.04em', borderBottom: '1px solid #E2E8F0', borderRight: '1px solid #E2E8F0', width: '120px' }}>
                    TRANSPORT
                  </TableCell>
                  <TableCell align="center" sx={{ py: 1.4, px: 1.5, fontSize: '11.5px', fontWeight: 700, color: '#1E293B', letterSpacing: '0.04em', borderBottom: '1px solid #E2E8F0', width: '150px' }}>
                    ACTION
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {particularLoading ? (
                  <TableRow>
                    <TableCell colSpan={11} align="center" sx={{ py: 6 }}>
                      <CircularProgress size={32} sx={{ color: '#0B4DB7' }} />
                    </TableCell>
                  </TableRow>
                ) : particularDetails.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} align="center" sx={{ py: 6, color: '#64748B' }}>
                      No particular bills found {filterCustomer !== 'ALL' ? `for ${filterCustomer}` : ''}.
                    </TableCell>
                  </TableRow>
                ) : (
                  particularDetails.map((row, index) => {
                    const isLast = index === particularDetails.length - 1;
                    const rowId = row._id || row.id || '';
                    const subtotalNum = parseFloat(String(row.amount || row.total || '0').replace(/,/g, '')) || 0;
                    const totalNum = parseFloat(String(row.total || row.amount || '0').replace(/,/g, '')) || 0;
                    const discStr = row.discount && parseFloat(row.discount) > 0 ? (parseFloat(row.discount) <= 100 ? `${row.discount}%` : `₹${row.discount}`) : '-';
                    const packStr = row.packing && parseFloat(row.packing) > 0 ? (parseFloat(row.packing) <= 100 ? `${row.packing}%` : `₹${row.packing}`) : '-';
                    const taxStr = row.tax && parseFloat(row.tax) > 0 ? (parseFloat(row.tax) <= 100 ? `${row.tax}%` : `₹${row.tax}`) : '-';
                    const hasPdf = Boolean(row.pdfData && row.pdfData.trim() !== '');
                    const isUploading = uploadingBillId === rowId;

                    return (
                      <TableRow
                        key={rowId || index}
                        sx={{
                          '&:hover': {
                            backgroundColor: '#F8FAFC',
                          },
                        }}
                      >
                        <TableCell align="center" sx={{ py: 1.4, px: 1.5, fontSize: '13px', fontWeight: 700, color: '#0F172A', borderBottom: isLast ? 'none' : '1px solid #EEF2F6', borderRight: '1px solid #EEF2F6' }}>
                          {row.billNo}
                        </TableCell>
                        <TableCell align="center" sx={{ py: 1.4, px: 1.5, fontSize: '13px', fontWeight: 700, color: '#0B4DB7', borderBottom: isLast ? 'none' : '1px solid #EEF2F6', borderRight: '1px solid #EEF2F6' }}>
                          {row.customerName}
                        </TableCell>
                        <TableCell align="center" sx={{ py: 1.4, px: 1.5, fontSize: '13px', fontWeight: 600, color: '#0F172A', borderBottom: isLast ? 'none' : '1px solid #EEF2F6', borderRight: '1px solid #EEF2F6' }}>
                          {row.companyName}
                        </TableCell>
                        <TableCell align="center" sx={{ py: 1.4, px: 1.5, fontSize: '12.5px', fontWeight: 500, color: '#475569', borderBottom: isLast ? 'none' : '1px solid #EEF2F6', borderRight: '1px solid #EEF2F6' }}>
                          {row.date}
                        </TableCell>
                        <TableCell align="right" sx={{ py: 1.4, px: 1.5, fontSize: '13px', fontWeight: 600, color: '#475569', borderBottom: isLast ? 'none' : '1px solid #EEF2F6', borderRight: '1px solid #EEF2F6' }}>
                          ₹{subtotalNum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell align="center" sx={{ py: 1.4, px: 1, fontSize: '12.5px', fontWeight: 600, color: discStr !== '-' ? '#DC2626' : '#94A3B8', borderBottom: isLast ? 'none' : '1px solid #EEF2F6', borderRight: '1px solid #EEF2F6' }}>
                          {discStr}
                        </TableCell>
                        <TableCell align="center" sx={{ py: 1.4, px: 1, fontSize: '12.5px', fontWeight: 600, color: packStr !== '-' ? '#0F172A' : '#94A3B8', borderBottom: isLast ? 'none' : '1px solid #EEF2F6', borderRight: '1px solid #EEF2F6' }}>
                          {packStr}
                        </TableCell>
                        <TableCell align="center" sx={{ py: 1.4, px: 1, fontSize: '12.5px', fontWeight: 600, color: taxStr !== '-' ? '#0F172A' : '#94A3B8', borderBottom: isLast ? 'none' : '1px solid #EEF2F6', borderRight: '1px solid #EEF2F6' }}>
                          {taxStr}
                        </TableCell>
                        <TableCell align="right" sx={{ py: 1.4, px: 1.5, fontSize: '13.5px', fontWeight: 800, color: '#0F172A', borderBottom: isLast ? 'none' : '1px solid #EEF2F6', borderRight: '1px solid #EEF2F6' }}>
                          ₹{totalNum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell align="center" sx={{ py: 1.4, px: 1.5, fontSize: '12.5px', fontWeight: 500, color: '#334155', borderBottom: isLast ? 'none' : '1px solid #EEF2F6', borderRight: '1px solid #EEF2F6' }}>
                          {row.transport || row.transportName || '-'}
                        </TableCell>
                        <TableCell align="center" sx={{ py: 1.4, px: 1.5, borderBottom: isLast ? 'none' : '1px solid #EEF2F6' }}>
                          <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 0.6 }}>
                            <Tooltip title="View" arrow>
                              <IconButton
                                size="small"
                                onClick={() => handleOpenBillPrint(row, false)}
                                sx={{
                                  backgroundColor: '#0B4DB7',
                                  color: '#FFFFFF',
                                  borderRadius: '4px',
                                  width: '24px',
                                  height: '22px',
                                  p: 0,
                                  '&:hover': { backgroundColor: '#083B8D' },
                                }}
                              >
                                <VisibilityRoundedIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Print" arrow>
                              <IconButton
                                size="small"
                                onClick={() => handleOpenBillPrint(row, true)}
                                sx={{
                                  backgroundColor: '#334155',
                                  color: '#FFFFFF',
                                  borderRadius: '4px',
                                  width: '24px',
                                  height: '22px',
                                  p: 0,
                                  '&:hover': { backgroundColor: '#1E293B' },
                                }}
                              >
                                <PrintOutlinedIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Tooltip>

                            {/* PDF Upload / View Button (Under 1 MB) */}
                            <Tooltip
                              title={
                                hasPdf
                                  ? `View PDF (${row.pdfName || 'Attached Document'})`
                                  : 'Upload PDF (Under 1 MB)'
                              }
                              arrow
                            >
                              <IconButton
                                size="small"
                                onClick={() => (hasPdf ? handleOpenPdfPreview(row) : handleTriggerPdfUpload(rowId))}
                                disabled={isUploading}
                                sx={{
                                  backgroundColor: hasPdf ? '#16A34A' : '#6366F1',
                                  color: '#FFFFFF',
                                  borderRadius: '4px',
                                  width: '24px',
                                  height: '22px',
                                  p: 0,
                                  '&:hover': { backgroundColor: hasPdf ? '#15803D' : '#4F46E5' },
                                  '&.Mui-disabled': { backgroundColor: '#CBD5E1', color: '#FFFFFF' },
                                }}
                              >
                                {isUploading ? (
                                  <CircularProgress size={12} sx={{ color: '#FFFFFF' }} />
                                ) : hasPdf ? (
                                  <PictureAsPdfRoundedIcon sx={{ fontSize: 14 }} />
                                ) : (
                                  <UploadFileRoundedIcon sx={{ fontSize: 14 }} />
                                )}
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Delete" arrow>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteParticular(rowId)}
                                sx={{
                                  backgroundColor: '#DC2626',
                                  color: '#FFFFFF',
                                  borderRadius: '4px',
                                  width: '24px',
                                  height: '22px',
                                  p: 0,
                                  '&:hover': { backgroundColor: '#B91C1C' },
                                }}
                              >
                                <DeleteOutlineRoundedIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* View 5: Add Credit View */}
      {activeSubTab === 'Add Credit' && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            py: { xs: 2, sm: 4, md: 5 },
          }}
        >
          <Paper
            elevation={0}
            sx={{
              width: '100%',
              maxWidth: { xs: '100%', sm: '680px', md: '780px', lg: '840px' },
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                backgroundColor: '#0B4DB7',
                px: { xs: 2.5, sm: 3.5 },
                py: 2,
                minHeight: '52px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Typography
                sx={{
                  color: '#FFFFFF',
                  fontSize: '16px',
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                }}
              >
                Add Credit - {currentCustomerName || 'Customer'}
              </Typography>
            </Box>

            <Box
              sx={{
                p: { xs: 3, sm: 5, md: 6 },
                pb: { xs: 4, sm: 6, md: 7 },
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
              }}
            >
              {/* Customer Name */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  gap: { xs: 1, sm: 3.5 },
                }}
              >
                <Typography
                  sx={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#0F172A',
                    minWidth: '150px',
                    textAlign: { sm: 'right' },
                  }}
                >
                  Customer Name
                </Typography>
                <Autocomplete
                  fullWidth
                  size="small"
                  autoHighlight
                  options={customerOptions}
                  getOptionLabel={(option) => (typeof option === 'string' ? option : option.name || '')}
                  isOptionEqualToValue={(option, val) => option.id === val.id || option.name === val.name}
                  value={customerOptions.find((c) => c.name === (addCreditCustomerName || currentCustomerName)) || null}
                  onChange={(_, val) => setAddCreditCustomerName(val ? val.name : '')}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Search Customer..."
                      sx={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '6px',
                        '& .MuiOutlinedInput-root': {
                          height: '42px',
                          borderRadius: '6px',
                          fontSize: '13.5px',
                          fontWeight: 600,
                          color: '#0F172A',
                          '& fieldset': {
                            borderColor: '#CBD5E1',
                          },
                          '&:hover fieldset': {
                            borderColor: '#94A3B8',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#0B4DB7',
                            borderWidth: '1.5px',
                          },
                        },
                      }}
                    />
                  )}
                />
              </Box>

              {/* Company Name */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  gap: { xs: 1, sm: 3.5 },
                }}
              >
                <Typography
                  sx={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#0F172A',
                    minWidth: '150px',
                    textAlign: { sm: 'right' },
                  }}
                >
                  Company Name
                </Typography>
                <Autocomplete
                  fullWidth
                  size="small"
                  autoHighlight
                  options={companyOptions}
                  getOptionLabel={(option) => (typeof option === 'string' ? option : option.name || '')}
                  isOptionEqualToValue={(option, val) => option.id === val.id || option.name === val.name}
                  value={companyOptions.find((c) => c.name === addCreditCompanyName) || null}
                  onChange={(_, val) => setAddCreditCompanyName(val ? val.name : '')}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Search Company..."
                      sx={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '6px',
                        '& .MuiOutlinedInput-root': {
                          height: '42px',
                          borderRadius: '6px',
                          fontSize: '13.5px',
                          fontWeight: 500,
                          color: '#0F172A',
                          '& fieldset': {
                            borderColor: '#CBD5E1',
                          },
                          '&:hover fieldset': {
                            borderColor: '#94A3B8',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#0B4DB7',
                            borderWidth: '1.5px',
                          },
                        },
                      }}
                    />
                  )}
                />
              </Box>

              {/* Credit Amount */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  gap: { xs: 1, sm: 3.5 },
                }}
              >
                <Typography
                  sx={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#0F172A',
                    minWidth: '150px',
                    textAlign: { sm: 'right' },
                  }}
                >
                  Credit Amount
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  placeholder="e.g. 50000"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  slotProps={{
                    input: {
                      sx: {
                        fontSize: '13.5px',
                        fontWeight: 600,
                        height: '42px',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '6px',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#CBD5E1',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#94A3B8',
                        },
                      },
                    },
                  }}
                />
              </Box>

              {/* Date */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  gap: { xs: 1, sm: 3.5 },
                }}
              >
                <Typography
                  sx={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#0F172A',
                    minWidth: '150px',
                    textAlign: { sm: 'right' },
                  }}
                >
                  Date
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="dd-mm-yyyy"
                  value={creditDate}
                  onChange={(e) => setCreditDate(e.target.value)}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <CalendarTodayOutlinedIcon sx={{ fontSize: 18, color: '#1E293B' }} />
                      ),
                      sx: {
                        fontSize: '13.5px',
                        fontWeight: 500,
                        height: '42px',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '6px',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#CBD5E1',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#94A3B8',
                        },
                      },
                    },
                  }}
                />
              </Box>

              {/* Action Button */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  pl: { xs: 0, sm: '178px' },
                  mt: 1,
                }}
              >
                <Button
                  variant="contained"
                  disableElevation
                  onClick={handleAddCreditSubmit}
                  disabled={creditLoading}
                  sx={{
                    backgroundColor: '#0B4DB7',
                    color: '#FFFFFF',
                    height: '42px',
                    fontSize: '14px',
                    fontWeight: 700,
                    textTransform: 'none',
                    borderRadius: '6px',
                    px: 3.5,
                    '&:hover': {
                      backgroundColor: '#083B8D',
                    },
                  }}
                >
                  {creditLoading ? 'Saving...' : 'Click to create'}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
      )}
      {/* Hidden File Input for PDF Upload (Under 1 MB) */}
      <input
        type="file"
        ref={fileInputRef}
        accept="application/pdf"
        style={{ display: 'none' }}
        onChange={handlePdfFileChange}
      />

      {/* PDF Document Preview & Management Modal */}
      <Dialog
        open={Boolean(pdfPreviewModal?.open)}
        onClose={() => setPdfPreviewModal(null)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '12px',
              overflow: 'hidden',
              height: '80vh',
              display: 'flex',
              flexDirection: 'column',
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#0B4DB7',
            color: '#FFFFFF',
            py: 1.5,
            px: 2.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PictureAsPdfRoundedIcon sx={{ fontSize: 22, color: '#FFFFFF' }} />
            <Typography sx={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF' }}>
              {pdfPreviewModal?.name || 'Attached PDF Document'}
            </Typography>
            {pdfPreviewModal?.billNo && (
              <Chip
                label={`Bill #${pdfPreviewModal.billNo}`}
                size="small"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '11px',
                  height: '20px',
                }}
              />
            )}
          </Box>
          <IconButton
            size="small"
            onClick={() => setPdfPreviewModal(null)}
            sx={{ color: '#FFFFFF', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
          >
            <CloseRoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0, flex: 1, backgroundColor: '#F1F5F9' }}>
          {pdfPreviewModal?.url ? (
            <iframe
              src={pdfPreviewModal.url}
              title="PDF Preview"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                display: 'block',
              }}
            />
          ) : (
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748B',
              }}
            >
              <Typography>No PDF available</Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 2.5,
            py: 1.5,
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid #E2E8F0',
            justifyContent: 'space-between',
          }}
        >
          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />}
            onClick={() => pdfPreviewModal?.id && handleDeleteAttachedPdf(pdfPreviewModal.id)}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '12.5px',
              borderRadius: '6px',
            }}
          >
            Delete PDF
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<UploadFileRoundedIcon sx={{ fontSize: 16 }} />}
              onClick={() => {
                const billId = pdfPreviewModal?.id;
                setPdfPreviewModal(null);
                if (billId) handleTriggerPdfUpload(billId);
              }}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '12.5px',
                borderRadius: '6px',
                color: '#0B4DB7',
                borderColor: '#BFDBFE',
              }}
            >
              Replace PDF
            </Button>

            <Button
              variant="contained"
              disableElevation
              size="small"
              startIcon={<DownloadRoundedIcon sx={{ fontSize: 16 }} />}
              component="a"
              href={pdfPreviewModal?.url}
              download={pdfPreviewModal?.name || 'bill-document.pdf'}
              sx={{
                backgroundColor: '#0B4DB7',
                color: '#FFFFFF',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '12.5px',
                borderRadius: '6px',
                '&:hover': { backgroundColor: '#083B8D' },
              }}
            >
              Download PDF
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Bill Print & Preview Modal */}
      <BillPrintModal
        open={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        bill={selectedBillForPrint}
      />

      {/* Toast Notification for PDF Uploads */}
      <Snackbar
        open={pdfToast.open}
        autoHideDuration={4000}
        onClose={() => setPdfToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setPdfToast((prev) => ({ ...prev, open: false }))}
          severity={pdfToast.severity}
          variant="filled"
          sx={{ width: '100%', borderRadius: '8px', fontWeight: 600, fontSize: '13px' }}
        >
          {pdfToast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

