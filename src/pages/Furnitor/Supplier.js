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
  const [aggregatedData, setAggregatedData] = useState([]);
  const toast = useToast();

  useEffect(() => {
    async function fetchAggregatedData() {
      try {
        const response = await fetch(`${API_URL}/aggregated-modified-expenses`);
        if (!response.ok) {
          throw new Error("Failed to fetch aggregated data");
        }
        const data = await response.json();
        setAggregatedData(data);
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
      <Heading mb={4}>Aggregated Custom Rows</Heading>
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr bg="gray.200">
              <Th>Supplier</Th>
              <Th>Aggregated Total Amount</Th>
              <Th>Aggregated Amount Paid</Th>
            </Tr>
          </Thead>
          <Tbody>
            {aggregatedData.map((row, index) => (
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
