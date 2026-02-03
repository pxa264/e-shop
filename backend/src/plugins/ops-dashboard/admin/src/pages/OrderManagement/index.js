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
  Badge,
  TextInput,
  SingleSelect,
  SingleSelectOption,
  Grid,
  GridItem,
  ModalLayout,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@strapi/design-system';
import { Download, Search } from '@strapi/icons';
import { Notification, useNotification } from '../../components/Notification';

const OrderManagement = () => {
  const { get, post } = useFetchClient();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
  });

  // Notification hook
  const { notification, showSuccess, showError, hideNotification } = useNotification();

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: '',
  });

  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFields, setExportFields] = useState([
    'orderNumber', 'customerName', 'customerEmail', 'status', 'totalAmount', 'createdAt'
  ]);

  useEffect(() => {
    fetchOrders();
  }, [pagination.page]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        pageSize: pagination.pageSize,
        ...filters,
      });

      const { data } = await get(`/ops-dashboard/orders?${params}`);
      setOrders(data.data.results || []);
      setPagination(prev => ({
        ...prev,
        total: data.data.pagination?.total || 0,
      }));
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchOrders();
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: '',
      dateFrom: '',
      dateTo: '',
      minAmount: '',
      maxAmount: '',
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchOrders();
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleExport = async () => {
    try {
      // 使用 useFetchClient 的 post 方法
      const response = await post('/ops-dashboard/orders/export', {
        fields: exportFields,
        filters: filters,
      });

      // 后端返回 CSV 字符串
      let csvContent;
      if (typeof response.data === 'string') {
        csvContent = response.data;
      } else if (response.data?.data) {
        csvContent = response.data.data;
      } else {
        csvContent = JSON.stringify(response.data);
      }

      const blob = new Blob([csvContent], {
        type: 'text/csv; charset=utf-8'
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `orders-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setShowExportModal(false);
      showSuccess('Orders exported successfully');
    } catch (error) {
      console.error('Failed to export orders:', error);
      showError('Failed to export orders. Please try again.');
    }
  };

  if (loading) {
    return (
      <Layout>
        <HeaderLayout title="Order Management" />
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
        title="Order Management"
        subtitle={`Manage orders and export data (${pagination.total} orders)`}
        primaryAction={
          <Button startIcon={<Download />} variant="secondary" onClick={() => setShowExportModal(true)}>
            Export Orders
          </Button>
        }
      />
      <ContentLayout>
        <Box padding={8}>
          {/* Filters */}
          <Box marginBottom={6}>
            <Typography variant="beta" marginBottom={4}>Filters</Typography>
            <Grid gap={4}>
              <GridItem col={3}>
                <TextInput
                  label="Search"
                  placeholder="Order number or customer email"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </GridItem>
              <GridItem col={2}>
                <SingleSelect
                  label="Status"
                  placeholder="All statuses"
                  value={filters.status}
                  onChange={(value) => handleFilterChange('status', value)}
                  onClear={() => handleFilterChange('status', '')}
                >
                  <SingleSelectOption value="pending">Pending</SingleSelectOption>
                  <SingleSelectOption value="processing">Processing</SingleSelectOption>
                  <SingleSelectOption value="shipped">Shipped</SingleSelectOption>
                  <SingleSelectOption value="delivered">Delivered</SingleSelectOption>
                  <SingleSelectOption value="cancelled">Cancelled</SingleSelectOption>
                </SingleSelect>
              </GridItem>
              <GridItem col={2}>
                <TextInput
                  label="Date From"
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                />
              </GridItem>
              <GridItem col={2}>
                <TextInput
                  label="Date To"
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                />
              </GridItem>
              <GridItem col={3}>
                <Flex gap={2} alignItems="flex-end">
                  <Button onClick={handleApplyFilters} variant="secondary">
                    Apply Filters
                  </Button>
                  <Button onClick={handleClearFilters} variant="tertiary">
                    Clear
                  </Button>
                </Flex>
              </GridItem>
            </Grid>
          </Box>

          {/* Orders Table */}
          <Table colCount={7} rowCount={orders.length}>
            <Thead>
              <Tr>
                <Th><Typography variant="sigma">Order Number</Typography></Th>
                <Th><Typography variant="sigma">Customer</Typography></Th>
                <Th><Typography variant="sigma">Status</Typography></Th>
                <Th><Typography variant="sigma">Total Amount</Typography></Th>
                <Th><Typography variant="sigma">Items</Typography></Th>
                <Th><Typography variant="sigma">Created At</Typography></Th>
                <Th><Typography variant="sigma">Actions</Typography></Th>
              </Tr>
            </Thead>
            <Tbody>
              {orders.map((order) => (
                <Tr key={order.id}>
                  <Td>
                    <Typography fontWeight="bold">{order.orderNumber || '-'}</Typography>
                  </Td>
                  <Td>
                    <Typography>{order.user?.email || '-'}</Typography>
                  </Td>
                  <Td>
                    <Badge
                      backgroundColor={
                        order.status === 'delivered' ? 'success100' :
                        order.status === 'cancelled' ? 'danger100' :
                        order.status === 'shipped' ? 'primary100' :
                        'secondary100'
                      }
                      textColor={
                        order.status === 'delivered' ? 'success700' :
                        order.status === 'cancelled' ? 'danger700' :
                        order.status === 'shipped' ? 'primary700' :
                        'secondary700'
                      }
                    >
                      {order.status || 'pending'}
                    </Badge>
                  </Td>
                  <Td>
                    <Typography fontWeight="semiBold">
                      ${(order.totalAmount || 0).toFixed(2)}
                    </Typography>
                  </Td>
                  <Td>
                    <Typography>{order.orderItems?.length || 0} items</Typography>
                  </Td>
                  <Td>
                    <Typography textColor="neutral600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </Typography>
                  </Td>
                  <Td>
                    <Button size="S" variant="tertiary" onClick={() => handleViewDetails(order)}>
                      View Details
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>

          {orders.length === 0 && (
            <Box padding={8} background="neutral100" textAlign="center">
              <Typography>No orders found</Typography>
            </Box>
          )}

          {/* Pagination */}
          {pagination.total > 0 && (
            <Flex justifyContent="space-between" alignItems="center" marginTop={4}>
              <Typography variant="pi" textColor="neutral600">
                Showing {(pagination.page - 1) * pagination.pageSize + 1} - {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} orders
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

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <ModalLayout onClose={() => setShowDetailsModal(false)} labelledBy="order-details-modal">
          <ModalHeader>
            <Typography fontWeight="bold" textColor="neutral800" as="h2" id="order-details-modal">
              Order Details - {selectedOrder.orderNumber}
            </Typography>
          </ModalHeader>
          <ModalBody>
            <Box paddingTop={4} paddingBottom={4}>
              <Grid gap={4}>
                <GridItem col={6}>
                  <Typography variant="sigma" textColor="neutral600">Status</Typography>
                  <Badge
                    backgroundColor={
                      selectedOrder.status === 'delivered' ? 'success100' :
                      selectedOrder.status === 'cancelled' ? 'danger100' :
                      selectedOrder.status === 'shipped' ? 'primary100' :
                      'secondary100'
                    }
                    textColor={
                      selectedOrder.status === 'delivered' ? 'success700' :
                      selectedOrder.status === 'cancelled' ? 'danger700' :
                      selectedOrder.status === 'shipped' ? 'primary700' :
                      'secondary700'
                    }
                  >
                    {selectedOrder.status || 'pending'}
                  </Badge>
                </GridItem>
                <GridItem col={6}>
                  <Typography variant="sigma" textColor="neutral600">Total Amount</Typography>
                  <Typography fontWeight="bold" fontSize={3}>
                    ${(selectedOrder.totalAmount || 0).toFixed(2)}
                  </Typography>
                </GridItem>
                <GridItem col={6}>
                  <Typography variant="sigma" textColor="neutral600">Customer Email</Typography>
                  <Typography>{selectedOrder.user?.email || '-'}</Typography>
                </GridItem>
                <GridItem col={6}>
                  <Typography variant="sigma" textColor="neutral600">Created At</Typography>
                  <Typography>{new Date(selectedOrder.createdAt).toLocaleString()}</Typography>
                </GridItem>
                <GridItem col={12}>
                  <Typography variant="sigma" textColor="neutral600" marginBottom={2}>Order Items</Typography>
                  {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 ? (
                    <Box>
                      {selectedOrder.orderItems.map((item, index) => (
                        <Box key={index} padding={2} background="neutral100" marginBottom={2} borderRadius="4px">
                          <Flex justifyContent="space-between">
                            <Typography>{item.product?.name || 'Product'}</Typography>
                            <Typography>Qty: {item.quantity} × ${item.price?.toFixed(2)}</Typography>
                          </Flex>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography>No items</Typography>
                  )}
                </GridItem>
              </Grid>
            </Box>
          </ModalBody>
          <ModalFooter
            startActions={
              <Button onClick={() => setShowDetailsModal(false)} variant="tertiary">
                Close
              </Button>
            }
          />
        </ModalLayout>
      )}

      {/* Export Orders Modal */}
      {showExportModal && (
        <ModalLayout onClose={() => setShowExportModal(false)} labelledBy="export-modal">
          <ModalHeader>
            <Typography fontWeight="bold" textColor="neutral800" as="h2" id="export-modal">
              Export Orders
            </Typography>
          </ModalHeader>
          <ModalBody>
            <Box paddingTop={4} paddingBottom={4}>
              <Typography variant="beta" marginBottom={4}>Select Fields to Export</Typography>
              <Typography variant="pi" textColor="neutral600" marginBottom={4}>
                All orders matching current filters will be exported.
              </Typography>
            </Box>
          </ModalBody>
          <ModalFooter
            startActions={
              <Button onClick={() => setShowExportModal(false)} variant="tertiary">
                Cancel
              </Button>
            }
            endActions={
              <Button onClick={handleExport} variant="success">
                Export to CSV
              </Button>
            }
          />
        </ModalLayout>
      )}
    </Layout>
  );
};

export default OrderManagement;
