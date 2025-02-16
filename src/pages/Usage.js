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
} from "@chakra-ui/react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function IngredientUsageReport() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [articleNames, setArticleNames] = useState("");
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      setError("Please provide both start and end dates.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      let query = `?startDate=${encodeURIComponent(
        startDate
      )}&endDate=${encodeURIComponent(endDate)}`;
      if (articleNames.trim() !== "") {
        query += `&articleNames=${encodeURIComponent(articleNames)}`;
      }
      const res = await fetch(`${API_URL}/report/ingredient-usage${query}`);
      if (!res.ok) {
        throw new Error("Failed to fetch report data");
      }
      const data = await res.json();
      setReport(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={4} bg="gray.50" minH="100vh">
      <Heading mb={4} textAlign="center">
        Ingredient Usage Report
      </Heading>
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

      {loading ? (
        <Center>
          <Spinner size="xl" />
        </Center>
      ) : (
        report.length > 0 && (
          <TableContainer bg="white" p={4} borderRadius="md" boxShadow="md">
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
        )
      )}
    </Box>
  );
}
