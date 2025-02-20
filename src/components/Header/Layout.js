import React, { useState } from 'react';
import { Box, Button } from '@chakra-ui/react';
import Header from './Header';

const Layout = ({ children }) => {
  const [showHeader, setShowHeader] = useState(true);

  return (
    <Box>
      {/* Toggle Button */}
      <Button
        onClick={() => setShowHeader(prev => !prev)}
        mt={4}
        ml={4}
        colorScheme="teal"
        variant="outline"
      >
        {showHeader ? "Hide Header" : "Show Header"}
      </Button>
      {/* Conditionally render Header */}
      {showHeader && <Header />}
      <Box mt={4}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
