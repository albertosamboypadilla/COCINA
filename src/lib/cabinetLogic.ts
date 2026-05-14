import { CutPiece, CabinetConfig } from '../types';

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
    const doorGapTotal = 0.25 * numDoors;
    const doorWidth = (width - (2 * t) - doorGapTotal) / numDoors;
    const doorHeight = height - t - 1;
    
    pieces.push({
      name: 'Puertas / Vidrios',
      length: doorHeight,
      quantity: numDoors,
      material: `${doorWidth.toFixed(3)}" de ancho`
    });
  }

  return pieces;
}
