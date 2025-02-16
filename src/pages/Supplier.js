import React, { useState, useEffect } from "react";
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
  Select,
  Button,
  Flex,
  IconButton,
  useToast,
} from "@chakra-ui/react";
import {
  DeleteIcon,
  AddIcon,
  CalendarIcon,
  RepeatIcon,
} from "@chakra-ui/icons";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const MAX_ITEM_SETS = 20;
const ROW_COLOR = "#e8f5e9";

export default function Supplier() {
  const toast = useToast();

  // Date pickers for entry and view
  const [entryDate, setEntryDate] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date());

  // Number of dynamic item columns (for ingredients, etc.)
  const [itemSetsCount, setItemSetsCount] = useState(1);

  // Supplier rows for manual input
  const [supplierRows, setSupplierRows] = useState([
    {
      supplier: "",
      transactionType: "purchase", // "purchase" = Blerje, "service" = Borxh Klienta
      totalAmount: "",
      amountPaid: "",
      // We'll let the server calculate amount left but here we show a preview
      items: Array.from({ length: MAX_ITEM_SETS }, () => ({
        name: "",
        quantity: "",
      })),
    },
  ]);

  // Fetched supplier records for viewing
  const [fetchedRows, setFetchedRows] = useState([]);

  /* ----------------- HANDLERS FOR MANUAL INPUT ----------------- */
  const handleAddSupplierRow = () => {
    setSupplierRows((prev) => [
      ...prev,
      {
        supplier: "",
        transactionType: "purchase",
        totalAmount: "",
        amountPaid: "",
        items: Array.from({ length: MAX_ITEM_SETS }, () => ({
          name: "",
          quantity: "",
        })),
      },
    ]);
  };

  const handleRemoveSupplierRow = (rowIndex) => {
    if (supplierRows.length === 1) {
      toast({
        title: "Cannot remove",
        description: "Must have at least one supplier row",
        status: "warning",
      });
      return;
    }
    setSupplierRows((prev) => prev.filter((_, i) => i !== rowIndex));
  };

  const handleAddItemSet = () => {
    if (itemSetsCount < MAX_ITEM_SETS) {
      setItemSetsCount(itemSetsCount + 1);
    } else {
      toast({
        title: "Limit Reached",
        description: `Max = ${MAX_ITEM_SETS} item columns.`,
        status: "warning",
      });
    }
  };

  const handleRemoveItemSet = () => {
    if (itemSetsCount > 1) setItemSetsCount(itemSetsCount - 1);
  };

  const handleRowChange = (rowIndex, field, value) => {
    setSupplierRows((prev) => {
      const updated = [...prev];
      updated[rowIndex][field] = value;
      return updated;
    });
  };

  const handleItemChange = (rowIndex, itemIndex, field, value) => {
    setSupplierRows((prev) => {
      const updated = [...prev];
      updated[rowIndex].items[itemIndex][field] = value;
      return updated;
    });
  };

  /* ----------------- SAVE MANUAL ENTRIES ----------------- */
  const handleSave = async () => {
    const dateStr = entryDate.toISOString().split("T")[0];
    const finalEntries = [];
    supplierRows.forEach((row) => {
      // Only process if at least one field has data
      const rowHasData =
        row.supplier.trim() ||
        row.totalAmount.trim() ||
        row.amountPaid.trim() ||
        row.items.some(
          (it) => it.name.trim() || it.quantity.trim()
        );
      if (!rowHasData) return;

      // Main entry with total and paid amounts
      const mainEntry = {
        supplier: row.supplier.trim(),
        transactionType: row.transactionType,
        totalAmount: row.totalAmount.trim(),
        amountPaid: row.amountPaid.trim(),
        // These fields are for ingredients; leave blank in main entry
        itemName: "",
        itemQuantity: "",
      };
      finalEntries.push(mainEntry);

      // Additional entries for each item column (if filled)
      for (let i = 0; i < itemSetsCount; i++) {
        const { name, quantity } = row.items[i];
        if (name.trim() || quantity.trim()) {
          finalEntries.push({
            supplier: row.supplier.trim(),
            transactionType: row.transactionType,
            totalAmount: "0",
            amountPaid: "0",
            itemName: name.trim(),
            itemQuantity: quantity.trim(),
          });
        }
      }
    });

    if (finalEntries.length === 0) {
      toast({
        title: "No Data",
        description: "No valid entries to save",
        status: "warning",
      });
      return;
    }

    try {
      const resp = await fetch(`${API_URL}/suppliers/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedDate: dateStr, entries: finalEntries }),
      });
      if (!resp.ok) {
        throw new Error("Failed to save supplier expenses");
      }
      toast({
        title: "Success",
        description: "Supplier expenses upserted successfully",
        status: "success",
      });
      setSupplierRows([
        {
          supplier: "",
          transactionType: "purchase",
          totalAmount: "",
          amountPaid: "",
          items: Array.from({ length: MAX_ITEM_SETS }, () => ({
            name: "",
            quantity: "",
          })),
        },
      ]);
      fetchExisting(viewDate);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
      });
    }
  };

  /* ----------------- FETCH & DELETE ----------------- */
  const fetchExisting = async (date) => {
    const dateStr = date.toISOString().split("T")[0];
    try {
      const resp = await fetch(`${API_URL}/suppliers/bulk?date=${dateStr}`);
      if (!resp.ok) {
        throw new Error("Failed to fetch supplier data");
      }
      const data = await resp.json();
      setFetchedRows(data);
    } catch (error) {
      toast({
        title: "Error fetching suppliers",
        description: error.message,
        status: "error",
      });
    }
  };

  useEffect(() => {
    fetchExisting(viewDate);
  }, [viewDate]);

  const handleDeleteRow = async (id) => {
    try {
      const resp = await fetch(`${API_URL}/suppliers/bulk/${id}`, {
        method: "DELETE",
      });
      if (!resp.ok) {
        throw new Error("Failed to delete supplier expense row");
      }
      toast({
        title: "Deleted",
        description: "Supplier expense row removed",
        status: "success",
      });
      fetchExisting(viewDate);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
      });
    }
  };

  // Helper: translate transaction type to display names
  const translateTransactionType = (type) => {
    return type === "purchase" ? "Blerje" : "Borxh Klienta";
  };

  /* ----------------- VIEW TABLE DISPLAY ----------------- */
  return (
    <Box p={4} bg="gray.50" minH="100vh">
      <Heading textAlign="center" mb={6}>
        Supplier Expenses (Table-Based)
      </Heading>

      {/* ---- Input Table for Adding Rows ---- */}
      <Box mb={10} p={4} bg="white" borderRadius="md" boxShadow="md" overflowX="auto">
        <Heading size="md" mb={4}>
          Add Supplier Expenses
        </Heading>
        <FormLabel fontWeight="bold">Date (Entry)</FormLabel>
        <CalendarIcon boxSize={5} mr={2} />
        <DatePicker
          selected={entryDate}
          onChange={setEntryDate}
          dateFormat="yyyy-MM-dd"
        />

        <Flex mt={4} gap={4}>
          <Button leftIcon={<AddIcon />} onClick={handleAddItemSet}>
            Add Item Columns
          </Button>
          <Button onClick={handleRemoveItemSet} disabled={itemSetsCount <= 1}>
            Remove Item Columns
          </Button>
          <Button onClick={handleAddSupplierRow} colorScheme="green">
            Add Supplier Row
          </Button>
        </Flex>

        <TableContainer mt={4}>
          <Table variant="simple" border="1px solid black">
            <Thead>
              <Tr style={{ backgroundColor: "#ccc" }}>
                <Th>Furnizuesi</Th>
                <Th>Lloji Borxhit</Th>
                <Th>Totali Fatures</Th>
                <Th>Paguar nga Fatura</Th>
                <Th>Amount Left</Th>
                {[...Array(itemSetsCount)].map((_, i) => (
                  <React.Fragment key={i}>
                    <Th>{`Item ${String(i + 1).padStart(2, "0")}`}</Th>
                    <Th>{`Qty ${String(i + 1).padStart(2, "0")}`}</Th>
                  </React.Fragment>
                ))}
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
                      onChange={(e) => handleRowChange(rowIndex, "supplier", e.target.value)}
                    />
                  </Td>
                  <Td>
                    <Select
                      value={row.transactionType}
                      onChange={(e) => handleRowChange(rowIndex, "transactionType", e.target.value)}
                    >
                      <option value="purchase">
                        Blerje (Me borxh ose pa borxh)
                      </option>
                      <option value="service">
                        Borxh Klienta (Na kan borxh ose jo)
                      </option>
                    </Select>
                  </Td>
                  <Td>
                    <Input
                      placeholder="Total Amount"
                      value={row.totalAmount}
                      onChange={(e) => handleRowChange(rowIndex, "totalAmount", e.target.value)}
                    />
                  </Td>
                  <Td>
                    <Input
                      placeholder="Amount Paid"
                      value={row.amountPaid}
                      onChange={(e) => handleRowChange(rowIndex, "amountPaid", e.target.value)}
                    />
                  </Td>
                  <Td>
                    <Input
                      value={
                        isNaN(parseFloat(row.totalAmount)) || isNaN(parseFloat(row.amountPaid))
                          ? ""
                          : (parseFloat(row.totalAmount) - parseFloat(row.amountPaid)).toFixed(2)
                      }
                      isReadOnly
                    />
                  </Td>
                  {[...Array(itemSetsCount)].map((_, itemIndex) => (
                    <React.Fragment key={itemIndex}>
                      <Td>
                        <Input
                          placeholder={`Item ${String(itemIndex + 1).padStart(2, "0")}`}
                          value={row.items[itemIndex].name}
                          onChange={(e) => handleItemChange(rowIndex, itemIndex, "name", e.target.value)}
                        />
                      </Td>
                      <Td>
                        <Input
                          placeholder={`Qty ${String(itemIndex + 1).padStart(2, "0")}`}
                          value={row.items[itemIndex].quantity}
                          onChange={(e) => handleItemChange(rowIndex, itemIndex, "quantity", e.target.value)}
                        />
                      </Td>
                    </React.Fragment>
                  ))}
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

        <Flex mt={4} justify="center" gap={4}>
          <Button colorScheme="blue" onClick={handleSave}>
            Save Expenses
          </Button>
        </Flex>
      </Box>

      {/* ---- VIEW TABLE (With Translations and Date) ---- */}
      <Heading size="md" mb={4}>
        View Existing Supplier Records
      </Heading>
      <FormLabel fontWeight="bold">Date (View)</FormLabel>
      <CalendarIcon boxSize={5} mr={2} />
      <DatePicker
        selected={viewDate}
        onChange={setViewDate}
        dateFormat="yyyy-MM-dd"
      />

      <Box mt={4} p={4} bg="white" borderRadius="md" boxShadow="md">
        {fetchedRows.length > 0 ? (
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr bg="gray.200">
                  <Th>Date</Th>
                  <Th>Supplier</Th>
                  <Th>Type (Lloji Borxhit)</Th>
                  <Th isNumeric>Total Amount</Th>
                  <Th isNumeric>Amount Paid</Th>
                  <Th isNumeric>Amount Unpaid</Th>
                  <Th>Items (JSON)</Th>
                  <Th>Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {fetchedRows.map((row) => (
                  <Tr key={row.id} bg={ROW_COLOR}>
                    <Td>{new Date(row.date).toISOString().split("T")[0]}</Td>
                    <Td>{row.supplier}</Td>
                    <Td>{translateTransactionType(row.transaction_type)}</Td>
                    <Td isNumeric>{row.total_amount}</Td>
                    <Td isNumeric>{row.amount_paid}</Td>
                    <Td isNumeric>{row.amount_unpaid}</Td>
                    <Td>
                      <Box whiteSpace="pre-wrap" fontSize="xs">
                        {JSON.stringify(row.line_items, null, 2)}
                      </Box>
                    </Td>
                    <Td>
                      <IconButton
                        aria-label="Delete row"
                        icon={<DeleteIcon />}
                        colorScheme="red"
                        onClick={() => handleDeleteRow(row.id)}
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        ) : (
          <Box>No supplier expenses found for this date.</Box>
        )}
      </Box>
    </Box>
  );
}

// Helper to translate transaction type
function translateTransactionType(type) {
  return type === "purchase" ? "Blerje" : "Borxh Klienta";
}
