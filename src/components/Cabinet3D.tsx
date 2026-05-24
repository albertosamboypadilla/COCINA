import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Grid, Html } from '@react-three/drei';
import { Maximize2, Minimize2 } from 'lucide-react';
import * as THREE from 'three';
import { CabinetConfig } from '../types';
import { toFraction } from '../lib/cabinetLogic';

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
  const { width, height, depth, thickness, numDoors, showDoors, gap, annex } = config;

  const w = width;
  const h = height;
  const d = depth;
  const t = thickness;
  const g = gap;
  const sideGap = 0.25;

  // Annex variables
  const annexEnabled = annex?.enabled;
  const annexW = annex?.width || 0;
  const annexSide = annex?.side || 'right';
  const annexNumDoors = annex?.numDoors || 0;

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
                    {toFraction(dist)}"
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
          ANCHO: {toFraction(width)}"
        </div>
      </Html>
      <Html position={[w/2 + 2, 0, d/2]} center>
        <div className="bg-emerald-600 px-2 py-0.5 rounded text-[10px] font-mono font-bold text-white whitespace-nowrap shadow-xl">
          ALTO: {toFraction(height)}"
        </div>
      </Html>
      <Html position={[-w/2, -h/2, 0]} center>
        <div className="bg-amber-600 px-2 py-0.5 rounded text-[10px] font-mono font-bold text-white whitespace-nowrap shadow-xl">
          SALIDA: {toFraction(depth)}"
        </div>
      </Html>

      {/* Doors */}
      {showDoors && numDoors > 0 && (() => {
        const doorHeight = h - (2 * t) + 0.75;
        const dt = 2;

        const frontStileX = [
          -w/2 + t/2,
          ...intermediatePosts.filter(p => !p.isBack).map(p => p.pos[0]),
          w/2 - t/2
        ].sort((a, b) => a - b);

        const doorGroups = [];
        let doorCount = 0;

        for (let j = 0; j < frontStileX.length - 1; j++) {
          const xStart = frontStileX[j] + t/2;
          const xEnd = frontStileX[j+1] - t/2;
          const openingW = xEnd - xStart;
          
          // Number of doors in this opening (2 if more left, 1 if only 1 left)
          const doorsInOpening = Math.min(2, numDoors - doorCount);
          const totalGap = 2 * sideGap;
          const dWidth = (openingW - totalGap) / doorsInOpening;

          for (let k = 0; k < doorsInOpening; k++) {
            doorCount++;
            // If 2 doors, they meet in the middle (no gap between them)
            // Left door: from xStart + sideGap to xStart + sideGap + dWidth
            // Right door: from xEnd - sideGap - dWidth to xEnd - sideGap
            let doorX: number;
            if (doorsInOpening === 2) {
              if (k === 0) { // Left door
                doorX = xStart + sideGap + dWidth/2;
              } else { // Right door
                doorX = xEnd - sideGap - dWidth/2;
              }
            } else {
              // Single door center
              doorX = (xStart + xEnd) / 2;
            }

            doorGroups.push(
              <group key={`door-${doorCount}`} position={[doorX, 0, d/2 + t/5]}>
                {/* Door Frame */}
                <Piece position={[0, doorHeight/2 - dt/2, 0]} size={[dWidth, dt, t/3]} color="#60a5fa" opacity={0.9} name="DoorTop" />
                <Piece position={[0, -doorHeight/2 + dt/2, 0]} size={[dWidth, dt, t/3]} color="#60a5fa" opacity={0.9} name="DoorBottom" />
                <Piece position={[-dWidth/2 + dt/2, 0, 0]} size={[dt, doorHeight, t/3]} color="#60a5fa" opacity={0.9} name="DoorLeft" />
                <Piece position={[dWidth/2 - dt/2, 0, 0]} size={[dt, doorHeight, t/3]} color="#60a5fa" opacity={0.9} name="DoorRight" />
                
                {/* Glass panel */}
                <Piece position={[0, 0, 0]} size={[dWidth - 2*dt, doorHeight - 2*dt, 0.1]} color="#93c5fd" opacity={0.3} name="DoorGlass" />
                
                {/* Glass Reflection Lines */}
                <group position={[0, 0, 0.06]}>
                  <mesh rotation={[0, 0, Math.PI / 4]}>
                    <planeGeometry args={[dWidth * 0.6, 0.05]} />
                    <meshBasicMaterial color="white" opacity={0.2} transparent />
                  </mesh>
                  <mesh position={[dWidth * 0.1, dWidth * 0.1, 0]} rotation={[0, 0, Math.PI / 4]}>
                    <planeGeometry args={[dWidth * 0.4, 0.03]} />
                    <meshBasicMaterial color="white" opacity={0.15} transparent />
                  </mesh>
                </group>

                {/* Hinges */}
                {(doorsInOpening === 1 || (doorsInOpening === 2 && k === 0)) ? (
                  // Hinge on the left
                  <>
                    <Piece position={[-dWidth/2, doorHeight * 0.25, -t/10]} size={[0.5, 1, 0.5]} color="#94a3b8" name="HingeUL" />
                    <Piece position={[-dWidth/2, -doorHeight * 0.25, -t/10]} size={[0.5, 1, 0.5]} color="#94a3b8" name="HingeLL" />
                  </>
                ) : (
                  // Hinge on the right
                  <>
                    <Piece position={[dWidth/2, doorHeight * 0.25, -t/10]} size={[0.5, 1, 0.5]} color="#94a3b8" name="HingeUR" />
                    <Piece position={[dWidth/2, -doorHeight * 0.25, -t/10]} size={[0.5, 1, 0.5]} color="#94a3b8" name="HingeLR" />
                  </>
                )}

                {/* Handles (Tiradores) - opposite to hinges */}
                {(doorsInOpening === 1 || (doorsInOpening === 2 && k === 0)) ? (
                  // Handle on the right for left-hinged door
                  <Piece position={[dWidth/2 - 1, 0, 0.2]} size={[0.2, 3, 0.2]} color="white" name="HandleR" />
                ) : (
                  // Handle on the left for right-hinged door
                  <Piece position={[-dWidth/2 + 1, 0, 0.2]} size={[0.2, 3, 0.2]} color="white" name="HandleL" />
                )}
    
                <Html position={[0, 0, 0.2]} center>
                  <div className="flex flex-col items-center gap-1">
                    <div className="bg-blue-600/80 backdrop-blur-sm text-white font-bold text-[8px] px-1.5 py-0.5 rounded-full border border-blue-400">
                      {doorCount}
                    </div>
                    <div className="bg-slate-900/90 text-blue-300 text-[6px] font-mono px-1 rounded border border-blue-500/20 whitespace-nowrap">
                      {toFraction(dWidth)}" x {toFraction(doorHeight)}"
                    </div>
                  </div>
                </Html>
              </group>
            );
          }
        }
        return doorGroups;
      })()}

      {/* Annex Structure (L-Shape or Parallel) */}
      {annexEnabled && (() => {
        const al = annex?.width || 0; 
        const ad = annex?.depth || 0; 
        const sideMult = annexSide === 'right' ? 1 : -1;
        const isL = annex?.type === 'l-shape';
        
        // Group position
        // If L-shape: start at back edge, extend forward (Z)
        // If Parallel: start at side edge, extend sideways (X)
        const groupPos: [number, number, number] = isL 
          ? [w/2 * sideMult, 0, -d/2 + t/2] 
          : [(w/2 + al/2) * sideMult, 0, 0];

        if (isL) {
          return (
            <group position={groupPos}>
              {/* Annex Vertical Posts */}
              {[
                [ad * sideMult - t/2 * sideMult, 0, 0], // Back outer
                [ad * sideMult - t/2 * sideMult, 0, al - t], // Front outer
                [0, 0, al - t], // Front inner
              ].map((pos, i) => (
                <Piece 
                  key={`ap-${i}`} 
                  position={pos as [number, number, number]} 
                  size={[t, h, t]} 
                  color={pos[2] === 0 ? "#7f1d1d" : "#64748b"} 
                  name="AnnexPost" 
                />
              ))}

              {/* Annex Horizontal Rails (Lengthwise) */}
              {[
                [0, h/2 - t/2, al/2 - t/2],
                [0, -h/2 + t/2, al/2 - t/2],
                [ad * sideMult - t/2 * sideMult, h/2 - t/2, al/2 - t/2],
                [ad * sideMult - t/2 * sideMult, -h/2 + t/2, al/2 - t/2],
              ].map((pos, i) => (
                <Piece 
                  key={`alr-${i}`} 
                  position={pos as [number, number, number]} 
                  size={[t, t, al - t]} 
                  color="#cbd5e1" 
                  name="AnnexLengthRail" 
                />
              ))}

              {/* Annex Horizontal Rails (Widthwise) */}
              {[
                [ad/2 * sideMult, h/2 - t/2, al - t], // Front top
                [ad/2 * sideMult, -h/2 + t/2, al - t], // Front bottom
                [ad/2 * sideMult, h/2 - t/2, 0], // Back top (connecting to main cabinet)
                [ad/2 * sideMult, -h/2 + t/2, 0], // Back bottom
              ].map((pos, i) => (
                <Piece 
                  key={`awr-${i}`} 
                  position={pos as [number, number, number]} 
                  size={[ad - t, t, t]} 
                  color={pos[2] === 0 ? "#7f1d1d" : "#cbd5e1"} 
                  name="AnnexWidthRail" 
                />
              ))}

              {/* Annex Intermediate Stiles (Always visible) */}
              {annexNumDoors > 1 && (() => {
                const unionZ = d - t/2;
                const availableLength = al - unionZ - t;
                if (availableLength <= 0) return null;
                const numOpenings = Math.ceil(annexNumDoors / 2);
                const numIntermediateStiles = Math.floor((annexNumDoors - 1) / 2);
                const totalStileWidth = numIntermediateStiles * t;
                const totalGaps = (annexNumDoors > 0) ? (annexNumDoors * 2 * sideGap) : 0;
                
                // Effective width for all doors combined
                const netDoorWidthTotal = availableLength - totalStileWidth - totalGaps;
                const dw = netDoorWidthTotal / annexNumDoors;

                const stiles = [];
                // Intermediate stiles for annex (every 2 doors)
                for (let i = 1; i < numOpenings; i++) {
                  // Position is after i openings (each opening has 2 doors)
                  const z = unionZ + (i * 2 * (dw + 2 * sideGap)) + (i - 0.5) * t;
                  stiles.push(
                    <Piece 
                      key={`annex-stile-${i}`} 
                      position={[0, 0, z]} 
                      size={[t, h - 2*t, t]} 
                      color="#64748b" 
                      name="AnnexIntermediateStile" 
                    />
                  );
                }
                return stiles;
              })()}

              {/* Annex Doors (Inner Side facing center) */}
              {showDoors && annexNumDoors > 0 && (() => {
                const adt = 2; // Door profile
                const doorHeight = h - (2 * t) + 0.75;
                const unionZ = d - t/2;
                const availableLength = al - unionZ - t;
                if (availableLength <= 0) return null;

                const numOpenings = Math.ceil(annexNumDoors / 2);
                const numIntermediateStiles = Math.floor((annexNumDoors - 1) / 2);
                const totalStileWidth = numIntermediateStiles * t;
                const totalGaps = annexNumDoors * 2 * sideGap;
                const dw = (availableLength - totalStileWidth - totalGaps) / annexNumDoors;

                const doorGroups = [];
                let annexDoorCount = numDoors; // Start counting after main cabinet doors
                for (let j = 0; j < numOpenings; j++) {
                  const doorsInOpening = Math.min(2, annexNumDoors - (annexDoorCount - numDoors));
                  const zStartOfOpening = unionZ + j * (2 * (dw + 2 * sideGap) + t);

                  for (let k = 0; k < doorsInOpening; k++) {
                    annexDoorCount++;
                    const zPos = zStartOfOpening + sideGap + dw/2 + k * (dw + 2 * sideGap);

                    doorGroups.push(
                      <group key={`annex-door-${annexDoorCount}`} position={[t/10 * -sideMult, 0, zPos]} rotation={[0, sideMult * Math.PI/2, 0]}>
                        <Piece position={[0, doorHeight/2 - adt/2, 0]} size={[dw, adt, t/3]} color="#60a5fa" opacity={0.9} name="ADoorTop" />
                        <Piece position={[0, -doorHeight/2 + adt/2, 0]} size={[dw, adt, t/3]} color="#60a5fa" opacity={0.9} name="ADoorBottom" />
                        <Piece position={[-dw/2 + adt/2, 0, 0]} size={[adt, doorHeight, t/3]} color="#60a5fa" opacity={0.9} name="ADoorLeft" />
                        <Piece position={[dw/2 - adt/2, 0, 0]} size={[adt, doorHeight, t/3]} color="#60a5fa" opacity={0.9} name="ADoorRight" />
                        <Piece position={[0, 0, 0]} size={[dw - 2*adt, doorHeight - 2*adt, 0.1]} color="#93c5fd" opacity={0.3} name="ADoorGlass" />

                        {/* Reflection Lines */}
                        <group position={[0, 0, 0.06]}>
                          <mesh rotation={[0, 0, -Math.PI / 4]}>
                            <planeGeometry args={[dw * 0.6, 0.05]} />
                            <meshBasicMaterial color="white" opacity={0.2} transparent />
                          </mesh>
                          <mesh position={[dw * 0.1, -dw * 0.1, 0]} rotation={[0, 0, -Math.PI / 4]}>
                            <planeGeometry args={[dw * 0.4, 0.03]} />
                            <meshBasicMaterial color="white" opacity={0.15} transparent />
                          </mesh>
                        </group>
                        
                        {/* Annex Hinges (Butterfly style) - Adjusted for L-shape rotation sideMult */}
                        {((k === 0 && sideMult === -1) || (k === 1 && sideMult === 1)) ? (
                          <>
                            {/* Hinge on side closer to back/post */}
                            <Piece position={[-dw/2 - sideGap, doorHeight * 0.25, -t/10]} size={[0.5, 1, 0.5]} color="#94a3b8" name="AHingeL" />
                            <Piece position={[-dw/2 - sideGap, -doorHeight * 0.25, -t/10]} size={[0.5, 1, 0.5]} color="#94a3b8" name="AHingeL" />
                            {/* Handle on opposite side */}
                            <Piece position={[dw/2 - 1, 0, 0.2]} size={[0.2, 3, 0.2]} color="white" name="AHandle" />
                          </>
                        ) : (
                          <>
                            {/* Hinge on side closer to front/post */}
                            <Piece position={[dw/2 + sideGap, doorHeight * 0.25, -t/10]} size={[0.5, 1, 0.5]} color="#94a3b8" name="AHingeR" />
                            <Piece position={[dw/2 + sideGap, -doorHeight * 0.25, -t/10]} size={[0.5, 1, 0.5]} color="#94a3b8" name="AHingeR" />
                            {/* Handle on opposite side */}
                            <Piece position={[-dw/2 + 1, 0, 0.2]} size={[0.2, 3, 0.2]} color="white" name="AHandle" />
                          </>
                        )}

                        <Html position={[0, 0, 0.2]} center>
                          <div className="flex flex-col items-center gap-1">
                            <div className="bg-blue-600/80 backdrop-blur-sm text-white font-bold text-[8px] px-1.5 py-0.5 rounded-full border border-blue-400">
                              {annexDoorCount}
                            </div>
                            <div className="bg-slate-900/90 text-blue-300 text-[6px] font-mono px-1 rounded border border-blue-500/20 whitespace-nowrap">
                              {toFraction(dw)}" x {toFraction(doorHeight)}"
                            </div>
                          </div>
                        </Html>
                      </group>
                    );
                  }
                }
                return doorGroups;
              })()}

              <Html position={[ad/2 * sideMult, -h/2 - 5, al/2]} center>
                <div className="bg-purple-600 px-2 py-0.5 rounded text-[8px] font-mono font-bold text-white whitespace-nowrap shadow-xl">
                  ANEXO EN L: {toFraction(al)}"
                </div>
              </Html>
            </group>
          );
        } else {
          // PARALLEL (Side-by-side)
          return (
            <group position={groupPos}>
              {/* Outer Posts */}
              {[
                [al/2 - t/2, 0, -ad/2 + t/2],
                [al/2 - t/2, 0, ad/2 - t/2],
              ].map((pos, i) => (
                <Piece key={`ap-ext-${i}`} position={pos as [number, number, number]} size={[t, h, t]} color={pos[2] < 0 ? "#7f1d1d" : "#64748b"} name="AnnexPostExt" />
              ))}

              {/* Inner Posts (at the union) */}
              {[
                [-al/2 + t/2, 0, -ad/2 + t/2],
                [-al/2 + t/2, 0, ad/2 - t/2],
              ].map((pos, i) => (
                <Piece key={`ap-union-${i}`} position={pos as [number, number, number]} size={[t, h, t]} color={pos[2] < 0 ? "#7f1d1d" : "#64748b"} name="AnnexPostUnion" />
              ))}
              
              {/* Inner connecting rails are not needed if we share members, but let's draw them for clarity */}
              {/* Width Rails (sideways) */}
              {[
                [0, h/2 - t/2, -ad/2 + t/2],
                [0, -h/2 + t/2, -ad/2 + t/2],
                [0, h/2 - t/2, ad/2 - t/2],
                [0, -h/2 + t/2, ad/2 - t/2],
              ].map((pos, i) => (
                <Piece key={`awr-p-${i}`} position={pos as [number, number, number]} size={[al - t, t, t]} color={pos[2] < 0 ? "#7f1d1d" : "#cbd5e1"} name="AnnexWidthRailP" />
              ))}

              {/* Depth Rails */}
              {[
                [al/2 - t/2, h/2 - t/2, 0],
                [al/2 - t/2, -h/2 + t/2, 0],
                [-al/2 + t/2, h/2 - t/2, 0],
                [-al/2 + t/2, -h/2 + t/2, 0],
              ].map((pos, i) => (
                <Piece key={`adr-p-${i}`} position={pos as [number, number, number]} size={[t, t, ad - 2*t]} color="#cbd5e1" name="AnnexDepthRailP" />
              ))}

              {/* Annex Intermediate Stiles Parallel (Always visible) */}
              {annexNumDoors > 1 && (() => {
                const numOpenings = Math.ceil(annexNumDoors / 2);
                const numIntermediateStiles = Math.floor((annexNumDoors - 1) / 2);
                const totalStileWidth = numIntermediateStiles * t;
                const totalGaps = annexNumDoors * (2 * sideGap);
                const availableOpeningW = al - t;
                const dw = (availableOpeningW - totalStileWidth - totalGaps) / annexNumDoors;

                const stiles = [];
                // Intermediate stiles
                for (let i = 1; i < numOpenings; i++) {
                   const x = -al/2 + t + (i * 2 * (dw + 2 * sideGap)) + (i - 0.5) * t;
                   stiles.push(
                     <Piece 
                       key={`annex-stile-p-${i}`} 
                       position={[x, 0, ad/2 - t/2]} 
                       size={[t, h - 2*t, t]} 
                       color="#64748b" 
                       name="AnnexStileP" 
                     />
                   );
                }
                return stiles;
              })()}

              {/* Doors (facing front, starting after the union post) */}
              {showDoors && annexNumDoors > 0 && (() => {
                const adt = 2;
                const doorHeight = h - (2 * t) + 0.75;
                const availableOpeningW = al - t;
                const numOpenings = Math.ceil(annexNumDoors / 2);
                const numIntermediateStiles = Math.floor((annexNumDoors - 1) / 2);
                const totalStileWidth = numIntermediateStiles * t;
                const totalGaps = annexNumDoors * (2 * sideGap);
                const dw = (availableOpeningW - totalStileWidth - totalGaps) / annexNumDoors;

                const doorGroups = [];
                let annexDoorCount = numDoors; // Sequential numbering
                for (let j = 0; j < numOpenings; j++) {
                  const doorsInOpening = Math.min(2, annexNumDoors - (annexDoorCount - numDoors));
                  const xStartOfOpening = -al/2 + t + j * (2 * (dw + 2 * sideGap) + t);

                  for (let k = 0; k < doorsInOpening; k++) {
                    annexDoorCount++;
                    const xPos = xStartOfOpening + sideGap + dw/2 + k * (dw + 2 * sideGap);

                    doorGroups.push(
                      <group key={`annex-door-p-${annexDoorCount}`} position={[xPos, 0, ad/2 + t/5]}>
                        <Piece position={[0, doorHeight/2 - adt/2, 0]} size={[dw, adt, t/3]} color="#60a5fa" opacity={0.9} name="ADoorTopP" />
                        <Piece position={[0, -doorHeight/2 + adt/2, 0]} size={[dw, adt, t/3]} color="#60a5fa" opacity={0.9} name="ADoorBottomP" />
                        <Piece position={[-dw/2 + adt/2, 0, 0]} size={[adt, doorHeight, t/3]} color="#60a5fa" opacity={0.9} name="ADoorLeftP" />
                        <Piece position={[dw/2 - adt/2, 0, 0]} size={[adt, doorHeight, t/3]} color="#60a5fa" opacity={0.9} name="ADoorRightP" />
                        <Piece position={[0, 0, 0]} size={[dw - 2*adt, doorHeight - 2*adt, 0.1]} color="#93c5fd" opacity={0.3} name="ADoorGlassP" />
                        
                        {/* Reflection Lines */}
                        <group position={[0, 0, 0.06]}>
                          <mesh rotation={[0, 0, -Math.PI / 4]}>
                            <planeGeometry args={[dw * 0.6, 0.05]} />
                            <meshBasicMaterial color="white" opacity={0.2} transparent />
                          </mesh>
                          <mesh position={[dw * 0.1, -dw * 0.1, 0]} rotation={[0, 0, -Math.PI / 4]}>
                            <planeGeometry args={[dw * 0.4, 0.03]} />
                            <meshBasicMaterial color="white" opacity={0.15} transparent />
                          </mesh>
                        </group>

                        {/* Annex Hinges Parallel (Butterfly style) */}
                        {k === 0 ? (
                          <>
                            <Piece position={[-dw/2 - sideGap, doorHeight * 0.25, t/10]} size={[0.5, 1, 0.5]} color="#94a3b8" name="AHingeULP" />
                            <Piece position={[-dw/2 - sideGap, -doorHeight * 0.25, t/10]} size={[0.5, 1, 0.5]} color="#94a3b8" name="AHingeLLP" />
                            {/* Handle on right */}
                            <Piece position={[dw/2 - 1, 0, 0.2]} size={[0.2, 3, 0.2]} color="white" name="AHandlePR" />
                          </>
                        ) : (
                          <>
                            <Piece position={[dw/2 + sideGap, doorHeight * 0.25, t/10]} size={[0.5, 1, 0.5]} color="#94a3b8" name="AHingeURP" />
                            <Piece position={[dw/2 + sideGap, -doorHeight * 0.25, t/10]} size={[0.5, 1, 0.5]} color="#94a3b8" name="AHingeLRP" />
                            {/* Handle on left */}
                            <Piece position={[-dw/2 + 1, 0, 0.2]} size={[0.2, 3, 0.2]} color="white" name="AHandlePL" />
                          </>
                        )}

                        <Html position={[0, 0, 0.2]} center>
                          <div className="flex flex-col items-center gap-1">
                            <div className="bg-blue-600/80 backdrop-blur-sm text-white font-bold text-[8px] px-1.5 py-0.5 rounded-full border border-blue-400">
                              {annexDoorCount}
                            </div>
                            <div className="bg-slate-900/90 text-blue-300 text-[6px] font-mono px-1 rounded border border-blue-500/20 whitespace-nowrap">
                              {toFraction(dw)}" x {toFraction(doorHeight)}"
                            </div>
                          </div>
                        </Html>
                      </group>
                    );
                  }
                }
                return doorGroups;
              })()}

              <Html position={[0, -h/2 - 5, ad/2]} center>
                <div className="bg-emerald-600 px-2 py-0.5 rounded text-[8px] font-mono font-bold text-white whitespace-nowrap shadow-xl">
                  LATERAL: {toFraction(al)}"
                </div>
              </Html>
            </group>
          );
        }
      })()}
    </group>
  );
}

