// src/pages/Xhiro_Ditore/DailyExpensesMobile.js
import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Heading,
  Input,
  Select,
  Flex,
  Tooltip,
  Fade,
  Spinner,
  useToast,
  Card,
  CardBody,
  Divider
} from "@chakra-ui/react";
import { CalendarIcon, RepeatIcon, AddIcon } from "@chakra-ui/icons";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// The same constants from your original code
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const SELLERS = [
  "Kristian Llupo",
  "Pranvera Xherahi",
  "Jonel Demba",
  "Fjorelo Arapi",
  "Dea",
  "Enisa",
];
const MAX_EXPENSE_SETS = 15;

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function DailyExpensesMobile() {
  const toast = useToast();

  // --------------------- Date & Master States ---------------------
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [expenseSetsCount, setExpenseSetsCount] = useState(1);

  // For sales sums
  const [salesSums, setSalesSums] = useState({});

  // Supplier options for the custom rows
  const [supplierOptions, setSupplierOptions] = useState([]);

  // The main daily-expenses table data
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

  // The second "custom rows" table data
  const [customRows, setCustomRows] = useState([]);

  // --------------- Dark styling for DatePicker ---------------
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

  // ---------------------------------------------------------------------------
  // 1) Build TOTALS for main daily expenses
  // ---------------------------------------------------------------------------
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

  // ---------------------------------------------------------------------------
  // 2) Fetch & set main table data (Daily Expenses)
  // ---------------------------------------------------------------------------
  async function fetchExpenses(date) {
    const dateStr = formatLocalDate(date);
    try {
      const resp = await fetch(`${API_URL}/expenses/bulk?date=${dateStr}`);
      if (!resp.ok) throw new Error("Failed to fetch daily expenses");
      const data = await resp.json();
      const updated = buildTableDataFromDB(data);
      setTableData(updated);
    } catch (error) {
      toast({
        title: "Error fetching expenses",
        description: error.message,
        status: "error",
      });
    }
  }

  function buildTableDataFromDB(dbRows) {
    const bySeller = {};
    dbRows.forEach((row) => {
      const s = row.seller.toUpperCase();
      if (!bySeller[s]) {
        bySeller[s] = {
          seller: s,
          dailyTotal: row.daily_total || "",
          cashDailyTotal: row.cash_daily_total || "",
          items: [],
        };
      }
      bySeller[s].items.push({
        expense: row.expense || "",
        amount: row.amount || "",
        description: row.description || "",
      });
    });

    const final = SELLERS.map((sellerName) => {
      const upper = sellerName.toUpperCase();
      if (bySeller[upper]) {
        const itemArr = bySeller[upper].items || [];
        return {
          seller: upper,
          dailyTotal: bySeller[upper].dailyTotal,
          cashDailyTotal: bySeller[upper].cashDailyTotal,
          expenses: Array.from({ length: MAX_EXPENSE_SETS }, (_, i) => ({
            expense: itemArr[i]?.expense || "",
            amount: itemArr[i]?.amount || "",
            description: itemArr[i]?.description || "",
          })),
        };
      } else {
        return {
          seller: upper,
          dailyTotal: "",
          cashDailyTotal: "",
          expenses: Array.from({ length: MAX_EXPENSE_SETS }, () => ({
            expense: "",
            amount: "",
            description: "",
          })),
        };
      }
    });

    // Determine how many columns are actually used
    let maxUsed = 1;
    final.forEach((row) => {
      const used = row.expenses.filter(
        (e) => e.expense.trim() || e.amount.trim() || e.description.trim()
      ).length;
      if (used > maxUsed) maxUsed = used;
    });
    setExpenseSetsCount(Math.min(MAX_EXPENSE_SETS, maxUsed));
    return final;
  }

  // ---------------------------------------------------------------------------
  // 3) Fetch customRows (modified expenses)
  // ---------------------------------------------------------------------------
  async function fetchCustomRows(date) {
    const dateStr = formatLocalDate(date);
    try {
      const resp = await fetch(`${API_URL}/modified-expenses?date=${dateStr}`);
      if (!resp.ok) throw new Error("Failed to fetch custom rows");
      const data = await resp.json();
      const transformed = data.map((row) => ({
        id: row.id,
        supplier: row.supplier,
        totalAmount: row.total_amount,
        amountPaid: row.amount_paid,
        description: row.description,
        transactionType: row.transaction_type,
        date: row.date,
        created_at: row.created_at,
        autoFillSuggestion: null,
      }));
      setCustomRows(transformed);
    } catch (error) {
      toast({
        title: "Error fetching custom rows",
        description: error.message,
        status: "error",
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 4) Fetch & sum sales data
  // ---------------------------------------------------------------------------
  async function fetchSalesData(date) {
    const dateStr = formatLocalDate(date);
    const startOfDay = `${dateStr}T00:00:00`;
    const endOfDay = `${dateStr}T23:59:59`;
    const sellersQuery = SELLERS.join(",");

    try {
      const resp = await fetch(
        `${API_URL}/sales/all-data?startDate=${startOfDay}&endDate=${endOfDay}&sellers=${sellersQuery}&limit=100000`
      );
      if (!resp.ok) throw new Error("Failed to fetch sales data");
      const data = await resp.json();

      const sums = {};
      data.forEach((item) => {
        const seller = (item.Seller || "").toUpperCase();
        const price = parseFloat(item.Total_Article_Price) || 0;
        if (!sums[seller]) sums[seller] = 0;
        sums[seller] += price;
      });
      setSalesSums(sums);
    } catch (error) {
      toast({
        title: "Error fetching sales data",
        description: error.message,
        status: "error",
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 5) Supplier options from aggregated (for custom rows)
  // ---------------------------------------------------------------------------
  async function fetchSupplierOptions() {
    try {
      const resp = await fetch(`${API_URL}/aggregated-modified-expenses`);
      if (!resp.ok) throw new Error("Failed to fetch aggregated data");
      const data = await resp.json();
      const namesSet = new Set();
      data.forEach((item) => {
        if (item.supplier) namesSet.add(item.supplier.trim());
      });
      setSupplierOptions([...namesSet]);
    } catch (err) {
      console.error("Error fetching supplier options:", err);
    }
  }
  useEffect(() => {
    fetchSupplierOptions();
  }, []);

  // ---------------------------------------------------------------------------
  // On date change: fetch everything
  // ---------------------------------------------------------------------------
  useEffect(() => {
    fetchExpenses(selectedDate);
    fetchCustomRows(selectedDate);
    fetchSalesData(selectedDate);
    // eslint-disable-next-line
  }, [selectedDate]);

  // ---------------------------------------------------------------------------
  // 6) Input handlers for main table
  // ---------------------------------------------------------------------------
  function handleInputChange(rowIndex, field, value) {
    setTableData((prev) => {
      const updated = [...prev];
      updated[rowIndex][field] = value;
      return updated;
    });
  }

  function handleExpenseChange(rowIndex, expIndex, field, value) {
    setTableData((prev) => {
      const updated = [...prev];
      updated[rowIndex].expenses[expIndex][field] = value;
      return updated;
    });
  }

  function handleAddExpenseSet() {
    if (expenseSetsCount < MAX_EXPENSE_SETS) {
      setExpenseSetsCount(expenseSetsCount + 1);
    } else {
      toast({
        title: "Limit Reached",
        description: `Max columns = ${MAX_EXPENSE_SETS}`,
        status: "warning",
      });
    }
  }

  function handleRemoveExpenseSet() {
    if (expenseSetsCount > 1) {
      setExpenseSetsCount(expenseSetsCount - 1);
    }
  }

  async function handleSave() {
    const dateStr = formatLocalDate(selectedDate);
    const entriesToSave = [];

    tableData.forEach((row) => {
      const rowHasData =
        row.dailyTotal.trim() ||
        row.cashDailyTotal.trim() ||
        row.expenses.some(
          (ex) => ex.expense.trim() || ex.amount.trim() || ex.description.trim()
        );
      if (!rowHasData) return;

      const usedExpenses = row.expenses
        .slice(0, expenseSetsCount)
        .filter((ex) => ex.expense.trim() || ex.amount.trim() || ex.description.trim());

      if (usedExpenses.length === 0) {
        // Just the daily totals
        entriesToSave.push({
          seller: row.seller,
          dailyTotal: row.dailyTotal,
          cashDailyTotal: row.cashDailyTotal,
          expense: "",
          amount: "",
          description: "",
        });
      } else {
        usedExpenses.forEach((ex) => {
          entriesToSave.push({
            seller: row.seller,
            dailyTotal: row.dailyTotal,
            cashDailyTotal: row.cashDailyTotal,
            expense: ex.expense,
            amount: ex.amount,
            description: ex.description,
          });
        });
      }
    });

    try {
      // delete old
      await fetch(`${API_URL}/expenses/bulk?date=${dateStr}`, { method: "DELETE" });

      if (entriesToSave.length > 0) {
        const resp = await fetch(`${API_URL}/expenses/bulk`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ selectedDate: dateStr, entries: entriesToSave }),
        });
        if (!resp.ok) throw new Error("Failed to save daily expenses");
      }

      toast({
        title: "Success",
        description: "Daily expenses saved",
        status: "success",
      });
      fetchExpenses(selectedDate);
      fetchCustomRows(selectedDate);
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        status: "error",
      });
    }
  }

  function handleClearExpenses() {
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
      description: "All daily expenses cleared (locally)",
      status: "info",
    });
  }

  // ---------------------------------------------------------------------------
  // 7) The second "Custom Rows" logic
  // ---------------------------------------------------------------------------
  function handleAddCustomRow() {
    setCustomRows((prev) => [
      ...prev,
      {
        id: null,
        supplier: "",
        totalAmount: "",
        amountPaid: "",
        description: "",
        transactionType: "",
        date: formatLocalDate(selectedDate),
        autoFillSuggestion: null,
      },
    ]);
  }

  function handleCustomRowChange(index, field, value) {
    setCustomRows((prev) => {
      const updated = [...prev];
      updated[index][field] = value;

      if (field === "supplier") {
        const typedVal = value.trim().toLowerCase();
        if (typedVal.length >= 2) {
          const suggestion = supplierOptions.find((opt) =>
            opt.toLowerCase().startsWith(typedVal)
          );
          updated[index].autoFillSuggestion = suggestion || null;
        } else {
          updated[index].autoFillSuggestion = null;
        }
      }

      return updated;
    });
  }

  async function handleSaveCustomRow(index) {
    const row = customRows[index];
    const dateStr = formatLocalDate(selectedDate);

    if (!row.supplier) {
      toast({ title: "Validation Error", description: "Supplier is required", status: "warning" });
      return;
    }
    if (!row.transactionType) {
      toast({
        title: "Validation Error",
        description: "Transaction type is required",
        status: "warning",
      });
      return;
    }

    try {
      if (row.id) {
        // Update
        const resp = await fetch(`${API_URL}/modified-expenses/${row.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            supplier: row.supplier,
            totalAmount: row.totalAmount,
            amountPaid: row.amountPaid,
            description: row.description,
            transactionType: row.transactionType,
          }),
        });
        if (!resp.ok) throw new Error("Failed to update custom row");
        const data = await resp.json();
        const transformed = {
          id: data.row.id,
          supplier: data.row.supplier,
          totalAmount: data.row.total_amount,
          amountPaid: data.row.amount_paid,
          description: data.row.description,
          transactionType: data.row.transaction_type,
          date: data.row.date,
          created_at: data.row.created_at,
          autoFillSuggestion: null,
        };
        toast({ title: "Success", description: "Custom row updated", status: "success" });
        setCustomRows((prev) => {
          const updated = [...prev];
          updated[index] = transformed;
          return updated;
        });
      } else {
        // Insert
        const payload = {
          selectedDate: dateStr,
          supplier: row.supplier,
          totalAmount: row.totalAmount,
          amountPaid: row.amountPaid,
          description: row.description,
          transactionType: row.transactionType,
        };
        const resp = await fetch(`${API_URL}/modified-expenses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!resp.ok) throw new Error("Failed to save custom row");
        const data = await resp.json();
        const transformed = {
          id: data.row.id,
          supplier: data.row.supplier,
          totalAmount: data.row.total_amount,
          amountPaid: data.row.amount_paid,
          description: data.row.description,
          transactionType: data.row.transaction_type,
          date: data.row.date,
          created_at: data.row.created_at,
          autoFillSuggestion: null,
        };
        toast({ title: "Success", description: "Custom row saved", status: "success" });
        setCustomRows((prev) => {
          const updated = [...prev];
          updated[index] = transformed;
          return updated;
        });
      }
    } catch (err) {
      toast({ title: "Error", description: err.message, status: "error" });
    }
  }

  async function handleDeleteCustomRow(index) {
    const row = customRows[index];
    if (!row.id) {
      setCustomRows((prev) => prev.filter((_, i) => i !== index));
      return;
    }
    try {
      const resp = await fetch(`${API_URL}/modified-expenses/${row.id}`, { method: "DELETE" });
      if (!resp.ok) throw new Error("Failed to delete custom row");
      toast({ title: "Success", description: "Custom row deleted", status: "success" });
      setCustomRows((prev) => prev.filter((_, i) => i !== index));
    } catch (err) {
      toast({ title: "Error", description: err.message, status: "error" });
    }
  }

  // Example: auto-populate from main table
  function handleAutoPopulateCustomRows() {
    const aggregated = {};
    tableData.forEach((sellerRow) => {
      for (let i = 0; i < expenseSetsCount; i++) {
        const ex = sellerRow.expenses[i];
        const name = ex.expense.trim();
        const amt = parseFloat(ex.amount) || 0;
        if (name) {
          const key = name.toLowerCase();
          if (!aggregated[key]) {
            aggregated[key] = {
              supplier: name,
              totalAmount: 0,
              amountPaid: 0,
              description: "",
              transactionType: "",
            };
          }
          aggregated[key].totalAmount += amt;
          aggregated[key].amountPaid += amt;
        }
      }
    });

    const aggregatedRows = Object.values(aggregated).map((obj) => ({
      ...obj,
      totalAmount: obj.totalAmount.toString(),
      amountPaid: obj.amountPaid.toString(),
    }));

    const merged = [...customRows];
    aggregatedRows.forEach((agg) => {
      const idx = merged.findIndex(
        (r) => r.supplier.toLowerCase() === agg.supplier.toLowerCase()
      );
      if (idx !== -1) {
        merged[idx].totalAmount = (
          (parseFloat(merged[idx].totalAmount) || 0) +
          (parseFloat(agg.totalAmount) || 0)
        ).toString();
        merged[idx].amountPaid = (
          (parseFloat(merged[idx].amountPaid) || 0) +
          (parseFloat(agg.amountPaid) || 0)
        ).toString();
      } else {
        merged.push({
          id: null,
          supplier: agg.supplier,
          totalAmount: agg.totalAmount,
          amountPaid: agg.amountPaid,
          description: "",
          transactionType: "",
          date: formatLocalDate(selectedDate),
          autoFillSuggestion: null,
        });
      }
    });

    setCustomRows(merged);
    toast({
      title: "Auto Populate",
      description: "Aggregated custom rows merged with existing.",
      status: "success",
    });
  }

  // If data not loaded yet, you can show a spinner, etc.
  // You can do: if some state is loading => show spinner
  // (Your code might do it differently.)

  // ---------------------------------------------------------------------------
  // Render: The Mobile Layout
  // ---------------------------------------------------------------------------
  return (
    <Box p={4}>
      <Fade in={true}>
        <Box
          p={6}
          bgGradient="linear(to-r, green.600, teal.400)"
          borderRadius="md"
          boxShadow="lg"
          border="1px solid"
          borderColor="whiteAlpha.200"
          textAlign="center"
        >
          <Heading size="md" mb={4} color="white" fontWeight="bold" textTransform="uppercase">
            ZGJIDH DATEN PER XHIRON DITORE DHE BLERJET (MOBILE)
          </Heading>
          <Flex justify="center" align="center" gap={4}>
            <CalendarIcon boxSize={10} color="white" />
            <DatePicker
              selected={selectedDate}
              onChange={setSelectedDate}
              dateFormat="dd/MM/yyyy"
              className="custom-datepicker"
              portalId="datepicker-portal"
            />
          </Flex>
        </Box>
      </Fade>

      <Box mt={6} />

      {/* A) Main "Daily Expenses" in card form */}
      <Heading size="md" mb={4} textAlign="center" mt={6}>
        Daily Expenses (Mobile View)
      </Heading>

      <VStack spacing={6} align="stretch">
        {tableData.map((row, rowIndex) => {
          const rowExpenseTotal = row.expenses
            .slice(0, expenseSetsCount)
            .reduce((acc, cur) => acc + (parseFloat(cur.amount) || 0), 0);
          const diff =
            (parseFloat(row.dailyTotal) || 0) -
            ((parseFloat(row.cashDailyTotal) || 0) + rowExpenseTotal);

          const existingSales = salesSums[row.seller];
          const tooltipLabel = existingSales
            ? `Double-click to auto-fill. Found sales: ${existingSales.toFixed(2)}`
            : "No sales data found.";

          return (
            <Card key={rowIndex} bg="white" boxShadow="md">
              <CardBody>
                {/* Seller & row totals */}
                <Text fontWeight="bold" mb={1}>
                  Seller: {row.seller}
                </Text>

                {/* Daily Total with tooltip for auto-fill */}
                <Tooltip hasArrow placement="top" label={tooltipLabel}>
                  <Input
                    mb={2}
                    value={row.dailyTotal}
                    onChange={(e) => handleInputChange(rowIndex, "dailyTotal", e.target.value)}
                    placeholder="Daily Total"
                    size="sm"
                    onDoubleClick={() => {
                      if (existingSales !== undefined) {
                        handleInputChange(rowIndex, "dailyTotal", existingSales.toString());
                      }
                    }}
                  />
                </Tooltip>

                {/* Cash Daily Total */}
                <Input
                  mb={2}
                  value={row.cashDailyTotal}
                  onChange={(e) =>
                    handleInputChange(rowIndex, "cashDailyTotal", e.target.value)
                  }
                  placeholder="Cash Daily Total"
                  size="sm"
                />

                {/* Repeated expense sets */}
                {Array.from({ length: expenseSetsCount }).map((_, expIndex) => {
                  const ex = row.expenses[expIndex];
                  return (
                    <HStack key={expIndex} spacing={2} mb={2}>
                      <Input
                        flex="1"
                        placeholder={`Expense ${expIndex + 1}`}
                        size="sm"
                        value={ex.expense}
                        onChange={(e) =>
                          handleExpenseChange(rowIndex, expIndex, "expense", e.target.value)
                        }
                      />
                      <Input
                        flex="1"
                        placeholder="Amount"
                        size="sm"
                        value={ex.amount}
                        onChange={(e) =>
                          handleExpenseChange(rowIndex, expIndex, "amount", e.target.value)
                        }
                      />
                    </HStack>
                  );
                })}

                {/* Show row's expense total & difference */}
                <Divider my={2} />
                <Text>Expense Total: {rowExpenseTotal.toFixed(2)}</Text>
                <Text>Difference: {diff.toFixed(2)}</Text>
              </CardBody>
            </Card>
          );
        })}
      </VStack>

      {/* Summaries */}
      <Box mt={6} p={3} bg="gray.50" borderRadius="md" boxShadow="sm">
        <Text fontWeight="bold">Total Daily: {totals.totalDaily.toFixed(2)}</Text>
        <Text fontWeight="bold">Total Cash Daily: {totals.totalCashDaily.toFixed(2)}</Text>
        <Text fontWeight="bold">
          Total Expenses: {totals.totalExpenseCombined.toFixed(2)}
        </Text>
        <Text fontWeight="bold">
          Difference:{" "}
          {(
            (totals.totalDaily || 0) -
            ((totals.totalCashDaily || 0) + totals.totalExpenseCombined)
          ).toFixed(2)}
        </Text>
      </Box>

      {/* Buttons for the main daily expenses */}
      <Flex mt={4} gap={3} justify="center" wrap="wrap">
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

      {/* (B) The custom "modified-expenses" in a mobile card layout */}
      <Box mt={10} bg="white" p={4} borderRadius="md" boxShadow="md">
        <Heading size="md" mb={4} textAlign="center">
          Custom Purchases (Mobile View)
        </Heading>

        <Flex mb={4} gap={4} justify="center" align="center">
          <Button colorScheme="green" onClick={handleAddCustomRow}>
            SHTO BLERJE GJATE DITES
          </Button>
          <Button colorScheme="purple" onClick={handleAutoPopulateCustomRows}>
            SHTO BLERJET NGA XHIRO DITORE
          </Button>
        </Flex>

        {/* Each custom row is a Card */}
        <VStack spacing={4} align="stretch">
          {customRows.map((row, index) => {
            const suggestion = row.autoFillSuggestion;
            const tooltipLabel = suggestion
              ? `Double-click to autofill: ${suggestion}`
              : undefined;

            return (
              <Card key={index} bg="gray.50" boxShadow="sm">
                <CardBody>
                  <Text fontWeight="bold">Supplier</Text>
                  <Tooltip
                    hasArrow
                    isDisabled={!suggestion}
                    label={tooltipLabel}
                    placement="top"
                    isOpen={!!suggestion}
                  >
                    <Input
                      mb={2}
                      value={row.supplier}
                      placeholder="Supplier"
                      onChange={(e) =>
                        handleCustomRowChange(index, "supplier", e.target.value)
                      }
                      onDoubleClick={() => {
                        if (row.autoFillSuggestion) {
                          handleCustomRowChange(index, "supplier", row.autoFillSuggestion);
                        }
                      }}
                    />
                  </Tooltip>

                  <Text fontWeight="bold">Total Amount</Text>
                  <Input
                    mb={2}
                    value={row.totalAmount || ""}
                    placeholder="Total Amount"
                    onChange={(e) =>
                      handleCustomRowChange(index, "totalAmount", e.target.value)
                    }
                  />

                  <Text fontWeight="bold">Amount Paid</Text>
                  <Input
                    mb={2}
                    value={row.amountPaid || ""}
                    placeholder="Amount Paid"
                    onChange={(e) =>
                      handleCustomRowChange(index, "amountPaid", e.target.value)
                    }
                  />

                  <Text fontWeight="bold">Description</Text>
                  <Input
                    mb={2}
                    value={row.description || ""}
                    placeholder="Description"
                    onChange={(e) =>
                      handleCustomRowChange(index, "description", e.target.value)
                    }
                  />

                  <Text fontWeight="bold">Transaction Type</Text>
                  <Select
                    mb={2}
                    placeholder="Select Transaction Type"
                    value={row.transactionType || ""}
                    onChange={(e) =>
                      handleCustomRowChange(index, "transactionType", e.target.value)
                    }
                  >
                    <option value="BLERJE">BLERJE</option>
                    <option value="BORXHE">BORXHE</option>
                  </Select>

                  {/* Actions */}
                  <Flex gap={2} justify="center" mt={2}>
                    <Button
                      colorScheme="blue"
                      size="sm"
                      onClick={() => handleSaveCustomRow(index)}
                    >
                      {row.id ? "Update" : "Save"}
                    </Button>
                    {row.id && (
                      <Button colorScheme="red" size="sm" onClick={() => handleDeleteCustomRow(index)}>
                        Delete
                      </Button>
                    )}
                  </Flex>
                </CardBody>
              </Card>
            );
          })}
        </VStack>
      </Box>
    </Box>
  );
}
