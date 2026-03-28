-- ============================================================
-- SCM Platform — PostgreSQL Initialization Script
-- ============================================================
-- Creates all schemas and initial tables for the platform.
-- Executed automatically by docker-entrypoint-initdb.d
-- ============================================================

-- Create schemas for each module
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS inventory;
CREATE SCHEMA IF NOT EXISTS procurement;
CREATE SCHEMA IF NOT EXISTS orders;
CREATE SCHEMA IF NOT EXISTS warehouse;
CREATE SCHEMA IF NOT EXISTS transport;
CREATE SCHEMA IF NOT EXISTS supplier;
CREATE SCHEMA IF NOT EXISTS analytics;
CREATE SCHEMA IF NOT EXISTS risk;
CREATE SCHEMA IF NOT EXISTS sustainability;
CREATE SCHEMA IF NOT EXISTS planning;

-- ──────────────────────────────────────────────────────────
-- AUTH, INVENTORY, PROCUREMENT SCHEMA TABLES
-- Removed from init.sql - These are now managed by Flyway migrations 
-- within their respective microservices.
-- ──────────────────────────────────────────────────────────

-- ──────────────────────────────────────────────────────────
-- ORDERS SCHEMA — Sales Orders, Allocations
-- ──────────────────────────────────────────────────────────
CREATE TABLE orders.customers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(50) NOT NULL UNIQUE,
    name            VARCHAR(300) NOT NULL,
    email           VARCHAR(255),
    phone           VARCHAR(50),
    address_line1   VARCHAR(255),
    city            VARCHAR(100),
    country         VARCHAR(100),
    segment         VARCHAR(50),
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE orders.sales_orders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number    VARCHAR(50) NOT NULL UNIQUE,
    customer_id     UUID NOT NULL REFERENCES orders.customers(id),
    status          VARCHAR(30) DEFAULT 'new' CHECK (status IN ('new', 'confirmed', 'allocated', 'picking', 'packed', 'shipped', 'delivered', 'cancelled', 'returned')),
    channel         VARCHAR(30) DEFAULT 'portal' CHECK (channel IN ('portal', 'edi', 'api', 'email', 'phone')),
    order_date      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    promised_date   DATE,
    shipped_date    DATE,
    delivered_date  DATE,
    subtotal        DECIMAL(14, 2) NOT NULL DEFAULT 0,
    tax_amount      DECIMAL(14, 2) DEFAULT 0,
    shipping_cost   DECIMAL(10, 2) DEFAULT 0,
    total_amount    DECIMAL(14, 2) NOT NULL DEFAULT 0,
    priority        VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    ship_from_location_id UUID REFERENCES inventory.locations(id),
    notes           TEXT,
    created_by      UUID REFERENCES auth.users(id),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE orders.order_lines (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL REFERENCES orders.sales_orders(id) ON DELETE CASCADE,
    line_number     INTEGER NOT NULL,
    product_id      UUID NOT NULL REFERENCES inventory.products(id),
    quantity        INTEGER NOT NULL,
    unit_price      DECIMAL(12, 4) NOT NULL,
    total_price     DECIMAL(14, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    quantity_allocated  INTEGER DEFAULT 0,
    quantity_shipped    INTEGER DEFAULT 0,
    status          VARCHAR(30) DEFAULT 'open',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(order_id, line_number)
);

-- ──────────────────────────────────────────────────────────
-- PLANNING SCHEMA — Forecasts, Replenishment
-- ──────────────────────────────────────────────────────────
CREATE TABLE planning.forecasts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id      UUID NOT NULL REFERENCES inventory.products(id),
    location_id     UUID NOT NULL REFERENCES inventory.locations(id),
    forecast_date   DATE NOT NULL,
    quantity        DECIMAL(12, 2) NOT NULL,
    confidence      DECIMAL(5, 4),
    model_type      VARCHAR(50) DEFAULT 'ensemble',
    version         INTEGER DEFAULT 1,
    status          VARCHAR(20) DEFAULT 'generated' CHECK (status IN ('generated', 'reviewed', 'approved', 'rejected')),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE planning.replenishment_orders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id      UUID NOT NULL REFERENCES inventory.products(id),
    location_id     UUID NOT NULL REFERENCES inventory.locations(id),
    trigger_type    VARCHAR(30) CHECK (trigger_type IN ('reorder_point', 'forecast', 'manual')),
    suggested_qty   INTEGER NOT NULL,
    approved_qty    INTEGER,
    status          VARCHAR(20) DEFAULT 'suggested' CHECK (status IN ('suggested', 'approved', 'converted_to_po', 'cancelled')),
    po_id           UUID REFERENCES procurement.purchase_orders(id),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────
-- SUSTAINABILITY SCHEMA — ESG, Emissions
-- ──────────────────────────────────────────────────────────
CREATE TABLE sustainability.carbon_emissions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scope           INTEGER NOT NULL CHECK (scope IN (1, 2, 3)),
    category        VARCHAR(100) NOT NULL,
    source          VARCHAR(200) NOT NULL,
    emission_kg_co2 DECIMAL(14, 4) NOT NULL,
    measurement_date DATE NOT NULL,
    supplier_id     UUID REFERENCES procurement.suppliers(id),
    location_id     UUID REFERENCES inventory.locations(id),
    methodology     VARCHAR(100),
    verified        BOOLEAN DEFAULT false,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────
-- Indexes for Performance
-- ──────────────────────────────────────────────────────────
CREATE INDEX idx_users_email ON auth.users(email);
CREATE INDEX idx_audit_log_user ON auth.audit_log(user_id, created_at DESC);
CREATE INDEX idx_stock_levels_product ON inventory.stock_levels(product_id);
CREATE INDEX idx_stock_levels_location ON inventory.stock_levels(location_id);
CREATE INDEX idx_products_sku ON inventory.products(sku);
CREATE INDEX idx_products_category ON inventory.products(category);
CREATE INDEX idx_lots_expiry ON inventory.lots(expiry_date) WHERE status = 'available';
CREATE INDEX idx_stock_movements_product ON inventory.stock_movements(product_id, created_at DESC);
CREATE INDEX idx_po_supplier ON procurement.purchase_orders(supplier_id);
CREATE INDEX idx_po_status ON procurement.purchase_orders(status);
CREATE INDEX idx_orders_customer ON orders.sales_orders(customer_id);
CREATE INDEX idx_orders_status ON orders.sales_orders(status);
CREATE INDEX idx_orders_date ON orders.sales_orders(order_date DESC);
CREATE INDEX idx_forecasts_product_date ON planning.forecasts(product_id, forecast_date);
CREATE INDEX idx_emissions_scope_date ON sustainability.carbon_emissions(scope, measurement_date);

-- ──────────────────────────────────────────────────────────
-- Note: Raw SQL inserts for users/roles removed.
-- DataInitializer.java inside auth-service handles seeding. 
-- ──────────────────────────────────────────────────────────

RAISE NOTICE 'SCM Platform database initialized successfully!';
