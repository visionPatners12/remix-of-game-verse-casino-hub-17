import React, { useState, useMemo } from 'react';
import { Circle, Group, Ring } from 'react-konva';
import { HOME_PAWNS, START_CELLS, SAFE_CORRIDORS, EXTRA_DOTS, LUDO_COLORS, NEON_GLOW } from '../model/constants';
import { center } from '../model/utils';
import { InteractivePawn } from '../components/InteractivePawn';
import { positionToCoordinates, calculateStackOffset } from '../utils/positionConverter';
import { groupPawnsByPosition } from '../utils/positionExtractor';
import type { Color, Positions } from '../model/ludoModel';
import type { AnimatingPawn } from '../hooks/usePawnAnimation';

interface Player {
  id: string;
  user_id: string;
  color: string;
  position: number;
  is_ready: boolean;
  is_connected: boolean;
}

interface PawnLayerProps {
  cellSize: number;
  padding: number;
  showHeaders?: boolean;
  players?: Player[];
  gamePositions?: Positions;
  possibleMoves?: Array<{pawnIndex: number, canExit: boolean}>;
  onPawnClick?: (playerId: string, pawnIndex: number) => void;
  isMoving?: boolean;
  currentTurn?: string;
  animatingPawn?: AnimatingPawn | null;
}

// Map color to glow color
const COLOR_TO_GLOW: Record<string, string> = {
  [LUDO_COLORS.RED]: NEON_GLOW.RED,
  [LUDO_COLORS.GREEN]: NEON_GLOW.GREEN,
  [LUDO_COLORS.YELLOW]: NEON_GLOW.YELLOW,
  [LUDO_COLORS.BLUE]: NEON_GLOW.BLUE,
};

