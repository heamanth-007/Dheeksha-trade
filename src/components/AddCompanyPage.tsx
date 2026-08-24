import { useState, type FC, type ChangeEvent } from 'react';
import {
  Box,
  Typography,
  Button,
  InputBase,
  Paper,
} from '@mui/material';
import DomainOutlinedIcon from '@mui/icons-material/DomainOutlined';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

interface AddCompanyPageProps {
  onCancel?: () => void;
  onSubmitSuccess?: () => void;
  onNavigateCompanies?: () => void;
}

export const AddCompanyPage: FC<AddCompanyPageProps> = ({
  onCancel,
  onSubmitSuccess,
  onNavigateCompanies,
}) => {
  const [formData, setFormData] = useState({
    companyName: '',
    gstNumber: '',
    registeredAddress: '',
  });

  const handleChange = (field: string) => (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSubmit = () => {
    if (onSubmitSuccess) {
      onSubmitSuccess();
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 2.5, md: 3 },
        boxSizing: 'border-box',
      }}
    >
      {/* Breadcrumbs Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 2.5,
        }}
      >
        <DomainOutlinedIcon sx={{ fontSize: 18, color: '#64748B' }} />
        <Typography
          onClick={onNavigateCompanies}
          sx={{
            fontSize: '13.5px',
            fontWeight: 500,
            color: '#64748B',
            cursor: 'pointer',
            '&:hover': { color: '#0B4DB7' },
          }}
        >
          Companies
        </Typography>
        <Typography
          sx={{
            fontSize: '13.5px',
            color: '#94A3B8',
            userSelect: 'none',
          }}
        >
          ›
        </Typography>
        <Typography
          sx={{
            fontSize: '13.5px',
            fontWeight: 600,
            color: '#0B4DB7',
          }}
        >
          Add New Company
        </Typography>
      </Box>

      {/* Main Form Card */}
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #EEF2F6',
          boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.03), 0 1px 2px -1px rgba(15, 23, 42, 0.03)',
          p: { xs: 2.5, sm: 3.5, md: 4 },
          boxSizing: 'border-box',
        }}
      >
        <Box component="form" noValidate autoComplete="off">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Legal Company Name */}
            <Box>
              <Typography
                component="label"
                sx={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#1E293B',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  mb: 1,
                }}
              >
                LEGAL COMPANY NAME *
              </Typography>
              <Box
                sx={{
                  backgroundColor: '#F1F4FA',
                  borderRadius: '8px',
                  px: 2,
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'background-color 0.2s, box-shadow 0.2s',
                  '&:focus-within': {
                    backgroundColor: '#EDF1F8',
                    boxShadow: '0 0 0 2px rgba(11, 77, 183, 0.15)',
                  },
                }}
              >
                <InputBase
                  fullWidth
                  placeholder="e.g. Acme Corporation Pvt. Ltd."
                  value={formData.companyName}
                  onChange={handleChange('companyName')}
                  sx={{
                    fontSize: '14px',
                    color: '#1E293B',
                    '& input': {
                      p: 0,
                      '&::placeholder': {
                        color: '#8E9AA8',
                        opacity: 1,
                      },
                    },
                  }}
                />
                <DomainOutlinedIcon
                  sx={{
                    color: '#8E9AA8',
                    fontSize: 20,
                    ml: 1.5,
                    flexShrink: 0,
                  }}
                />
              </Box>
            </Box>

            {/* GST Number */}
            <Box>
              <Typography
                component="label"
                sx={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#1E293B',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  mb: 1,
                }}
              >
                GST NUMBER *
              </Typography>
              <Box
                sx={{
                  backgroundColor: '#F1F4FA',
                  borderRadius: '8px',
                  px: 2,
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'background-color 0.2s, box-shadow 0.2s',
                  '&:focus-within': {
                    backgroundColor: '#EDF1F8',
                    boxShadow: '0 0 0 2px rgba(11, 77, 183, 0.15)',
                  },
                }}
              >
                <InputBase
                  fullWidth
                  placeholder="ENTER 15-DIGIT GSTIN"
                  value={formData.gstNumber}
                  onChange={handleChange('gstNumber')}
                  sx={{
                    fontSize: '13.5px',
                    color: '#1E293B',
                    '& input': {
                      p: 0,
                      textTransform: 'uppercase',
                      '&::placeholder': {
                        color: '#8E9AA8',
                        opacity: 1,
                      },
                    },
                  }}
                />
                <ReceiptLongRoundedIcon
                  sx={{
                    color: '#8E9AA8',
                    fontSize: 20,
                    ml: 1.5,
                    flexShrink: 0,
                  }}
                />
              </Box>
            </Box>

            {/* Registered Address */}
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <Typography
                  component="label"
                  sx={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#1E293B',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                >
                  REGISTERED ADDRESS *
                </Typography>
                <Typography
                  sx={{
                    fontSize: '12px',
                    fontWeight: 500,
                    color: '#8E9AA8',
                  }}
                >
                  Max 250 chars
                </Typography>
              </Box>
              <Box
                sx={{
                  backgroundColor: '#F1F4FA',
                  borderRadius: '8px',
                  p: 2,
                  minHeight: '140px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  transition: 'background-color 0.2s, box-shadow 0.2s',
                  '&:focus-within': {
                    backgroundColor: '#EDF1F8',
                    boxShadow: '0 0 0 2px rgba(11, 77, 183, 0.15)',
                  },
                }}
              >
                <InputBase
                  fullWidth
                  multiline
                  rows={5}
                  inputProps={{ maxLength: 250 }}
                  placeholder="Enter complete registered office address including state and pincode..."
                  value={formData.registeredAddress}
                  onChange={handleChange('registeredAddress')}
                  sx={{
                    fontSize: '14px',
                    color: '#1E293B',
                    '& textarea': {
                      p: 0,
                      resize: 'none',
                      '&::placeholder': {
                        color: '#8E9AA8',
                        opacity: 1,
                      },
                    },
                  }}
                />
              </Box>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: 1.5,
              mt: 3.5,
            }}
          >
            {/* Cancel Button */}
            <Button
              variant="outlined"
              onClick={onCancel}
              sx={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E2E8F0',
                color: '#334155',
                height: '40px',
                px: 3,
                borderRadius: '8px',
                fontSize: '13.5px',
                fontWeight: 600,
                textTransform: 'none',
                letterSpacing: '-0.01em',
                '&:hover': {
                  backgroundColor: '#F8FAFC',
                  borderColor: '#CBD5E1',
                },
              }}
            >
              Cancel
            </Button>

            {/* Click to Create Button */}
            <Button
              variant="contained"
              disableElevation
              onClick={handleSubmit}
              endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: '18px !important' }} />}
              sx={{
                backgroundColor: '#0B4DB7',
                color: '#FFFFFF',
                height: '40px',
                px: 2.8,
                borderRadius: '8px',
                fontSize: '13.5px',
                fontWeight: 600,
                textTransform: 'none',
                letterSpacing: '-0.01em',
                '&:hover': {
                  backgroundColor: '#09409B',
                },
              }}
            >
              Click to Create
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default AddCompanyPage;
