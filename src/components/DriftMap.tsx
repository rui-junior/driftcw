'use client';

import { useEffect, useState, useRef } from 'react';
import {
  Box,
  Button,
  Text,
  Heading,
  Flex,
} from '@chakra-ui/react';
import { useToast } from '@chakra-ui/toast';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import { SimulationParams, SimulationResult, Position } from '@/types/simulation';
import { runDriftSimulation, calculateConvexHull } from '@/lib/simulation';

import 'leaflet/dist/leaflet.css';

// Fix para ícones do Leaflet no Next.js
import L from 'leaflet';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface DriftMapProps {
  params: SimulationParams;
}

export default function DriftMap({ params }: DriftMapProps) {
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [currentTimeStep, setCurrentTimeStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const toast = useToast();

  // Executar simulação ao montar o componente
  useEffect(() => {
    const runSimulation = async () => {
      setIsLoading(true);
      try {
        const result = runDriftSimulation(params);
        setSimulationResult(result);
        toast({
          title: 'Simulação concluída',
          description: `${result.particles.length} partículas simuladas por ${result.timeSteps} horas`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: 'Erro na simulação',
          description: 'Ocorreu um erro ao executar a simulação.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    runSimulation();
  }, [params, toast]);

  // Controlar animação
  useEffect(() => {
    if (isPlaying && simulationResult) {
      intervalRef.current = setInterval(() => {
        setCurrentTimeStep((prev) => {
          if (prev >= simulationResult.timeSteps) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000); // 1 segundo por hora simulada
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, simulationResult]);

  const handlePlay = () => {
    if (currentTimeStep >= (simulationResult?.timeSteps || 0)) {
      setCurrentTimeStep(0);
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentTimeStep(0);
  };

  const handleRestart = () => {
    setCurrentTimeStep(0);
    setIsPlaying(false);
  };

  const exportImage = () => {
    toast({
      title: 'Exportar imagem',
      description: 'Funcionalidade de exportação será implementada em versão futura.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  if (isLoading) {
    return (
      <Box p={6} textAlign="center">
        <Box>
          <Heading size="lg" mb={4}>Executando simulação...</Heading>
          <Box w="300px" h="4px" bg="gray.200" borderRadius="2px" mb={4}>
            <Box w="100%" h="100%" bg="blue.500" borderRadius="2px" />
          </Box>
          <Text color="gray.600">Calculando deriva de partículas</Text>
        </Box>
      </Box>
    );
  }

  if (!simulationResult) {
    return (
      <Box p={6} textAlign="center">
        <Text color="red.500">Erro ao carregar simulação</Text>
      </Box>
    );
  }

  // Calcular posições atuais das partículas
  const currentParticlePositions: Position[] = simulationResult.particles.map(particle => {
    const historyIndex = Math.min(currentTimeStep, particle.history.length - 1);
    return particle.history[historyIndex];
  });

  // Calcular convex hull das posições atuais
  const convexHull = calculateConvexHull(currentParticlePositions);

  // Converter para formato do Leaflet
  const center: LatLngExpression = [params.lkp.lat, params.lkp.lng];
  const particleCircles = currentParticlePositions.map((pos, index) => ({
    center: [pos.lat, pos.lng] as LatLngExpression,
    key: index,
  }));

  const hullPolygon: LatLngExpression[] = convexHull.map(pos => [pos.lat, pos.lng]);

  const progress = simulationResult.timeSteps > 0 ? (currentTimeStep / simulationResult.timeSteps) * 100 : 0;
  const currentTime = new Date(params.startTime.getTime() + currentTimeStep * 60 * 60 * 1000);

  return (
    <Box h="100vh" w="100%">
      {/* Controles */}
      <Box position="absolute" top={4} left={4} zIndex={1000} minW="300px" bg="white" p={4} borderRadius="lg" shadow="lg">
        <Box>
          <Heading size="md" color="blue.600" mb={4}>
            🌊 Simulação de Deriva
          </Heading>
          
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontSize="sm" fontWeight="bold" color="blue.600">
              {params.objectType.name}
            </Text>
            <Text fontSize="sm" color="gray.600">
              {simulationResult.particles.length} partículas
            </Text>
          </Flex>

          <Box mb={4}>
            <Text fontSize="sm" mb={2}>
              Tempo: {currentTime.toLocaleString('pt-BR')} 
              <Text as="span" ml={2} color="green.600" fontWeight="bold">
                +{currentTimeStep}h
              </Text>
            </Text>
            <Box w="100%" h="2px" bg="gray.200" borderRadius="1px">
              <Box w={`${progress}%`} h="100%" bg="blue.500" borderRadius="1px" />
            </Box>
          </Box>

          <Flex gap={2} mb={4}>
            <Button
              size="sm"
              onClick={handlePlay}
              disabled={isPlaying || currentTimeStep >= simulationResult.timeSteps}
              colorScheme="green"
            >
              ▶️ Play
            </Button>
            <Button
              size="sm"
              onClick={handlePause}
              disabled={!isPlaying}
              colorScheme="yellow"
            >
              ⏸️ Pause
            </Button>
            <Button
              size="sm"
              onClick={handleStop}
              colorScheme="red"
            >
              ⏹️ Stop
            </Button>
            <Button
              size="sm"
              onClick={handleRestart}
              colorScheme="blue"
            >
              🔄 Reset
            </Button>
          </Flex>

          <Button
            size="sm"
            onClick={exportImage}
            variant="outline"
            colorScheme="gray"
          >
            💾 Exportar PNG
          </Button>
        </Box>
      </Box>

      {/* Informações da simulação */}
      <Box position="absolute" top={4} right={4} zIndex={1000} minW="250px" bg="white" p={4} borderRadius="lg" shadow="lg">
        <Box fontSize="sm">
          <Heading size="sm" color="blue.600" mb={2}>📊 Parâmetros</Heading>
          <Text mb={1}><strong>LKP:</strong> {params.lkp.lat.toFixed(4)}, {params.lkp.lng.toFixed(4)}</Text>
          <Text mb={1}><strong>Corrente:</strong> {params.currentSpeed} m/s @ {params.currentDirection}°</Text>
          <Text mb={1}><strong>Vento:</strong> {params.windSpeed} m/s @ {params.windDirection}°</Text>
          <Text mb={1}><strong>Leeway:</strong> {(params.objectType.leeway * 100).toFixed(1)}%</Text>
          <Text><strong>Duração:</strong> {params.duration}h</Text>
        </Box>
      </Box>

      {/* Mapa */}
      <MapContainer
        center={center}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Marcador LKP */}
        <Marker position={center}>
          <Popup>
            <div>
              <strong>Last Known Position</strong><br />
              Lat: {params.lkp.lat.toFixed(4)}<br />
              Lng: {params.lkp.lng.toFixed(4)}<br />
              Início: {params.startTime.toLocaleString('pt-BR')}
            </div>
          </Popup>
        </Marker>

        {/* Partículas */}
        {particleCircles.map((circle) => (
          <Circle
            key={circle.key}
            center={circle.center}
            radius={200}
            pathOptions={{
              color: 'red',
              fillColor: 'red',
              fillOpacity: 0.6,
              weight: 1,
            }}
          />
        ))}

        {/* Convex Hull */}
        {hullPolygon.length > 2 && (
          <Polygon
            positions={hullPolygon}
            pathOptions={{
              color: 'blue',
              fillColor: 'blue',
              fillOpacity: 0.1,
              weight: 2,
              dashArray: '5, 5',
            }}
          />
        )}
      </MapContainer>
    </Box>
  );
}
