export interface Vertex {
  // x coordinate in cm
  x: number;
  // y coordinate in cm
  y: number;
}

export interface Furniture {
  readonly id: IDBValidKey;
  readonly name: string;
  readonly bounds: Vertex[];

  readonly origin: Vertex;
  readonly depth: number;
  readonly width: number;
  readonly height: number;

  readonly angle: number;

  readonly texture: string;
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
