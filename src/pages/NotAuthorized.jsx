// NotAuthorized.jsx
import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';

const NotAuthorized = () => {
  return (
    <Box textAlign="center" py={10} px={6}>
      <Heading display="inline-block" as="h2" size="2xl" bg="red.400" color="white" p={2}>
        Oops!
      </Heading>
      <Text fontSize="18px" mt={3} mb={2}>
        You are not authorized to view this page.
      </Text>
      <Text color={'gray.500'}>
        Please contact your administrator if you believe this is an error.
      </Text>
    </Box>
  );
};

export default NotAuthorized;
