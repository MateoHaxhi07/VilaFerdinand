import React from 'react';
import { Box, Button, HStack, Flex } from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import vfLogo from './vf.jpeg'; // Import the image

const MotionText = motion(Box);

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Box
      className="header-outer"
      bgGradient="linear(to-r, green.600, teal.400)"
      boxShadow="lg"
      py={3}
      px={5}
      position="sticky"
      top={0}
      zIndex={1000}
    >
      <Flex align="center" justify="space-between">
        {/* Left Section - Logo and Animated Title */}
        <HStack spacing={4}>
          <img src={vfLogo} alt="Logo" style={{ height: '50px', borderRadius: '50%' }} />
          
          {/* Animated Vila Ferdinand Text */}
          <MotionText
  fontSize="xl"
  fontWeight="bold"
  color="white"
  initial={{ opacity: 0, x: -50 }}
  animate={{ opacity: [1, 0], x: [0, 50] }}
  transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
>
  Vila Ferdinand
</MotionText>
        </HStack>

        {/* Middle Section - Navigation Links */}
        <HStack spacing={6}>
          <Button as={Link} to="/home" variant="ghost" color="white" _hover={{ bg: 'teal.700' }}>
            HOME
          </Button>
          <Button as={Link} to="/dashboard" variant="ghost" color="white" _hover={{ bg: 'teal.700' }}>
            SHITJET ANALITKE
          </Button>
          <Button as={Link} to="/most-sold-items-by-price" variant="ghost" color="white" _hover={{ bg: 'teal.700' }}>
            SHITJET RENDITURA
          </Button>
          <Button as={Link} to="/daily-expenses" variant="ghost" color="white" _hover={{ bg: 'teal.700' }}>
            XHIRO DITORE
          </Button>
          <Button as={Link} to="/supplier" variant="ghost" color="white" _hover={{ bg: 'teal.700' }}>
            FURNITOR
          </Button>
          <Button as={Link} to="/article-ingredients" variant="ghost" color="white" _hover={{ bg: 'teal.700' }}>
            RECETA
          </Button>
          <Button as={Link} to="/usage" variant="ghost" color="white" _hover={{ bg: 'teal.700' }}>
            MALLI SHITUR
          </Button>
          <Button as={Link} to="/missing-articles" variant="ghost" color="white" _hover={{ bg: 'teal.700' }}>
            RECETA MUNGOJN
          </Button>
        </HStack>

        {/* Right Section - Logout */}
        <Button
          onClick={handleLogout}
          colorScheme="red"
          variant="solid"
          _hover={{ bg: 'red.600' }}
        >
          Logout
        </Button>
      </Flex>
    </Box>
  );
};

export default Header;
