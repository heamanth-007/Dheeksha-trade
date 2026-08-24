import { useState, type FC, type ChangeEvent } from 'react';
import {
  Box,
  Typography,
  Button,
  InputBase,
  Paper,
} from '@mui/material';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';

interface AddCustomerPageProps {
  onCancel?: () => void;
  onSubmitSuccess?: () => void;
}

export const AddCustomerPage: FC<AddCustomerPageProps> = ({
  onCancel,
  onSubmitSuccess,
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    gstin: '',
    billingAddress: '',
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
      {/* Page Title & Subtitle */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h1"
          sx={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#0F172A',
            letterSpacing: '-0.025em',
            lineHeight: 1.2,
            mb: 0.8,
          }}
        >
          Add New Customer
        </Typography>
        <Typography
          sx={{
            fontSize: '14px',
            color: '#64748B',
            fontWeight: 400,
            letterSpacing: '-0.01em',
          }}
        >
          Enter the details below to register a new client profile into the Dheeksha platform.
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
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2.5,
            }}
          >
            {/* Full Name Field */}
            <Box>
              <Typography
                component="label"
                sx={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#334155',
                  mb: 0.9,
                  letterSpacing: '-0.01em',
                }}
              >
                Full Name
              </Typography>
              <Box
                sx={{
                  backgroundColor: '#F1F4FA',
                  borderRadius: '8px',
                  px: 2,
                  height: '46px',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'background-color 0.2s, box-shadow 0.2s',
                  '&:focus-within': {
                    backgroundColor: '#EDF1F8',
                    boxShadow: '0 0 0 2px rgba(11, 77, 183, 0.15)',
                  },
                }}
              >
                <InputBase
                  fullWidth
                  placeholder="e.g., Aravind Kumar"
                  value={formData.fullName}
                  onChange={handleChange('fullName')}
                  sx={{
                    fontSize: '14px',
                    color: '#1E293B',
                    '& input': {
                      p: 0,
                      '&::placeholder': {
                        color: '#94A3B8',
                        opacity: 1,
                      },
                    },
                  }}
                />
              </Box>
            </Box>

            {/* Mobile Number Field */}
            <Box>
              <Typography
                component="label"
                sx={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#334155',
                  mb: 0.9,
                  letterSpacing: '-0.01em',
                }}
              >
                Mobile Number
              </Typography>
              <Box
                sx={{
                  backgroundColor: '#F1F4FA',
                  borderRadius: '8px',
                  px: 2,
                  height: '46px',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'background-color 0.2s, box-shadow 0.2s',
                  '&:focus-within': {
                    backgroundColor: '#EDF1F8',
                    boxShadow: '0 0 0 2px rgba(11, 77, 183, 0.15)',
                  },
                }}
              >
                <InputBase
                  fullWidth
                  placeholder="+91 XXXXX XXXXX"
                  value={formData.mobileNumber}
                  onChange={handleChange('mobileNumber')}
                  sx={{
                    fontSize: '14px',
                    color: '#1E293B',
                    '& input': {
                      p: 0,
                      '&::placeholder': {
                        color: '#94A3B8',
                        opacity: 1,
                      },
                    },
                  }}
                />
              </Box>
            </Box>

            {/* GSTIN (Optional) Field */}
            <Box sx={{ gridColumn: { xs: '1 / -1', sm: '1 / -1' } }}>
              <Typography
                component="label"
                sx={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#334155',
                  mb: 0.9,
                  letterSpacing: '-0.01em',
                }}
              >
                GSTIN (Optional)
              </Typography>
              <Box
                sx={{
                  backgroundColor: '#F1F4FA',
                  borderRadius: '8px',
                  px: 2,
                  height: '46px',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'background-color 0.2s, box-shadow 0.2s',
                  '&:focus-within': {
                    backgroundColor: '#EDF1F8',
                    boxShadow: '0 0 0 2px rgba(11, 77, 183, 0.15)',
                  },
                }}
              >
                <InputBase
                  fullWidth
                  placeholder="ENTER 15-DIGIT GST NUMBER"
                  value={formData.gstin}
                  onChange={handleChange('gstin')}
                  sx={{
                    fontSize: '13.5px',
                    color: '#1E293B',
                    '& input': {
                      p: 0,
                      textTransform: 'uppercase',
                      '&::placeholder': {
                        color: '#94A3B8',
                        opacity: 1,
                      },
                    },
                  }}
                />
              </Box>
            </Box>

            {/* Billing Address Field */}
            <Box sx={{ gridColumn: { xs: '1 / -1', sm: '1 / -1' } }}>
              <Typography
                component="label"
                sx={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#334155',
                  mb: 0.9,
                  letterSpacing: '-0.01em',
                }}
              >
                Billing Address
              </Typography>
              <Box
                sx={{
                  backgroundColor: '#F1F4FA',
                  borderRadius: '8px',
                  px: 2,
                  py: 1.5,
                  minHeight: '90px',
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
                  rows={3}
                  placeholder="Complete address with pincode..."
                  value={formData.billingAddress}
                  onChange={handleChange('billingAddress')}
                  sx={{
                    fontSize: '14px',
                    color: '#1E293B',
                    '& textarea': {
                      p: 0,
                      resize: 'none',
                      '&::placeholder': {
                        color: '#94A3B8',
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
              variant="contained"
              disableElevation
              onClick={onCancel}
              sx={{
                backgroundColor: '#E2E8F0',
                color: '#475569',
                height: '40px',
                px: 2.8,
                borderRadius: '8px',
                fontSize: '13.5px',
                fontWeight: 600,
                textTransform: 'none',
                letterSpacing: '-0.01em',
                '&:hover': {
                  backgroundColor: '#CBD5E1',
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
              startIcon={<AddCircleOutlineRoundedIcon sx={{ fontSize: '18px !important' }} />}
              sx={{
                backgroundColor: '#0B4DB7',
                color: '#FFFFFF',
                height: '40px',
                px: 2.5,
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

export default AddCustomerPage;
