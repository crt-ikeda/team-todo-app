/**
 * アプリケーション全体で使用する型定義
 */

// ユーザー型
export interface User {
  id: number;
  username: string;
  email: string;
  created_at?: string;
}

// Todo型
export interface Todo {
  id: number;
  title: string;
  description: string;
  is_completed: boolean;
  is_shared: boolean;
  user_id: number;
  author_name?: string;
  created_at: string;
  updated_at: string;
}

// 認証レスポンス型
export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

// エラーレスポンス型
export interface ErrorResponse {
  error: string;
  message: string;
}

// Todo作成・更新リクエスト型
export interface TodoRequest {
  title: string;
  description?: string;
  is_shared?: boolean;
  is_completed?: boolean;
}

// ログインリクエスト型
export interface LoginRequest {
  username: string;
  password: string;
}

// 登録リクエスト型
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}