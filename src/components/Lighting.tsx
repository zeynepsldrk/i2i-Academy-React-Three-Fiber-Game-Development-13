import React from 'react';

export const Lighting: React.FC = () => {
  return (
    <>
      {/* Soft overall lighting */}
      <ambientLight intensity={0.3} />

      {/* Directional light to cast shadows and highlights */}
      <directionalLight
        position={[5, 15, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      {/* Point light to add neon reflections from the track */}
      <pointLight position={[0, 2, -10]} intensity={0.8} color="#00f0ff" />
      <pointLight position={[0, 2, 10]} intensity={0.8} color="#ff007f" />
    </>
  );
};
