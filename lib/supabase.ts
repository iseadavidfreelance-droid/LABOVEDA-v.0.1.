
import { createClient } from '@supabase/supabase-js';
import { PinterestNode, BusinessAsset, RarityTier, RadarMonetizationReady, RadarInfrastructureGap, ViewEliteAnalytics, RadarConversionAlert, AssetStatus } from '../types/database';

// NOTA: En un entorno real, estas variables vienen de process.env
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key';

// Cliente real (no funcionará sin keys verdaderas en este entorno)
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * MOCK DATA SERVICE
 * Simula las respuestas de las Vistas SQL definidas en el Manifiesto
 * para permitir la visualización de la UI sin backend conectado.
 */
export const mockService = {
  async getViewCounts() {
    // Simula: SELECT count(*) FROM [vista]
    return {
      radar_monetization_ready: 12, // Hemorragia
      radar_infrastructure_gap: 5,  // Infraestructura
      radar_ghost_assets: 8,        // Fantasmas
      radar_the_void: 142,          // El Vacío
      radar_dust_cleaner: 340,      // Incinerador
    };
  },

  async getSystemHeartbeat() {
    // Simula: SELECT * FROM ingestion_cycles ORDER BY started_at DESC LIMIT 1
    return {
      status: 'RUNNING', // 'RUNNING', 'COMPLETED', 'FAILED'
      started_at: new Date().toISOString(),
      records_processed: 1250
    };
  },

  async getGlobalKPIs() {
    // Simula agregación de matrix_registry
    return {
      total_assets: 15420,
      total_nodes: 45200,
      efficiency_avg: 87.5
    };
  },

  // --- FASE 3: TACTICAL / VOID METHODS ---

  async getOrphanedNodes(): Promise<PinterestNode[]> {
    // Simula pines que no tienen SKU asignado (asset_sku: null)
    return [
      {
        id: 'node-001',
        asset_sku: null,
        pin_id: 'pin-998877',
        url: 'https://pinterest.com/pin/1',
        image_url: 'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?w=500&auto=format&fit=crop&q=60',
        impressions: 1240,
        saves: 45,
        outbound_clicks: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'node-002',
        asset_sku: null,
        pin_id: 'pin-112233',
        url: 'https://pinterest.com/pin/2',
        image_url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500&auto=format&fit=crop&q=60',
        impressions: 50,
        saves: 2,
        outbound_clicks: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'node-003',
        asset_sku: null,
        pin_id: 'pin-445566',
        url: 'https://pinterest.com/pin/3',
        image_url: 'https://images.unsplash.com/photo-1614726365723-49cfae968cd5?w=500&auto=format&fit=crop&q=60',
        impressions: 8900,
        saves: 120,
        outbound_clicks: 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  },

  async searchAssets(query: string): Promise<BusinessAsset[]> {
    if (!query) return [];
    
    // Mock database of assets with SKUs as PK
    const assets: BusinessAsset[] = [
      { sku: 'CKU-2099', matrix_id: 'm1', name: 'Cyber Katana Umbrella', tier: 'LEGENDARY', score: 1200, status: AssetStatus.ACTIVE, created_at: '', updated_at: '' },
      { sku: 'NGM-001', matrix_id: 'm1', name: 'Neon Gas Mask', tier: 'RARE', score: 600, status: AssetStatus.ACTIVE, created_at: '', updated_at: '' },
      { sku: 'TVM-004', matrix_id: 'm1', name: 'Tactical Vest Model 4', tier: 'COMMON', score: 150, status: AssetStatus.ACTIVE, created_at: '', updated_at: '' },
      { sku: 'HOLO-X', matrix_id: 'm1', name: 'Hologram Projector', tier: 'UNCOMMON', score: 300, status: AssetStatus.ACTIVE, created_at: '', updated_at: '' },
      { sku: 'DFC-10', matrix_id: 'm1', name: 'Dust Filter Component', tier: 'DUST', score: 10, status: AssetStatus.ARCHIVED, created_at: '', updated_at: '' },
    ];

    return assets.filter(a => 
      a.name.toLowerCase().includes(query.toLowerCase()) || 
      a.sku.toLowerCase().includes(query.toLowerCase())
    );
  },

  async linkNodeToAsset(nodeId: string, assetSku: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simular un fallo aleatorio (10% de probabilidad)
        if (Math.random() < 0.1) {
          reject(new Error("NEURAL LINK FAILURE"));
        } else {
          console.log(`Node ${nodeId} linked to SKU ${assetSku}`);
          resolve(true);
        }
      }, 800);
    });
  },

  // --- FASE 4: DEFENSE METHODS ---

  async getMonetizationGaps(): Promise<RadarMonetizationReady[]> {
    return [
      { sku: 'PAS-900', asset_name: 'Protocol Alpha Sword', matrix_name: 'Weapons', current_score: 1500, tier: 'LEGENDARY', missing_field: 'LINK', potential_revenue_impact: 'HIGH' },
      { sku: 'SCV-200', asset_name: 'Stealth Camo v2', matrix_name: 'Gear', current_score: 800, tier: 'RARE', missing_field: 'LINK', potential_revenue_impact: 'HIGH' },
      { sku: 'NVG-750', asset_name: 'Night Vision Goggles', matrix_name: 'Gear', current_score: 750, tier: 'RARE', missing_field: 'LINK', potential_revenue_impact: 'MEDIUM' },
      { sku: 'PLC-920', asset_name: 'Plasma Cutter', matrix_name: 'Tools', current_score: 920, tier: 'LEGENDARY', missing_field: 'LINK', potential_revenue_impact: 'HIGH' },
    ];
  },

  async getInfrastructureGaps(): Promise<RadarInfrastructureGap[]> {
    return [
      { sku: 'UA-001-MISSING', asset_name: 'Unnamed Asset 001', issue_type: 'MISSING_SKU', detected_at: new Date().toISOString(), days_open: 12 },
      { sku: 'CF-CORRUPT', asset_name: 'Corrupted File', issue_type: 'BROKEN_IMAGE', detected_at: new Date().toISOString(), days_open: 5 },
      { sku: 'RMB-4545', asset_name: 'Raw Material Bundle', issue_type: 'NO_DESCRIPTION', detected_at: new Date().toISOString(), days_open: 45 },
    ];
  },

  async patchAsset(sku: string, field: 'payhip' | 'drive', value: string): Promise<boolean> {
    console.log(`Patching SKU ${sku} on field ${field} with value ${value}`);
    return new Promise((resolve) => setTimeout(() => resolve(true), 600));
  },

  // --- FASE 5: STRATEGY METHODS ---

  // BACKEND SIMULATION: Sort parameters handled here (Server-side)
  async getEliteAnalytics(orderBy: string = 'efficiency_index', ascending: boolean = false): Promise<ViewEliteAnalytics[]> {
    
    // Note: efficiency_index provided with 1 decimal precision from "View"
    const rawData: ViewEliteAnalytics[] = [
        { sku: 'QCP-9000', asset_name: 'Quantum Core Processor', tier: 'LEGENDARY', traffic_score: 98, revenue_score: 95, efficiency_index: 99.5, traffic_trend: 'UP' },
        { sku: 'VRS-2025', asset_name: 'Void Runner Sneakers', tier: 'LEGENDARY', traffic_score: 92, revenue_score: 88, efficiency_index: 94.2, traffic_trend: 'STABLE' },
        { sku: 'NGM-003', asset_name: 'Neon Gas Mask v3', tier: 'RARE', traffic_score: 85, revenue_score: 70, efficiency_index: 82.1, traffic_trend: 'UP' },
        { sku: 'NIC-101', asset_name: 'Neural Interface Cable', tier: 'RARE', traffic_score: 78, revenue_score: 65, efficiency_index: 76.5, traffic_trend: 'DOWN' },
        { sku: 'CDB-000', asset_name: 'Corrupted Databank', tier: 'LEGENDARY', traffic_score: 99, revenue_score: 0, efficiency_index: 12.0, traffic_trend: 'UP' }, // Alert Case
    ];

    // Simulate Server-Side Latency
    await new Promise(resolve => setTimeout(resolve, 300));

    // Simulate SQL 'ORDER BY'
    return rawData.sort((a, b) => {
      const valA = a[orderBy as keyof ViewEliteAnalytics];
      const valB = b[orderBy as keyof ViewEliteAnalytics];
      
      if (valA === valB) return 0;
      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;
      
      let comparison = 0;
      if (valA > valB) comparison = 1;
      else if (valA < valB) comparison = -1;

      return ascending ? comparison : comparison * -1;
    });
  },

  async getConversionAlerts(): Promise<RadarConversionAlert[]> {
      // Simulate High Traffic / Zero Revenue
      return [
          { sku: 'CDB-000' }
      ];
  }
};
