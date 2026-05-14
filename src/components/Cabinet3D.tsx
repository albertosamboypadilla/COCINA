import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Grid, Html } from '@react-three/drei';
import * as THREE from 'three';
import { CabinetConfig } from '../types';

interface PieceProps {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  name: string;
  opacity?: number;
}

function Piece({ position, size, color, name, opacity = 1 }: PieceProps) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial 
        color={color} 
        transparent={opacity < 1} 
        opacity={opacity} 
        roughness={0.7}
      />
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(...size)]} />
        <lineBasicMaterial color="#ffffff" opacity={0.3} transparent />
      </lineSegments>
    </mesh>
  );
}

function CabinetModel({ config }: { config: CabinetConfig }) {
  const { width, height, depth, thickness, numDoors, showDoors, gap } = config;

  const w = width;
  const h = height;
  const d = depth;
  const t = thickness;
  const g = gap;

  // Corner Vertical Posts
  const cornerPosts = [
    [-w/2 + t/2, 0, -d/2 + t/2],
    [w/2 - t/2, 0, -d/2 + t/2],
    [-w/2 + t/2, 0, d/2 - t/2],
    [w/2 - t/2, 0, d/2 - t/2],
  ];

  // Intermediate Vertical Posts (Stiles)
  const totalInternalWidth = w - (2 * t);
  const numFrontStiles = numDoors > 1 ? Math.floor((numDoors - 1) / 2) : 0;
  const doorOpeningWidth = numDoors > 0 ? (totalInternalWidth - (numFrontStiles * t)) / numDoors : 0;
  
  const intermediatePosts = [];
  
  // Front Stiles (one per every 2 doors)
  if (numDoors >= 2) {
    for (let i = 1; i <= numFrontStiles; i++) {
      const x = -w/2 + t + (2 * i * doorOpeningWidth) + (i - 0.5) * t;
      intermediatePosts.push([x, 0, d/2 - t/2]); // Front
    }
  }

  // Back Stiles (2 per every 2 doors)
  const numBackStilesActual = Math.floor(numDoors / 2) * 2;
  if (numBackStilesActual > 0) {
    for (let i = 1; i <= numBackStilesActual; i++) {
        // Distribute evenly between the corner posts
        const x = -w/2 + t + i * (totalInternalWidth / (numBackStilesActual + 1));
        intermediatePosts.push([x, 0, -d/2 + t/2]); // Back
    }
  }

  // Width Rails
  const widthRails = [
    [0, h/2 - t/2, -d/2 + t/2],
    [0, -h/2 + t/2, -d/2 + t/2],
    [0, h/2 - t/2, d/2 - t/2],
    [0, -h/2 + t/2, d/2 - t/2],
  ];

  // Depth Rails
  const depthRails = [
    [-w/2 + t/2, h/2 - t/2, 0],
    [-w/2 + t/2, -h/2 + t/2, 0],
    [w/2 - t/2, h/2 - t/2, 0],
    [w/2 - t/2, -h/2 + t/2, 0],
  ];

  return (
    <group position={[0, h/2, 0]}>
      {/* Corner Posts */}
      {cornerPosts.map((pos, i) => {
        const isBack = pos[2] < 0;
        return (
          <Piece 
            key={`cp-${i}`} 
            position={pos as [number, number, number]} 
            size={[t, h, t]} 
            color={isBack ? "#7f1d1d" : "#94a3b8"} 
            name="CornerPost"
          />
        );
      })}

      {/* Intermediate Posts */}
      {intermediatePosts.map((pos, i) => {
        const isBack = pos[2] < 0;
        return (
          <Piece 
            key={`ip-${i}`} 
            position={pos as [number, number, number]} 
            size={[t, h - 2*t, t]} 
            color={isBack ? "#991b1b" : "#64748b"} 
            name="IntermediatePost"
          />
        );
      })}

      {/* Width Rails */}
      {widthRails.map((pos, i) => {
        const isBack = pos[2] < 0;
        return (
          <Piece 
            key={`wr-${i}`} 
            position={pos as [number, number, number]} 
            size={[w - (2*t), t, t]} 
            color={isBack ? "#7f1d1d" : "#cbd5e1"} 
            name="WidthRail"
          />
        );
      })}

      {/* Depth Rails */}
      {depthRails.map((pos, i) => (
        <Piece 
          key={`dr-${i}`} 
          position={pos as [number, number, number]} 
          size={[t, t, d - 2*t]} 
          color="#cbd5e1" 
          name="DepthRail"
        />
      ))}

      {/* Dimension Labels */}
      <Html position={[0, -h/2 - 2, d/2]} center shadow>
        <div className="bg-blue-600 px-2 py-0.5 rounded text-[10px] font-mono font-bold text-white whitespace-nowrap shadow-xl">
          ANCHO: {width}"
        </div>
      </Html>
      <Html position={[w/2 + 2, 0, d/2]} center shadow>
        <div className="bg-emerald-600 px-2 py-0.5 rounded text-[10px] font-mono font-bold text-white whitespace-nowrap shadow-xl">
          ALTO: {height}"
        </div>
      </Html>
      <Html position={[-w/2, -h/2, 0]} center shadow>
        <div className="bg-amber-600 px-2 py-0.5 rounded text-[10px] font-mono font-bold text-white whitespace-nowrap shadow-xl">
          SALIDA: {depth}"
        </div>
      </Html>

      {/* Doors */}
      {showDoors && numDoors > 0 && Array.from({ length: numDoors }).map((_, i) => {
        const doorWidth = doorOpeningWidth - 2 * g;
        const doorHeight = h - 2 * t - 2 * g;
        
        // Center of each opening, accounting for stiles every 2 doors
        const numStilesBefore = Math.floor(i / 2);
        const x = -w/2 + t + i * doorOpeningWidth + numStilesBefore * t + doorOpeningWidth/2;
        
        return (
          <group key={i} position={[x, 0, d/2 + t/2]}>
            <Piece position={[0, doorHeight/2 - t/4, 0]} size={[doorWidth, t/2, t/2]} color="#3b82f6" opacity={0.8} name="DoorTop" />
            <Piece position={[0, -doorHeight/2 + t/4, 0]} size={[doorWidth, t/2, t/2]} color="#3b82f6" opacity={0.8} name="DoorBottom" />
            <Piece position={[-doorWidth/2 + t/4, 0, 0]} size={[t/2, doorHeight, t/2]} color="#3b82f6" opacity={0.8} name="DoorLeft" />
            <Piece position={[doorWidth/2 - t/4, 0, 0]} size={[t/2, doorHeight, t/2]} color="#3b82f6" opacity={0.8} name="DoorRight" />
            <Html position={[0, 0, 0.1]} center>
              <div className="bg-blue-500/20 text-blue-400 font-bold text-xs px-1 rounded-full w-4 h-4 flex items-center justify-center border border-blue-500/30">
                {i + 1}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

export default function Cabinet3D({ config }: { config: CabinetConfig }) {
  const maxDim = Math.max(config.width, config.height, config.depth);
  const cameraDist = maxDim * 2.5;

  return (
    <div className="w-full h-[500px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl relative">
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <div className="bg-slate-800/80 backdrop-blur-sm p-2 rounded border border-slate-700 text-[10px] text-blue-400 font-mono text-center">
          ESTRUCTURA ESCALADA (INCH)<br/>
          {config.width}" x {config.height}" x {config.depth}"
        </div>
      </div>
      <Canvas shadows camera={{ position: [cameraDist * 0.7, cameraDist * 0.7, cameraDist], fov: 45 }}>
        <OrbitControls makeDefault minDistance={1} maxDistance={maxDim * 10} />
        
        <ambientLight intensity={0.8} />
        <pointLight position={[maxDim, maxDim, maxDim]} intensity={1.5} />
        <spotLight position={[-maxDim, maxDim, maxDim]} angle={0.2} penumbra={1} intensity={2} />
        
        <CabinetModel config={config} />
        
        <Grid 
          infiniteGrid 
          fadeDistance={maxDim * 5} 
          fadeStrength={5} 
          sectionSize={maxDim / 2} 
          cellSize={maxDim / 20}
          sectionColor="#334155" 
          cellColor="#1e293b" 
        />
        
        <Environment preset="night" />
      </Canvas>
    </div>
  );
}
