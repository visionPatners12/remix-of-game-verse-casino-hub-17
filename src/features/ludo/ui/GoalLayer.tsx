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
        // Victory pawn with holographic crown effect
        return (
          <Group key={`goal-pawn-${color}-${index}`}>
            {/* Outer victory aura */}
            <Circle
              x={position.x}
              y={position.y}
              radius={radius * 2.5}
              fillRadialGradientStartPoint={{ x: 0, y: 0 }}
              fillRadialGradientStartRadius={0}
              fillRadialGradientEndPoint={{ x: 0, y: 0 }}
              fillRadialGradientEndRadius={radius * 2.5}
              fillRadialGradientColorStops={[
                0, `${glowColor}44`,
                0.4, `${glowColor}22`,
                1, 'transparent'
              ]}
            />
            {/* Spinning energy ring */}
            <Ring
              x={position.x}
              y={position.y}
              innerRadius={radius * 1.5}
              outerRadius={radius * 1.7}
              fill={`${glowColor}33`}
              stroke={glowColor}
              strokeWidth={1}
              dash={[6, 3]}
              opacity={0.6}
            />
            {/* Main pawn body */}
            <Circle
              x={position.x}
              y={position.y}
              radius={radius * 1.3}
              fillRadialGradientStartPoint={{ x: -radius * 0.3, y: -radius * 0.3 }}
              fillRadialGradientStartRadius={0}
              fillRadialGradientEndPoint={{ x: radius * 0.3, y: radius * 0.3 }}
              fillRadialGradientEndRadius={radius * 1.5}
              fillRadialGradientColorStops={[
                0, '#ffffff',
                0.3, colorHex,
                0.8, colorHex,
                1, `${colorHex}88`
              ]}
              stroke={glowColor}
              strokeWidth={2.5}
              shadowColor={colorHex}
              shadowBlur={15}
              shadowOpacity={0.8}
            />
            {/* Victory star indicator */}
            <Star
              x={position.x}
              y={position.y}
              numPoints={5}
              innerRadius={radius * 0.25}
              outerRadius={radius * 0.5}
              fill="#ffffff"
              stroke={glowColor}
              strokeWidth={1}
              opacity={0.9}
              shadowColor="#ffffff"
              shadowBlur={5}
              shadowOpacity={0.5}
            />
          </Group>
        );
      } else {
        // Futuristic portal-style empty slot
        return (
          <Group key={`goal-slot-${color}-${index}`}>
            {/* Portal glow */}
            <Circle
              x={position.x}
              y={position.y}
              radius={radius * 1.6}
              fillRadialGradientStartPoint={{ x: 0, y: 0 }}
              fillRadialGradientStartRadius={0}
              fillRadialGradientEndPoint={{ x: 0, y: 0 }}
              fillRadialGradientEndRadius={radius * 1.6}
              fillRadialGradientColorStops={[
                0, `${glowColor}15`,
                0.6, `${glowColor}08`,
                1, 'transparent'
              ]}
            />
            {/* Portal ring */}
            <Ring
              x={position.x}
              y={position.y}
              innerRadius={radius * 0.6}
              outerRadius={radius}
              fill={`${colorHex}08`}
              stroke={glowColor}
              strokeWidth={1.5}
              dash={[5, 4]}
              opacity={0.5}
            />
            {/* Center beacon */}
            <Circle
              x={position.x}
              y={position.y}
              radius={radius * 0.25}
              fill={glowColor}
              opacity={0.3}
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
