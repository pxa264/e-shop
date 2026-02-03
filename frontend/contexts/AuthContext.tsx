'use client';

/**
 * AuthContext - 用户认证上下文
 *
 * 功能说明：
 * - 管理全局用户认证状态
 * - 提供 JWT Token 存储和验证
 * - 提供登录、注册、登出方法
 * - 自动检查 token 并获取用户信息
 *
 * 使用方式：
 * ```tsx
 * const { user, login, logout, loading } = useAuth();
 * ```
 *
 * 注意：
 * - Token 存储在 localStorage（生产环境建议使用 httpOnly Cookie）
 * - 自动处理 token 过期和刷新
 * - 所有认证请求都会携带 JWT token
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 用户信息类型
interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  avatar?: string;
  createdAt?: string;
}

// 认证上下文类型
interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  isAuthenticated: boolean;
}

// 创建上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// API 基础 URL（浏览器端通过 nginx 代理访问）
const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

/**
 * AuthProvider - 认证上下文提供者
 *
 * 功能：
 * - 包装整个应用，提供全局认证状态
 * - 自动检查和刷新 token
 * - 提供认证相关方法
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * 获取当前用户信息
   *
   * 使用存储的 token 获取用户详细信息
   * 如果 token 无效，自动清除用户状态
   */
  const getCurrentUser = async (jwt: string) => {
    try {
      const response = await fetch(`${API_URL}/api/user-profile/me`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  };

  /**
   * 初始化认证状态
   *
   * 组件挂载时：
   * 1. 从 localStorage 读取 token
   * 2. 如果存在 token，获取用户信息
   * 3. 如果 token 无效，清除存储
   */
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('jwt');

        if (storedToken) {
          const userData = await getCurrentUser(storedToken);
          setUser(userData.data);
          setToken(storedToken);
        }
      } catch (error) {
        // Token 无效或过期，清除存储
        localStorage.removeItem('jwt');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * 用户登录
   *
   * @param email - 用户邮箱
   * @param password - 用户密码
   *
   * 流程：
   * 1. 调用 Strapi 内置登录 API (/api/auth/local)
   * 2. 存储 JWT token
   * 3. 获取用户信息
   * 4. 更新全局状态
   */
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/local`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: email,
          password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Login failed');
      }

      const data = await response.json();
      const { jwt, user: userData } = data;

      // 存储 token
      localStorage.setItem('jwt', jwt);
      setToken(jwt);
      setUser(userData);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  /**
   * 用户注册
   *
   * @param username - 用户名
   * @param email - 用户邮箱
   * @param password - 用户密码
   *
   * 流程：
   * 1. 调用 Strapi 内置注册 API (/api/auth/local/register)
   * 2. 自动登录新用户
   * 3. 更新全局状态
   */
  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/local/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Registration failed');
      }

      const data = await response.json();
      const { jwt, user: userData } = data;

      // 如果启用了邮箱确认，Strapi 只返回 user，不返回 jwt
      if (!jwt) {
        return;
      }

      // 存储 token
      localStorage.setItem('jwt', jwt);
      setToken(jwt);
      setUser(userData);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  /**
   * 用户登出
   *
   * 流程：
   * 1. 清除 localStorage 中的 token
   * 2. 重置用户状态
   * 3. 重定向到首页（由调用方处理）
   */
  const logout = () => {
    localStorage.removeItem('jwt');
    setToken(null);
    setUser(null);
  };

  /**
   * 刷新 Token
   *
   * 重新获取用户信息，确保认证状态有效
   */
  const refreshToken = async () => {
    if (!token) return;

    try {
      const userData = await getCurrentUser(token);
      setUser(userData.data);
    } catch (error) {
      // Token 无效，登出用户
      logout();
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    refreshToken,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth - 认证上下文 Hook
 *
 * 在组件中访问认证状态和方法
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, login, logout, loading } = useAuth();
 *
 *   if (loading) return <div>Loading...</div>;
 *
 *   return <div>Welcome {user?.username}</div>;
 * }
 * ```
 *
 * @throws {Error} 如果在 AuthProvider 外部使用
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
