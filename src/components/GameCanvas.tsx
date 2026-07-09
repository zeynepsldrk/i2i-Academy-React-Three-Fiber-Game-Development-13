import React from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { KeyboardControls, Stars } from '@react-three/drei';
import type { KeyboardControlsEntry } from '@react-three/drei';
import * as THREE from 'three';
import { Lighting } from './Lighting';
import { Track } from './Track';
import { Player } from './Player';
import type { Controls } from './Player';
import { Obstacles } from './Obstacles';
import { Collectibles } from './Collectibles';
import { Particles } from './Particles';
import type { ParticleSystemRef } from './Particles';

// Keyboard controls map using string literal actions
const keyboardMap: KeyboardControlsEntry<Controls>[] = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'back', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'right', keys: ['ArrowRight', 'KeyD'] },
];

interface GameCanvasProps {
  isPaused: boolean;
  speed: number;
  playerRef: React.RefObject<THREE.Group | null>;
  particlesRef: React.RefObject<ParticleSystemRef | null>;
  shakeIntensityRef: React.MutableRefObject<number>;
  onCollide: (pos: THREE.Vector3) => void;
  onCollect: (pos: THREE.Vector3) => void;
}

// Internal component to run frame updates on camera (like screen shake)
const CameraController: React.FC<{ shakeRef: React.MutableRefObject<number> }> = ({ shakeRef }) => {
  useFrame((state, delta) => {
    if (shakeRef.current > 0.01) {
      // Offset camera position randomly by shake intensity
      state.camera.position.x += (Math.random() - 0.5) * shakeRef.current;
      state.camera.position.y += (Math.random() - 0.5) * shakeRef.current;
      state.camera.position.z += (Math.random() - 0.5) * shakeRef.current;

      // Decay shake factor over time
      shakeRef.current = THREE.MathUtils.lerp(shakeRef.current, 0, 8 * delta);
    }
  });
  return null;
};

export const GameCanvas: React.FC<GameCanvasProps> = ({
  isPaused,
  speed,
  playerRef,
  particlesRef,
  shakeIntensityRef,
  onCollide,
  onCollect,
}) => {
  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
      <KeyboardControls map={keyboardMap}>
        <Canvas
          shadows
          camera={{ position: [0, 4.2, 7.5], fov: 60 }}
          gl={{ antialias: true }}
        >
          {/* Deep cybernetic background color */}
          <color attach="background" args={['#030008']} />

          {/* Sci-fi scene fog */}
          <fog attach="fog" args={['#030008', 25, 65]} />

          {/* Starry space field */}
          <Stars
            radius={80}
            depth={40}
            count={1200}
            factor={4}
            saturation={0.5}
            fade
            speed={1.5}
          />

          {/* Lighting */}
          <Lighting />

          {/* Track Runway */}
          <Track speed={speed} isPaused={isPaused} />

          {/* Player sphere */}
          <Player ref={playerRef} isPaused={isPaused} />

          {/* Dynamic Obstacles */}
          <Obstacles
            playerRef={playerRef}
            isPaused={isPaused}
            speed={speed}
            onCollide={onCollide}
          />

          {/* Collectible crystals */}
          <Collectibles
            playerRef={playerRef}
            isPaused={isPaused}
            speed={speed}
            onCollect={onCollect}
          />

          {/* VFX Particles */}
          <Particles ref={particlesRef} />

          {/* Dynamic camera effects */}
          <CameraController shakeRef={shakeIntensityRef} />
        </Canvas>
      </KeyboardControls>
    </div>
  );
};
