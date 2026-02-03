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
  ModalLayout,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Loader,
} from '@strapi/design-system';
import { Search, User, Eye } from '@strapi/icons';

const CustomerManagement = () => {
  const { get } = useFetchClient();
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pageCount: 1 });
  const [notification, setNotification] = useState(null);

  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Fetch customers
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '10',
        ...(search && { search }),
      });
      const { data } = await get(`/ops-dashboard/customers?${params}`);
      setCustomers(data.data || []);
      setPagination(data.meta?.pagination || { total: 0, pageCount: 1 });
    } catch (error) {
      showNotification('error', 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const { data } = await get('/ops-dashboard/customers/stats');
      setStats(data.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchStats();
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    fetchCustomers();
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // View customer details
  const handleViewCustomer = async (customer) => {
    setSelectedCustomer(customer);
    setShowDetailModal(true);
    setLoadingOrders(true);
    try {
      const { data } = await get(`/ops-dashboard/customers/${customer.id}`);
      setSelectedCustomer(data.data);
      setCustomerOrders(data.data.orders || []);
    } catch (error) {
      showNotification('error', 'Failed to load customer details');
    } finally {
      setLoadingOrders(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      processing: 'primary',
      shipped: 'secondary',
      delivered: 'success',
      cancelled: 'danger',
    };
    return colors[status] || 'neutral';
  };

  return (
    <Layout>
      <HeaderLayout
        title="Customer Management"
        subtitle={`Manage customers (${pagination.total} customers)`}
      />

      <ContentLayout>
        {/* Notification */}
        {notification && (
          <Box marginBottom={4} padding={4} background={notification.type === 'success' ? 'success100' : 'danger100'}>
            <Typography textColor={notification.type === 'success' ? 'success600' : 'danger600'}>
              {notification.message}
            </Typography>
          </Box>
        )}

        {/* Stats Cards */}
        {stats && (
          <Box marginBottom={6}>
            <Flex gap={4} wrap="wrap">
              <Box background="neutral0" padding={4} shadow="tableShadow" hasRadius style={{ flex: '1 1 200px' }}>
                <Typography variant="pi" textColor="neutral600">Total Customers</Typography>
                <Typography variant="alpha" fontWeight="bold">{stats.totalCustomers}</Typography>
              </Box>
              <Box background="neutral0" padding={4} shadow="tableShadow" hasRadius style={{ flex: '1 1 200px' }}>
                <Typography variant="pi" textColor="neutral600">New This Month</Typography>
                <Flex alignItems="center" gap={2}>
                  <Typography variant="alpha" fontWeight="bold">{stats.newCustomersThisMonth}</Typography>
                  {stats.growthRate !== 0 && (
                    <Badge backgroundColor={stats.growthRate > 0 ? 'success100' : 'danger100'}>
                      {stats.growthRate > 0 ? '+' : ''}{stats.growthRate}%
                    </Badge>
                  )}
                </Flex>
              </Box>
              <Box background="neutral0" padding={4} shadow="tableShadow" hasRadius style={{ flex: '1 1 200px' }}>
                <Typography variant="pi" textColor="neutral600">Active Customers</Typography>
                <Typography variant="alpha" fontWeight="bold">{stats.activeCustomers}</Typography>
              </Box>
              <Box background="neutral0" padding={4} shadow="tableShadow" hasRadius style={{ flex: '1 1 200px' }}>
                <Typography variant="pi" textColor="neutral600">Avg Order Value</Typography>
                <Typography variant="alpha" fontWeight="bold">{formatCurrency(stats.averageOrderValue)}</Typography>
              </Box>
            </Flex>
          </Box>
        )}

        {/* Search */}
        <Box marginBottom={4}>
          <Flex gap={2}>
            <Box style={{ flex: 1 }}>
              <TextInput
                aria-label="Search customers"
                placeholder="Search by username or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                startAction={<Search />}
              />
            </Box>
            <Button onClick={handleSearch}>Search</Button>
            <Button variant="secondary" onClick={() => { setSearch(''); setPage(1); fetchCustomers(); }}>Clear</Button>
          </Flex>
        </Box>

        {/* Customer Table */}
        <Box background="neutral0" padding={6} shadow="tableShadow" hasRadius>
          {loading ? (
            <Flex justifyContent="center" padding={6}><Loader /></Flex>
          ) : customers.length === 0 ? (
            <Typography>No customers found.</Typography>
          ) : (
            <>
              <Table>
                <Thead>
                  <Tr>
                    <Th>Customer</Th>
                    <Th>Email</Th>
                    <Th>Role</Th>
                    <Th>Orders</Th>
                    <Th>Total Spent</Th>
                    <Th>Registered</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {customers.map((customer) => (
                    <Tr key={customer.id}>
                      <Td>
                        <Flex alignItems="center" gap={2}>
                          <Box
                            background="primary100"
                            padding={2}
                            hasRadius
                            style={{ borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <User width={16} height={16} />
                          </Box>
                          <Typography fontWeight="semiBold">{customer.username || 'N/A'}</Typography>
                        </Flex>
                      </Td>
                      <Td><Typography textColor="neutral600">{customer.email}</Typography></Td>
                      <Td>
                        <Badge backgroundColor="neutral150">{customer.role?.name || 'User'}</Badge>
                      </Td>
                      <Td><Typography fontWeight="semiBold">{customer.totalOrders || 0}</Typography></Td>
                      <Td><Typography fontWeight="semiBold">{formatCurrency(customer.totalSpent)}</Typography></Td>
                      <Td><Typography textColor="neutral600">{formatDate(customer.createdAt)}</Typography></Td>
                      <Td>
                        <Button size="S" variant="secondary" startIcon={<Eye />} onClick={() => handleViewCustomer(customer)}>
                          View
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>

              {/* Pagination */}
              <Box marginTop={4}>
                <Flex justifyContent="space-between" alignItems="center">
                  <Typography>
                    Page {page} of {pagination.pageCount} ({pagination.total} total)
                  </Typography>
                  <Flex gap={2}>
                    <Button size="S" variant="tertiary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                      Previous
                    </Button>
                    <Button size="S" variant="tertiary" disabled={page >= pagination.pageCount} onClick={() => setPage(p => p + 1)}>
                      Next
                    </Button>
                  </Flex>
                </Flex>
              </Box>
            </>
          )}
        </Box>
      </ContentLayout>

      {/* Customer Detail Modal */}
      {showDetailModal && selectedCustomer && (
        <ModalLayout onClose={() => setShowDetailModal(false)} labelledBy="detail-modal">
          <ModalHeader>
            <Typography fontWeight="bold" id="detail-modal">Customer Details</Typography>
          </ModalHeader>
          <ModalBody>
            <Box marginBottom={4}>
              <Flex gap={4} wrap="wrap">
                <Box style={{ flex: '1 1 200px' }}>
                  <Typography variant="pi" textColor="neutral600">Username</Typography>
                  <Typography fontWeight="semiBold">{selectedCustomer.username || 'N/A'}</Typography>
                </Box>
                <Box style={{ flex: '1 1 200px' }}>
                  <Typography variant="pi" textColor="neutral600">Email</Typography>
                  <Typography fontWeight="semiBold">{selectedCustomer.email}</Typography>
                </Box>
                <Box style={{ flex: '1 1 200px' }}>
                  <Typography variant="pi" textColor="neutral600">Role</Typography>
                  <Typography fontWeight="semiBold">{selectedCustomer.role?.name || 'User'}</Typography>
                </Box>
                <Box style={{ flex: '1 1 200px' }}>
                  <Typography variant="pi" textColor="neutral600">Registered</Typography>
                  <Typography fontWeight="semiBold">{formatDate(selectedCustomer.createdAt)}</Typography>
                </Box>
              </Flex>
            </Box>

            {selectedCustomer.stats && (
              <Box marginBottom={4} padding={4} background="primary100" hasRadius>
                <Flex gap={4} wrap="wrap">
                  <Box style={{ flex: '1 1 150px' }}>
                    <Typography variant="pi" textColor="neutral600">Total Orders</Typography>
                    <Typography variant="delta" fontWeight="bold">{selectedCustomer.stats.totalOrders}</Typography>
                  </Box>
                  <Box style={{ flex: '1 1 150px' }}>
                    <Typography variant="pi" textColor="neutral600">Total Spent</Typography>
                    <Typography variant="delta" fontWeight="bold">{formatCurrency(selectedCustomer.stats.totalSpent)}</Typography>
                  </Box>
                  <Box style={{ flex: '1 1 150px' }}>
                    <Typography variant="pi" textColor="neutral600">Avg Order Value</Typography>
                    <Typography variant="delta" fontWeight="bold">{formatCurrency(selectedCustomer.stats.averageOrderValue)}</Typography>
                  </Box>
                </Flex>
              </Box>
            )}

            <Typography variant="beta" marginBottom={2}>Order History</Typography>
            {loadingOrders ? (
              <Flex justifyContent="center" padding={4}><Loader /></Flex>
            ) : customerOrders.length === 0 ? (
              <Typography textColor="neutral600">No orders found.</Typography>
            ) : (
              <Table>
                <Thead>
                  <Tr>
                    <Th>Order #</Th>
                    <Th>Date</Th>
                    <Th>Status</Th>
                    <Th>Items</Th>
                    <Th>Total</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {customerOrders.slice(0, 10).map((order) => (
                    <Tr key={order.id}>
                      <Td><Typography fontWeight="semiBold">{order.orderNumber || `#${order.id}`}</Typography></Td>
                      <Td><Typography textColor="neutral600">{formatDate(order.createdAt)}</Typography></Td>
                      <Td>
                        <Badge backgroundColor={`${getStatusColor(order.status)}100`} textColor={`${getStatusColor(order.status)}600`}>
                          {order.status}
                        </Badge>
                      </Td>
                      <Td><Typography>{order.orderItems?.length || 0} items</Typography></Td>
                      <Td><Typography fontWeight="semiBold">{formatCurrency(order.totalAmount)}</Typography></Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </ModalBody>
          <ModalFooter
            startActions={<Button onClick={() => setShowDetailModal(false)} variant="tertiary">Close</Button>}
          />
        </ModalLayout>
      )}
    </Layout>
  );
};

export default CustomerManagement;
