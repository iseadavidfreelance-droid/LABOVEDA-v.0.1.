
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RadarMonetizationReady } from '../../types/database';
import { mockService } from '../../lib/supabase';
import TechButton from '../ui/TechButton';
import TechInput from '../ui/TechInput';
import RarityBadge from '../ui/RarityBadge';
import GlitchToast from '../ui/GlitchToast';
import { AlertOctagon, Search, Save, ExternalLink } from 'lucide-react';

const HemorrhageConsole: React.FC = () => {
  const [items, setItems] = useState<RadarMonetizationReady[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    mockService.getMonetizationGaps().then(data => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  const handleInputChange = (id: string, value: string) => {
    setInputs(prev => ({ ...prev, [id]: value }));
  };

  const handleHunterSearch = (assetName: string) => {
    // Búsqueda simple en Payhip o Google como fallback "Hunter"
    const query = encodeURIComponent(assetName);
    window.open(`https://payhip.com/dashboard/products?q=${query}`, '_blank');
  };

  const handlePatch = async (item: RadarMonetizationReady) => {
    const link = inputs[item.asset_id];
    if (!link) {
      setError("ENLACE REQUERIDO PARA PROTOCOLO DE PARCHE");
      return;
    }

    // Optimistic Update
    const originalItems = [...items];
    setItems(prev => prev.filter(i => i.asset_id !== item.asset_id));

    try {
      await mockService.patchAsset(item.asset_id, 'payhip', link);
      // Success toast implies silence in this UI philosophy, only errors glitch
    } catch (e) {
      setItems(originalItems);
      setError("FALLO EN INYECCIÓN DE CÓDIGO. REINTENTAR.");
    }
  };

  if (loading) return <div className="p-8 font-mono text-tech-green animate-pulse">ESCANEANDO FUGAS DE CAPITAL...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <GlitchToast message={error} onClose={() => setError(null)} />
      
      <div className="flex items-center gap-4 border-b border-red-900/50 pb-4 mb-8">
        <div className="bg-red-900/20 p-3 border border-red-600 animate-pulse">
          <AlertOctagon className="w-8 h-8 text-red-500" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-red-500 tracking-widest uppercase">Protocolo Hemorragia</h2>
          <p className="font-mono text-xs text-red-400/70">DETECTADOS ACTIVOS DE ALTO VALOR SIN MONETIZACIÓN. ACCIÓN INMEDIATA REQUERIDA.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.asset_id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
              className="relative bg-black border border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.2)] p-6 flex flex-col justify-between group"
            >
              {/* Flashing Border Effect */}
              <div className="absolute inset-0 border-2 border-red-600/50 opacity-0 group-hover:opacity-100 group-hover:animate-pulse pointer-events-none transition-opacity"></div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{item.matrix_name}</span>
                  <RarityBadge tier={item.tier} />
                </div>
                
                <h3 className="text-xl font-bold text-white font-sans">{item.asset_name}</h3>
                
                <div className="flex items-center gap-4 font-mono text-xs">
                  <div className="text-red-400">IMPACTO: {item.potential_revenue_impact}</div>
                  <div className="text-gray-500">SCORE: {item.current_score}</div>
                </div>
              </div>

              <div className="space-y-3 relative z-10">
                 <div className="flex gap-2">
                    <TechButton 
                      variant="ghost" 
                      icon={Search} 
                      onClick={() => handleHunterSearch(item.asset_name)}
                      className="flex-1 text-[10px]"
                      label="HUNTER SEARCH"
                    />
                 </div>
                 
                 <div className="flex gap-2">
                    <div className="flex-1">
                      <TechInput 
                        placeholder="PEGAR PAYHIP LINK..." 
                        value={inputs[item.asset_id] || ''}
                        onChange={(e) => handleInputChange(item.asset_id, e.target.value)}
                        className="text-xs border-red-900 focus:border-red-500 text-red-100"
                      />
                    </div>
                    <TechButton 
                      variant="danger"
                      icon={Save}
                      onClick={() => handlePatch(item)}
                    />
                 </div>
              </div>

              {/* Decorative Corner */}
              <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-red-500"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-red-500"></div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 border border-dashed border-gray-800 text-gray-600 font-mono">
          <p className="text-xl text-tech-green">SISTEMA ESTABILIZADO</p>
          <p className="text-sm">NO SE DETECTAN FUGAS DE CAPITAL CRÍTICAS</p>
        </div>
      )}
    </div>
  );
};

export default HemorrhageConsole;
