export interface Position {
  lat: number;
  lng: number;
}

export interface Particle {
  id: number;
  position: Position;
  history: Position[];
}

export interface SimulationParams {
  lkp: Position;
  startTime: Date;
  objectType: ObjectType;
  currentSpeed: number; // m/s
  currentDirection: number; // graus (0-360)
  windSpeed: number; // m/s
  windDirection: number; // graus (0-360)
  duration: number; // horas
}

export interface ObjectType {
  id: string;
  name: string;
  leeway: number;
  divergence: number; // dispersão horizontal (graus)
}

export interface SimulationResult {
  particles: Particle[];
  timeSteps: number;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export const OBJECT_TYPES: ObjectType[] = [
  {
    id: 'person',
    name: 'Pessoa no mar',
    leeway: 0.03,
    divergence: 15
  },
  {
    id: 'raft',
    name: 'Balsa',
    leeway: 0.05,
    divergence: 10
  },
  {
    id: 'small_boat',
    name: 'Barco pequeno',
    leeway: 0.02,
    divergence: 8
  },
  {
    id: 'debris',
    name: 'Destroços',
    leeway: 0.04,
    divergence: 20
  }
];
