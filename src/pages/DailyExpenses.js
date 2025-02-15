import React, { useState, useEffect, useMemo } from "react";
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
  FormLabel,
  Input,
  Button,
  Flex,
  IconButton,
  useToast,
  Card,
  CardBody,
  CardHeader,
  Stack,
} from "@chakra-ui/react";
import {
  DeleteIcon,
  AddIcon,
  CalendarIcon,
  RepeatIcon,
} from "@chakra-ui/icons";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./DailyExpenses.css"; // Optional CSS if you have it

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

/*********************************************************
 * PART 1: SUPPLIER EXPENSES (TOP SECTION)
 * -------------------------------------------------------
 * - Columns: Supplier, Total Amount, Amount Unpaid
 * - By default: 1 pair => (Item 01, Quantity 01)
 * - Button adds 2 new columns => (Item 02, Quantity 02), etc.
 * - Up to 20 total item/quantity columns.
 *********************************************************/
const MAX_SUPPLIER_ITEM_SETS = 20; // i.e. up to "Item 20" "Quantity 20"

export default function DailyExpenses() {
  const toast = useToast();

  /****************************
   * A) SUPPLIER STATES
   ****************************/
  // Date pickers: one for data entry, one for viewing existing rows
  const [supplierEntryDate, setSupplierEntryDate] = useState(new Date());
  const [supplierViewDate, setSupplierViewDate] = useState(new Date());

  // How many (Item, Qty) columns are displayed? Start with 1 => (Item 01, Quantity 01)
  const [supplierItemSetsCount, setSupplierItemSetsCount] = useState(1);

  /**
   * We'll store multiple supplier rows. Each row has:
   * {
   *   supplier: "",
   *   totalAmount: "",
   *   amountUnpaid: "",
   *   items: [ { name: "", quantity: "" }, ... 20 max ]
   * }
   */
  const [supplierRows, setSupplierRows] = useState([
    {
      supplier: "",
      totalAmount: "",
      amountUnpaid: "",
      items: Array.from({ length: MAX_SUPPLIER_ITEM_SETS }, () => ({
        name: "",
        quantity: "",
      })),
    },
  ]);

  // Fetched data from the server for the "view date"
  const [supplierRawData, setSupplierRawData] = useState([]);

  /**
   * Group the fetched rows by (supplier + date) so we can display them in
   * a dynamic columns table. Each row in DB might look like:
   *  {
   *    id,
   *    date,
   *    supplier,
   *    total_amount,
   *    amount_unpaid,
   *    item_name,
   *    quantity
   *  }
   */
  const groupedSuppliers = useMemo(() => {
    const byKey = {};
    supplierRawData.forEach((row) => {
      const key = `${row.supplier}||${row.date}`;
      if (!byKey[key]) {
        byKey[key] = {
          supplier: row.supplier,
          date: row.date,
          totalAmount: row.total_amount || "",
          amountUnpaid: row.amount_unpaid || "",
          items: [],
        };
      }
      byKey[key].items.push({
        id: row.id,
        name: row.item_name,
        quantity: row.quantity,
      });
    });

    const groupedArray = Object.values(byKey);

    // Determine how many item columns the largest group has
    let max = 0;
    groupedArray.forEach((g) => {
      if (g.items.length > max) max = g.items.length;
    });

    return {
      data: groupedArray,
      maxItemColumns: max,
    };
  }, [supplierRawData]);

  /****************************
   * B) SUPPLIER HANDLERS
   ****************************/

  // 1) Add/Remove pairs of columns => "Item 02", "Quantity 02"
  const handleAddSupplierItemSet = () => {
    if (supplierItemSetsCount < MAX_SUPPLIER_ITEM_SETS) {
      setSupplierItemSetsCount(supplierItemSetsCount + 1);
    } else {
      toast({
        title: "Limit Reached",
        description: `You can only have up to ${MAX_SUPPLIER_ITEM_SETS} columns of items.`,
        status: "warning",
      });
    }
  };
  const handleRemoveSupplierItemSet = () => {
    if (supplierItemSetsCount > 1) {
      setSupplierItemSetsCount(supplierItemSetsCount - 1);
    }
  };

  // 2) Add a new supplier row
  const handleAddSupplierRow = () => {
    setSupplierRows((prev) => [
      ...prev,
      {
        supplier: "",
        totalAmount: "",
        amountUnpaid: "",
        items: Array.from({ length: MAX_SUPPLIER_ITEM_SETS }, () => ({
          name: "",
          quantity: "",
        })),
      },
    ]);
  };
  // 3) Remove a supplier row
  const handleRemoveSupplierRow = (rowIndex) => {
    setSupplierRows((prev) => {
      if (prev.length === 1) {
        toast({
          title: "Cannot remove",
          description: "Must have at least one supplier row",
          status: "warning",
        });
        return prev;
      }
      return prev.filter((_, i) => i !== rowIndex);
    });
  };

  // 4) Handle text changes in supplier / totalAmount / amountUnpaid
  const handleSupplierRowChange = (rowIndex, field, value) => {
    setSupplierRows((prev) => {
      const updated = [...prev];
      updated[rowIndex][field] = value;
      return updated;
    });
  };

  // 5) Handle text changes in each (Item, Quantity) pair
  const handleSupplierItemChange = (rowIndex, itemIndex, field, value) => {
    setSupplierRows((prev) => {
      const updated = [...prev];
      updated[rowIndex].items[itemIndex][field] = value;
      return updated;
    });
  };

  // 6) Save to server: flatten each row
  const handleSaveSupplierExpenses = async () => {
    const dateStr = supplierEntryDate.toISOString().split("T")[0];
    const entriesToSave = [];

    supplierRows.forEach((row) => {
      // Check if row has any data
      const rowHasData =
        row.supplier.trim() ||
        row.totalAmount.trim() ||
        row.amountUnpaid.trim() ||
        row.items.some((it) => it.name.trim() || it.quantity.trim());

      if (!rowHasData) {
        return; // skip empty
      }

      // For each visible item set
      for (let i = 0; i < supplierItemSetsCount; i++) {
        const { name, quantity } = row.items[i];
        // If user typed something for item or quantity, create a row
        if (name.trim() || quantity.trim()) {
          entriesToSave.push({
            supplier: row.supplier.trim(),
            totalAmount: row.totalAmount.trim(),
            amountUnpaid: row.amountUnpaid.trim(),
            itemName: name.trim(),
            itemQuantity: quantity.trim(),
          });
        }
      }
    });

    if (entriesToSave.length === 0) {
      toast({
        title: "No Data",
        description: "No supplier items to save.",
        status: "warning",
      });
      return;
    }

    try {
      const resp = await fetch(`${API_URL}/suppliers/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedDate: dateStr,
          entries: entriesToSave,
        }),
      });
      if (!resp.ok) {
        throw new Error("Failed to save supplier expenses");
      }

      toast({
        title: "Success",
        description: "Supplier expenses saved successfully",
        status: "success",
      });

      // Clear after saving
      setSupplierRows([
        {
          supplier: "",
          totalAmount: "",
          amountUnpaid: "",
          items: Array.from({ length: MAX_SUPPLIER_ITEM_SETS }, () => ({
            name: "",
            quantity: "",
          })),
        },
      ]);

      // If entry date == view date, refresh
      if (dateStr === supplierViewDate.toISOString().split("T")[0]) {
        fetchSupplierData(supplierViewDate);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
      });
    }
  };

  // 7) Fetch supplier data for a date
  const fetchSupplierData = async (date) => {
    const dateStr = date.toISOString().split("T")[0];
    try {
      const resp = await fetch(`${API_URL}/suppliers/bulk?date=${dateStr}`);
      if (!resp.ok) {
        throw new Error("Failed to fetch supplier expenses");
      }
      const data = await resp.json();
      setSupplierRawData(data);
    } catch (err) {
      toast({
        title: "Error fetching suppliers",
        description: err.message,
        status: "error",
      });
    }
  };

  // Whenever supplierViewDate changes => fetch from server
  useEffect(() => {
    fetchSupplierData(supplierViewDate);
  }, [supplierViewDate]);

  // 8) Delete a single row (item) by ID
  const handleDeleteSupplierItem = async (id) => {
    try {
      const resp = await fetch(`${API_URL}/suppliers/bulk/${id}`, {
        method: "DELETE",
      });
      if (!resp.ok) {
        throw new Error("Failed to delete supplier item");
      }
      toast({
        title: "Deleted",
        description: "Supplier item deleted successfully",
        status: "success",
      });
      fetchSupplierData(supplierViewDate);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
      });
    }
  };

  /*********************************************************
   * PART 2: DAILY EXPENSES (BOTTOM SECTION)
   * (Unchanged logic from your existing code)
   *********************************************************/
  const SELLERS = ["KRISTI", "VERA", "JONI", "FLORI", "DEA", "ENISA"];
  const MAX_DAILY_EXPENSE_SETS = 15;

  const [dailyEntryDate, setDailyEntryDate] = useState(new Date());
  const [dailyViewDate, setDailyViewDate] = useState(new Date());
  const [expenseSetsCount, setExpenseSetsCount] = useState(1);

  const [dailyTableData, setDailyTableData] = useState(
    SELLERS.map((seller) => ({
      seller,
      dailyTotal: "",
      cashDailyTotal: "",
      expenses: Array.from({ length: MAX_DAILY_EXPENSE_SETS }, () => ({
        expense: "",
        amount: "",
        description: "",
      })),
    }))
  );

  // Raw daily data from server
  const [rawExpenses, setRawExpenses] = useState([]);

  // Group daily expenses by (seller, date)
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
          expenses: [],
        };
      }
      byKey[key].expenses.push({
        id: row.id,
        expense: row.expense,
        amount: row.amount,
        description: row.description,
      });
    });

    const groupedArray = Object.values(byKey);
    let max = 0;
    groupedArray.forEach((grp) => {
      if (grp.expenses.length > max) {
        max = grp.expenses.length;
      }
    });
    return { data: groupedArray, maxExpenseColumns: max };
  }, [rawExpenses]);

  // Add/Remove expense columns
  const handleAddExpenseSet = () => {
    if (expenseSetsCount < MAX_DAILY_EXPENSE_SETS) {
      setExpenseSetsCount(expenseSetsCount + 1);
    } else {
      toast({
        title: "Limit Reached",
        description: `Max ${MAX_DAILY_EXPENSE_SETS} expense columns allowed.`,
        status: "warning",
      });
    }
  };
  const handleRemoveExpenseSet = () => {
    if (expenseSetsCount > 1) {
      setExpenseSetsCount(expenseSetsCount - 1);
    }
  };

  // Input changes for daily totals
  const handleDailyInputChange = (rowIndex, field, value) => {
    setDailyTableData((prev) => {
      const updated = [...prev];
      updated[rowIndex][field] = value;
      return updated;
    });
  };

  // Input changes for each expense set
  const handleDailyExpenseChange = (rowIndex, expenseIndex, field, value) => {
    setDailyTableData((prev) => {
      const updated = [...prev];
      updated[rowIndex].expenses[expenseIndex][field] = value;
      return updated;
    });
  };

  // Fetch daily from server
  const fetchDailyExpenses = async (date) => {
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
        title: "Error fetching daily expenses",
        description: error.message,
        status: "error",
      });
    }
  };
  useEffect(() => {
    fetchDailyExpenses(dailyViewDate);
  }, [dailyViewDate]);

  // Save daily expenses
  const handleSaveDailyExpenses = async () => {
    const entriesToSave = [];
    dailyTableData.forEach((row) => {
      // Check if row has any data
      const rowHasData =
        row.dailyTotal.trim() ||
        row.cashDailyTotal.trim() ||
        row.expenses.some(
          (exp) => exp.expense.trim() || exp.amount.trim() || exp.description.trim()
        );
      if (!rowHasData) return;

      // Flatten each of the visible columns
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
        title: "Error",
        description: "No valid daily entries to save",
        status: "error",
      });
      return;
    }

    const dateStr = dailyEntryDate.toISOString().split("T")[0];

    // Optionally skip duplicates
    let existingForDate = [];
    try {
      const resp = await fetch(`${API_URL}/expenses/bulk?date=${dateStr}`);
      if (!resp.ok) {
        throw new Error("Failed to fetch existing daily expenses");
      }
      existingForDate = await resp.json();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
      });
      return;
    }

    const existingSellers = new Set(
      existingForDate.map((ex) => ex.seller.toUpperCase())
    );
    const uniqueEntries = entriesToSave.filter(
      (entry) => !existingSellers.has(entry.seller.toUpperCase())
    );

    if (uniqueEntries.length === 0) {
      toast({
        title: "Info",
        description: "All these sellers already exist for this date.",
        status: "info",
      });
      return;
    }

    try {
      const resp = await fetch(`${API_URL}/expenses/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedDate: dateStr,
          entries: uniqueEntries,
        }),
      });
      if (!resp.ok) {
        throw new Error("Failed to save daily expenses");
      }
      toast({
        title: "Success",
        description: "Daily expenses saved successfully!",
        status: "success",
      });
      fetchDailyExpenses(dailyViewDate);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
      });
    }
  };

  // Clear daily form
  const handleClearDailyExpenses = () => {
    setDailyTableData(
      SELLERS.map((seller) => ({
        seller,
        dailyTotal: "",
        cashDailyTotal: "",
        expenses: Array.from({ length: MAX_DAILY_EXPENSE_SETS }, () => ({
          expense: "",
          amount: "",
          description: "",
        })),
      }))
    );
    toast({
      title: "Cleared",
      description: "All daily expense inputs have been cleared",
      status: "info",
    });
  };

  // Delete single daily expense
  const handleDeleteDailyExpense = async (id) => {
    try {
      const resp = await fetch(`${API_URL}/expenses/bulk/${id}`, {
        method: "DELETE",
      });
      if (!resp.ok) {
        throw new Error("Failed to delete daily expense");
      }
      toast({
        title: "Deleted",
        description: "Daily expense deleted successfully",
        status: "success",
      });
      fetchDailyExpenses(dailyViewDate);
    } catch (error) {
      toast({
        title: "Error deleting daily expense",
        description: error.message,
        status: "error",
      });
    }
  };

  /*********************************************************
   * RENDER COMPONENT
   *********************************************************/
  // A nice color for table rows
  const ROW_COLOR = "#e8f5e9";

  return (
    <Box p={4} bg="gray.50" minH="100vh">
      <Heading mb={6} textAlign="center">
        Combined Expenses: Supplier (fixed columns) & Daily
      </Heading>

      {/* ----------------- SUPPLIER EXPENSES (TOP) ----------------- */}
      <Box mb={10} p={4} bg="white" borderRadius="md" boxShadow="md">
        <Heading size="md" mb={4}>
          Supplier Expenses
        </Heading>

        {/* Date for Entry */}
        <FormLabel fontWeight="bold">Date (Entry):</FormLabel>
        <CalendarIcon boxSize={5} mr={2} />
        <DatePicker
          selected={supplierEntryDate}
          onChange={setSupplierEntryDate}
          dateFormat="dd/MM/yyyy"
          className="custom-datepicker"
        />

        {/* Buttons to add columns or rows */}
        <Flex mt={4} gap={4}>
          <Button leftIcon={<AddIcon />} onClick={handleAddSupplierItemSet}>
            Add Item Columns
          </Button>
          <Button
            onClick={handleRemoveSupplierItemSet}
            disabled={supplierItemSetsCount <= 1}
          >
            Remove Item Columns
          </Button>
          <Button colorScheme="green" onClick={handleAddSupplierRow}>
            Add Supplier Row
          </Button>
        </Flex>

        {/* Supplier Table */}
        <TableContainer mt={4}>
          <Table variant="simple" border="1px solid black">
            <Thead>
              <Tr style={{ backgroundColor: "#ccc" }}>
                <Th>Supplier</Th>
                <Th>Total Amount</Th>
                <Th>Amount Unpaid</Th>
                {/* For each item set, show two columns: "Item 0n", "Quantity 0n" */}
                {[...Array(supplierItemSetsCount)].map((_, i) => {
                  // Format i => "01", "02", etc.
                  const colNumber = String(i + 1).padStart(2, "0");
                  return (
                    <React.Fragment key={i}>
                      <Th>{`Item ${colNumber}`}</Th>
                      <Th>{`Quantity ${colNumber}`}</Th>
                    </React.Fragment>
                  );
                })}
                <Th>Remove Row</Th>
              </Tr>
            </Thead>
            <Tbody>
              {supplierRows.map((row, rowIndex) => (
                <Tr key={rowIndex} style={{ backgroundColor: ROW_COLOR }}>
                  <Td>
                    <Input
                      placeholder="Supplier"
                      value={row.supplier}
                      onChange={(e) =>
                        handleSupplierRowChange(rowIndex, "supplier", e.target.value)
                      }
                    />
                  </Td>
                  <Td>
                    <Input
                      placeholder="Total Amount"
                      value={row.totalAmount}
                      onChange={(e) =>
                        handleSupplierRowChange(rowIndex, "totalAmount", e.target.value)
                      }
                    />
                  </Td>
                  <Td>
                    <Input
                      placeholder="Amount Unpaid"
                      value={row.amountUnpaid}
                      onChange={(e) =>
                        handleSupplierRowChange(rowIndex, "amountUnpaid", e.target.value)
                      }
                    />
                  </Td>

                  {/* Render the visible item sets */}
                  {[...Array(supplierItemSetsCount)].map((_, itemIndex) => {
                    const colNumber = String(itemIndex + 1).padStart(2, "0");
                    return (
                      <React.Fragment key={itemIndex}>
                        <Td>
                          <Input
                            placeholder={`Item ${colNumber}`}
                            value={row.items[itemIndex].name}
                            onChange={(e) =>
                              handleSupplierItemChange(
                                rowIndex,
                                itemIndex,
                                "name",
                                e.target.value
                              )
                            }
                          />
                        </Td>
                        <Td>
                          <Input
                            placeholder={`Quantity ${colNumber}`}
                            value={row.items[itemIndex].quantity}
                            onChange={(e) =>
                              handleSupplierItemChange(
                                rowIndex,
                                itemIndex,
                                "quantity",
                                e.target.value
                              )
                            }
                          />
                        </Td>
                      </React.Fragment>
                    );
                  })}

                  <Td>
                    <IconButton
                      aria-label="Remove row"
                      icon={<DeleteIcon />}
                      colorScheme="red"
                      onClick={() => handleRemoveSupplierRow(rowIndex)}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>

        <Flex mt={4} justify="center">
          <Button colorScheme="blue" onClick={handleSaveSupplierExpenses}>
            Save Supplier Expenses
          </Button>
        </Flex>

        {/* VIEW supplier rows */}
        <Box mt={8}>
          <FormLabel fontWeight="bold">Date (View):</FormLabel>
          <CalendarIcon boxSize={5} mr={2} />
          <DatePicker
            selected={supplierViewDate}
            onChange={setSupplierViewDate}
            dateFormat="dd/MM/yyyy"
            className="custom-datepicker"
          />

          <Heading size="sm" mt={4} mb={2}>
            Existing Supplier Expenses on {supplierViewDate.toLocaleDateString()}
          </Heading>
          <Stack spacing={4}>
            {groupedSuppliers.data.length > 0 ? (
              groupedSuppliers.data.map((group, i) => (
                <Card key={i} p={3} boxShadow="md">
                  <CardHeader>
                    <Heading size="sm">{group.supplier}</Heading>
                    <Box fontSize="xs">Date: {group.date}</Box>
                  </CardHeader>
                  <CardBody>
                    <TableContainer>
                      <Table variant="simple">
                        <Thead>
                          <Tr style={{ backgroundColor: "#ccc" }}>
                            <Th>Total Amount</Th>
                            <Th>Amount Unpaid</Th>
                            {[...Array(groupedSuppliers.maxItemColumns)].map((_, idx) => {
                              const colNumber = String(idx + 1).padStart(2, "0");
                              return (
                                <React.Fragment key={idx}>
                                  <Th>{`Item ${colNumber}`}</Th>
                                  <Th>{`Quantity ${colNumber}`}</Th>
                                  <Th>Delete {colNumber}</Th>
                                </React.Fragment>
                              );
                            })}
                          </Tr>
                        </Thead>
                        <Tbody>
                          <Tr style={{ backgroundColor: ROW_COLOR }}>
                            <Td>{group.totalAmount}</Td>
                            <Td>{group.amountUnpaid}</Td>

                            {group.items.map((item, colIndex) => {
                              const colNumber = String(colIndex + 1).padStart(2, "0");
                              return (
                                <React.Fragment key={colIndex}>
                                  <Td>{item.name}</Td>
                                  <Td>{item.quantity}</Td>
                                  <Td>
                                    <IconButton
                                      aria-label="Delete"
                                      icon={<DeleteIcon />}
                                      colorScheme="red"
                                      onClick={() => handleDeleteSupplierItem(item.id)}
                                    />
                                  </Td>
                                </React.Fragment>
                              );
                            })}
                            {/* Fill any blank columns if this group has fewer items */}
                            {[...Array(
                              groupedSuppliers.maxItemColumns - group.items.length
                            )].map((_, blankIndex) => (
                              <React.Fragment key={blankIndex}>
                                <Td></Td>
                                <Td></Td>
                                <Td></Td>
                              </React.Fragment>
                            ))}
                          </Tr>
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </CardBody>
                </Card>
              ))
            ) : (
              <Box>No supplier expenses found for this date.</Box>
            )}
          </Stack>
        </Box>
      </Box>

      {/* ----------------- DAILY EXPENSES (BOTTOM) ----------------- */}
      {/* ... Your existing daily expenses code ... */}
      <Box mb={10}>
        <Heading size="md" mb={4}>
          Daily Expenses (KRISTI, VERA, JONI, FLORI, DEA, ENISA)
        </Heading>
        <FormLabel fontWeight="bold" fontSize="md">
          Data (Entry):
        </FormLabel>
        <CalendarIcon boxSize={5} mr={2} />
        <DatePicker
          selected={dailyEntryDate}
          onChange={setDailyEntryDate}
          dateFormat="dd/MM/yyyy"
          className="custom-datepicker"
        />

        <TableContainer p={4} mt={4} overflowX="auto">
          <Table variant="simple" border="1px solid black">
            <Thead>
              <Tr style={{ backgroundColor: "#ccc" }}>
                <Th>Seller</Th>
                <Th>Daily Total</Th>
                <Th>Cash Daily Total</Th>
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
              {dailyTableData.map((row, rowIndex) => (
                <Tr key={rowIndex} style={{ backgroundColor: ROW_COLOR }}>
                  <Td>{row.seller}</Td>
                  <Td>
                    <Input
                      value={row.dailyTotal}
                      onChange={(e) =>
                        handleDailyInputChange(rowIndex, "dailyTotal", e.target.value)
                      }
                      placeholder="0"
                    />
                  </Td>
                  <Td>
                    <Input
                      value={row.cashDailyTotal}
                      onChange={(e) =>
                        handleDailyInputChange(
                          rowIndex,
                          "cashDailyTotal",
                          e.target.value
                        )
                      }
                      placeholder="0"
                    />
                  </Td>
                  {[...Array(expenseSetsCount)].map((_, expenseIndex) => (
                    <React.Fragment key={expenseIndex}>
                      <Td>
                        <Input
                          value={row.expenses[expenseIndex].expense}
                          onChange={(e) =>
                            handleDailyExpenseChange(
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
                          value={row.expenses[expenseIndex].amount}
                          onChange={(e) =>
                            handleDailyExpenseChange(
                              rowIndex,
                              expenseIndex,
                              "amount",
                              e.target.value
                            )
                          }
                          placeholder="0"
                        />
                      </Td>
                      <Td>
                        <Input
                          value={row.expenses[expenseIndex].description}
                          onChange={(e) =>
                            handleDailyExpenseChange(
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
          <Button colorScheme="blue" onClick={handleSaveDailyExpenses}>
            Save Expenses
          </Button>
          <Button colorScheme="orange" leftIcon={<RepeatIcon />} onClick={handleClearDailyExpenses}>
            Clear Expenses
          </Button>
        </Flex>
      </Box>

      {/* VIEW existing daily expenses */}
      <Box>
        <Heading size="md" mb={4}>
          View Existing Daily Expenses
        </Heading>
        <FormLabel fontWeight="bold" fontSize="md">
          Data (View):
        </FormLabel>
        <CalendarIcon boxSize={5} mr={2} />
        <DatePicker
          selected={dailyViewDate}
          onChange={setDailyViewDate}
          dateFormat="dd/MM/yyyy"
          className="custom-datepicker"
        />

        <Stack spacing={4} mt={4}>
          {groupedExpenses.data.map((group, rowIndex) => (
            <Card key={rowIndex} p={3} boxShadow="md">
              <CardHeader>
                <Heading size="sm">{group.seller}</Heading>
                <Box fontSize="xs" mt={1}>
                  Date: {group.date}
                </Box>
              </CardHeader>
              <CardBody>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr style={{ backgroundColor: "#ccc" }}>
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
                      <Tr style={{ backgroundColor: ROW_COLOR }}>
                        <Td>{group.dailyTotal}</Td>
                        <Td>{group.cashDailyTotal}</Td>

                        {[...Array(groupedExpenses.maxExpenseColumns)].map((_, colIndex) => {
                          const expLine = group.expenses[colIndex];
                          if (!expLine) {
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
                                  onClick={() => handleDeleteDailyExpense(expLine.id)}
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
