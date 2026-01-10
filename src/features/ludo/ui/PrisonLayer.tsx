import React from 'react';
import { Group, Circle, Ring } from 'react-konva';
import { PRISON_SLOTS, LUDO_COLORS, DEFAULT_PROPS, NEON_GLOW } from '../model/constants';
import { PRISON_BASE, isInPrison } from '../model/ludoModel';
import { center } from '../model/utils';
import { InteractivePawn } from '../components/InteractivePawn';
import type { Color, Positions } from '../model/ludoModel';

interface PrisonLayerProps {
  cellSize: number;
  padding: number;
  showHeaders?: boolean;
  gamePositions: Positions;
  possibleMoves?: Array<{pawnIndex: number, from?: string, target?: number | null}>;
  onPawnClick?: (playerId: string, pawnIndex: number) => void;
  currentTurn?: string;
  players?: Array<{id: string, color: string}>;
}

const COLOR_MAP = {
  R: 'RED',
  G: 'GREEN', 
  Y: 'YELLOW',
  B: 'BLUE'
} as const;

export function PrisonLayer({ 
  cellSize, 
  padding, 
  showHeaders = true, 
  gamePositions,
  possibleMoves = [],
  onPawnClick,
  currentTurn,
  players = [],
}: PrisonLayerProps) {
  const radius = cellSize * DEFAULT_PROPS.PRISON_RADIUS;

  const getCapturedPawns = (prisonColor: Color): Array<{ color: Color; pawnIndex: number; slotIndex: number }> => {
    const capturedPawns: Array<{ color: Color; pawnIndex: number; slotIndex: number }> = [];
    const base = PRISON_BASE[prisonColor];
    
    (['R', 'G', 'Y', 'B'] as Color[]).forEach(pawnColor => {
      const positions = gamePositions[pawnColor];
      positions.forEach((pos, pawnIndex) => {
        if (isInPrison(pos, prisonColor)) {
          const slotIndex = base - pos;
          capturedPawns.push({ color: pawnColor, pawnIndex, slotIndex });
        }
      });
    });
    
    return capturedPawns.sort((a, b) => a.slotIndex - b.slotIndex);
  };

  const renderPrisonSlots = (prisonColor: Color) => {
    const colorName = COLOR_MAP[prisonColor] as keyof typeof PRISON_SLOTS;
    const capturedPawns = getCapturedPawns(prisonColor);
    const colorHex = LUDO_COLORS[colorName];
    const glowColor = NEON_GLOW[colorName];
    const displayOrder = PRISON_SLOTS[colorName];

    return displayOrder.map((slotLabel, displayIndex) => {
      const position = center(slotLabel, cellSize, padding, showHeaders);
      const capturedPawn = capturedPawns.find(p => p.slotIndex === displayIndex);

      if (capturedPawn) {
        const prisonPosition = PRISON_BASE[prisonColor] - displayIndex;
        const pawnOwner = players.find(p => p.color === capturedPawn.color);
        const isClickable = 
          pawnOwner?.color === currentTurn && 
          possibleMoves.some(m => m.pawnIndex === capturedPawn.pawnIndex && m.from === 'prison');
        
        return (
          <InteractivePawn
            key={`prison-pawn-${prisonColor}-${displayIndex}`}
            x={position.x}
            y={position.y}
            color={capturedPawn.color}
            position={prisonPosition}
            isClickable={isClickable}
            cellSize={cellSize}
            onClick={() => isClickable && pawnOwner && onPawnClick?.(pawnOwner.id, capturedPawn.pawnIndex)}
          />
        );
      } else {
        // Futuristic forcefield empty slot
        return (
          <Group key={`prison-slot-${prisonColor}-${displayIndex}`}>
            {/* Outer energy field */}
            <Circle
              x={position.x}
              y={position.y}
              radius={radius * 1.4}
              fillRadialGradientStartPoint={{ x: 0, y: 0 }}
              fillRadialGradientStartRadius={0}
              fillRadialGradientEndPoint={{ x: 0, y: 0 }}
              fillRadialGradientEndRadius={radius * 1.4}
              fillRadialGradientColorStops={[
                0, `${glowColor}22`,
                0.7, `${glowColor}11`,
                1, 'transparent'
              ]}
            />
            {/* Forcefield ring */}
            <Ring
              x={position.x}
              y={position.y}
              innerRadius={radius * 0.7}
              outerRadius={radius}
              fill={`${colorHex}11`}
              stroke={glowColor}
              strokeWidth={1.5}
              dash={[4, 3]}
              opacity={0.7}
            />
            {/* Center energy core */}
            <Circle
              x={position.x}
              y={position.y}
              radius={radius * 0.3}
              fill={glowColor}
              opacity={0.2}
            />
          </Group>
        );
      }
    });
  };

  return (
    <Group>
      {(['R', 'G', 'Y', 'B'] as Color[]).map(color => (
        <Group key={`prison-group-${color}`}>
          {renderPrisonSlots(color)}
        </Group>
      ))}
    </Group>
  );
}
