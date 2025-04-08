import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Input,
  Button,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableContainer,
  Flex,
  useToast,
  Heading,
  Select,
  Fade,
  Tooltip,
} from "@chakra-ui/react";
import { AddIcon, CalendarIcon, RepeatIcon } from "@chakra-ui/icons";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// -----------------------------------------------------------------------------
// 1) Configuration & Constants
// -----------------------------------------------------------------------------
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
const COL_WIDTH = 150;

// A helper to always return "YYYY-MM-DD" in local time
function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`; // e.g. "2025-02-27"
}

// -----------------------------------------------------------------------------
// 2) Main Component
// -----------------------------------------------------------------------------
export default function DailyExpenses() {
  const toast = useToast();

  // The selected date for the daily expenses (and custom rows)
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Number of expense columns currently displayed in the main table
  const [expenseSetsCount, setExpenseSetsCount] = useState(1);

  // State for aggregated sales per seller
  const [salesSums, setSalesSums] = useState({});

  // ---------------- NEW: Supplier options for auto-fill (from aggregated endpoint)
  const [supplierOptions, setSupplierOptions] = useState([]);

  // customRows: array for the second table. We'll store “autoFillSuggestion” per row.
  const [customRows, setCustomRows] = useState([]);

  // --------------- Dark theme styling for DatePicker --------------
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
  // 1) tableData for main daily expenses
  // ---------------------------------------------------------------------------
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

  // ---------------------------------------------------------------------------
  // 2) Compute Totals for Main Table
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
  // 3) Fetch daily_expenses for main table
  // ---------------------------------------------------------------------------
  async function fetchExpenses(date) {
    const dateStr = formatLocalDate(date);
    try {
      const resp = await fetch(`${API_URL}/expenses/bulk?date=${dateStr}`);
      if (!resp.ok) throw new Error("Failed to fetch daily expenses");
      const data = await resp.json();
      const updatedTableData = buildTableDataFromDB(data);
      setTableData(updatedTableData);
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

    const finalTableData = SELLERS.map((sellerName) => {
      const upperName = sellerName.toUpperCase();
      if (bySeller[upperName]) {
        const itemArr = bySeller[upperName].items || [];
        return {
          seller: upperName,
          dailyTotal: bySeller[upperName].dailyTotal,
          cashDailyTotal: bySeller[upperName].cashDailyTotal,
          expenses: Array.from({ length: MAX_EXPENSE_SETS }, (_, i) => ({
            expense: itemArr[i]?.expense || "",
            amount: itemArr[i]?.amount || "",
            description: itemArr[i]?.description || "",
          })),
        };
      } else {
        return {
          seller: upperName,
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

    // Determine how many expense columns are actually used
    let maxItems = 1;
    for (const sellerRow of finalTableData) {
      const usedCols = sellerRow.expenses.filter(
        (it) => it.expense.trim() || it.amount.trim() || it.description.trim()
      ).length;
      if (usedCols > maxItems) {
        maxItems = usedCols;
      }
    }
    setExpenseSetsCount(Math.min(maxItems, MAX_EXPENSE_SETS));
    return finalTableData;
  }

  // ---------------------------------------------------------------------------
  // 4) Fetch customRows (modified_expenses) for second table
  // ---------------------------------------------------------------------------
  async function fetchCustomRows(date) {
    const dateStr = formatLocalDate(date);
    try {
      const resp = await fetch(`${API_URL}/modified-expenses?date=${dateStr}`);
      if (!resp.ok) throw new Error("Failed to fetch custom rows");
      const data = await resp.json();
      // Transform keys from snake_case to camelCase:
      const transformed = data.map((row) => ({
        id: row.id,
        supplier: row.supplier,
        totalAmount: row.total_amount,
        amountPaid: row.amount_paid,
        description: row.description,
        transactionType: row.transaction_type,
        date: row.date,
        created_at: row.created_at,
        // We'll store autoFillSuggestion for tooltips
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
  // 5) Fetch & Aggregate Sales Data
  // ---------------------------------------------------------------------------
  async function fetchSalesData(date) {
    const dateStr = formatLocalDate(date);
    const startOfDay = `${dateStr}T00:00:00`;
    const endOfDay = `${dateStr}T23:59:59`;
    const sellersQuery = SELLERS.join(",");
    const url = `${API_URL}/sales/all-data?startDate=${startOfDay}&endDate=${endOfDay}&sellers=${sellersQuery}&limit=100000`;

    try {
      const resp = await fetch(url);
      if (!resp.ok) {
        throw new Error("Failed to fetch sales data");
      }
      const data = await resp.json();

      // Summation
      const sums = {};
      for (const row of data) {
        const seller = (row.Seller || "").toUpperCase();
        const totalPrice = parseFloat(row.Total_Article_Price) || 0;
        if (!sums[seller]) {
          sums[seller] = 0;
        }
        sums[seller] += totalPrice;
      }
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
  // ------------- NEW: Fetch all unique supplier names from aggregated -----------
  // ---------------------------------------------------------------------------
  async function fetchSupplierOptions() {
    try {
      const resp = await fetch(`${API_URL}/aggregated-modified-expenses`);
      if (!resp.ok) throw new Error("Failed to fetch aggregated data");
      const data = await resp.json();
      // data is an array of objects: { supplier, transaction_type, ... }
      // Let's extract unique supplier names
      const namesSet = new Set();
      data.forEach((item) => {
        if (item.supplier) {
          namesSet.add(item.supplier.trim());
        }
      });
      const uniqueNames = [...namesSet];
      setSupplierOptions(uniqueNames);
    } catch (err) {
      console.error("Error fetching supplier options:", err);
      // not critical, so we might not show a toast
    }
  }

  // We'll fetch these supplier names once, on mount:
  useEffect(() => {
    fetchSupplierOptions();
  }, []);

  // ---------------------------------------------------------------------------
  // Main Table Input Handlers
  // ---------------------------------------------------------------------------
  function handleInputChange(rowIndex, field, value) {
    setTableData((prev) => {
      const updated = [...prev];
      updated[rowIndex][field] = value;
      return updated;
    });
  }

  function handleExpenseChange(rowIndex, expenseIndex, field, value) {
    setTableData((prev) => {
      const updated = [...prev];
      updated[rowIndex].expenses[expenseIndex][field] = value;
      return updated;
    });
  }

  // ---------------------------------------------------------------------------
  // Custom Row Handlers for second table
  // ---------------------------------------------------------------------------
  function handleCustomRowChange(index, field, value) {
    setCustomRows((prev) => {
      const updated = [...prev];
      const row = updated[index];
      row[field] = value;

      if (field === "supplier") {
        // Attempt to find a best match from supplierOptions
        const typedVal = value.trim().toLowerCase();
        if (typedVal.length >= 2) {
          // For simplicity, find first .startsWith() match
          const suggestion = supplierOptions.find((opt) =>
            opt.toLowerCase().startsWith(typedVal)
          );
          row.autoFillSuggestion = suggestion || null;
        } else {
          row.autoFillSuggestion = null;
        }
      }

      return updated;
    });
  }

  // Add new custom row
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

  // Save a single custom row
  async function handleSaveCustomRow(index) {
    const row = customRows[index];
    const dateStr = formatLocalDate(selectedDate);

    if (!row.supplier) {
      toast({
        title: "Validation Error",
        description: "Supplier is required",
        status: "warning",
      });
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
        // Update existing row
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
        const transformedRow = {
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
        toast({
          title: "Success",
          description: "Custom row updated",
          status: "success",
        });
        setCustomRows((prev) => {
          const updated = [...prev];
          updated[index] = transformedRow;
          return updated;
        });
      } else {
        // Create new row
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
        const transformedRow = {
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
        toast({
          title: "Success",
          description: "Custom row saved",
          status: "success",
        });
        setCustomRows((prev) => {
          const updated = [...prev];
          updated[index] = transformedRow;
          return updated;
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
      });
    }
  }

  async function handleDeleteCustomRow(index) {
    const row = customRows[index];
    if (!row.id) {
      // If row not saved in DB, remove from array
      setCustomRows((prev) => prev.filter((_, i) => i !== index));
      return;
    }
    try {
      const resp = await fetch(`${API_URL}/modified-expenses/${row.id}`, {
        method: "DELETE",
      });
      if (!resp.ok) throw new Error("Failed to delete custom row");
      toast({
        title: "Success",
        description: "Custom row deleted",
        status: "success",
      });
      setCustomRows((prev) => prev.filter((_, i) => i !== index));
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Auto-Populate Custom Rows from Main Table Expenses
  // ---------------------------------------------------------------------------
  function handleAutoPopulateCustomRows() {
    const aggregated = {};
    tableData.forEach((sellerRow) => {
      for (let i = 0; i < expenseSetsCount; i++) {
        const expenseObj = sellerRow.expenses[i];
        const expenseName = expenseObj.expense.trim();
        const amountValue = parseFloat(expenseObj.amount) || 0;
        if (expenseName) {
          const key = expenseName.toLowerCase();
          if (!aggregated[key]) {
            aggregated[key] = {
              supplier: expenseName,
              totalAmount: 0,
              amountPaid: 0,
              description: "",
              transactionType: "",
            };
          }
          aggregated[key].totalAmount += amountValue;
          aggregated[key].amountPaid += amountValue;
        }
      }
    });

    const aggregatedRows = Object.values(aggregated).map((row) => ({
      ...row,
      totalAmount: row.totalAmount.toString(),
      amountPaid: row.amountPaid.toString(),
    }));

    const mergedRows = [...customRows];
    aggregatedRows.forEach((aggRow) => {
      const index = mergedRows.findIndex(
        (r) => r.supplier.toLowerCase() === aggRow.supplier.toLowerCase()
      );
      if (index !== -1) {
        mergedRows[index].totalAmount = (
          (parseFloat(mergedRows[index].totalAmount) || 0) +
          (parseFloat(aggRow.totalAmount) || 0)
        ).toString();
        mergedRows[index].amountPaid = (
          (parseFloat(mergedRows[index].amountPaid) || 0) +
          (parseFloat(aggRow.amountPaid) || 0)
        ).toString();
      } else {
        mergedRows.push(aggRow);
      }
    });

    setCustomRows(mergedRows);
    toast({
      title: "Auto Populate",
      description:
        "Aggregated custom rows have been merged with existing custom rows.",
      status: "success",
    });
  }

  // ---------------------------------------------------------------------------
  // Save Handler for Main Daily Expenses Table
  // ---------------------------------------------------------------------------
  async function handleSave() {
    const dateStr = formatLocalDate(selectedDate);
    const entriesToSave = [];

    tableData.forEach((row) => {
      const rowHasData =
        row.dailyTotal.trim() ||
        row.cashDailyTotal.trim() ||
        row.expenses.some(
          (exp) => exp.expense.trim() || exp.amount.trim() || exp.description.trim()
        );
      if (!rowHasData) {
        return; // skip empty
      }

      const usedExpenses = row.expenses
        .slice(0, expenseSetsCount)
        .filter((ex) => ex.expense.trim() || ex.amount.trim() || ex.description.trim());

      if (usedExpenses.length === 0) {
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
      // Delete old rows for the date
      await fetch(`${API_URL}/expenses/bulk?date=${dateStr}`, {
        method: "DELETE",
      });

      // If we have anything to save, insert them
      if (entriesToSave.length > 0) {
        const insertResp = await fetch(`${API_URL}/expenses/bulk`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ selectedDate: dateStr, entries: entriesToSave }),
        });
        if (!insertResp.ok) {
          throw new Error("Failed to save daily expenses");
        }
      }

      toast({
        title: "Success",
        description: "Daily expenses saved",
        status: "success",
      });
      // Refresh data
      fetchExpenses(selectedDate);
      fetchCustomRows(selectedDate);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Clear local main table
  // ---------------------------------------------------------------------------
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
        }))
      }))
    );
    toast({
      title: "Cleared",
      description: "All daily expenses cleared (locally)",
      status: "info",
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

  // ---------------------------------------------------------------------------
  // useEffect: fetch data on selectedDate change
  // ---------------------------------------------------------------------------
  useEffect(() => {
    fetchExpenses(selectedDate);
    fetchCustomRows(selectedDate);
    fetchSalesData(selectedDate);
    // eslint-disable-next-line
  }, [selectedDate]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <Box p={4}>
      {/* Fade-in box for "ZGJIDH DATEN" heading & DatePicker */}
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
          <Heading
            size="md"
            mb={4}
            color="white"
            fontWeight="bold"
            textTransform="uppercase"
          >
            ZGJIDH DATEN PER XHIRON DITORE DHE BLERJET
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

      <Box height="10rem" />

      {/* Main Daily Expenses Table */}
      <Box p={4} bg="white" borderRadius="md" boxShadow="md" bgColor="#f7fafc">
        <Heading
          size="md"
          mb={4}
          align="center"
          padding={3}
          marginBottom={10}
          marginTop={10}
        >
          DATA: {selectedDate.toLocaleDateString("en-CA")}
        </Heading>
        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr bg="gray.200">
                <Th
                  style={{
                    position: "sticky",
                    left: 0,
                    background: "#fff",
                    zIndex: 2,
                    minWidth: COL_WIDTH,
                  }}
                >
                  Seller
                </Th>
                <Th
                  style={{
                    position: "sticky",
                    left: `${COL_WIDTH}px`,
                    background: "#fff",
                    zIndex: 2,
                    minWidth: COL_WIDTH,
                  }}
                >
                  TOTAL
                </Th>
                <Th
                  style={{
                    position: "sticky",
                    left: `${COL_WIDTH * 2}px`,
                    background: "#fff",
                    zIndex: 2,
                    minWidth: COL_WIDTH,
                  }}
                >
                  Cash Total
                </Th>
                <Th
                  style={{
                    position: "sticky",
                    left: `${COL_WIDTH * 3}px`,
                    background: "#fff",
                    zIndex: 2,
                    minWidth: COL_WIDTH,
                  }}
                >
                  Total Expenses
                </Th>
                <Th
                  style={{
                    position: "sticky",
                    left: `${COL_WIDTH * 4}px`,
                    background: "#fff",
                    zIndex: 2,
                    minWidth: COL_WIDTH,
                  }}
                >
                  Difference
                </Th>
                {Array.from({ length: expenseSetsCount }).map((_, i) => (
                  <React.Fragment key={i}>
                    <Th style={{ minWidth: COL_WIDTH }}>Expense {i + 1}</Th>
                    <Th style={{ minWidth: COL_WIDTH }}>Amount {i + 1}</Th>
                  </React.Fragment>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {tableData.map((row, rowIndex) => {
                const rowExpenseTotal = row.expenses
                  .slice(0, expenseSetsCount)
                  .reduce((acc, cur) => acc + (parseFloat(cur.amount) || 0), 0);
                const diff =
                  (parseFloat(row.dailyTotal) || 0) -
                  ((parseFloat(row.cashDailyTotal) || 0) + rowExpenseTotal);

                const existingSales = salesSums[row.seller];
                const tooltipLabel =
                  existingSales === undefined
                    ? "No sales data found"
                    : `Sales found: ${existingSales.toFixed(2)} (double-click to auto-fill)`;

                return (
                  <Tr key={rowIndex} bg="#e8f5e9">
                    {/* Seller cell (sticky) */}
                    <Td
                      style={{
                        position: "sticky",
                        left: 0,
                        background: "#fff",
                        zIndex: 1,
                        minWidth: COL_WIDTH,
                      }}
                    >
                      {row.seller}
                    </Td>
                    {/* Daily Total (sticky) with Tooltip */}
                    <Td
                      style={{
                        position: "sticky",
                        left: `${COL_WIDTH}px`,
                        background: "#fff",
                        zIndex: 1,
                        minWidth: COL_WIDTH,
                      }}
                    >
                      <Tooltip hasArrow placement="top" label={tooltipLabel}>
                        <Input
                          w={`${COL_WIDTH}px`}
                          value={row.dailyTotal}
                          onChange={(e) =>
                            handleInputChange(rowIndex, "dailyTotal", e.target.value)
                          }
                          placeholder="0"
                          size="sm"
                          onDoubleClick={() => {
                            if (existingSales !== undefined) {
                              handleInputChange(
                                rowIndex,
                                "dailyTotal",
                                existingSales.toString()
                              );
                            }
                          }}
                        />
                      </Tooltip>
                    </Td>
                    {/* Cash Daily Total (sticky) */}
                    <Td
                      style={{
                        position: "sticky",
                        left: `${COL_WIDTH * 2}px`,
                        background: "#fff",
                        zIndex: 1,
                        minWidth: COL_WIDTH,
                      }}
                    >
                      <Input
                        w={`${COL_WIDTH}px`}
                        value={row.cashDailyTotal}
                        onChange={(e) =>
                          handleInputChange(rowIndex, "cashDailyTotal", e.target.value)
                        }
                        placeholder="0"
                        size="sm"
                      />
                    </Td>
                    {/* rowExpenseTotal */}
                    <Td
                      style={{
                        position: "sticky",
                        left: `${COL_WIDTH * 3}px`,
                        background: "#fff",
                        zIndex: 1,
                        minWidth: COL_WIDTH,
                      }}
                    >
                      {rowExpenseTotal}
                    </Td>
                    {/* Difference */}
                    <Td
                      style={{
                        position: "sticky",
                        left: `${COL_WIDTH * 4}px`,
                        background: "#fff",
                        zIndex: 1,
                        minWidth: COL_WIDTH,
                      }}
                    >
                      {diff}
                    </Td>
                    {/* Dynamic expense columns */}
                    {Array.from({ length: expenseSetsCount }).map((_, expIndex) => (
                      <React.Fragment key={expIndex}>
                        <Td style={{ minWidth: COL_WIDTH }}>
                          <Input
                            w={`${COL_WIDTH}px`}
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
                        <Td style={{ minWidth: COL_WIDTH }}>
                          <Input
                            w={`${COL_WIDTH}px`}
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
                      </React.Fragment>
                    ))}
                  </Tr>
                );
              })}
            </Tbody>
            <Tfoot>
              <Tr bg="gray.200">
                <Td>Total:</Td>
                <Td>{totals.totalDaily}</Td>
                <Td>{totals.totalCashDaily}</Td>
                <Td>{totals.totalExpenseCombined}</Td>
                <Td>
                  {(totals.totalDaily || 0) -
                    ((totals.totalCashDaily || 0) + totals.totalExpenseCombined)}
                </Td>
                {Array.from({ length: expenseSetsCount }).map((_, i) => (
                  <React.Fragment key={i}>
                    <Td />
                    <Td />
                  </React.Fragment>
                ))}
              </Tr>
            </Tfoot>
          </Table>
        </TableContainer>

        {/* Actions row for main table */}
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
          <Button
            colorScheme="orange"
            leftIcon={<RepeatIcon />}
            onClick={handleClearExpenses}
          >
            Clear
          </Button>
        </Flex>
      </Box>

      {/* Custom Modified Rows Table */}
      <Box mt={8} p={4} bg="white" borderRadius="md" boxShadow="md">
        <Heading
          size="md"
          mb={4}
          align="center"
          padding={3}
          marginBottom={10}
          marginTop={10}
        >
          DATA PER BLERJET GJATE DITES : {selectedDate.toLocaleDateString("en-CA")}
        </Heading>

        {/* Centered buttons for second table */}
        <Flex mb={4} gap={4} justify="center" align="center">
          <Button colorScheme="green" onClick={handleAddCustomRow}>
            SHTO BLERJE GJATE DITES
          </Button>
          <Button colorScheme="purple" onClick={handleAutoPopulateCustomRows}>
            SHTO BLERJET NGA XHIRO DITORE
          </Button>
        </Flex>

        <TableContainer>
          <Table variant="striped" colorScheme="gray">
            <Thead>
              <Tr bg="gray.200">
                <Th>Supplier</Th>
                <Th>Total Amount</Th>
                <Th>Amount Paid</Th>
                <Th>Description</Th>
                <Th>Transaction Type</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {customRows.map((row, index) => {
                const suggestion = row.autoFillSuggestion; // e.g. "AADF" or null
                const tooltipLabel = suggestion
                  ? `Double-click to autofill: ${suggestion}`
                  : undefined;

                return (
                  <Tr key={index}>
                    {/* Supplier with a Tooltip for auto-fill */}
                    <Td>
                      <Tooltip
                        hasArrow
                        isDisabled={!suggestion}
                        label={tooltipLabel}
                        placement="top"
                        isOpen={!!suggestion} // always show if we have a suggestion
                      >
                        <Input
                          value={row.supplier}
                          placeholder="Supplier"
                          onChange={(e) =>
                            handleCustomRowChange(index, "supplier", e.target.value)
                          }
                          onDoubleClick={() => {
                            if (row.autoFillSuggestion) {
                              // fill in the suggestion
                              handleCustomRowChange(
                                index,
                                "supplier",
                                row.autoFillSuggestion
                              );
                            }
                          }}
                        />
                      </Tooltip>
                    </Td>
                    <Td>
                      <Input
                        value={row.totalAmount || ""}
                        placeholder="Total Amount"
                        onChange={(e) =>
                          handleCustomRowChange(index, "totalAmount", e.target.value)
                        }
                      />
                    </Td>
                    <Td>
                      <Input
                        value={row.amountPaid || ""}
                        placeholder="Amount Paid"
                        onChange={(e) =>
                          handleCustomRowChange(index, "amountPaid", e.target.value)
                        }
                      />
                    </Td>
                    <Td>
                      <Input
                        value={row.description || ""}
                        placeholder="Description"
                        onChange={(e) =>
                          handleCustomRowChange(index, "description", e.target.value)
                        }
                      />
                    </Td>
                    <Td>
                      <Select
                        placeholder="Select Transaction Type"
                        value={row.transactionType || ""}
                        onChange={(e) =>
                          handleCustomRowChange(index, "transactionType", e.target.value)
                        }
                      >
                        <option value="BLERJE">BLERJE</option>
                        <option value="BORXHE">BORXHE</option>
                      </Select>
                    </Td>
                    <Td>
                      <Flex justify="center" align="center" gap={2}>
                        <Button
                          colorScheme="blue"
                          size="sm"
                          onClick={() => handleSaveCustomRow(index)}
                        >
                          {row.id ? "Update" : "Save"}
                        </Button>
                        {row.id && (
                          <Button
                            colorScheme="red"
                            size="sm"
                            onClick={() => handleDeleteCustomRow(index)}
                          >
                            Delete
                          </Button>
                        )}
                      </Flex>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}
