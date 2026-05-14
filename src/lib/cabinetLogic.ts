import { CutPiece, CabinetConfig } from '../types';

export function toFraction(decimal: number): string {
  const whole = Math.floor(decimal);
  const frac = Math.abs(decimal - whole);
  
  if (frac < 0.015) return `${whole}`;
  
  // Round to nearest 1/16
  const sixteenths = Math.round(frac * 16);
  
  if (sixteenths === 0) return `${whole}`;
  if (sixteenths === 16) return `${whole + 1}`;
  
  let num = sixteenths;
  let den = 16;
  
  // Simplify
  if (num % 8 === 0) { num /= 8; den /= 8; }
  else if (num % 4 === 0) { num /= 4; den /= 4; }
  else if (num % 2 === 0) { num /= 2; den /= 2; }
  
  return whole > 0 ? `${whole} ${num}/${den}` : `${num}/${den}`;
}

export function calculateCutList(config: CabinetConfig): CutPiece[] {
  const { width, height, depth, thickness, numDoors } = config;
  const t = thickness;

  const pieces: CutPiece[] = [
    {
      name: 'Postes Verticales (Esquinas)',
      length: height,
      quantity: 4,
      material: 'Aluminio 1 3/4"'
    },
    {
      name: 'Travesaños de Ancho (Frente/Atrás)',
      length: width - (2 * t),
      quantity: 4,
      material: 'Aluminio 1 3/4"'
    },
    {
      name: 'Travesaños de Salida (Laterales)',
      length: depth - (2 * t),
      quantity: 4,
      material: 'Aluminio 1 3/4"'
    }
  ];

  // Intermediate stiles (Red part/Support)
  if (numDoors > 1) {
    pieces.push({
      name: 'Postes Intermedios (Atrás)',
      length: height - (2 * t),
      quantity: numDoors - 1,
      material: 'Aluminio 1 3/4"'
    });

    // Front stiles (one every 2 doors)
    const numFrontStiles = Math.floor((numDoors - 1) / 2);
    if (numFrontStiles > 0) {
      pieces.push({
        name: 'Postes Intermedios (Frente)',
        length: height - (2 * t),
        quantity: numFrontStiles,
        material: 'Aluminio 1 3/4"'
      });
    }
  }

  if (numDoors > 0) {
    // Precise door logic based on user example: W=36.5, H=35 -> 16.25 x 32.25
    // Width logic: (W - 2T - (0.25 * numDoors)) / numDoors
    // Height logic: H - T - 1
    const t = thickness;
    const dt = 2; // Door thickness/profile width 2"
    const sideGap = 0.25; // 1/4" gap at stiles (approx 0.6cm)

    // Calculate actual front openings
    const numFrontOpenings = Math.ceil(numDoors / 2);
    const numFrontIntermediateStiles = Math.floor((numDoors - 1) / 2);
    const totalInternalWidth = width - (2 * t);
    const openingWidth = (totalInternalWidth - (numFrontIntermediateStiles * t)) / numFrontOpenings;

    // Doors are calculated per opening. 
    // Usually they are in pairs (meeting in the middle). 
    // If numDoors is odd, one opening might have only 1 door.
    
    // We can average it for the cut list, or be precise.
    // For 36.5" W with 2 doors: (33 - 0.5) / 2 = 16.25. Correct.
    
    const doorHeight = height - (2 * t) + 0.75; // Overlaps rails by 3/8" each side
    
    // Total door width sum for the entire cabinet
    // Total gap = (2 * sideGap) * numFrontOpenings
    const totalDoorWidthSum = (totalInternalWidth - (numFrontIntermediateStiles * t)) - (2 * sideGap * numFrontOpenings);
    const doorWidth = totalDoorWidthSum / numDoors;
    
    pieces.push({
      name: 'Marcos de Puerta (Verticales)',
      length: doorHeight,
      quantity: numDoors * 2,
      material: 'Aluminio 2"'
    });

    pieces.push({
      name: 'Marcos de Puerta (Horizontales)',
      length: doorWidth - (2 * dt),
      quantity: numDoors * 2,
      material: 'Aluminio 2"'
    });

    pieces.push({
      name: 'Vidrios / Paneles',
      length: doorHeight - (2 * dt),
      quantity: numDoors,
      material: `${toFraction(doorWidth - (2 * dt))}" de ancho`
    });

    pieces.push({
      name: 'Bisagras',
      length: 0,
      quantity: numDoors * 2,
      material: 'Acero Inox.'
    });
  }

  return pieces;
}
