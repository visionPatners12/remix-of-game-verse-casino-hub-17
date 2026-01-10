import React from 'react';
import { Group, Circle, Ring, Star } from 'react-konva';
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
        // Elegant victory pawn
        return (
          <Group key={`goal-pawn-${color}-${index}`}>
            {/* Soft victory glow */}
            <Circle
              x={position.x}
              y={position.y}
              radius={radius * 2}
              fillRadialGradientStartPoint={{ x: 0, y: 0 }}
              fillRadialGradientStartRadius={0}
              fillRadialGradientEndPoint={{ x: 0, y: 0 }}
              fillRadialGradientEndRadius={radius * 2}
              fillRadialGradientColorStops={[
                0, `${glowColor}25`,
                0.5, `${glowColor}10`,
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
              fillRadialGradientEndRadius={radius * 1.2}
              fillRadialGradientColorStops={[
                0, '#ffffff',
                0.3, colorHex,
                1, colorHex
              ]}
              stroke={glowColor}
              strokeWidth={2}
            />
            {/* Victory star */}
            <Star
              x={position.x}
              y={position.y}
              numPoints={5}
              innerRadius={radius * 0.2}
              outerRadius={radius * 0.4}
              fill="#ffffff"
              stroke={glowColor}
              strokeWidth={0.5}
              opacity={0.9}
            />
          </Group>
        );
      } else {
        // Elegant empty goal slot
        return (
          <Group key={`goal-slot-${color}-${index}`}>
            {/* Soft background */}
            <Circle
              x={position.x}
              y={position.y}
              radius={radius * 1.2}
              fill={`${glowColor}10`}
            />
            {/* Simple ring */}
            <Ring
              x={position.x}
              y={position.y}
              innerRadius={radius * 0.6}
              outerRadius={radius * 0.9}
              fill={`${colorHex}08`}
              stroke={glowColor}
              strokeWidth={1}
              opacity={0.4}
            />
            {/* Center dot */}
            <Circle
              x={position.x}
              y={position.y}
              radius={radius * 0.15}
              fill={glowColor}
              opacity={0.25}
            />
          </Group>
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
