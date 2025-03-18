// src/components/Sidebar/Header.js
import React from 'react';
import { Box, Flex, IconButton, Text } from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';

export default function Header({ onToggleSidebar }) {
  return (
    <Box
      as="header"
      bg="green.700"
      color="white"
      py={2}
      px={4}
      boxShadow="md"
      position="fixed"
      top={0}
      left={0}
      w="100%"
      zIndex="1300"  // Increase zIndex if sidebar has 1200, so the button is always clickable
    >
      <Flex alignItems="center">
        {/* Hamburger IconButton */}
        <IconButton
          aria-label="Toggle Sidebar"
          icon={<HamburgerIcon />}
          variant="ghost"
          color="white"
          mr={4}
          onClick={() => {
            console.log('Hamburger clicked!');
            onToggleSidebar();
          }}
          
        />
        <Text fontWeight="bold" fontSize="lg">
          My App Header
        </Text>
      </Flex>
    </Box>
  );
}
