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

export interface CabinetConfig extends CabinetDimensions {
  numDoors: number;
  showDoors: boolean;
}
