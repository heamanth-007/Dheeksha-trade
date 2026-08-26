import { useState, useEffect, type FC } from 'react';
import {
  Box,
  Typography,
  Button,
  InputBase,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ModeEditOutlineRoundedIcon from '@mui/icons-material/ModeEditOutlineRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { CustomersApi } from '../services/api';

export interface Customer {
  _id?: string;
  id?: string;
  idCode?: string;
  name: string;
  avatarLetter?: string;
  avatarBg?: string;
  avatarColor?: string;
  address: string;
  mobile: string;
  gst: string;
}

interface CustomersPageProps {
  onAddNew?: () => void;
  onSelectCustomerForParticular?: (customerName: string) => void;
}

export const CustomersPage: FC<CustomersPageProps> = ({ onAddNew, onSelectCustomerForParticular }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Customer Dialog State
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    mobile: '',
    gst: '',
    address: '',
  });
  const [editLoading, setEditLoading] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await CustomersApi.getAll();
      setCustomers(data || []);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleOpenEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setEditFormData({
      name: customer.name || '',
      mobile: customer.mobile || '',
      gst: customer.gst || '',
      address: customer.address || '',
    });
    setOpenEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingCustomer) return;
    const id = editingCustomer._id || editingCustomer.id;
    if (!id) return;

    if (!editFormData.name.trim() || !editFormData.address.trim()) {
      alert('Please fill in Customer Name and Address');
      return;
    }

    try {
      setEditLoading(true);
      await CustomersApi.update(id, {
        name: editFormData.name.trim(),
        mobile: editFormData.mobile.trim() || 'N/A',
        gst: editFormData.gst.trim() || 'N/A',
        address: editFormData.address.trim(),
        avatarLetter: editFormData.name.trim().charAt(0).toUpperCase(),
      });
      setOpenEditModal(false);
      fetchCustomers();
    } catch (err) {
      console.error('Failed to update customer:', err);
      alert('Error updating customer');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this customer? This will also delete all associated particular bills and account ledger records.')) return;
    try {
      const deletedCust = customers.find((c) => (c._id || c.id) === id);
      await CustomersApi.delete(id);
      setCustomers((prev) => prev.filter((c) => (c._id || c.id) !== id));
      if (deletedCust && localStorage.getItem('dheeksha_active_customer') === deletedCust.name) {
        localStorage.removeItem('dheeksha_active_customer');
      }
    } catch (err) {
      console.error('Failed to delete customer:', err);
      alert('Error deleting customer');
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.gst.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.mobile.includes(searchTerm)
  );

  return (
    <Box
      sx={{
        width: '100%',
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 2.5, md: 3 },
        boxSizing: 'border-box',
      }}
    >
      {/* Page Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 3.2,
        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontSize: '30px',
            fontWeight: 800,
            color: '#0F172A',
            letterSpacing: '-0.025em',
            lineHeight: 1.2,
          }}
        >
          Customers
        </Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          {/* Search Box */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#F1F3F9',
              borderRadius: '8px',
              px: 1.5,
              height: '38px',
              width: { xs: '100%', sm: '230px' },
              boxSizing: 'border-box',
              transition: 'background-color 0.2s',
              '&:hover': {
                backgroundColor: '#ECEFF6',
              },
            }}
          >
            <SearchRoundedIcon
              sx={{
                color: '#8E9AA8',
                fontSize: 19,
                mr: 1,
              }}
            />
            <InputBase
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                fontSize: '13.5px',
                fontWeight: 500,
                color: '#1E293B',
                width: '100%',
                '& input': {
                  p: 0,
                  '&::placeholder': {
                    color: '#8E9AA8',
                    opacity: 1,
                  },
                },
              }}
            />
          </Box>

          {/* Add New Customer Button */}
          <Button
            variant="contained"
            disableElevation
            onClick={onAddNew}
            startIcon={<AddRoundedIcon sx={{ fontSize: 19 }} />}
            sx={{
              backgroundColor: '#0B4DB7',
              color: '#FFFFFF',
              height: '38px',
              px: 2,
              borderRadius: '8px',
              fontSize: '13.5px',
              fontWeight: 700,
              textTransform: 'none',
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
              boxShadow: '0 1px 2px rgba(11, 77, 183, 0.15)',
              '&:hover': {
                backgroundColor: '#083B8D',
              },
            }}
          >
            Add New Customer
          </Button>
        </Box>
      </Box>

      {/* Main Table Card */}
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #EEF2F6',
          boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.03), 0 1px 2px -1px rgba(15, 23, 42, 0.03)',
          overflow: 'hidden',
        }}
      >
        <TableContainer>
          <Table sx={{ width: '100%' }} aria-label="customers table">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                <TableCell
                  sx={{
                    py: 1.6,
                    px: 3,
                    fontSize: '11.5px',
                    fontWeight: 700,
                    color: '#475569',
                    letterSpacing: '0.04em',
                    borderBottom: '1px solid #EEF2F6',
                    width: '100px',
                  }}
                >
                  ID
                </TableCell>
                <TableCell
                  sx={{
                    py: 1.6,
                    px: 3,
                    fontSize: '11.5px',
                    fontWeight: 700,
                    color: '#475569',
                    letterSpacing: '0.04em',
                    borderBottom: '1px solid #EEF2F6',
                  }}
                >
                  CUSTOMER NAME
                </TableCell>
                <TableCell
                  sx={{
                    py: 1.6,
                    px: 3,
                    fontSize: '11.5px',
                    fontWeight: 700,
                    color: '#475569',
                    letterSpacing: '0.04em',
                    borderBottom: '1px solid #EEF2F6',
                  }}
                >
                  ADDRESS
                </TableCell>
                <TableCell
                  sx={{
                    py: 1.6,
                    px: 3,
                    fontSize: '11.5px',
                    fontWeight: 700,
                    color: '#475569',
                    letterSpacing: '0.04em',
                    borderBottom: '1px solid #EEF2F6',
                  }}
                >
                  MOBILE NUMBER
                </TableCell>
                <TableCell
                  sx={{
                    py: 1.6,
                    px: 3,
                    fontSize: '11.5px',
                    fontWeight: 700,
                    color: '#475569',
                    letterSpacing: '0.04em',
                    borderBottom: '1px solid #EEF2F6',
                  }}
                >
                  GSTIN
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    py: 1.6,
                    px: 3,
                    fontSize: '11.5px',
                    fontWeight: 700,
                    color: '#475569',
                    letterSpacing: '0.04em',
                    borderBottom: '1px solid #EEF2F6',
                    width: '120px',
                  }}
                >
                  ACTIONS
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} sx={{ color: '#0B4DB7' }} />
                  </TableCell>
                </TableRow>
              ) : filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, color: '#64748B' }}>
                    No customers found. Click "Add New Customer" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer, index) => {
                  const isLast = index === filteredCustomers.length - 1;
                  const recordId = customer._id || customer.id || '';
                  const idDisplay = customer.idCode || `#${(index + 1).toString().padStart(4, '0')}`;
                  const avatarInitial = customer.avatarLetter || customer.name.charAt(0).toUpperCase();

                  return (
                    <TableRow
                      key={recordId || index}
                      sx={{
                        transition: 'background-color 0.15s ease',
                        '&:hover': {
                          backgroundColor: '#F8FAFC',
                        },
                      }}
                    >
                      {/* ID */}
                      <TableCell
                        sx={{
                          py: 1.6,
                          px: 3,
                          fontSize: '13.5px',
                          color: '#475569',
                          fontWeight: 600,
                          borderBottom: isLast ? 'none' : '1px solid #F8FAFC',
                        }}
                      >
                        {idDisplay}
                      </TableCell>

                      {/* Customer Name with Avatar */}
                      <TableCell
                        sx={{
                          py: 1.6,
                          px: 3,
                          borderBottom: isLast ? 'none' : '1px solid #F8FAFC',
                        }}
                      >
                        <Box
                          onClick={() => onSelectCustomerForParticular?.(customer.name)}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            cursor: onSelectCustomerForParticular ? 'pointer' : 'default',
                          }}
                        >
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              backgroundColor: customer.avatarBg || '#DBEAFE',
                              color: customer.avatarColor || '#0B4DB7',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '13px',
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {avatarInitial}
                          </Box>
                          <Typography
                            sx={{
                              fontSize: '14px',
                              fontWeight: 700,
                              color: '#0F172A',
                              letterSpacing: '-0.01em',
                              '&:hover': onSelectCustomerForParticular
                                ? { color: '#0B4DB7', textDecoration: 'underline' }
                                : {},
                            }}
                          >
                            {customer.name}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Address */}
                      <TableCell
                        sx={{
                          py: 1.6,
                          px: 3,
                          fontSize: '13.5px',
                          color: '#334155',
                          fontWeight: 500,
                          borderBottom: isLast ? 'none' : '1px solid #F8FAFC',
                        }}
                      >
                        {customer.address}
                      </TableCell>

                      {/* Mobile */}
                      <TableCell
                        sx={{
                          py: 1.6,
                          px: 3,
                          fontSize: '13.5px',
                          color: '#334155',
                          fontWeight: 500,
                          borderBottom: isLast ? 'none' : '1px solid #F8FAFC',
                        }}
                      >
                        {customer.mobile}
                      </TableCell>

                      {/* GST */}
                      <TableCell
                        sx={{
                          py: 1.6,
                          px: 3,
                          fontSize: '13.5px',
                          color: '#334155',
                          fontWeight: 600,
                          borderBottom: isLast ? 'none' : '1px solid #F8FAFC',
                        }}
                      >
                        {customer.gst}
                      </TableCell>

                      {/* Actions (Edit & Delete) */}
                      <TableCell
                        align="right"
                        sx={{
                          py: 1.6,
                          px: 3,
                          borderBottom: isLast ? 'none' : '1px solid #F8FAFC',
                        }}
                      >
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.8 }}>
                          {/* Edit Customer Button */}
                          <Tooltip title="Edit Customer" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEdit(customer)}
                              sx={{
                                color: '#64748B',
                                backgroundColor: '#F8FAFC',
                                border: '1px solid #E2E8F0',
                                borderRadius: '6px',
                                p: 0.7,
                                transition: 'all 0.15s ease',
                                '&:hover': {
                                  color: '#0B4DB7',
                                  backgroundColor: '#EFF6FF',
                                  borderColor: '#BFDBFE',
                                },
                              }}
                            >
                              <ModeEditOutlineRoundedIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>

                          {/* Delete Customer Button */}
                          <Tooltip title="Delete Customer" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(recordId)}
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

      {/* Edit Customer Dialog Modal */}
      <Dialog
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '12px',
              p: 1,
            },
          },
        }}
      >
        <DialogTitle sx={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', pb: 1 }}>
          Edit Customer Details
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#475569', mb: 0.5 }}>
                Full Name / Business Name *
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                slotProps={{
                  input: { sx: { fontSize: '13.5px', fontWeight: 500, borderRadius: '6px' } },
                }}
              />
            </Box>

            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#475569', mb: 0.5 }}>
                Mobile Number
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={editFormData.mobile}
                onChange={(e) => setEditFormData({ ...editFormData, mobile: e.target.value })}
                slotProps={{
                  input: { sx: { fontSize: '13.5px', fontWeight: 500, borderRadius: '6px' } },
                }}
              />
            </Box>

            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#475569', mb: 0.5 }}>
                GSTIN
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={editFormData.gst}
                onChange={(e) => setEditFormData({ ...editFormData, gst: e.target.value })}
                slotProps={{
                  input: { sx: { fontSize: '13.5px', fontWeight: 500, borderRadius: '6px' } },
                }}
              />
            </Box>

            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#475569', mb: 0.5 }}>
                Address *
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={editFormData.address}
                onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                slotProps={{
                  input: { sx: { fontSize: '13.5px', fontWeight: 500, borderRadius: '6px' } },
                }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button
            onClick={() => setOpenEditModal(false)}
            sx={{ color: '#64748B', fontWeight: 600, textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disableElevation
            onClick={handleSaveEdit}
            disabled={editLoading}
            sx={{
              backgroundColor: '#0B4DB7',
              color: '#FFFFFF',
              fontWeight: 700,
              textTransform: 'none',
              px: 2.5,
              borderRadius: '6px',
              '&:hover': { backgroundColor: '#083B8D' },
            }}
          >
            {editLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
