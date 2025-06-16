/**
 * Todo作成フォームコンポーネント
 * 新しいTodoを作成します
 */

import React, { useState } from 'react';
import apiClient from '../../api/client';
import { Todo, TodoRequest } from '../../types';

interface TodoFormProps {
  onAddTodo: (todo: Todo) => void;
}

const TodoForm: React.FC<TodoFormProps> = ({ onAddTodo }) => {
  const [formData, setFormData] = useState<TodoRequest>({
    title: '',
    description: '',
    is_shared: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * フォーム送信処理
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('タイトルを入力してください');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/todos', {
        title: formData.title.trim(),
        description: formData.description.trim(),
        is_shared: formData.is_shared,
      });
      
      onAddTodo(response.data.todo);
      
      // フォームをリセット
      setFormData({
        title: '',
        description: '',
        is_shared: false,
      });
    } catch (err: any) {
      setError('Todoの作成に失敗しました');
      console.error('Todo作成エラー:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 入力フィールドの変更処理
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">新しいTodoを作成</h3>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
          タイトル
        </label>
        <input
          id="title"
          name="title"
          type="text"
          value={formData.title}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="やることを入力..."
          maxLength={200}
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
          説明（任意）
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="詳細な説明を入力..."
          rows={3}
        />
      </div>

      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            name="is_shared"
            checked={formData.is_shared}
            onChange={handleChange}
            className="mr-2 h-4 w-4 text-blue-600"
          />
          <span className="text-gray-700">チーム全体で共有する</span>
        </label>
        <p className="text-gray-600 text-xs mt-1">
          チェックすると、他のメンバーもこのTodoを見ることができます
        </p>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '作成中...' : 'Todoを作成'}
        </button>
      </div>
    </form>
  );
};

export default TodoForm;