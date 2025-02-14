import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  Flex,
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

export default function DailyExpenses() {
  // -- 1) MULTI-EXPENSE FORM STATES
  const [expenses, setExpenses] = useState([
    { name: "", amount: "", date: new Date(), description: "" },
  ]);

  // -- 2) DAILY EXPENSE VIEW STATES
  const [filterDate, setFilterDate] = useState(new Date());
  const [dailyExpenses, setDailyExpenses] = useState([]);

  // -- 3) MULTI-EXPENSE FORM LOGIC
  const addExpenseRow = () => {
    setExpenses((prev) => [
      ...prev,
      { name: "", amount: "", date: new Date(), description: "" },
    ]);
  };

  const handleChange = (index, field, value) => {
    setExpenses((prev) =>
      prev.map((expense, i) =>
        i === index ? { ...expense, [field]: value } : expense
      )
    );
  };

  const handleSubmitAll = async () => {
    // Basic validation
    if (
      expenses.some(
        (exp) => !exp.name || !exp.amount || isNaN(Number(exp.amount))
      )
    ) {
      alert("Please fill out name and a valid numeric amount for all expenses");
      return;
    }

    try {
      // Each expense is sent to POST /expenses individually
      await Promise.all(
        expenses.map(async (exp) => {
          const payload = {
            name: exp.name,
            amount: parseFloat(exp.amount),
            expense_date: exp.date.toISOString(),
            description: exp.description,
          };
          const response = await fetch(`${API_URL}/expenses`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!response.ok) {
            throw new Error("Failed to add one of the expenses");
          }
        })
      );

      alert("All expenses successfully added!");
      // Clear the multi-expense form
      setExpenses([{ name: "", amount: "", date: new Date(), description: "" }]);

      // Refresh daily list (so we see new items if they match the filter date)
      fetchDailyExpenses(filterDate);
    } catch (error) {
      console.error(error);
      alert("Error adding expenses");
    }
  };

  // -- 4) DAILY EXPENSES FETCH LOGIC
  const fetchDailyExpenses = async (date) => {
    const dateStr = date.toISOString().split("T")[0];
    try {
      const response = await fetch(`${API_URL}/expenses?date=${dateStr}`);
      if (!response.ok) {
        throw new Error("Failed to fetch expenses");
      }
      const data = await response.json();
      setDailyExpenses(data);
    } catch (err) {
      console.error(err);
      alert("Error fetching expenses");
    }
  };

  useEffect(() => {
    fetchDailyExpenses(filterDate);
  }, [filterDate]);

  // -- 5) Delete a single expense
  const handleDeleteExpense = async (id) => {
    try {
      const response = await fetch(`${API_URL}/expenses/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete expense");
      }
      alert("Expense deleted successfully!");
      // Refresh list
      fetchDailyExpenses(filterDate);
    } catch (err) {
      console.error(err);
      alert("Error deleting expense");
    }
  };

  // -- 6) RENDER
  return (
    <Box p={4} bg="gray.50" minH="100vh">
      <Heading mb={4} textAlign="center">
        Daily Expenses
      </Heading>

      {/* Multi-Expense Form */}
      <Heading as="h2" size="lg" mb={4} textAlign="center">
        Add Multiple Expenses
      </Heading>

      {expenses.map((expense, index) => (
        <Box
          key={index}
          bg="white"
          p={4}
          mb={4}
          borderRadius="md"
          boxShadow="md"
          maxW="600px"
          mx="auto"
        >
          <Heading as="h3" size="md" mb={4}>
            Expense #{index + 1}
          </Heading>
          <FormControl mb={3}>
            <FormLabel>Expense Name</FormLabel>
            <Input
              placeholder="e.g. Gas"
              value={expense.name}
              onChange={(e) => handleChange(index, "name", e.target.value)}
            />
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>Amount (ALL)</FormLabel>
            <Input
              type="number"
              placeholder="e.g. 20000"
              value={expense.amount}
              onChange={(e) => handleChange(index, "amount", e.target.value)}
            />
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>Date</FormLabel>
            <DatePicker
              selected={expense.date}
              onChange={(date) => handleChange(index, "date", date)}
              dateFormat="dd/MM/yyyy"
            />
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>Description</FormLabel>
            <Textarea
              placeholder="Additional details (optional)"
              value={expense.description}
              onChange={(e) =>
                handleChange(index, "description", e.target.value)
              }
            />
          </FormControl>
        </Box>
      ))}

      <Flex maxW="600px" mx="auto" justifyContent="space-between" mt={4}>
        <Button colorScheme="green" onClick={addExpenseRow}>
          Add Another Expense
        </Button>
        <Button colorScheme="blue" onClick={handleSubmitAll}>
          Submit All
        </Button>
      </Flex>

      {/* Filter section */}
      <Box
        bg="white"
        p={4}
        mt={8}
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

      {/* Daily Expenses Table */}
      <Box maxW="800px" mx="auto">
        <Heading as="h2" size="md" mb={4}>
          Expenses on {filterDate.toLocaleDateString()}
        </Heading>
        {dailyExpenses.length > 0 ? (
          <TableContainer bg="white" p={4} borderRadius="md" boxShadow="md">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Expense Name</Th>
                  <Th isNumeric>Amount (ALL)</Th>
                  <Th>Date</Th>
                  <Th>Description</Th>
                  <Th>Action</Th> {/* NEW COLUMN for delete button */}
                </Tr>
              </Thead>
              <Tbody>
                {dailyExpenses.map((expense) => (
                  <Tr key={expense.id}>
                    <Td>{expense.name}</Td>
                    <Td isNumeric>{Number(expense.amount).toLocaleString()}</Td>
                    <Td>
                      {new Date(expense.expense_date).toLocaleDateString()}
                    </Td>
                    <Td>{expense.description}</Td>
                    <Td>
                      {/* Delete Button */}
                      <Button
                        colorScheme="red"
                        size="sm"
                        onClick={() => handleDeleteExpense(expense.id)}
                      >
                        Delete
                      </Button>
                    </Td>
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
}
