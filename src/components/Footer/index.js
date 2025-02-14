// FooterNav.js
import React from 'react';
import { Box, Button, HStack } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const FooterNav = () => {
  return (
    <Box
      position="fixed"
      bottom={0}
      left={0}
      w="100%"
      bg="gray.800"
      color="white"
      p={3}
      borderTop="1px solid #ddd"
      zIndex={9999} // ensure it sits on top of other content
    >
      <HStack spacing={4} justify="center">
        <Button as={Link} to="/home" variant="ghost" color="white">
          Home
        </Button>
        <Button as={Link} to="/dashboard" variant="ghost" color="white">
          Shitjet Sipas Ores
        </Button>
        <Button as={Link} to="/most-sold-items-by-price" variant="ghost" color="white">
          Me Te Shiturat
        </Button>
        <Button as={Link} to="/daily-expenses" variant="ghost" color="white"> {/* Add a new button for the DailyExpenses page */}
          Daily Expenses
        </Button>
        <Button as={Link} to="/daily-expenses-table" variant="ghost" color="white"> {/* Add a new button for the DailyExpenses page */}
          Daily Expenses Table
        </Button>
      </HStack>
    </Box>
  );
};

export default FooterNav;
