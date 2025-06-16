# Team Todo App - 社内SE向け学習用アプリケーション

## 概要

このプロジェクトは、社内SEに対してWEBアプリケーションの動作原理を実践的に解説するための学習用ToDoアプリケーションです。フロントエンド・バックエンド・データベースの連携を具体的に理解できるよう設計されています。

## アーキテクチャ

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   フロントエンド  │◄──►│   バックエンド   │◄──►│  データベース    │
│   (React)       │    │   (Express)     │    │   (SQLite)      │
│                 │    │                 │    │                 │
│ ・ユーザーUI     │    │ ・API エンドポイント │    │ ・users テーブル │
│ ・状態管理       │    │ ・認証処理       │    │ ・todos テーブル │
│ ・HTTP通信      │    │ ・ビジネスロジック │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 技術スタック

- **フロントエンド**
  - React 18 + TypeScript
  - Tailwind CSS (スタイリング)
  - Axios (HTTP通信)
  - Context API (状態管理)

- **バックエンド**
  - Express.js (Node.js フレームワーク)
  - TypeScript
  - SQLite3 (データベース)
  - JWT (認証)
  - bcryptjs (パスワードハッシュ化)

## 機能

### ユーザー認証
- ユーザー登録
- ログイン/ログアウト
- JWTトークンによるセッション管理

### Todo管理
- **全体共有Todo**: チーム全員が参照可能
- **個人Todo**: ログインユーザーのみが参照・編集可能
- CRUD操作（作成・読取・更新・削除）
- 完了状態の切り替え

## セットアップ手順

### 前提条件
- Node.js 16以上
- npm または yarn
- Git

### インストール

1. リポジトリをクローン
```bash
git clone https://github.com/crt-ikeda/team-todo-app.git
cd team-todo-app
```

2. バックエンドのセットアップ
```bash
cd backend
npm install
```

3. フロントエンドのセットアップ
```bash
cd ../frontend
npm install
```

### 環境変数の設定

バックエンドの `.env` ファイルを作成：
```
PORT=3001
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
DATABASE_PATH=./database.sqlite
```

### 起動方法

1. バックエンドサーバーの起動
```bash
cd backend
npm run dev
```
サーバーは http://localhost:3001 で起動します。

2. フロントエンドの起動
```bash
cd frontend
npm start
```
アプリケーションは http://localhost:3000 で起動します。

## API仕様

### 認証API

- **POST /api/auth/register** - ユーザー登録
- **POST /api/auth/login** - ログイン
- **GET /api/auth/me** - ユーザー情報取得（要認証）

### Todo API

- **GET /api/todos** - Todo一覧取得
  - クエリパラメータ: `type=all|personal|shared`
- **POST /api/todos** - Todo作成（要認証）
- **PUT /api/todos/:id** - Todo更新（要認証）
- **DELETE /api/todos/:id** - Todo削除（要認証）

## データベース設計

### users テーブル
- id (PRIMARY KEY)
- username (UNIQUE)
- email (UNIQUE)
- password_hash
- created_at

### todos テーブル
- id (PRIMARY KEY)
- title
- description
- is_completed
- is_shared
- user_id (FOREIGN KEY)
- created_at
- updated_at

## 開発のポイント

### セキュリティ
- パスワードはbcryptでハッシュ化
- JWTトークンによる認証
- CORS設定による適切なアクセス制御

### データフロー
1. ユーザーがフロントエンドで操作
2. ReactがAPIリクエストを送信
3. ExpressがJWT認証を確認
4. データベース操作を実行
5. レスポンスをフロントエンドに返却
6. Reactが画面を更新

## 学習のための拡張案

1. **機能追加**
   - 期限設定機能
   - カテゴリ分類
   - 検索・フィルター機能

2. **技術的な改善**
   - Redux導入
   - WebSocket でリアルタイム更新
   - テストコードの追加

3. **本番環境対応**
   - PostgreSQL への移行
   - Docker 化
   - CI/CD パイプライン構築

## ライセンス

このプロジェクトは教育目的で作成されています。