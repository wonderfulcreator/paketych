-- Схема базы данных Пакет Пакетыч
-- Выполнить один раз через Yandex Cloud Console → SQL или через psql

-- ── Пользователи ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  email       VARCHAR(255) UNIQUE NOT NULL,
  name        VARCHAR(255) NOT NULL,
  company     VARCHAR(255) NOT NULL,
  phone       VARCHAR(50)  NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ── Заказы ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id            SERIAL PRIMARY KEY,
  order_id      VARCHAR(20) UNIQUE NOT NULL,  -- PP-123456
  user_id       INTEGER REFERENCES users(id) ON DELETE SET NULL,
  status        VARCHAR(20) DEFAULT 'new'
                CHECK (status IN ('new','processing','quoted','done','cancelled')),
  comment       TEXT DEFAULT '',
  discount_pct  INTEGER DEFAULT 0,
  total_base    NUMERIC(12,2) DEFAULT 0,
  total_final   NUMERIC(12,2) DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id   ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_id  ON orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_status    ON orders(status);

-- ── Позиции заказа ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id              SERIAL PRIMARY KEY,
  order_id        INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id      VARCHAR(10)  NOT NULL,
  sku             VARCHAR(50)  NOT NULL,
  title           VARCHAR(500) NOT NULL,
  boxes           INTEGER NOT NULL DEFAULT 1,
  pcs_per_box     INTEGER NOT NULL DEFAULT 200,
  base_price      NUMERIC(10,2) NOT NULL,
  effective_price NUMERIC(10,2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- ── Избранное ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS favorites (
  user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
  product_id VARCHAR(10) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, product_id)
);

-- ── Сессии ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- ── Автообновление updated_at ─────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
