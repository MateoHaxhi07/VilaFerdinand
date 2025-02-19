import React, { useState } from "react";
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Table,
  TableContainer,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Center,
  Stack,
  Text,
  Divider,
} from "@chakra-ui/react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function IngredientUsageReport() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [articleNames, setArticleNames] = useState("");
  const [report, setReport] = useState([]);
  const [ingredientSummary, setIngredientSummary] = useState([]); // NEW: Summary state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Function to generate ingredient usage summary
  const generateSummary = (reportData) => {
    const summary = {};

    // Aggregate totals for each ingredient
    reportData.forEach((row) => {
      Object.entries(row.ingredientUsage).forEach(([ingredient, usage]) => {
        if (!summary[ingredient]) {
          summary[ingredient] = 0;
        }
        summary[ingredient] += usage;
      });
    });

    // Convert summary object to array for table display
    const summaryArray = Object.entries(summary).map(([ingredient, totalUsage]) => ({
      ingredient,
      totalUsage,
    }));

    // Sort by highest total usage
    summaryArray.sort((a, b) => b.totalUsage - a.totalUsage);

    setIngredientSummary(summaryArray);
  };

  // Fetch and process report
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      setError("Please provide both start and end dates.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      let query = `?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
      if (articleNames.trim() !== "") {
        query += `&articleNames=${encodeURIComponent(articleNames)}`;
      }
      const res = await fetch(`${API_URL}/report/ingredient-usage${query}`);
      if (!res.ok) {
        throw new Error("Failed to fetch report data");
      }
      const data = await res.json();
      setReport(data);
      generateSummary(data); // Generate summary
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={4} bg="gray.50" minH="100vh">
      {/* Heading */}
      <Heading mb={4} textAlign="center">
        Ingredient Usage Report
      </Heading>

      {/* Form Section */}
      <Box
        maxW="600px"
        mx="auto"
        p={4}
        bg="white"
        borderRadius="md"
        boxShadow="md"
        mb={6}
      >
        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Start Date</FormLabel>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>End Date</FormLabel>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Article Names (comma separated, optional)</FormLabel>
              <Input
                type="text"
                placeholder="e.g., Espresso martini, GIN TONIC"
                value={articleNames}
                onChange={(e) => setArticleNames(e.target.value)}
              />
            </FormControl>
            {error && (
              <Text color="red.500" fontSize="sm">
                {error}
              </Text>
            )}
            <Button type="submit" colorScheme="teal">
              Generate Report
            </Button>
          </Stack>
        </form>
      </Box>

      {/* Loading Indicator */}
      {loading ? (
        <Center>
          <Spinner size="xl" />
        </Center>
      ) : (
        <>
          {/* Detailed Report Table */}
          {report.length > 0 && (
            <TableContainer bg="white" p={4} borderRadius="md" boxShadow="md">
              <Heading fontSize="lg" mb={4}>
                Detailed Ingredient Usage by Article
              </Heading>
              <Table variant="simple" size="sm">
                <Thead bg="gray.200">
                  <Tr>
                    <Th>Article Name</Th>
                    <Th>Total Sold</Th>
                    <Th>Ingredient Usage</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {report.map((row, idx) => (
                    <Tr key={idx}>
                      <Td>{row.articleName}</Td>
                      <Td>{row.totalSold}</Td>
                      <Td>
                        {Object.keys(row.ingredientUsage).length > 0 ? (
                          <Stack spacing={1}>
                            {Object.entries(row.ingredientUsage).map(
                              ([ingredient, totalUsage]) => (
                                <Text key={ingredient} fontSize="sm">
                                  {ingredient}: {totalUsage.toFixed(2)}
                                </Text>
                              )
                            )}
                          </Stack>
                        ) : (
                          "-"
                        )}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          )}

          {/* Divider */}
          <Divider my={6} />

          {/* Summary Table for Total Ingredient Usage */}
          {ingredientSummary.length > 0 && (
            <TableContainer bg="white" p={4} borderRadius="md" boxShadow="md" mt={6}>
              <Heading fontSize="lg" mb={4}>
                Total Ingredient Usage Summary
              </Heading>
              <Table variant="simple" size="sm">
                <Thead bg="gray.200">
                  <Tr>
                    <Th>Ingredient</Th>
                    <Th>Total Usage</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {ingredientSummary.map((item, idx) => (
                    <Tr key={idx}>
                      <Td>{item.ingredient}</Td>
                      <Td>{item.totalUsage.toFixed(2)}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          )}
        </>
      )}
    </Box>
  );
}
