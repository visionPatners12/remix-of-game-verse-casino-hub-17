import React from 'react';
import { Group, Circle, Star } from 'react-konva';
import { GOAL_SLOTS, LUDO_COLORS, DEFAULT_PROPS, NEON_GLOW } from '../model/constants';
import { GOAL } from '../model/ludoModel';
import { center } from '../model/utils';
import type { Color, Positions } from '../model/ludoModel';

interface GoalLayerProps {
  cellSize: number;
  padding: number;
  showHeaders?: boolean;
  gamePositions: Positions;
}

const COLOR_MAP = {
  R: 'RED',
  G: 'GREEN', 
  Y: 'YELLOW',
  B: 'BLUE'
} as const;

export function GoalLayer({ 
  cellSize, 
  padding, 
  showHeaders = false, 
  gamePositions,
}: GoalLayerProps) {
  const radius = cellSize * DEFAULT_PROPS.PRISON_RADIUS;

  const getFinishedPawns = (color: Color): number => {
    const positions = gamePositions[color];
    return positions.filter(pos => pos === GOAL).length;
  };

  const renderGoalSlots = (color: Color) => {
    const colorName = COLOR_MAP[color] as keyof typeof GOAL_SLOTS;
    const finishedCount = getFinishedPawns(color);
    const colorHex = LUDO_COLORS[colorName];
    const glowColor = NEON_GLOW[colorName];
    const slots = GOAL_SLOTS[colorName];

    return slots.map((slotLabel, index) => {
      const position = center(slotLabel, cellSize, padding, showHeaders);
      const isFinished = index < finishedCount;

      if (isFinished) {
        // Victory pawn with subtle glow
        return (
          <Group key={`goal-pawn-${color}-${index}`}>
            {/* Subtle aura */}
            <Circle
              x={position.x}
              y={position.y}
              radius={radius * 1.6}
              fillRadialGradientStartPoint={{ x: 0, y: 0 }}
              fillRadialGradientStartRadius={0}
              fillRadialGradientEndPoint={{ x: 0, y: 0 }}
              fillRadialGradientEndRadius={radius * 1.6}
              fillRadialGradientColorStops={[
                0, `${glowColor}20`,
                0.5, `${glowColor}08`,
                1, 'transparent'
              ]}
            />
            {/* Main pawn body */}
            <Circle
              x={position.x}
              y={position.y}
              radius={radius * 1.2}
              fillRadialGradientStartPoint={{ x: -radius * 0.3, y: -radius * 0.3 }}
              fillRadialGradientStartRadius={0}
              fillRadialGradientEndPoint={{ x: radius * 0.3, y: radius * 0.3 }}
              fillRadialGradientEndRadius={radius * 1.4}
              fillRadialGradientColorStops={[
                0, '#ffffff',
                0.3, colorHex,
                0.85, colorHex,
                1, `${colorHex}aa`
              ]}
              stroke={glowColor}
              strokeWidth={2}
              shadowColor={colorHex}
              shadowBlur={8}
              shadowOpacity={0.5}
            />
            {/* Victory star */}
            <Star
              x={position.x}
              y={position.y}
              numPoints={5}
              innerRadius={radius * 0.2}
              outerRadius={radius * 0.4}
              fill="#ffffff"
              opacity={0.85}
            />
          </Group>
        );
      } else {
        // Simple empty slot
        return (
          <Circle
            key={`goal-slot-${color}-${index}`}
            x={position.x}
            y={position.y}
            radius={radius * 0.8}
            fill={`${colorHex}10`}
            stroke={glowColor}
            strokeWidth={1}
            dash={[3, 3]}
            opacity={0.4}
          />
        );
      }
    });
  };

  return (
    <Group>
      {(['R', 'G', 'Y', 'B'] as Color[]).map(color => (
        <Group key={`goal-group-${color}`}>
          {renderGoalSlots(color)}
        </Group>
      ))}
    </Group>
  );
}
