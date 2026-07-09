import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ObstacleData {
  id: number;
  position: THREE.Vector3;
  width: number;
  height: number;
  depth: number;
}

interface ObstaclesProps {
  playerRef: React.RefObject<THREE.Group | null>;
  isPaused: boolean;
  speed: number;
  onCollide: (pos: THREE.Vector3) => void;
}

export const Obstacles: React.FC<ObstaclesProps> = ({
  playerRef,
  isPaused,
  speed,
  onCollide,
}) => {
  const obstaclesRef = useRef<ObstacleData[]>([]);
  const meshGroupRef = useRef<THREE.Group>(null);
  const idCounter = useRef(0);
  const spawnTimer = useRef(0);

  // Reusable bounding box structures to avoid garbage collection overhead in the game loop
  const playerBox = new THREE.Box3();
  const obstacleBox = new THREE.Box3();

  useFrame((_state, delta) => {
    if (isPaused) return;

    // 1. Spawning Logic: interval decreases as speed increases
    spawnTimer.current += delta;
    const spawnInterval = Math.max(0.7, 1.8 - speed * 0.08);

    if (spawnTimer.current >= spawnInterval) {
      spawnTimer.current = 0;

      // Select a random lane (Left, Center, Right) or slightly off-center
      const lanes = [-4, -2, 0, 2, 4];
      const randomLane = lanes[Math.floor(Math.random() * lanes.length)];

      const newObstacle: ObstacleData = {
        id: idCounter.current++,
        position: new THREE.Vector3(randomLane, 0.6, -60), // Start far away along Z
        width: 1.2,
        height: 1.2,
        depth: 1.2,
      };

      obstaclesRef.current.push(newObstacle);
    }

    // 2. Update Obstacle Positions and Bounding Box collisions
    const playerGroup = playerRef.current;
    if (playerGroup) {
      // Calculate the bounding box for the player once per frame
      playerBox.setFromObject(playerGroup);
    }

    const activeObstacles: ObstacleData[] = [];

    for (let i = 0; i < obstaclesRef.current.length; i++) {
      const obs = obstaclesRef.current[i];
      // Move obstacle towards the player along the positive Z direction
      obs.position.z += speed * 1.5 * delta;

      // Check collision
      if (playerGroup) {
        obstacleBox.setFromCenterAndSize(
          obs.position,
          new THREE.Vector3(obs.width, obs.height, obs.depth)
        );

        if (playerBox.intersectsBox(obstacleBox)) {
          // Trigger collision callback and skip adding to active list (deletes it)
          onCollide(obs.position.clone());
          continue;
        }
      }

      // Recycle obstacle once it goes behind the player camera view (Z > 10)
      if (obs.position.z < 10) {
        activeObstacles.push(obs);
      }
    }

    obstaclesRef.current = activeObstacles;

    // 3. Update the rendered mesh instances
    if (meshGroupRef.current) {
      // Direct mesh manipulation or simple group positioning
      meshGroupRef.current.children.forEach((child, index) => {
        const obsData = obstaclesRef.current[index];
        if (obsData && child instanceof THREE.Mesh) {
          child.position.copy(obsData.position);
          child.visible = true;
        } else if (child instanceof THREE.Mesh) {
          child.visible = false;
        }
      });
    }
  });

  // Pre-allocate a pool of meshes in the scene to avoid instantiating meshes on the fly (performance optimization)
  const maxPoolSize = 15;

  return (
    <group ref={meshGroupRef}>
      {Array.from({ length: maxPoolSize }).map((_, idx) => (
        <mesh key={idx} visible={false} castShadow receiveShadow>
          <boxGeometry args={[1.2, 1.2, 1.2]} />
          <meshStandardMaterial
            color="#ff0055"
            emissive="#ff0033"
            emissiveIntensity={1.2}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
      ))}
    </group>
  );
};
