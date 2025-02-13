// DailyExpenses.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Flex,
} from "@chakra-ui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Set this to your backend URL; if using an environment variable, ensure REACT_APP_API_URL is set.
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const DailyExpenses = () => {
  // Form input state
  const [expenseName, setExpenseName] = useState("");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState(new Date());
  const [description, setDescription] = useState("");

  // Expenses list state (retrieved from backend)
  const [expenses, setExpenses] = useState([]);

  // Filter date state (to view expenses for a selected day)
  const [filterDate, setFilterDate] = useState(new Date());

  // Handler to add a new expense
  const handleAddExpense = async () => {
    // Basic validation
    if (!expenseName || !amount || isNaN(amount)) {
      alert("Please provide a valid expense name and numeric amount.");
      return;
    }
    const newExpense = {
      name: expenseName,
      amount: parseFloat(amount),
      expense_date: expenseDate.toISOString(),
      description,
    };

    try {
      const response = await fetch(`${API_URL}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newExpense),
      });
      if (!response.ok) {
        throw new Error("Failed to add expense");
      }
      // Re-fetch expenses for the currently selected filter date
      fetchExpenses(filterDate);
      // Clear the form fields
      setExpenseName("");
      setAmount("");
      setExpenseDate(new Date());
      setDescription("");
    } catch (error) {
      console.error(error);
      alert("Error adding expense");
    }
  };

  // Fetch expenses for a given day
  const fetchExpenses = async (date) => {
    try {
      // Convert date to YYYY-MM-DD
      const dateStr = date.toISOString().split("T")[0];
      const response = await fetch(`${API_URL}/expenses?date=${dateStr}`);
      if (!response.ok) {
        throw new Error("Failed to fetch expenses");
      }
      const data = await response.json();
      setExpenses(data);
    } catch (error) {
      console.error(error);
      alert("Error fetching expenses");
    }
  };

  // When the filter date changes, fetch expenses for that day
  useEffect(() => {
    fetchExpenses(filterDate);
  }, [filterDate]);

  return (
    <Box p={4} bg="gray.50" minH="100vh">
      <Heading mb={4} textAlign="center">
        Daily Expenses Tracker
      </Heading>

      {/* Expense Entry Form */}
      <Box
        bg="white"
        p={4}
        mb={8}
        borderRadius="md"
        boxShadow="md"
        maxW="600px"
        mx="auto"
      >
        <Heading as="h2" size="md" mb={4}>
          Add New Expense
        </Heading>
        <FormControl id="expenseName" mb={3}>
          <FormLabel>Expense Name</FormLabel>
          <Input
            placeholder="e.g. Gas"
            value={expenseName}
            onChange={(e) => setExpenseName(e.target.value)}
          />
        </FormControl>
        <FormControl id="amount" mb={3}>
          <FormLabel>Amount (ALL)</FormLabel>
          <Input
            type="number"
            placeholder="e.g. 20000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </FormControl>
        <FormControl id="expenseDate" mb={3}>
          <FormLabel>Date</FormLabel>
          <DatePicker
            selected={expenseDate}
            onChange={(date) => setExpenseDate(date)}
            dateFormat="dd/MM/yyyy"
          />
        </FormControl>
        <FormControl id="description" mb={3}>
          <FormLabel>Description</FormLabel>
          <Textarea
            placeholder="Additional details (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </FormControl>
        <Button colorScheme="blue" onClick={handleAddExpense}>
          Add Expense
        </Button>
      </Box>

      {/* Filter Section */}
      <Box
        bg="white"
        p={4}
        mb={8}
        borderRadius="md"
        boxShadow="md"
        maxW="600px"
        mx="auto"
      >
        <Heading as="h2" size="md" mb={4}>
          View Expenses for a Day
        </Heading>
        <Flex alignItems="center">
          <Box mr={2}>
            <FormLabel mb={0}>Select Date:</FormLabel>
          </Box>
          <DatePicker
            selected={filterDate}
            onChange={(date) => setFilterDate(date)}
            dateFormat="dd/MM/yyyy"
          />
        </Flex>
      </Box>

      {/* Expenses Table */}
      <Box maxW="800px" mx="auto">
        <Heading as="h2" size="md" mb={4}>
          Expenses on {filterDate.toLocaleDateString()}
        </Heading>
        {expenses.length > 0 ? (
          <TableContainer bg="white" p={4} borderRadius="md" boxShadow="md">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Expense Name</Th>
                  <Th isNumeric>Amount (ALL)</Th>
                  <Th>Date</Th>
                  <Th>Description</Th>
                </Tr>
              </Thead>
              <Tbody>
                {expenses.map((expense) => (
                  <Tr key={expense.id}>
                    <Td>{expense.name}</Td>
                    <Td isNumeric>{Number(expense.amount).toLocaleString()}</Td>
                    <Td>{new Date(expense.expense_date).toLocaleDateString()}</Td>
                    <Td>{expense.description}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        ) : (
          <Box textAlign="center" mt={4}>
            No expenses logged for this day.
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default DailyExpenses;
