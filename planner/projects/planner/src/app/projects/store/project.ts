export interface Vertex {
  // x coordinate in cm
  x: number;
  // y coordinate in cm
  y: number;
}

export interface Furniture {
  id: IDBValidKey;
  name: string;
  bounds: Vertex[];
  readonly width: number;
  readonly height: number;
  readonly depth: number;
  texture: string;
}

export interface ApartmentFloor {
  id: IDBValidKey;
  name: string;
  plan: Vertex[];
  furniture: Furniture[];
}

export interface Project {
  id: IDBValidKey;
  name: string;
  description: string;
  floors: ApartmentFloor[];
}
