// ============================================================
// SCM Platform — MongoDB Initialization Script
// ============================================================
// Creates collections and indexes for document-based data.
// Executed automatically by docker-entrypoint-initdb.d
// ============================================================

db = db.getSiblingDB('scm_platform');

// ──────────────────────────────────────────────────────────
// Product Catalog Collection
// ──────────────────────────────────────────────────────────
db.createCollection('product_catalog', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['sku', 'name', 'category'],
      properties: {
        sku: { bsonType: 'string', description: 'Stock Keeping Unit — unique identifier' },
        name: { bsonType: 'string', description: 'Product display name' },
        description: { bsonType: 'string' },
        category: { bsonType: 'string' },
        subcategory: { bsonType: 'string' },
        brand: { bsonType: 'string' },
        images: { bsonType: 'array', items: { bsonType: 'string' } },
        specifications: { bsonType: 'object' },
        dimensions: {
          bsonType: 'object',
          properties: {
            length_cm: { bsonType: 'double' },
            width_cm: { bsonType: 'double' },
            height_cm: { bsonType: 'double' },
            weight_kg: { bsonType: 'double' }
          }
        },
        tags: { bsonType: 'array', items: { bsonType: 'string' } },
        is_active: { bsonType: 'bool' },
        created_at: { bsonType: 'date' },
        updated_at: { bsonType: 'date' }
      }
    }
  }
});

db.product_catalog.createIndex({ sku: 1 }, { unique: true });
db.product_catalog.createIndex({ category: 1, subcategory: 1 });
db.product_catalog.createIndex({ name: 'text', description: 'text', tags: 'text' });

// ──────────────────────────────────────────────────────────
// Supplier Profiles Collection
// ──────────────────────────────────────────────────────────
db.createCollection('supplier_profiles', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['supplier_code', 'name', 'country'],
      properties: {
        supplier_code: { bsonType: 'string' },
        name: { bsonType: 'string' },
        country: { bsonType: 'string' },
        capabilities: { bsonType: 'array', items: { bsonType: 'string' } },
        certifications: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            properties: {
              name: { bsonType: 'string' },
              issuer: { bsonType: 'string' },
              valid_until: { bsonType: 'date' },
              document_url: { bsonType: 'string' }
            }
          }
        },
        financial_health: {
          bsonType: 'object',
          properties: {
            credit_rating: { bsonType: 'string' },
            annual_revenue: { bsonType: 'double' },
            employee_count: { bsonType: 'int' }
          }
        },
        esg_profile: {
          bsonType: 'object',
          properties: {
            environmental_score: { bsonType: 'double' },
            social_score: { bsonType: 'double' },
            governance_score: { bsonType: 'double' },
            overall_rating: { bsonType: 'string' }
          }
        },
        risk_factors: { bsonType: 'array' },
        performance_history: { bsonType: 'array' },
        contacts: { bsonType: 'array' },
        documents: { bsonType: 'array' }
      }
    }
  }
});

db.supplier_profiles.createIndex({ supplier_code: 1 }, { unique: true });
db.supplier_profiles.createIndex({ country: 1 });
db.supplier_profiles.createIndex({ 'certifications.name': 1 });
db.supplier_profiles.createIndex({ name: 'text', capabilities: 'text' });

// ──────────────────────────────────────────────────────────
// System Configuration Collection
// ──────────────────────────────────────────────────────────
db.createCollection('system_config');

