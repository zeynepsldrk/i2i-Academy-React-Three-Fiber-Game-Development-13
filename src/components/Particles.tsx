import React, { forwardRef, useImperativeHandle, useState, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface ParticleSystemRef {
  spawnExplosion: (position: THREE.Vector3 | [number, number, number], color: string) => void;
}

interface ExplosionData {
  id: number;
  position: [number, number, number];
  color: string;
}

interface SingleExplosionProps {
  position: [number, number, number];
  color: string;
  onComplete: () => void;
}

const SingleExplosion: React.FC<SingleExplosionProps> = ({ position, color, onComplete }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 25;
  const ageRef = useRef(0);
  const maxAge = 0.7; // Duration in seconds

  // Generate initial particle positions and random velocity vectors
  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // All particles start at the explosion center
      pos[i * 3] = position[0];
      pos[i * 3 + 1] = position[1];
      pos[i * 3 + 2] = position[2];

      // Random spherical velocity
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const speed = 1.5 + Math.random() * 3.5;

      vel[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
      vel[i * 3 + 1] = Math.abs(Math.sin(phi) * Math.sin(theta) * speed) + 0.5; // Upward bias
      vel[i * 3 + 2] = Math.cos(phi) * speed;
    }
    return [pos, vel];
  }, [position]);

  useFrame((_state, delta) => {
    ageRef.current += delta;
    if (ageRef.current >= maxAge) {
      onComplete();
      return;
    }

    if (pointsRef.current) {
      const geo = pointsRef.current.geometry;
      const posAttr = geo.attributes.position as THREE.BufferAttribute;

      for (let i = 0; i < count; i++) {
        // Move particle by velocity * delta
        posAttr.array[i * 3] += velocities[i * 3] * delta;
        // Gravity effect
        posAttr.array[i * 3 + 1] += velocities[i * 3 + 1] * delta - 2.5 * delta * ageRef.current;
        posAttr.array[i * 3 + 2] += velocities[i * 3 + 2] * delta;
      }
      posAttr.needsUpdate = true;

      // Smooth fade out
      const mat = pointsRef.current.material as THREE.PointsMaterial;
      if (mat) {
        mat.opacity = 1.0 - ageRef.current / maxAge;
      }
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.2}
        transparent
        opacity={1}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export const Particles = forwardRef<ParticleSystemRef, {}>((_props, ref) => {
  const [explosions, setExplosions] = useState<ExplosionData[]>([]);
  const idCounter = useRef(0);

  useImperativeHandle(ref, () => ({
    spawnExplosion(position, color) {
      const posArray: [number, number, number] =
        position instanceof THREE.Vector3
          ? [position.x, position.y, position.z]
          : position;

      const newExplosion: ExplosionData = {
        id: idCounter.current++,
        position: posArray,
        color,
      };

      setExplosions((prev) => [...prev, newExplosion]);
    },
  }));

  const removeExplosion = (id: number) => {
    setExplosions((prev) => prev.filter((exp) => exp.id !== id));
  };

  return (
    <>
      {explosions.map((exp) => (
        <SingleExplosion
          key={exp.id}
          position={exp.position}
          color={exp.color}
          onComplete={() => removeExplosion(exp.id)}
        />
      ))}
    </>
  );
});

Particles.displayName = 'Particles';
