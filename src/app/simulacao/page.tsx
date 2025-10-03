'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Text, Button } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import { SimulationParams } from '@/types/simulation';

// Importar DriftMap dinamicamente para evitar problemas de SSR com Leaflet
const DriftMap = dynamic(() => import('@/components/DriftMap'), {
  ssr: false,
  loading: () => (
    <Box h="100vh" display="flex" alignItems="center" justifyContent="center">
      <Box>
        <Text fontSize="xl">Carregando mapa...</Text>
      </Box>
    </Box>
  ),
});

export default function SimulacaoPage() {
  const [params, setParams] = useState<SimulationParams | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedParams = localStorage.getItem('simulationParams');
      if (!storedParams) {
        setError('Parâmetros de simulação não encontrados. Redirecionando...');
        setTimeout(() => router.push('/'), 2000);
        return;
      }

      const parsedParams = JSON.parse(storedParams);
      
      // Converter string de data de volta para objeto Date
      if (parsedParams.startTime) {
        parsedParams.startTime = new Date(parsedParams.startTime);
      }
      
      setParams(parsedParams);
    } catch {
      setError('Erro ao carregar parâmetros de simulação. Redirecionando...');
      setTimeout(() => router.push('/'), 2000);
    }
  }, [router]);

  const handleBackToForm = () => {
    router.push('/');
  };

  if (error) {
    return (
      <Box h="100vh" display="flex" alignItems="center" justifyContent="center" p={4}>
        <Box maxW="400px" textAlign="center">
          <Text color="red.500" fontSize="lg">❌ {error}</Text>
          <Button onClick={handleBackToForm} colorScheme="blue" mt={4}>
            Voltar ao Formulário
          </Button>
        </Box>
      </Box>
    );
  }

  if (!params) {
    return (
      <Box h="100vh" display="flex" alignItems="center" justifyContent="center">
        <Box>
          <Text fontSize="xl">Carregando simulação...</Text>
        </Box>
      </Box>
    );
  }

  return <DriftMap params={params} />;
}
