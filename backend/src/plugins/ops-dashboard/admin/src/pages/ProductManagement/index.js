import React, { useState, useEffect } from 'react';
import { useFetchClient } from '@strapi/helper-plugin';
import {
  Layout,
  HeaderLayout,
  ContentLayout,
  Box,
  Typography,
  Button,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  Badge,
  IconButton,
  ModalLayout,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  Option,
  TextInput,
  SingleSelect,
  SingleSelectOption,
  ToggleInput,
} from '@strapi/design-system';
import { Plus, Pencil, Trash, Upload, Download } from '@strapi/icons';
import { Notification, useNotification } from '../../components/Notification';

const ProductManagement = () => {
  const { get, post } = useFetchClient();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
  });

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Notification hook
  const { notification, showSuccess, showError, hideNotification } = useNotification();

  // Modal states
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Import modal states
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  // Modal data
  const [shouldPublish, setShouldPublish] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [priceOperation, setPriceOperation] = useState('set');
  const [priceValue, setPriceValue] = useState('');
  const [stockOperation, setStockOperation] = useState('set');
  const [stockValue, setStockValue] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [pagination.page, searchTerm]);

  useEffect(() => {
    if (showCategoryModal) {
      fetchCategories();
    }
  }, [showCategoryModal]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        pageSize: pagination.pageSize,
      });
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      const { data } = await get(`/ops-dashboard/products?${params.toString()}`);
      setProducts(data.data.results || []);
      setPagination(prev => ({
        ...prev,
        total: data.data.pagination?.total || 0,
      }));
    } catch (error) {
      showError('Failed to fetch products');
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await get('/content-manager/collection-types/api::category.category', {
        params: { page: 1, pageSize: 100 },
      });
      setCategories(data.results || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  const handleSelectProduct = (productId) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  // Bulk operation handlers
  const handleBulkPublish = async () => {
    try {
      await post('/ops-dashboard/products/bulk/publish', {
        productIds: selectedProducts,
        shouldPublish,
      });
      setShowPublishModal(false);
      setSelectedProducts([]);
      showSuccess(`${selectedProducts.length} products ${shouldPublish ? 'published' : 'unpublished'} successfully`);
      fetchProducts();
    } catch (error) {
      showError('Failed to update products');
      console.error('Failed to bulk publish:', error);
    }
  };

  const handleBulkCategory = async () => {
    try {
      await post('/ops-dashboard/products/bulk/category', {
        productIds: selectedProducts,
        categoryId: selectedCategory,
      });
      setShowCategoryModal(false);
      setSelectedProducts([]);
      showSuccess(`${selectedProducts.length} products updated successfully`);
      fetchProducts();
    } catch (error) {
      showError('Failed to update category');
      console.error('Failed to bulk update category:', error);
    }
  };

  const handleBulkPrice = async () => {
    try {
      await post('/ops-dashboard/products/bulk/price', {
        productIds: selectedProducts,
        operation: priceOperation,
        value: parseFloat(priceValue),
      });
      setShowPriceModal(false);
      setSelectedProducts([]);
      setPriceValue('');
      showSuccess(`${selectedProducts.length} products updated successfully`);
      fetchProducts();
    } catch (error) {
      showError('Failed to update prices');
      console.error('Failed to bulk update price:', error);
    }
  };

  const handleBulkStock = async () => {
    try {
      await post('/ops-dashboard/products/bulk/stock', {
        productIds: selectedProducts,
        operation: stockOperation,
        value: parseInt(stockValue),
      });
      setShowStockModal(false);
      setSelectedProducts([]);
      setStockValue('');
      showSuccess(`${selectedProducts.length} products updated successfully`);
      fetchProducts();
    } catch (error) {
      showError('Failed to update stock');
      console.error('Failed to bulk update stock:', error);
    }
  };

  const handleBulkDelete = async () => {
    try {
      await post('/ops-dashboard/products/bulk/delete', {
        productIds: selectedProducts,
      });
      setShowDeleteModal(false);
      setSelectedProducts([]);
      showSuccess(`${selectedProducts.length} products deleted successfully`);
      fetchProducts();
    } catch (error) {
      showError('Failed to delete products');
      console.error('Failed to bulk delete:', error);
    }
  };

  // Import functions
  const handleDownloadTemplate = async () => {
    try {
      const response = await get('/ops-dashboard/products/import/template');
      const blob = new Blob([response.data], {
        type: 'text/csv; charset=utf-8'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'product-import-template.csv';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      showError('Failed to download template');
      console.error('Failed to download template:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImportFile(file);
      setImportPreview(null);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('files.file', importFile);
      formData.append('fieldMapping', JSON.stringify({
        name: 'name',
        description: 'description',
        price: 'price',
        stock: 'stock',
        sku: 'sku',
        category: 'category',
      }));

      // 使用 post 并传入 FormData，useFetchClient 会自动处理认证
      const { data: result } = await post('/ops-dashboard/products/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setImportResult(result.data);
      if (result.data.success > 0) {
        showSuccess(`Successfully imported ${result.data.success} products`);
      }
      fetchProducts();
    } catch (error) {
      console.error('Failed to import:', error);
      showError(error.message || 'Import failed');
      setImportResult({ error: error.message || 'Import failed' });
    } finally {
      setImporting(false);
    }
  };

  const resetImportModal = () => {
    setShowImportModal(false);
    setImportFile(null);
    setImportPreview(null);
    setImportResult(null);
  };

  const isAllSelected = products.length > 0 && selectedProducts.length === products.length;
  const isIndeterminate = selectedProducts.length > 0 && selectedProducts.length < products.length;

  if (loading) {
    return (
      <Layout>
        <HeaderLayout title="Product Management" />
        <ContentLayout>
          <Typography>Loading...</Typography>
        </ContentLayout>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Notification */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={hideNotification}
          duration={notification.duration}
        />
      )}
      <HeaderLayout
        title="Product Management"
        subtitle={`Manage your products with bulk operations (${pagination.total} products)`}
        primaryAction={
          <Flex gap={2}>
            <Button startIcon={<Upload />} variant="secondary" onClick={() => setShowImportModal(true)}>
              Import Products
            </Button>
            <Button startIcon={<Plus />} onClick={() => window.location.href = '/admin/content-manager/collectionType/api::product.product/create'}>
              Add Product
            </Button>
          </Flex>
        }
      />
      <ContentLayout>
        <Box padding={8}>
          {selectedProducts.length > 0 && (
            <Box marginBottom={4} padding={4} background="primary100" borderRadius="4px">
              <Flex justifyContent="space-between" alignItems="center">
                <Typography fontWeight="bold">
                  {selectedProducts.length} product(s) selected
                </Typography>
                <Flex gap={2}>
                  <Button size="S" variant="secondary" onClick={() => setShowPublishModal(true)}>
                    Bulk Publish
                  </Button>
                  <Button size="S" variant="secondary" onClick={() => setShowCategoryModal(true)}>
                    Update Category
                  </Button>
                  <Button size="S" variant="secondary" onClick={() => setShowPriceModal(true)}>
                    Update Price
                  </Button>
                  <Button size="S" variant="secondary" onClick={() => setShowStockModal(true)}>
                    Update Stock
                  </Button>
                  <Button size="S" variant="danger-light" onClick={() => setShowDeleteModal(true)}>
                    Delete
                  </Button>
                </Flex>
              </Flex>
            </Box>
          )}

          {/* Search Bar */}
          <Box marginBottom={4}>
            <Flex gap={2}>
              <Box style={{ flex: 1, maxWidth: '400px' }}>
                <TextInput
                  label="Search"
                  placeholder="Search by name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      setPagination(p => ({ ...p, page: 1 }));
                    }
                  }}
                />
              </Box>
              {searchTerm && (
                <Button variant="tertiary" onClick={() => setSearchTerm('')}>
                  Clear
                </Button>
              )}
            </Flex>
          </Box>

          <Table colCount={9} rowCount={products.length}>
            <Thead>
              <Tr>
                <Th>
                  <Checkbox
                    checked={isAllSelected}
                    indeterminate={isIndeterminate}
                    onChange={handleSelectAll}
                    aria-label="Select all products"
                  />
                </Th>
                <Th>
                  <Typography variant="sigma">Image</Typography>
                </Th>
                <Th>
                  <Typography variant="sigma">Name</Typography>
                </Th>
                <Th>
                  <Typography variant="sigma">SKU</Typography>
                </Th>
                <Th>
                  <Typography variant="sigma">Category</Typography>
                </Th>
                <Th>
                  <Typography variant="sigma">Price</Typography>
                </Th>
                <Th>
                  <Typography variant="sigma">Stock</Typography>
                </Th>
                <Th>
                  <Typography variant="sigma">Status</Typography>
                </Th>
                <Th>
                  <Typography variant="sigma">Actions</Typography>
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {products.map((product) => (
                <Tr key={product.id}>
                  <Td>
                    <Checkbox
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => handleSelectProduct(product.id)}
                      aria-label={`Select ${product.name}`}
                    />
                  </Td>
                  <Td>
                    <Box
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        backgroundColor: '#f0f0f0',
                      }}
                    >
                      {product.images?.[0]?.url ? (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <Box
                          style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Typography variant="pi" textColor="neutral500">
                            No Image
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Td>
                  <Td>
                    <Typography fontWeight="bold">{product.name}</Typography>
                  </Td>
                  <Td>
                    <Typography textColor="neutral600">{product.sku || '-'}</Typography>
                  </Td>
                  <Td>
                    <Typography>{product.category?.name || '-'}</Typography>
                  </Td>
                  <Td>
                    <Typography fontWeight="semiBold">
                      ${product.price?.toFixed(2) || '0.00'}
                    </Typography>
                  </Td>
                  <Td>
                    <Badge
                      backgroundColor={
                        product.stock === 0
                          ? 'danger100'
                          : product.stock < 10
                          ? 'warning100'
                          : 'success100'
                      }
                      textColor={
                        product.stock === 0
                          ? 'danger700'
                          : product.stock < 10
                          ? 'warning700'
                          : 'success700'
                      }
                    >
                      {product.stock || 0}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge
                      backgroundColor={product.publishedAt ? 'success100' : 'secondary100'}
                      textColor={product.publishedAt ? 'success700' : 'secondary700'}
                    >
                      {product.publishedAt ? 'Published' : 'Draft'}
                    </Badge>
                  </Td>
                  <Td>
                    <Flex gap={1}>
                      <IconButton
                        label="Edit"
                        icon={<Pencil />}
                        noBorder
                        disabled
                      />
                      <IconButton
                        label="Delete"
                        icon={<Trash />}
                        noBorder
                        disabled
                      />
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>

          {products.length === 0 && (
            <Box padding={8} background="neutral100" textAlign="center">
              <Typography>No products found</Typography>
            </Box>
          )}

          {/* Pagination */}
          {pagination.total > 0 && (
            <Flex justifyContent="space-between" alignItems="center" marginTop={4}>
              <Typography variant="pi" textColor="neutral600">
                Showing {(pagination.page - 1) * pagination.pageSize + 1} - {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} products
              </Typography>
              <Flex gap={2}>
                <Button
                  variant="tertiary"
                  size="S"
                  disabled={pagination.page === 1}
                  onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                >
                  Previous
                </Button>
                <Typography variant="pi" padding={2}>
                  Page {pagination.page} of {Math.ceil(pagination.total / pagination.pageSize)}
                </Typography>
                <Button
                  variant="tertiary"
                  size="S"
                  disabled={pagination.page * pagination.pageSize >= pagination.total}
                  onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                >
                  Next
                </Button>
              </Flex>
            </Flex>
          )}
        </Box>
      </ContentLayout>

      {/* Bulk Publish Modal */}
      {showPublishModal && (
        <ModalLayout onClose={() => setShowPublishModal(false)} labelledBy="publish-modal">
          <ModalHeader>
            <Typography fontWeight="bold" textColor="neutral800" as="h2" id="publish-modal">
              Bulk Publish Products
            </Typography>
          </ModalHeader>
          <ModalBody>
            <Box paddingTop={4} paddingBottom={4}>
              <Typography>
                You are about to update {selectedProducts.length} product(s).
              </Typography>
              <Box marginTop={4}>
                <ToggleInput
                  label="Publish products"
                  hint="Toggle to publish or unpublish selected products"
                  checked={shouldPublish}
                  onChange={() => setShouldPublish(!shouldPublish)}
                />
              </Box>
            </Box>
          </ModalBody>
          <ModalFooter
            startActions={
              <Button onClick={() => setShowPublishModal(false)} variant="tertiary">
                Cancel
              </Button>
            }
            endActions={
              <Button onClick={handleBulkPublish} variant="success">
                {shouldPublish ? 'Publish' : 'Unpublish'}
              </Button>
            }
          />
        </ModalLayout>
      )}

      {/* Bulk Category Modal */}
      {showCategoryModal && (
        <ModalLayout onClose={() => setShowCategoryModal(false)} labelledBy="category-modal">
          <ModalHeader>
            <Typography fontWeight="bold" textColor="neutral800" as="h2" id="category-modal">
              Update Category
            </Typography>
          </ModalHeader>
          <ModalBody>
            <Box paddingTop={4} paddingBottom={4}>
              <Typography marginBottom={2}>
                Select a category for {selectedProducts.length} product(s):
              </Typography>
              <SingleSelect
                label="Category"
                placeholder="Select a category"
                value={selectedCategory}
                onChange={setSelectedCategory}
              >
                {categories.map((category) => (
                  <SingleSelectOption key={category.id} value={category.id}>
                    {category.name}
                  </SingleSelectOption>
                ))}
              </SingleSelect>
            </Box>
          </ModalBody>
          <ModalFooter
            startActions={
              <Button onClick={() => setShowCategoryModal(false)} variant="tertiary">
                Cancel
              </Button>
            }
            endActions={
              <Button onClick={handleBulkCategory} variant="success" disabled={!selectedCategory}>
                Update
              </Button>
            }
          />
        </ModalLayout>
      )}

      {/* Bulk Price Modal */}
      {showPriceModal && (
        <ModalLayout onClose={() => setShowPriceModal(false)} labelledBy="price-modal">
          <ModalHeader>
            <Typography fontWeight="bold" textColor="neutral800" as="h2" id="price-modal">
              Update Price
            </Typography>
          </ModalHeader>
          <ModalBody>
            <Box paddingTop={4} paddingBottom={4}>
              <Typography marginBottom={2}>
                Update price for {selectedProducts.length} product(s):
              </Typography>
              <Box marginTop={4}>
                <SingleSelect
                  label="Operation"
                  value={priceOperation}
                  onChange={setPriceOperation}
                >
                  <SingleSelectOption value="set">Set to value</SingleSelectOption>
                  <SingleSelectOption value="increase">Increase by amount</SingleSelectOption>
                  <SingleSelectOption value="decrease">Decrease by amount</SingleSelectOption>
                  <SingleSelectOption value="percentage">Increase by percentage</SingleSelectOption>
                </SingleSelect>
              </Box>
              <Box marginTop={4}>
                <TextInput
                  label="Value"
                  type="number"
                  value={priceValue}
                  onChange={(e) => setPriceValue(e.target.value)}
                  placeholder="Enter value"
                />
              </Box>
            </Box>
          </ModalBody>
          <ModalFooter
            startActions={
              <Button onClick={() => setShowPriceModal(false)} variant="tertiary">
                Cancel
              </Button>
            }
            endActions={
              <Button onClick={handleBulkPrice} variant="success" disabled={!priceValue}>
                Update
              </Button>
            }
          />
        </ModalLayout>
      )}

      {/* Bulk Stock Modal */}
      {showStockModal && (
        <ModalLayout onClose={() => setShowStockModal(false)} labelledBy="stock-modal">
          <ModalHeader>
            <Typography fontWeight="bold" textColor="neutral800" as="h2" id="stock-modal">
              Update Stock
            </Typography>
          </ModalHeader>
          <ModalBody>
            <Box paddingTop={4} paddingBottom={4}>
              <Typography marginBottom={2}>
                Update stock for {selectedProducts.length} product(s):
              </Typography>
              <Box marginTop={4}>
                <SingleSelect
                  label="Operation"
                  value={stockOperation}
                  onChange={setStockOperation}
                >
                  <SingleSelectOption value="set">Set to value</SingleSelectOption>
                  <SingleSelectOption value="increase">Increase by amount</SingleSelectOption>
                  <SingleSelectOption value="decrease">Decrease by amount</SingleSelectOption>
                </SingleSelect>
              </Box>
              <Box marginTop={4}>
                <TextInput
                  label="Value"
                  type="number"
                  value={stockValue}
                  onChange={(e) => setStockValue(e.target.value)}
                  placeholder="Enter value"
                />
              </Box>
            </Box>
          </ModalBody>
          <ModalFooter
            startActions={
              <Button onClick={() => setShowStockModal(false)} variant="tertiary">
                Cancel
              </Button>
            }
            endActions={
              <Button onClick={handleBulkStock} variant="success" disabled={!stockValue}>
                Update
              </Button>
            }
          />
        </ModalLayout>
      )}

      {/* Bulk Delete Modal */}
      {showDeleteModal && (
        <ModalLayout onClose={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }} labelledBy="delete-modal">
          <ModalHeader>
            <Typography fontWeight="bold" textColor="neutral800" as="h2" id="delete-modal">
              Delete Products
            </Typography>
          </ModalHeader>
          <ModalBody>
            <Box paddingTop={4} paddingBottom={4}>
              <Box marginBottom={4} padding={3} background="danger100" hasRadius>
                <Typography textColor="danger600" fontWeight="bold">
                  Warning: This action cannot be undone!
                </Typography>
              </Box>
              <Typography marginBottom={2}>
                You are about to delete {selectedProducts.length} product(s):
              </Typography>
              <Box marginTop={2} marginBottom={4} padding={3} background="neutral100" hasRadius style={{ maxHeight: '150px', overflow: 'auto' }}>
                {products
                  .filter(p => selectedProducts.includes(p.id))
                  .map(p => (
                    <Typography key={p.id} variant="pi" textColor="neutral700" as="div">
                      • {p.name} (SKU: {p.sku || 'N/A'})
                    </Typography>
                  ))
                }
              </Box>
              <Box marginTop={4}>
                <TextInput
                  label="Type DELETE to confirm"
                  placeholder="DELETE"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  hint="This action is irreversible. Please type DELETE to confirm."
                />
              </Box>
            </Box>
          </ModalBody>
          <ModalFooter
            startActions={
              <Button onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }} variant="tertiary">
                Cancel
              </Button>
            }
            endActions={
              <Button
                onClick={() => { handleBulkDelete(); setDeleteConfirmText(''); }}
                variant="danger"
                disabled={deleteConfirmText !== 'DELETE'}
              >
                Delete {selectedProducts.length} Product(s)
              </Button>
            }
          />
        </ModalLayout>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <ModalLayout onClose={resetImportModal} labelledBy="import-modal">
          <ModalHeader>
            <Typography fontWeight="bold" textColor="neutral800" as="h2" id="import-modal">
              Import Products
            </Typography>
          </ModalHeader>
          <ModalBody>
            <Box paddingTop={4} paddingBottom={4}>
              <Flex direction="column" gap={4}>
                <Box>
                  <Button variant="tertiary" startIcon={<Download />} onClick={handleDownloadTemplate}>
                    Download Template
                  </Button>
                </Box>
                <Box>
                  <Typography variant="pi" textColor="neutral600" marginBottom={2}>
                    Upload CSV file (.csv)
                  </Typography>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    style={{ marginTop: '8px' }}
                  />
                </Box>
                {importFile && (
                  <Box padding={3} background="neutral100" hasRadius>
                    <Typography>Selected: {importFile.name}</Typography>
                  </Box>
                )}
                {importResult && (
                  <Box padding={3} background={importResult.error ? 'danger100' : 'success100'} hasRadius>
                    {importResult.error ? (
                      <Typography textColor="danger600">{importResult.error}</Typography>
                    ) : (
                      <>
                        <Typography textColor="success600">
                          Import completed: {importResult.success} success, {importResult.failed} failed
                        </Typography>
                        {importResult.errors?.length > 0 && (
                          <Box marginTop={2}>
                            <Typography variant="pi" textColor="danger600">
                              Errors: {importResult.errors.map(e => `Row ${e.row}: ${e.error}`).join(', ')}
                            </Typography>
                          </Box>
                        )}
                      </>
                    )}
                  </Box>
                )}
              </Flex>
            </Box>
          </ModalBody>
          <ModalFooter
            startActions={
              <Button onClick={resetImportModal} variant="tertiary">
                {importResult ? 'Close' : 'Cancel'}
              </Button>
            }
            endActions={
              !importResult && (
                <Button onClick={handleImport} disabled={!importFile || importing}>
                  {importing ? 'Importing...' : 'Import'}
                </Button>
              )
            }
          />
        </ModalLayout>
      )}
    </Layout>
  );
};

export default ProductManagement;
