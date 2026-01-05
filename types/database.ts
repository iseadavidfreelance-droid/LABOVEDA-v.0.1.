
/**
 * LABOVEDA DATABASE TYPES
 * Based on Manifesto Sensory v1.2 & Hierarchy: Matrix -> Asset -> Node
 * STRICT MODE: SKU IS PRIMARY KEY.
 */

// ------------------------------------------------------------------
// ENUMS
// ------------------------------------------------------------------

export type RarityTier = 'DUST' | 'COMMON' | 'UNCOMMON' | 'RARE' | 'LEGENDARY';

export enum AssetStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  PURGED = 'PURGED',
  PENDING = 'PENDING'
}

// ------------------------------------------------------------------
// TABLES
// ------------------------------------------------------------------

/**
 * Matrix (Marca) - The top-level hierarchy entity.
 */
export interface MatrixRegistry {
  id: string; // UUID (Matrix still uses UUID or Code)
  name: string;
  code: string; // Internal reference code
  type: 'PRIMARY' | 'SECONDARY'; // Added per v2.1 Requirement
  description?: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
  total_assets_count: number;
  efficiency_score: number;
}

/**
 * Business Asset (Producto) - The core unit of value.
 * PK: SKU (String)
 */
export interface BusinessAsset {
  sku: string; // PK - STRICT STRING
  matrix_id: string; // FK -> matrix_registry.id
  name: string;
  description?: string;
  main_image_url?: string;
  tier: RarityTier;
  score: number; // 0-1000+
  status: AssetStatus;
  created_at: string;
  updated_at: string;
  last_ingested_at?: string;
  monetization_link?: string;
}

/**
 * Pinterest Node (Pin) - The tactical endpoint/traffic source.
 * FK: asset_sku
 */
export interface PinterestNode {
  id: string; // UUID (Nodes still use UUID internal, or Pin ID)
  asset_sku: string | null; // FK -> business_assets.sku
  pin_id: string; // External Platform ID
  url: string;
  image_url: string;
  impressions: number;
  saves: number;
  outbound_clicks: number;
  created_at: string;
  updated_at: string;
}

/**
 * Ingestion Cycle - Logs of data synchronization.
 */
export interface IngestionCycle {
  id: string; // UUID
  started_at: string;
  ended_at?: string;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  records_processed: number;
  log_summary?: string;
}

// ------------------------------------------------------------------
// VIEWS
// ------------------------------------------------------------------

/**
 * Radar: Hemorragia (Defensa)
 * Assets ready for monetization but missing links/setup.
 */
export interface RadarMonetizationReady {
  sku: string; // Changed from asset_id
  matrix_id: string; // Added for Filtering
  asset_name: string;
  matrix_name: string;
  current_score: number;
  tier: RarityTier;
  missing_field: 'LINK' | 'PRICE' | 'AVAILABILITY';
  potential_revenue_impact: 'HIGH' | 'MEDIUM' | 'LOW';
}

/**
 * Radar: Infraestructura (Defensa)
 * Structural gaps like missing SKUs or broken definitions.
 */
export interface RadarInfrastructureGap {
  sku: string; // Changed from asset_id
  matrix_id: string; // Added for Filtering
  asset_name: string;
  issue_type: 'MISSING_SKU' | 'NO_DESCRIPTION' | 'BROKEN_IMAGE';
  detected_at: string;
  days_open: number;
}

/**
 * Radar: Fantasmas (Defensa)
 * Assets that exist in DB but have no Nodes attached (Orphans).
 */
export interface RadarGhostAssets {
  sku: string; // Changed from asset_id
  matrix_id: string; // Added for Filtering
  asset_name: string;
  created_at: string;
  days_since_creation: number;
  last_known_activity?: string;
}

/**
 * Radar: El Vacío (Táctico)
 * Assets with Nodes but 0 traffic/metrics (Dead weight).
 */
export interface RadarTheVoid {
  sku: string; // Changed from asset_id
  matrix_id: string; // Added for Filtering
  asset_name: string;
  node_count: number;
  total_impressions: number;
  total_clicks: number;
  dormant_days: number;
}

/**
 * Radar: Incinerador (Táctico)
 * Low score assets (Dust) candidates for purging.
 */
export interface RadarDustCleaner {
  sku: string; // Changed from asset_id
  matrix_id: string; // Added for Filtering
  asset_name: string;
  score: number; // < 50
  tier: 'DUST';
  node_count: number;
  recommendation: 'PURGE' | 'ARCHIVE';
}

/**
 * Vista: Bóveda Élite (Estrategia)
 * High performing assets (Legendary/Rare).
 */
export interface ViewEliteAnalytics {
  sku: string; // Changed from asset_id
  matrix_id: string; // Added for Filtering
  asset_name: string;
  tier: 'LEGENDARY' | 'RARE';
  traffic_score: number;
  revenue_score: number;
  efficiency_index: number;
  traffic_trend: 'UP' | 'DOWN' | 'STABLE';
}

/**
 * Helper View: Radar Conversion Alert
 * High traffic but zero revenue assets.
 */
export interface RadarConversionAlert {
    sku: string; // Changed from asset_id
}