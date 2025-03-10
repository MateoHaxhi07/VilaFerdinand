import React from 'react';
import {
  Box,
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import vfLogo from './vf.jpeg'; // Your logo

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
      <Flex
        direction={{ base: 'column', md: 'row' }}
        align="center"
        justify="space-between"
      >
        {/* Left Section - Logo */}
        <Flex align="center" mb={{ base: 4, md: 0 }}>
          <img
            src={vfLogo}
            alt="Logo"
            style={{
              height: '50px',
              borderRadius: '50%',
              marginRight: '8px',
            }}
          />
        </Flex>

        {/* Middle Section - Navigation Links */}
        <Flex
          direction={{ base: 'column', md: 'row' }}
          align="center"
          justify="center"
          wrap="wrap"
          mb={{ base: 4, md: 0 }}
          w={{ base: '100%', md: 'auto' }}
        >
          {/* HOME */}
          <Button
            as={Link}
            to="/home"
            variant="ghost"
            color="white"
            _hover={{ bg: 'teal.700' }}
            w={{ base: '100%', md: 'auto' }}
            m={1}
          >
            HOME
          </Button>

          {/* NEW MENU for SHITJET */}
          <Menu>
            <MenuButton
              as={Button}
              variant="ghost"
              color="white"
              _hover={{ bg: 'teal.700' }}
              w={{ base: '100%', md: 'auto' }}
              m={1}
            >
              SHITJET
            </MenuButton>
            <MenuList>
              <MenuItem as={Link} to="/dashboard">
                SHITJET ANALITIKE
              </MenuItem>
              <MenuItem as={Link} to="/most-sold-items-by-price">
                SHITJET RENDITURA
              </MenuItem>
            </MenuList>
          </Menu>

          {/* Other Buttons */}
          <Button
            as={Link}
            to="/daily-expenses"
            variant="ghost"
            color="white"
            _hover={{ bg: 'teal.700' }}
            w={{ base: '100%', md: 'auto' }}
            m={1}
          >
            XHIRO DITORE
          </Button>
          <Button
            as={Link}
            to="/supplier"
            variant="ghost"
            color="white"
            _hover={{ bg: 'teal.700' }}
            w={{ base: '100%', md: 'auto' }}
            m={1}
          >
            FURNITOR
          </Button>
          <Button
            as={Link}
            to="/usage"
            variant="ghost"
            color="white"
            _hover={{ bg: 'teal.700' }}
            w={{ base: '100%', md: 'auto' }}
            m={1}
          >
            MALLI SHITUR
          </Button>
          <Button
            as={Link}
            to="/article-ingredients"
            variant="ghost"
            color="white"
            _hover={{ bg: 'teal.700' }}
            w={{ base: '100%', md: 'auto' }}
            m={1}
          >
            RECETA
          </Button>
          <Button
            as={Link}
            to="/missing-articles"
            variant="ghost"
            color="white"
            _hover={{ bg: 'teal.700' }}
            w={{ base: '100%', md: 'auto' }}
            m={1}
          >
            RECETA MUNGOJN
          </Button>
          <Button
            as={Link}
            to="/inventory"
            variant="ghost"
            color="white"
            _hover={{ bg: 'teal.700' }}
            w={{ base: '100%', md: 'auto' }}
            m={1}
          >
            INVENTORY
          </Button>
        </Flex>

        {/* Right Section - Logout */}
        <Button
          onClick={handleLogout}
          colorScheme="red"
          variant="solid"
          _hover={{ bg: 'red.600' }}
          w={{ base: '100%', md: 'auto' }}
        >
          Logout
        </Button>
      </Flex>
    </Box>
  );
};

export default Header;
