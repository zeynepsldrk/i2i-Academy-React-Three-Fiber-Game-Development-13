import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CollectibleData {
  id: number;
  position: THREE.Vector3;
  scale: number;
  floatOffset: number; // For randomized floating animations
}

interface CollectiblesProps {
  playerRef: React.RefObject<THREE.Group | null>;
  isPaused: boolean;
  speed: number;
  onCollect: (pos: THREE.Vector3) => void;
}

export const Collectibles: React.FC<CollectiblesProps> = ({
  playerRef,
  isPaused,
  speed,
  onCollect,
}) => {
  const collectiblesRef = useRef<CollectibleData[]>([]);
  const meshGroupRef = useRef<THREE.Group>(null);
  const idCounter = useRef(0);
  const spawnTimer = useRef(0);

  useFrame((state, delta) => {
    if (isPaused) return;

    const time = state.clock.getElapsedTime();

    // 1. Spawning Logic: spawn every 1.5 seconds at random intervals
    spawnTimer.current += delta;
    if (spawnTimer.current >= 1.4) {
      spawnTimer.current = 0;

      // Spawn in one of the running lanes
      const lanes = [-3, -1.5, 0, 1.5, 3];
      const randomLane = lanes[Math.floor(Math.random() * lanes.length)];

      const newCollectible: CollectibleData = {
        id: idCounter.current++,
        position: new THREE.Vector3(randomLane, 0.7, -60), // Start far away
        scale: 0.5,
        floatOffset: Math.random() * Math.PI * 2, // Random phase shift
      };

      collectiblesRef.current.push(newCollectible);
    }

    // 2. Move, Animate (Spin/Float), and Check collisions
    const playerGroup = playerRef.current;
    const playerPos = playerGroup ? playerGroup.position : null;
    const activeCollectibles: CollectibleData[] = [];

    for (let i = 0; i < collectiblesRef.current.length; i++) {
      const item = collectiblesRef.current[i];
      // Move towards the camera (positive Z)
      item.position.z += speed * 1.5 * delta;

      // Add float animation (up and down)
      const floatY = 0.7 + Math.sin(time * 3 + item.floatOffset) * 0.15;
      item.position.y = floatY;

      // Check collision using distance check (highly optimized)
      if (playerPos) {
        const distance = playerPos.distanceTo(item.position);
        if (distance < 0.85) {
          // Collected!
          onCollect(item.position.clone());
          continue;
        }
      }

      // Keep it if it hasn't passed the player view
      if (item.position.z < 10) {
        activeCollectibles.push(item);
      }
    }

    collectiblesRef.current = activeCollectibles;

    // 3. Update the pool meshes
    if (meshGroupRef.current) {
      meshGroupRef.current.children.forEach((child, index) => {
        const itemData = collectiblesRef.current[index];
        if (itemData && child instanceof THREE.Mesh) {
          child.position.copy(itemData.position);
          
          // Apply spin animation
          child.rotation.y = time * 2 + itemData.floatOffset;
          child.rotation.x = time * 0.5;

          child.visible = true;
        } else if (child instanceof THREE.Mesh) {
          child.visible = false;
        }
      });
    }
  });

  // Pre-allocated object pool for collectibles
  const maxPoolSize = 10;

  return (
    <group ref={meshGroupRef}>
      {Array.from({ length: maxPoolSize }).map((_, idx) => (
        <mesh key={idx} visible={false} castShadow>
          {/* OctahedronGeometry is great for crystals */}
          <octahedronGeometry args={[0.4, 0]} />
          <meshStandardMaterial
            color="#ffd700"
            emissive="#cca300"
            emissiveIntensity={1.0}
            roughness={0.1}
            metalness={0.9}
          />
        </mesh>
      ))}
    </group>
  );
};
