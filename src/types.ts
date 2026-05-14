export interface CabinetDimensions {
  width: number;
  height: number;
  depth: number;
  thickness: number; // thickness of the frame tubes/members
  gap: number;
}

export interface CutPiece {
  name: string;
  length: number;
  quantity: number;
  material?: string;
}

export interface AnnexConfig {
  enabled: boolean;
  side: 'left' | 'right';
  type: 'l-shape' | 'parallel';
  width: number;  // For L-shape: extension forward. For Parallel: width extension.
  depth: number;  // For L-shape: width of annex. For Parallel: depth of annex.
  numDoors: number;
}

export interface CabinetConfig extends CabinetDimensions {
  numDoors: number;
  showDoors: boolean;
  annex?: AnnexConfig;
}

export interface Project {
  id: string;
  clientName: string;
  date: string;
  config: CabinetConfig;
}
