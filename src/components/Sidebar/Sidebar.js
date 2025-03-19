// src/components/Sidebar/Sidebar.js
import React, { useState } from 'react';
import {
  Box,
  Flex,
  Text,
  Link as ChakraLink,
  Button,
  Icon,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import {
  MdLocalGroceryStore,
  MdHome,
  MdShowChart,
  MdRestaurantMenu,
  MdInventory,
  MdFileCopy,
} from 'react-icons/md';

export default function Sidebar({ isOpen, onClose, variant }) {
  // Collapsible menu states
  const [isShitjetOpen, setIsShitjetOpen] = useState(false);
  const [isRaporteDitoreOpen, setIsRaporteDitoreOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isRaporteOpen, setIsRaporteOpen] = useState(false);
  const [isRecetaOpen, setIsRecetaOpen] = useState(false);

  // For mobile (drawer), hide if not open; for desktop, always show
  const displaySidebar = variant === 'drawer' && !isOpen ? 'none' : 'block';

  return (
    <Box
      // REMOVED ref={ref}
      position="fixed"
      left="0"
      top="60px" // exactly below the 60px header
      w="350px"
      height="calc(100% - 60px)"
      bg="green.600"
      color="white"
      p={4}
      zIndex="1200"
      // Slide off-screen if not open (push/drawer logic)
      transform={isOpen ? 'translateX(0)' : 'translateX(-100%)'}
      transition="transform 0.3s ease"
      display={displaySidebar}
      overflowY="auto"
    >
      {/* Close button for mobile drawer */}
      {variant === 'drawer' && (
        <Button onClick={onClose} mb={4} size="sm">
          Close
        </Button>
      )}

      {/* ============ HOME (Non-Collapsible) ============ */}
      <Flex
        className="mat-list-item-content"
        align="center"
        position="relative"
        p={2}
        borderRadius="md"
        mb={3}
        _hover={{ bg: 'gray.600' }}
      >
        <Box
          className="mat-ripple mat-list-item-ripple"
          position="absolute"
          inset="0"
          pointerEvents="none"
        />
        <Icon
          as={MdHome}
          className="mat-icon notranslate routeIcon material-icons mat-icon-no-color"
          aria-hidden="true"
          mr={2}
          boxSize="32px"
        />
        <ChakraLink
          as={Link}
          to="/home"
          fontSize="3xl"
          fontWeight="semibold"
          className="mat-list-text"
          _hover={{ textDecoration: 'underline', color: 'teal.200' }}
        >
          Home
        </ChakraLink>
      </Flex>

      {/* ============ SHITJET (Collapsible) ============ */}
      <Box mb={3}>
        <Flex
          className="mat-list-item-content"
          align="center"
          position="relative"
          p={2}
          borderRadius="md"
          cursor="pointer"
          _hover={{ bg: 'gray.600' }}
          onClick={() => setIsShitjetOpen(!isShitjetOpen)}
        >
          <Box
            className="mat-ripple mat-list-item-ripple"
            position="absolute"
            inset="0"
            pointerEvents="none"
          />
          <Icon
            as={MdLocalGroceryStore}
            className="mat-icon notranslate routeIcon material-icons mat-icon-no-color"
            aria-hidden="true"
            mr={2}
            boxSize="32px"
          />
          <Text className="mat-list-text" fontWeight="semibold" fontSize="3xl" flex="1">
            Shitjet
          </Text>
          <Icon
            as={isShitjetOpen ? ChevronUpIcon : ChevronDownIcon}
            className="mat-icon notranslate material-icons mat-icon-no-color"
            transition="transform 0.2s"
            boxSize="32px"
          />
        </Flex>
        {isShitjetOpen && (
          <Box pl={8} mt={2}>
            <Box mb={2} className="mat-list-item-content">
              <ChakraLink
                as={Link}
                to="/most-sold-items-by-price"
                fontSize="lg"
                className="mat-list-text"
                _hover={{ textDecoration: 'underline', color: 'teal.200' }}
              >
                Shitjet Renditura
              </ChakraLink>
            </Box>
            <Box className="mat-list-item-content">
              <ChakraLink
                as={Link}
                to="/dashboard"
                fontSize="lg"
                className="mat-list-text"
                _hover={{ textDecoration: 'underline', color: 'teal.200' }}
              >
                Shitjet Analitike
              </ChakraLink>
            </Box>
          </Box>
        )}
      </Box>

      {/* ============ RAPORTE DITORE (Collapsible) ============ */}
      <Box mb={3}>
        <Flex
          className="mat-list-item-content"
          align="center"
          position="relative"
          p={2}
          borderRadius="md"
          cursor="pointer"
          _hover={{ bg: 'gray.600' }}
          onClick={() => setIsRaporteDitoreOpen(!isRaporteDitoreOpen)}
        >
          <Box
            className="mat-ripple mat-list-item-ripple"
            position="absolute"
            inset="0"
            pointerEvents="none"
          />
          <Icon
            as={MdFileCopy}
            className="mat-icon notranslate routeIcon material-icons mat-icon-no-color"
            aria-hidden="true"
            mr={2}
            boxSize="32px"
          />
          <Text className="mat-list-text" fontWeight="semibold" fontSize="3xl" flex="1">
            Raporte Ditore
          </Text>
          <Icon
            as={isRaporteDitoreOpen ? ChevronUpIcon : ChevronDownIcon}
            className="mat-icon notranslate material-icons mat-icon-no-color"
            transition="transform 0.2s"
            boxSize="32px"
          />
        </Flex>
        {isRaporteDitoreOpen && (
          <Box pl={8} mt={2}>
            <Box mb={2} className="mat-list-item-content">
              <ChakraLink
                as={Link}
                to="/daily-expenses"
                fontSize="lg"
                className="mat-list-text"
                _hover={{ textDecoration: 'underline', color: 'teal.200' }}
              >
                Xhiro Ditore
              </ChakraLink>
            </Box>
            <Box className="mat-list-item-content">
              <ChakraLink
                as={Link}
                to="/supplier"
                fontSize="lg"
                className="mat-list-text"
                _hover={{ textDecoration: 'underline', color: 'teal.200' }}
              >
                Furnitor
              </ChakraLink>
            </Box>
          </Box>
        )}
      </Box>

      {/* ============ INVENTORY (Collapsible) ============ */}
      <Box mb={3}>
        <Flex
          className="mat-list-item-content"
          align="center"
          position="relative"
          p={2}
          borderRadius="md"
          cursor="pointer"
          _hover={{ bg: 'gray.600' }}
          onClick={() => setIsInventoryOpen(!isInventoryOpen)}
        >
          <Box
            className="mat-ripple mat-list-item-ripple"
            position="absolute"
            inset="0"
            pointerEvents="none"
          />
          <Icon
            as={MdInventory}
            className="mat-icon notranslate routeIcon material-icons mat-icon-no-color"
            aria-hidden="true"
            mr={2}
            boxSize="32px"
          />
          <Text className="mat-list-text" fontWeight="semibold" fontSize="3xl" flex="1">
            Inventory
          </Text>
          <Icon
            as={isInventoryOpen ? ChevronUpIcon : ChevronDownIcon}
            className="mat-icon notranslate material-icons mat-icon-no-color"
            transition="transform 0.2s"
            boxSize="32px"
          />
        </Flex>
        {isInventoryOpen && (
          <Box pl={8} mt={2}>
            <Box className="mat-list-item-content">
              <ChakraLink
                as={Link}
                to="/inventory"
                fontSize="lg"
                className="mat-list-text"
                _hover={{ textDecoration: 'underline', color: 'teal.200' }}
              >
                Inventory
              </ChakraLink>
            </Box>
          </Box>
        )}
      </Box>

      {/* ============ RAPORTE (Collapsible) ============ */}
      <Box mb={3}>
        <Flex
          className="mat-list-item-content"
          align="center"
          position="relative"
          p={2}
          borderRadius="md"
          cursor="pointer"
          _hover={{ bg: 'gray.600' }}
          onClick={() => setIsRaporteOpen(!isRaporteOpen)}
        >
          <Box
            className="mat-ripple mat-list-item-ripple"
            position="absolute"
            inset="0"
            pointerEvents="none"
          />
          <Icon
            as={MdShowChart}
            className="mat-icon notranslate routeIcon material-icons mat-icon-no-color"
            aria-hidden="true"
            mr={2}
            boxSize="32px"
          />
          <Text className="mat-list-text" fontWeight="semibold" fontSize="3xl" flex="1">
            Raporte
          </Text>
          <Icon
            as={isRaporteOpen ? ChevronUpIcon : ChevronDownIcon}
            className="mat-icon notranslate material-icons mat-icon-no-color"
            transition="transform 0.2s"
            boxSize="32px"
          />
        </Flex>
        {isRaporteOpen && (
          <Box pl={8} mt={2}>
            <Box className="mat-list-item-content">
              <ChakraLink
                as={Link}
                to="/usage"
                fontSize="lg"
                className="mat-list-text"
                _hover={{ textDecoration: 'underline', color: 'teal.200' }}
              >
                Malli Shitur
              </ChakraLink>
            </Box>
          </Box>
        )}
      </Box>

      {/* ============ RECETA (Collapsible) ============ */}
      <Box mb={3}>
        <Flex
          className="mat-list-item-content"
          align="center"
          position="relative"
          p={2}
          borderRadius="md"
          cursor="pointer"
          _hover={{ bg: 'gray.600' }}
          onClick={() => setIsRecetaOpen(!isRecetaOpen)}
        >
          <Box
            className="mat-ripple mat-list-item-ripple"
            position="absolute"
            inset="0"
            pointerEvents="none"
          />
          <Icon
            as={MdRestaurantMenu}
            className="mat-icon notranslate routeIcon material-icons mat-icon-no-color"
            aria-hidden="true"
            mr={2}
            boxSize="32px"
          />
          <Text className="mat-list-text" fontWeight="semibold" fontSize="3xl" flex="1">
            Receta
          </Text>
          <Icon
            as={isRecetaOpen ? ChevronUpIcon : ChevronDownIcon}
            className="mat-icon notranslate material-icons mat-icon-no-color"
            transition="transform 0.2s"
            boxSize="32px"
          />
        </Flex>
        {isRecetaOpen && (
          <Box pl={8} mt={2}>
            <Box mb={2} className="mat-list-item-content">
              <ChakraLink
                as={Link}
                to="/article-ingredients"
                fontSize="lg"
                className="mat-list-text"
                _hover={{ textDecoration: 'underline', color: 'teal.200' }}
              >
                Receta
              </ChakraLink>
            </Box>
            <Box className="mat-list-item-content">
              <ChakraLink
                as={Link}
                to="/missing-articles"
                fontSize="lg"
                className="mat-list-text"
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
