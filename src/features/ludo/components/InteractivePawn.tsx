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

// Futuristic neon style configuration
const FUTURISTIC_STYLES = {
  GLOW_COLORS: {
    R: NEON_GLOW.RED,
    G: NEON_GLOW.GREEN, 
    Y: NEON_GLOW.YELLOW,
    B: NEON_GLOW.BLUE,
  },
  HOLOGRAM_COLORS: {
    R: '#ff99aa',
    G: '#99ffcc',
    Y: '#ffff99',
    B: '#99eeff',
  },
  CORE_GLOW: '#ffffff',
  ENERGY_RING: 'rgba(255, 255, 255, 0.3)',
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
  const glowColor = FUTURISTIC_STYLES.GLOW_COLORS[color];
  const hologramColor = FUTURISTIC_STYLES.HOLOGRAM_COLORS[color];
  
  // Enhanced visual states
  const scale = isPressed ? 1.25 : isHovered ? 1.18 : isSelected ? 1.12 : 1;
  const glowIntensity = isPressed ? 0.9 : isSelected ? 0.7 : isHovered ? 0.5 : isClickable ? 0.3 : 0.15;
  const strokeWidth = isSelected ? 3 : isClickable ? 2.5 : 2;

  return (
    <Group>
      {/* Outer energy field - largest glow layer */}
      {(isClickable || isSelected || isHovered || isPressed) && (
        <Circle
          x={x}
          y={y}
          radius={pawnRadius * 2.2}
          fillRadialGradientStartPoint={{ x: 0, y: 0 }}
          fillRadialGradientStartRadius={0}
          fillRadialGradientEndPoint={{ x: 0, y: 0 }}
          fillRadialGradientEndRadius={pawnRadius * 2.2}
          fillRadialGradientColorStops={[
            0, `${glowColor}`,
            0.3, `${glowColor}88`,
            0.6, `${glowColor}44`,
            1, 'transparent'
          ]}
          opacity={glowIntensity * 0.5}
          scaleX={scale}
          scaleY={scale}
        />
      )}

      {/* Rotating energy ring for selected/clickable */}
      {(isSelected || (isClickable && !isStacked)) && (
        <Ring
          x={x}
          y={y}
          innerRadius={pawnRadius * 1.4}
          outerRadius={pawnRadius * 1.6}
          fill={`${glowColor}44`}
          stroke={glowColor}
          strokeWidth={1}
          opacity={isSelected ? 0.8 : 0.4}
          dash={[8, 4]}
          scaleX={scale}
          scaleY={scale}
        />
      )}

      {/* Middle glow layer */}
      <Circle
        x={x}
        y={y}
        radius={pawnRadius * 1.5}
        fillRadialGradientStartPoint={{ x: 0, y: 0 }}
        fillRadialGradientStartRadius={0}
        fillRadialGradientEndPoint={{ x: 0, y: 0 }}
        fillRadialGradientEndRadius={pawnRadius * 1.5}
        fillRadialGradientColorStops={[
          0, fillColor,
          0.5, `${fillColor}88`,
          1, 'transparent'
        ]}
        opacity={glowIntensity}
        scaleX={scale}
        scaleY={scale}
      />

      {/* Main pawn body with gradient */}
      <Circle
        x={x}
        y={y}
        radius={pawnRadius}
        fillRadialGradientStartPoint={{ x: -pawnRadius * 0.3, y: -pawnRadius * 0.3 }}
        fillRadialGradientStartRadius={0}
        fillRadialGradientEndPoint={{ x: pawnRadius * 0.3, y: pawnRadius * 0.3 }}
        fillRadialGradientEndRadius={pawnRadius * 1.5}
        fillRadialGradientColorStops={[
          0, hologramColor,
          0.3, fillColor,
          0.8, fillColor,
          1, `${fillColor}88`
        ]}
        stroke={glowColor}
        strokeWidth={strokeWidth}
        scaleX={scale}
        scaleY={scale}
        shadowColor={fillColor}
        shadowBlur={isClickable ? 15 : 8}
        shadowOpacity={0.8}
        onClick={onClick}
        onTap={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        listening={isClickable}
      />

      {/* Inner core glow */}
      <Circle
        x={x}
        y={y}
        radius={pawnRadius * 0.6}
        fillRadialGradientStartPoint={{ x: 0, y: 0 }}
        fillRadialGradientStartRadius={0}
        fillRadialGradientEndPoint={{ x: 0, y: 0 }}
        fillRadialGradientEndRadius={pawnRadius * 0.6}
        fillRadialGradientColorStops={[
          0, FUTURISTIC_STYLES.CORE_GLOW,
          0.4, `${hologramColor}cc`,
          1, 'transparent'
        ]}
        opacity={0.6}
        scaleX={scale}
        scaleY={scale}
      />
      
      {/* Top highlight reflection */}
      <Circle
        x={x - pawnRadius * 0.25}
        y={y - pawnRadius * 0.3}
        radius={pawnRadius * 0.2}
        fill="white"
        opacity={0.7}
        scaleX={scale}
        scaleY={scale}
      />

      {/* Secondary highlight */}
      <Circle
        x={x + pawnRadius * 0.15}
        y={y - pawnRadius * 0.15}
        radius={pawnRadius * 0.1}
        fill="white"
        opacity={0.4}
        scaleX={scale}
        scaleY={scale}
      />
      
      {/* Animated pulse ring for selected */}
      {isSelected && (
        <>
          <Ring
            x={x}
            y={y}
            innerRadius={pawnRadius * 1.8}
            outerRadius={pawnRadius * 1.9}
            stroke={glowColor}
            strokeWidth={2}
            opacity={0.6}
            dash={[12, 6]}
            scaleX={scale}
            scaleY={scale}
          />
          <Circle
            x={x}
            y={y}
            radius={pawnRadius * 2.2}
            stroke={glowColor}
            strokeWidth={1}
            opacity={0.3}
            scaleX={scale}
            scaleY={scale}
          />
        </>
      )}

      {/* Particle trail effect indicators for clickable pawns */}
      {isClickable && !isStacked && (
        <>
          <Circle
            x={x - pawnRadius * 0.8}
            y={y + pawnRadius * 0.6}
            radius={2}
            fill={glowColor}
            opacity={0.6}
          />
          <Circle
            x={x + pawnRadius * 0.7}
            y={y + pawnRadius * 0.5}
            radius={1.5}
            fill={glowColor}
            opacity={0.4}
          />
          <Circle
            x={x}
            y={y + pawnRadius}
            radius={1}
            fill={glowColor}
            opacity={0.3}
          />
        </>
      )}
    </Group>
  );
};
