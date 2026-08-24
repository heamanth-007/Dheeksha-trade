import { createTheme } from '@mui/material/styles';

export const palette = {
  primary: {
    main: '#0B4DB7',
    light: '#E6EFFD',
    dark: '#09409B',
    contrastText: '#ffffff',
  },
  navy: '#0F172A',
  background: {
    default: '#F7F8FC',
    paper: '#FFFFFF',
  },
  text: {
    primary: '#1E293B',
    secondary: '#64748B',
    disabled: '#94A3B8',
  },
  border: '#E2E8F0',
  tableHeader: '#F1F5F9',
  success: '#16A34A',
  danger: '#DC2626',
  warning: '#F59E0B',
  inputFocus: '#0B4DB7',
};

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: palette.primary,
    background: palette.background,
    text: palette.text,
    divider: '#EDF2F7',
  },
  typography: {
    fontFamily: '"Inter", "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontSize: '28px',
      fontWeight: 700,
      color: '#0F172A',
      letterSpacing: '-0.02em',
    },
    subtitle1: {
      fontSize: '14px',
      fontWeight: 600,
    },
    body1: {
      fontSize: '14px',
    },
    body2: {
      fontSize: '13px',
      color: '#64748B',
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
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: '8px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
  },
});
