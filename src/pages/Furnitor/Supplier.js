import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  Flex,
  VStack,
  Stack,
  useToast,
} from "@chakra-ui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from "@chakra-ui/react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function AggregatedCustomRows() {
  const toast = useToast();

  // Basic aggregator states
  const [blerjeData, setBlerjeData] = useState([]);
  const [borxheData, setBorxheData] = useState([]);

  // Date range
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Multi-supplier
  const [allSuppliers, setAllSuppliers] = useState([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);

  // ----- NEW: Sorting states for each table -----
  // Example shape: { key: "supplier" | "aggregated_total_amount" | "aggregated_amount_paid", direction: "asc" | "desc" }
  const [sortConfigBlerje, setSortConfigBlerje] = useState({ key: null, direction: "asc" });
  const [sortConfigBorxhe, setSortConfigBorxhe] = useState({ key: null, direction: "asc" });

  // 1) fetch distinct supplier list
  async function fetchAllSuppliers() {
    try {
      const resp = await fetch(`${API_URL}/all-suppliers`);
      if (!resp.ok) {
        throw new Error("Failed to load suppliers");
      }
      const data = await resp.json(); // array of strings
      const options = data.map((sup) => ({ label: sup.trim(), value: sup.trim() }));
      setAllSuppliers(options);
    } catch (error) {
      toast({
        title: "Error fetching suppliers",
        description: error.message,
        status: "error",
      });
    }
  }

  // 2) aggregator fetch
  async function fetchAggregatedData(customStart, customEnd, supplierValues) {
    try {
      let endpoint = `${API_URL}/aggregated-modified-expenses`;
      let queryParams = [];

      if (customStart && customEnd) {
        queryParams.push(`start=${formatDate(customStart)}`);
        queryParams.push(`end=${formatDate(customEnd)}`);
      }
      if (supplierValues && supplierValues.length > 0) {
        const joined = supplierValues.join(",");
        queryParams.push(`suppliers=${encodeURIComponent(joined)}`);
      }
      if (queryParams.length > 0) {
        endpoint += "?" + queryParams.join("&");
      }

      const resp = await fetch(endpoint);
      if (!resp.ok) {
        const msg = await resp.text();
        throw new Error("Failed aggregator fetch: " + msg);
      }
      const data = await resp.json();

      // separate BLERJE vs BORXHE
      const blerje = data.filter((row) => row.transaction_type === "BLERJE");
      const borxhe = data.filter((row) => row.transaction_type === "BORXHE");

      setBlerjeData(blerje);
      setBorxheData(borxhe);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
      });
    }
  }

  function formatDate(date) {
    if (!date) return "";
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  // on mount, load suppliers
  useEffect(() => {
    fetchAllSuppliers();
  }, [toast]);

  // on mount, fetch aggregator data (no filters)
  useEffect(() => {
    fetchAggregatedData();
  }, [toast]);

  // Filter button
  function handleFilter() {
    const chosenValues = selectedSuppliers.map((o) => o.value);
    if (startDate && endDate) {
      fetchAggregatedData(startDate, endDate, chosenValues);
    } else {
      fetchAggregatedData(null, null, chosenValues);
    }
  }

  // Clear button
  function handleClear() {
    setStartDate(null);
    setEndDate(null);
    setSelectedSuppliers([]);
    fetchAggregatedData();
  }

  // --------------------------------------------------------------------------
  // Sorting Logic
  // --------------------------------------------------------------------------

  // Toggling the sort for the BLERJE table
  function handleSortBlerje(key) {
    setSortConfigBlerje((prev) => {
      // If same key, flip direction
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      } else {
        // new key, default asc
        return { key, direction: "asc" };
      }
    });
  }

  // Toggling the sort for the BORXHE table
  function handleSortBorxhe(key) {
    setSortConfigBorxhe((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      } else {
        return { key, direction: "asc" };
      }
    });
  }

  // A small helper to compare strings or numeric
  function compareValues(a, b, key, direction) {
    // For "supplier" we do a string compare
    // For amounts we parse them
    let valA, valB;

    if (key === "supplier") {
      valA = (a.supplier || "").toString();
      valB = (b.supplier || "").toString();
    } else if (key === "aggregated_total_amount") {
      valA = parseFloat(a.aggregated_total_amount) || 0;
      valB = parseFloat(b.aggregated_total_amount) || 0;
    } else if (key === "aggregated_amount_paid") {
      valA = parseFloat(a.aggregated_amount_paid) || 0;
      valB = parseFloat(b.aggregated_amount_paid) || 0;
    } else {
      // if something else, default to string
      valA = (a[key] || "").toString();
      valB = (b[key] || "").toString();
    }

    // Now do the actual comparison
    if (valA < valB) return direction === "asc" ? -1 : 1;
    if (valA > valB) return direction === "asc" ? 1 : -1;
    return 0;
  }

  // We'll produce "sortedBlerje" and "sortedBorxhe" with useMemo
  const sortedBlerje = useMemo(() => {
    const { key, direction } = sortConfigBlerje;
    if (!key) return blerjeData; // no sort
    // copy the array
    let newData = [...blerjeData];
    newData.sort((a, b) => compareValues(a, b, key, direction));
    return newData;
  }, [blerjeData, sortConfigBlerje]);

  const sortedBorxhe = useMemo(() => {
    const { key, direction } = sortConfigBorxhe;
    if (!key) return borxheData; // no sort
    let newData = [...borxheData];
    newData.sort((a, b) => compareValues(a, b, key, direction));
    return newData;
  }, [borxheData, sortConfigBorxhe]);

  // For showing an indicator (asc/desc)
  function renderSortIndicator(sortConfig, currentKey) {
    if (sortConfig.key === currentKey) {
      return sortConfig.direction === "asc" ? " ↑" : " ↓";
    }
    return ""; // no indicator
  }

  return (
    <Box bg="#151a1e" minH="100vh" py={8} px={[4, 8]}>
      <Heading color="whiteAlpha.900" mb={1} fontSize="2xl">
        Aggregated Suppliers (with Sorting)
      </Heading>
      <Text color="whiteAlpha.700" mb={8}>
        You can select multiple suppliers, date range, and sort columns
      </Text>

      {/* Filter container */}
      <Box mb={10} bg="#1d2429" borderRadius="md" p={4} boxShadow="md">
        <Heading size="md" color="whiteAlpha.900" mb={4}>
          Filter
        </Heading>

        <VStack spacing={4} align="stretch">
          {/* Row 1: date pickers */}
          <Flex gap={4} align="center" wrap="wrap">
            <Box>
              <Text color="whiteAlpha.800" mb={1}>
                Start Date
              </Text>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                placeholderText="Start Date"
                className="custom-datepicker"
              />
            </Box>

            <Box>
              <Text color="whiteAlpha.800" mb={1}>
                End Date
              </Text>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                placeholderText="End Date"
                className="custom-datepicker"
              />
            </Box>
          </Flex>

          {/* Row 2: Multi Supplier select */}
          <Box>
            <Text color="whiteAlpha.800" mb={1}>
              Suppliers (Multi)
            </Text>
            <Select
              options={allSuppliers}
              value={selectedSuppliers}
              onChange={(vals) => setSelectedSuppliers(vals || [])}
              isClearable={false}
              isMulti={true}
              placeholder="Select multiple suppliers..."
              styles={{
                control: (base) => ({
                  ...base,
                  backgroundColor: "#2f353b",
                  borderColor: "#444",
                  color: "#fff",
                }),
                menu: (base) => ({
                  ...base,
                  backgroundColor: "#2f353b",
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isSelected ? "#444" : "#2f353b",
                  color: "#fff",
                  "&:hover": {
                    backgroundColor: "#3b4148",
                  },
                }),
                multiValue: (base) => ({
                  ...base,
                  backgroundColor: "#3b4148",
                  color: "#fff",
                }),
                multiValueLabel: (base) => ({
                  ...base,
                  color: "#fff",
                }),
                singleValue: (base) => ({
                  ...base,
                  color: "#fff",
                }),
              }}
            />
          </Box>

          {/* Row 3: Buttons */}
          <Stack direction="row" spacing={4}>
            <Button colorScheme="blue" onClick={handleFilter}>
              Filter
            </Button>
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
          </Stack>
        </VStack>
      </Box>

      {/* BLERJE TABLE */}
      <Box mb={6} bg="#1d2429" borderRadius="md" p={4} boxShadow="md">
        <Heading size="md" color="whiteAlpha.900" mb={4}>
          BLERJE
        </Heading>
        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr bg="#2a3036">
                <Th
                  color="whiteAlpha.800"
                  cursor="pointer"
                  onClick={() => handleSortBlerje("supplier")}
                >
                  Supplier{renderSortIndicator(sortConfigBlerje, "supplier")}
                </Th>
                <Th
                  color="whiteAlpha.800"
                  cursor="pointer"
                  onClick={() => handleSortBlerje("aggregated_total_amount")}
                >
                  Blerje Total
                  {renderSortIndicator(sortConfigBlerje, "aggregated_total_amount")}
                </Th>
                <Th
                  color="whiteAlpha.800"
                  cursor="pointer"
                  onClick={() => handleSortBlerje("aggregated_amount_paid")}
                >
                  Blerje Paid
                  {renderSortIndicator(sortConfigBlerje, "aggregated_amount_paid")}
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {sortedBlerje.map((row, idx) => (
                <Tr key={idx} _hover={{ bg: "#2f353b" }}>
                  <Td color="whiteAlpha.900">{row.supplier}</Td>
                  <Td color="whiteAlpha.900">{row.aggregated_total_amount}</Td>
                  <Td color="whiteAlpha.900">{row.aggregated_amount_paid}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>

      {/* BORXHE TABLE */}
      <Box bg="#1d2429" borderRadius="md" p={4} boxShadow="md">
        <Heading size="md" color="whiteAlpha.900" mb={4}>
          BORXHE QE TE KANE TY
        </Heading>
        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr bg="#2a3036">
                <Th
                  color="whiteAlpha.800"
                  cursor="pointer"
                  onClick={() => handleSortBorxhe("supplier")}
                >
                  Supplier{renderSortIndicator(sortConfigBorxhe, "supplier")}
                </Th>
                <Th
                  color="whiteAlpha.800"
                  cursor="pointer"
                  onClick={() => handleSortBorxhe("aggregated_total_amount")}
                >
                  Borxhe Total
                  {renderSortIndicator(sortConfigBorxhe, "aggregated_total_amount")}
                </Th>
                <Th
                  color="whiteAlpha.800"
                  cursor="pointer"
                  onClick={() => handleSortBorxhe("aggregated_amount_paid")}
                >
                  Borxhe Paid
                  {renderSortIndicator(sortConfigBorxhe, "aggregated_amount_paid")}
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {sortedBorxhe.map((row, idx) => (
                <Tr key={idx} _hover={{ bg: "#2f353b" }}>
                  <Td color="whiteAlpha.900">{row.supplier}</Td>
                  <Td color="whiteAlpha.900">{row.aggregated_total_amount}</Td>
                  <Td color="whiteAlpha.900">{row.aggregated_amount_paid}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}
