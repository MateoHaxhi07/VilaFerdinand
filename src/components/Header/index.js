import React from 'react';
import { Box, Button, HStack } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import './Header.css'; // Import the CSS file
import vfLogo from './vf.jpeg'; // Import the image

const Header = () => {
  return (
    <Box className="header-outer">
      <Box className="header-inner responsive-wrapper">
        <Box className="header-logo">
          <img src={vfLogo} alt="Logo" />
        </Box>
        <HStack spacing={4} className="header-navigation">
          <Button as={Link} to="/home" variant="ghost" color="white">
            HOME
          </Button>
          <Button as={Link} to="/dashboard" variant="ghost" color="white">
            SHITJET ANALITKE
          </Button>
          <Button as={Link} to="/most-sold-items-by-price" variant="ghost" color="white">
            SHITJET RENDITURA 
          </Button>
          <Button as={Link} to="/daily-expenses" variant="ghost" color="white">
            XHIRO DITORE
          </Button>
          <Button as={Link} to="/supplier" variant="ghost" color="white">
            FURNITOR 
          </Button>
          <Button as={Link} to="/article-ingredients" variant="ghost" color="white">
            RECETA
          </Button>
          <Button as={Link} to="/usage" variant="ghost" color="white">
            MALLI SHITUR
          </Button>
          <Button as={Link} to="/missing-articles" variant="ghost" color="white">
            RECETA MUNGOJN
          </Button>
        </HStack>
      </Box>
    </Box>
  );
};

export default Header;