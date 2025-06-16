/**
 * ヘッダーコンポーネント
 * ナビゲーションとユーザー情報を表示
 */

import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* ロゴ・タイトル */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold">Team Todo App</h1>
          </div>

          {/* ユーザー情報・ログアウト */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm">
                  こんにちは、<span className="font-semibold">{user.username}</span>さん
                </span>
                <button
                  onClick={logout}
                  className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded text-sm transition duration-200"
                >
                  ログアウト
                </button>
              </>
            ) : (
              <span className="text-sm">未ログイン</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;