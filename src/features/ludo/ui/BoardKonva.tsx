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

// Subtle decorative spots (reduced from particles)
const DECORATIVE_SPOTS = Array.from({ length: 8 }, (_, i) => ({
  x: 0.15 + (i % 4) * 0.25,
  y: 0.15 + Math.floor(i / 4) * 0.7,
  radius: 1.5,
  opacity: 0.05,
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

  // Subtle corner accents
  const cornerAccents = [
    { x: cellSize * 3, y: cellSize * 3, color: LUDO_COLORS.RED },
    { x: cellSize * 12, y: cellSize * 3, color: LUDO_COLORS.GREEN },
    { x: cellSize * 12, y: cellSize * 12, color: LUDO_COLORS.YELLOW },
    { x: cellSize * 3, y: cellSize * 12, color: LUDO_COLORS.BLUE },
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
          {/* Warm cream background */}
          <Rect
            x={0}
            y={0}
            width={boardWidth}
            height={boardHeight}
            fill={BOARD_COLORS.BACKGROUND}
          />

          {/* Subtle gradient overlay for depth */}
          <Circle
            x={boardWidth / 2}
            y={boardHeight / 2}
            radius={boardWidth * 0.7}
            fillRadialGradientStartPoint={{ x: 0, y: 0 }}
            fillRadialGradientStartRadius={0}
            fillRadialGradientEndPoint={{ x: 0, y: 0 }}
            fillRadialGradientEndRadius={boardWidth * 0.7}
            fillRadialGradientColorStops={[
              0, 'rgba(255, 255, 255, 0.3)',
              0.5, 'transparent',
              1, 'rgba(0, 0, 0, 0.03)'
            ]}
          />

          {/* Soft corner color hints */}
          {cornerAccents.map((accent, index) => (
            <Circle
              key={`corner-accent-${index}`}
              x={accent.x}
              y={accent.y}
              radius={cellSize * 3}
              fillRadialGradientStartPoint={{ x: 0, y: 0 }}
              fillRadialGradientStartRadius={0}
              fillRadialGradientEndPoint={{ x: 0, y: 0 }}
              fillRadialGradientEndRadius={cellSize * 3}
              fillRadialGradientColorStops={[
                0, `${accent.color}15`,
                0.5, `${accent.color}08`,
                1, 'transparent'
              ]}
            />
          ))}

          {/* Subtle decorative spots */}
          {DECORATIVE_SPOTS.map((spot, index) => (
            <Circle
              key={`spot-${index}`}
              x={spot.x * boardWidth}
              y={spot.y * boardHeight}
              radius={spot.radius}
              fill={BOARD_COLORS.GRID_LINE}
              opacity={spot.opacity}
            />
          ))}

          {/* Clean grid lines */}
          {verticalLines.map((line, index) => (
            <Line
              key={`v-line-${index}`}
              points={line.points}
              stroke={BOARD_COLORS.GRID_LINE}
              strokeWidth={1}
              opacity={0.5}
            />
          ))}
          {horizontalLines.map((line, index) => (
            <Line
              key={`h-line-${index}`}
              points={line.points}
              stroke={BOARD_COLORS.GRID_LINE}
              strokeWidth={1}
              opacity={0.5}
            />
          ))}

          {/* Home Areas with soft borders */}
          {Object.entries(HOME_AREAS).map(([colorName, area]) => {
            const tintColor = TINTED_COLORS[colorName as keyof typeof TINTED_COLORS];
            const mainColor = LUDO_COLORS[colorName as keyof typeof LUDO_COLORS];
            const rect = cellRect(area.rows, area.cols, cellSize, padding, false);
            return (
              <Group key={`home-${colorName}`}>
                {/* Soft shadow */}
                <Rect
                  x={rect.x + 2}
                  y={rect.y + 2}
                  width={rect.width}
                  height={rect.height}
                  fill="rgba(0, 0, 0, 0.05)"
                  cornerRadius={6}
                />
                {/* Main background */}
                <Rect
                  x={rect.x}
                  y={rect.y}
                  width={rect.width}
                  height={rect.height}
                  fill={tintColor}
                  stroke={mainColor}
                  strokeWidth={2}
                  opacity={0.95}
                  cornerRadius={6}
                />
              </Group>
            );
          })}

          {/* White Squares with elegant styling */}
          {Object.entries(WHITE_SQUARES).map(([colorName, square]) => {
            const rect = cellRect(square.rows, square.cols, cellSize, padding, false);
            const mainColor = LUDO_COLORS[colorName as keyof typeof LUDO_COLORS];
            return (
              <Group key={`white-${colorName}`}>
                {/* Soft shadow */}
                <Rect
                  x={rect.x + 1}
                  y={rect.y + 1}
                  width={rect.width}
                  height={rect.height}
                  fill="rgba(0, 0, 0, 0.06)"
                  cornerRadius={4}
                />
                {/* Main white square */}
                <Rect
                  x={rect.x}
                  y={rect.y}
                  width={rect.width}
                  height={rect.height}
                  fill={LUDO_COLORS.WHITE}
                  stroke={mainColor}
                  strokeWidth={1.5}
                  cornerRadius={4}
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
