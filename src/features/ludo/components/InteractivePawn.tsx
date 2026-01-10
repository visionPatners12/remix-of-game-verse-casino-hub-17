import React from 'react';
import { Circle, Group, Ring } from 'react-konva';
import { LUDO_COLORS, NEON_GLOW } from '../model/constants';
import type { Color } from '../model/ludoModel';

interface InteractivePawnProps {
  x: number;
  y: number;
  color: Color;
  position?: number;
  isClickable?: boolean;
  isSelected?: boolean;
  isHovered?: boolean;
  isPressed?: boolean;
  isStacked?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onTouchStart?: () => void;
  onTouchEnd?: () => void;
  cellSize: number;
}

// Elegant soft style configuration
const ELEGANT_STYLES = {
  ACCENT_COLORS: {
    R: NEON_GLOW.RED,
    G: NEON_GLOW.GREEN, 
    Y: NEON_GLOW.YELLOW,
    B: NEON_GLOW.BLUE,
  },
  HIGHLIGHT_COLORS: {
    R: '#F5A5A5',
    G: '#A5D4B5',
    Y: '#F5E0A5',
    B: '#A5C5E5',
  },
  CORE_HIGHLIGHT: '#ffffff',
} as const;

const COLOR_MAP = {
  R: LUDO_COLORS.RED,
  G: LUDO_COLORS.GREEN,
  Y: LUDO_COLORS.YELLOW,
  B: LUDO_COLORS.BLUE,
} as const;

export const InteractivePawn: React.FC<InteractivePawnProps> = ({
  x,
  y,
  color,
  position,
  isClickable = false,
  isSelected = false,
  isHovered = false,
  isPressed = false,
  isStacked = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onTouchStart,
  onTouchEnd,
  cellSize,
}) => {
  const stackedScale = isStacked ? 0.85 : 1;
  const pawnRadius = cellSize * 0.45 * stackedScale;
  
  const fillColor = COLOR_MAP[color];
  const accentColor = ELEGANT_STYLES.ACCENT_COLORS[color];
  const highlightColor = ELEGANT_STYLES.HIGHLIGHT_COLORS[color];
  
  // Subtle visual states
  const scale = isPressed ? 1.15 : isHovered ? 1.1 : isSelected ? 1.08 : 1;
  const strokeWidth = isSelected ? 2.5 : isClickable ? 2 : 1.5;

  return (
    <Group>
      {/* Soft selection indicator */}
      {(isClickable || isSelected) && (
        <Circle
          x={x}
          y={y}
          radius={pawnRadius * 1.6}
          fillRadialGradientStartPoint={{ x: 0, y: 0 }}
          fillRadialGradientStartRadius={0}
          fillRadialGradientEndPoint={{ x: 0, y: 0 }}
          fillRadialGradientEndRadius={pawnRadius * 1.6}
          fillRadialGradientColorStops={[
            0, `${fillColor}30`,
            0.6, `${fillColor}15`,
            1, 'transparent'
          ]}
          scaleX={scale}
          scaleY={scale}
        />
      )}

      {/* Selection ring for clickable pawns */}
      {(isSelected || (isClickable && !isStacked)) && (
        <Ring
          x={x}
          y={y}
          innerRadius={pawnRadius * 1.2}
          outerRadius={pawnRadius * 1.35}
          fill={`${accentColor}25`}
          stroke={accentColor}
          strokeWidth={1.5}
          opacity={isSelected ? 0.8 : 0.5}
          scaleX={scale}
          scaleY={scale}
        />
      )}

      {/* Soft shadow */}
      <Circle
        x={x + 1}
        y={y + 2}
        radius={pawnRadius}
        fill="rgba(0, 0, 0, 0.15)"
        scaleX={scale}
        scaleY={scale}
      />

      {/* Main pawn body */}
      <Circle
        x={x}
        y={y}
        radius={pawnRadius}
        fillRadialGradientStartPoint={{ x: -pawnRadius * 0.3, y: -pawnRadius * 0.3 }}
        fillRadialGradientStartRadius={0}
        fillRadialGradientEndPoint={{ x: pawnRadius * 0.4, y: pawnRadius * 0.4 }}
        fillRadialGradientEndRadius={pawnRadius * 1.2}
        fillRadialGradientColorStops={[
          0, highlightColor,
          0.4, fillColor,
          1, fillColor
        ]}
        stroke={accentColor}
        strokeWidth={strokeWidth}
        scaleX={scale}
        scaleY={scale}
        onClick={onClick}
        onTap={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        listening={isClickable}
      />

      {/* Top highlight */}
      <Circle
        x={x - pawnRadius * 0.25}
        y={y - pawnRadius * 0.3}
        radius={pawnRadius * 0.25}
        fill="white"
        opacity={0.6}
        scaleX={scale}
        scaleY={scale}
      />

      {/* Small secondary highlight */}
      <Circle
        x={x + pawnRadius * 0.1}
        y={y - pawnRadius * 0.15}
        radius={pawnRadius * 0.1}
        fill="white"
        opacity={0.3}
        scaleX={scale}
        scaleY={scale}
      />
    </Group>
  );
};
