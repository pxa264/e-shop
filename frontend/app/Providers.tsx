'use client';

/**
 * Providers - 应用全局 Provider 组件
 *
 * 功能说明：
 * - 包装所有客户端 Provider
 * - 包含 AuthProvider
 *
 * 使用方式：
 * 在 layout.tsx 中包裹 children
 */

import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster 
        position="top-center"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#1e293b',
            borderRadius: '1rem',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: 'bold',
            boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.1)',
            border: '1px solid #f1f5f9',
          },
          success: {
            iconTheme: {
              primary: '#d946ef',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </AuthProvider>
  );
}
