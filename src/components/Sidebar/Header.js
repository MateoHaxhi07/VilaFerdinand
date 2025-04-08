import React from "react";
import { Box, Flex, IconButton, Text, Image } from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { FaFilter } from "react-icons/fa";


export default function Header({
  onToggleSidebar,   // function from parent (Layout) to toggle the sidebar
  onToggleFilters,   // function to toggle the Filters panel
  showFilters        // boolean if Filters are currently shown
}) {
  // Optional: log when hamburger is clicked
  const handleSidebarClick = () => {
    console.log("Hamburger clicked!");
    onToggleSidebar?.();
  };

  // Optional: log when filter is clicked
  const handleFilterClick = () => {
    console.log("Filter icon clicked!");
    onToggleFilters?.();
  };

  return (
    <Box
      as="header"
      bg="green.700"
      color="white"
      height="60px"
      px={4}
      boxShadow="md"
      position="fixed"
      top={0}
      left={0}
      w="100%"
      zIndex="1300" // Keep the header on top
    >
      <Flex alignItems="center" justify="space-between" height="100%">
        {/* Left side: both icons together */}
        <Flex alignItems="center">
          {/* Sidebar (Hamburger) IconButton */}
          <IconButton
            id="sidebarToggleBtn"           // <-- ADD THIS ID
            aria-label="Toggle Sidebar"
            icon={<HamburgerIcon boxSize={8} />}
            variant="ghost"
            color="white"
            mr={3}
            onClick={handleSidebarClick}
          />

          {/* Filter IconButton */}
          <IconButton
            aria-label="Toggle Filters"
            icon={<FaFilter />}
            variant="ghost"
            color="white"
            onClick={handleFilterClick}
          />
        </Flex>


        {/* Add this keyframes definition in your Chakra theme or inline */}
        <Box
          as="style"
          dangerouslySetInnerHTML={{
            __html: `
              @keyframes fade {
                0% {
                  opacity: 0;
                }
                50% {
                  opacity: 1;
                }
                100% {
                  opacity: 0;
                }
              }
            `,
          }}
        />

        {/* Right side (optionally empty or add something else) */}
        <Box>
          {/* Example: show a text if filters are open (optional) */}
          {showFilters ? (
            <Text fontSize="sm" color="teal.200">
              Filters Open
            </Text>
          ) : null}
        </Box>
      </Flex>
    </Box>
  );
}
