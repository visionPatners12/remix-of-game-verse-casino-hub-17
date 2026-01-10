import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Rect, Line, Circle, Group } from 'react-konva';
import { PawnLayer } from './PawnLayer';
import { PrisonLayer } from './PrisonLayer';
import { GoalLayer } from './GoalLayer';
import type { Color, Positions } from '../model/ludoModel';
import type { AnimatingPawn } from '../hooks/usePawnAnimation';
import { 
  DEFAULT_PROPS, 
  HOME_AREAS, 
  WHITE_SQUARES, 
  LUDO_COLORS,
  NEON_GLOW,
  TINTED_COLORS,
  BOARD_COLORS
} from '../model/constants';
import { 
  cellRect, 
  generateGridLines
} from '../model/utils';
import '../styles/ludo-futuristic.css';

interface Player {
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
}

interface BoardKonvaProps {
  cellSize?: number;
  padding?: number;
  showHeaders?: boolean;
  onCellHover?: (label: string) => void;
  players?: Player[];
  gamePositions?: Positions;
  possibleMoves?: Array<{pawnIndex: number, canExit: boolean, from?: string, target?: number | null}>;
  onPawnClick?: (playerId: string, pawnIndex: number) => void;
  isMoving?: boolean;
  currentTurn?: string;
  animatingPawn?: AnimatingPawn | null;
}

// Ambient particle configuration
const AMBIENT_PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  x: Math.random(),
  y: Math.random(),
  radius: Math.random() * 1.5 + 0.5,
  opacity: Math.random() * 0.4 + 0.1,
}));

