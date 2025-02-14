import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
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
  useToast,
  IconButton,
  Flex,
  Card,
  CardBody,
  CardHeader,
  Stack,
  StackDivider
} from "@chakra-ui/react";
import { DeleteIcon, AddIcon, CalendarIcon,RepeatIcon} from "@chakra-ui/icons";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./DailyExpenses.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Predefined sellers
const SELLERS = ["KRISTI", "VERA", "JONI", "FLORI", "DEA", "ENISA"];

// Maximum number of sets of expense columns we allow
const MAX_EXPENSE_SETS = 15;

// Define a light green color for rows
const ROW_COLOR = "#e8f5e9";

export default function ExpensesTableWithView() {
  const toast = useToast();
  
  const [entryDate, setEntryDate] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date());

  // How many expense columns are currently displayed (initially 1)?
  const [expenseSetsCount, setExpenseSetsCount] = useState(1);

  // We'll store table data as an array of objects (one per seller).
  // Each object has dailyTotal, cashDailyTotal, and an array of up to 15 possible expense sets.
  const [tableData, setTableData] = useState(
    SELLERS.map((seller) => ({
      seller,
      dailyTotal: "",
      cashDailyTotal: "",
      expenses: Array.from({ length: MAX_EXPENSE_SETS }, () => ({
        expense: "",
        amount: "",
        description: "",
      })),
    }))
  );

  // Raw expenses from the server. We’ll transform them for display in the dynamic table.
  const [rawExpenses, setRawExpenses] = useState([]);

  // --- Helper: Group rawExpenses by seller so we can show multiple columns in a single row ---
  // This transforms the array of rows (one row per expense line) into
  // an array of "grouped" objects, each with:
  //  {
  //    seller: string,
  //    dailyTotal: string,
  //    cashDailyTotal: string,
  //    date: string,
  //    expenses: [
  //      { id, expense, amount, description },  // 1st line
  //      { id, expense, amount, description },  // 2nd line
  //      ...
  //    ]
  //  }
  // We'll also find the maximum number of expense sets among all sellers to know how many columns to display.
  const groupedExpenses = React.useMemo(() => {
    const bySeller = {};
    rawExpenses.forEach((row) => {
      const key = `${row.seller}||${row.date}`; // group by (seller, date)
      if (!bySeller[key]) {
        bySeller[key] = {
          seller: row.seller,
          date: row.date,
          // We'll just take the daily/cash totals from the first row we see for that seller
          dailyTotal: row.daily_total || "",
          cashDailyTotal: row.cash_daily_total || "",
          expenses: [],
        };
      }
      bySeller[key].expenses.push({
        id: row.id,
        expense: row.expense,
        amount: row.amount,
        description: row.description,
      });
    });

    // Convert the object into an array
    const groupedArray = Object.values(bySeller);

    // Calculate how many expense sets the "View" table needs to show
    let max = 0;
    groupedArray.forEach((group) => {
      if (group.expenses.length > max) {
        max = group.expenses.length;
      }
    });

    return { data: groupedArray, maxExpenseColumns: max };
  }, [rawExpenses]);

  // --- Add or remove columns for the "Entry" table ---
  const handleAddExpenseSet = () => {
    if (expenseSetsCount < MAX_EXPENSE_SETS) {
      setExpenseSetsCount(expenseSetsCount + 1);
    } else {
      toast({
        title: "Limit Reached",
        description: `You can only add up to ${MAX_EXPENSE_SETS} expenses.`,
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleRemoveExpenseSet = () => {
    // Only allow removing if we have more than 1
    if (expenseSetsCount > 1) {
      setExpenseSetsCount(expenseSetsCount - 1);
    }
  };

  // Handle input change for dailyTotal / cashDailyTotal
  const handleInputChange = (rowIndex, field, value) => {
    setTableData((prev) => {
      const updated = [...prev];
      updated[rowIndex][field] = value;
      return updated;
    });
  };

  // Handle input change for the dynamic expense fields
  const handleExpenseChange = (rowIndex, expenseIndex, field, value) => {
    setTableData((prev) => {
      const updated = [...prev];
      updated[rowIndex].expenses[expenseIndex][field] = value;
      return updated;
    });
  };

  // Fetch expenses for a given date
  const fetchExpenses = async (date) => {
    const dateStr = date.toISOString().split("T")[0];
    try {
      const response = await fetch(`${API_URL}/expenses/bulk?date=${dateStr}`);
      if (!response.ok) {
        throw new Error("Failed to fetch expenses");
      }
      const data = await response.json();
      setRawExpenses(data);
    } catch (error) {
      toast({
        title: "Error fetching expenses",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Save new expenses
  const handleSave = async () => {
    // Flatten the data: for each row (seller), we have up to expenseSetsCount expense lines.
    const entriesToSave = [];

    tableData.forEach((row) => {
      // Check if this row has any data at all
      const rowHasData =
        row.dailyTotal.trim() ||
        row.cashDailyTotal.trim() ||
        row.expenses.some(
          (exp) =>
            exp.expense.trim() ||
            exp.amount.trim() ||
            exp.description.trim()
        );

      if (!rowHasData) {
        // skip entirely if no data
        return;
      }

      // For each expense set up to expenseSetsCount, if user typed something, add it
      for (let i = 0; i < expenseSetsCount; i++) {
        const { expense, amount, description } = row.expenses[i];
        const hasExpenseData =
          expense.trim() || amount.trim() || description.trim();

        if (hasExpenseData) {
          entriesToSave.push({
            seller: row.seller,
            dailyTotal: row.dailyTotal,
            cashDailyTotal: row.cashDailyTotal,
            expense,
            amount,
            description,
          });
        }
      }
    });

    if (entriesToSave.length === 0) {
      toast({
        title: "Error",
        description: "No valid entries to save",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const dateStr = entryDate.toISOString().split("T")[0];

    // (Optional) Skip duplicates if the seller already exists for this date:
    let existingExpensesForDate = [];
    try {
      const response = await fetch(`${API_URL}/expenses/bulk?date=${dateStr}`);
      if (!response.ok) {
        throw new Error("Failed to fetch existing expenses");
      }
      existingExpensesForDate = await response.json();
    } catch (error) {
      console.error("Error fetching existing expenses:", error);
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Build a set of existing sellers
    const existingSellers = new Set(
      existingExpensesForDate.map((ex) => ex.seller.toUpperCase())
    );

    // Filter out any entries whose seller is already in the set
    const uniqueEntries = entriesToSave.filter(
      (entry) => !existingSellers.has(entry.seller.toUpperCase())
    );

    if (uniqueEntries.length === 0) {
      toast({
        title: "Info",
        description:
          "No new entries to add (all duplicates for these sellers on this date).",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Finally, POST those entries
    try {
      const response = await fetch(`${API_URL}/expenses/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedDate: dateStr,
          entries: uniqueEntries,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save expenses");
      }

      toast({
        title: "Success",
        description: "Expenses saved successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Refresh the expense list
      fetchExpenses(viewDate);
    } catch (error) {
      console.error("Error saving expenses:", error);
      toast({
        title: "Error",
        description: "Failed to save expenses",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };
  const handleClearExpenses = () => {
    setTableData(
      SELLERS.map((seller) => ({
        seller,
        dailyTotal: "",
        cashDailyTotal: "",
        expenses: Array.from({ length: MAX_EXPENSE_SETS }, () => ({
          expense: "",
          amount: "",
          description: "",
        })),
      }))
    );
    toast({ title: "Cleared", description: "All expense inputs have been cleared", status: "info" });
  };

  // Delete an expense line
  const handleDeleteExpense = async (id) => {
    try {
      const response = await fetch(`${API_URL}/expenses/bulk/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete expense");
      }
      toast({
        title: "Success",
        description: "Expense deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchExpenses(viewDate);
    } catch (error) {
      toast({
        title: "Error deleting expense",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Fetch expenses whenever the viewDate changes
  useEffect(() => {
    fetchExpenses(viewDate);
  }, [viewDate]);

  return (
    <Box p={4} bg="gray.50" minH="100vh">
      <Heading mb={6} textAlign="center">
        Vila Ferdinand - Expense Management
      </Heading>

     {/* --- Expense Entry Section --- */}
     <Box mb={10}>
     <FormLabel fontWeight="bold" fontSize="2xl"> DATA: </FormLabel>
     <CalendarIcon ml={1} boxSize={20} />

        <DatePicker
          selected={entryDate}
          onChange={setEntryDate}
          dateFormat="dd/MM/yyyy"
          className="custom-datepicker"
        />

        <TableContainer
          className="table-container"
          p={4}
          mt={4}
          overflowX="auto"
        >
          <Table variant="simple" border="1px solid black">
            <Thead>
              <Tr className="table-header">
                <Th>Seller</Th>
                <Th>Daily Total</Th>
                <Th>Cash Daily Total</Th>
                {/* Render the dynamic sets of columns */}
                {[...Array(expenseSetsCount)].map((_, i) => (
                  <React.Fragment key={i}>
                    <Th>Expense {i + 1}</Th>
                    <Th>Amount {i + 1}</Th>
                    <Th>Description {i + 1}</Th>
                  </React.Fragment>
                ))}
              </Tr>
            </Thead>

            <Tbody>
              {tableData.map((row, rowIndex) => (
                <Tr key={rowIndex} style={{ backgroundColor: ROW_COLOR }}>
                  <Td>{row.seller}</Td>
                  <Td>
                    <Input
                      className="custom-input"
                      value={row.dailyTotal}
                      onChange={(e) =>
                        handleInputChange(rowIndex, "dailyTotal", e.target.value)
                      }
                      placeholder="0 "
                    />
                  </Td>
                  <Td>
                    <Input
                      className="custom-input"
                      value={row.cashDailyTotal}
                      onChange={(e) =>
                        handleInputChange(
                          rowIndex,
                          "cashDailyTotal",
                          e.target.value
                        )
                      }
                      placeholder="0"
                    />
                  </Td>

                  {/* Render each of the expense sets that are currently visible */}
                  {[...Array(expenseSetsCount)].map((_, expenseIndex) => (
                    <React.Fragment key={expenseIndex}>
                      <Td>
                        <Input
                          className="custom-input"
                          value={row.expenses[expenseIndex].expense}
                          onChange={(e) =>
                            handleExpenseChange(
                              rowIndex,
                              expenseIndex,
                              "expense",
                              e.target.value
                            )
                          }
                          placeholder={`Blerje ${expenseIndex + 1}`}
                        />
                      </Td>
                      <Td>
                        <Input
                          className="custom-input"
                          value={row.expenses[expenseIndex].amount}
                          onChange={(e) =>
                            handleExpenseChange(
                              rowIndex,
                              expenseIndex,
                              "amount",
                              e.target.value
                            )
                          }
                          placeholder={`0`}
                        />
                      </Td>
                      <Td>
                        <Input
                        className="custom-input"
                        
                          value={row.expenses[expenseIndex].description}
                          onChange={(e) =>
                            handleExpenseChange(
                              rowIndex,
                              expenseIndex,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder={`Detaje ${expenseIndex + 1}`}
                        />
                      </Td>
                    </React.Fragment>
                  ))}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>

        {/* Buttons for adding/removing expense columns or saving */}
        <Flex mt={4} gap={4} justify="center">
          <Button leftIcon={<AddIcon />} onClick={handleAddExpenseSet}>
            Add Expense Columns
          </Button>
          <Button
            onClick={handleRemoveExpenseSet}
            isDisabled={expenseSetsCount <= 1}
          >
            Remove Expense Columns
          </Button>
          <Button colorScheme="blue" onClick={handleSave}>
            Save Expenses
          </Button>

          <Button colorScheme="orange" leftIcon={<RepeatIcon />} onClick={handleClearExpenses}>Clear Expenses</Button>
        </Flex>
      </Box>

      {/* --- View / Edit Existing Expenses (grouped by seller) --- */}
      <Box mb={10}>
     <FormLabel fontWeight="bold" fontSize="2xl"> DATA: </FormLabel>
     <CalendarIcon ml={1} boxSize={20} />

        <DatePicker
          selected={entryDate}
          onChange={setEntryDate}
          dateFormat="dd/MM/yyyy"
          className="custom-datepicker"
        />

        <Stack spacing={4} mt={4}>
          {groupedExpenses.data.map((group, rowIndex) => (
            <Card key={rowIndex} className="card-container">
              <CardHeader className="card-header">
                <Heading size="md">{group.seller}</Heading>
              </CardHeader>
              <CardBody className="card-body">
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr className="table-header">
                        <Th>Daily Total</Th>
                        <Th>Cash Daily Total</Th>
                        {[...Array(groupedExpenses.maxExpenseColumns)].map((_, i) => (
                          <React.Fragment key={i}>
                            <Th>Expense {i + 1}</Th>
                            <Th>Amount {i + 1}</Th>
                            <Th>Description {i + 1}</Th>
                            <Th>Delete {i + 1}</Th>
                          </React.Fragment>
                        ))}
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr className="table-row" style={{ backgroundColor: ROW_COLOR }}>
                        <Td>{group.dailyTotal}</Td>
                        <Td>{group.cashDailyTotal}</Td>
                        {[...Array(groupedExpenses.maxExpenseColumns)].map((_, colIndex) => {
                          const expLine = group.expenses[colIndex];
                          if (!expLine) {
                            // No data for this expense index
                            return (
                              <React.Fragment key={colIndex}>
                                <Td></Td>
                                <Td></Td>
                                <Td></Td>
                                <Td></Td>
                              </React.Fragment>
                            );
                          }

                          return (
                            <React.Fragment key={colIndex}>
                              <Td>{expLine.expense}</Td>
                              <Td>{expLine.amount}</Td>
                              <Td>{expLine.description}</Td>
                              <Td>
                                <IconButton
                                  aria-label="Delete"
                                  icon={<DeleteIcon />}
                                  colorScheme="red"
                                  onClick={() => handleDeleteExpense(expLine.id)}
                                />
                              </Td>
                            </React.Fragment>
                          );
                        })}
                      </Tr>
                    </Tbody>
                  </Table>
                </TableContainer>
              </CardBody>
            </Card>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}