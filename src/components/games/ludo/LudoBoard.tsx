import React from 'react';

type Player = 'red' | 'blue' | 'green' | 'yellow';
type PiecePosition = {
  playerId: Player;
  pieceId: number;
  position: number;
};

interface LudoBoardProps {
  pieces: PiecePosition[];
  onPieceClick: (playerId: Player, pieceId: number) => void;
}

export const LudoBoard: React.FC<LudoBoardProps> = ({ pieces, onPieceClick }) => {
  // Board dimensions - authentic Ludo proportions
  const boardSize = 600;
  const cellSize = boardSize / 15; // 15x15 grid for authentic cross shape
  
  // Traditional Ludo colors - more vivid and authentic
  const playerColors = {
    red: '#DC2626',
    blue: '#2563EB', 
    green: '#16A34A',
    yellow: '#CA8A04'
  };
  
  const playerLightColors = {
    red: '#FEE2E2',
    blue: '#DBEAFE',
    green: '#DCFCE7', 
    yellow: '#FEF3C7'
  };
  
  // Get pieces at position
  const getPiecesAtPosition = (position: number, homeArea?: Player) => {
    if (homeArea) {
      return pieces.filter(p => p.playerId === homeArea && p.position === -1);
    }
    return pieces.filter(p => p.position === position);
  };

  // Render a game piece with enhanced visuals
  const renderPiece = (piece: PiecePosition, index: number = 0) => {
    const offset = index * 4; // Smaller offset for better visibility
    
    return (
      <g key={`${piece.playerId}-${piece.pieceId}`}>
        {/* Shadow */}
        <circle
          cx={cellSize/2 + offset + 1}
          cy={cellSize/2 + offset + 1}
          r={cellSize/3.5}
          fill="rgba(0,0,0,0.2)"
        />
        {/* Main piece */}
        <circle
          cx={cellSize/2 + offset}
          cy={cellSize/2 + offset}
          r={cellSize/3.5}
          fill={playerColors[piece.playerId]}
          stroke="white"
          strokeWidth="2"
          className="cursor-pointer hover:scale-110 transition-transform duration-200"
          onClick={() => onPieceClick(piece.playerId, piece.pieceId)}
        />
        {/* Inner highlight */}
        <circle
          cx={cellSize/2 + offset - 2}
          cy={cellSize/2 + offset - 2}
          r={cellSize/6}
          fill="rgba(255,255,255,0.4)"
          pointerEvents="none"
        />
      </g>
    );
  };

  // Render authentic home area (6x6 squares)
  const renderHomeArea = (player: Player, x: number, y: number) => {
    const homePieces = getPiecesAtPosition(-1, player);
    
    return (
      <g key={`home-${player}`}>
        {/* Home area background with gradient */}
        <defs>
          <linearGradient id={`gradient-${player}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={playerLightColors[player]} />
            <stop offset="100%" stopColor="white" />
          </linearGradient>
        </defs>
        
        <rect
          x={x}
          y={y}
          width={cellSize * 6}
          height={cellSize * 6}
          fill={`url(#gradient-${player})`}
          stroke={playerColors[player]}
          strokeWidth="3"
          rx="8"
        />
        
        {/* Inner decorative border */}
        <rect
          x={x + 8}
          y={y + 8}
          width={cellSize * 6 - 16}
          height={cellSize * 6 - 16}
          fill="none"
          stroke={playerColors[player]}
          strokeWidth="1"
          strokeDasharray="4,4"
          rx="4"
        />
        
        {/* Home squares for pieces - traditional 2x2 layout */}
        {[0, 1, 2, 3].map((i) => {
          const row = Math.floor(i / 2);
          const col = i % 2;
          const squareX = x + cellSize * 1.5 + col * cellSize * 1.5;
          const squareY = y + cellSize * 1.5 + row * cellSize * 1.5;
          
          return (
            <g key={i}>
              <rect
                x={squareX}
                y={squareY}
                width={cellSize * 1.5}
                height={cellSize * 1.5}
                fill="white"
                stroke={playerColors[player]}
                strokeWidth="2"
                rx="4"
              />
              {/* Small circle in center */}
              <circle
                cx={squareX + cellSize * 0.75}
                cy={squareY + cellSize * 0.75}
                r="4"
                fill={playerColors[player]}
                opacity="0.3"
              />
            </g>
          );
        })}
        
        {/* Render pieces in home */}
        {homePieces.map((piece, index) => {
          const row = Math.floor(index / 2);
          const col = index % 2;
          const pieceX = x + cellSize * 2.25 + col * cellSize * 1.5;
          const pieceY = y + cellSize * 2.25 + row * cellSize * 1.5;
          
          return (
            <g key={`home-piece-${piece.pieceId}`} transform={`translate(${pieceX}, ${pieceY})`}>
              {renderPiece(piece)}
            </g>
          );
        })}
      </g>
    );
  };

  // Render main track cell with enhanced styling
  const renderTrackCell = (position: number, x: number, y: number, isStart?: Player, isSafe?: boolean, isArrow?: boolean) => {
    const cellPieces = getPiecesAtPosition(position);
    
    let fillColor = 'white';
    let strokeColor = '#D1D5DB';
    
    if (isStart) {
      fillColor = playerColors[isStart];
    } else if (isSafe) {
      fillColor = '#F3F4F6';
    }
    
    return (
      <g key={`track-${position}`}>
        <rect
          x={x}
          y={y}
          width={cellSize}
          height={cellSize}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth="1.5"
        />
        
        {/* Start position indicator - enhanced */}
        {isStart && (
          <g>
            <circle
              cx={x + cellSize/2}
              cy={y + cellSize/2}
              r={cellSize/3}
              fill="white"
              opacity="0.8"
            />
            <polygon
              points={`${x + cellSize/2},${y + cellSize/4} ${x + cellSize*0.75},${y + cellSize*0.75} ${x + cellSize/4},${y + cellSize*0.75}`}
              fill={playerColors[isStart]}
            />
          </g>
        )}
        
        {/* Safe square indicator - star shape */}
        {isSafe && !isStart && (
          <g>
            <polygon
              points={`${x + cellSize/2},${y + cellSize/4} ${x + cellSize*0.6},${y + cellSize*0.45} ${x + cellSize*0.75},${y + cellSize/2} ${x + cellSize*0.6},${y + cellSize*0.55} ${x + cellSize/2},${y + cellSize*0.75} ${x + cellSize*0.4},${y + cellSize*0.55} ${x + cellSize/4},${y + cellSize/2} ${x + cellSize*0.4},${y + cellSize*0.45}`}
              fill="#9CA3AF"
            />
          </g>
        )}
        
        {/* Render pieces */}
        {cellPieces.map((piece, index) => (
          <g key={`track-piece-${piece.playerId}-${piece.pieceId}`} 
             transform={`translate(${x}, ${y})`}>
            {renderPiece(piece, index)}
          </g>
        ))}
      </g>
    );
  };

  // Generate CORRECT Ludo track positions (52 squares in continuous clockwise circuit)
  const generateTrackPositions = () => {
    const positions = [];
    
    // RED START: Bottom row going right (positions 0-5)
    for (let i = 0; i < 6; i++) {
      positions.push({ x: cellSize * (6 + i), y: cellSize * 8 });
    }
    
    // Right side going up (positions 6-12)
    for (let i = 0; i < 7; i++) {
      positions.push({ x: cellSize * 12, y: cellSize * (7 - i) });
    }
    
    // BLUE START: Top row going left (positions 13-18)
    for (let i = 0; i < 6; i++) {
      positions.push({ x: cellSize * (11 - i), y: cellSize * 0 });
    }
    
    // Continue top row left (positions 19-25)
    for (let i = 0; i < 7; i++) {
      positions.push({ x: cellSize * (5 - i), y: cellSize * 0 });
    }
    
    // GREEN START: Left side going down (positions 26-31)
    for (let i = 0; i < 6; i++) {
      positions.push({ x: cellSize * 0, y: cellSize * (1 + i) });
    }
    
    // Continue left side down (positions 32-38)
    for (let i = 0; i < 7; i++) {
      positions.push({ x: cellSize * 0, y: cellSize * (7 + i) });
    }
    
    // YELLOW START: Bottom row going right (positions 39-44)
    for (let i = 0; i < 6; i++) {
      positions.push({ x: cellSize * (1 + i), y: cellSize * 14 });
    }
    
    // Continue bottom row right (positions 45-51)
    for (let i = 0; i < 7; i++) {
      positions.push({ x: cellSize * (7 + i), y: cellSize * 14 });
    }
    
    return positions;
  };

  const trackPositions = generateTrackPositions();
  
  // CORRECT start positions for each player (where they begin the main circuit)
  const startPositions = {
    red: 0,      // Position 0 - Red starts here
    blue: 13,    // Position 13 - Blue starts here  
    green: 26,   // Position 26 - Green starts here
    yellow: 39   // Position 39 - Yellow starts here
  };
  
  // Safe positions: starting positions + 8 positions ahead for each player
  const safePositions = [0, 8, 13, 21, 26, 34, 39, 47];

  // Final paths (colored columns leading to center)
  const renderFinalPaths = () => {
    const paths = {
      red: { start: [7, 7], direction: [0, -1], color: playerColors.red },
      blue: { start: [8, 7], direction: [1, 0], color: playerColors.blue },
      green: { start: [8, 8], direction: [0, 1], color: playerColors.green },
      yellow: { start: [7, 8], direction: [-1, 0], color: playerColors.yellow }
    };

    return Object.entries(paths).map(([player, path]) => (
      <g key={`final-${player}`}>
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const x = cellSize * (path.start[0] + path.direction[0] * i);
          const y = cellSize * (path.start[1] + path.direction[1] * i);
          const position = 53 + (Object.keys(paths).indexOf(player) * 6) + i;
          
          return (
            <g key={`final-${player}-${i}`}>
              <rect
                x={x}
                y={y}
                width={cellSize}
                height={cellSize}
                fill={path.color}
                stroke="white"
                strokeWidth="1.5"
                opacity="0.8"
              />
              {/* Triangle pointing to center */}
              {i === 5 && (
                <polygon
                  points={`${x + cellSize/2},${y + cellSize/4} ${x + cellSize*0.75},${y + cellSize*0.75} ${x + cellSize/4},${y + cellSize*0.75}`}
                  fill="white"
                />
              )}
              
              {/* Render pieces */}
              {getPiecesAtPosition(position).map((piece, index) => (
                <g key={`final-piece-${piece.playerId}-${piece.pieceId}`} 
                   transform={`translate(${x}, ${y})`}>
                  {renderPiece(piece, index)}
                </g>
              ))}
            </g>
          );
        })}
      </g>
    ));
  };

  return (
    <div className="flex justify-center items-center p-4">
      <svg 
        width={boardSize} 
        height={boardSize} 
        className="border-4 border-gray-800 rounded-xl bg-gradient-to-br from-amber-50 to-orange-100 shadow-2xl"
        style={{
          filter: 'drop-shadow(0 10px 25px rgba(0,0,0,0.3))'
        }}
      >
        {/* Background pattern */}
        <defs>
          <pattern id="boardPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect width="20" height="20" fill="#FEF7ED" />
            <circle cx="10" cy="10" r="1" fill="#D97706" opacity="0.1" />
          </pattern>
        </defs>
        
        <rect width="100%" height="100%" fill="url(#boardPattern)" />
        
        {/* Home areas in correct positions */}
        {renderHomeArea('red', 0, cellSize * 9)}      {/* Bottom left */}
        {renderHomeArea('blue', cellSize * 9, 0)}     {/* Top right */}
        {renderHomeArea('green', 0, 0)}               {/* Top left */}
        {renderHomeArea('yellow', cellSize * 9, cellSize * 9)} {/* Bottom right */}
        
        {/* Main cross-shaped track */}
        {trackPositions.map((pos, index) => {
          const position = index; // Position is now 0-based (0-51)
          const isStart = Object.values(startPositions).includes(position) ? 
            Object.keys(startPositions).find(key => startPositions[key as Player] === position) as Player : 
            undefined;
          const isSafe = safePositions.includes(position);
          
          return renderTrackCell(position, pos.x, pos.y, isStart, isSafe);
        })}
        
        {/* Final colored paths to center */}
        {renderFinalPaths()}
        
        {/* Central victory area */}
        <g>
          {/* Golden center background */}
          <rect
            x={cellSize * 7}
            y={cellSize * 7}
            width={cellSize * 2}
            height={cellSize * 2}
            fill="url(#centerGradient)"
            stroke="#B45309"
            strokeWidth="3"
            rx="8"
          />
          
          <defs>
            <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FCD34D" />
              <stop offset="100%" stopColor="#F59E0B" />
            </radialGradient>
          </defs>
          
          {/* Victory symbol - crown */}
          <polygon
            points={`${cellSize * 7.5},${cellSize * 7.2} ${cellSize * 7.8},${cellSize * 7.5} ${cellSize * 8},${cellSize * 7.2} ${cellSize * 8.2},${cellSize * 7.5} ${cellSize * 8.5},${cellSize * 7.2} ${cellSize * 8.5},${cellSize * 8.8} ${cellSize * 7.5},${cellSize * 8.8}`}
            fill="#FFFFFF"
            stroke="#B45309"
            strokeWidth="1"
          />
          
          {/* Center pieces */}
          {getPiecesAtPosition(100).map((piece, index) => (
            <g key={`center-piece-${piece.playerId}-${piece.pieceId}`} 
               transform={`translate(${cellSize * 8}, ${cellSize * 8})`}>
              {renderPiece(piece, index)}
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
};