export const BoardKonva: React.FC<BoardKonvaProps> = ({
  cellSize = DEFAULT_PROPS.CELL_SIZE,
  padding = DEFAULT_PROPS.PADDING,
  showHeaders = DEFAULT_PROPS.SHOW_HEADERS,
  onCellHover,
  players = [],
  gamePositions,
  possibleMoves = [],
  onPawnClick,
  isMoving = false,
  currentTurn,
  animatingPawn,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerDimensions, setContainerDimensions] = useState({ width: 800, height: 800 });
  
  const boardWidth = cellSize * 15;
  const boardHeight = cellSize * 15;
  
  const scaleX = containerDimensions.width / boardWidth;
  const scaleY = containerDimensions.height / boardHeight;
  const scale = Math.min(scaleX, scaleY, 1);
  const scaledWidth = boardWidth * scale;
  const scaledHeight = boardHeight * scale;

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerDimensions({
          width: rect.width,
          height: rect.height
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { verticalLines, horizontalLines } = generateGridLines(cellSize, padding, false);

  // Generate corner glow positions
  const cornerGlows = [
    { x: cellSize * 3, y: cellSize * 3, color: NEON_GLOW.RED },
    { x: cellSize * 12, y: cellSize * 3, color: NEON_GLOW.GREEN },
    { x: cellSize * 12, y: cellSize * 12, color: NEON_GLOW.YELLOW },
    { x: cellSize * 3, y: cellSize * 12, color: NEON_GLOW.BLUE },
  ];

  return (
    <div 
      ref={containerRef} 
      className="ludo-board-futuristic w-full h-full flex justify-center items-center p-0 m-0"
      style={{ 
        minHeight: '100%', 
        maxHeight: '100vh',
        overflow: 'hidden'
      }}
    >
      <Stage 
        width={scaledWidth} 
        height={scaledHeight}
        scaleX={scale}
        scaleY={scale}
      >
        <Layer>
          {/* Deep space background */}
          <Rect
            x={0}
            y={0}
            width={boardWidth}
            height={boardHeight}
            fillLinearGradientStartPoint={{ x: 0, y: 0 }}
            fillLinearGradientEndPoint={{ x: boardWidth, y: boardHeight }}
            fillLinearGradientColorStops={[
              0, BOARD_COLORS.BACKGROUND,
              0.3, BOARD_COLORS.NEBULA_1,
              0.5, BOARD_COLORS.BACKGROUND,
              0.7, BOARD_COLORS.NEBULA_2,
              1, BOARD_COLORS.BACKGROUND
            ]}
          />

          {/* Radial vignette overlay */}
          <Circle
            x={boardWidth / 2}
            y={boardHeight / 2}
            radius={boardWidth * 0.8}
            fillRadialGradientStartPoint={{ x: 0, y: 0 }}
            fillRadialGradientStartRadius={0}
            fillRadialGradientEndPoint={{ x: 0, y: 0 }}
            fillRadialGradientEndRadius={boardWidth * 0.8}
            fillRadialGradientColorStops={[
              0, 'transparent',
              0.6, 'transparent',
              1, 'rgba(0, 0, 0, 0.4)'
            ]}
          />

          {/* Corner glow effects for each home area */}
          {cornerGlows.map((glow, index) => (
            <Circle
              key={`corner-glow-${index}`}
              x={glow.x}
              y={glow.y}
              radius={cellSize * 4}
              fillRadialGradientStartPoint={{ x: 0, y: 0 }}
              fillRadialGradientStartRadius={0}
              fillRadialGradientEndPoint={{ x: 0, y: 0 }}
              fillRadialGradientEndRadius={cellSize * 4}
              fillRadialGradientColorStops={[
                0, `${glow.color}33`,
                0.5, `${glow.color}11`,
                1, 'transparent'
              ]}
            />
          ))}

          {/* Ambient floating particles */}
          {AMBIENT_PARTICLES.map((particle, index) => (
            <Circle
              key={`particle-${index}`}
              x={particle.x * boardWidth}
              y={particle.y * boardHeight}
              radius={particle.radius}
              fill="#00ffff"
              opacity={particle.opacity}
            />
          ))}

          {/* Neon Grid Lines with glow effect */}
          {verticalLines.map((line, index) => (
            <Group key={`v-line-group-${index}`}>
              {/* Glow layer */}
              <Line
                points={line.points}
                stroke={BOARD_COLORS.GRID_GLOW}
                strokeWidth={3}
                opacity={0.1}
              />
              {/* Main line */}
              <Line
                points={line.points}
                stroke={BOARD_COLORS.GRID_LINE}
                strokeWidth={1}
                opacity={0.6}
              />
            </Group>
          ))}
          {horizontalLines.map((line, index) => (
            <Group key={`h-line-group-${index}`}>
              {/* Glow layer */}
              <Line
                points={line.points}
                stroke={BOARD_COLORS.GRID_GLOW}
                strokeWidth={3}
                opacity={0.1}
              />
              {/* Main line */}
              <Line
                points={line.points}
                stroke={BOARD_COLORS.GRID_LINE}
                strokeWidth={1}
                opacity={0.6}
              />
            </Group>
          ))}

          {/* Home Areas with neon borders and tinted backgrounds */}
          {Object.entries(HOME_AREAS).map(([colorName, area]) => {
            const tintColor = TINTED_COLORS[colorName as keyof typeof TINTED_COLORS];
            const glowColor = NEON_GLOW[colorName as keyof typeof NEON_GLOW];
            const rect = cellRect(area.rows, area.cols, cellSize, padding, false);
            return (
              <Group key={`home-${colorName}`}>
                {/* Outer glow */}
                <Rect
                  x={rect.x - 4}
                  y={rect.y - 4}
                  width={rect.width + 8}
                  height={rect.height + 8}
                  stroke={glowColor}
                  strokeWidth={2}
                  opacity={0.3}
                  cornerRadius={4}
                />
                {/* Tinted background */}
                <Rect
                  x={rect.x}
                  y={rect.y}
                  width={rect.width}
                  height={rect.height}
                  fill={tintColor}
                  stroke={glowColor}
                  strokeWidth={1.5}
                  opacity={0.9}
                  cornerRadius={2}
                />
              </Group>
            );
          })}

          {/* White Squares with holographic effect */}
          {Object.entries(WHITE_SQUARES).map(([colorName, square]) => {
            const rect = cellRect(square.rows, square.cols, cellSize, padding, false);
            const glowColor = NEON_GLOW[colorName as keyof typeof NEON_GLOW];
            return (
              <Group key={`white-${colorName}`}>
                {/* Holographic glow */}
                <Rect
                  x={rect.x - 2}
                  y={rect.y - 2}
                  width={rect.width + 4}
                  height={rect.height + 4}
                  stroke={glowColor}
                  strokeWidth={1}
                  opacity={0.4}
                  cornerRadius={2}
                />
                {/* Main white square */}
                <Rect
                  x={rect.x}
                  y={rect.y}
                  width={rect.width}
                  height={rect.height}
                  fillLinearGradientStartPoint={{ x: 0, y: 0 }}
                  fillLinearGradientEndPoint={{ x: rect.width, y: rect.height }}
                  fillLinearGradientColorStops={[
                    0, '#ffffff',
                    0.5, '#f8f8f8',
                    1, '#e8e8e8'
                  ]}
                  stroke={LUDO_COLORS.BLACK}
                  strokeWidth={1.5}
                  cornerRadius={1}
                  shadowColor={glowColor}
                  shadowBlur={8}
                  shadowOpacity={0.3}
                />
              </Group>
            );
          })}

          {/* Prison Layer */}
          <PrisonLayer
            cellSize={cellSize}
            padding={padding}
            showHeaders={false}
            gamePositions={gamePositions}
            possibleMoves={possibleMoves}
            onPawnClick={onPawnClick}
            currentTurn={currentTurn}
            players={players}
          />

          {/* Goal Layer - Finished pawns */}
          {gamePositions && (
            <GoalLayer
              cellSize={cellSize}
              padding={padding}
              showHeaders={false}
              gamePositions={gamePositions}
            />
          )}

          {/* Pawns Layer */}
          <PawnLayer 
            cellSize={cellSize} 
            padding={padding}
            showHeaders={false}
            players={players}
            gamePositions={gamePositions}
            possibleMoves={possibleMoves}
            onPawnClick={onPawnClick}
            isMoving={isMoving}
            currentTurn={currentTurn}
            animatingPawn={animatingPawn}
          />

          {/* Center board decoration */}
          <Group>
            <Circle
              x={boardWidth / 2}
              y={boardHeight / 2}
              radius={cellSize * 1.2}
              fillRadialGradientStartPoint={{ x: 0, y: 0 }}
              fillRadialGradientStartRadius={0}
              fillRadialGradientEndPoint={{ x: 0, y: 0 }}
              fillRadialGradientEndRadius={cellSize * 1.2}
              fillRadialGradientColorStops={[
                0, 'rgba(0, 255, 255, 0.15)',
                0.7, 'rgba(0, 255, 255, 0.05)',
                1, 'transparent'
              ]}
            />
          </Group>
        </Layer>
      </Stage>
    </div>
  );
};
