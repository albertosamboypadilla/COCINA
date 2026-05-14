import { CutPiece, CabinetConfig } from '../types';

export function calculateCutList(config: CabinetConfig): CutPiece[] {
  const { width, height, depth, thickness, numDoors, gap } = config;

  // Number of intermediate vertical tubes needed to create 'numDoors' openings
  const intermediatePosts = numDoors > 1 ? numDoors - 1 : 0;

  const pieces: CutPiece[] = [
    {
      name: 'Postes Verticales Esquinas',
      length: height,
      quantity: 4,
      material: 'Estructura'
    },
    {
      name: 'Postes Verticales Intermedios',
      length: height - (2 * thickness),
      quantity: intermediatePosts * 2, // Front and back for consistency
      material: 'Refuerzo'
    },
    {
      name: 'Durmientes Ancho (Frente/Atrás)',
      length: width - (2 * thickness),
      quantity: 4,
      material: 'Estructura'
    },
    {
      name: 'Durmientes Profundidad (Laterales)',
      length: depth - (2 * thickness),
      quantity: 4,
      material: 'Estructura'
    }
  ];

  if (numDoors > 0) {
    const doorWidth = (width - (intermediatePosts * thickness) - (2 * thickness) - (gap * (numDoors + 1))) / numDoors;
    const doorHeight = height - (2 * thickness) - (2 * gap);
    
    pieces.push({
      name: 'Marco Puerta (Vertical)',
      length: doorHeight,
      quantity: numDoors * 2,
      material: 'Frontal'
    });
    pieces.push({
      name: 'Marco Puerta (Horizontal)',
      length: doorWidth,
      quantity: numDoors * 2,
      material: 'Frontal'
    });
  }

  return pieces;
}