db.system_config.insertMany([
  {
    key: 'inventory.reorder_method',
    value: 'reorder_point',
    description: 'Reorder method: reorder_point, forecast_driven, manual',
    module: 'inventory',
    updated_at: new Date()
  },
  {
    key: 'procurement.approval_threshold',
    value: 5000,
    description: 'PO amount threshold requiring approval ($)',
    module: 'procurement',
    updated_at: new Date()
  },
  {
    key: 'planning.forecast_horizon_days',
    value: 90,
    description: 'Default forecast horizon in days',
    module: 'planning',
    updated_at: new Date()
  },
  {
    key: 'planning.forecast_models',
    value: ['arima', 'lstm', 'xgboost', 'prophet'],
    description: 'Enabled forecasting models for ensemble',
    module: 'planning',
    updated_at: new Date()
  },
  {
    key: 'transport.optimization_algorithm',
    value: 'or_tools_vrp',
    description: 'Route optimization algorithm',
    module: 'transport',
    updated_at: new Date()
  },
  {
    key: 'sustainability.emission_factors',
    value: {
      road_kg_per_km: 0.062,
      rail_kg_per_km: 0.022,
      air_kg_per_km: 0.602,
      ocean_kg_per_km: 0.008
    },
    description: 'CO2 emission factors by transport mode (kg CO2 per ton-km)',
    module: 'sustainability',
    updated_at: new Date()
  }
]);

db.system_config.createIndex({ key: 1 }, { unique: true });
db.system_config.createIndex({ module: 1 });

// ──────────────────────────────────────────────────────────
// Notification Templates Collection
// ──────────────────────────────────────────────────────────
db.createCollection('notification_templates');

db.notification_templates.insertMany([
  {
    code: 'PO_CREATED',
    channel: 'email',
    subject: 'New Purchase Order {{po_number}}',
    body: 'A new purchase order {{po_number}} has been created for supplier {{supplier_name}} with total amount {{total_amount}} {{currency}}.',
    module: 'procurement'
  },
  {
    code: 'PO_APPROVAL_REQUIRED',
    channel: 'email',
    subject: 'PO {{po_number}} — Approval Required',
    body: 'Purchase order {{po_number}} requires your approval. Amount: {{total_amount}} {{currency}}. Supplier: {{supplier_name}}.',
    module: 'procurement'
  },
  {
    code: 'LOW_STOCK_ALERT',
    channel: 'email',
    subject: 'Low Stock Alert — {{product_name}} ({{sku}})',
    body: 'Stock level for {{product_name}} ({{sku}}) at {{location_name}} has fallen below reorder point. Current: {{current_qty}}, Reorder Point: {{reorder_point}}.',
    module: 'inventory'
  },
  {
    code: 'SHIPMENT_DISPATCHED',
    channel: 'email',
    subject: 'Shipment {{shipment_id}} Dispatched',
    body: 'Shipment {{shipment_id}} for order {{order_number}} has been dispatched via {{carrier_name}}. Tracking: {{tracking_number}}.',
    module: 'transport'
  },
  {
    code: 'DISRUPTION_ALERT',
    channel: 'email',
    subject: '⚠️ Supply Chain Disruption Alert — {{event_type}}',
    body: 'A disruption has been detected: {{description}}. Affected region: {{region}}. Severity: {{severity}}. Recommended action: {{recommended_action}}.',
    module: 'risk'
  }
]);

db.notification_templates.createIndex({ code: 1, channel: 1 }, { unique: true });

// ──────────────────────────────────────────────────────────
// Sparse indexes for optional unique fields
// ──────────────────────────────────────────────────────────
db.product_catalog.dropIndex({ sku: 1 });
db.product_catalog.createIndex({ sku: 1 }, { unique: true, sparse: true });

// ──────────────────────────────────────────────────────────
// TTL indexes for automatic cleanup
// ──────────────────────────────────────────────────────────
db.createCollection('audit_logs');
db.audit_logs.createIndex({ created_at: 1 }, { expireAfterSeconds: 7776000 }); // 90 days TTL

db.createCollection('forecast_cache');
db.forecast_cache.createIndex({ generated_at: 1 }, { expireAfterSeconds: 86400 }); // 24 hours TTL

// Multi-language text index support
db.product_catalog.dropIndex({ name: 'text', description: 'text', tags: 'text' });
db.product_catalog.createIndex(
  { name: 'text', description: 'text', tags: 'text' },
  { default_language: 'none' }
);

print('SCM Platform MongoDB initialized successfully!');
