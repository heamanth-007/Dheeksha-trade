import { Box, Typography, IconButton } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

interface NavItemProps {
  label: string;
  active?: boolean;
}

const NavItem = ({ label, active }: NavItemProps) => (
  <Box
    sx={{
      position: 'relative',
      paddingY: '18px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
    }}
  >
    <Typography
      sx={{
        fontSize: '14px',
        fontWeight: active ? 700 : 600,
        color: active ? '#1D4ED8' : '#64748B',
        transition: 'color 0.2s ease',
        '&:hover': {
          color: active ? '#1D4ED8' : '#0F172A',
        },
      }}
    >
      {label}
    </Typography>
    {active && (
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '2.5px',
          backgroundColor: '#1D4ED8',
          borderRadius: '2px 2px 0 0',
        }}
      />
    )}
  </Box>
);

export const TopNavbar = () => {
  return (
    <Box
      component="header"
      sx={{
        width: '100%',
        height: '64px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingX: { xs: 2, sm: 4, md: 6 },
        position: 'sticky',
        top: 0,
        zIndex: 1100,
      }}
    >
      {/* Brand / Logo */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            backgroundColor: '#0F172A',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <Typography
            sx={{
              color: '#FFFFFF',
              fontWeight: 900,
              fontSize: '18px',
              fontFamily: 'Inter, sans-serif',
              lineHeight: 1,
            }}
          >
            D
          </Typography>
        </Box>
        <Typography
          sx={{
            fontSize: '18px',
            fontWeight: 700,
            color: '#1D4ED8',
            letterSpacing: '-0.02em',
          }}
        >
          Dheeksha
        </Typography>
      </Box>

      {/* Navigation Links */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <NavItem label="Customers" active />
        <NavItem label="Company" />
        <NavItem label="Product" />
        <NavItem label="Particulars" />
      </Box>

      {/* Profile Icon */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton
          sx={{
            width: 36,
            height: 36,
            backgroundColor: '#1D4ED8',
            color: '#FFFFFF',
            padding: 0,
            '&:hover': {
              backgroundColor: '#1E40AF',
            },
          }}
        >
          <PersonIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default TopNavbar;
