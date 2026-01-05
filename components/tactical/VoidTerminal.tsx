
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PinterestNode, BusinessAsset } from '../../types/database';
import { mockService } from '../../lib/supabase';
import TechButton from '../ui/TechButton';
import AssetSearch from './AssetSearch';
import GlitchToast from '../ui/GlitchToast';
import { Link2, ExternalLink, ImageOff } from 'lucide-react';
import RarityBadge from '../ui/RarityBadge';

const VoidTerminal: React.FC = () => {
  const [nodes, setNodes] = useState<PinterestNode[]>([]);
  const [activeNode, setActiveNode] = useState<PinterestNode | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<BusinessAsset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadNodes();
  }, []);

  const loadNodes = async () => {
    const data = await mockService.getOrphanedNodes();
    setNodes(data);
    if (data.length > 0) setActiveNode(data[0]);
  };

  const handleLink = async () => {
    if (!activeNode || !selectedAsset) return;

    const nodeId = activeNode.id;
    const previousNodes = [...nodes];
    const assetSku = selectedAsset.sku; // Use SKU as Foreign Key

    setProcessing(true);

    // OPTIMISTIC UI: Remove immediately
    const remainingNodes = nodes.filter(n => n.id !== nodeId);
    setNodes(remainingNodes);
    setActiveNode(remainingNodes.length > 0 ? remainingNodes[0] : null);
    setSelectedAsset(null); // Reset brain

    try {
      // Execute Link with SKU
      await mockService.linkNodeToAsset(nodeId, assetSku);
      setProcessing(false);
    } catch (err) {
      // ROLLBACK on Failure
      setError("ENLACE NEURAL FALLIDO: REVERTING TIMELINE...");
      setNodes(previousNodes);
      setActiveNode(previousNodes.find(n => n.id === nodeId) || previousNodes[0]);
      setProcessing(false);
    }
  };

  if (nodes.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500 font-mono">
        <div className="w-16 h-16 border border-dashed border-gray-700 flex items-center justify-center mb-4">
          <Link2 className="w-8 h-8" />
        </div>
        <p>EL VACÍO ESTÁ LIMPIO</p>
        <span className="text-xs text-gray-700 mt-2">NO SE DETECTAN PINES HUÉRFANOS</span>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex border border-void-border bg-void-black relative overflow-hidden">
      <GlitchToast message={error} onClose={() => setError(null)} />

      {/* LEFT COLUMN: THE GHOST (Visual) */}
      <div className="w-1/2 border-r border-void-border p-8 flex flex-col justify-center relative bg-void-gray/5">
        
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 z-0 opacity-10" 
            style={{ 
            backgroundImage: 'radial-gradient(#1f1f1f 1px, transparent 1px)', 
            backgroundSize: '20px 20px' 
            }} 
        />

        {activeNode && (
          <motion.div 
            key={activeNode.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 flex flex-col items-center"
          >
            <div className="relative w-64 h-80 mb-6 group border border-void-border bg-black">
              {activeNode.image_url ? (
                <img 
                  src={activeNode.image_url} 
                  alt="Pin Asset" 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-700">
                    <ImageOff />
                </div>
              )}
              
              {/* Overlay Metrics */}
              <div className="absolute bottom-0 left-0 w-full bg-black/80 backdrop-blur-sm p-3 border-t border-void-border">
                 <div className="flex justify-between items-end font-mono text-xs">
                    <div>
                        <div className="text-gray-500 text-[9px] uppercase">IMPRESSIONS</div>
                        <div className="text-white">{activeNode.impressions.toLocaleString()}</div>
                    </div>
                    <div>
                        <div className="text-gray-500 text-[9px] uppercase">SAVES</div>
                        <div className="text-tech-green">{activeNode.saves.toLocaleString()}</div>
                    </div>
                 </div>
              </div>
            </div>

            <div className="w-64 space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 font-mono uppercase">PIN ID</span>
                    <span className="text-xs font-mono text-gray-300">{activeNode.pin_id}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 font-mono uppercase">DETECTED</span>
                    <span className="text-xs font-mono text-gray-300">{new Date(activeNode.created_at).toLocaleDateString()}</span>
                </div>
                <a href={activeNode.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] text-tech-green hover:underline mt-2">
                    ABRIR EN ORIGEN <ExternalLink className="w-3 h-3" />
                </a>
            </div>
          </motion.div>
        )}
      </div>

      {/* RIGHT COLUMN: THE BRAIN (Controls) */}
      <div className="w-1/2 p-8 flex flex-col justify-center items-center bg-void-black relative">
         <div className="w-full max-w-md space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold tracking-widest text-white mb-2">ASIGNACIÓN NEURAL</h2>
                <p className="text-xs font-mono text-gray-500">IDENTIFICAR Y VINCULAR ACTIVO DE NEGOCIO</p>
            </div>

            <div className="bg-void-gray/10 p-6 border border-void-border space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] text-tech-green font-bold tracking-widest uppercase">TARGET ASSET (SKU)</label>
                    <AssetSearch onSelect={setSelectedAsset} />
                </div>

                {selectedAsset && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="border-t border-void-border pt-4 mt-4 overflow-hidden"
                    >
                         <div className="flex justify-between items-center mb-4">
                            <div className="flex flex-col">
                                <span className="text-white font-sans font-bold">{selectedAsset.name}</span>
                                <span className="text-xs font-mono text-gray-500">{selectedAsset.sku}</span>
                            </div>
                            <RarityBadge tier={selectedAsset.tier} />
                         </div>
                    </motion.div>
                )}

                <TechButton 
                    variant={selectedAsset ? "primary" : "ghost"}
                    label={processing ? "ESTABLECIENDO ENLACE..." : "EJECUTAR ENLACE NEURAL"}
                    className="w-full"
                    disabled={!selectedAsset || processing}
                    onClick={handleLink}
                />
            </div>
            
            <div className="text-center">
                <p className="text-[10px] text-gray-700 font-mono">
                    CAUTION: OPTIMISTIC PROTOCOL ACTIVE. <br/>
                    CHANGES ARE APPLIED INSTANTLY TO LOCAL INTERFACE.
                </p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default VoidTerminal;
