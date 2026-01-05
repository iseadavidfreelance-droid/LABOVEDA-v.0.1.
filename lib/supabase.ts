
import { createClient } from '@supabase/supabase-js';
import { PinterestNode, BusinessAsset, RarityTier, RadarMonetizationReady, RadarInfrastructureGap, ViewEliteAnalytics, RadarConversionAlert, AssetStatus, MatrixRegistry } from '../types/database';

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
  // --- FASE 2.0: MATRIX CONTEXT ---
  
  async getMatrices(): Promise<MatrixRegistry[]> {
    return [
      { id: 'm1', name: 'CYBER_ARMORY', code: 'ALFA', created_at: '', updated_at: '', total_assets_count: 500, efficiency_score: 92 },
      { id: 'm2', name: 'NEON_FASHION', code: 'BETA', created_at: '', updated_at: '', total_assets_count: 350, efficiency_score: 85 },
      { id: 'm3', name: 'DATA_RELICS', code: 'GAMMA', created_at: '', updated_at: '', total_assets_count: 120, efficiency_score: 65 },
    ];
  },

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
    // Generate more mock nodes for the Drag & Drop experience
    const nodes: PinterestNode[] = [];
    const tiers = [100, 500, 1200, 40, 20];
    
    for(let i=1; i<=12; i++) {
        nodes.push({
            id: `node-${i}`,
            asset_sku: null,
            pin_id: `pin-${1000+i}`,
            url: `https://pinterest.com/pin/${i}`,
            image_url: `https://source.unsplash.com/random/200x300?cyberpunk,tech&sig=${i}`,
            impressions: tiers[i % 5] * (Math.random() * 10),
            saves: Math.floor(Math.random() * 50),
            outbound_clicks: Math.floor(Math.random() * 10),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
    }
    return nodes;
  },

  // NEW: Get Active Assets to act as Silos
  async getTacticalSilos(): Promise<BusinessAsset[]> {
     return [
      { sku: 'CKU-2099', matrix_id: 'm1', name: 'Cyber Katana', tier: 'LEGENDARY', score: 1200, status: AssetStatus.ACTIVE, created_at: '', updated_at: '' },
      { sku: 'NGM-001', matrix_id: 'm2', name: 'Neon Mask', tier: 'RARE', score: 600, status: AssetStatus.ACTIVE, created_at: '', updated_at: '' },
      { sku: 'TVM-004', matrix_id: 'm1', name: 'Tac Vest', tier: 'COMMON', score: 150, status: AssetStatus.ACTIVE, created_at: '', updated_at: '' },
      { sku: 'HOLO-X', matrix_id: 'm3', name: 'Holo Proj', tier: 'UNCOMMON', score: 300, status: AssetStatus.ACTIVE, created_at: '', updated_at: '' },
    ];
  },

  async searchAssets(query: string): Promise<BusinessAsset[]> {
    if (!query) return [];
    const assets: BusinessAsset[] = await this.getTacticalSilos();
    return assets.filter(a => 
      a.name.toLowerCase().includes(query.toLowerCase()) || 
      a.sku.toLowerCase().includes(query.toLowerCase())
    );
  },

  // NEW: Get single asset details for Sheet
  async getAssetDetails(sku: string): Promise<BusinessAsset | null> {
    await new Promise(resolve => setTimeout(resolve, 200)); // Latency
    const assets = await this.getTacticalSilos();
    const found = assets.find(a => a.sku === sku);
    if (found) return found;
    
    // Fallback Mock if not in silos
    return {
        sku,
        matrix_id: 'm1',
        name: 'Unknown Asset Protocol',
        tier: 'COMMON',
        score: 0,
        status: AssetStatus.PENDING,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        description: 'Asset detail retrieved dynamically from deep storage.'
    };
  },

  async linkNodeToAsset(nodeId: string, assetSku: string): Promise<boolean> {
    return new Promise((resolve) => setTimeout(() => resolve(true), 500));
  },

  // NEW: Batch Assignment
  async assignNodesToAsset(nodeIds: string[], assetSku: string): Promise<boolean> {
      console.log(`[DB] Assigning nodes [${nodeIds.join(',')}] to SKU: ${assetSku}`);
      return new Promise((resolve) => setTimeout(() => resolve(true), 400));
  },

  // NEW: Batch Delete
  async incinerateNodes(nodeIds: string[]): Promise<boolean> {
      console.log(`[DB] Incinerating nodes [${nodeIds.join(',')}]`);
      return new Promise((resolve) => setTimeout(() => resolve(true), 400));
  },

  // --- FASE 4: DEFENSE METHODS ---

  async getMonetizationGaps(matrixId?: string | null): Promise<RadarMonetizationReady[]> {
    const data: RadarMonetizationReady[] = [
      { sku: 'PAS-900', matrix_id: 'm1', asset_name: 'Protocol Alpha Sword', matrix_name: 'CYBER_ARMORY', current_score: 1500, tier: 'LEGENDARY', missing_field: 'LINK', potential_revenue_impact: 'HIGH' },
      { sku: 'SCV-200', matrix_id: 'm1', asset_name: 'Stealth Camo v2', matrix_name: 'CYBER_ARMORY', current_score: 800, tier: 'RARE', missing_field: 'LINK', potential_revenue_impact: 'HIGH' },
      { sku: 'NVG-750', matrix_id: 'm2', asset_name: 'Night Vision Goggles', matrix_name: 'NEON_FASHION', current_score: 750, tier: 'RARE', missing_field: 'LINK', potential_revenue_impact: 'MEDIUM' },
      { sku: 'PLC-920', matrix_id: 'm3', asset_name: 'Plasma Cutter', matrix_name: 'DATA_RELICS', current_score: 920, tier: 'LEGENDARY', missing_field: 'LINK', potential_revenue_impact: 'HIGH' },
    ];
    return matrixId ? data.filter(d => d.matrix_id === matrixId) : data;
  },

  async getInfrastructureGaps(matrixId?: string | null): Promise<RadarInfrastructureGap[]> {
    const data: RadarInfrastructureGap[] = [
      { sku: 'UA-001-MISSING', matrix_id: 'm1', asset_name: 'Unnamed Asset 001', issue_type: 'MISSING_SKU', detected_at: new Date().toISOString(), days_open: 12 },
      { sku: 'CF-CORRUPT', matrix_id: 'm2', asset_name: 'Corrupted File', issue_type: 'BROKEN_IMAGE', detected_at: new Date().toISOString(), days_open: 5 },
      { sku: 'RMB-4545', matrix_id: 'm3', asset_name: 'Raw Material Bundle', issue_type: 'NO_DESCRIPTION', detected_at: new Date().toISOString(), days_open: 45 },
    ];
    return matrixId ? data.filter(d => d.matrix_id === matrixId) : data;
  },

  async patchAsset(sku: string, field: 'payhip' | 'drive', value: string): Promise<boolean> {
    console.log(`Patching SKU ${sku} on field ${field} with value ${value}`);
    return new Promise((resolve) => setTimeout(() => resolve(true), 600));
  },

  // --- FASE 5: STRATEGY METHODS ---

  async getEliteAnalytics(orderBy: string = 'efficiency_index', ascending: boolean = false, matrixId?: string | null): Promise<ViewEliteAnalytics[]> {
    let rawData: ViewEliteAnalytics[] = [
        { sku: 'QCP-9000', matrix_id: 'm1', asset_name: 'Quantum Core Processor', tier: 'LEGENDARY', traffic_score: 98, revenue_score: 95, efficiency_index: 99.5, traffic_trend: 'UP' },
        { sku: 'VRS-2025', matrix_id: 'm2', asset_name: 'Void Runner Sneakers', tier: 'LEGENDARY', traffic_score: 92, revenue_score: 88, efficiency_index: 94.2, traffic_trend: 'STABLE' },
        { sku: 'NGM-003', matrix_id: 'm2', asset_name: 'Neon Gas Mask v3', tier: 'RARE', traffic_score: 85, revenue_score: 70, efficiency_index: 82.1, traffic_trend: 'UP' },
        { sku: 'NIC-101', matrix_id: 'm1', asset_name: 'Neural Interface Cable', tier: 'RARE', traffic_score: 78, revenue_score: 65, efficiency_index: 76.5, traffic_trend: 'DOWN' },
        { sku: 'CDB-000', matrix_id: 'm3', asset_name: 'Corrupted Databank', tier: 'LEGENDARY', traffic_score: 99, revenue_score: 0, efficiency_index: 12.0, traffic_trend: 'UP' },
    ];

    if (matrixId) {
        rawData = rawData.filter(d => d.matrix_id === matrixId);
    }

    await new Promise(resolve => setTimeout(resolve, 300));

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
      return [{ sku: 'CDB-000' }];
  }
};
