
import { createClient } from '@supabase/supabase-js';
import { PinterestNode, BusinessAsset, RarityTier, RadarMonetizationReady, RadarInfrastructureGap, ViewEliteAnalytics, RadarConversionAlert, AssetStatus, MatrixRegistry, RadarGhostAssets, RadarDustCleaner, RadarTheVoid } from '../types/database';

// ENVIRONMENT VARIABLES
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn("SUPABASE CREDENTIALS MISSING. CHECK .ENV FILE.");
}

// REAL CLIENT
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * DATA SERVICE (FORMERLY MOCK SERVICE)
 * Implementation of strict mapping to Manifesto Views/Tables.
 */
export const mockService = {
  
  // --- ONTOLOGY CONTEXT ---

  async getMatrices(): Promise<MatrixRegistry[]> {
    const { data, error } = await supabase
      .from('matrix_registry')
      .select('*')
      .order('code', { ascending: true });
    
    if (error) throw error;
    return data as MatrixRegistry[];
  },

  async createMatrix(matrix: Partial<MatrixRegistry>): Promise<void> {
    const { error } = await supabase
      .from('matrix_registry')
      .insert(matrix);
    
    if (error) throw error;
  },

  async getViewCounts() {
    // Parallel count queries for the sidebar badges
    const [hemorragia, infra, ghosts, void_radar, dust] = await Promise.all([
      supabase.from('radar_monetization_ready').select('*', { count: 'exact', head: true }),
      supabase.from('radar_infrastructure_gap').select('*', { count: 'exact', head: true }),
      supabase.from('radar_ghost_assets').select('*', { count: 'exact', head: true }),
      supabase.from('radar_the_void').select('*', { count: 'exact', head: true }),
      supabase.from('radar_dust_cleaner').select('*', { count: 'exact', head: true }),
    ]);

    return {
      radar_monetization_ready: hemorragia.count || 0,
      radar_infrastructure_gap: infra.count || 0,
      radar_ghost_assets: ghosts.count || 0,
      radar_the_void: void_radar.count || 0,
      radar_dust_cleaner: dust.count || 0,
    };
  },

  async getSystemHeartbeat() {
    const { data, error } = await supabase
      .from('ingestion_cycles')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // Ignore "no rows" error
       console.error("Heartbeat Error", error);
       return { status: 'OFFLINE', started_at: new Date().toISOString(), records_processed: 0 };
    }

    return {
      status: data?.status || 'STANDBY',
      started_at: data?.started_at,
      records_processed: data?.records_processed || 0
    };
  },

  async getGlobalKPIs() {
    // Assuming simple counts from base tables for now as per manifesto
    const [assets, nodes] = await Promise.all([
        supabase.from('business_assets').select('*', { count: 'exact', head: true }),
        supabase.from('pinterest_nodes').select('*', { count: 'exact', head: true })
    ]);

    return {
      total_assets: assets.count || 0,
      total_nodes: nodes.count || 0,
      efficiency_avg: 0 // Would require a complex aggregation query or RPC
    };
  },

  // --- TACTICAL SECTOR (VOID) ---

  async getOrphanedNodes(): Promise<PinterestNode[]> {
    // Nodes without an asset_sku assigned
    const { data, error } = await supabase
        .from('pinterest_nodes')
        .select('*')
        .is('asset_sku', null)
        .limit(100); // Safety limit for drag zone

    if (error) throw error;
    return data as PinterestNode[];
  },

  async getTacticalSilos(): Promise<BusinessAsset[]> {
     // Fetch recent active assets to act as drop targets
     const { data, error } = await supabase
        .from('business_assets')
        .select('*')
        .eq('status', 'ACTIVE')
        .order('updated_at', { ascending: false })
        .limit(50);
    
     if (error) throw error;
     return data as BusinessAsset[];
  },

  async createAsset(asset: BusinessAsset): Promise<void> {
      const { error } = await supabase
          .from('business_assets')
          .insert(asset);
      if (error) throw error;
  },

  async searchAssets(query: string): Promise<BusinessAsset[]> {
    if (!query) return [];
    
    const { data, error } = await supabase
        .from('business_assets')
        .select('*')
        .or(`name.ilike.%${query}%,sku.ilike.%${query}%`)
        .limit(20);

    if (error) throw error;
    return data as BusinessAsset[];
  },

  async getAssetDetails(sku: string): Promise<BusinessAsset | null> {
    const { data, error } = await supabase
        .from('business_assets')
        .select('*')
        .eq('sku', sku)
        .single();
    
    if (error) return null;
    return data as BusinessAsset;
  },

  async linkNodeToAsset(nodeId: string, assetSku: string): Promise<boolean> {
    const { error } = await supabase
        .from('pinterest_nodes')
        .update({ asset_sku: assetSku })
        .eq('id', nodeId);
    
    if (error) throw error;
    return true;
  },

  async assignNodesToAsset(nodeIds: string[], assetSku: string): Promise<boolean> {
      const { error } = await supabase
        .from('pinterest_nodes')
        .update({ asset_sku: assetSku })
        .in('id', nodeIds);

      if (error) throw error;
      return true;
  },

  async incinerateNodes(nodeIds: string[]): Promise<boolean> {
      // In a real scenario, this might set a deleted_at flag or actually delete row
      const { error } = await supabase
        .from('pinterest_nodes')
        .delete()
        .in('id', nodeIds);
      
      if (error) throw error;
      return true;
  },

  async deleteAsset(sku: string): Promise<void> {
    const { error } = await supabase
        .from('business_assets')
        .delete()
        .eq('sku', sku);
    if (error) throw error;
  },

  // --- DEFENSE SECTOR (RADAR) ---

  async getMonetizationGaps(matrixId?: string | null): Promise<RadarMonetizationReady[]> {
    let query = supabase.from('radar_monetization_ready').select('*');
    if (matrixId) query = query.eq('matrix_id', matrixId);
    
    const { data, error } = await query;
    if (error) throw error;
    return data as RadarMonetizationReady[];
  },

  async getInfrastructureGaps(matrixId?: string | null): Promise<RadarInfrastructureGap[]> {
    let query = supabase.from('radar_infrastructure_gap').select('*');
    if (matrixId) query = query.eq('matrix_id', matrixId);

    const { data, error } = await query;
    if (error) throw error;
    return data as RadarInfrastructureGap[];
  },

  async getGhostAssets(matrixId?: string | null): Promise<RadarGhostAssets[]> {
    let query = supabase.from('radar_ghost_assets').select('*');
    if (matrixId) query = query.eq('matrix_id', matrixId);

    const { data, error } = await query;
    if (error) throw error;
    return data as RadarGhostAssets[];
  },

  async patchAsset(sku: string, field: 'payhip' | 'drive', value: string): Promise<boolean> {
    const updatePayload: any = {};
    if (field === 'payhip') updatePayload.monetization_link = value;
    // Assuming 'drive' maps to description or a specific column not defined in interface, 
    // sticking to description for now based on context, or just logging it if schema doesn't support yet.
    if (field === 'drive') updatePayload.description = value; 

    const { error } = await supabase
        .from('business_assets')
        .update(updatePayload)
        .eq('sku', sku);

    if (error) throw error;
    return true;
  },

  // --- STRATEGY SECTOR ---

  async getEliteAnalytics(orderBy: string = 'efficiency_index', ascending: boolean = false, matrixId?: string | null): Promise<ViewEliteAnalytics[]> {
    let query = supabase
        .from('view_elite_analytics')
        .select('*')
        .order(orderBy, { ascending });
    
    if (matrixId) query = query.eq('matrix_id', matrixId);

    const { data, error } = await query;
    if (error) throw error;
    return data as ViewEliteAnalytics[];
  },

  async getConversionAlerts(): Promise<RadarConversionAlert[]> {
      // This might be a separate view or a filtered query on Elite Analytics
      // For now, assuming specific view
      const { data, error } = await supabase.from('radar_conversion_alert').select('*'); 
      if (error) {
          // Fallback if view doesn't exist yet
          return [];
      }
      return data as RadarConversionAlert[];
  }
};
