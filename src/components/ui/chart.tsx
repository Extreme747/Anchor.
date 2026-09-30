import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LineChartPoint {
  label: string;
  value: number;
}

interface InteractiveLineChartProps {
  data: LineChartPoint[];
  color?: string;
  height?: number;
  className?: string;
  valuePrefix?: string;
  valueSuffix?: string;
}

export function InteractiveLineChart({
  data,
  color = '#C8953A',
  height = 160,
  className,
  valuePrefix = '',
  valueSuffix = '',
}: InteractiveLineChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!data || data.length === 0) return null;

  const w = 500;
  const padX = 30;
  const padY = 24;

  const values = data.map(d => d.value);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = padX + (i / (data.length - 1)) * (w - padX * 2);
    const y = height - padY - ((d.value - min) / range) * (height - padY * 2);
    return { ...d, x, y };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${height - padY} L ${points[0].x.toFixed(1)} ${height - padY} Z`;
  const gradId = `chart-grad-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div ref={containerRef} className={cn("relative w-full select-none", className)}>
      <svg 
        viewBox={`0 0 ${w} ${height}`} 
        className="w-full overflow-visible" 
        style={{ height }}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid guide lines */}
        {[0.25, 0.5, 0.75].map(fraction => {
          const y = height - padY - fraction * (height - padY * 2);
          return (
            <line 
              key={fraction} 
              x1={padX} 
              x2={w - padX} 
              y1={y} 
              y2={y} 
              stroke="rgba(255,255,255,0.05)" 
              strokeWidth="1" 
              strokeDasharray="4 4"
            />
          );
        })}

        {/* Area fill */}
        <path d={areaD} fill={`url(#${gradId})`} />

        {/* Line stroke */}
        <motion.path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />

        {/* Vertical crosshair on hover */}
        {hoveredIdx !== null && (
          <line
            x1={points[hoveredIdx].x}
            x2={points[hoveredIdx].x}
            y1={padY}
            y2={height - padY}
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
        )}

        {/* Data points & hit areas */}
        {points.map((p, i) => {
          const isHovered = hoveredIdx === i;
          return (
            <g key={i} className="cursor-pointer">
              {/* Invisible large hit area for easy hover on touch/mouse */}
              <circle
                cx={p.x}
                cy={p.y}
                r={16}
                fill="transparent"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />

              {/* Visible dot */}
              <circle
                cx={p.x}
                cy={p.y}
                r={isHovered ? 5 : 3.5}
                fill={isHovered ? '#FFFFFF' : color}
                stroke="#070708"
                strokeWidth={isHovered ? 3 : 2}
                className="transition-all duration-150"
              />
            </g>
          );
        })}

        {/* Bottom X-axis labels */}
        {points.map((p, i) => (
          <text
            key={i}
            x={p.x}
            y={height - 6}
            textAnchor="middle"
            className="fill-tertiary font-mono text-[9px]"
          >
            {p.label}
          </text>
        ))}
      </svg>

      {/* Floating Interactive Tooltip Popover */}
      <AnimatePresence>
        {hoveredIdx !== null && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-20 pointer-events-none -translate-x-1/2 bg-surface-card border border-border-strong px-2.5 py-1.5 rounded-md shadow-xl backdrop-blur-md"
            style={{
              left: `${(points[hoveredIdx].x / w) * 100}%`,
              top: `${Math.max(points[hoveredIdx].y - 40, 0)}px`,
            }}
          >
            <div className="font-mono text-[10px] text-tertiary">
              {points[hoveredIdx].label}
            </div>
            <div className="font-mono text-xs font-semibold text-accent tabular-nums">
              {valuePrefix}{points[hoveredIdx].value.toLocaleString('en-IN')}{valueSuffix}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
