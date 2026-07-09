# Neon Overdrive - React Three Fiber 3D Game

An interactive, 3D browser-based endless runner game built for i2i Academy. This project utilizes the React Three Fiber (R3F) library to study WebGL-based 3D rendering processes, game loops, object pooling, and custom GLSL shader integrations.

---

## Core Features

- **Advanced Cyberpunk Visuals**: Starry sky background (Stars), depth-adding fog effect, and neon glowing materials for obstacles and collectible crystals.
- **Dynamic Grid Shader**: To optimize performance, rather than physically moving the runway plane, a custom GLSL fragment shader scrolls the grid coordinate lines along the Z-axis based on elapsed time and current game velocity.
- **Smooth Camera Tracking**: The camera follows the player with linear interpolation (lerp) for a smooth follow experience rather than abrupt camera cuts.
- **Object Pooling**: Pre-allocates obstacle and collectible meshes in a memory pool to prevent garbage collection pauses, keeping the game loop highly performant.
- **Juicy VFX Feedback**: Screen shake upon impact, alongside color-coded dynamic particle explosions (Particles) for both collection and crash events.
- **Glassmorphic UI HUD**: A modern, semi-transparent user interface displaying lives (integrity), velocity multipliers, current charge (score), and game states.

---

## Tech Stack

- **Core**: React 18, TypeScript, Vite
- **3D Graphics**: Three.js, @react-three/fiber (R3F), @react-three/drei
- **Styling**: Vanilla CSS (Cyberpunk custom layouts)
- **Containerization & Web Server**: Docker, Docker Compose, Nginx (Alpine-based image)

---

## Control Deck

Steer the player to avoid red obstacle cubes and collect golden crystals:

- **Move Left**: A or ← (Left Arrow Key)
- **Move Right**: D or → (Right Arrow Key)
- **Accelerate (Forward)**: W or ↑ (Up Arrow Key)
- **Decelerate (Backward)**: S or ↓ (Down Arrow Key)

---

## Installation and Execution

### 1. Local Development Server (Vite)
To install the dependencies and spin up the development server (available at http://localhost:5173):
```bash
npm install
npm run dev
```

### 2. Docker Deployment (Nginx)
To build the multi-stage Docker image and start the containerized web server (available at http://localhost:8080):
```bash
docker compose up --build
```

---

## Intern Report and Deliverables

For the theoretical question answers (under the 5-sentence limit per question), detailed intern engineering learnings, and structured markdown screenshot placeholders for submission, please refer to the [SOLUTION.md](file:///c:/Users/durak/Desktop/i2i-Academy-React-Three-Fiber-Game-Development-13/SOLUTION.md) file in the root directory.
