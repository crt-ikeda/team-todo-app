/**
 * Express サーバーのエントリーポイント（JavaScript版）
 * 動作確認のための簡易版
 */

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// データベース接続
const dbPath = path.resolve('./database.sqlite');
const db = new sqlite3.Database(dbPath);

// ミドルウェア設定
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// データベース初期化
const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // usersテーブル作成
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('usersテーブル作成エラー:', err);
          return reject(err);
        }
        console.log('usersテーブルを作成しました');
      });

      // todosテーブル作成
      db.run(`
        CREATE TABLE IF NOT EXISTS todos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title VARCHAR(200) NOT NULL,
          description TEXT,
          is_completed BOOLEAN DEFAULT FALSE,
          is_shared BOOLEAN DEFAULT FALSE,
          user_id INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `, (err) => {
        if (err) {
          console.error('todosテーブル作成エラー:', err);
          return reject(err);
        }
        console.log('todosテーブルを作成しました');
        resolve();
      });
    });
  });
};

// 認証ミドルウェア
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        error: '認証が必要です',
        message: 'Authorizationヘッダーが見つかりません' 
      });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ 
        error: '認証エラー',
        message: '無効なトークン形式です' 
      });
    }

    const token = parts[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: '認証エラー',
        message: 'トークンの有効期限が切れています' 
      });
    }
    
    return res.status(401).json({ 
      error: '認証エラー',
      message: '無効なトークンです' 
    });
  }
};

// ユーザー登録
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ 
        error: '入力エラー',
        message: 'ユーザー名、メールアドレス、パスワードは必須です' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: '入力エラー',
        message: 'パスワードは6文字以上である必要があります' 
      });
    }

    // 重複チェック
    db.get('SELECT id FROM users WHERE username = ? OR email = ?', [username, email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'データベースエラー' });
      }

      if (user) {
        return res.status(409).json({ 
          error: '登録エラー',
          message: 'ユーザー名またはメールアドレスは既に使用されています' 
        });
      }

      // パスワードハッシュ化
      const passwordHash = await bcrypt.hash(password, 10);

      // ユーザー作成
      db.run('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)', 
        [username, email, passwordHash], 
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'ユーザー作成エラー' });
          }

          const token = jwt.sign(
            { userId: this.lastID, username, email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
          );

          res.status(201).json({
            message: 'ユーザー登録が完了しました',
            user: { id: this.lastID, username, email },
            token
          });
        });
    });
  } catch (error) {
    console.error('登録エラー:', error);
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

// ログイン
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        error: '入力エラー',
        message: 'ユーザー名とパスワードは必須です' 
      });
    }

    db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, username], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'データベースエラー' });
      }

      if (!user) {
        return res.status(401).json({ 
          error: 'ログインエラー',
          message: 'ユーザー名またはパスワードが正しくありません' 
        });
      }

      const isValidPassword = await bcrypt.compare(password, user.password_hash);

      if (!isValidPassword) {
        return res.status(401).json({ 
          error: 'ログインエラー',
          message: 'ユーザー名またはパスワードが正しくありません' 
        });
      }

      const token = jwt.sign(
        { userId: user.id, username: user.username, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'ログインに成功しました',
        user: { id: user.id, username: user.username, email: user.email },
        token
      });
    });
  } catch (error) {
    console.error('ログインエラー:', error);
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

// ユーザー情報取得
app.get('/api/auth/me', authMiddleware, (req, res) => {
  const userId = req.user.userId;

  db.get('SELECT id, username, email, created_at FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'データベースエラー' });
    }

    if (!user) {
      return res.status(404).json({ error: 'ユーザーが見つかりません' });
    }

    res.json({ user });
  });
});

// Todo一覧取得
app.get('/api/todos', (req, res) => {
  const { type = 'all' } = req.query;
  const authHeader = req.headers.authorization;
  let userId = null;

  // オプショナル認証
  if (authHeader) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userId;
    } catch (error) {
      // トークンが無効でも続行
    }
  }

  let query = '';
  let params = [];

  if (type === 'personal' && userId) {
    query = `
      SELECT t.*, u.username as author_name
      FROM todos t
      JOIN users u ON t.user_id = u.id
      WHERE t.user_id = ? AND t.is_shared = 0
      ORDER BY t.created_at DESC
    `;
    params = [userId];
  } else if (type === 'shared') {
    query = `
      SELECT t.*, u.username as author_name
      FROM todos t
      JOIN users u ON t.user_id = u.id
      WHERE t.is_shared = 1
      ORDER BY t.created_at DESC
    `;
  } else {
    if (userId) {
      query = `
        SELECT t.*, u.username as author_name
        FROM todos t
        JOIN users u ON t.user_id = u.id
        WHERE t.is_shared = 1 OR t.user_id = ?
        ORDER BY t.created_at DESC
      `;
      params = [userId];
    } else {
      query = `
        SELECT t.*, u.username as author_name
        FROM todos t
        JOIN users u ON t.user_id = u.id
        WHERE t.is_shared = 1
        ORDER BY t.created_at DESC
      `;
    }
  }

  db.all(query, params, (err, todos) => {
    if (err) {
      console.error('Todo取得エラー:', err);
      return res.status(500).json({ error: 'データベースエラー' });
    }

    res.json({ todos, count: todos.length });
  });
});

// Todo作成
app.post('/api/todos', authMiddleware, (req, res) => {
  const { title, description = '', is_shared = false } = req.body;
  const userId = req.user.userId;

  if (!title || title.trim().length === 0) {
    return res.status(400).json({ 
      error: '入力エラー',
      message: 'タイトルは必須です' 
    });
  }

  db.run('INSERT INTO todos (title, description, is_shared, user_id) VALUES (?, ?, ?, ?)',
    [title.trim(), description.trim(), is_shared ? 1 : 0, userId],
    function(err) {
      if (err) {
        console.error('Todo作成エラー:', err);
        return res.status(500).json({ error: 'データベースエラー' });
      }

      // 作成したTodoを取得
      db.get(`
        SELECT t.*, u.username as author_name
        FROM todos t
        JOIN users u ON t.user_id = u.id
        WHERE t.id = ?
      `, [this.lastID], (err, todo) => {
        if (err) {
          console.error('Todo取得エラー:', err);
          return res.status(500).json({ error: 'データベースエラー' });
        }

        res.status(201).json({
          message: 'Todoを作成しました',
          todo
        });
      });
    });
});

// ヘルスチェック
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'Team Todo API is running',
    timestamp: new Date().toISOString()
  });
});

// サーバー起動
const startServer = async () => {
  try {
    await initDatabase();
    console.log('データベースの初期化が完了しました');

    app.listen(PORT, () => {
      console.log(`
========================================
Team Todo API サーバーが起動しました
URL: http://localhost:${PORT}
環境: ${process.env.NODE_ENV || 'development'}
========================================
      `);
    });
  } catch (error) {
    console.error('サーバー起動エラー:', error);
    process.exit(1);
  }
};

startServer();