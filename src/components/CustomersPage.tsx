import { useState, type FC } from 'react';
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
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';

interface Customer {
  id: string;
  name: string;
  avatarLetter: string;
  avatarBg: string;
  avatarColor?: string;
  address: string;
  mobile: string;
  gst: string;
}

const CUSTOMERS_DATA: Customer[] = [
  {
    id: '#1042',
    name: 'Acme Corp',
    avatarLetter: 'A',
    avatarBg: '#D4DEFD',
    avatarColor: '#1E293B',
    address: '123 Industrial Pkwy, Bldg 4',
    mobile: '+1 (555) 019-2834',
    gst: '29ABCDE1234F1Z5',
  },
  {
    id: '#1043',
    name: 'Global Logistics Inc',
    avatarLetter: 'G',
    avatarBg: '#BADAF9',
    avatarColor: '#1E293B',
    address: '450 Portside Ave, Ste 200',
    mobile: '+1 (555) 837-1029',
    gst: '29XYZAB5678C1Z9',
  },
  {
    id: '#1044',
    name: 'Summit Supplies',
    avatarLetter: 'S',
    avatarBg: '#F8C4B4',
    avatarColor: '#1E293B',
    address: '88 Ridge Rd, Warehouse B',
    mobile: '+1 (555) 443-9912',
    gst: '29LMNOP9012Q1Z3',
  },
];

interface CustomersPageProps {
  onAddNew?: () => void;
}

