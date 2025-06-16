/**
 * 認証コンテキスト
 * アプリケーション全体で認証状態を管理します
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '../api/client';
import { User, AuthResponse, LoginRequest, RegisterRequest } from '../types';

// 認証コンテキストの型定義
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

// コンテキストを作成
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProviderのプロパティ型
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * 認証プロバイダーコンポーネント
 * アプリケーション全体に認証機能を提供します
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * ログイン処理
   */
  const login = async (credentials: LoginRequest) => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      const { user, token } = response.data;
      
      // トークンとユーザー情報を保存
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
    } catch (error: any) {
      // エラーを再スロー（コンポーネント側でハンドリング）
      throw error.response?.data || { message: 'ログインに失敗しました' };
    }
  };

  /**
   * ユーザー登録処理
   */
  const register = async (userData: RegisterRequest) => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', userData);
      const { user, token } = response.data;
      
      // トークンとユーザー情報を保存
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
    } catch (error: any) {
      // エラーを再スロー（コンポーネント側でハンドリング）
      throw error.response?.data || { message: '登録に失敗しました' };
    }
  };

  /**
   * ログアウト処理
   */
  const logout = () => {
    // ローカルストレージをクリア
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  /**
   * 認証状態を確認
   * ページ読み込み時やトークン更新時に実行
   */
  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      // サーバーに認証状態を確認
      const response = await apiClient.get('/auth/me');
      const { user } = response.data;
      
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      // 認証エラーの場合、ローカルストレージをクリア
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // 初回マウント時に認証状態を確認
  useEffect(() => {
    checkAuth();
  }, []);

  // ローカルストレージからユーザー情報を復元
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser && !user) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('ユーザー情報の復元に失敗しました');
      }
    }
  }, [user]);

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * 認証コンテキストを使用するカスタムフック
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};