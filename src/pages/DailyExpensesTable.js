import React, { useState } from "react";
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from "@chakra-ui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Predefined sellers
const SELLERS = ["KRISTI", "VERA", "JONI", "FLORI", "DEA", "ENISA"];

export default function ExpensesTable() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tableData, setTableData] = useState(
    SELLERS.map((seller) => ({
      seller,
      dailyTotal: "",
      cashDailyTotal: "",
      expense: "",
      amount: "",
      description: "",
    }))
  );

  const handleInputChange = (index, field, value) => {
    const updatedData = [...tableData];
    updatedData[index][field] = value;
    setTableData(updatedData);
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`${API_URL}/expenses/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate.toISOString().split("T")[0],
          entries: tableData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save expenses");
      }

      alert("Expenses saved successfully!");
    } catch (error) {
      console.error("Error saving expenses:", error);
      alert("Failed to save expenses");
    }
  };

  return (
    <Box p={4} bg="gray.50" minH="100vh">
      <Heading mb={6} textAlign="center">
        Vila Ferdinand
      </Heading>

      <Box mb={4} textAlign="left">
        <FormLabel>Select Date:</FormLabel>
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          dateFormat="dd/MM/yyyy"
        />
      </Box>

      <TableContainer bg="white" p={4} borderRadius="md" boxShadow="md">
        <Table variant="simple" border="1px solid black">
          <Thead>
            <Tr>
              <Th border="1px solid black">Seller</Th>
              <Th border="1px solid black">Daily Total</Th>
              <Th border="1px solid black">Cash Daily Total</Th>
              <Th border="1px solid black">Expense 01</Th>
              <Th border="1px solid black">Amount Expense 01</Th>
              <Th border="1px solid black">Description Expense 01</Th>
            </Tr>
          </Thead>
          <Tbody>
            {tableData.map((row, index) => (
              <Tr key={index}>
                <Td border="1px solid black">{row.seller}</Td>
                <Td border="1px solid black">
                  <Input
                    value={row.dailyTotal}
                    onChange={(e) => handleInputChange(index, "dailyTotal", e.target.value)}
                    placeholder="Enter total"
                  />
                </Td>
                <Td border="1px solid black">
                  <Input
                    value={row.cashDailyTotal}
                    onChange={(e) => handleInputChange(index, "cashDailyTotal", e.target.value)}
                    placeholder="Enter cash total"
                  />
                </Td>
                <Td border="1px solid black">
                  <Input
                    value={row.expense}
                    onChange={(e) => handleInputChange(index, "expense", e.target.value)}
                    placeholder="Enter expense"
                  />
                </Td>
                <Td border="1px solid black">
                  <Input
                    value={row.amount}
                    onChange={(e) => handleInputChange(index, "amount", e.target.value)}
                    placeholder="Enter amount"
                  />
                </Td>
                <Td border="1px solid black">
                  <Input
                    value={row.description}
                    onChange={(e) => handleInputChange(index, "description", e.target.value)}
                    placeholder="Enter description"
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      <Box mt={4} textAlign="center">
        <Button colorScheme="blue" onClick={handleSave}>
          Save Expenses
        </Button>
      </Box>
    </Box>
  );
}
