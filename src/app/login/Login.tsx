"use client";

import { Flex, Image } from "@chakra-ui/react";

export default function Login() {

  return (
    <Flex
      direction="column"
      justify="center"
      align="center"
      minH="100vh"
      bg="white"
      p={4}
    >
      <Image src="/salvaero_logo.jpeg" width="450px" mb={8} />

      {/* <Flex
        direction="column"
        bg="white"
        p={8}
        // borderRadius="xl"
        // boxShadow="lg"
        gap={4}
        align="center"
        w={["100%", "400px"]}
      >
        <Text fontSize="2xl" fontWeight="bold" textAlign="center">
          Redirecionando... 🚀
        </Text>

      </Flex> */}
    </Flex>
  );
}