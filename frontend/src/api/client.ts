/**
 * API クライアント設定
 * バックエンドとの通信を管理します
 */

import axios from 'axios';

// API のベースURL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// axios インスタンスを作成
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター
// 認証トークンを自動的にヘッダーに追加
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプター
// 401エラー（認証エラー）の場合、ログイン画面にリダイレクト
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // トークンが無効な場合、ローカルストレージをクリア
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // ログイン画面にリダイレクト（Reactルーターを使用しない簡易版）
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;