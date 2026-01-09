import { useCallback, useRef } from 'react';

export const useGameSounds = () => {
  const victoryAudioRef = useRef<HTMLAudioElement | null>(null);
  const gameOverAudioRef = useRef<HTMLAudioElement | null>(null);
  const diceRollAudioRef = useRef<HTMLAudioElement | null>(null);
  const pieceMoveAudioRef = useRef<HTMLAudioElement | null>(null);

  const playVictorySound = useCallback(() => {
    try {
      if (!victoryAudioRef.current) {
        victoryAudioRef.current = new Audio('/sounds/victory.mp3');
        victoryAudioRef.current.volume = 0.6;
      }
      victoryAudioRef.current.currentTime = 0;
      victoryAudioRef.current.play().catch(() => {
        // Ignore autoplay errors
      });
    } catch {
      // Audio not supported
    }
  }, []);

  const playGameOverSound = useCallback(() => {
    try {
      if (!gameOverAudioRef.current) {
        gameOverAudioRef.current = new Audio('/sounds/game-over.mp3');
        gameOverAudioRef.current.volume = 0.5;
      }
      gameOverAudioRef.current.currentTime = 0;
      gameOverAudioRef.current.play().catch(() => {
        // Ignore autoplay errors
      });
    } catch {
      // Audio not supported
    }
  }, []);

  const playDiceRollSound = useCallback(() => {
    try {
      if (!diceRollAudioRef.current) {
        diceRollAudioRef.current = new Audio('/sounds/dice-roll.mp3');
        diceRollAudioRef.current.volume = 0.4;
      }
      diceRollAudioRef.current.currentTime = 0;
      diceRollAudioRef.current.play().catch(() => {
        // Ignore autoplay errors
      });
    } catch {
      // Audio not supported
    }
  }, []);

  const playPieceMoveSound = useCallback(() => {
    try {
      if (!pieceMoveAudioRef.current) {
        pieceMoveAudioRef.current = new Audio('/sounds/piece-move.mp3');
        pieceMoveAudioRef.current.volume = 0.3;
      }
      pieceMoveAudioRef.current.currentTime = 0;
      pieceMoveAudioRef.current.play().catch(() => {
        // Ignore autoplay errors
      });
    } catch {
      // Audio not supported
    }
  }, []);

  return { playVictorySound, playGameOverSound, playDiceRollSound, playPieceMoveSound };
};
