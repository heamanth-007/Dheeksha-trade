import { useState, useEffect, type FC } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
} from '@mui/material';
import ModeEditOutlineRoundedIcon from '@mui/icons-material/ModeEditOutlineRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { ProductsApi } from '../services/api';

export interface ProductItem {
  _id?: string;
  id?: string;
  slNo: number;
  name: string;
}

export const ProductsPage: FC = () => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Add / Edit Modal State
  const [openModal, setOpenModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [productName, setProductName] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await ProductsApi.getAll();
      setProducts(data || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setProductName('');
    setOpenModal(true);
  };

  const handleOpenEdit = (product: ProductItem) => {
    setEditingProduct(product);
    setProductName(product.name);
    setOpenModal(true);
  };

  const handleSaveProduct = async () => {
    if (!productName.trim()) {
      alert('Please enter product name');
      return;
    }

    try {
      setModalLoading(true);
      if (editingProduct) {
        const id = editingProduct._id || editingProduct.id || '';
        await ProductsApi.update(id, { name: productName.trim() });
      } else {
        const nextSlNo = products.length > 0 ? Math.max(...products.map((p) => p.slNo || 0)) + 1 : 1;
        await ProductsApi.create({
          slNo: nextSlNo,
          name: productName.trim(),
        });
      }
      setOpenModal(false);
      fetchProducts();
    } catch (err) {
      console.error('Failed to save product:', err);
      alert('Error saving product');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteProduct = async (product: ProductItem) => {
    const id = product._id || product.id || '';
    if (!id) return;
    if (!window.confirm(`Delete product "${product.name}"?`)) return;

    try {
      await ProductsApi.delete(id);
      setProducts((prev) => prev.filter((p) => (p._id || p.id) !== id));
    } catch (err) {
      console.error('Failed to delete product:', err);
      alert('Error deleting product');
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        p: { xs: 2, sm: 2.5, md: 3 },
        boxSizing: 'border-box',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          overflow: 'hidden',
        }}
      >
        {/* Blue Header Banner */}
        <Box
          sx={{
            backgroundColor: '#0B4DB7',
            px: { xs: 2, sm: 3 },
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: '52px',
          }}
        >
          <Typography
            sx={{
              color: '#FFFFFF',
              fontSize: '16px',
              fontWeight: 700,
              letterSpacing: '-0.01em',
            }}
          >
            View Product
          </Typography>

          <Button
            variant="contained"
            disableElevation
            onClick={handleOpenAdd}
            sx={{
              backgroundColor: '#FFFFFF',
              color: '#0B4DB7',
              fontSize: '13px',
              fontWeight: 700,
              textTransform: 'none',
              px: 2.2,
              py: 0.75,
              borderRadius: '6px',
              minWidth: 'auto',
              lineHeight: 1.2,
              '&:hover': {
                backgroundColor: '#F8FAFC',
              },
            }}
          >
            Add Product
          </Button>
        </Box>

        {/* Table Container */}
        <TableContainer>
          <Table sx={{ width: '100%' }} aria-label="product table">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                <TableCell
                  sx={{
                    py: 1.5,
                    px: { xs: 2, sm: 3 },
                    fontSize: '11.5px',
                    fontWeight: 700,
                    color: '#1E293B',
                    letterSpacing: '0.04em',
                    borderBottom: '1px solid #E2E8F0',
                    width: '100px',
                  }}
                >
                  SL.NO
                </TableCell>
                <TableCell
                  sx={{
                    py: 1.5,
                    px: { xs: 2, sm: 3 },
                    fontSize: '11.5px',
                    fontWeight: 700,
                    color: '#1E293B',
                    letterSpacing: '0.04em',
                    borderBottom: '1px solid #E2E8F0',
                  }}
                >
                  NAME
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    py: 1.5,
                    px: { xs: 1.5, sm: 2.5 },
                    fontSize: '11.5px',
                    fontWeight: 700,
                    color: '#1E293B',
                    letterSpacing: '0.04em',
                    borderBottom: '1px solid #E2E8F0',
                    width: '90px',
                  }}
                >
                  EDIT
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    py: 1.5,
                    px: { xs: 2, sm: 3 },
                    fontSize: '11.5px',
                    fontWeight: 700,
                    color: '#1E293B',
                    letterSpacing: '0.04em',
                    borderBottom: '1px solid #E2E8F0',
                    width: '90px',
                  }}
                >
                  DELETE
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} sx={{ color: '#0B4DB7' }} />
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6, color: '#64748B' }}>
                    No products found. Click "Add Product" to add one.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product, index) => {
                  const isLast = index === products.length - 1;
                  return (
                    <TableRow
                      key={product._id || product.id || index}
                      sx={{
                        '&:hover': {
                          backgroundColor: '#F8FAFC',
                        },
                      }}
                    >
                      <TableCell
                        sx={{
                          py: 1.6,
                          px: { xs: 2, sm: 3 },
                          fontSize: '13.5px',
                          fontWeight: 600,
                          color: '#1E293B',
                          borderBottom: isLast ? 'none' : '1px solid #EEF2F6',
                        }}
                      >
                        {product.slNo || index + 1}
                      </TableCell>
                      <TableCell
                        sx={{
                          py: 1.6,
                          px: { xs: 2, sm: 3 },
                          fontSize: '13.5px',
                          fontWeight: 600,
                          color: '#0F172A',
                          letterSpacing: '0.01em',
                          borderBottom: isLast ? 'none' : '1px solid #EEF2F6',
                        }}
                      >
                        {product.name}
                      </TableCell>

                      {/* Edit Button */}
                      <TableCell
                        align="center"
                        sx={{
                          py: 1.6,
                          px: { xs: 1.5, sm: 2.5 },
                          borderBottom: isLast ? 'none' : '1px solid #EEF2F6',
                        }}
                      >
                        <Tooltip title="Edit Product" arrow>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenEdit(product)}
                            sx={{
                              color: '#64748B',
                              backgroundColor: '#F8FAFC',
                              border: '1px solid #E2E8F0',
                              borderRadius: '6px',
                              p: 0.7,
                              transition: 'all 0.15s ease',
                              '&:hover': {
                                color: '#0B4DB7',
                                backgroundColor: '#EFF6FF',
                                borderColor: '#BFDBFE',
                              },
                            }}
                          >
                            <ModeEditOutlineRoundedIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>

                      {/* Delete Button */}
                      <TableCell
                        align="center"
                        sx={{
                          py: 1.6,
                          px: { xs: 2, sm: 3 },
                          borderBottom: isLast ? 'none' : '1px solid #EEF2F6',
                        }}
                      >
                        <Tooltip title="Delete Product" arrow>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteProduct(product)}
                            sx={{
                              color: '#64748B',
                              backgroundColor: '#F8FAFC',
                              border: '1px solid #E2E8F0',
                              borderRadius: '6px',
                              p: 0.7,
                              transition: 'all 0.15s ease',
                              '&:hover': {
                                color: '#DC2626',
                                backgroundColor: '#FEF2F2',
                                borderColor: '#FECACA',
                              },
                            }}
                          >
                            <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add / Edit Product Modal */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '12px',
              p: 1,
            },
          },
        }}
      >
        <DialogTitle sx={{ fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#475569', mb: 1, mt: 1 }}>
            Product Name *
          </Typography>
          <TextField
            autoFocus
            fullWidth
            size="small"
            placeholder="e.g. 2 1/2 KURUVI"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            slotProps={{
              input: {
                sx: {
                  fontSize: '13.5px',
                  fontWeight: 500,
                  borderRadius: '6px',
                },
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button
            onClick={() => setOpenModal(false)}
            sx={{ color: '#64748B', fontWeight: 600, textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disableElevation
            onClick={handleSaveProduct}
            disabled={modalLoading}
            sx={{
              backgroundColor: '#0B4DB7',
              color: '#FFFFFF',
              fontWeight: 700,
              textTransform: 'none',
              px: 2.5,
              borderRadius: '6px',
              '&:hover': { backgroundColor: '#083B8D' },
            }}
          >
            {modalLoading ? 'Saving...' : 'Save Product'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
