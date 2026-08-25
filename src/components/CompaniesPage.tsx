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
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { CompaniesApi } from '../services/api';

export interface Company {
  _id?: string;
  id?: string;
  slNo?: string;
  name: string;
  avatarLetter?: string;
  avatarBg?: string;
  avatarColor?: string;
  address: string;
  gstin: string;
}

interface CompaniesPageProps {
  onAddCompany?: () => void;
}

export const CompaniesPage: FC<CompaniesPageProps> = ({ onAddCompany }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await CompaniesApi.getAll();
      setCompanies(data || []);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this company?')) return;
    try {
      await CompaniesApi.delete(id);
      setCompanies((prev) => prev.filter((c) => (c._id || c.id) !== id));
    } catch (err) {
      console.error('Failed to delete company:', err);
      alert('Error deleting company');
    }
  };

  const filteredCompanies = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.gstin.toLowerCase().includes(searchTerm.toLowerCase())
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
          Company
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
              placeholder="Search companies..."
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

          {/* Add Company Button */}
          <Button
            variant="contained"
            disableElevation
            onClick={onAddCompany}
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
            Add Company
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
          <Table sx={{ width: '100%' }} aria-label="companies table">
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
                  SL.NO
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
                  COMPANY NAME
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
                    width: '100px',
                  }}
                >
                  ACTIONS
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} sx={{ color: '#0B4DB7' }} />
                  </TableCell>
                </TableRow>
              ) : filteredCompanies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, color: '#64748B' }}>
                    No companies found. Click "Add Company" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCompanies.map((company, index) => {
                  const isLast = index === filteredCompanies.length - 1;
                  const recordId = company._id || company.id || '';
                  const slDisplay = company.slNo || (index + 1).toString().padStart(2, '0');
                  const avatarInitial = company.avatarLetter || company.name.charAt(0).toUpperCase();

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
                      {/* SL.NO */}
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
                        {slDisplay}
                      </TableCell>

                      {/* Company Name */}
                      <TableCell
                        sx={{
                          py: 1.6,
                          px: 3,
                          borderBottom: isLast ? 'none' : '1px solid #F8FAFC',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              backgroundColor: company.avatarBg || '#DBEAFE',
                              color: company.avatarColor || '#0B4DB7',
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
                            }}
                          >
                            {company.name}
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
                        {company.address}
                      </TableCell>

                      {/* GSTIN */}
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
                        {company.gstin}
                      </TableCell>

                      {/* Actions */}
                      <TableCell
                        align="right"
                        sx={{
                          py: 1.6,
                          px: 3,
                          borderBottom: isLast ? 'none' : '1px solid #F8FAFC',
                        }}
                      >
                        <Tooltip title="Delete Company" arrow>
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
  );
};
