import { useState } from 'react';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { theme } from './theme/theme';
import { Navbar, type NavTab } from './components/Navbar';
import { LoginPage } from './components/LoginPage';
import { CustomersPage } from './components/CustomersPage';
import { AllCustomersPage } from './components/AllCustomersPage';
import { AddCustomerPage } from './components/AddCustomerPage';
import { CompaniesPage } from './components/CompaniesPage';
import { AddCompanyPage } from './components/AddCompanyPage';
import { ProductsPage } from './components/ProductsPage';
import { ParticularsPage, type ParticularSubTab } from './components/ParticularsPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('dheeksha_auth_token'));
  });
  const [activeTab, setActiveTab] = useState<NavTab>('Customers');
  const [companySubView, setCompanySubView] = useState<'list' | 'add'>('list');
  const [customerSubView, setCustomerSubView] = useState<'list' | 'add'>('list');
  const [selectedCustomerName, setSelectedCustomerName] = useState<string>(() => {
    return localStorage.getItem('dheeksha_active_customer') || '';
  });
  const [particularInitialSubTab, setParticularInitialSubTab] = useState<ParticularSubTab>('Account Details');

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('dheeksha_auth_token');
    localStorage.removeItem('dheeksha_auth_user');
    setIsAuthenticated(false);
  };

  const handleSelectTab = (tab: NavTab) => {
    setActiveTab(tab);
    if (tab === 'Company') {
      setCompanySubView('list');
    }
    if (tab === 'Customers') {
      setCustomerSubView('list');
    }
  };

  const handleCustomerSelectedForParticular = (customerName: string, subTab?: ParticularSubTab) => {
    setSelectedCustomerName(customerName);
    localStorage.setItem('dheeksha_active_customer', customerName);
    setParticularInitialSubTab(subTab || 'Account Details');
    setActiveTab('Particulars');
  };

  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: '#F8F9FD',
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
        }}
      >
        <Navbar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          onNavigateCustomers={() => {
            setActiveTab('Customers');
            setCustomerSubView('list');
          }}
          onLogout={handleLogout}
        />

        <Box component="main" sx={{ flexGrow: 1, width: '100%' }}>
          {/* Particulars Tab */}
          {activeTab === 'Particulars' && (
            <ParticularsPage
              initialCustomerName={selectedCustomerName}
              initialSubTab={particularInitialSubTab}
            />
          )}

          {/* Product Tab */}
          {activeTab === 'Product' && <ProductsPage />}

          {/* Company Tab */}
          {activeTab === 'Company' && (
            <>
              {companySubView === 'add' ? (
                <AddCompanyPage
                  onCancel={() => setCompanySubView('list')}
                  onSubmitSuccess={() => setCompanySubView('list')}
                  onNavigateCompanies={() => setCompanySubView('list')}
                />
              ) : (
                <CompaniesPage onAddCompany={() => setCompanySubView('add')} />
              )}
            </>
          )}

          {/* All Customers Tab */}
          {activeTab === 'All Customers' && (
            <AllCustomersPage
              onAddNewCustomer={() => {
                setActiveTab('Customers');
                setCustomerSubView('add');
              }}
              onSelectCustomerForParticular={handleCustomerSelectedForParticular}
            />
          )}

          {/* Customers Tab */}
          {activeTab === 'Customers' && (
            <>
              {customerSubView === 'add' ? (
                <AddCustomerPage
                  onCancel={() => setCustomerSubView('list')}
                  onSubmitSuccess={() => setCustomerSubView('list')}
                />
              ) : (
                <CustomersPage
                  onAddNew={() => setCustomerSubView('add')}
                  onSelectCustomerForParticular={handleCustomerSelectedForParticular}
                />
              )}
            </>
          )}

          {/* Other Tabs */}
          {activeTab !== 'Particulars' &&
            activeTab !== 'Product' &&
            activeTab !== 'Company' &&
            activeTab !== 'All Customers' &&
            activeTab !== 'Customers' && (
              <Box sx={{ p: 4, textAlign: 'center', color: '#64748B' }}>
                {activeTab} content coming soon.
              </Box>
            )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
