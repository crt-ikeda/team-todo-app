/**
 * Todo個別アイテムコンポーネント
 * 個々のTodoの表示と操作を行います
 */

import React, { useState } from 'react';
import { Todo } from '../../types';
import apiClient from '../../api/client';

interface TodoItemProps {
  todo: Todo;
  onUpdate: (todo: Todo) => void;
  onDelete: (todoId: number) => void;
  onToggleComplete: (todoId: number, isCompleted: boolean) => void;
  canEdit: boolean;
}

const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onUpdate,
  onDelete,
  onToggleComplete,
  canEdit,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * 編集内容を保存
   */
  const handleSave = async () => {
    if (!editTitle.trim()) {
      alert('タイトルは必須です');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.put(`/todos/${todo.id}`, {
        title: editTitle.trim(),
        description: editDescription.trim(),
      });
      onUpdate(response.data.todo);
      setIsEditing(false);
    } catch (err: any) {
      alert('更新に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 編集をキャンセル
   */
  const handleCancel = () => {
    setEditTitle(todo.title);
    setEditDescription(todo.description);
    setIsEditing(false);
  };

  /**
   * 削除確認
   */
  const handleDelete = () => {
    if (window.confirm('このTodoを削除しますか？')) {
      onDelete(todo.id);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow p-4 ${todo.is_completed ? 'opacity-75' : ''}`}>
      {isEditing ? (
        // 編集モード
        <div className="space-y-3">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="タイトル"
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="説明（任意）"
            rows={3}
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={isLoading}
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      ) : (
        // 表示モード
        <div>
          <div className="flex items-start">
            {/* チェックボックス（編集権限がある場合のみ） */}
            {canEdit && (
              <input
                type="checkbox"
                checked={todo.is_completed}
                onChange={() => onToggleComplete(todo.id, todo.is_completed)}
                className="mt-1 mr-3 h-5 w-5 text-blue-600"
              />
            )}

            <div className="flex-1">
              <h3 className={`font-semibold ${todo.is_completed ? 'line-through text-gray-500' : ''}`}>
                {todo.title}
              </h3>
              {todo.description && (
                <p className="text-gray-600 mt-1">{todo.description}</p>
              )}
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <span>{todo.author_name}</span>
                <span className="mx-2">•</span>
                <span>{todo.is_shared ? '共有' : '個人'}</span>
                <span className="mx-2">•</span>
                <span>{new Date(todo.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {/* 操作ボタン（編集権限がある場合のみ） */}
            {canEdit && (
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  編集
                </button>
                <button
                  onClick={handleDelete}
                  className="text-red-500 hover:text-red-700"
                >
                  削除
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoItem;