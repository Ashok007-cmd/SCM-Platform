-- ============================================================
-- V1__initial_schema.sql
-- SCM Platform — Initial Database Schema
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ============================================================
-- USERS & AUTH
-- ============================================================
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name     VARCHAR(255) NOT NULL,
    role          VARCHAR(50)  NOT NULL DEFAULT 'VIEWER',
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- ============================================================
-- SUPPLIERS
-- ============================================================
CREATE TABLE suppliers (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name             VARCHAR(255) NOT NULL,
    code             VARCHAR(50)  NOT NULL UNIQUE,
    country          VARCHAR(100),
    contact_email    VARCHAR(255),
    contact_phone    VARCHAR(50),
    risk_level       VARCHAR(20)  NOT NULL DEFAULT 'MEDIUM',
    status           VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    on_time_rate     DECIMAL(5,2),
    quality_score    DECIMAL(5,2),
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_suppliers_status    ON suppliers(status);
CREATE INDEX idx_suppliers_risk      ON suppliers(risk_level);

-- ============================================================
-- PRODUCTS & INVENTORY
-- ============================================================
CREATE TABLE products (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku           VARCHAR(100) NOT NULL UNIQUE,
    name          VARCHAR(255) NOT NULL,
    description   TEXT,
    category      VARCHAR(100),
    unit_cost     DECIMAL(12,2),
    unit_price    DECIMAL(12,2),
    reorder_point INTEGER      NOT NULL DEFAULT 0,
    reorder_qty   INTEGER      NOT NULL DEFAULT 0,
    supplier_id   UUID REFERENCES suppliers(id),
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_sku        ON products(sku);
CREATE INDEX idx_products_category   ON products(category);
CREATE INDEX idx_products_supplier   ON products(supplier_id);

CREATE TABLE inventory (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id      UUID NOT NULL REFERENCES products(id),
    warehouse_id    UUID,
    quantity_on_hand INTEGER NOT NULL DEFAULT 0,
    quantity_reserved INTEGER NOT NULL DEFAULT 0,
    quantity_available GENERATED ALWAYS AS (quantity_on_hand - quantity_reserved) STORED,
    last_counted_at TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(product_id, warehouse_id)
);

CREATE INDEX idx_inventory_product   ON inventory(product_id);
CREATE INDEX idx_inventory_warehouse ON inventory(warehouse_id);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE orders (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number   VARCHAR(50)  NOT NULL UNIQUE,
    customer_name  VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    status         VARCHAR(30)  NOT NULL DEFAULT 'PENDING',
    total_amount   DECIMAL(14,2),
    currency       CHAR(3)      NOT NULL DEFAULT 'USD',
    ordered_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    shipped_at     TIMESTAMPTZ,
    delivered_at   TIMESTAMPTZ,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_status       ON orders(status);
CREATE INDEX idx_orders_ordered_at   ON orders(ordered_at DESC);

CREATE TABLE order_items (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id  UUID NOT NULL REFERENCES products(id),
    quantity    INTEGER      NOT NULL,
    unit_price  DECIMAL(12,2) NOT NULL,
    line_total  GENERATED ALWAYS AS (quantity * unit_price) STORED
);

CREATE INDEX idx_order_items_order   ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- ============================================================
-- WAREHOUSES
-- ============================================================
CREATE TABLE warehouses (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name         VARCHAR(255) NOT NULL,
    code         VARCHAR(50)  NOT NULL UNIQUE,
    address      TEXT,
    city         VARCHAR(100),
    country      VARCHAR(100),
    capacity     INTEGER,
    is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- LOGISTICS / SHIPMENTS
-- ============================================================
CREATE TABLE shipments (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id         UUID REFERENCES orders(id),
    tracking_number  VARCHAR(100) UNIQUE,
    carrier          VARCHAR(100),
    status           VARCHAR(30)  NOT NULL DEFAULT 'PENDING',
    origin           VARCHAR(255),
    destination      VARCHAR(255),
    estimated_arrival TIMESTAMPTZ,
    actual_arrival   TIMESTAMPTZ,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_shipments_status    ON shipments(status);
CREATE INDEX idx_shipments_order     ON shipments(order_id);

-- ============================================================
-- PURCHASE ORDERS
-- ============================================================
CREATE TABLE purchase_orders (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_number       VARCHAR(50) NOT NULL UNIQUE,
    supplier_id     UUID NOT NULL REFERENCES suppliers(id),
    status          VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    total_amount    DECIMAL(14,2),
    currency        CHAR(3)     NOT NULL DEFAULT 'USD',
    requested_by    UUID REFERENCES users(id),
    approved_by     UUID REFERENCES users(id),
    requested_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    approved_at     TIMESTAMPTZ,
    expected_delivery TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_po_supplier ON purchase_orders(supplier_id);
CREATE INDEX idx_po_status   ON purchase_orders(status);

-- ============================================================
-- UPDATED_AT trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$ DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'users','suppliers','products','inventory',
    'orders','warehouses','shipments','purchase_orders'
  ]) LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION update_updated_at()', t, t);
  END LOOP;
END $$;
