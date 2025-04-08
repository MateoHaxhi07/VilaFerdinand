// src/components/Sidebar/Sidebar.js
import React, { useState } from 'react';
import {
  Box,
  Flex,
  Text,
  Link as ChakraLink,
  Button,
  Icon,
  Image
} from '@chakra-ui/react';
import { Link } from 'react-router-dom'; // <-- no longer importing useOutletContext
import Papa from 'papaparse';
import { saveAs } from 'file-saver';

import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import {
  MdLocalGroceryStore,
  MdHome,
  MdShowChart,
  MdRestaurantMenu,
  MdInventory,
  MdFileCopy,
} from 'react-icons/md';
import vfLogo from "./vf.png";





export default function Sidebar({
  sidebarRef,
  isOpen,
  onClose,
  variant,
  // The filter states are now passed as props:
  startDate,
  endDate,
  selectedSellers,
  selectedSellerCategories,
  selectedArticleNames,
  selectedCategories,
}) {
  const [isShitjetOpen, setIsShitjetOpen] = useState(false);
  const [isRaporteDitoreOpen, setIsRaporteDitoreOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isRaporteOpen, setIsRaporteOpen] = useState(false);
  const [isRecetaOpen, setIsRecetaOpen] = useState(false);

  // Hide sidebar on small screens if not open; show on large screens
  const displaySidebar = variant === 'drawer' && !isOpen ? 'none' : 'block';

  // Debug logging: see what the Sidebar has
  console.log('[Sidebar] isOpen:', isOpen, 'variant:', variant);
  console.log('[Sidebar] startDate:', startDate, 'endDate:', endDate);
  console.log('[Sidebar] selectedSellers:', selectedSellers);
  console.log('[Sidebar] selectedSellerCategories:', selectedSellerCategories);
  console.log('[Sidebar] selectedArticleNames:', selectedArticleNames);
  console.log('[Sidebar] selectedCategories:', selectedCategories);

  // Convert Date to YYYY-MM-DD
  const toDateString = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Build query from filters
  const buildAllDataQuery = () => {
    const queryParams = new URLSearchParams();
    const start = toDateString(startDate);
    const end = toDateString(endDate);

    // Only append if they're non-empty
    if (start) queryParams.append('startDate', start);
    if (end) queryParams.append('endDate', end);

    if (selectedSellers?.length) {
      queryParams.append(
        'sellers',
        selectedSellers.map((s) => s.value).join(',')
      );
    }
    if (selectedSellerCategories?.length) {
      queryParams.append(
        'sellerCategories',
        selectedSellerCategories.map((sc) => sc.value).join(',')
      );
    }
    if (selectedArticleNames?.length) {
      queryParams.append(
        'articleNames',
        selectedArticleNames.map((a) => a.value).join(',')
      );
    }
    if (selectedCategories?.length) {
      queryParams.append(
        'categories',
        selectedCategories.map((cat) => cat.value).join(',')
      );
    }
    // if (selectedHours?.length) {
    //   queryParams.append(
    //     'hours',
    //     selectedHours.map(h => h.value).join(',')
    //   );
    // }

    // Hardcode limit/offset or adapt as needed
    queryParams.append('limit', 1000000);
    queryParams.append('offset', 0);

    // Debug
    console.log('[Sidebar] buildAllDataQuery() =>', queryParams.toString());
    return queryParams.toString();
  };

  // Fetch data & convert to CSV
  const handleDownloadCsv = async () => {
    console.log('[Sidebar] handleDownloadCsv CLICKED');

    // 1) Check if we have valid startDate/endDate
    if (!startDate || !endDate) {
      alert('Please select a start and end date in the filters before downloading CSV.');
      return;
    }

    try {
      const query = buildAllDataQuery();
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const url = `${API_URL}/sales/all-data?${query}`;
      console.log('[Sidebar] Downloading CSV from:', url);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch CSV data: ${response.statusText}`);
      }
      const data = await response.json();

      // Convert JSON -> CSV with Papa
      const csv = Papa.unparse(data);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, 'all_sales_data.csv');

      console.log('[Sidebar] CSV download completed.');
    } catch (error) {
      console.error('Error downloading CSV:', error);
    }
  };

  return (
    <Box
      ref={sidebarRef}
      position="fixed"
      left="0"
      top="60px"
      w="350px"
      height="calc(100% - 60px)"
      bg="green.600"
      color="white"
      p={4}
      zIndex="1200"
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
        align="center"
        position="relative"
        p={2}
        borderRadius="md"
        mb={3}
        _hover={{ bg: 'gray.600' }}
      >
           <Image
            src={vfLogo}
            alt="Villa Ferdinand Logo"
            boxSize="40px"
            objectFit="contain"
            mr={2}
            transform="scale(2.1)" // Scale the image to make it larger
          />
        <ChakraLink
          as={Link}
          to="/home"
          fontSize="3xl"
          fontWeight="semibold"
          _hover={{ textDecoration: 'underline', color: 'teal.200' }}
        >
          Home
        </ChakraLink>
      </Flex>


      {/* ============ RAPORTE DITORE (Collapsible) ============ */}
      <Box mb={3}>
        <Flex
          align="center"
          position="relative"
          p={2}
          borderRadius="md"
          cursor="pointer"
          _hover={{ bg: 'gray.600' }}
          onClick={() => setIsRaporteDitoreOpen(!isRaporteDitoreOpen)}
        >
          <Icon as={MdFileCopy} mr={2} boxSize="32px" />
          <Text fontWeight="semibold" fontSize="3xl" flex="1">
            Raporte Ditore
          </Text>
          <Icon
            as={isRaporteDitoreOpen ? ChevronUpIcon : ChevronDownIcon}
            transition="transform 0.2s"
            boxSize="32px"
          />
        </Flex>
        {isRaporteDitoreOpen && (
          <Box pl={8} mt={2}>
            <Box mb={2}>
              <ChakraLink
                as={Link}
                to="/daily-expenses"
                fontSize="25px"
                _hover={{ textDecoration: 'underline', color: 'teal.200' }}
              >
                Xhiro Ditore
              </ChakraLink>
            </Box>
            <Box>
              <ChakraLink
                as={Link}
                to="/supplier"
                fontSize="25px"
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
          align="center"
          position="relative"
          p={2}
          borderRadius="md"
          cursor="pointer"
          _hover={{ bg: 'gray.600' }}
          onClick={() => setIsInventoryOpen(!isInventoryOpen)}
        >
          <Icon as={MdInventory} mr={2} boxSize="32px" />
          <Text fontWeight="semibold" fontSize="3xl" flex="1">
            Inventory
          </Text>
          <Icon
            as={isInventoryOpen ? ChevronUpIcon : ChevronDownIcon}
            transition="transform 0.2s"
            boxSize="32px"
          />
        </Flex>
        {isInventoryOpen && (
          <Box pl={8} mt={2}>
            <Box>
              <ChakraLink
                as={Link}
                to="/inventory"
                fontSize="25px"
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
          align="center"
          position="relative"
          p={2}
          borderRadius="md"
          cursor="pointer"
          _hover={{ bg: 'gray.600' }}
          onClick={() => setIsRaporteOpen(!isRaporteOpen)}
        >
          <Icon as={MdShowChart} mr={2} boxSize="32px" />
          <Text fontWeight="semibold" fontSize="3xl" flex="1">
            Raporte
          </Text>
          <Icon
            as={isRaporteOpen ? ChevronUpIcon : ChevronDownIcon}
            transition="transform 0.2s"
            boxSize="32px"
          />
        </Flex>
        {isRaporteOpen && (
          <Box pl={8} mt={2}>
            <Box>
              <ChakraLink
                as={Link}
                to="/usage"
                fontSize="25px"
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
          align="center"
          position="relative"
          p={2}
          borderRadius="md"
          cursor="pointer"
          _hover={{ bg: 'gray.600' }}
          onClick={() => setIsRecetaOpen(!isRecetaOpen)}
        >
          <Icon as={MdRestaurantMenu} mr={2} boxSize="32px" />
          <Text fontWeight="semibold" fontSize="3xl" flex="1">
            Receta
          </Text>
          <Icon
            as={isRecetaOpen ? ChevronUpIcon : ChevronDownIcon}
            transition="transform 0.2s"
            boxSize="32px"
          />
        </Flex>
        {isRecetaOpen && (
          <Box pl={8} mt={2}>
            <Box mb={2}>
              <ChakraLink
                as={Link}
                to="/article-ingredients"
                fontSize="25px"
                _hover={{ textDecoration: 'underline', color: 'teal.200' }}
              >
                Receta
              </ChakraLink>
            </Box>
            <Box>
              <ChakraLink
                as={Link}
                to="/missing-articles"
                fontSize="25px"
                _hover={{ textDecoration: 'underline', color: 'teal.200' }}
              >
                Receta Mungojn
              </ChakraLink>
            </Box>
          </Box>
        )}
      </Box>

      {/* Download CSV Button */}
      <Box mt={6}>
        <Button onClick={handleDownloadCsv} colorScheme="blue" size="sm" width="100%">
          Download CSV
        </Button>
      </Box>
    </Box>
  );
}
