import { createTheme } from '@mui/material/styles';

export const palette = {
  primary: {
    main: '#1D4ED8',
    dark: '#1E40AF',
    light: '#2563EB',
    contrastText: '#FFFFFF',
  },
  navy: '#0F172A',
  background: {
    default: '#F8FAFC',
    paper: '#FFFFFF',
  },
  text: {
    primary: '#0F172A',
    secondary: '#64748B',
    disabled: '#94A3B8',
  },
  border: '#E2E8F0',
  tableHeader: '#F1F5F9',
  success: '#16A34A',
  danger: '#DC2626',
  warning: '#F59E0B',
  inputFocus: '#2563EB',
};

export const theme = createTheme({
  palette: {
    primary: palette.primary,
    background: palette.background,
    text: palette.text,
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h5: {
      fontWeight: 700,
      color: palette.navy,
      fontSize: '1.35rem',
      letterSpacing: '-0.01em',
    },
    h6: {
      fontWeight: 700,
      color: palette.navy,
      fontSize: '1.1rem',
      letterSpacing: '-0.01em',
    },
    subtitle1: {
      fontSize: '0.875rem',
      color: palette.text.secondary,
    },
    body1: {
      fontSize: '0.875rem',
      color: palette.text.primary,
    },
    body2: {
      fontSize: '0.8125rem',
      color: palette.text.secondary,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          fontSize: '0.8125rem',
          fontWeight: 600,
          color: palette.text.primary,
          marginBottom: '6px',
          display: 'block',
          '& .MuiFormLabel-asterisk': {
            color: palette.danger,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: '#FFFFFF',
          fontSize: '0.875rem',
          color: palette.text.primary,
          transition: 'all 0.2s ease-in-out',
          '& fieldset': {
            borderColor: palette.border,
            borderWidth: '1px',
          },
          '&:hover fieldset': {
            borderColor: '#CBD5E1',
          },
          '&.Mui-focused fieldset': {
            borderColor: palette.inputFocus,
            borderWidth: '1.5px',
          },
        },
        input: {
          padding: '11px 14px',
          '&::placeholder': {
            color: palette.text.disabled,
            opacity: 1,
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          padding: '11px 14px',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 18px',
          fontSize: '0.875rem',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          backgroundColor: palette.primary.main,
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: palette.primary.dark,
          },
        },
        outlined: {
          borderColor: palette.border,
          color: palette.primary.main,
          backgroundColor: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#F8FAFC',
            borderColor: '#CBD5E1',
          },
        },
      },
    },
  },
});
