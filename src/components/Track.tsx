import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface TrackProps {
  speed: number;
  isPaused: boolean;
}

export const Track: React.FC<TrackProps> = ({ speed, isPaused }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (materialRef.current && !isPaused) {
      // Update time uniform to scroll the neon grid lines
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      materialRef.current.uniforms.uSpeed.value = speed * 1.5;
    }
  });

  return (
    <group>
      {/* Ground plane with custom neon grid shader */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -25]} receiveShadow>
        <planeGeometry args={[12, 100]} />
        <shaderMaterial
          ref={materialRef}
          transparent
          uniforms={{
            uTime: { value: 0 },
            uSpeed: { value: speed },
          }}
          vertexShader={`
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform float uTime;
            uniform float uSpeed;
            varying vec2 vUv;
            
            void main() {
              // Scale UV coordinates: 10 columns across, 50 rows along the runway
              vec2 gridUv = vUv * vec2(12.0, 80.0);
              
              // Scroll the grid along the Z axis (vUv.y)
              gridUv.y += uTime * uSpeed;
              
              // Draw grid lines
              vec2 grid = abs(fract(gridUv - 0.5) - 0.5) / 0.1; // Line thickness
              float line = min(grid.x, grid.y);
              float gridPattern = 1.0 - min(line, 1.0);
              
              // Fog/Fade effect in the distance
              float distanceFade = smoothstep(1.0, 0.15, vUv.y);
              
              // Glowing neon pink grid color
              vec3 gridColor = vec3(1.0, 0.0, 0.5) * gridPattern * 1.5 * distanceFade;
              
              // Dark background color
              vec3 bgColor = vec3(0.02, 0.01, 0.05) * (1.0 - gridPattern);
              
              gl_FragColor = vec4(gridColor + bgColor, 1.0);
            }
          `}
        />
      </mesh>

      {/* Neon guardrails (left and right edges of the runway) */}
      <mesh position={[-6, 0.1, -25]}>
        <boxGeometry args={[0.1, 0.2, 100]} />
        <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={1.5} />
      </mesh>
      <mesh position={[6, 0.1, -25]}>
        <boxGeometry args={[0.1, 0.2, 100]} />
        <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={1.5} />
      </mesh>
    </group>
  );
};
