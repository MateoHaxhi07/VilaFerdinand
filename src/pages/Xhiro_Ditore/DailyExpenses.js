import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Heading,
  FormLabel,
  Input,
  Button,
  Grid,
  Table,
  Thead,
  Tbody,
  Tr,
  GridItem,
  Th,
  Td,
  TableContainer,
  Flex,
  IconButton,
  useToast,
  Divider,
  Text,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Center,
} from "@chakra-ui/react";
import { DeleteIcon, AddIcon, CalendarIcon, RepeatIcon } from "@chakra-ui/icons";
import { motion } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Adjust if you have a .env
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Define sellers and other constants
const SELLERS = ["KRISTI", "VERA", "JONI", "FLORI", "DEA", "ENISA"];
const MAX_EXPENSE_SETS = 15;
const ROW_COLOR = "#e8f5e9";

export default function DailyExpenses() {
  const toast = useToast();

  // Inject custom DatePicker styles for dark theme (inside the component)
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .react-datepicker__input-container input {
        background-color: #2D3748 !important;
        color: #FFF !important;
        border: 1px solid #4A5568 !important;
        padding: 8px;
        border-radius: 5px;
        font-weight: bold;
      }
      .react-datepicker {
        background-color: #2D3748 !important;
        color: #FFF !important;
      }
      .react-datepicker__day-name,
      .react-datepicker__day,
      .react-datepicker__time-name {
        color: #FFF !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Entry date for new daily expenses
  const [entryDate, setEntryDate] = useState(new Date());
  // View date for existing daily expenses
  const [viewDate, setViewDate] = useState(new Date());

  // How many dynamic expense columns we show
  const [expenseSetsCount, setExpenseSetsCount] = useState(1);

  // Table data for input: one row per seller
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

  // Fetched data from the server for the selected "view date"
  const [rawExpenses, setRawExpenses] = useState([]);

  // Group raw expenses by seller and date
  const groupedExpenses = useMemo(() => {
    const byKey = {};
    rawExpenses.forEach((row) => {
      const key = `${row.seller}||${row.date}`;
      if (!byKey[key]) {
        byKey[key] = {
          seller: row.seller,
          date: row.date,
          dailyTotal: row.daily_total || "",
          cashDailyTotal: row.cash_daily_total || "",
          items: [],
        };
      }
      byKey[key].items.push({
        id: row.id,
        expense: row.expense,
        amount: row.amount,
        description: row.description,
      });
    });

    const groupedArr = Object.values(byKey);
    let maxCols = 0;
    groupedArr.forEach((g) => {
      if (g.items.length > maxCols) maxCols = g.items.length;
    });
    return { data: groupedArr, maxCols };
  }, [rawExpenses]);

  /* Total calculation for daily expenses */
  const totals = useMemo(() => {
    let totalDaily = 0;
    let totalCashDaily = 0;
    let totalExpenseCombined = 0;

    tableData.forEach((row) => {
      totalDaily += parseFloat(row.dailyTotal) || 0;
      totalCashDaily += parseFloat(row.cashDailyTotal) || 0;
      for (let i = 0; i < expenseSetsCount; i++) {
        totalExpenseCombined += parseFloat(row.expenses[i].amount) || 0;
      }
    });

    return { totalDaily, totalCashDaily, totalExpenseCombined };
  }, [tableData, expenseSetsCount]);

  // Add or remove expense columns
  const handleAddExpenseSet = () => {
    if (expenseSetsCount < MAX_EXPENSE_SETS) {
      setExpenseSetsCount(expenseSetsCount + 1);
    } else {
      toast({
        title: "Limit Reached",
        description: `Max columns = ${MAX_EXPENSE_SETS}`,
        status: "warning",
      });
    }
  };
  const handleRemoveExpenseSet = () => {
    if (expenseSetsCount > 1) setExpenseSetsCount(expenseSetsCount - 1);
  };

  // Handle changes in dailyTotal, cashDailyTotal
  const handleInputChange = (rowIndex, field, value) => {
    setTableData((prev) => {
      const updated = [...prev];
      updated[rowIndex][field] = value;
      return updated;
    });
  };

  // Handle changes in dynamic expense sets
  const handleExpenseChange = (rowIndex, expenseIndex, field, value) => {
    setTableData((prev) => {
      const updated = [...prev];
      updated[rowIndex].expenses[expenseIndex][field] = value;
      return updated;
    });
  };

  // Fetch existing daily expenses for a date
  const fetchExpenses = async (date) => {
    const dateStr = date.toISOString().split("T")[0];
    try {
      const resp = await fetch(`${API_URL}/expenses/bulk?date=${dateStr}`);
      if (!resp.ok) {
        throw new Error("Failed to fetch daily expenses");
      }
      const data = await resp.json();
      setRawExpenses(data);
    } catch (error) {
      toast({
        title: "Error fetching",
        description: error.message,
        status: "error",
      });
    }
  };

  useEffect(() => {
    fetchExpenses(viewDate);
  }, [viewDate]);

  // Save new daily expenses
  const handleSave = async () => {
    const entriesToSave = [];
    tableData.forEach((row) => {
      const rowHasData =
        row.dailyTotal.trim() ||
        row.cashDailyTotal.trim() ||
        row.expenses.some(
          (exp) =>
            exp.expense.trim() || exp.amount.trim() || exp.description.trim()
        );
      if (!rowHasData) return;

      for (let i = 0; i < expenseSetsCount; i++) {
        const { expense, amount, description } = row.expenses[i];
        if (expense.trim() || amount.trim() || description.trim()) {
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
        title: "No Data",
        description: "No valid entries to save",
        status: "error",
      });
      return;
    }
    const dateStr = entryDate.toISOString().split("T")[0];

    try {
      const resp = await fetch(`${API_URL}/expenses/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedDate: dateStr, entries: entriesToSave }),
      });
      if (!resp.ok) {
        throw new Error("Failed to save daily expenses");
      }
      toast({
        title: "Success",
        description: "Daily expenses saved",
        status: "success",
      });
      // Refresh if the same date
      if (dateStr === viewDate.toISOString().split("T")[0]) {
        fetchExpenses(viewDate);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
      });
    }
  };

  // Clear the daily input table
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
    toast({
      title: "Cleared",
      description: "All daily expenses cleared",
      status: "info",
    });
  };

  // Delete a single daily expense
  const handleDeleteExpense = async (id) => {
    try {
      const resp = await fetch(`${API_URL}/expenses/bulk/${id}`, {
        method: "DELETE",
      });
      if (!resp.ok) {
        throw new Error("Failed to delete expense");
      }
      toast({
        title: "Deleted",
        description: "Expense deleted successfully",
        status: "success",
      });
      fetchExpenses(viewDate);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
      });
    }
  };

  // Calculate totals for the view table
  const viewTotals = useMemo(() => {
    const totalsBySeller = groupedExpenses.data.map((group) => {
      let totalExpenseCombined = 0;
      group.items.forEach((item) => {
        totalExpenseCombined += parseFloat(item.amount) || 0;
      });
      return { seller: group.seller, totalExpenseCombined };
    });
    return totalsBySeller;
  }, [groupedExpenses]);

  return (
    <Box p={1}>
      {/* Entry Table */}
      <FormLabel fontWeight="bold" fontSize="md" mb={5} textColor="black.100">
        ZGJIDH DATEN
      </FormLabel>
      <CalendarIcon boxSize={10} mr={7} />
      <DatePicker
        selected={entryDate}
        onChange={setEntryDate}
        dateFormat="dd/MM/yyyy"
        className="custom-datepicker"
      />

      <TableContainer mt={4} p={4} bg="white" borderRadius="md" boxShadow="md">
        <Table variant="simple">
          <Thead>
            <Tr bg="gray.200">
              <Th>Seller</Th>
              <Th>TOTAL</Th>
              <Th>Cash Total</Th>
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
              <Tr key={rowIndex} bg={ROW_COLOR}>
                <Td>{row.seller}</Td>
                <Td>
                  <Input
                    value={row.dailyTotal}
                    onChange={(e) =>
                      handleInputChange(rowIndex, "dailyTotal", e.target.value)
                    }
                    placeholder="0"
                  />
                </Td>
                <Td>
                  <Input
                    value={row.cashDailyTotal}
                    onChange={(e) =>
                      handleInputChange(rowIndex, "cashDailyTotal", e.target.value)
                    }
                    placeholder="0"
                  />
                </Td>
                {[...Array(expenseSetsCount)].map((_, expIndex) => (
                  <React.Fragment key={expIndex}>
                    <Td>
                      <Input
                        value={row.expenses[expIndex].expense}
                        onChange={(e) =>
                          handleExpenseChange(rowIndex, expIndex, "expense", e.target.value)
                        }
                        placeholder={`Expense ${expIndex + 1}`}
                      />
                    </Td>
                    <Td>
                      <Input
                        value={row.expenses[expIndex].amount}
                        onChange={(e) =>
                          handleExpenseChange(rowIndex, expIndex, "amount", e.target.value)
                        }
                        placeholder="0"
                      />
                    </Td>
                    <Td>
                      <Input
                        value={row.expenses[expIndex].description}
                        onChange={(e) =>
                          handleExpenseChange(rowIndex, expIndex, "description", e.target.value)
                        }
                        placeholder="Description"
                      />
                    </Td>
                  </React.Fragment>
                ))}
              </Tr>
            ))}

            {/* Totals Row */}
            <Tr bg="gray.100" fontWeight="bold">
              <Td>TOTALI {totals.totalDaily}</Td>
              <Td>TOTALI CASH {totals.totalCashDaily}</Td>
              <Td colSpan={3 * expenseSetsCount} textAlign="center">
                <Td>TOTALI BLERJEVE {totals.totalExpenseCombined}</Td>
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>

      <Flex mt={4} gap={3} justify="center">
        <Button leftIcon={<AddIcon />} onClick={handleAddExpenseSet}>
          Add Columns
        </Button>
        <Button onClick={handleRemoveExpenseSet} isDisabled={expenseSetsCount <= 1}>
          Remove Columns
        </Button>
        <Button colorScheme="blue" onClick={handleSave}>
          Save Expenses
        </Button>
        <Button colorScheme="orange" leftIcon={<RepeatIcon />} onClick={handleClearExpenses}>
          Clear
        </Button>
      </Flex>

      {/* View Existing */}
      <Box mt={8}>
        <FormLabel fontWeight="bold" fontSize="md" mb={5} textColor="black.100">
          ZGJIDH DATEN PER TE SHIKUAR HISTORIKUN
        </FormLabel>
        <CalendarIcon boxSize={10} mr={7} />
        <DatePicker
          selected={viewDate}
          onChange={setViewDate}
          dateFormat="dd/MM/yyyy"
          className="custom-datepicker"
        />
        {groupedExpenses.data.length > 0 ? (
          groupedExpenses.data.map((group, idx) => {
            const sellerTotal =
              viewTotals.find((total) => total.seller === group.seller)
                ?.totalExpenseCombined || 0;
            return (
              <Card key={idx} mt={4} p={3} bg="white" borderRadius="md" boxShadow="md">
                <CardHeader>
                  <Box>
                    <Heading size="sm" mb={2}>
                      {group.seller}
                    </Heading>
                  </Box>
                </CardHeader>
                <CardBody>
                  <TableContainer>
                    <Table variant="simple">
                      <Thead>
                        <Tr bg="gray.200">
                          <Th>Daily Total</Th>
                          <Th>Cash Daily Total</Th>
                          {[...Array(groupedExpenses.maxCols)].map((_, colIndex) => (
                            <React.Fragment key={colIndex}>
                              <Th>Expense {colIndex + 1}</Th>
                              <Th>Amount {colIndex + 1}</Th>
                              <Th>Description {colIndex + 1}</Th>
                              <Th>Action</Th>
                            </React.Fragment>
                          ))}
                        </Tr>
                      </Thead>
                      <Tbody>
                        <Tr bg={ROW_COLOR}>
                          <Td>{group.dailyTotal}</Td>
                          <Td>{group.cashDailyTotal}</Td>
                          {[...Array(groupedExpenses.maxCols)].map((_, ci) => {
                            const item = group.items[ci];
                            if (!item)
                              return (
                                <React.Fragment key={ci}>
                                  <Td />
                                  <Td />
                                  <Td />
                                  <Td />
                                </React.Fragment>
                              );
                            return (
                              <React.Fragment key={ci}>
                                <Td>{item.expense}</Td>
                                <Td>{item.amount}</Td>
                                <Td>{item.description}</Td>
                                <Td>
                                  <IconButton
                                    aria-label="Delete"
                                    colorScheme="red"
                                    icon={<DeleteIcon />}
                                    onClick={() => handleDeleteExpense(item.id)}
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
                <CardFooter>
                  <Text fontWeight="bold">
                    Total Expense Combined: {sellerTotal}
                  </Text>
                </CardFooter>
                <Box mb={4} /> {/* Margin at the bottom */}
              </Card>
            );
          })
        ) : (
          <Box mt={4}>No daily expenses for this date.</Box>
        )}
      </Box>
    </Box>
  );
}
