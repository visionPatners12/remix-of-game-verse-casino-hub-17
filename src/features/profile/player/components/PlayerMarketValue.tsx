import { MarketValuePoint } from '../types/player';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PlayerMarketValueProps {
  data: MarketValuePoint[];
}

function formatValue(value: number): string {
  if (value >= 1000000) {
    return `€${(value / 1000000).toFixed(0)}M`;
  }
  if (value >= 1000) {
    return `€${(value / 1000).toFixed(0)}K`;
  }
  return `€${value}`;
}

function parseDate(dateStr: string): Date {
  // Handle "DD/MM/YYYY" format
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  }
  return new Date(dateStr);
}

export function PlayerMarketValue({ data }: PlayerMarketValueProps) {
  if (!data || data.length === 0) return null;

  // Sort by date (oldest first)
  const sorted = [...data].sort((a, b) => 
    parseDate(a.recordedDate).getTime() - parseDate(b.recordedDate).getTime()
  );

  const current = sorted[sorted.length - 1];
  const previous = sorted[sorted.length - 2];
  const peak = sorted.reduce((max, item) => 
    item.value > max.value ? item : max, sorted[0]
  );

  // Calculate percentage change
  const percentChange = previous 
    ? ((current.value - previous.value) / previous.value) * 100 
    : 0;

  // Get min/max for chart scaling
  const values = sorted.map(p => p.value);
  const maxVal = Math.max(...values);
  const minVal = Math.min(...values);
  const range = maxVal - minVal || 1;

  // Create chart points (last 15 points)
  const chartPoints = sorted.slice(-15);
  const chartWidth = 280;
  const chartHeight = 80;
  const paddingX = 10;
  const paddingY = 10;
  const innerWidth = chartWidth - paddingX * 2;
  const innerHeight = chartHeight - paddingY * 2;
  const stepX = innerWidth / (chartPoints.length - 1 || 1);
  
  const points = chartPoints.map((point, i) => {
    const x = paddingX + i * stepX;
    const y = paddingY + innerHeight - ((point.value - minVal) / range) * innerHeight;
    return { x, y, data: point };
  });

  // Find local peaks (local maxima)
  const peakIndices = points.map((p, i) => {
    if (i === 0 || i === points.length - 1) return false;
    const prev = points[i - 1];
    const next = points[i + 1];
    return p.data.value > prev.data.value && p.data.value >= next.data.value;
  });

  // Also mark the global peak
  const globalPeakIndex = chartPoints.findIndex(p => p.value === peak.value);

  const pathPoints = points.map((p, i) => 
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ');

  const isTrendingUp = percentChange >= 0;

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Market Value
      </h3>
      
      {/* Current Value + Trend */}
      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-bold text-foreground">
          {formatValue(current.value)}
        </span>
        {previous && (
          <div className="flex items-center gap-1">
            {isTrendingUp ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span className={`text-sm font-medium ${isTrendingUp ? 'text-green-500' : 'text-red-500'}`}>
              {isTrendingUp ? '+' : ''}{percentChange.toFixed(0)}%
            </span>
          </div>
        )}
      </div>


      {/* Enhanced Chart */}
      <div className="relative bg-muted/30 rounded-lg p-2">
        <svg 
          viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
          className="w-full h-20"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
              <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <line
              key={i}
              x1={paddingX}
              y1={paddingY + innerHeight * (1 - ratio)}
              x2={chartWidth - paddingX}
              y2={paddingY + innerHeight * (1 - ratio)}
              stroke="hsl(var(--border))"
              strokeWidth="0.5"
              strokeDasharray="2,2"
              opacity="0.5"
            />
          ))}

          {/* Area under curve */}
          <path
            d={`${pathPoints} L ${points[points.length - 1]?.x || 0} ${chartHeight - paddingY} L ${paddingX} ${chartHeight - paddingY} Z`}
            fill="url(#valueGradient)"
          />

          {/* Main line */}
          <path
            d={pathPoints}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
          />

          {/* Data points with values - alternating top/bottom */}
          {points.map((point, i) => {
            const isPeak = peakIndices[i] || i === globalPeakIndex;
            const isCurrent = i === points.length - 1;
            const isTop = i % 2 === 0; // Alternate: even = top, odd = bottom
            const labelY = isTop ? point.y - 10 : point.y + 14;
            
            return (
              <g key={i}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={isCurrent ? 4 : isPeak ? 3.5 : 2.5}
                  fill={isCurrent ? 'hsl(var(--primary))' : isPeak ? 'hsl(var(--chart-1))' : 'hsl(var(--background))'}
                  stroke={isPeak ? 'hsl(var(--chart-1))' : 'hsl(var(--primary))'}
                  strokeWidth={1.5}
                />
                {/* Value label - alternating position */}
                <text
                  x={point.x}
                  y={labelY}
                  textAnchor="middle"
                  fontSize="7"
                  fontWeight="500"
                  fill={isPeak ? 'hsl(var(--chart-1))' : 'hsl(var(--muted-foreground))'}
                >
                  {formatValue(point.data.value)}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Date labels */}
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1 px-1">
          <span>{chartPoints[0]?.recordedDate}</span>
          <span>{chartPoints[chartPoints.length - 1]?.recordedDate}</span>
        </div>
      </div>

      {/* Peak info */}
      {peak.value > current.value && (
        <div className="flex items-center gap-2 text-xs p-2 bg-muted/30 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-chart-1" />
          <span className="text-muted-foreground">
            Peak: <span className="text-foreground font-medium">{formatValue(peak.value)}</span>
            {' '}({peak.recordedDate}, {peak.club})
          </span>
        </div>
      )}
    </div>
  );
}
