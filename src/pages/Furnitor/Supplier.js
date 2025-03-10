import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useToast,
} from "@chakra-ui/react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function AggregatedCustomRows() {
  const [blerjeData, setBlerjeData] = useState([]);
  const [borxheData, setBorxheData] = useState([]);
  const toast = useToast();

  useEffect(() => {
    async function fetchAggregatedData() {
      try {
        const response = await fetch(`${API_URL}/aggregated-modified-expenses`);
        if (!response.ok) {
          throw new Error("Failed to fetch aggregated data");
        }
        const data = await response.json();

        // Separate BLERJE from BORXHE
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
    fetchAggregatedData();
  }, [toast]);

  return (
    <Box p={4}>
      <Box p={4} backgroundColor={"#f5f5f5"}>
        <Heading mb={4} size="md" align="center">
          BLERJE
        </Heading>
      </Box>
      <TableContainer mb={8}>
        <Table variant="striped" colorScheme="gray">
          <Thead>
            <Tr bg="gray.200">
              <Th>Supplier</Th>
              <Th>Blerje Total Amount</Th>
              <Th>Blerje Amount Paid</Th>
            </Tr>
          </Thead>
          <Tbody>
            {blerjeData.map((row, index) => (
              <Tr key={index}>
                <Td>{row.supplier}</Td>
                <Td>{row.aggregated_total_amount}</Td>
                <Td>{row.aggregated_amount_paid}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      {/* Table for BORXHE */}
      <Box p={4} backgroundColor={"#f5f5f5"}>
        <Heading mb={4} size="md" align="center">
          BORXHE QE TE KANE TY
        </Heading>
      </Box>
      <TableContainer>
        <Table variant="striped" colorScheme="gray">
          <Thead>
            <Tr bg="gray.200">
              <Th>Supplier</Th>
              <Th>Borxhe Total Amount</Th>
              <Th>Borxhe Amount Paid</Th>
            </Tr>
          </Thead>
          <Tbody>
            {borxheData.map((row, index) => (
              <Tr key={index}>
                <Td>{row.supplier}</Td>
                <Td>{row.aggregated_total_amount}</Td>
                <Td>{row.aggregated_amount_paid}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
}
