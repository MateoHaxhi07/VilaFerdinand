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
  useToast,
  Card,
  CardBody,
  Divider,
  Grid,
  GridItem
} from "@chakra-ui/react";
import { CalendarIcon, RepeatIcon, AddIcon } from "@chakra-ui/icons";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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

  // Dark styling for DatePicker
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
  // Compute Totals
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
  // Fetch daily_expenses
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
  // Fetch customRows (modified_expenses)
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
  // Fetch & sum sales data
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
  // Supplier options (aggregated) for custom rows
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

  // On date change: fetch everything
  useEffect(() => {
    fetchExpenses(selectedDate);
    fetchCustomRows(selectedDate);
    fetchSalesData(selectedDate);
    // eslint-disable-next-line
  }, [selectedDate]);

  // Main table input handlers
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
        // Just daily totals
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
      // delete old rows for the selected date
      await fetch(`${API_URL}/expenses/bulk?date=${dateStr}`, { method: "DELETE" });

      // then insert new rows (if any)
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

  // Custom row logic for second table (modified_expenses)
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
        // update existing row
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
        // insert new row
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
      const resp = await fetch(`${API_URL}/modified-expenses/${row.id}`, {
        method: "DELETE",
      });
      if (!resp.ok) throw new Error("Failed to delete custom row");
      toast({ title: "Success", description: "Custom row deleted", status: "success" });
      setCustomRows((prev) => prev.filter((_, i) => i !== index));
    } catch (err) {
      toast({ title: "Error", description: err.message, status: "error" });
    }
  }

  // Auto-populate from main table expenses
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

  return (
    <Box p={4}>
      <Fade in={true}>
        {/* A fancy gradient box for the date picker */}
        <Box
          p={4}
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Box
            p={6}
            bgGradient="linear(to-r, teal.400, teal.600)"
            borderRadius="lg"
            boxShadow="lg"
            border="1px solid"
            borderColor="whiteAlpha.200"
            textAlign="center"
            mt={10}
            mb={4}
            display="inline-block"
            _hover={{
              transform: "scale(1.05)",
              boxShadow: "0 0 20px rgba(0, 255, 255, 0.8)",
            }}
          >
            <Heading
              size="md"
              mb={4}
              color="white"
              fontWeight="bold"
              textTransform="uppercase"
            >
              ZGJIDH DATEN
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
        </Box>
      </Fade>

      <Box mt={6} />

      {/* XHIRO DITORE pill heading */}
      <Box
        bg="rgb(255, 255, 255)"
        borderRadius="18px"
        px="16px"
        py="7.5px"
        display="flex"
        width="100%"
        justifyContent="center"
        alignItems="center"
        mb={4}
        mt={6}
      >


      {/* Summaries: arrow-shaped items in one row */}
      <Grid
        templateColumns={{ base: "1fr", md: "repeat(4, auto)" }}
        gap={4}
        mb={4}
      >
        {/* 1) XHIRO DITORE */}
        <GridItem
          position="relative"
          w="260px"
          h="80px"
          bgGradient="linear-gradient(91deg, rgba(49,114,176, 0.75) 0%, rgb(49,114,176), rgb(49,114,176))"
          clipPath="polygon(
            0% 0%,
            calc(100% - 30px) 0%,
            100% 50%,
            calc(100% - 30px) 100%,
            0% 100%
          )"
          pb={2}
        >
          <Box p={4}>
            <Text fontSize="lg" color="white" fontWeight="bold" mb={1}>
              XHIRO DITORE
            </Text>
            <Text fontSize="xl" color="white" fontWeight="bold">
              {`${Number(totals.totalDaily.toFixed(0)).toLocaleString()} ALL`}
            </Text>
          </Box>
        </GridItem>

        {/* 2) SHPENZIME */}
        <GridItem
          position="relative"
          w="260px"
          h="80px"
          bgGradient="linear-gradient(91deg, rgba(43,131,126, 0.75) 0%, rgb(43,131,126), rgb(43,131,126))"
          clipPath="polygon(
            0% 0%,
            calc(100% - 30px) 0%,
            100% 50%,
            calc(100% - 30px) 100%,
            0% 100%
          )"
          pb={2}
        >
          <Box p={4}>
            <Text fontSize="lg" color="white" fontWeight="bold" mb={1}>
              SHPENZIME
            </Text>
            <Text fontSize="xl" color="white" fontWeight="bold">
              {`${Number(totals.totalExpenseCombined.toFixed(0)).toLocaleString()} ALL`}
            </Text>
          </Box>
        </GridItem>

        {/* 3) CASH TOTAL */}
        <GridItem
          position="relative"
          w="260px"
          h="80px"
          bgGradient="linear-gradient(to right, rgb(115,87,144), rgba(115,87,144, 0.75))"
          clipPath="polygon(
            0% 0%,
            calc(100% - 30px) 0%,
            100% 50%,
            calc(100% - 30px) 100%,
            0% 100%
          )"
          pb={2}
        >
          <Box p={4}>
            <Text fontSize="lg" color="white" fontWeight="bold" mb={1}>
              CASH TOTAL
            </Text>
            <Text fontSize="xl" color="white" fontWeight="bold">
              {`${Number(totals.totalCashDaily.toFixed(0)).toLocaleString()} ALL`}
            </Text>
          </Box>
        </GridItem>

        {/* 4) DIFFERENCE */}
        <GridItem
          position="relative"
          w="260px"
          h="80px"
          bgGradient="linear-gradient(91deg, rgba(149,110,73, 0.75) 0%, rgb(149,110,73), rgb(149,110,73))"
          clipPath="polygon(
            0% 0%,
            calc(100% - 30px) 0%,
            100% 50%,
            calc(100% - 30px) 100%,
            0% 100%
          )"
          pb={2}
        >
          <Box p={4}>
            <Text fontSize="lg" color="white" fontWeight="bold" mb={1}>
              DIFFERENCE
            </Text>
            <Text fontSize="xl" color="white" fontWeight="bold">
              {`${Number(
                (totals.totalDaily || 0) -
                ((totals.totalCashDaily || 0) + totals.totalExpenseCombined)
              ).toLocaleString()} ALL`}
            </Text>
          </Box>
        </GridItem>
      </Grid>
      </Box>

      {/* The main daily expenses list */}
      <Box
        bg="rgb(255, 255, 255)"
        borderRadius="18px"
        px="16px"
        py="7.5px"
        display="flex"
        width="100%"
        justifyContent="center"
        alignItems="center"
        mb={4}
        mt={6}
      >
      <VStack spacing={6} align="stretch">
        {tableData.map((row, rowIndex) => {
          // Compute row totals:
          const rowExpenseTotal = row.expenses
            .slice(0, expenseSetsCount)
            .reduce((acc, cur) => acc + (parseFloat(cur.amount) || 0), 0);
          const diff =
            (parseFloat(row.dailyTotal) || 0) -
            ((parseFloat(row.cashDailyTotal) || 0) + rowExpenseTotal);

          // For auto-fill tooltip:
          const existingSales = salesSums[row.seller];
          const tooltipLabel = existingSales
            ? `Double-click to auto-fill. Found sales: ${existingSales.toFixed(0)}`
            : "No sales data found.";

          return (
            <Card key={rowIndex} bg="white" boxShadow="md">
              <CardBody>
                {/* Seller header */}
                <HStack justifyContent="center" w="100%" mb={4}>
  <Box
    bg="gray.200"
    borderRadius="18px"
    px="16px"
    py="7.5px"
    display="inline-block"
    maxW="200px"
    whiteSpace="normal"
    overflowWrap="break-word"
    wordBreak="break-word"

    textAlign="center"  // center text inside the box
  >
    <Text fontSize="lg" color="black" fontWeight="bold">
      {row.seller}
    </Text>
  </Box>
</HStack>

                {/* DAILY & CASH in separate rows */}
                <VStack spacing={4} alignItems="stretch" mb={4}>
  {/* FIRST ROW: Daily Total */}
  <HStack spacing={4} alignItems="center">
    <Box
      bg="gray.200"
      borderRadius="18px"
      px="16px"
      py="7.5px"
      display="flex"
      justifyContent="center"
      alignItems="center"
      flex="1"
    >
      <Text fontSize="md" fontWeight="bold" color="black">
        DAILY TOTAL:
      </Text>
    </Box>
    <Box
      bg="gray.200"
      borderRadius="18px"
      px="16px"
      py="7.5px"
      display="flex"
      justifyContent="center"
      alignItems="center"
      flex="1"
    >
<Input
  type="number"
  // Help mobile devices show numeric keyboard
  inputMode="decimal"
  // If you only want integers, use `inputMode="numeric"` and pattern="^\d+$"
  // e.g., pattern="^\d+$"
  pattern="^\d*\.?\d*$"
  size="sm"
  value={row.dailyTotal}
  border="none"
  bg="gray.200"
  _focus={{ outline: "none" }}
  onChange={(e) => {
    // 1) Get the raw user input
    const rawValue = e.target.value;

    // 2) Remove any characters that are NOT digits or a dot
    const sanitizedValue = rawValue.replace(/[^0-9.]/g, "");

    // 3) If you want to disallow multiple decimals,
    //    you can remove any second '.' with:
    //    sanitizedValue = sanitizedValue.replace(/(\..*)\./g, '$1');

    // 4) Update the state
    handleInputChange(rowIndex, "dailyTotal", sanitizedValue);
  }}
/>
    </Box>
  </HStack>

  {/* SECOND ROW: Cash Total */}
  <HStack spacing={4} alignItems="center">
    <Box
      bg="gray.200"
      borderRadius="18px"
      px="16px"
      py="7.5px"
      display="flex"
      justifyContent="center"
      alignItems="center"
      flex="1"
    >
      <Text fontSize="md" fontWeight="bold" color="black">
        CASH TOTAL:
      </Text>
    </Box>
    <Box
      bg="gray.200"
      borderRadius="18px"
      px="16px"
      py="7.5px"
      display="flex"
      justifyContent="center"
      alignItems="center"
      flex="1"
    >
<Input
  // Make it type="number" to hint numeric input,
  // especially on mobile devices.
  type="number"
  // 'inputMode="decimal"' helps mobile browsers show a decimal keyboard.
  inputMode="decimal"
  // Use a pattern that matches digits and optional decimal portion.
  pattern="^\d*\.?\d*$"
  size="sm"
  value={row.cashDailyTotal}
  border="none"
  bg="gray.200"
  _focus={{ outline: "none" }}
  onChange={(e) => {
    // 1) Read the raw user input.
    const rawValue = e.target.value;

    // 2) Remove any characters that are NOT digits or a dot.
    let sanitizedValue = rawValue.replace(/[^0-9.]/g, "");

    // 3) (Optional) If you only want to allow ONE decimal point,
    //    remove any extra:
    // sanitizedValue = sanitizedValue.replace(/(\..*)\./g, "$1");

    // 4) Update state with the sanitized numeric string
    handleInputChange(rowIndex, "cashDailyTotal", sanitizedValue);
  }}
/>
    </Box>
  </HStack>

  {/* THIRD ROW: Blerjet */}
  <HStack spacing={4} alignItems="center">
    <Box
      bg="gray.200"
      borderRadius="18px"
      px="16px"
      py="7.5px"
      display="flex"
      justifyContent="center"
      alignItems="center"
      flex="1"
    >
      <Text fontSize="md" fontWeight="bold" color="black">
        BLERJET:
      </Text>
    </Box>
    <Box
      bg="gray.200"
      borderRadius="18px"
      px="16px"
      py="7.5px"
      display="flex"
      justifyContent="center"
      alignItems="center"
      flex="1"
    >
      <Text>{rowExpenseTotal.toFixed(0)}</Text>
    </Box>
  </HStack>

  {/* FOURTH ROW: Difference */}
  <HStack spacing={4} alignItems="center">
    <Box
      bg="gray.200"
      borderRadius="18px"
      px="16px"
      py="7.5px"
      display="flex"
      justifyContent="center"
      alignItems="center"
      flex="1"
    >
      <Text fontSize="md" fontWeight="bold" color="black">
        DIFFERENCE:
      </Text>
    </Box>
    <Box
      bg="gray.200"
      borderRadius="18px"
      px="16px"
      py="7.5px"
      display="flex"
      justifyContent="center"
      alignItems="center"
      flex="1"
    >
      <Text>{diff.toFixed(0)}</Text>
    </Box>
  </HStack>
</VStack>

                {/* Repeated expense sets: now each row has an Input for expense name & an Input for amount */}
                <VStack spacing={4} alignItems="stretch" mt={3}>
                  {row.expenses.slice(0, expenseSetsCount).map((expense, expIndex) => (
                    <HStack key={expIndex} spacing={4} alignItems="center">
                      {/* Expense Name: editable Input */}
                      <Box
                        bg="gray.200"
                        borderRadius="18px"
                        px="16px"
                        py="7.5px"
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        flex="1"
                      >
                        <Input
                          size="sm"
                          placeholder={`Expense ${expIndex + 1}`}
                          value={expense.expense}
                          onChange={(e) =>
                            handleExpenseChange(rowIndex, expIndex, "expense", e.target.value)
                          }
                          border="none"
                          bg="gray.200"
                          _focus={{ outline: "none" }}
                        />
                      </Box>

                      {/* Amount Input */}
                      <Box
                        bg="gray.200"
                        borderRadius="18px"
                        px="16px"
                        py="7.5px"
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        flex="1"
                      >
                       <Input
  type="number"
  inputMode="decimal"
  pattern="^\d*\.?\d*$"
  size="sm"
  placeholder="Amount"
  value={expense.amount}
  border="none"
  bg="gray.200"
  _focus={{ outline: "none" }}
  onChange={(e) => {
    // 1) Grab raw user input
    const rawValue = e.target.value;

    // 2) Remove all characters that are NOT digits or '.'
    let sanitizedValue = rawValue.replace(/[^0-9.]/g, "");

    // 3) (Optional) If only one decimal point is allowed, remove extras:
    //    sanitizedValue = sanitizedValue.replace(/(\..*)\./g, "$1");

    // 4) Update state using your existing handler
    handleExpenseChange(rowIndex, expIndex, "amount", sanitizedValue);
  }}
/>
                      </Box>
                    </HStack>
                  ))}
                </VStack>

                <Divider my={2} />
              </CardBody>
            </Card>
          );
        })}
      </VStack>
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

      {/* (C) The custom "modified-expenses" in a mobile card layout */}
      <Box
        bg="rgb(255, 255, 255)"
        borderRadius="18px"
        px="16px"
        py="7.5px"
        display="flex"
        width="100%"
        justifyContent="center"
        alignItems="center"
        mb={4}
        mt={6}
      >
      <Box mt={10} bg="white" p={4} borderRadius="md" boxShadow="md">
        <Box
          bg="rgb(180, 189, 208)"
          borderRadius="18px"
          px="16px"
          py="7.5px"
          display="flex"
          width="100%"
          justifyContent="center"
          alignItems="center"
          mb={4}
        >
          <Heading as="h2" fontSize="26px" color="black" fontWeight="bold" mb={0}>
            BLERJET GJATE DITES
          </Heading>
        </Box>

        <Flex mb={4} gap={4} justify="center" align="center">
          <Button colorScheme="green" onClick={handleAddCustomRow}>
            SHTO BLERJET DITES
          </Button>
          <Button colorScheme="purple" onClick={handleAutoPopulateCustomRows}>
            SHTO BLERJET XHIRO DITORE
          </Button>
        </Flex>

        <VStack spacing={2} align="stretch">
  {customRows.map((row, index) => {
    const suggestion = row.autoFillSuggestion;
    const tooltipLabel = suggestion
      ? `Double-click to autofill: ${suggestion}`
      : undefined;

    return (
      <Card key={index} bg="gray.50" boxShadow="sm" p={2}>
        <CardBody>
          <Text fontWeight="bold" fontSize="sm" mb={1}>
            Supplier
          </Text>
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
              size="sm" // Smaller input size
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




          
          <Text fontWeight="bold" fontSize="sm" mb={1}>
  Total Amount
</Text>
<Input
  // Present numeric keyboard on mobile
  type="number"
  inputMode="decimal"
  // Basic pattern for an optional decimal
  pattern="^\d*\.?\d*$"
  mb={2}
  size="sm"
  placeholder="Total Amount"
  value={row.totalAmount || ""}
  onChange={(e) => {
    // 1) Raw user input
    const rawValue = e.target.value;

    // 2) Strip all non-digit/decimal characters
    let sanitizedValue = rawValue.replace(/[^0-9.]/g, "");

    // 3) (Optional) Enforce only one decimal point
    // sanitizedValue = sanitizedValue.replace(/(\..*)\./g, '$1');

    // 4) Update state with sanitized string
    handleCustomRowChange(index, "totalAmount", sanitizedValue);
  }}
/>


<Text fontWeight="bold" fontSize="sm" mb={1}>
  Amount Paid
</Text>
<Input
  // Use type="number" and inputMode="decimal" to encourage numeric keyboard on mobile
  type="number"
  inputMode="decimal"
  // Pattern (optional) for numeric with optional decimal
  pattern="^\d*\.?\d*$"
  mb={2}
  size="sm"
  placeholder="Amount Paid"
  value={row.amountPaid || ""}
  onChange={(e) => {
    // 1) Get the raw user input
    const rawValue = e.target.value;

    // 2) Remove all characters that aren't digits or '.'
    let sanitizedValue = rawValue.replace(/[^0-9.]/g, "");

    // 3) (Optional) If you'd like to allow only one decimal point, uncomment:
    // sanitizedValue = sanitizedValue.replace(/(\..*)\./g, '$1');

    // 4) Call your existing handler with the sanitized numeric value
    handleCustomRowChange(index, "amountPaid", sanitizedValue);
  }}


/>




          <Text fontWeight="bold" fontSize="sm" mb={1}>
            Description
          </Text>
          <Input
            mb={2}
            value={row.description || ""}
            placeholder="Description"
            size="sm" // Smaller input size
            onChange={(e) =>
              handleCustomRowChange(index, "description", e.target.value)
            }
          />

          <Text fontWeight="bold" fontSize="sm" mb={1}>
            Transaction Type
          </Text>
          <Select
            mb={2}
            placeholder="Select Transaction Type"
            value={row.transactionType || ""}
            size="sm" // Smaller select size
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
              size="xs" // Smaller button size
              onClick={() => handleSaveCustomRow(index)}
            >
              {row.id ? "Update" : "Save"}
            </Button>
            {row.id && (
              <Button
                colorScheme="red"
                size="xs" // Smaller button size
                onClick={() => handleDeleteCustomRow(index)}
              >
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
    </Box>
  );
}
