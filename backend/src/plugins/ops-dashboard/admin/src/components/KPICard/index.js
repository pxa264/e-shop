import React from 'react';
import { Box, Typography, Flex } from '@strapi/design-system';
import { ShoppingCart, User, Package, Coin } from '@strapi/icons';
import CountUp from 'react-countup';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const KPICard = ({ title, value, color = 'primary', icon, trend, sparkline = [] }) => {
  const colorConfig = {
    primary: {
      bg: '#f0f0ff',
      border: '#4945ff',
      text: '#4945ff',
      icon: '#4945ff',
    },
    success: {
      bg: '#f0fdf4',
      border: '#5cb176',
      text: '#16a34a',
      icon: '#5cb176',
    },
    warning: {
      bg: '#fffbeb',
      border: '#f29d41',
      text: '#d97706',
      icon: '#f29d41',
    },
    danger: {
      bg: '#fef2f2',
      border: '#d02b20',
      text: '#dc2626',
      icon: '#d02b20',
    },
  };

  const config = colorConfig[color];
  const IconComponent = icon;

  // Parse numeric value for CountUp
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
  const isNumeric = !isNaN(numericValue);
  const prefix = typeof value === 'string' && value.includes('$') ? '$' : '';

  // Determine trend direction and color
  const trendDirection = trend > 0 ? '↑' : trend < 0 ? '↓' : '→';
  const trendColor = trend > 0 ? '#16a34a' : trend < 0 ? '#dc2626' : '#6b7280';

  // Prepare sparkline data
  const sparklineData = sparkline.map((val, idx) => ({ value: val, index: idx }));

  return (
    <Box
      background="neutral0"
      padding={6}
      hasRadius
      shadow="filterShadow"
      style={{
        border: `2px solid ${config.border}`,
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        height: '200px',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 4px rgba(33,33,52,.1)';
      }}
    >
      <Flex direction="column" gap={3}>
        <Flex justifyContent="space-between" alignItems="flex-start">
          <Typography variant="sigma" textColor="neutral600" textTransform="uppercase">
            {title}
          </Typography>
          {IconComponent && (
            <Box
              padding={2}
              hasRadius
              style={{
                backgroundColor: config.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconComponent style={{ color: config.icon, width: '20px', height: '20px' }} />
            </Box>
          )}
        </Flex>

        <Typography
          variant="alpha"
          fontWeight="bold"
          style={{
            color: config.text,
            fontSize: '32px',
            lineHeight: '1.2',
          }}
        >
          {isNumeric ? (
            <>
              {prefix}
              <CountUp end={numericValue} duration={2} separator="," decimals={prefix ? 2 : 0} />
            </>
          ) : (
            value
          )}
        </Typography>

        {/* Trend Indicator */}
        {trend !== undefined && (
          <Flex alignItems="center" gap={2}>
            <Typography
              variant="pi"
              fontWeight="bold"
              style={{
                color: trendColor,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span style={{ fontSize: '16px' }}>{trendDirection}</span>
              {Math.abs(trend)}%
            </Typography>
            <Typography variant="pi" textColor="neutral500" style={{ fontSize: '12px' }}>
              vs last 30 days
            </Typography>
          </Flex>
        )}

        {/* Mini Sparkline Chart */}
        <Box style={{ height: '40px', marginTop: '8px', opacity: 0.7 }}>
          {sparklineData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={config.border}
                  strokeWidth={2}
                  dot={false}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '100%' }} />
          )}
        </Box>
      </Flex>
    </Box>
  );
};

export default KPICard;
