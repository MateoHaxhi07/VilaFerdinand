import React from 'react';
import {
  Box,
  Button,
  Drawer,
  DrawerOverlay,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  DrawerContent,
  VStack
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const SidebarContent = ({ onClick }) => (
  <VStack spacing={4} align="stretch">
    <Button as={Link} to="/home" w="100%" onClick={onClick}>
      Home
    </Button>
    <Button as={Link} to="/dashboard" w="100%" onClick={onClick}>
      Shitjet Sipas Ores
    </Button>
    <Button as={Link} to="/most-sold-items-by-price" w="100%" onClick={onClick}>
      Me Te Shiturat
    </Button>
  </VStack>
);

const Sidebar = ({ isOpen, variant, onClose }) => {
  return variant === 'sidebar' ? (
    // Fixed sidebar variant (desktop)
    <Box
      position="fixed"
      left={0}
      top={0}
      p={3}
      w="240px"
      h="100%"
      bg="gray.800"
      color="white"
      borderRight="1px solid #ddd"
      overflowY="auto"
    >
      {/* Optional heading for the sidebar */}
      <Box fontSize="xl" fontWeight="bold" mb={4}>
        Menu
      </Box>
      <SidebarContent onClick={onClose} />
    </Box>
  ) : (
    // Drawer variant (mobile)
    <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
      <DrawerOverlay>
        <DrawerContent bg="gray.800" color="white">
          <DrawerCloseButton color="white" />
          <DrawerHeader borderBottomWidth="1px">Menu</DrawerHeader>
          <DrawerBody>
            <SidebarContent onClick={onClose} />
          </DrawerBody>
        </DrawerContent>
      </DrawerOverlay>
    </Drawer>
  );
};

Sidebar.propTypes = {
  onClose: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  variant: PropTypes.oneOf(['drawer', 'sidebar']).isRequired,
};

export default Sidebar;
