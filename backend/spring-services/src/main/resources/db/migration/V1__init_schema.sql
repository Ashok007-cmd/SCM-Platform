-- ============================================================
-- SCM Platform — V1 Initial Database Schema
-- Flyway Migration: V1__init_schema.sql
-- Covers: Suppliers, Inventory, Orders, Logistics, Warehouse,
--         Procurement, Quality, Finance, Compliance modules
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- full-text search

-- ─── ENUM Types ───────────────────────────────────────────────
CREATE TYPE supplier_status   AS ENUM ('ACTIVE','INACTIVE','BLACKLISTED','PENDING_APPROVAL');
CREATE TYPE order_status      AS ENUM ('DRAFT','CONFIRMED','IN_PRODUCTION','SHIPPED','DELIVERED','CANCELLED','RETURNED');
CREATE TYPE shipment_status   AS ENUM ('PENDING','IN_TRANSIT','OUT_FOR_DELIVERY','DELIVERED','DELAYED','LOST');
CREATE TYPE inventory_status  AS ENUM ('IN_STOCK','LOW_STOCK','OUT_OF_STOCK','DISCONTINUED');
CREATE TYPE po_status         AS ENUM ('DRAFT','SENT','ACKNOWLEDGED','PARTIALLY_RECEIVED','RECEIVED','CANCELLED');
CREATE TYPE quality_result    AS ENUM ('PASS','FAIL','CONDITIONAL_PASS','PENDING');
CREATE TYPE risk_level        AS ENUM ('LOW','MEDIUM','HIGH','CRITICAL');

