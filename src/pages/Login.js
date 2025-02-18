import React, { useState, useEffect } from 'react';
import { ChakraProvider, Box, Button, Flex, FormControl, FormLabel, Heading, Input, useToast, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import anime from 'animejs';
import axios from 'axios';
import './Login.css'; // Optional: Your custom CSS styles
import vfLogo from './vf.jpeg'; // Optional: Your logo

import ReactDOM from 'react-dom';




const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const toast = useToast();

  // 🌀 Anime.js Animation on Load
  useEffect(() => {
    const animateShapes = () => {
      anime({
        targets: '.shape',
        translateX: () => anime.random(-500, 500),
        translateY: () => anime.random(-300, 300),
        rotate: () => anime.random(0, 360),
        scale: () => anime.random(0.2, 1.5),
        duration: 2000,
        easing: 'easeInOutQuad',
        direction: 'alternate',
        loop: true,
      });
    };
    animateShapes();
  }, []);

  // 🗝️ Handle Form Submission with Axios
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, { email, password });
      if (response.status === 200) {
        localStorage.setItem('token', response.data.token);
        toast({ title: 'Login Successful', status: 'success', duration: 2000, isClosable: true });
        navigate('/home', { replace: true });
      } else {
        toast({ title: 'Login Failed', description: 'Invalid credentials.', status: 'error', duration: 2000 });
      }
    } catch (error) {
      toast({ title: 'An error occurred.', description: error.response?.data?.message || 'Please try again.', status: 'error', duration: 2000 });
    }
  };

  // 📝 Handle Redirection to Register
  const handleRegisterRedirect = () => {
    navigate('/register');
  };

  return (
    <ChakraProvider>
      <Flex
        position="relative"
        minH="100vh"
        align="center"
        justify="center"
        overflow="hidden"
      >
        {/* 🎥 YouTube Video Background */}
        <Box
          position="fixed"
          top="50%"
          left="50%"
          minW="100%"
          minH="100%"
          w="auto"
          h="auto"
          transform="translate(-50%, -50%)"
          zIndex="-2"
        >
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/W4L9MCcBXrU?autoplay=1&mute=1&loop=1&controls=0&rel=0&playlist=W4L9MCcBXrU"
            title="Background Video"
            frameBorder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          ></iframe>
          {/* 🖤 Dark Overlay */}
          <Box
            position="absolute"
            top="0"
            left="0"
            w="100%"
            h="100%"
            bg="rgba(0, 0, 0, 0.5)"
          />
        </Box>

        {/* 🌀 Animated Shapes */}
        <div className="shape"></div>
        <div className="shape"></div>
        <div className="shape"></div>

        {/* 📌 Login Form */}
        <Box
          bg="rgba(255, 255, 255, 0.9)"
          color="gray.800"
          p={8}
          borderRadius="xl"
          boxShadow="2xl"
          maxW="md"
          w="full"
          zIndex="2"
        >
          {/* 🔵 Optional Logo */}
          {vfLogo && (
            <Flex justify="center" mb={4}>
              <img src={vfLogo} alt="Logo" width="80" />
            </Flex>
          )}

          <Heading textAlign="center" mb={6} fontSize="2xl">
            Welcome Back
          </Heading>

          <form onSubmit={handleSubmit}>
            <FormControl mb={4} isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormControl>

            <FormControl mb={6} isRequired>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormControl>

            <Button
              colorScheme="blue"
              size="lg"
              w="full"
              type="submit"
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
              transition="all 0.3s"
            >
              Sign In
            </Button>
          </form>

          <Text mt={4} textAlign="center">
            Don&apos;t have an account?{' '}
            <Button variant="link" colorScheme="blue" onClick={handleRegisterRedirect}>
              Register
            </Button>
          </Text>
        </Box>
      </Flex>
    </ChakraProvider>
  );
};

export default Login;
