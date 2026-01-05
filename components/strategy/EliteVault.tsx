
import React, { useEffect, useState } from 'react';
import { ViewEliteAnalytics } from '../../types/database';
import { mockService } from '../../lib/supabase';
import RarityBadge from '../ui/RarityBadge';
import { ChevronUp, ChevronDown, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

type SortField = keyof ViewEliteAnalytics;
type SortDirection = 'asc' | 'desc';

const EliteVault: React.FC = () => {
  const [data, setData] = useState<ViewEliteAnalytics[]>([]);
  const [alerts, setAlerts] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('efficiency_index');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    const fetchData = async () => {
      const [analytics, alertData] = await Promise.all([
        mockService.getEliteAnalytics(),
        mockService.getConversionAlerts()
      ]);
      setData(analytics);
      setAlerts(new Set(alertData.map(a => a.asset_id)));
    };
    fetchData();
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (valA === valB) return 0;
    
    // String comparison
    if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDirection === 'asc' 
            ? valA.localeCompare(valB) 
            : valB.localeCompare(valA);
    }
    
    // Numeric comparison
    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const renderTrend = (trend: 'UP' | 'DOWN' | 'STABLE') => {
    switch (trend) {
        case 'UP': return <TrendingUp className="w-3 h-3 text-tech-green" />;
        case 'DOWN': return <TrendingDown className="w-3 h-3 text-red-500" />;
        default: return <Minus className="w-3 h-3 text-gray-500" />;
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex justify-between items-end border-b border-void-border pb-4">
         <div>
            <h2 className="text-2xl font-bold text-white tracking-widest uppercase">Bóveda Élite</h2>
            <p className="font-mono text-xs text-gray-500">ANÁLISIS DE RENDIMIENTO DE ALTO NIVEL</p>
         </div>
         <div className="font-mono text-xs text-gray-600">
            {data.length} ASSETS MONITORED
         </div>
      </div>

      <div className="flex-1 overflow-auto border border-void-border bg-void-gray/10 relative">
         <table className="w-full text-left border-collapse">
            <thead className="bg-black sticky top-0 z-10">
               <tr className="border-b border-void-border">
                  {[
                    { key: 'sku', label: 'SKU' },
                    { key: 'asset_name', label: 'ASSET NAME' },
                    { key: 'tier', label: 'RANK' },
                    { key: 'traffic_score', label: 'TRAFFIC' },
                    { key: 'revenue_score', label: 'REVENUE' },
                    { key: 'efficiency_index', label: 'EFF. INDEX' },
                    { key: 'traffic_trend', label: 'TREND' },
                  ].map((col) => (
                     <th 
                        key={col.key}
                        onClick={() => handleSort(col.key as SortField)}
                        className="p-3 text-[10px] font-mono text-gray-500 uppercase tracking-widest cursor-pointer hover:text-white transition-colors select-none"
                     >
                        <div className="flex items-center gap-1">
                           {col.label}
                           {sortField === col.key && (
                              sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 text-tech-green" /> : <ChevronDown className="w-3 h-3 text-tech-green" />
                           )}
                        </div>
                     </th>
                  ))}
               </tr>
            </thead>
            <tbody className="divide-y divide-void-border font-mono text-xs">
               {sortedData.map((row) => {
                 const isAlert = alerts.has(row.asset_id);
                 return (
                    <motion.tr 
                        key={row.asset_id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={cn(
                           "group hover:bg-void-gray/40 transition-colors",
                           isAlert ? "bg-red-900/10 hover:bg-red-900/20" : ""
                        )}
                    >
                       <td className="p-3 text-gray-400 group-hover:text-white border-r border-void-border/30">
                          {row.sku}
                       </td>
                       <td className="p-3 font-sans font-bold text-gray-300 group-hover:text-white border-r border-void-border/30">
                          {row.asset_name}
                       </td>
                       <td className="p-3 border-r border-void-border/30">
                          <RarityBadge tier={row.tier} className="scale-90 origin-left" />
                       </td>
                       <td className="p-3 text-right pr-8 border-r border-void-border/30">
                          <span className="text-gray-300">{row.traffic_score}</span>
                       </td>
                       <td className="p-3 text-right pr-8 border-r border-void-border/30">
                          <span className={cn(
                             "font-bold",
                             row.revenue_score === 0 ? "text-red-500" : "text-tech-green"
                          )}>
                             {row.revenue_score}
                          </span>
                       </td>
                       <td className="p-3 text-right pr-8 border-r border-void-border/30">
                          {row.efficiency_index.toFixed(1)}%
                       </td>
                       <td className="p-3 text-center">
                          {renderTrend(row.traffic_trend)}
                       </td>
                    </motion.tr>
                 );
               })}
            </tbody>
         </table>
      </div>
      
      {/* Legend */}
      <div className="flex gap-4 text-[10px] font-mono text-gray-600">
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-900/50 border border-red-900"></div>
            <span>CONVERSION ALERT (HIGH TRAFFIC / NO REV)</span>
         </div>
      </div>
    </div>
  );
};

export default EliteVault;
