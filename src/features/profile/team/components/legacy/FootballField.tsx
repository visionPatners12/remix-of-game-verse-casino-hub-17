import React from 'react';
import { Player } from '@/types/team';

interface FootballFieldProps {
  players: Player[];
  teamColors: {
    primary: string;
    secondary: string;
  };
  className?: string;
}

export function FootballField({ players, teamColors, className = '' }: FootballFieldProps) {
  // Default formation if no players provided
  const defaultPositions = [
    { x: 85, y: 50, name: 'GK', number: 1 },
    { x: 65, y: 20, name: 'RB', number: 2 },
    { x: 65, y: 40, name: 'CB', number: 4 },
    { x: 65, y: 60, name: 'CB', number: 5 },
    { x: 65, y: 80, name: 'LB', number: 3 },
    { x: 45, y: 30, name: 'CM', number: 6 },
    { x: 45, y: 50, name: 'CM', number: 8 },
    { x: 45, y: 70, name: 'CM', number: 10 },
    { x: 25, y: 35, name: 'RW', number: 7 },
    { x: 15, y: 50, name: 'ST', number: 9 },
    { x: 25, y: 65, name: 'LW', number: 11 },
  ];

  const playersToShow = players.length > 0 ? players : defaultPositions;

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Football Field */}
      <svg
        viewBox="0 0 100 60"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Field background */}
        <rect width="100" height="60" fill="#2d5016" />
        
        {/* Grass pattern */}
        <defs>
          <pattern id="grass" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
            <rect width="2" height="4" fill="#2d5016" />
            <rect x="2" width="2" height="4" fill="#3a6b1f" />
          </pattern>
        </defs>
        <rect width="100" height="60" fill="url(#grass)" opacity="0.3" />
        
        {/* Field markings */}
        <g stroke="white" strokeWidth="0.3" fill="none">
          {/* Outer boundary */}
          <rect x="2" y="2" width="96" height="56" />
          
          {/* Center line */}
          <line x1="50" y1="2" x2="50" y2="58" />
          
          {/* Center circle */}
          <circle cx="50" cy="30" r="8" />
          <circle cx="50" cy="30" r="0.5" fill="white" />
          
          {/* Penalty areas */}
          <rect x="2" y="18" width="16" height="24" />
          <rect x="82" y="18" width="16" height="24" />
          
          {/* Goal areas */}
          <rect x="2" y="24" width="6" height="12" />
          <rect x="92" y="24" width="6" height="12" />
          
          {/* Penalty spots */}
          <circle cx="12" cy="30" r="0.5" fill="white" />
          <circle cx="88" cy="30" r="0.5" fill="white" />
          
          {/* Penalty arcs */}
          <path d="M 18 20 A 8 8 0 0 1 18 40" />
          <path d="M 82 20 A 8 8 0 0 0 82 40" />
          
          {/* Corner arcs */}
          <path d="M 2 4 A 2 2 0 0 1 4 2" />
          <path d="M 2 56 A 2 2 0 0 0 4 58" />
          <path d="M 98 4 A 2 2 0 0 0 96 2" />
          <path d="M 98 56 A 2 2 0 0 1 96 58" />
        </g>
        
        {/* Players */}
        {playersToShow.map((player, index) => (
          <g key={index} className="group animate-pulse">
            {/* Player circle with team color */}
            <circle
              cx={player.x}
              cy={player.y}
              r="2.5"
              fill={teamColors.primary}
              stroke="white"
              strokeWidth="0.3"
              className="transition-all duration-300 group-hover:r-3"
            />
            
            {/* Player number */}
            <text
              x={player.x}
              y={player.y + 0.5}
              textAnchor="middle"
              fontSize="2"
              fill="white"
              fontWeight="bold"
              className="pointer-events-none"
            >
              {player.number || index + 1}
            </text>
            
            {/* Player name on hover */}
            <text
              x={player.x}
              y={player.y - 3.5}
              textAnchor="middle"
              fontSize="1.5"
              fill="white"
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            >
              {player.name}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}