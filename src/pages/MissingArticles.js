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
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { DownloadIcon } from "@chakra-ui/icons";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function MissingArticlesReport() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch Missing Articles
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
      if (search.trim() !== "") {
        query += `&search=${encodeURIComponent(search)}`;
      }

      const res = await fetch(`${API_URL}/report/missing-articles${query}`);
      if (!res.ok) {
        throw new Error("Failed to fetch missing articles");
      }
      const data = await res.json();
      setReport(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // CSV Export Function
  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Article Name"]
        .concat(
          report.map((row) => `${row.articleName}`)
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "missing_articles.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box p={4} bg="gray.50" minH="100vh">
      {/* Heading */}
      <Heading mb={4} textAlign="center">
        Missing Articles Report
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
              <FormLabel>Search Article Name</FormLabel>
              <InputGroup>
                <Input
                  type="text"
                  placeholder="e.g., Latte, Cappuccino"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <InputRightElement>
                    <Button size="xs" onClick={() => setSearch("")}>
                      Clear
                    </Button>
                  </InputRightElement>
                )}
              </InputGroup>
            </FormControl>
            {error && (
              <Text color="red.500" fontSize="sm">
                {error}
              </Text>
            )}
            <Button type="submit" colorScheme="teal" isLoading={loading}>
              Find Missing Articles
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
          {/* Results Table */}
          {report.length > 0 ? (
            <>
              <Box textAlign="right" mb={4}>
                <Button
                  leftIcon={<DownloadIcon />}
                  colorScheme="blue"
                  onClick={handleExportCSV}
                >
                  Export to CSV
                </Button>
              </Box>

              <TableContainer bg="white" p={4} borderRadius="md" boxShadow="md">
                <Heading fontSize="lg" mb={4}>
                  Missing Articles
                </Heading>
                <Table variant="simple" size="sm">
                  <Thead bg="gray.200">
                    <Tr>
                      <Th>#</Th>
                      <Th>Article Name</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {report.map((row, idx) => (
                      <Tr key={idx}>
                        <Td>{idx + 1}</Td>
                        <Td>{row.articleName}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </>
          ) : (
            <Center mt={6}>
              <Text>No missing articles found.</Text>
            </Center>
          )}
        </>
      )}
    </Box>
  );
}
