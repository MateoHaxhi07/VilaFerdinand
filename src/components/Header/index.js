import { Flex, Text } from '@chakra-ui/react';

const Header = () => {
  return (
    <Flex bg="#151515" p={4} color="white" justifyContent="center" w="100%">
      <Text fontSize="2xl" fontWeight="bold">
        Vila Ferdinand
      </Text>
    </Flex>
  );
};

export default Header;