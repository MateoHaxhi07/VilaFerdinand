// src/components/Sidebar/Sidebar.js
import React, { useState } from 'react';
import {
  Box,
  Text,
  Button,
  Link as ChakraLink,
  Flex
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { 
  MdLocalGroceryStore, 
  MdHome, 
  MdShowChart, 
  MdRestaurantMenu,
  MdInventory,
  MdFileCopy
} from 'react-icons/md';

export default function Sidebar({ isOpen, onClose, variant }) {
  // States for collapsible menus
  const [isShitjetOpen, setIsShitjetOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isRaporteOpen, setIsRaporteOpen] = useState(false);
  const [isRecetaOpen, setIsRecetaOpen] = useState(false);
  const [isRaporteDitoreOpen, setIsRaporteDitoreOpen] = useState(false);

  // For mobile (drawer variant), only render if open; on desktop, always render.
  const displaySidebar = variant === 'drawer' && !isOpen ? 'none' : 'block';

  return (
    <Box
      position="fixed"
      left="0"
      top="60px" // below the 60px header
      w="200px"
      height="calc(100% - 60px)"
      bg="gray.700"
      color="white"
      p={4}
      zIndex="1200"
      transform={isOpen ? 'translateX(0)' : 'translateX(-100%)'}
      transition="transform 0.3s ease"
      display={displaySidebar}
    >
      {/* Close button for mobile drawer */}
      {variant === 'drawer' && (
        <Button onClick={onClose} mb={4} size="sm">
          Close
        </Button>
      )}

      {/* Home Page Link with Home Icon */}
      <Flex mb={4} align="center">
        <MdHome style={{ marginRight: '8px' }} />
        <ChakraLink
          as={Link}
          to="/home"
          fontSize="lg"
          fontWeight="semibold"
          _hover={{ textDecoration: 'underline', color: 'teal.200' }}
        >
             Home 
        </ChakraLink>
      </Flex>

      {/* Shitjet Folder */}
      <Box mb={3}>
        <Flex
          align="center"
          cursor="pointer"
          onClick={() => setIsShitjetOpen(!isShitjetOpen)}
          p={2}
          borderRadius="md"
          _hover={{ bg: 'gray.600' }}
        >
          <MdLocalGroceryStore style={{ marginRight: '8px' }} />
          <Text fontWeight="semibold" fontSize="lg" flex="1">
            Shitjet
          </Text>
          {isShitjetOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </Flex>
        {isShitjetOpen && (
          <Box pl={6} mt={2}>
            <Box mb={2}>
              <ChakraLink
                as={Link}
                to="/most-sold-items-by-price"
                fontSize="md"
                _hover={{ textDecoration: 'underline', color: 'teal.200' }}
              >
                Shitjet Renditura
              </ChakraLink>
            </Box>
            <Box>
              <ChakraLink
                as={Link}
                to="/dashboard"
                fontSize="md"
                _hover={{ textDecoration: 'underline', color: 'teal.200' }}
              >
                Shitjet Analitike
              </ChakraLink>
            </Box>
          </Box>
        )}
      </Box>


        {/* Raporte Ditore Folder */}
        <Box mb={3}>
        <Flex
          align="center"
          cursor="pointer"
          onClick={() => setIsRaporteDitoreOpen(!isRaporteDitoreOpen)}
          p={2}
          borderRadius="md"
          _hover={{ bg: 'gray.600' }}
        >
          <MdFileCopy style={{ marginRight: '8px' }} />
          <Text fontWeight="semibold" fontSize="lg" flex="1">
            Raporte Ditore
          </Text>
          {isRaporteDitoreOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </Flex>
        {isRaporteDitoreOpen && (
          <Box pl={6} mt={2}>
            <Box mb={2}>
              <ChakraLink
                as={Link}
                to="/daily-expenses"
                fontSize="md"
                _hover={{ textDecoration: 'underline', color: 'teal.200' }}
              >
                Xhiro Ditore
              </ChakraLink>
            </Box>
            <Box>
              <ChakraLink
                as={Link}
                to="/supplier"
                fontSize="md"
                _hover={{ textDecoration: 'underline', color: 'teal.200' }}
              >
                Furnitor
              </ChakraLink>
            </Box>
          </Box>
        )}
      </Box>

      {/* Inventory Folder with New Icon */}
      <Box mb={3}>
        <Flex
          align="center"
          cursor="pointer"
          onClick={() => setIsInventoryOpen(!isInventoryOpen)}
          p={2}
          borderRadius="md"
          _hover={{ bg: 'gray.600' }}
        >
          <MdInventory style={{ marginRight: '8px' }} />
          <Text fontWeight="semibold" fontSize="lg" flex="1">
            Inventory
          </Text>
          {isInventoryOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </Flex>
        {isInventoryOpen && (
          <Box pl={6} mt={2}>
            <ChakraLink
              as={Link}
              to="/inventory"
              fontSize="md"
              _hover={{ textDecoration: 'underline', color: 'teal.200' }}
            >
              Inventory
            </ChakraLink>
          </Box>
        )}
      </Box>

      {/* New Raporte Folder for Usage.js (Malli Shitur) with Graph Icon */}
      <Box mb={3}>
        <Flex
          align="center"
          cursor="pointer"
          onClick={() => setIsRaporteOpen(!isRaporteOpen)}
          p={2}
          borderRadius="md"
          _hover={{ bg: 'gray.600' }}
        >
          <MdShowChart style={{ marginRight: '8px' }} />
          <Text fontWeight="semibold" fontSize="lg" flex="1">
            Raporte
          </Text>
          {isRaporteOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </Flex>
        {isRaporteOpen && (
          <Box pl={6} mt={2}>
            <ChakraLink
              as={Link}
              to="/usage"
              fontSize="md"
              _hover={{ textDecoration: 'underline', color: 'teal.200' }}
            >
              Malli Shitur
            </ChakraLink>
          </Box>
        )}
      </Box>

      {/* Receta Folder with Recipe Icon */}
      <Box mb={3}>
        <Flex
          align="center"
          cursor="pointer"
          onClick={() => setIsRecetaOpen(!isRecetaOpen)}
          p={2}
          borderRadius="md"
          _hover={{ bg: 'gray.600' }}
        >
          <MdRestaurantMenu style={{ marginRight: '8px' }} />
          <Text fontWeight="semibold" fontSize="lg" flex="1">
            Receta
          </Text>
          {isRecetaOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </Flex>
        {isRecetaOpen && (
          <Box pl={6} mt={2}>
            <Box mb={2}>
              <ChakraLink
                as={Link}
                to="/article-ingredients"
                fontSize="md"
                _hover={{ textDecoration: 'underline', color: 'teal.200' }}
              >
                Receta
              </ChakraLink>
            </Box>
            <Box>
              <ChakraLink
                as={Link}
                to="/missing-articles"
                fontSize="md"
                _hover={{ textDecoration: 'underline', color: 'teal.200' }}
              >
                Receta Mungojn
              </ChakraLink>
            </Box>
          </Box>
        )}
      </Box>

    
    </Box>
  );
}
