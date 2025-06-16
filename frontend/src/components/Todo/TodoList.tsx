/**
 * Todoリストコンポーネント
 * Todo一覧の表示と管理を行います
 */

import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { Todo } from '../../types';
import TodoItem from './TodoItem';
import TodoForm from './TodoForm';
import { useAuth } from '../../context/AuthContext';

type TodoType = 'all' | 'personal' | 'shared';

const TodoList: React.FC = () => {
  const { user } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [activeTab, setActiveTab] = useState<TodoType>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  /**
   * Todo一覧を取得
   */
  const fetchTodos = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await apiClient.get('/todos', {
        params: { type: activeTab }
      });
      setTodos(response.data.todos);
    } catch (err: any) {
      setError('Todoの取得に失敗しました');
      console.error('Todo取得エラー:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // タブが変更されたら Todo を再取得
  useEffect(() => {
    fetchTodos();
  }, [activeTab]);

  /**
   * Todo追加処理
   */
  const handleAddTodo = async (newTodo: Todo) => {
    setTodos(prev => [newTodo, ...prev]);
  };

  /**
   * Todo更新処理
   */
  const handleUpdateTodo = async (updatedTodo: Todo) => {
    setTodos(prev => 
      prev.map(todo => todo.id === updatedTodo.id ? updatedTodo : todo)
    );
  };

  /**
   * Todo削除処理
   */
  const handleDeleteTodo = async (todoId: number) => {
    try {
      await apiClient.delete(`/todos/${todoId}`);
      setTodos(prev => prev.filter(todo => todo.id !== todoId));
    } catch (err: any) {
      console.error('Todo削除エラー:', err);
      alert('Todoの削除に失敗しました');
    }
  };

  /**
   * 完了状態切り替え処理
   */
  const handleToggleComplete = async (todoId: number, isCompleted: boolean) => {
    try {
      const response = await apiClient.put(`/todos/${todoId}`, {
        is_completed: !isCompleted
      });
      handleUpdateTodo(response.data.todo);
    } catch (err: any) {
      console.error('Todo更新エラー:', err);
      alert('Todoの更新に失敗しました');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* タブ切り替え */}
        <div className="flex border-b mb-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 font-semibold ${
              activeTab === 'all'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            すべて
          </button>
          {user && (
            <>
              <button
                onClick={() => setActiveTab('personal')}
                className={`px-4 py-2 font-semibold ml-4 ${
                  activeTab === 'personal'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                個人Todo
              </button>
              <button
                onClick={() => setActiveTab('shared')}
                className={`px-4 py-2 font-semibold ml-4 ${
                  activeTab === 'shared'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                共有Todo
              </button>
            </>
          )}
        </div>

        {/* Todo作成フォーム（ログイン時のみ） */}
        {user && (
          <div className="mb-6">
            <TodoForm onAddTodo={handleAddTodo} />
          </div>
        )}

        {/* エラー表示 */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Todo一覧 */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">読み込み中...</p>
          </div>
        ) : todos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Todoがありません</p>
            {user && <p className="mt-2">新しいTodoを作成してください</p>}
          </div>
        ) : (
          <div className="space-y-2">
            {todos.map(todo => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onUpdate={handleUpdateTodo}
                onDelete={handleDeleteTodo}
                onToggleComplete={handleToggleComplete}
                canEdit={user?.id === todo.user_id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoList;