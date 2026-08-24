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

interface CompanyItem {
  slNo: string;
  name: string;
  avatarLetter: string;
  avatarBg: string;
  avatarColor: string;
  address: string;
  gstin: string;
}

const COMPANIES_DATA: CompanyItem[] = [
  {
    slNo: '01',
    name: 'Acme Logistics Pvt Ltd',
    avatarLetter: 'A',
    avatarBg: '#DBEAFE',
    avatarColor: '#0B4DB7',
    address: '124 Industrial Area, Phase 1, Mumbai, Maharashtra 400001',
    gstin: '27AADCA2230M1Z2',
  },
  {
    slNo: '02',
    name: 'Global Traders LLC',
    avatarLetter: 'G',
    avatarBg: '#DBEAFE',
    avatarColor: '#0B4DB7',
    address: 'Unit 4B, Tech Park, Whitefield, Bangalore, Karnataka 560066',
    gstin: '29BBBPG1234N1Z5',
  },
  {
    slNo: '03',
    name: 'Nexus Manufacturing',
    avatarLetter: 'N',
    avatarBg: '#DBEAFE',
    avatarColor: '#0B4DB7',
    address: 'Plot 88, Sector 15, Gurgaon, Haryana 122015',
    gstin: '06AAACN4321P2Z9',
  },
  {
    slNo: '04',
    name: 'Stellar Enterprises',
    avatarLetter: 'S',
    avatarBg: '#DBEAFE',
    avatarColor: '#0B4DB7',
    address: '45/A, Anna Salai, Chennai, Tamil Nadu 600002',
    gstin: '33AADCS5678Q1Z4',
  },
];

interface CompaniesPageProps {
  onAddCompany?: () => void;
}

export const CompaniesPage: FC<CompaniesPageProps> = ({ onAddCompany }) => {
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
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h1"
            sx={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#0F172A',
              letterSpacing: '-0.025em',
              lineHeight: 1.2,
            }}
          >
            Registered Companies
          </Typography>
          <Typography
            sx={{
              fontSize: '14px',
              color: '#64748B',
              fontWeight: 400,
              mt: 0.5,
              letterSpacing: '-0.01em',
            }}
          >
            Manage your business directory and tax credentials.
          </Typography>
        </Box>

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
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 800 }} aria-label="companies table">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                <TableCell
                  sx={{
                    py: 1.4,
                    px: 3,
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#64748B',
                    letterSpacing: '-0.01em',
                    borderBottom: '1px solid #F1F5F9',
                    width: '70px',
                  }}
                >
                  Sl.No
                </TableCell>
                <TableCell
                  sx={{
                    py: 1.4,
                    px: 2,
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#64748B',
                    letterSpacing: '-0.01em',
                    borderBottom: '1px solid #F1F5F9',
                    minWidth: '240px',
                  }}
                >
                  Company Name
                </TableCell>
                <TableCell
                  sx={{
                    py: 1.4,
                    px: 2,
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#64748B',
                    letterSpacing: '-0.01em',
                    borderBottom: '1px solid #F1F5F9',
                    minWidth: '380px',
                  }}
                >
                  Address
                </TableCell>
                <TableCell
                  sx={{
                    py: 1.4,
                    px: 2,
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#64748B',
                    letterSpacing: '-0.01em',
                    borderBottom: '1px solid #F1F5F9',
                    minWidth: '180px',
                  }}
                >
                  GSTIN
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    py: 1.4,
                    px: 3,
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#64748B',
                    letterSpacing: '-0.01em',
                    borderBottom: '1px solid #F1F5F9',
                    width: '80px',
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {COMPANIES_DATA.map((company) => (
                <TableRow
                  key={company.slNo}
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
                  {/* Sl.No */}
                  <TableCell
                    sx={{
                      py: 2.2,
                      px: 3,
                      fontSize: '13.5px',
                      fontWeight: 500,
                      color: '#8E9AA8',
                      borderBottom: '1px solid #F8FAFC',
                    }}
                  >
                    {company.slNo}
                  </TableCell>

                  {/* Company Name with Avatar */}
                  <TableCell
                    sx={{
                      py: 2.2,
                      px: 2,
                      borderBottom: '1px solid #F8FAFC',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '8px',
                          backgroundColor: company.avatarBg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: '14px',
                            color: company.avatarColor,
                            lineHeight: 1,
                          }}
                        >
                          {company.avatarLetter}
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
                        {company.name}
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
                    {company.address}
                  </TableCell>

                  {/* GSTIN */}
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
                    {company.gstin}
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
                    {/* Empty cell as in the Figma reference */}
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
            Showing 1 to 4 of 1,248 entries
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

            <IconButton
              size="small"
              onClick={() => setActivePage((p) => Math.min(3, p + 1))}
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

export default CompaniesPage;
