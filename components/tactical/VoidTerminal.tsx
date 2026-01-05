
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PinterestNode, BusinessAsset } from '../../types/database';
import { mockService } from '../../lib/supabase';
import { Layers, Database, Trash2, GripVertical, CheckCircle, Flame, ExternalLink } from 'lucide-react';
import RarityBadge from '../ui/RarityBadge';
import { cn } from '../../lib/utils';
import { useLog } from '../../context/LogContext';

const VoidTerminal: React.FC = () => {
  // --- STATE ---
  const [nodes, setNodes] = useState<PinterestNode[]>([]);
  const [silos, setSilos] = useState<BusinessAsset[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  const { addLog } = useLog();
  const MotionDiv = motion.div as any;
  
  // Drag State
  const [isDragging, setIsDragging] = useState(false);
  const [dragOverSilo, setDragOverSilo] = useState<string | null>(null); // SKU
  const [isOverTrash, setIsOverTrash] = useState(false);

  // --- LIFECYCLE ---
  useEffect(() => {
    loadData();
    // Replaced local log with Global Log
    addLog("VOID PROTOCOL INITIATED...", "info");
  }, []);

  const loadData = async () => {
    const [orphanNodes, activeAssets] = await Promise.all([
      mockService.getOrphanedNodes(),
      mockService.getTacticalSilos()
    ]);
    setNodes(orphanNodes);
    setSilos(activeAssets);
  };

  // --- LOGIC: SELECTION ---
  const handleNodeClick = (id: string, shiftKey: boolean) => {
    const newSelection = new Set(selectedIds);

    if (shiftKey && lastSelectedId) {
      // Range Selection logic (simple index based)
      const indexA = nodes.findIndex(n => n.id === lastSelectedId);
      const indexB = nodes.findIndex(n => n.id === id);
      const start = Math.min(indexA, indexB);
      const end = Math.max(indexA, indexB);
      
      for (let i = start; i <= end; i++) {
        newSelection.add(nodes[i].id);
      }
    } else {
      // Toggle
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }
      setLastSelectedId(id);
    }
    
    setSelectedIds(newSelection);
  };

  // --- LOGIC: DRAG & DROP ---

  const handleDragStart = (e: React.DragEvent, id: string) => {
    // If dragging an unselected item, select it alone. 
    // If dragging a selected item, drag the whole group.
    let idsToDrag = Array.from(selectedIds);
    if (!selectedIds.has(id)) {
       idsToDrag = [id];
       setSelectedIds(new Set([id])); // Update visual selection
    }

    e.dataTransfer.setData('application/json', JSON.stringify(idsToDrag));
    e.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragOverSilo(null);
    setIsOverTrash(false);
  };

  const handleDropOnSilo = async (e: React.DragEvent, sku: string) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/json');
    if (!data) return;

    const ids: string[] = JSON.parse(data);
    
    // OPTIMISTIC UI
    setNodes(prev => prev.filter(n => !ids.includes(n.id)));
    setSelectedIds(new Set());
    addLog(`> ASSIGNING ${ids.length} NODES TO SILO [${sku}]`, 'success');

    // BACKEND SYNC
    try {
        await mockService.assignNodesToAsset(ids, sku);
    } catch (err) {
        addLog(`! ERROR SYNCING TO ${sku}`, 'error');
    }

    setDragOverSilo(null);
  };

  const handleDropOnTrash = async (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/json');
    if (!data) return;

    const ids: string[] = JSON.parse(data);

    // OPTIMISTIC UI
    setNodes(prev => prev.filter(n => !ids.includes(n.id)));
    setSelectedIds(new Set());
    addLog(`> INCINERATED ${ids.length} DATA FRAGMENTS`, 'warning');

    // BACKEND SYNC
    await mockService.incinerateNodes(ids);
    setIsOverTrash(false);
  };

  // --- RENDER ---
  return (
    <div className="h-full flex flex-col bg-void-black text-[#E5E5E5] font-mono overflow-hidden">
      
      {/* HEADER */}
      <header className="flex-none h-16 border-b border-void-border flex items-center justify-between px-6 bg-void-black z-10">
        <div>
          <h2 className="text-2xl font-bold tracking-widest text-white uppercase flex items-center gap-2">
            <Layers className="text-tech-green w-6 h-6" />
            Módulo Táctico <span className="text-gray-600 text-sm">v2.0</span>
          </h2>
          <div className="flex gap-4 text-[10px] text-gray-500 mt-1">
             <span>FRAGMENTS: {nodes.length}</span>
             <span>SELECTED: {selectedIds.size}</span>
          </div>
        </div>
        <div className="flex gap-2">
           <div className="text-right">
             <div className="text-[10px] text-gray-500">OPERATIONAL MODE</div>
             <div className="text-xs text-tech-green font-bold animate-pulse">DRAG_AND_DROP_ACTIVE</div>
           </div>
        </div>
      </header>

      {/* MAIN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT ZONE: THE CLOUD (Orphan Nodes) */}
        <div className="flex-1 border-r border-void-border bg-void-gray/5 relative flex flex-col">
           <div className="p-2 border-b border-void-border bg-black/50 backdrop-blur-sm text-[10px] text-gray-500 tracking-widest uppercase flex justify-between">
              <span>Unassigned Data Cloud</span>
              <span>[SHIFT+CLICK] MULTI-SELECT</span>
           </div>
           
           <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                 <AnimatePresence>
                   {nodes.map((node) => {
                     const isSelected = selectedIds.has(node.id);
                     return (
                       <MotionDiv
                         key={node.id}
                         layout
                         initial={{ opacity: 0, scale: 0.8 }}
                         animate={{ opacity: 1, scale: 1 }}
                         exit={{ opacity: 0, scale: 0, transition: { duration: 0.2 } }}
                         draggable
                         onDragStart={(e: React.DragEvent) => handleDragStart(e, node.id)}
                         onDragEnd={handleDragEnd}
                         onClick={(e: React.MouseEvent) => handleNodeClick(node.id, e.shiftKey)}
                         className={cn(
                           "relative group cursor-move select-none border transition-all duration-200 aspect-[3/4] flex flex-col",
                           isSelected 
                             ? "border-tech-green bg-tech-green/10 shadow-[0_0_10px_rgba(0,255,65,0.2)]" 
                             : "border-void-border bg-black hover:border-gray-500"
                         )}
                       >
                          {/* Image Preview */}
                          <div className="flex-1 overflow-hidden relative">
                             <img src={node.image_url} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                             <div className="absolute top-1 right-1">
                                {isSelected && <CheckCircle className="w-4 h-4 text-tech-green bg-black rounded-full" />}
                             </div>
                             {/* External Link */}
                             <a 
                                href={node.url} 
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="absolute bottom-1 right-1 p-1 bg-black/50 hover:bg-tech-green hover:text-black rounded text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                             >
                                <ExternalLink className="w-3 h-3" />
                             </a>
                          </div>
                          
                          {/* Metadata */}
                          <div className="p-2 border-t border-void-border bg-black/80">
                             <div className="text-[9px] text-gray-500 font-mono truncate">{node.pin_id}</div>
                             <div className="flex justify-between items-center mt-1">
                                <span className="text-[10px] text-gray-300 font-bold">{node.impressions < 1000 ? node.impressions : (node.impressions/1000).toFixed(1) + 'k'} IMP</span>
                             </div>
                          </div>
                       </MotionDiv>
                     );
                   })}
                 </AnimatePresence>
                 {nodes.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center h-64 text-gray-600 font-mono opacity-50">
                        <Database className="w-12 h-12 mb-4" />
                        <p>SECTOR CLEAR</p>
                    </div>
                 )}
              </div>
           </div>
        </div>

        {/* RIGHT ZONE: THE SILOS & LOGS */}
        <div className="w-96 flex flex-col bg-void-black border-l border-void-border z-20 shadow-2xl">
           
           {/* SILOS LIST */}
           <div className="flex-1 flex flex-col border-b border-void-border overflow-hidden">
              <div className="p-2 border-b border-void-border bg-black text-[10px] text-gray-500 tracking-widest uppercase">
                 Target Silos (Drop Zone)
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                 {silos.map(silo => (
                    <div
                      key={silo.sku}
                      onDragOver={(e) => { e.preventDefault(); setDragOverSilo(silo.sku); }}
                      onDragLeave={() => setDragOverSilo(null)}
                      onDrop={(e) => handleDropOnSilo(e, silo.sku)}
                      className={cn(
                        "p-4 border transition-all duration-300 relative overflow-hidden group",
                        dragOverSilo === silo.sku
                          ? "border-tech-green bg-tech-green/10 scale-105 shadow-[0_0_20px_rgba(0,255,65,0.3)] z-10"
                          : "border-void-border bg-void-gray/20 hover:border-gray-600"
                      )}
                    >
                       <div className="flex justify-between items-start mb-2 relative z-10">
                          <h3 className="text-sm font-bold text-white font-sans">{silo.name}</h3>
                          <RarityBadge tier={silo.tier} className="scale-75 origin-top-right" />
                       </div>
                       <div className="text-[10px] font-mono text-gray-500 relative z-10">SKU: {silo.sku}</div>
                       
                       {/* Drop Hint */}
                       {dragOverSilo === silo.sku && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-20">
                             <span className="text-tech-green font-bold tracking-widest animate-pulse">INITIATE UPLOAD</span>
                          </div>
                       )}
                    </div>
                 ))}
              </div>
           </div>

           {/* INCINERATOR */}
           <div 
             className={cn(
               "h-32 border-t border-void-border transition-all duration-300 flex flex-col items-center justify-center relative overflow-hidden",
               isOverTrash ? "bg-red-900/20 border-red-500" : "bg-black"
             )}
             onDragOver={(e) => { e.preventDefault(); setIsOverTrash(true); }}
             onDragLeave={() => setIsOverTrash(false)}
             onDrop={handleDropOnTrash}
           >
              <Trash2 className={cn("w-8 h-8 mb-2 transition-colors", isOverTrash ? "text-red-500 animate-bounce" : "text-gray-700")} />
              <span className={cn("text-xs font-mono tracking-widest uppercase", isOverTrash ? "text-red-500" : "text-gray-700")}>
                 {isOverTrash ? "RELEASE TO PURGE" : "INCINERATOR"}
              </span>
              {/* Heat Haze Effect */}
              {isOverTrash && (
                 <div className="absolute inset-0 bg-red-500/10 pointer-events-none animate-pulse" />
              )}
           </div>

        </div>
      </div>
    </div>
  );
};

export default VoidTerminal;
