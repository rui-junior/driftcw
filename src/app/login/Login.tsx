"use client";

import { Flex, Image, Button, Text } from "@chakra-ui/react";
import { auth } from "../../../firebase/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useState, useEffect } from "react"; // 👈 Import useEffect
import { useRouter } from "next/navigation"; // 👈 Import useRouter

export default function Login() {
  const router = useRouter(); // 👈 Initialize useRouter
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


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