export default function Cabinet3D({ config }: { config: CabinetConfig }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const maxDim = Math.max(config.width, config.height, config.depth);
  const cameraDist = maxDim * 2.5;

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isFullscreen]);

  // Native Fullscreen API integration
  const containerRef = useRef<HTMLDivElement>(null);
  
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`bg-slate-950 overflow-hidden border border-slate-800 shadow-2xl relative transition-all duration-500 ease-in-out ${
        isFullscreen 
          ? 'fixed inset-0 z-[100] rounded-0' 
          : 'w-full h-[600px] rounded-xl relative z-10'
      }`}
    >
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <div className="bg-slate-800/80 backdrop-blur-sm p-3 rounded-lg border border-slate-700 text-[10px] text-blue-400 font-mono shadow-xl transition-opacity duration-300">
          <span className="font-black text-white text-xs mb-1 block uppercase tracking-wider">Estructura Escalada</span>
          {toFraction(config.width)}" x {toFraction(config.height)}" x {toFraction(config.depth)}"
        </div>
      </div>

      <div className="absolute top-4 right-4 z-[110] flex gap-3">
        <button 
          onClick={toggleFullscreen}
          className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-2xl shadow-xl shadow-blue-900/60 transition-all active:scale-95 group flex items-center gap-3 border border-blue-400/40"
          title={isFullscreen ? "Cerrar Pantalla Grande" : "Abrir Pantalla Grande"}
        >
          {isFullscreen ? <Minimize2 size={28} /> : <Maximize2 size={28} />}
          <span className="text-sm font-black tracking-widest uppercase">
            {isFullscreen ? "Cerrar" : "Pantalla Grande"}
          </span>
        </button>
      </div>

      <div className="absolute bottom-4 right-4 z-[110] flex gap-2">
        <button 
          onClick={toggleFullscreen}
          className="bg-slate-900/90 hover:bg-blue-600 text-white p-2.5 rounded-lg border border-slate-700 hover:border-blue-500 shadow-xl transition-all active:scale-95 flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider backdrop-blur-sm"
          title={isFullscreen ? "Cerrar Pantalla Completa" : "Pantalla Completa"}
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          <span>{isFullscreen ? "Min" : "F.S."}</span>
        </button>
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
