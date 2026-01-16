import React from 'react';
import { DEFAULT_CHAIN_ID } from '@/config/chains';

export interface ChainConfig {
  id: number;
  name: string;
  shortName: string;
  color: string;
  bgColor: string;
  symbol: string;
}

// Base first as default chain
export const SUPPORTED_CHAINS: ChainConfig[] = [
  { id: 8453, name: 'Base', shortName: 'BASE', color: '#0052FF', bgColor: 'bg-blue-600/20', symbol: 'ETH' },
  { id: 137, name: 'Polygon', shortName: 'POL', color: '#8247E5', bgColor: 'bg-purple-500/20', symbol: 'POL' },
  { id: 1, name: 'Ethereum', shortName: 'ETH', color: '#627EEA', bgColor: 'bg-blue-500/20', symbol: 'ETH' },
  { id: 42161, name: 'Arbitrum', shortName: 'ARB', color: '#2D374B', bgColor: 'bg-slate-500/20', symbol: 'ETH' },
  { id: 10, name: 'Optimism', shortName: 'OP', color: '#FF0420', bgColor: 'bg-red-500/20', symbol: 'ETH' },
  { id: 56, name: 'BNB Chain', shortName: 'BNB', color: '#F0B90B', bgColor: 'bg-yellow-500/20', symbol: 'BNB' },
];

export const getChainConfig = (chainId: number): ChainConfig | undefined => {
  return SUPPORTED_CHAINS.find(chain => chain.id === chainId);
};

interface ChainIconProps {
  chainId: number;
  size?: number;
  className?: string;
  showName?: boolean;
}

// Chain logos as simple colored circles with first letter
export const ChainIcon: React.FC<ChainIconProps> = ({ 
  chainId, 
  size = 20, 
  className = '',
  showName = false 
}) => {
  const config = getChainConfig(chainId);
  
  if (!config) {
    return (
      <div 
        className={`flex items-center justify-center rounded-full bg-muted ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-xs text-muted-foreground font-bold">?</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div 
        className="flex items-center justify-center rounded-full"
        style={{ 
          width: size, 
          height: size, 
          backgroundColor: `${config.color}20`,
          border: `2px solid ${config.color}`
        }}
      >
        <span 
          className="font-bold" 
          style={{ 
            fontSize: size * 0.45, 
            color: config.color 
          }}
        >
          {config.shortName.charAt(0)}
        </span>
      </div>
      {showName && (
        <span className="text-sm font-medium text-foreground">{config.name}</span>
      )}
    </div>
  );
};
