import React, { useRef, useState } from 'react';
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
  onClick?: () => void;
}

function Piece({ position, size, color, name, opacity = 1, onClick }: PieceProps) {
  return (
    <mesh position={position} onClick={onClick}>
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
  const [showTubeMeasures, setShowTubeMeasures] = useState(false);
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

  // Intermediate Vertical Posts (Stiles) - Equal spacing for all sections
  const numBackSections = numDoors > 0 ? numDoors : 1;
  const totalInternalWidth = w - (2 * t);
  const totalStileWidth = (numBackSections - 1) * t;
  const doorOpeningWidth = (totalInternalWidth - totalStileWidth) / numBackSections;
  
  const intermediatePosts: { pos: [number, number, number]; isBack: boolean }[] = [];
  
  // Create intermediate stiles
  if (numBackSections > 1) {
    for (let i = 1; i < numBackSections; i++) {
      const x = -w/2 + t + i * doorOpeningWidth + (i - 0.5) * t;
      // Back: Tube for every door divider
      intermediatePosts.push({ pos: [x, 0, -d/2 + t/2], isBack: true });
      // Front: Tube for every 2 doors
      if (i % 2 === 0) {
        intermediatePosts.push({ pos: [x, 0, d/2 - t/2], isBack: false });
      }
    }
  }

  // Width Rails (Horizontal)
  const widthRails = [
    [0, h/2 - t/2, -d/2 + t/2],
    [0, -h/2 + t/2, -d/2 + t/2],
    [0, h/2 - t/2, d/2 - t/2],
    [0, -h/2 + t/2, d/2 - t/2],
  ];

  // Depth Rails (Sides)
  const depthRails = [
    [-w/2 + t/2, h/2 - t/2, 0],
    [-w/2 + t/2, -h/2 + t/2, 0],
    [w/2 - t/2, h/2 - t/2, 0],
    [w/2 - t/2, -h/2 + t/2, 0],
  ];

  return (
    <group position={[0, h/2, 0]} onPointerMissed={() => setShowTubeMeasures(false)}>
      {/* Corner Posts */}
      {cornerPosts.map((pos, i) => {
        const isB = pos[2] < 0;
        return (
          <Piece 
            key={`cp-${i}`} 
            position={pos as [number, number, number]} 
            size={[t, h, t]} 
            color={isB ? "#7f1d1d" : "#94a3b8"} 
            name="CornerPost"
            onClick={isB ? () => setShowTubeMeasures(!showTubeMeasures) : undefined}
          />
        );
      })}

      {/* Intermediate Posts */}
      {intermediatePosts.map((item, i) => {
        return (
          <Piece 
            key={`ip-${i}`} 
            position={item.pos} 
            size={[t, h - 2*t, t]} 
            color={item.isBack ? "#991b1b" : "#64748b"} 
            name="IntermediatePost"
            onClick={item.isBack ? () => setShowTubeMeasures(!showTubeMeasures) : undefined}
          />
        );
      })}

      {/* Width Rails */}
      {widthRails.map((pos, i) => {
        const isB = pos[2] < 0;
        const isBottomFront = !isB && pos[1] < 0;
        const isRedPart = isB;
        return (
          <Piece 
            key={`wr-${i}`} 
            position={pos as [number, number, number]} 
            size={[w - (2*t), t, t]} 
            color={isBottomFront ? (showTubeMeasures ? "#3b82f6" : "#cbd5e1") : (isB ? "#7f1d1d" : "#cbd5e1")} 
            name="WidthRail"
            onClick={(isBottomFront || isRedPart) ? () => setShowTubeMeasures(!showTubeMeasures) : undefined}
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

      {/* Tube-to-Tube Measurements (Front and Back) */}
      {showTubeMeasures && [d/2, -d/2].map((zPos, zIdx) => {
        const isB = zPos < 0;
        const postsX = [
          -w/2 + t/2,
          ...intermediatePosts.filter(p => isB ? p.isBack : !p.isBack).map(p => p.pos[0]),
          w/2 - t/2
        ].sort((a, b) => b - a);

        return postsX.map((x, i) => {
          if (i === postsX.length - 1) return null;
          const nextX = postsX[i + 1];
          const midX = (x + nextX) / 2;
          const dist = Math.abs(x - nextX) - t; 
          
          if (dist <= 0) return null;

          return (
            <Html 
              key={`dist-${zIdx}-${i}`} 
              position={[midX, -h/2 + t * 1.5, zPos + (isB ? -t : t)]} 
              center 
              style={{ pointerEvents: 'none' }}
            >
              <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                <div className={`${isB ? 'bg-red-600 border-red-400' : 'bg-blue-600 border-blue-400'} border px-1.5 py-0.5 rounded shadow-[0_0_15px_rgba(59,130,246,0.5)] flex items-center gap-1`}>
                  <span className="text-[10px] font-mono font-black text-white whitespace-nowrap">
                    {dist.toFixed(3)}"
                  </span>
                </div>
                <div className={`w-[200%] h-[1px] ${isB ? 'bg-red-500/50' : 'bg-blue-500/50'} absolute -top-2 left-1/2 -translate-x-1/2 flex justify-between px-0.5`}>
                  <div className={`w-[1px] h-2 ${isB ? 'bg-red-400' : 'bg-blue-400'}`} />
                  <div className={`w-[1px] h-2 ${isB ? 'bg-red-400' : 'bg-blue-400'}`} />
                </div>
              </div>
            </Html>
          );
        });
      })}

      {/* Dimension Labels */}
      <Html position={[0, -h/2 - 2, d/2]} center>
        <div className="bg-blue-600 px-2 py-0.5 rounded text-[10px] font-mono font-bold text-white whitespace-nowrap shadow-xl">
          ANCHO: {width}"
        </div>
      </Html>
      <Html position={[w/2 + 2, 0, d/2]} center>
        <div className="bg-emerald-600 px-2 py-0.5 rounded text-[10px] font-mono font-bold text-white whitespace-nowrap shadow-xl">
          ALTO: {height}"
        </div>
      </Html>
      <Html position={[-w/2, -h/2, 0]} center>
        <div className="bg-amber-600 px-2 py-0.5 rounded text-[10px] font-mono font-bold text-white whitespace-nowrap shadow-xl">
          SALIDA: {depth}"
        </div>
      </Html>

      {/* Doors */}
      {showDoors && numDoors > 0 && Array.from({ length: numDoors }).map((_, i) => {
        const doorWidth = doorOpeningWidth - 2 * g;
        const doorHeight = h - 2 * t - 2 * g;
        
        // Center of each opening in the new uniform distribution
        const x = -w/2 + t + i * doorOpeningWidth + i * t + doorOpeningWidth/2;
        
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
