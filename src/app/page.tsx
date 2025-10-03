"use client";

import DriftForm from "@/components/DriftForm";
import { Flex } from "@chakra-ui/react";
import Login from "./login/Login";
import { useState, useEffect } from "react";

export default function Home() {
  const [showLogin, setShowLogin] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLogin(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Flex
        minH="100vh"
        w="100%"
        overflowY="auto"
        overflowX="hidden"
        direction="row"
        justifyContent="center"
        alignItems="flex-start"
        py={5}
      >
        {showLogin ? <Login /> : <DriftForm />}
      </Flex>
    </>
  );
}
