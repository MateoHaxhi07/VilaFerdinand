// Filters.jsx

import React from "react";
import { Box, Card, CardBody, Heading, Flex } from "@chakra-ui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import { selectStyles } from "./filterStyles";

const Filters = ({
  // Existing props
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  sellers,
  selectedSellers,
  setSelectedSellers,
  sellerCategoriesOptions,
  selectedSellerCategories,
  setSelectedSellerCategories,
  selectedHours,
  setSelectedHours,
  hoursOptions,

  // *** NEW props for Category & Article Name ***
  categories,                // array of { value, label }
  selectedCategories,
  setSelectedCategories,
  articleNamesOptions,       // array of { value, label }
  selectedArticleNames,
  setSelectedArticleNames,
}) => {
  return (
    <Card bg="gray.600" mb={6} mt={6} borderRadius="md" boxShadow="md">
      <CardBody>
        <Heading
          size="lg"
          mb={4}
          color="white"
          align="center"
          fontWeight="bold"
        >
          Filters
        </Heading>

        <Flex wrap="wrap" gap={4}>
          {/* Start Date */}
          <Box mb={4}>
            <Box mb={2} color="white" fontWeight="bold">
              Start Date
            </Box>
            <DatePicker
              selected={startDate}
              onChange={setStartDate}
              portalId="root-portal"
              className="dark-datepicker"
            />
          </Box>

          {/* End Date */}
          <Box mb={4}>
            <Box mb={2} color="white" fontWeight="bold">
              End Date
            </Box>
            <DatePicker
              selected={endDate}
              onChange={setEndDate}
              portalId="root-portal"
              className="dark-datepicker"
            />
          </Box>

          {/* Seller Filter */}
          <Box minW="200px" mb={4}>
            <Box mb={2} color="white" fontWeight="bold">
              Seller
            </Box>
            <Select
              isMulti
              options={sellers}
              onChange={setSelectedSellers}
              placeholder="Select sellers"
              menuPortalTarget={document.body}
              styles={selectStyles}
              value={selectedSellers}
            />
          </Box>

          {/* Seller Category Filter */}
          <Box minW="200px" mb={4}>
            <Box mb={2} color="white" fontWeight="bold">
              Seller Category
            </Box>
            <Select
              isMulti
              options={sellerCategoriesOptions}
              onChange={setSelectedSellerCategories}
              placeholder="Select categories"
              menuPortalTarget={document.body}
              styles={selectStyles}
              value={selectedSellerCategories}
            />
          </Box>

          {/* NEW: Category Filter */}
          <Box minW="200px" mb={4}>
            <Box mb={2} color="white" fontWeight="bold">
              Category
            </Box>
            <Select
              isMulti
              options={categories}
              onChange={setSelectedCategories}
              placeholder="Select categories"
              menuPortalTarget={document.body}
              styles={selectStyles}
              value={selectedCategories}
            />
          </Box>

          {/* NEW: Article Name Filter */}
          <Box minW="200px" mb={4}>
            <Box mb={2} color="white" fontWeight="bold">
              Article Name
            </Box>
            <Select
              isMulti
              options={articleNamesOptions}
              onChange={setSelectedArticleNames}
              placeholder="Select article names"
              menuPortalTarget={document.body}
              styles={selectStyles}
              value={selectedArticleNames}
            />
          </Box>
        </Flex>
      </CardBody>
    </Card>
  );
};

export default Filters;
