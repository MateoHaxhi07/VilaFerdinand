import React, { useState, useEffect, useMemo, useRef } from "react";
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
  VStack,
  Stack,
  useBreakpointValue,
  Spinner,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import {
  DeleteIcon,
  AddIcon,
  CalendarIcon,
  RepeatIcon,
} from "@chakra-ui/icons";
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
  const cancelRef = useRef();

  // Inject custom DatePicker styles for dark theme
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

  // Entry date for new daily expenses and view date for history
  const [entryDate, setEntryDate] = useState(new Date());
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

  // Group raw expenses by seller and date (only one declaration)
  const groupedExpensesMemo = useMemo(() => {
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

  /* Total calculation for daily expenses from input table */
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

  // Handle changes in dailyTotal and cashDailyTotal
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

  // Calculate totals for the view table (grouped by seller)
  const viewTotals = useMemo(() => {
    const totalsBySeller = groupedExpensesMemo.data.map((group) => {
      let totalExpenseCombined = 0;
      group.items.forEach((item) => {
        totalExpenseCombined += parseFloat(item.amount) || 0;
      });
      return { seller: group.seller, totalExpenseCombined };
    });
    return totalsBySeller;
  }, [groupedExpensesMemo]);

  // Determine if we are in mobile view
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Responsive rendering for the "Entry Table" section
  const renderEntrySection = () => {
    if (isMobile) {
      return (
        <VStack spacing={4} align="stretch">
          {tableData.map((row, rowIndex) => (
            <Box
              key={rowIndex}
              borderWidth="1px"
              borderRadius="md"
              p={4}
              bg="white"
              boxShadow="md"
            >
              <Text>
                <strong>Seller:</strong> {row.seller}
              </Text>
              <Text>
                <strong>TOTAL:</strong>{" "}
                <Input
                  value={row.dailyTotal}
                  onChange={(e) =>
                    handleInputChange(rowIndex, "dailyTotal", e.target.value)
                  }
                  placeholder="0"
                  size="sm"
                  mt={1}
                />
              </Text>
              <Text>
                <strong>Cash Total:</strong>{" "}
                <Input
                  value={row.cashDailyTotal}
                  onChange={(e) =>
                    handleInputChange(rowIndex, "cashDailyTotal", e.target.value)
                  }
                  placeholder="0"
                  size="sm"
                  mt={1}
                />
              </Text>
              {Array.from({ length: expenseSetsCount }).map((_, expIndex) => (
                <Box key={expIndex} mt={2} p={2} border="1px dashed gray">
                  <Text>
                    <strong>Expense {expIndex + 1}:</strong>{" "}
                    <Input
                      value={row.expenses[expIndex].expense}
                      onChange={(e) =>
                        handleExpenseChange(
                          rowIndex,
                          expIndex,
                          "expense",
                          e.target.value
                        )
                      }
                      placeholder={`Expense ${expIndex + 1}`}
                      size="sm"
                      mt={1}
                    />
                  </Text>
                  <Text>
                    <strong>Amount {expIndex + 1}:</strong>{" "}
                    <Input
                      value={row.expenses[expIndex].amount}
                      onChange={(e) =>
                        handleExpenseChange(
                          rowIndex,
                          expIndex,
                          "amount",
                          e.target.value
                        )
                      }
                      placeholder="0"
                      size="sm"
                      mt={1}
                    />
                  </Text>
                  <Text>
                    <strong>Description {expIndex + 1}:</strong>{" "}
                    <Input
                      value={row.expenses[expIndex].description}
                      onChange={(e) =>
                        handleExpenseChange(
                          rowIndex,
                          expIndex,
                          "description",
                          e.target.value
                        )
                      }
                      placeholder="Description"
                      size="sm"
                      mt={1}
                    />
                  </Text>
                </Box>
              ))}
            </Box>
          ))}
          {/* Totals Row */}
          <Box borderTop="1px solid #ccc" pt={2} mt={4}>
            <Flex justifyContent="space-between">
              <Text fontWeight="bold">TOTAL DAILY:</Text>
              <Text fontWeight="bold">{totals.totalDaily}</Text>
            </Flex>
            <Flex justifyContent="space-between">
              <Text fontWeight="bold">TOTAL CASH DAILY:</Text>
              <Text fontWeight="bold">{totals.totalCashDaily}</Text>
            </Flex>
            <Flex justifyContent="space-between">
              <Text fontWeight="bold">TOTAL EXPENSES:</Text>
              <Text fontWeight="bold">{totals.totalExpenseCombined}</Text>
            </Flex>
          </Box>
        </VStack>
      );
    } else {
      return (
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
                      size="sm"
                    />
                  </Td>
                  <Td>
                    <Input
                      value={row.cashDailyTotal}
                      onChange={(e) =>
                        handleInputChange(rowIndex, "cashDailyTotal", e.target.value)
                      }
                      placeholder="0"
                      size="sm"
                    />
                  </Td>
                  {[...Array(expenseSetsCount)].map((_, expIndex) => (
                    <React.Fragment key={expIndex}>
                      <Td>
                        <Input
                          value={row.expenses[expIndex].expense}
                          onChange={(e) =>
                            handleExpenseChange(
                              rowIndex,
                              expIndex,
                              "expense",
                              e.target.value
                            )
                          }
                          placeholder={`Expense ${expIndex + 1}`}
                          size="sm"
                        />
                      </Td>
                      <Td>
                        <Input
                          value={row.expenses[expIndex].amount}
                          onChange={(e) =>
                            handleExpenseChange(
                              rowIndex,
                              expIndex,
                              "amount",
                              e.target.value
                            )
                          }
                          placeholder="0"
                          size="sm"
                        />
                      </Td>
                      <Td>
                        <Input
                          value={row.expenses[expIndex].description}
                          onChange={(e) =>
                            handleExpenseChange(
                              rowIndex,
                              expIndex,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="Description"
                          size="sm"
                        />
                      </Td>
                    </React.Fragment>
                  ))}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      );
    }
  };

  // Responsive rendering for the "View Existing" section
  const renderViewSection = () => {
    return (
      <Box mt={8}>
        <Heading fontSize="md" mb={5} textColor="black.100">
          ZGJIDH DATEN PER TE SHIKUAR HISTORIKUN
        </Heading>
        <Flex
          align="center"
          direction={isMobile ? "column" : "row"}
          gap={isMobile ? 3 : 7}
        >
          <CalendarIcon boxSize={10} />
          <DatePicker
            selected={viewDate}
            onChange={setViewDate}
            dateFormat="dd/MM/yyyy"
            className="custom-datepicker"
          />
        </Flex>
        {isMobile ? (
          <VStack spacing={4} align="stretch" mt={4}>
            {groupedExpensesMemo.data.map((group, idx) => {
              const sellerTotal =
                viewTotals.find((total) => total.seller === group.seller)
                  ?.totalExpenseCombined || 0;
              return (
                <Card
                  key={idx}
                  mt={4}
                  p={3}
                  bg="white"
                  borderRadius="md"
                  boxShadow="md"
                >
                  <CardHeader>
                    <Heading size="sm" mb={2}>
                      {group.seller}
                    </Heading>
                  </CardHeader>
                  <CardBody>
                    <Text>
                      <strong>Daily Total:</strong> {group.dailyTotal}
                    </Text>
                    <Text>
                      <strong>Cash Daily Total:</strong> {group.cashDailyTotal}
                    </Text>
                    {group.items.map((item, ci) => (
                      <Box
                        key={ci}
                        borderWidth="1px"
                        borderRadius="md"
                        p={2}
                        my={1}
                      >
                        <Text>
                          <strong>Expense:</strong> {item.expense}
                        </Text>
                        <Text>
                          <strong>Amount:</strong> {item.amount}
                        </Text>
                        <Text>
                          <strong>Description:</strong> {item.description}
                        </Text>
                        <IconButton
                          aria-label="Delete"
                          icon={<DeleteIcon />}
                          colorScheme="red"
                          size="sm"
                          onClick={() => handleDeleteExpense(item.id)}
                          mt={1}
                        />
                      </Box>
                    ))}
                  </CardBody>
                  <CardFooter>
                    <Text fontWeight="bold">
                      Total Expense Combined: {sellerTotal}
                    </Text>
                  </CardFooter>
                </Card>
              );
            })}
          </VStack>
        ) : (
          <Box mt={4}>
            {groupedExpensesMemo.data.length > 0 ? (
              groupedExpensesMemo.data.map((group, idx) => {
                const sellerTotal =
                  viewTotals.find((total) => total.seller === group.seller)
                    ?.totalExpenseCombined || 0;
                return (
                  <Card
                    key={idx}
                    mt={4}
                    p={3}
                    bg="white"
                    borderRadius="md"
                    boxShadow="md"
                  >
                    <CardHeader>
                      <Heading size="sm" mb={2}>
                        {group.seller}
                      </Heading>
                    </CardHeader>
                    <CardBody>
                      <TableContainer>
                        <Table variant="simple">
                          <Thead>
                            <Tr bg="gray.200">
                              <Th>Daily Total</Th>
                              <Th>Cash Daily Total</Th>
                              {[...Array(groupedExpensesMemo.maxCols)].map(
                                (_, colIndex) => (
                                  <React.Fragment key={colIndex}>
                                    <Th>Expense {colIndex + 1}</Th>
                                    <Th>Amount {colIndex + 1}</Th>
                                    <Th>Description {colIndex + 1}</Th>
                                    <Th>Action</Th>
                                  </React.Fragment>
                                )
                              )}
                            </Tr>
                          </Thead>
                          <Tbody>
                            <Tr bg={ROW_COLOR}>
                              <Td>{group.dailyTotal}</Td>
                              <Td>{group.cashDailyTotal}</Td>
                              {[...Array(groupedExpensesMemo.maxCols)].map(
                                (_, ci) => {
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
                                          size="sm"
                                        />
                                      </Td>
                                    </React.Fragment>
                                  );
                                }
                              )}
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
                  </Card>
                );
              })
            ) : (
              <Box mt={4}>No daily expenses for this date.</Box>
            )}
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box p={1}>
      {/* Entry Section */}
      <FormLabel fontWeight="bold" fontSize="md" mb={5} textColor="black.100">
        ZGJIDH DATEN
      </FormLabel>
      <Flex align="center">
        <CalendarIcon boxSize={10} mr={7} />
        <DatePicker
          selected={entryDate}
          onChange={setEntryDate}
          dateFormat="dd/MM/yyyy"
          className="custom-datepicker"
        />
      </Flex>
      {renderEntrySection()}
      <Flex
        mt={4}
        gap={3}
        justify="center"
        direction={isMobile ? "column" : "row"}
      >
        <Button leftIcon={<AddIcon />} onClick={handleAddExpenseSet}>
          Add Columns
        </Button>
        <Button
          onClick={handleRemoveExpenseSet}
          isDisabled={expenseSetsCount <= 1}
        >
          Remove Columns
        </Button>
        <Button colorScheme="blue" onClick={handleSave}>
          Save Expenses
        </Button>
        <Button
          colorScheme="orange"
          leftIcon={<RepeatIcon />}
          onClick={handleClearExpenses}
        >
          Clear
        </Button>
      </Flex>

      {/* View Existing Section */}
      <Box mt={8}>{renderViewSection()}</Box>
    </Box>
  );
}
