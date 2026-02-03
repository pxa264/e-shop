import React, { useState, useEffect } from 'react';
import { useFetchClient } from '@strapi/helper-plugin';
import {
  Layout,
  HeaderLayout,
  ContentLayout,
  Box,
  Grid,
  GridItem,
  Typography,
} from '@strapi/design-system';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { ShoppingCart, User, Package, Coin } from '@strapi/icons';
import KPICard from '../../components/KPICard';

const Dashboard = () => {
  const { get } = useFetchClient();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await get('/ops-dashboard/stats');
        setStats(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [get]);

  if (loading) {
    return (
      <Layout>
        <HeaderLayout title="Operations Dashboard" />
        <ContentLayout>
          <Typography>Loading...</Typography>
        </ContentLayout>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <HeaderLayout title="Operations Dashboard" />
        <ContentLayout>
          <Typography>Error: {error}</Typography>
        </ContentLayout>
      </Layout>
    );
  }

  return (
    <Layout>
      <HeaderLayout title="Operations Dashboard" subtitle="Key metrics and insights" />
      <ContentLayout>
        <Box padding={8}>
          {/* KPI Cards */}
          <Grid gap={4}>
            <GridItem col={3}>
              <KPICard
                title="Total Orders"
                value={stats.kpis.totalOrders.value}
                color="primary"
                icon={ShoppingCart}
                trend={stats.kpis.totalOrders.trend}
                sparkline={stats.kpis.totalOrders.sparkline}
              />
            </GridItem>
            <GridItem col={3}>
              <KPICard
                title="Total Users"
                value={stats.kpis.totalUsers.value}
                color="success"
                icon={User}
                trend={stats.kpis.totalUsers.trend}
                sparkline={stats.kpis.totalUsers.sparkline}
              />
            </GridItem>
            <GridItem col={3}>
              <KPICard
                title="Total Products"
                value={stats.kpis.totalProducts.value}
                color="warning"
                icon={Package}
                trend={stats.kpis.totalProducts.trend}
                sparkline={stats.kpis.totalProducts.sparkline}
              />
            </GridItem>
            <GridItem col={3}>
              <KPICard
                title="Total Sales"
                value={`$${stats.kpis.totalSales.value}`}
                color="danger"
                icon={Coin}
                trend={stats.kpis.totalSales.trend}
                sparkline={stats.kpis.totalSales.sparkline}
              />
            </GridItem>
          </Grid>

          {/* Order Trend Chart */}
          <Box marginTop={6}>
            <Typography variant="beta" marginBottom={4}>
              Order Trend (Last 30 Days)
            </Typography>
            <Box background="neutral0" padding={4} hasRadius shadow="tableShadow">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={stats.orderTrend}>
                  <defs>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    stroke="#999"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="#999"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '2px solid #f97316',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    labelStyle={{ fontWeight: 'bold', color: '#333' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#f97316"
                    strokeWidth={3}
                    fill="url(#colorOrders)"
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Box>

          {/* Order Status Distribution */}
          {stats.ordersByStatus && stats.ordersByStatus.length > 0 && (
            <Box marginTop={6}>
              <Typography variant="beta" marginBottom={4}>
                Order Status Distribution
              </Typography>
              <Box background="neutral0" padding={4} hasRadius shadow="tableShadow">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.ordersByStatus}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={5}
                      animationDuration={1500}
                      label={(entry) => `${entry.status}: ${entry.count}`}
                      labelLine={{ stroke: '#999', strokeWidth: 1 }}
                    >
                      {stats.ordersByStatus.map((entry, index) => {
                        const colors = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5'];
                        return (
                          <Cell
                            key={`cell-${index}`}
                            fill={colors[index % colors.length]}
                            style={{ cursor: 'pointer' }}
                          />
                        );
                      })}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '2px solid #f97316',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      wrapperStyle={{ fontSize: '14px', fontWeight: '500' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          )}

          {/* Low Stock Products */}
          {stats.lowStockProducts && stats.lowStockProducts.length > 0 && (
            <Box marginTop={6}>
              <Typography variant="beta" marginBottom={4}>
                Low Stock Alert
              </Typography>
              <Box background="neutral0" padding={4} hasRadius shadow="tableShadow">
                <Box as="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <Box as="thead">
                    <Box as="tr" style={{ borderBottom: '2px solid #f0f0f0' }}>
                      <Box as="th" padding={3} style={{ textAlign: 'left', fontWeight: 'bold', color: '#666' }}>
                        Product Name
                      </Box>
                      <Box as="th" padding={3} style={{ textAlign: 'center', fontWeight: 'bold', color: '#666' }}>
                        Stock Level
                      </Box>
                      <Box as="th" padding={3} style={{ textAlign: 'right', fontWeight: 'bold', color: '#666' }}>
                        Price
                      </Box>
                    </Box>
                  </Box>
                  <Box as="tbody">
                    {stats.lowStockProducts.map((product, index) => {
                      const stockColor = product.stock === 0 ? '#dc2626' : product.stock < 5 ? '#f97316' : '#fb923c';
                      const stockBg = product.stock === 0 ? '#fef2f2' : product.stock < 5 ? '#fff7ed' : '#ffedd5';

                      return (
                        <Box
                          key={index}
                          as="tr"
                          style={{
                            borderBottom: '1px solid #f5f5f5',
                            transition: 'background-color 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#fafafa';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <Box as="td" padding={3}>
                            <Typography fontWeight="semiBold">{product.name}</Typography>
                          </Box>
                          <Box as="td" padding={3} style={{ textAlign: 'center' }}>
                            <Box
                              style={{
                                display: 'inline-block',
                                padding: '4px 12px',
                                borderRadius: '12px',
                                backgroundColor: stockBg,
                                color: stockColor,
                                fontWeight: 'bold',
                                fontSize: '14px',
                              }}
                            >
                              {product.stock} units
                            </Box>
                          </Box>
                          <Box as="td" padding={3} style={{ textAlign: 'right' }}>
                            <Typography fontWeight="semiBold" style={{ color: '#666' }}>
                              ${product.price.toFixed(2)}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              </Box>
            </Box>
          )}

          {/* Category Statistics */}
          {stats.categoryStats && stats.categoryStats.length > 0 && (
            <Box marginTop={6}>
              <Typography variant="beta" marginBottom={4}>
                Products by Category
              </Typography>
              <Box background="neutral0" padding={4} hasRadius shadow="tableShadow">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.categoryStats} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" stroke="#999" style={{ fontSize: '12px' }} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="#999"
                      style={{ fontSize: '12px' }}
                      width={120}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '2px solid #f97316',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="#f97316"
                      radius={[0, 8, 8, 0]}
                      animationDuration={1500}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          )}

          {/* User Growth */}
          {stats.userGrowth && stats.userGrowth.length > 0 && (
            <Box marginTop={6}>
              <Typography variant="beta" marginBottom={4}>
                User Growth (Last 12 Months)
              </Typography>
              <Box background="neutral0" padding={4} hasRadius shadow="tableShadow">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={stats.userGrowth}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#5cb176" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#5cb176" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="month"
                      stroke="#999"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis
                      stroke="#999"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '2px solid #5cb176',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                      labelStyle={{ fontWeight: 'bold', color: '#333' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#5cb176"
                      strokeWidth={3}
                      fill="url(#colorUsers)"
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          )}
        </Box>
      </ContentLayout>
    </Layout>
  );
};

export default Dashboard;
