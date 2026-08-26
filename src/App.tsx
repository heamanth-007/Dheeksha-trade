import { useState } from 'react';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { theme } from './theme/theme';
import { Navbar, type NavTab } from './components/Navbar';
import { CustomersPage } from './components/CustomersPage';
import { AddCustomerPage } from './components/AddCustomerPage';
import { CompaniesPage } from './components/CompaniesPage';
import { AddCompanyPage } from './components/AddCompanyPage';
import { ProductsPage } from './components/ProductsPage';
import { ParticularsPage } from './components/ParticularsPage';

function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('Product');
  const [companySubView, setCompanySubView] = useState<'list' | 'add'>('list');
  const [customerSubView, setCustomerSubView] = useState<'list' | 'add'>('list');
  const [selectedCustomerName, setSelectedCustomerName] = useState<string>(() => {
    return localStorage.getItem('dheeksha_active_customer') || '';
  });

  const handleSelectTab = (tab: NavTab) => {
    setActiveTab(tab);
    if (tab === 'Company') {
      setCompanySubView('list');
    }
    if (tab === 'Customers') {
      setCustomerSubView('list');
    }
  };

  const handleCustomerSelectedForParticular = (customerName: string) => {
    setSelectedCustomerName(customerName);
    localStorage.setItem('dheeksha_active_customer', customerName);
    setActiveTab('Particulars');
  };

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
        />

        <Box component="main" sx={{ flexGrow: 1, width: '100%' }}>
          {/* Particulars Tab */}
          {activeTab === 'Particulars' && (
            <ParticularsPage initialCustomerName={selectedCustomerName} />
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
