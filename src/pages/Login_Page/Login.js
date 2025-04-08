import React, { useState, useEffect } from 'react';
import { ChakraProvider, Box, Button, Flex, FormControl, FormLabel, Heading, Input, useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import anime from 'animejs';
import axios from 'axios';
import './Login.css';

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
    console.log('Login: handleSubmit called with email:', email, 'and password:', password);
    try {
      const url = `${process.env.REACT_APP_API_URL}/auth/login`;
      console.log('Login: Sending POST request to:', url);
      const response = await axios.post(url, { email, password });
      console.log('Login: Received response:', response);
      if (response.status === 200) {
        localStorage.setItem('token', response.data.token);
        console.log('Login: Token stored in localStorage:', response.data.token);
        toast({ title: 'Login Successful', status: 'success', duration: 2000, isClosable: true });
        navigate('/home', { replace: true });
        console.log('Login: Navigated to /home');
      } else {
        console.log('Login: Response status not 200:', response.status);
        toast({ title: 'Login Failed', description: 'Invalid credentials.', status: 'error', duration: 2000 });
      }
    } catch (error) {
      console.error('Login: Error during login request:', error);
      toast({
        title: 'An error occurred.',
        description: error.response?.data?.error || 'Please try again.',
        status: 'error',
        duration: 2000
      });
    }
  };

  // 📝 Handle Redirection to Register
  const handleRegisterRedirect = () => {
    console.log('Login: Redirecting to register');
    navigate('/register');
  };

  return (
    <ChakraProvider>
      <Flex position="relative" minH="100vh" align="center" justify="center" overflow="hidden">
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
          <video autoPlay loop muted playsInline className="absolute top-0 left-0 w-full h-full object-cover">
            <source src="/videos/Veep_v1.webm" type="video/webm" />
          </video>
          {/* 🖤 Dark Overlay */}
          <Box position="absolute" top="0" left="0" w="100%" h="100%" bg="rgba(0, 0, 0, 0.5)" />
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
          <Heading
            textAlign="center"
            mb={10}
            padding={4}
            color="white" // Change color to white
            fontSize="2xl"
            bgGradient="linear(to-r, green.300, teal.300)"
          >
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
              bgGradient={"linear(to-r, green.300, teal.300)"}
              size="lg"
              w="full"
              type="submit"
              padding={4}
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
              transition="all 0.3s"
            >
              Sign In
            </Button>
          </form>
        </Box>
      </Flex>
    </ChakraProvider>
  );
};

export default Login;
