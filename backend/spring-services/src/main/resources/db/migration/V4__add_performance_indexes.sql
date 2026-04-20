-- Performance indexes for frequently queried columns

-- Orders: status and time-based queries
CREATE INDEX IF NOT EXISTS idx_orders_status      ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_ordered_at  ON orders(ordered_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer    ON orders(LOWER(customer_name));

-- Inventory: product-warehouse lookups and stock queries
CREATE INDEX IF NOT EXISTS idx_inventory_product_warehouse ON inventory(product_id, warehouse_id);
CREATE INDEX IF NOT EXISTS idx_inventory_qty_on_hand       ON inventory(quantity_on_hand);

-- Products: SKU search (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_products_sku      ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active   ON products(is_active);

-- Suppliers: code and status lookups
CREATE INDEX IF NOT EXISTS idx_suppliers_code      ON suppliers(code);
CREATE INDEX IF NOT EXISTS idx_suppliers_status    ON suppliers(status);
CREATE INDEX IF NOT EXISTS idx_suppliers_risk      ON suppliers(risk_level);

-- Shipments: tracking number lookup (must be fast for public tracking)
CREATE INDEX IF NOT EXISTS idx_shipments_tracking ON shipments(tracking_number);
CREATE INDEX IF NOT EXISTS idx_shipments_status   ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_order    ON shipments(order_id);

-- Purchase orders: status and supplier lookups
CREATE INDEX IF NOT EXISTS idx_po_status    ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_po_supplier  ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_po_received  ON purchase_orders(received_date);
