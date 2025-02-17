import { Box, Button, Drawer, DrawerOverlay, DrawerCloseButton, DrawerHeader, DrawerBody, DrawerContent, VStack } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const SidebarContent = ({ onClick }) => (
  <VStack>
    <Button as={Link} to="/home" w="100%" onClick={onClick}>
      Home
    </Button>
    <Button as={Link} to="/dashboard" w="100%" onClick={onClick}>
      Dashboard
    </Button>
  </VStack>
)

const Sidebar = ({ isOpen, variant, onClose }) => {
  return variant === 'sidebar' ? (
    <Box
      position="fixed"
      left={0}
      p={3}
      w="240px"
      top={0}
      h="100%"
      bg="#fff"
      borderRight="1px solid #ddd"
    >
      <SidebarContent onClick={onClose} />
    </Box>
  ) : (
    <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
      <DrawerOverlay>
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Loopple Chakra</DrawerHeader>
          <DrawerBody>
            <SidebarContent onClick={onClose} />
          </DrawerBody>
        </DrawerContent>
      </DrawerOverlay>
    </Drawer>
  )
}

Sidebar.propTypes = {
  onClose: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  variant: PropTypes.oneOf(['drawer', 'sidebar']).isRequired,
};

export default Sidebar;