export const CustomersPage: FC<CustomersPageProps> = ({ onAddNew }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activePage, setActivePage] = useState(1);

  return (
    <Box
      sx={{
        width: '100%',
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 2.5, md: 3 },
        boxSizing: 'border-box',
      }}
    >
      {/* Page Header (Title & Controls) */}
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
            fontWeight: 700,
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

          {/* Add New Button */}
          <Button
            variant="contained"
            disableElevation
            onClick={onAddNew}
            startIcon={<AddRoundedIcon sx={{ fontSize: '18px !important' }} />}
            sx={{
              backgroundColor: '#0B4DB7',
              color: '#FFFFFF',
              height: '38px',
              px: 2,
              borderRadius: '8px',
              fontSize: '13.5px',
              fontWeight: 600,
              textTransform: 'none',
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
              '&:hover': {
                backgroundColor: '#09409B',
              },
            }}
          >
            Add New
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
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 780 }} aria-label="customers table">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                <TableCell
                  sx={{
                    py: 1.4,
                    px: 3,
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#8E9AA8',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid #F1F5F9',
                    width: '80px',
                  }}
                >
                  ID
                </TableCell>
                <TableCell
                  sx={{
                    py: 1.4,
                    px: 2,
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#8E9AA8',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid #F1F5F9',
                    minWidth: '220px',
                  }}
                >
                  CUSTOMER NAME
                </TableCell>
                <TableCell
                  sx={{
                    py: 1.4,
                    px: 2,
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#8E9AA8',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid #F1F5F9',
                    minWidth: '240px',
                  }}
                >
                  ADDRESS
                </TableCell>
                <TableCell
                  sx={{
                    py: 1.4,
                    px: 2,
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#8E9AA8',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid #F1F5F9',
                    minWidth: '160px',
                  }}
                >
                  MOBILE
                </TableCell>
                <TableCell
                  sx={{
                    py: 1.4,
                    px: 2,
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#8E9AA8',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid #F1F5F9',
                    minWidth: '180px',
                  }}
                >
                  GST
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    py: 1.4,
                    px: 3,
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#8E9AA8',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid #F1F5F9',
                    width: '80px',
                  }}
                >
                  ACTIONS
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {CUSTOMERS_DATA.map((customer) => (
                <TableRow
                  key={customer.id}
                  sx={{
                    transition: 'background-color 0.15s ease',
                    '&:hover': {
                      backgroundColor: '#FAFAFC',
                    },
                    '&:last-child td': {
                      borderBottom: 0,
                    },
                  }}
                >
                  {/* ID */}
                  <TableCell
                    sx={{
                      py: 2.2,
                      px: 3,
                      fontSize: '13.5px',
                      fontWeight: 500,
                      color: '#64748B',
                      borderBottom: '1px solid #F8FAFC',
                    }}
                  >
                    {customer.id}
                  </TableCell>

                  {/* Customer Name with Avatar */}
                  <TableCell
                    sx={{
                      py: 2.2,
                      px: 2,
                      borderBottom: '1px solid #F8FAFC',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: '9px',
                          backgroundColor: customer.avatarBg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: '15px',
                            color: customer.avatarColor || '#1E293B',
                            lineHeight: 1,
                          }}
                        >
                          {customer.avatarLetter}
                        </Typography>
                      </Box>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: '14px',
                          color: '#1E293B',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {customer.name}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Address */}
                  <TableCell
                    sx={{
                      py: 2.2,
                      px: 2,
                      fontSize: '13.5px',
                      color: '#475569',
                      fontWeight: 400,
                      borderBottom: '1px solid #F8FAFC',
                    }}
                  >
                    {customer.address}
                  </TableCell>

                  {/* Mobile */}
                  <TableCell
                    sx={{
                      py: 2.2,
                      px: 2,
                      fontSize: '13.5px',
                      color: '#1E293B',
                      fontWeight: 500,
                      borderBottom: '1px solid #F8FAFC',
                    }}
                  >
                    {customer.mobile}
                  </TableCell>

                  {/* GST */}
                  <TableCell
                    sx={{
                      py: 2.2,
                      px: 2,
                      fontSize: '13.5px',
                      color: '#1E293B',
                      fontWeight: 500,
                      borderBottom: '1px solid #F8FAFC',
                    }}
                  >
                    {customer.gst}
                  </TableCell>

                  {/* Actions */}
                  <TableCell
                    align="right"
                    sx={{
                      py: 2.2,
                      px: 3,
                      borderBottom: '1px solid #F8FAFC',
                    }}
                  >
                    {/* Empty as in the Figma reference */}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Table Footer / Pagination */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 3,
            py: 2,
            gap: 2,
            borderTop: '1px solid #F8FAFC',
          }}
        >
          {/* Entries Info */}
          <Typography
            sx={{
              fontSize: '13px',
              color: '#8E9AA8',
              fontWeight: 400,
            }}
          >
            Showing 1 to 3 of 124 entries
          </Typography>

          {/* Pagination Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconButton
              size="small"
              disabled={activePage === 1}
              onClick={() => setActivePage((p) => Math.max(1, p - 1))}
              sx={{
                p: 0.5,
                color: '#8E9AA8',
                '&.Mui-disabled': { color: '#CBD5E1' },
              }}
            >
              <ChevronLeftRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>

            {/* Page 1 (Active) */}
            <Box
              onClick={() => setActivePage(1)}
              sx={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: activePage === 1 ? '#0B4DB7' : 'transparent',
                color: activePage === 1 ? '#FFFFFF' : '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: activePage === 1 ? 700 : 500,
                cursor: 'pointer',
                transition: 'background-color 0.15s',
                '&:hover': {
                  backgroundColor: activePage === 1 ? '#0B4DB7' : '#F1F5F9',
                },
              }}
            >
              1
            </Box>

            {/* Page 2 */}
            <Box
              onClick={() => setActivePage(2)}
              sx={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: activePage === 2 ? '#0B4DB7' : 'transparent',
                color: activePage === 2 ? '#FFFFFF' : '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: activePage === 2 ? 700 : 500,
                cursor: 'pointer',
                transition: 'background-color 0.15s',
                '&:hover': {
                  backgroundColor: activePage === 2 ? '#0B4DB7' : '#F1F5F9',
                },
              }}
            >
              2
            </Box>

            {/* Page 3 */}
            <Box
              onClick={() => setActivePage(3)}
              sx={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: activePage === 3 ? '#0B4DB7' : 'transparent',
                color: activePage === 3 ? '#FFFFFF' : '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: activePage === 3 ? 700 : 500,
                cursor: 'pointer',
                transition: 'background-color 0.15s',
                '&:hover': {
                  backgroundColor: activePage === 3 ? '#0B4DB7' : '#F1F5F9',
                },
              }}
            >
              3
            </Box>

            {/* Ellipsis */}
            <Typography
              sx={{
                fontSize: '13px',
                color: '#8E9AA8',
                px: 0.5,
                userSelect: 'none',
              }}
            >
              ...
            </Typography>

            {/* Page 12 */}
            <Box
              onClick={() => setActivePage(12)}
              sx={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: activePage === 12 ? '#0B4DB7' : 'transparent',
                color: activePage === 12 ? '#FFFFFF' : '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: activePage === 12 ? 700 : 500,
                cursor: 'pointer',
                transition: 'background-color 0.15s',
                '&:hover': {
                  backgroundColor: activePage === 12 ? '#0B4DB7' : '#F1F5F9',
                },
              }}
            >
              12
            </Box>

            <IconButton
              size="small"
              onClick={() => setActivePage((p) => Math.min(12, p + 1))}
              sx={{
                p: 0.5,
                color: '#334155',
                '&:hover': { backgroundColor: '#F1F5F9' },
              }}
            >
              <ChevronRightRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default CustomersPage;
