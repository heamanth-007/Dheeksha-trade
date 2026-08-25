import { useState, useEffect, type FC } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Select,
  MenuItem,
  FormControl,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  CircularProgress,
  type SelectChangeEvent,
} from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import {
  CustomersApi,
  CompaniesApi,
  ProductsApi,
  ParticularsApi,
  AccountsApi,
} from '../services/api';

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
}

export const ParticularsPage: FC<ParticularsPageProps> = ({ initialCustomerName = 'R A TRADERS 2025' }) => {
  const [activeSubTab, setActiveSubTab] = useState<ParticularSubTab>('Select Customer');

  // Live Dropdown options
  const [customerOptions, setCustomerOptions] = useState<{ id: string; name: string }[]>([]);
  const [companyOptions, setCompanyOptions] = useState<{ id: string; name: string }[]>([]);
  const [productOptions, setProductOptions] = useState<{ id: string; name: string }[]>([]);

  // Selected active customer
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [currentCustomerName, setCurrentCustomerName] = useState<string>(initialCustomerName);

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
  const [addCreditCompanyName, setAddCreditCompanyName] = useState<string>('');
  const [creditAmount, setCreditAmount] = useState<string>('');
  const [creditDate, setCreditDate] = useState<string>(() => {
    const today = new Date();
    return today.toLocaleDateString('en-GB').replace(/\//g, '-');
  });
  const [creditLoading, setCreditLoading] = useState(false);

  // Load Initial Options
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
          setSelectedCustomerId(mapped[0].id);
          if (!initialCustomerName || initialCustomerName === 'R A TRADERS 2025') {
            setCurrentCustomerName(mapped[0].name);
          }
        }

        if (compRes && compRes.length > 0) {
          const mapped = compRes.map((c: any) => ({ id: c._id || c.id, name: c.name }));
          setCompanyOptions(mapped);
          setCompany(mapped[0].name);
          setAddCreditCompanyName(mapped[0].name);
        }

        if (prodRes && prodRes.length > 0) {
          const mapped = prodRes.map((p: any) => ({ id: p._id || p.id, name: p.name }));
          setProductOptions(mapped);
          setSelectedProduct(mapped[0].name);
        }
      } catch (err) {
        console.error('Error loading options:', err);
      }
    };
    loadOptions();
  }, [initialCustomerName]);

  // Load Subtab 3 data when active
  const fetchAccounts = async () => {
    try {
      setAccountLoading(true);
      const data = await AccountsApi.getAll(currentCustomerName);
      setAccountDetails(data || []);
    } catch (err) {
      console.error('Failed to load accounts:', err);
    } finally {
      setAccountLoading(false);
    }
  };

  // Load Subtab 4 data when active
  const fetchParticulars = async () => {
    try {
      setParticularLoading(true);
      const data = await ParticularsApi.getAll(currentCustomerName);
      setParticularDetails(data || []);
    } catch (err) {
      console.error('Failed to load particulars:', err);
    } finally {
      setParticularLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'Account Details') {
      fetchAccounts();
    } else if (activeSubTab === 'Particular Details') {
      fetchParticulars();
    }
  }, [activeSubTab, currentCustomerName]);

  // Handle Select Customer View
  const handleCustomerChange = (event: SelectChangeEvent) => {
    const custId = event.target.value;
    setSelectedCustomerId(custId);
    const found = customerOptions.find((c) => c.id === custId);
    if (found) {
      setCurrentCustomerName(found.name);
    }
  };

  const handleSelectCustomerClick = () => {
    setActiveSubTab('Create Particular');
  };

  // Subtab 2: Product Row Addition
  const handleAddProductRow = () => {
    if (!selectedProduct || !quantity || !rate) {
      alert('Please select product, quantity, and rate');
      return;
    }
    const lineAmt = (parseFloat(quantity) * parseFloat(rate)).toFixed(2);
    const newRow: ProductRowItem = {
      id: Date.now().toString(),
      particular: selectedProduct,
      quantity,
      rate,
      pktUnit: pkt || '-',
      amount: lineAmt,
    };
    setProductRows((prev) => [...prev, newRow]);
    setQuantity('');
    setRate('');
    setPkt('');
  };

  const subtotalAmount = productRows.reduce((acc, row) => acc + (parseFloat(row.amount) || 0), 0);
  const totalAmount = subtotalAmount.toFixed(2);

  // Subtab 2: Submit Particular
  const handleCreateParticular = async () => {
    if (!billNo.trim()) {
      alert('Please enter Bill No');
      return;
    }

    try {
      setCreateLoading(true);
      await ParticularsApi.create({
        customerName: currentCustomerName,
        caseCount: caseCount || '0',
        companyName: company || 'General',
        discount: discount || '0',
        transport: transport || 'General',
        packing: packing || '0',
        billNo: billNo.trim(),
        tax: tax || '0',
        amount: totalAmount,
        total: totalAmount,
        date: date,
        products: productRows,
      });

      alert('Particular created successfully!');
      setProductRows([]);
      setBillNo('');
      setActiveSubTab('Particular Details');
    } catch (err) {
      console.error('Failed to create particular:', err);
      alert('Error creating particular');
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
        customerName: currentCustomerName,
        companyName: addCreditCompanyName || 'General',
        creditAmount: creditAmount.trim(),
        date: creditDate,
      });

      alert('Credit added successfully!');
      setCreditAmount('');
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
    if (!window.confirm('Delete this account transaction?')) return;
    try {
      await AccountsApi.delete(id);
      setAccountDetails((prev) => prev.filter((a) => (a._id || a.id) !== id));
    } catch (err) {
      console.error('Failed to delete account entry:', err);
    }
  };

  const handleDeleteParticular = async (id: string) => {
    if (!window.confirm('Delete this particular bill?')) return;
    try {
      await ParticularsApi.delete(id);
      setParticularDetails((prev) => prev.filter((p) => (p._id || p.id) !== id));
    } catch (err) {
      console.error('Failed to delete particular:', err);
    }
  };

  const handlePrint = () => {
    window.print();
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
                <FormControl fullWidth size="small">
                  <Select
                    value={selectedCustomerId}
                    onChange={handleCustomerChange}
                    displayEmpty
                    IconComponent={KeyboardArrowDownRoundedIcon}
                    renderValue={(selected) => {
                      if (!selected) {
                        return (
                          <Typography sx={{ fontSize: '13.5px', fontWeight: 500, color: '#64748B' }}>
                            Select an option
                          </Typography>
                        );
                      }
                      const found = customerOptions.find((c) => c.id === selected);
                      return (
                        <Typography sx={{ fontSize: '13.5px', fontWeight: 600, color: '#0F172A' }}>
                          {found ? found.name : currentCustomerName}
                        </Typography>
                      );
                    }}
                    sx={{
                      height: '40px',
                      borderRadius: '6px',
                      backgroundColor: '#FFFFFF',
                      fontSize: '13.5px',
                      fontWeight: 500,
                      color: '#0F172A',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#CBD5E1',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#94A3B8',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#0B4DB7',
                        borderWidth: '1.5px',
                      },
                    }}
                  >
                    {customerOptions.map((opt) => (
                      <MenuItem key={opt.id} value={opt.id} sx={{ fontSize: '13.5px', fontWeight: 500 }}>
                        {opt.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

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
                Create Particular - {currentCustomerName}
              </Typography>
            </Box>

            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.6 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 1.5 }}>
                <Box>
                  <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#475569', mb: 0.5 }}>
                    Customer
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={currentCustomerName}
                    slotProps={{
                      input: {
                        readOnly: true,
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
                  <FormControl fullWidth size="small">
                    <Select
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      IconComponent={KeyboardArrowDownRoundedIcon}
                      sx={{
                        height: '36px',
                        borderRadius: '6px',
                        backgroundColor: '#FFFFFF',
                        fontSize: '13px',
                        fontWeight: 500,
                        color: '#0F172A',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#CBD5E1',
                        },
                      }}
                    >
                      {companyOptions.map((opt) => (
                        <MenuItem key={opt.id} value={opt.name} sx={{ fontSize: '13px', fontWeight: 500 }}>
                          {opt.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
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
                    Bill No *
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="e.g. 0602"
                    value={billNo}
                    onChange={(e) => setBillNo(e.target.value)}
                    slotProps={{
                      input: {
                        sx: {
                          fontSize: '13px',
                          fontWeight: 600,
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
                    {totalAmount}
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
                      color: '#0F172A',
                      textAlign: 'right',
                    }}
                  >
                    {totalAmount}
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
              <FormControl size="small" sx={{ flex: { xs: '1 1 100%', sm: 2.5 }, minWidth: '160px' }}>
                <Select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  IconComponent={KeyboardArrowDownRoundedIcon}
                  sx={{
                    height: '36px',
                    borderRadius: '6px',
                    backgroundColor: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#0F172A',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#CBD5E1',
                    },
                  }}
                >
                  {productOptions.map((opt) => (
                    <MenuItem key={opt.id} value={opt.name} sx={{ fontSize: '13px', fontWeight: 500 }}>
                      {opt.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                size="small"
                placeholder="Quantity"
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
                placeholder="PKT"
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
                value={quantity && rate ? (parseFloat(quantity) * parseFloat(rate)).toFixed(2) : ''}
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
                      QUANTITY
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
                      PKT / UNIT
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
        <Paper
          elevation={0}
          sx={{
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
              px: { xs: 2, sm: 3 },
              py: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
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
              Account Details - {currentCustomerName}
            </Typography>

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
                minWidth: 'auto',
                lineHeight: 1.2,
                '&:hover': {
                  backgroundColor: '#F8FAFC',
                },
              }}
            >
              Click to Print
            </Button>
          </Box>

          <TableContainer>
            <Table sx={{ width: '100%' }} aria-label="account details table">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                  <TableCell
                    sx={{
                      py: 1.5,
                      px: { xs: 2, sm: 3 },
                      fontSize: '11.5px',
                      fontWeight: 700,
                      color: '#1E293B',
                      letterSpacing: '0.04em',
                      borderBottom: '1px solid #E2E8F0',
                      width: '70px',
                    }}
                  >
                    SL.NO
                  </TableCell>
                  <TableCell
                    sx={{
                      py: 1.5,
                      px: { xs: 1.5, sm: 2.5 },
                      fontSize: '11.5px',
                      fontWeight: 700,
                      color: '#1E293B',
                      letterSpacing: '0.04em',
                      borderBottom: '1px solid #E2E8F0',
                      width: '130px',
                    }}
                  >
                    DATE
                  </TableCell>
                  <TableCell
                    sx={{
                      py: 1.5,
                      px: { xs: 2, sm: 2.5 },
                      fontSize: '11.5px',
                      fontWeight: 700,
                      color: '#1E293B',
                      letterSpacing: '0.04em',
                      borderBottom: '1px solid #E2E8F0',
                    }}
                  >
                    COMPANY NAME
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      py: 1.5,
                      px: { xs: 1.5, sm: 2.5 },
                      fontSize: '11.5px',
                      fontWeight: 700,
                      color: '#1E293B',
                      letterSpacing: '0.04em',
                      borderBottom: '1px solid #E2E8F0',
                      width: '110px',
                    }}
                  >
                    DEBIT
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      py: 1.5,
                      px: { xs: 1.5, sm: 2.5 },
                      fontSize: '11.5px',
                      fontWeight: 700,
                      color: '#1E293B',
                      letterSpacing: '0.04em',
                      borderBottom: '1px solid #E2E8F0',
                      width: '130px',
                    }}
                  >
                    CREDIT
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      py: 1.5,
                      px: { xs: 1.5, sm: 2.5 },
                      fontSize: '11.5px',
                      fontWeight: 700,
                      color: '#1E293B',
                      letterSpacing: '0.04em',
                      borderBottom: '1px solid #E2E8F0',
                      width: '130px',
                    }}
                  >
                    BALANCE
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      py: 1.5,
                      px: { xs: 2, sm: 3 },
                      fontSize: '11.5px',
                      fontWeight: 700,
                      color: '#1E293B',
                      letterSpacing: '0.04em',
                      borderBottom: '1px solid #E2E8F0',
                      width: '80px',
                    }}
                  >
                    DELETE
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {accountLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <CircularProgress size={32} sx={{ color: '#0B4DB7' }} />
                    </TableCell>
                  </TableRow>
                ) : accountDetails.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6, color: '#64748B' }}>
                      No ledger entries found for {currentCustomerName}.
                    </TableCell>
                  </TableRow>
                ) : (
                  accountDetails.map((row, index) => {
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
                        <TableCell
                          sx={{
                            py: 1.6,
                            px: { xs: 2, sm: 3 },
                            fontSize: '13.5px',
                            fontWeight: 600,
                            color: '#1E293B',
                            borderBottom: isLast ? 'none' : '1px solid #EEF2F6',
                          }}
                        >
                          {index + 1}
                        </TableCell>
                        <TableCell
                          sx={{
                            py: 1.6,
                            px: { xs: 1.5, sm: 2.5 },
                            fontSize: '13.5px',
                            fontWeight: 500,
                            color: '#475569',
                            borderBottom: isLast ? 'none' : '1px solid #EEF2F6',
                          }}
                        >
                          {row.date}
                        </TableCell>
                        <TableCell
                          sx={{
                            py: 1.6,
                            px: { xs: 2, sm: 2.5 },
                            fontSize: '13.5px',
                            fontWeight: 600,
                            color: '#0F172A',
                            borderBottom: isLast ? 'none' : '1px solid #EEF2F6',
                          }}
                        >
                          {row.companyName}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            py: 1.6,
                            px: { xs: 1.5, sm: 2.5 },
                            fontSize: '13.5px',
                            fontWeight: 500,
                            color: '#475569',
                            borderBottom: isLast ? 'none' : '1px solid #EEF2F6',
                          }}
                        >
                          {row.debit}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            py: 1.6,
                            px: { xs: 1.5, sm: 2.5 },
                            fontSize: '13.5px',
                            fontWeight: 600,
                            color: '#0F172A',
                            borderBottom: isLast ? 'none' : '1px solid #EEF2F6',
                          }}
                        >
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
                        <TableCell
                          align="center"
                          sx={{
                            py: 1.6,
                            px: { xs: 2, sm: 3 },
                            borderBottom: isLast ? 'none' : '1px solid #EEF2F6',
                          }}
                        >
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
              Particular Details - {currentCustomerName}
            </Typography>
          </Box>

          <TableContainer>
            <Table sx={{ width: '100%', borderCollapse: 'collapse' }} aria-label="particular details table">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                  <TableCell
                    align="center"
                    sx={{
                      py: 1.4,
                      px: 2,
                      fontSize: '11.5px',
                      fontWeight: 700,
                      color: '#1E293B',
                      letterSpacing: '0.04em',
                      borderBottom: '1px solid #E2E8F0',
                      borderRight: '1px solid #E2E8F0',
                      width: '100px',
                    }}
                  >
                    BILL.NO
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      py: 1.4,
                      px: 2,
                      fontSize: '11.5px',
                      fontWeight: 700,
                      color: '#1E293B',
                      letterSpacing: '0.04em',
                      borderBottom: '1px solid #E2E8F0',
                      borderRight: '1px solid #E2E8F0',
                      width: '180px',
                    }}
                  >
                    COMPANY NAME
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      py: 1.4,
                      px: 2,
                      fontSize: '11.5px',
                      fontWeight: 700,
                      color: '#1E293B',
                      letterSpacing: '0.04em',
                      borderBottom: '1px solid #E2E8F0',
                      borderRight: '1px solid #E2E8F0',
                      width: '120px',
                    }}
                  >
                    DATE
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      py: 1.4,
                      px: 2,
                      fontSize: '11.5px',
                      fontWeight: 700,
                      color: '#1E293B',
                      letterSpacing: '0.04em',
                      borderBottom: '1px solid #E2E8F0',
                      borderRight: '1px solid #E2E8F0',
                      width: '130px',
                    }}
                  >
                    AMOUNT
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      py: 1.4,
                      px: 2,
                      fontSize: '11.5px',
                      fontWeight: 700,
                      color: '#1E293B',
                      letterSpacing: '0.04em',
                      borderBottom: '1px solid #E2E8F0',
                      borderRight: '1px solid #E2E8F0',
                    }}
                  >
                    TRANSPORT NAME
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      py: 1.4,
                      px: 2,
                      fontSize: '11.5px',
                      fontWeight: 700,
                      color: '#1E293B',
                      letterSpacing: '0.04em',
                      borderBottom: '1px solid #E2E8F0',
                      width: '180px',
                    }}
                  >
                    ACTION
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {particularLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <CircularProgress size={32} sx={{ color: '#0B4DB7' }} />
                    </TableCell>
                  </TableRow>
                ) : particularDetails.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6, color: '#64748B' }}>
                      No particular bills created yet for {currentCustomerName}.
                    </TableCell>
                  </TableRow>
                ) : (
                  particularDetails.map((row, index) => {
                    const isLast = index === particularDetails.length - 1;
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
                        <TableCell
                          align="center"
                          sx={{
                            py: 1.5,
                            px: 1.5,
                            fontSize: '13.5px',
                            fontWeight: 700,
                            color: '#0F172A',
                            borderBottom: isLast ? 'none' : '1px solid #EEF2F6',
                            borderRight: '1px solid #EEF2F6',
                          }}
                        >
                          {row.billNo}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            py: 1.5,
                            px: 2,
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#0F172A',
                            borderBottom: isLast ? 'none' : '1px solid #EEF2F6',
                            borderRight: '1px solid #EEF2F6',
                          }}
                        >
                          {row.companyName}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            py: 1.5,
                            px: 2,
                            fontSize: '13px',
                            fontWeight: 500,
                            color: '#475569',
                            borderBottom: isLast ? 'none' : '1px solid #EEF2F6',
                            borderRight: '1px solid #EEF2F6',
                          }}
                        >
                          {row.date}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            py: 1.5,
                            px: 2,
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#0F172A',
                            borderBottom: isLast ? 'none' : '1px solid #EEF2F6',
                            borderRight: '1px solid #EEF2F6',
                          }}
                        >
                          {row.amount || row.total}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            py: 1.5,
                            px: 2,
                            fontSize: '13px',
                            fontWeight: 500,
                            color: '#334155',
                            borderBottom: isLast ? 'none' : '1px solid #EEF2F6',
                            borderRight: '1px solid #EEF2F6',
                          }}
                        >
                          {row.transport || row.transportName || '-'}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            py: 1.5,
                            px: 1.5,
                            borderBottom: isLast ? 'none' : '1px solid #EEF2F6',
                          }}
                        >
                          <Box
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 0.6,
                            }}
                          >
                            <Tooltip title="View" arrow>
                              <IconButton
                                size="small"
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
                                onClick={handlePrint}
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
                Add Credit - {currentCustomerName}
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
                <TextField
                  fullWidth
                  size="small"
                  value={currentCustomerName}
                  slotProps={{
                    input: {
                      readOnly: true,
                      sx: {
                        fontSize: '13.5px',
                        fontWeight: 600,
                        height: '42px',
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
                <FormControl fullWidth size="small">
                  <Select
                    value={addCreditCompanyName}
                    onChange={(e) => setAddCreditCompanyName(e.target.value)}
                    IconComponent={KeyboardArrowDownRoundedIcon}
                    sx={{
                      height: '42px',
                      borderRadius: '6px',
                      backgroundColor: '#FFFFFF',
                      fontSize: '13.5px',
                      fontWeight: 500,
                      color: '#0F172A',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#CBD5E1',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#94A3B8',
                      },
                      '& .MuiSelect-icon': {
                        fontSize: '22px',
                      },
                    }}
                  >
                    {companyOptions.map((opt) => (
                      <MenuItem key={opt.id} value={opt.name} sx={{ fontSize: '13.5px', fontWeight: 500 }}>
                        {opt.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
    </Box>
  );
};
