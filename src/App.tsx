import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { theme } from './theme/theme';
import TopNavbar from './components/TopNavbar';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#F8FAFC',
        }}
      >
        <TopNavbar />
        <Box component="main" sx={{ flexGrow: 1, padding: 4 }}>
          {/* Main content area */}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
