import React, { useState, useEffect } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import ReactDOM from 'react-dom';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  useToast,
} from '@chakra-ui/react';
import anime from 'animejs';
import axios from 'axios';
import './Login.css'; // Import the CSS file for additional styles
import vfLogo from './vf.jpeg'; // Import your logo image

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    // Anime.js animation
    const animateShapes = () => {
      anime({
        targets: '.shape',
        translateX: () => anime.random(-500, 500),
        translateY: () => anime.random(-300, 300),
        rotate: () => anime.random(0, 360),
        scale: () => anime.random(0.2, 1.5),
        duration: 800,
        easing: 'easeInOutQuad',
        complete: animateShapes,
      });
    };
    animateShapes();
  }, []);

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

  return (
    <Flex
      className="login-container"
      height="100vh"
      align="center"
      justify="center"
      position="relative"
      overflow="hidden"
    >
      <Box className="animated-background" position="absolute" width="100%" height="100%" zIndex={0}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Box key={index} className="shape square" />
        ))}
        {Array.from({ length: 5 }).map((_, index) => (
          <Box key={index} className="shape circle" />
        ))}
        {Array.from({ length: 5 }).map((_, index) => (
          <Box key={index} className="shape triangle" />
        ))}
      </Box>

      <Box
        p={8}
        maxWidth="400px"
        borderWidth={1}
        borderRadius={8}
        boxShadow="lg"
        bg="white"
        zIndex={1}
      >
        <Box textAlign="center" mb={4}>
          <img src={vfLogo} alt="Vila Ferdinand Logo" style={{ height: '50px', marginBottom: '20px' }} />
          <Heading>Login</Heading>
        </Box>
        <Box>
          <form onSubmit={handleSubmit}>
            <FormControl isRequired mb={4}>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormControl>
            <FormControl isRequired mb={4}>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormControl>
            <Button width="full" mt={4} type="submit" colorScheme="teal">
              Login
            </Button>
          </form>
        </Box>
      </Box>
    </Flex>
  );
};

export default Login;
