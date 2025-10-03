


import { Position, Particle, SimulationParams, SimulationResult } from '@/types/simulation';

/**
 * Converte graus para radianos
 */
function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Converte radianos para graus
 */
function radiansToDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * fórmula de Haversine
 */
function calculateDistance(pos1: Position, pos2: Position): number {
  const R = 6371000; // Raio da Terra em metros
  const dLat = degreesToRadians(pos2.lat - pos1.lat);
  const dLng = degreesToRadians(pos2.lng - pos1.lng);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degreesToRadians(pos1.lat)) * Math.cos(degreesToRadians(pos2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calcula nova posição baseada em distância e direção
 */
function calculateNewPosition(
  position: Position,
  distance: number,
  bearing: number
): Position {
  const R = 6371000; // Raio da Terra em metros
  const lat1 = degreesToRadians(position.lat);
  const lng1 = degreesToRadians(position.lng);
  const bearingRad = degreesToRadians(bearing);
  
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(distance / R) +
    Math.cos(lat1) * Math.sin(distance / R) * Math.cos(bearingRad)
  );
  
  const lng2 = lng1 + Math.atan2(
    Math.sin(bearingRad) * Math.sin(distance / R) * Math.cos(lat1),
    Math.cos(distance / R) - Math.sin(lat1) * Math.sin(lat2)
  );
  
  return {
    lat: radiansToDegrees(lat2),
    lng: radiansToDegrees(lng2)
  };
}

/**
 * Gera número aleatório (Box-Muller)
 * ruido estocastico
 */
function randomNormal(mean: number = 0, stdDev: number = 1): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random(); // Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdDev + mean;
}

/**
 * Calcula o movimento de uma partícula por uma hora
 */
function moveParticle(
  particle: Particle,
  params: SimulationParams,
  timeStep: number
): Position {
  const { objectType, currentSpeed, currentDirection, windSpeed, windDirection } = params;
  
  // Componentes da corrente
  const currentU = currentSpeed * Math.sin(degreesToRadians(currentDirection));
  const currentV = currentSpeed * Math.cos(degreesToRadians(currentDirection));
  
  // Componentes do vento (com leeway)
  const windU = windSpeed * objectType.leeway * Math.sin(degreesToRadians(windDirection));
  const windV = windSpeed * objectType.leeway * Math.cos(degreesToRadians(windDirection));
  
  // soma vetorial dos dois
  const totalU = currentU + windU;
  const totalV = currentV + windV;
  
  // velocidade vetorial + ruido estocastico
  const noiseU = randomNormal(0, 0.1); // 0.1 m/s de desvio padrão
  const noiseV = randomNormal(0, 0.1);
  
  const finalU = totalU + noiseU;
  const finalV = totalV + noiseV;
  
  // Calcular direção e velocidade resultante, coordenada polar
  const speed = Math.sqrt(finalU * finalU + finalV * finalV);
  const direction = radiansToDegrees(Math.atan2(finalU, finalV));
  
  // Adicionar divergência angular, simula efeito da natureza
  const divergenceAngle = randomNormal(0, objectType.divergence);
  const finalDirection = (direction + divergenceAngle + 360) % 360;
  
  // Distância percorrida em 1 hora (3600 segundos)
  const distance = speed * 3600;
  
  return calculateNewPosition(particle.position, distance, finalDirection);
}

/**
 * Executa a simulação completa de deriva
 */
export function runDriftSimulation(params: SimulationParams): SimulationResult {

  // montecalor pra 100 particulas
  const numParticles = 100;
  const timeSteps = params.duration;
  
  // Inicializar partículas no LKP com pequena dispersão inicial
  const particles: Particle[] = [];
  for (let i = 0; i < numParticles; i++) {
    const initialOffset = randomNormal(0, 0.001); // ~100m de dispersão inicial, fazer constante para armazenar valor
    const initialBearing = Math.random() * 360;
    
    const initialPosition = calculateNewPosition(
      params.lkp,
      Math.abs(initialOffset) * 111000, // Converter graus para metros aproximadamente
      initialBearing
    );
    
    particles.push({
      id: i,
      position: initialPosition,
      history: [initialPosition]
    });
  }
  
  // movimento hora por hora
  for (let step = 0; step < timeSteps; step++) {
    particles.forEach(particle => {
      const newPosition = moveParticle(particle, params, step);
      particle.position = newPosition;
      particle.history.push(newPosition);
    });
  }
  
  // bounds da simulação
  let north = -90, south = 90, east = -180, west = 180;
  
  particles.forEach(particle => {
    particle.history.forEach(pos => {
      north = Math.max(north, pos.lat);
      south = Math.min(south, pos.lat);
      east = Math.max(east, pos.lng);
      west = Math.min(west, pos.lng);
    });
  });
  
  return {
    particles,
    timeSteps,
    bounds: { north, south, east, west }
  };
}

/**
 * Calcula o convex hull das partículas usando algoritmo de Graham Scan simplificado
 */
export function calculateConvexHull(positions: Position[]): Position[] {
  if (positions.length < 3) return positions;
  
  // Encontrar o ponto mais ao sul (menor latitude)
  let bottom = positions[0];
  for (let i = 1; i < positions.length; i++) {
    if (positions[i].lat < bottom.lat || 
        (positions[i].lat === bottom.lat && positions[i].lng < bottom.lng)) {
      bottom = positions[i];
    }
  }
  
  // Ordenar pontos por ângulo polar em relação ao ponto bottom
  const sortedPoints = positions
    .filter(p => p !== bottom)
    .sort((a, b) => {
      const angleA = Math.atan2(a.lat - bottom.lat, a.lng - bottom.lng);
      const angleB = Math.atan2(b.lat - bottom.lat, b.lng - bottom.lng);
      return angleA - angleB;
    });
  
  // Algoritmo de Graham Scan simplificado
  const hull = [bottom];
  
  for (const point of sortedPoints) {
    while (hull.length > 1) {
      const p1 = hull[hull.length - 2];
      const p2 = hull[hull.length - 1];
      
      // Produto cruzado para determinar orientação
      const cross = (p2.lng - p1.lng) * (point.lat - p1.lat) - 
                   (p2.lat - p1.lat) * (point.lng - p1.lng);
      
      if (cross <= 0) {
        hull.pop();
      } else {
        break;
      }
    }
    hull.push(point);
  }
  
  return hull;
}