export const PawnLayer: React.FC<PawnLayerProps> = ({ 
  cellSize, 
  padding,
  showHeaders = true,
  players = [],
  gamePositions,
  possibleMoves = [],
  onPawnClick,
  isMoving = false,
  currentTurn,
  animatingPawn,
}) => {
  const startDotRadius = cellSize * 0.18;
  const safeDotRadius = cellSize * 0.12;
  const [hoveredPawn, setHoveredPawn] = useState<string | null>(null);
  const [pressedPawn, setPressedPawn] = useState<string | null>(null);

  const pawnGroups = useMemo(() => 
    groupPawnsByPosition(gamePositions, players),
    [gamePositions, players]
  );

  const allPawns = useMemo(() => {
    const pawns: Array<{
      pawnInfo: { position: number; pawnIndex: number; color: Color; playerId: string };
      offset: { dx: number; dy: number };
      isStacked: boolean;
    }> = [];
    
    pawnGroups.forEach((group) => {
      group.forEach((pawnInfo, indexInGroup) => {
        const offset = calculateStackOffset(indexInGroup, group.length, cellSize);
        pawns.push({
          pawnInfo,
          offset,
          isStacked: group.length > 1
        });
      });
    });
    
    return pawns;
  }, [pawnGroups, cellSize]);

  const getDisplayPosition = (pawnInfo: { playerId: string; pawnIndex: number; color: Color; position: number }) => {
    if (
      animatingPawn &&
      animatingPawn.playerId === pawnInfo.playerId &&
      animatingPawn.pawnIndex === pawnInfo.pawnIndex
    ) {
      return animatingPawn.path[animatingPawn.currentStep];
    }
    return pawnInfo.position;
  };

  return (
    <Group>
      {/* Futuristic Start Cells - Portal vortex style */}
      {START_CELLS.map((start, index) => {
        const pos = center(start.label, cellSize, padding, showHeaders);
        const glowColor = COLOR_TO_GLOW[start.color] || start.color;
        return (
          <Group key={`start-cell-${index}`}>
            {/* Outer portal glow */}
            <Circle
              x={pos.x}
              y={pos.y}
              radius={startDotRadius * 2.5}
              fillRadialGradientStartPoint={{ x: 0, y: 0 }}
              fillRadialGradientStartRadius={0}
              fillRadialGradientEndPoint={{ x: 0, y: 0 }}
              fillRadialGradientEndRadius={startDotRadius * 2.5}
              fillRadialGradientColorStops={[
                0, `${glowColor}44`,
                0.6, `${glowColor}22`,
                1, 'transparent'
              ]}
            />
            {/* Energy ring */}
            <Ring
              x={pos.x}
              y={pos.y}
              innerRadius={startDotRadius * 1.3}
              outerRadius={startDotRadius * 1.6}
              fill={`${glowColor}22`}
              stroke={glowColor}
              strokeWidth={1}
              opacity={0.7}
            />
            {/* White inner ring */}
            <Circle
              x={pos.x}
              y={pos.y}
              radius={startDotRadius * 1.1}
              fill={LUDO_COLORS.WHITE}
              stroke={glowColor}
              strokeWidth={1.5}
              shadowColor={glowColor}
              shadowBlur={8}
              shadowOpacity={0.5}
            />
            {/* Colored core */}
            <Circle
              x={pos.x}
              y={pos.y}
              radius={startDotRadius}
              fillRadialGradientStartPoint={{ x: 0, y: 0 }}
              fillRadialGradientStartRadius={0}
              fillRadialGradientEndPoint={{ x: 0, y: 0 }}
              fillRadialGradientEndRadius={startDotRadius}
              fillRadialGradientColorStops={[
                0, glowColor,
                0.6, start.color,
                1, `${start.color}88`
              ]}
              shadowColor={start.color}
              shadowBlur={6}
              shadowOpacity={0.6}
            />
          </Group>
        );
      })}

      {/* Futuristic Safe Corridor Dots - Energy nodes */}
      {SAFE_CORRIDORS.map((safe, index) => {
        const pos = center(safe.label, cellSize, padding, showHeaders);
        const glowColor = COLOR_TO_GLOW[safe.color] || safe.color;
        return (
          <Group key={`safe-dot-${index}`}>
            {/* Subtle glow */}
            <Circle
              x={pos.x}
              y={pos.y}
              radius={safeDotRadius * 2}
              fillRadialGradientStartPoint={{ x: 0, y: 0 }}
              fillRadialGradientStartRadius={0}
              fillRadialGradientEndPoint={{ x: 0, y: 0 }}
              fillRadialGradientEndRadius={safeDotRadius * 2}
              fillRadialGradientColorStops={[
                0, `${glowColor}33`,
                1, 'transparent'
              ]}
            />
            {/* Energy dot */}
            <Circle
              x={pos.x}
              y={pos.y}
              radius={safeDotRadius}
              fill={safe.color}
              shadowColor={glowColor}
              shadowBlur={4}
              shadowOpacity={0.6}
            />
          </Group>
        );
      })}

      {/* Extra Dots */}
      {EXTRA_DOTS.map((extra, index) => {
        const pos = center(extra.label, cellSize, padding, showHeaders);
        const glowColor = COLOR_TO_GLOW[extra.color] || extra.color;
        return (
          <Group key={`extra-dot-${index}`}>
            <Circle
              x={pos.x}
              y={pos.y}
              radius={safeDotRadius * 2}
              fillRadialGradientStartPoint={{ x: 0, y: 0 }}
              fillRadialGradientStartRadius={0}
              fillRadialGradientEndPoint={{ x: 0, y: 0 }}
              fillRadialGradientEndRadius={safeDotRadius * 2}
              fillRadialGradientColorStops={[
                0, `${glowColor}33`,
                1, 'transparent'
              ]}
            />
            <Circle
              x={pos.x}
              y={pos.y}
              radius={safeDotRadius}
              fill={extra.color}
              shadowColor={glowColor}
              shadowBlur={4}
              shadowOpacity={0.6}
            />
          </Group>
        );
      })}

      {/* Interactive Player Pawns */}
      {allPawns.map(({ pawnInfo, offset, isStacked }) => {
        const displayPosition = getDisplayPosition(pawnInfo);
        const isCurrentlyAnimating = animatingPawn?.playerId === pawnInfo.playerId && 
                                      animatingPawn?.pawnIndex === pawnInfo.pawnIndex;
        
        const basePos = positionToCoordinates(
          displayPosition, 
          pawnInfo.color, 
          pawnInfo.pawnIndex, 
          cellSize, 
          padding, 
          showHeaders
        );
        
        const pos = isCurrentlyAnimating ? basePos : {
          x: basePos.x + offset.dx,
          y: basePos.y + offset.dy
        };
        
        const pawnId = `${pawnInfo.playerId}-${pawnInfo.pawnIndex}`;
        const isHovered = hoveredPawn === pawnId;
        const isPressed = pressedPawn === pawnId;
        const isClickable = pawnInfo.color === currentTurn && 
          possibleMoves.some(move => move.pawnIndex === pawnInfo.pawnIndex) && 
          !isMoving &&
          !animatingPawn;
        
        return (
          <InteractivePawn
            key={pawnId}
            x={pos.x}
            y={pos.y}
            color={pawnInfo.color}
            position={displayPosition}
            isClickable={isClickable}
            isHovered={isHovered}
            isPressed={isPressed}
            cellSize={cellSize}
            isStacked={isStacked && !isCurrentlyAnimating}
            onClick={() => isClickable && !isMoving && !animatingPawn && onPawnClick?.(pawnInfo.playerId, pawnInfo.pawnIndex)}
            onMouseEnter={() => !isMoving && !animatingPawn && setHoveredPawn(pawnId)}
            onMouseLeave={() => setHoveredPawn(null)}
            onTouchStart={() => !isMoving && !animatingPawn && setPressedPawn(pawnId)}
            onTouchEnd={() => setPressedPawn(null)}
          />
        );
      })}
    </Group>
  );
};
