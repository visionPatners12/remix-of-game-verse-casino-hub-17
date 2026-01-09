export interface Player {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  color: string;
  isActive?: boolean;
}

export interface GameConfig {
  id: string;
  name: string;
  minPlayers: number;
  maxPlayers: number;
  description: string;
}

export interface GameState {
  isStarted: boolean;
  isFinished: boolean;
  currentPlayerIndex: number;
  players: Player[];
  winner: Player | null;
}