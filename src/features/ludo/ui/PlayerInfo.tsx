import React from 'react';
import { Group, Rect, Text, Circle } from 'react-konva';
import { LUDO_COLORS } from '../model/constants';
import { center } from '../model/utils';

interface PlayerInfoProps {
  cellLabel: string;
  cellSize: number;
  padding: number;
  showHeaders?: boolean;
  player?: {
    id: string;
    user_id: string;
    color: string;
    position: number;
    is_ready: boolean;
    is_connected: boolean;
    turn_order?: number;
    username?: string;
    first_name?: string;
    last_name?: string;
  };
  isCurrentTurn: boolean;
  isEmpty?: boolean;
}

export const PlayerInfo: React.FC<PlayerInfoProps> = ({
  cellLabel,
  cellSize,
  padding,
  showHeaders = true,
  player,
  isCurrentTurn,
  isEmpty = false,
}) => {
  const pos = center(cellLabel, cellSize, padding, showHeaders);
  const radius = (cellSize * 0.9) / 2; // Use 90% of cell size for diameter

  if (isEmpty || !player) {
    return (
      <Group x={pos.x} y={pos.y}>
        {/* Empty slot circle */}
        <Circle
          x={0}
          y={0}
          radius={radius}
          fill="rgba(255, 255, 255, 0.05)"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={1}
        />
        <Text
          x={0}
          y={0}
          text="?"
          fontSize={radius * 0.8}
          fill="#666666"
          align="center"
          verticalAlign="middle"
        />
      </Group>
    );
  }

  const playerColor = LUDO_COLORS[player.color as keyof typeof LUDO_COLORS] || LUDO_COLORS.WHITE;
  const displayName = player.username || player.first_name || `P${player.turn_order || 1}`;
  const initials = displayName.substring(0, 2).toUpperCase();
  
  return (
    <Group x={pos.x} y={pos.y}>
      {/* Main avatar circle */}
      <Circle
        x={0}
        y={0}
        radius={radius}
        fill={playerColor}
      />
      
      {/* Turn indicator circle */}
      {isCurrentTurn && (
        <Circle
          x={0}
          y={0}
          radius={radius + 3}
          stroke={playerColor}
          strokeWidth={3}
          fill="transparent"
        />
      )}

      {/* Crown for turn_order 1 */}
      {player.turn_order === 1 && (
        <Text
          x={radius * 0.6}
          y={-radius * 0.6}
          text="👑"
          fontSize={radius * 0.4}
          align="center"
        />
      )}

      {/* Player initials - centered */}
      <Text
        x={0}
        y={0}
        text={initials}
        fontSize={radius * 0.6}
        fill={LUDO_COLORS.WHITE}
        fontStyle="bold"
        align="center"
        verticalAlign="middle"
      />

      {/* Status indicator - small circle at bottom */}
      <Circle
        x={radius * 0.6}
        y={radius * 0.6}
        radius={radius * 0.2}
        fill={isCurrentTurn ? "#fbbf24" : (player.is_ready ? "#4ade80" : "#f59e0b")}
        stroke={LUDO_COLORS.WHITE}
        strokeWidth={1}
      />
    </Group>
  );
};