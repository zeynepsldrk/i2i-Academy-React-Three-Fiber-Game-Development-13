import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GameCanvas } from './components/GameCanvas';
import type { ParticleSystemRef } from './components/Particles';
import './App.css';

type GameState = 'START' | 'PLAYING' | 'GAME_OVER';

export const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('START');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem('neon_high_score');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [lives, setLives] = useState<number>(3);
  const [speed, setSpeed] = useState<number>(6.0);
  
  // This key is used to force-remount the 3D scene when restarting the game
  const [gameKey, setGameKey] = useState<number>(0);

  // References to communicate with 3D Canvas children without triggering React re-renders
  const playerRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<ParticleSystemRef>(null);
  const shakeIntensityRef = useRef<number>(0);

  // 1. Game Loop Timers (Score accumulation & speed increases over time)
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    // Increment score for surviving and increase speed every second
    const survivalTimer = setInterval(() => {
      setScore((prev) => prev + 1);
      setSpeed((prev) => Math.min(prev + 0.15, 18.0)); // Max speed capped at 18.0
    }, 1000);

    return () => clearInterval(survivalTimer);
  }, [gameState]);

  // 2. Collision Handler
  const handleCollision = (obstaclePos: THREE.Vector3) => {
    // Screen shake trigger
    shakeIntensityRef.current = 0.45;

    // Trigger pink-red explosion VFX
    if (particlesRef.current) {
      particlesRef.current.spawnExplosion(obstaclePos, '#ff0055');
    }

    setLives((prevLives) => {
      const nextLives = prevLives - 1;
      
      if (nextLives <= 0) {
        // Game Over trigger
        setGameState('GAME_OVER');
        setHighScore((prevHigh) => {
          if (score > prevHigh) {
            localStorage.setItem('neon_high_score', score.toString());
            return score;
          }
          return prevHigh;
        });
      }
      
      return nextLives;
    });
  };

  // 3. Collection Handler
  const handleCollect = (collectiblePos: THREE.Vector3) => {
    // Add bonus score points
    setScore((prev) => prev + 15);

    // Trigger golden explosion VFX
    if (particlesRef.current) {
      particlesRef.current.spawnExplosion(collectiblePos, '#ffd700');
    }
  };

  // 4. Start Game
  const startGame = () => {
    setScore(0);
    setLives(3);
    setSpeed(6.0);
    setGameState('PLAYING');
  };

  // 5. Restart Game (Remounts Canvas to clear active arrays)
  const restartGame = () => {
    setGameKey((prev) => prev + 1);
    startGame();
  };

  return (
    <div className="game-container">
      {/* 3D WebGL Canvas Layer */}
      <GameCanvas
        key={gameKey}
        isPaused={gameState !== 'PLAYING'}
        speed={speed}
        playerRef={playerRef}
        particlesRef={particlesRef}
        shakeIntensityRef={shakeIntensityRef}
        onCollide={handleCollision}
        onCollect={handleCollect}
      />

      {/* HTML UI HUD/Overlay Layer */}
      <div className="ui-overlay">
        
        {/* TOP BAR: HUD displaying Score, Hearts and Multiplier */}
        {gameState === 'PLAYING' && (
          <header className="hud-header">
            {/* Lives / Hearts Display */}
            <div className="hud-item glass interactive">
              <span className="hud-label">Integrity</span>
              <div className="hearts-container">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <span
                    key={idx}
                    className="heart-icon"
                    style={{ opacity: idx < lives ? 1 : 0.2 }}
                  >
                    ❤️
                  </span>
                ))}
              </div>
            </div>

            {/* Current Speed Multiplier */}
            <div className="hud-item glass interactive" style={{ textAlign: 'center' }}>
              <span className="hud-label">Velocity</span>
              <span className="hud-value glow-cyan">
                {(speed / 6.0).toFixed(1)}x
              </span>
            </div>

            {/* Current Score Display */}
            <div className="hud-item glass interactive" style={{ alignItems: 'flex-end' }}>
              <span className="hud-label">Core Charge</span>
              <span className="hud-value glow-magenta">{score}</span>
            </div>
          </header>
        )}

        {/* START SCREEN MENU */}
        {gameState === 'START' && (
          <div className="menu-panel glass interactive">
            <div>
              <h1 className="game-title glow-cyan">Neon Overdrive</h1>
              <p className="game-subtitle">i2i Academy R3F Project</p>
            </div>
            
            <div className="controls-guide glass">
              <h3>System Control Deck</h3>
              <p>• Move Left: <span className="control-key">A</span> or <span className="control-key">←</span></p>
              <p>• Move Right: <span className="control-key">D</span> or <span className="control-key">→</span></p>
              <p>• Move Forward: <span className="control-key">W</span> or <span className="control-key">↑</span></p>
              <p>• Move Backward: <span className="control-key">S</span> or <span className="control-key">↓</span></p>
              <p>Collect <span style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>Gold Crystals (+15)</span>. Avoid <span style={{ color: 'var(--color-danger)', fontWeight: 'bold' }}>Red Cubes (-1 Integrity)</span>!</p>
            </div>

            <button className="btn-cyber" onClick={startGame}>
              Initialize System
            </button>

            {highScore > 0 && (
              <div className="high-score-display glow-gold">
                🏆 RECORD CHARGE: {highScore}
              </div>
            )}
          </div>
        )}

        {/* GAME OVER SCREEN */}
        {gameState === 'GAME_OVER' && (
          <div className="menu-panel glass interactive">
            <div>
              <h1 className="game-title glow-magenta" style={{ color: 'var(--color-danger)' }}>
                System Failure
              </h1>
              <p className="game-subtitle">Core Destabilized</p>
            </div>

            <div className="stats-grid">
              <div className="stats-row">
                <span className="label">Final Charge:</span>
                <span className="val glow-magenta">{score}</span>
              </div>
              <div className="stats-row">
                <span className="label">Max Velocity:</span>
                <span className="val glow-cyan">{(speed / 6.0).toFixed(1)}x</span>
              </div>
              <div className="stats-row">
                <span className="label">Record Charge:</span>
                <span className="val glow-gold">{highScore}</span>
              </div>
            </div>

            <button className="btn-cyber danger" onClick={restartGame}>
              Reboot Core
            </button>
          </div>
        )}

        {/* Bottom decorative bar / credits (interactive element spacer) */}
        <div></div>
      </div>
    </div>
  );
};

export default App;
