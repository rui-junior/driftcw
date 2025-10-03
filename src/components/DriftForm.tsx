"use client";

import { Box, Button, Input, Flex, Heading, Text } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/toast";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { SimulationParams, OBJECT_TYPES } from "@/types/simulation";

export default function DriftForm() {
  const router = useRouter();
  const toast = useToast();

  const [formData, setFormData] = useState({
    latitude: "",
    longitude: "",
    startTime: "",
    objectType: "person",
    currentSpeed: 0.5,
    currentDirection: 0,
    windSpeed: 5,
    windDirection: 270,
    duration: 24,
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validação
    if (!formData.latitude || !formData.longitude || !formData.startTime) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsLoading(false);
      return;
    }

    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);

    if (
      isNaN(lat) ||
      isNaN(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      toast({
        title: "Coordenadas inválidas",
        description:
          "Por favor, insira coordenadas válidas (lat: -90 a 90, lng: -180 a 180).",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsLoading(false);
      return;
    }

    const objectType = OBJECT_TYPES.find(
      (type) => type.id === formData.objectType
    );
    if (!objectType) {
      toast({
        title: "Tipo de objeto inválido",
        description: "Por favor, selecione um tipo de objeto válido.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsLoading(false);
      return;
    }

    const simulationParams: SimulationParams = {
      lkp: { lat, lng },
      startTime: new Date(formData.startTime),
      objectType,
      currentSpeed: formData.currentSpeed,
      currentDirection: formData.currentDirection,
      windSpeed: formData.windSpeed,
      windDirection: formData.windDirection,
      duration: formData.duration,
    };

    // Armazenar parâmetros no localStorage para a página de simulação
    localStorage.setItem("simulationParams", JSON.stringify(simulationParams));

    toast({
      title: "Simulação iniciada",
      description: "Redirecionando para a visualização...",
      status: "success",
      duration: 2000,
      isClosable: true,
    });

    setTimeout(() => {
      router.push("/simulacao");
    }, 1000);
  };

  return (
    <Flex
      w={["800px"]}
      h={["100%"]}
      justifyContent={"center"}
      position={"relative"}
      direction={'column'}

    >
      <Flex w={"100%"} justifyContent={"center"} color="blue.700">
        <Heading size="2xl">
        Simulação de Deriva Marítima
          
        </Heading>
      </Flex>

      <form onSubmit={handleSubmit}>
        <Box>
          {/* Posição Inicial */}
          <Box w="full" p={6} bg="white" borderRadius="lg" shadow="sm" mb={6}>
            <Heading size="md" mb={4} color="blue.600">
              Last Known Position (LKP)
            </Heading>
            <Flex gap={4}>
              <Box flex={1}>
                <Text mb={2} fontWeight="bold">
                  Latitude *
                </Text>
                <Input
                  type="number"
                  step="any"
                  placeholder="-23.5505"
                  value={formData.latitude}
                  onChange={(e) =>
                    setFormData({ ...formData, latitude: e.target.value })
                  }
                  required
                />
              </Box>
              <Box flex={1}>
                <Text mb={2} fontWeight="bold">
                  Longitude *
                </Text>
                <Input
                  type="number"
                  step="any"
                  placeholder="-46.6333"
                  value={formData.longitude}
                  onChange={(e) =>
                    setFormData({ ...formData, longitude: e.target.value })
                  }
                  required
                />
              </Box>
            </Flex>
          </Box>

          {/* Tempo e Objeto */}
          <Box w="full" p={6} bg="white" borderRadius="lg" shadow="sm" mb={6}>
            <Heading size="md" mb={4} color="blue.600">
              Data/Hora e Objeto
            </Heading>
            <Box>
              <Box w="full" mb={4}>
                <Text mb={2} fontWeight="bold">
                  Horário Inicial *
                </Text>
                <Input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  required
                />
              </Box>

              <Flex gap={4} w="full">
                <Box flex={1}>
                  <Text mb={2} fontWeight="bold">
                    Tipo de Objeto *
                  </Text>
                  <select
                    value={formData.objectType}
                    onChange={(e) =>
                      setFormData({ ...formData, objectType: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      fontSize: "16px",
                    }}
                  >
                    {OBJECT_TYPES.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </Box>

                <Box flex={1}>
                  <Text mb={2} fontWeight="bold">
                    Duração (horas)
                  </Text>
                  <Input
                    type="number"
                    min={1}
                    max={72}
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration: parseInt(e.target.value) || 24,
                      })
                    }
                  />
                </Box>
              </Flex>
            </Box>
          </Box>

          {/* Corrente Marítima */}
          <Box w="full" p={6} bg="white" borderRadius="lg" shadow="sm" mb={6}>
            <Heading size="md" mb={4} color="blue.600">
              Corrente Marítima
            </Heading>
            <Flex gap={4}>
              <Box flex={1}>
                <Text mb={2} fontWeight="bold">
                  Velocidade (m/s)
                </Text>
                <Input
                  type="number"
                  min={0}
                  max={5}
                  step={0.1}
                  value={formData.currentSpeed}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      currentSpeed: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </Box>

              <Box flex={1}>
                <Text mb={2} fontWeight="bold">
                  Direção (graus)
                </Text>
                <Input
                  type="number"
                  min={0}
                  max={360}
                  value={formData.currentDirection}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      currentDirection: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </Box>
            </Flex>
          </Box>

          {/* Vento */}
          <Box w="full" p={6} bg="white" borderRadius="lg" shadow="sm" mb={6}>
            <Heading size="md" mb={4} color="gray.600">
              Vento
            </Heading>
            <Flex gap={4}>
              <Box flex={1}>
                <Text mb={2} fontWeight="bold">
                  Velocidade (m/s)
                </Text>
                <Input
                  type="number"
                  min={0}
                  max={30}
                  step={0.5}
                  value={formData.windSpeed}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      windSpeed: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </Box>

              <Box flex={1}>
                <Text mb={2} fontWeight="bold">
                  Direção (graus)
                </Text>
                <Input
                  type="number"
                  min={0}
                  max={360}
                  value={formData.windDirection}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      windDirection: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </Box>
            </Flex>
          </Box>

          {/* <Box h="1px" bg="gray.200" w="full" /> */}

          <Flex my={10}>
            <Button
              type="submit"
              size="lg"
              colorScheme="blue"
              loading={isLoading}
              w="full"
              // py={6}
              disabled={isLoading}
            >
              Calcular Deriva
            </Button>
          </Flex>
        </Box>
      </form>
    </Flex>
  );
}
