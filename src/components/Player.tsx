import React, { forwardRef, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';

export type Controls = 'forward' | 'back' | 'left' | 'right';

interface PlayerProps {
  isPaused: boolean;
}

export const Player = forwardRef<THREE.Group, PlayerProps>(({ isPaused }, ref) => {
  const [, getKeys] = useKeyboardControls<Controls>();
  const sphereRef = useRef<THREE.Mesh>(null);
  
  // Track visual rotation to roll the sphere as it moves
  useFrame((state, delta) => {
    if (isPaused) return;

    // Get current keys pressed
    const { forward, back, left, right } = getKeys();

    // 1. Calculate movement vectors
    const moveX = (left ? -1 : 0) + (right ? 1 : 0);
    const moveZ = (forward ? -1 : 0) + (back ? 1 : 0);

    const playerGroup = (ref as React.MutableRefObject<THREE.Group | null>).current;
    if (playerGroup) {
      const speed = 10 * delta; // Adjust speed based on frame delta for consistency

      // 2. Update player position with boundaries
      playerGroup.position.x += moveX * speed;
      playerGroup.position.z += moveZ * speed;

      // Restrict within the road runway boundaries
      playerGroup.position.x = THREE.MathUtils.clamp(playerGroup.position.x, -5.3, 5.3);
      playerGroup.position.z = THREE.MathUtils.clamp(playerGroup.position.z, -15, 5); // Keep player in front view

      // 3. Roll the player ball visually
      if (sphereRef.current) {
        if (moveX !== 0) {
          sphereRef.current.rotation.z -= moveX * speed * 2;
        }
        sphereRef.current.rotation.x += (moveZ || -1) * speed * 2; // Keep rolling forward by default
      }

      // 4. Smooth Camera Follow (Lerp camera target and position)
      const targetCamX = playerGroup.position.x * 0.7; // Dampen camera side movement
      const targetCamZ = playerGroup.position.z + 7.5; // Offset camera behind player
      
      state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetCamX, 0.08);
      state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetCamZ, 0.08);
      state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, 4.2, 0.08); // Maintain height
      
      // Look slightly ahead of the player
      state.camera.lookAt(playerGroup.position.x * 0.5, 1, playerGroup.position.z - 5);
    }
  });

  return (
    <group ref={ref} position={[0, 0.6, 0]}>
      {/* Outer energy ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.7, 0.04, 16, 100]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.3} />
      </mesh>

      {/* Main Player Sphere (glowing cyan ball) */}
      <mesh ref={sphereRef} castShadow receiveShadow>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshPhysicalMaterial
          color="#00f0ff"
          emissive="#00bfff"
          emissiveIntensity={1.2}
          roughness={0.1}
          metalness={0.1}
          clearcoat={1.0}
        />
      </mesh>

      {/* Under-glow point light to light up the track directly beneath the player */}
      <pointLight position={[0, -0.3, 0]} intensity={1.5} distance={3} color="#00ffff" />
    </group>
  );
});

Player.displayName = 'Player';