-- ─── Suppliers ────────────────────────────────────────────────
CREATE TABLE suppliers (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code            VARCHAR(20)  UNIQUE NOT NULL,
    name            VARCHAR(200) NOT NULL,
    country         VARCHAR(100) NOT NULL,
    region          VARCHAR(100),
    contact_email   VARCHAR(255) NOT NULL,
    contact_phone   VARCHAR(50),
    website         VARCHAR(255),
    status          supplier_status NOT NULL DEFAULT 'PENDING_APPROVAL',
    risk_level      risk_level      NOT NULL DEFAULT 'LOW',
    lead_time_days  INTEGER NOT NULL DEFAULT 14,
    payment_terms   VARCHAR(100),
    currency        CHAR(3) NOT NULL DEFAULT 'USD',
    rating          NUMERIC(3,2) CHECK (rating BETWEEN 0 AND 5),
    is_preferred    BOOLEAN NOT NULL DEFAULT FALSE,
    onboarded_at    TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ─── Products / SKUs ─────────────────────────────────────────
CREATE TABLE products (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku             VARCHAR(50)  UNIQUE NOT NULL,
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    category        VARCHAR(100) NOT NULL,
    sub_category    VARCHAR(100),
    unit_of_measure VARCHAR(20)  NOT NULL DEFAULT 'UNIT',
    weight_kg       NUMERIC(10,3),
    dimensions_cm   VARCHAR(50),
    unit_cost       NUMERIC(14,4) NOT NULL,
    unit_price      NUMERIC(14,4) NOT NULL,
    currency        CHAR(3) NOT NULL DEFAULT 'USD',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ─── Inventory ────────────────────────────────────────────────
CREATE TABLE inventory (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id          UUID NOT NULL REFERENCES products(id),
    warehouse_code      VARCHAR(20) NOT NULL,
    quantity_on_hand    INTEGER NOT NULL DEFAULT 0,
    quantity_reserved   INTEGER NOT NULL DEFAULT 0,
    quantity_available  INTEGER GENERATED ALWAYS AS (quantity_on_hand - quantity_reserved) STORED,
    reorder_point       INTEGER NOT NULL DEFAULT 10,
    reorder_quantity    INTEGER NOT NULL DEFAULT 100,
    max_stock_level     INTEGER,
    status              inventory_status NOT NULL DEFAULT 'IN_STOCK',
    last_counted_at     TIMESTAMP WITH TIME ZONE,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (product_id, warehouse_code),
    CHECK (quantity_on_hand >= 0),
    CHECK (quantity_reserved >= 0)
);

-- ─── Customers ────────────────────────────────────────────────
CREATE TABLE customers (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code            VARCHAR(20)  UNIQUE NOT NULL,
    name            VARCHAR(200) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    phone           VARCHAR(50),
    country         VARCHAR(100) NOT NULL,
    address         TEXT,
    credit_limit    NUMERIC(14,2),
    currency        CHAR(3) NOT NULL DEFAULT 'USD',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ─── Orders ──────────────────────────────────────────────────
CREATE TABLE orders (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number    VARCHAR(30) UNIQUE NOT NULL,
    customer_id     UUID NOT NULL REFERENCES customers(id),
    status          order_status NOT NULL DEFAULT 'DRAFT',
    order_date      DATE NOT NULL DEFAULT CURRENT_DATE,
    required_date   DATE,
    shipped_date    DATE,
    total_amount    NUMERIC(14,2) NOT NULL DEFAULT 0,
    currency        CHAR(3) NOT NULL DEFAULT 'USD',
    shipping_address TEXT,
    notes           TEXT,
    created_by      VARCHAR(100),
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id      UUID NOT NULL REFERENCES products(id),
    quantity        INTEGER NOT NULL CHECK (quantity > 0),
    unit_price      NUMERIC(14,4) NOT NULL,
    discount_pct    NUMERIC(5,2) NOT NULL DEFAULT 0,
    line_total      NUMERIC(14,2) GENERATED ALWAYS AS
                    (quantity * unit_price * (1 - discount_pct / 100)) STORED,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ─── Purchase Orders (Procurement) ───────────────────────────
CREATE TABLE purchase_orders (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_number       VARCHAR(30) UNIQUE NOT NULL,
    supplier_id     UUID NOT NULL REFERENCES suppliers(id),
    status          po_status NOT NULL DEFAULT 'DRAFT',
    order_date      DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_date   DATE,
    received_date   DATE,
    total_amount    NUMERIC(14,2) NOT NULL DEFAULT 0,
    currency        CHAR(3) NOT NULL DEFAULT 'USD',
    payment_terms   VARCHAR(100),
    notes           TEXT,
    approved_by     VARCHAR(100),
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE po_items (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_id           UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id      UUID NOT NULL REFERENCES products(id),
    quantity_ordered   INTEGER NOT NULL CHECK (quantity_ordered > 0),
    quantity_received  INTEGER NOT NULL DEFAULT 0,
    unit_cost          NUMERIC(14,4) NOT NULL,
    line_total         NUMERIC(14,2) GENERATED ALWAYS AS (quantity_ordered * unit_cost) STORED
);

-- ─── Shipments / Logistics ────────────────────────────────────
CREATE TABLE shipments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tracking_number VARCHAR(100) UNIQUE NOT NULL,
    order_id        UUID REFERENCES orders(id),
    carrier         VARCHAR(100) NOT NULL,
    service_type    VARCHAR(100),
    status          shipment_status NOT NULL DEFAULT 'PENDING',
    origin_address  TEXT NOT NULL,
    dest_address    TEXT NOT NULL,
    shipped_at      TIMESTAMP WITH TIME ZONE,
    estimated_at    TIMESTAMP WITH TIME ZONE,
    delivered_at    TIMESTAMP WITH TIME ZONE,
    weight_kg       NUMERIC(10,3),
    freight_cost    NUMERIC(14,2),
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE shipment_events (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_id     UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    event_type      VARCHAR(100) NOT NULL,
    location        VARCHAR(255),
    description     TEXT,
    occurred_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ─── Quality Inspections ─────────────────────────────────────
CREATE TABLE quality_inspections (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_id           UUID REFERENCES purchase_orders(id),
    product_id      UUID NOT NULL REFERENCES products(id),
    supplier_id     UUID NOT NULL REFERENCES suppliers(id),
    inspector       VARCHAR(100) NOT NULL,
    result          quality_result NOT NULL DEFAULT 'PENDING',
    batch_number    VARCHAR(100),
    sample_size     INTEGER,
    defect_count    INTEGER DEFAULT 0,
    defect_rate     NUMERIC(5,2) GENERATED ALWAYS AS
                    (CASE WHEN sample_size > 0
                     THEN (defect_count::NUMERIC / sample_size) * 100
                     ELSE 0 END) STORED,
    notes           TEXT,
    inspected_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ─── Warehouses ───────────────────────────────────────────────
CREATE TABLE warehouses (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code            VARCHAR(20) UNIQUE NOT NULL,
    name            VARCHAR(200) NOT NULL,
    country         VARCHAR(100) NOT NULL,
    address         TEXT,
    capacity_sqm    NUMERIC(10,2),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    manager_name    VARCHAR(100),
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ─── Compliance Records ───────────────────────────────────────
CREATE TABLE compliance_records (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type     VARCHAR(50) NOT NULL, -- 'SUPPLIER', 'PRODUCT', 'SHIPMENT'
    entity_id       UUID NOT NULL,
    framework       VARCHAR(100) NOT NULL, -- 'ISO_9001', 'GDPR', 'REACH', 'ESG'
    status          VARCHAR(50) NOT NULL DEFAULT 'COMPLIANT',
    valid_from      DATE NOT NULL,
    valid_until     DATE,
    document_url    VARCHAR(500),
    notes           TEXT,
    reviewed_by     VARCHAR(100),
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ─── Indexes ──────────────────────────────────────────────────
CREATE INDEX idx_inventory_product     ON inventory(product_id);
CREATE INDEX idx_inventory_warehouse   ON inventory(warehouse_code);
CREATE INDEX idx_inventory_status      ON inventory(status);
CREATE INDEX idx_orders_customer       ON orders(customer_id);
CREATE INDEX idx_orders_status         ON orders(status);
CREATE INDEX idx_orders_date           ON orders(order_date DESC);
CREATE INDEX idx_order_items_order     ON order_items(order_id);
CREATE INDEX idx_po_supplier           ON purchase_orders(supplier_id);
CREATE INDEX idx_po_status             ON purchase_orders(status);
CREATE INDEX idx_shipments_order       ON shipments(order_id);
CREATE INDEX idx_shipments_status      ON shipments(status);
CREATE INDEX idx_shipments_tracking    ON shipments(tracking_number);
CREATE INDEX idx_quality_supplier      ON quality_inspections(supplier_id);
CREATE INDEX idx_suppliers_status      ON suppliers(status);
CREATE INDEX idx_suppliers_name_trgm   ON suppliers USING gin(name gin_trgm_ops);
CREATE INDEX idx_products_sku          ON products(sku);
CREATE INDEX idx_products_category     ON products(category);

-- ─── Updated_at trigger ───────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_suppliers_updated   BEFORE UPDATE ON suppliers          FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_products_updated    BEFORE UPDATE ON products           FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_inventory_updated   BEFORE UPDATE ON inventory          FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_customers_updated   BEFORE UPDATE ON customers          FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_orders_updated      BEFORE UPDATE ON orders             FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_po_updated          BEFORE UPDATE ON purchase_orders    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_shipments_updated   BEFORE UPDATE ON shipments          FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_compliance_updated  BEFORE UPDATE ON compliance_records FOR EACH ROW EXECUTE FUNCTION update_updated_at();
