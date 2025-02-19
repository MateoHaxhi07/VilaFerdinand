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

  // Use local dates for both entry and view (formatted as YYYY-MM-DD via en-CA)
  const [entryDate, setEntryDate] = useState(new Date());
  // View date for existing daily expenses
  const [viewDate, setViewDate] = useState(new Date());

  // Number of dynamic item columns
  const [itemSetsCount, setItemSetsCount] = useState(1);

  // Supplier rows for manual input
  const [supplierRows, setSupplierRows] = useState([
    {
      supplier: "",
      transactionType: "purchase", // "purchase" = Blerje, "service" = Borxh Klienta
      totalAmount: "",
      amountPaid: "",
      // Extra items (if any)
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
    // Format the date as YYYY-MM-DD (local)
    const dateStr = entryDate.toLocaleDateString("en-CA");
    const finalEntries = [];

    supplierRows.forEach((row) => {
      // Process row only if at least one field has data
      const rowHasData =
        row.supplier.trim() ||
        row.totalAmount.trim() ||
        row.amountPaid.trim() ||
        row.items.some((it) => it.name.trim() || it.quantity.trim());
      if (!rowHasData) return;

      // Compute the unpaid amount
      const total = parseFloat(row.totalAmount) || 0;
      const paid = parseFloat(row.amountPaid) || 0;
      const unpaid = (total - paid).toFixed(2);

      // Main entry – include transaction type here
      const mainEntry = {
        supplier: row.supplier.trim(),
        transactionType: row.transactionType, // sent to backend as transaction_type
        totalAmount: row.totalAmount.trim(),
        amountUnpaid: unpaid,
        itemName: "",
        itemQuantity: "",
      };
      finalEntries.push(mainEntry);

      // Additional entries for extra items (if any)
      for (let i = 0; i < itemSetsCount; i++) {
        const { name, quantity } = row.items[i];
        if (name.trim() || quantity.trim()) {
          finalEntries.push({
            supplier: row.supplier.trim(),
            transactionType: row.transactionType,
            totalAmount: "0",
            amountUnpaid: "0",
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
      // Reset to one empty supplier row
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
      // Refresh the view table for the current view date
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
  // When fetching, we use the viewDate converted to YYYY-MM-DD.
  const fetchExisting = async (date) => {
    const dateStr = date.toLocaleDateString("en-CA");
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

  // Trigger fetching whenever the view date changes
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

  // Helper to translate transaction type for display
  function translateTransactionType(type) {
    return type === "purchase" ? "Blerje" : "Borxh Klienta";
  }





  const groupedData = useMemo(() => {
    // Group by supplier and transaction type so that multiple entries for the same supplier on one day are aggregated.
    const groups = {};
    fetchedRows.forEach((row) => {
      // Use transaction_type if provided; otherwise, fall back to transactionType.
      const type = row.transaction_type || row.transactionType;
      const key = `${row.supplier.trim()}_${type}`;
      if (!groups[key]) {
        groups[key] = {
          supplier: row.supplier,
          transaction_type: type,
          date: row.date,
          total_amount: 0,
          amount_unpaid: 0,
          line_items: [],
          mainEntryId: null, // store the id of the main entry
        };
      }
      // If this is a main entry (with no extra item details), add to totals.
      if (!row.item_name || row.item_name.trim() === "") {
        groups[key].total_amount += parseFloat(row.total_amount) || 0;
        groups[key].amount_unpaid += parseFloat(row.amount_unpaid) || 0;
        if (!groups[key].mainEntryId) {
          groups[key].mainEntryId = row.id; // store the first main entry id
        }
      } else {
        groups[key].line_items.push({
          item_name: row.item_name,
          quantity: row.quantity,
        });
      }
    });
    // Calculate amount paid for each group
    Object.values(groups).forEach((group) => {
      group.amount_paid = (group.total_amount - group.amount_unpaid).toFixed(2);
    });
    return Object.values(groups);
  }, [fetchedRows]);








  
  /* ----------------- VIEW TABLE DISPLAY ----------------- */
  return (
    <Box p={4} bg="white.200" minH="100vh">
      <Heading textAlign="center" mb={6}>
        Furnitor & Borxhe
      </Heading>

      {/* ---- Input Table for Adding Rows ---- */}
      <Box
        mb={10}
        p={4}
        bg="white"
        borderRadius="md"
        boxShadow="md"
        overflowX="auto"
      >
        <Heading size="md" mb={4}>
          Add Supplier Expenses
        </Heading>
        <FormLabel fontWeight="bold">Date (Entry)</FormLabel>
        <CalendarIcon boxSize={5} mr={2} />
        <DatePicker
          selected={entryDate}
          onChange={setEntryDate}
          dateFormat="dd/MM/yyyy"
          className="custom-datepicker"
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
                        handleRowChange(rowIndex, "supplier", e.target.value)
                      }
                    />
                  </Td>
                  <Td>
                    <Select
                      value={row.transactionType}
                      onChange={(e) =>
                        handleRowChange(rowIndex, "transactionType", e.target.value)
                      }
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
                      onChange={(e) =>
                        handleRowChange(rowIndex, "totalAmount", e.target.value)
                      }
                    />
                  </Td>
                  <Td>
                    <Input
                      placeholder="Amount Paid"
                      value={row.amountPaid}
                      onChange={(e) =>
                        handleRowChange(rowIndex, "amountPaid", e.target.value)
                      }
                    />
                  </Td>
                  <Td>
                    <Input
                      value={
                        isNaN(parseFloat(row.totalAmount)) ||
                        isNaN(parseFloat(row.amountPaid))
                          ? ""
                          : (
                              parseFloat(row.totalAmount) -
                              parseFloat(row.amountPaid)
                            ).toFixed(2)
                      }
                      isReadOnly
                    />
                  </Td>
                  {[...Array(itemSetsCount)].map((_, itemIndex) => (
                    <React.Fragment key={itemIndex}>
                      <Td>
                        <Input
                          placeholder={`Item ${String(
                            itemIndex + 1
                          ).padStart(2, "0")}`}
                          value={row.items[itemIndex].name}
                          onChange={(e) =>
                            handleItemChange(
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
                          placeholder={`Qty ${String(
                            itemIndex + 1
                          ).padStart(2, "0")}`}
                          value={row.items[itemIndex].quantity}
                          onChange={(e) =>
                            handleItemChange(
                              rowIndex,
                              itemIndex,
                              "quantity",
                              e.target.value
                            )
                          }
                        />
                      </Td>
                    </React.Fragment>
                  ))}
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

      {/* ---- VIEW TABLE (Grouped) ---- */}
      <Heading size="md" mb={4}>
        View Existing Supplier Records
      </Heading>
      <FormLabel fontWeight="bold">Date (View)</FormLabel>
      <CalendarIcon boxSize={5} mr={2} />
      <DatePicker
        selected={viewDate}
        onChange={setViewDate}
        dateFormat="dd/MM/yyyy"
        className="custom-datepicker"
      />

<Box mt={4} p={4} bg="white" borderRadius="md" boxShadow="md">
  {groupedData.length > 0 ? (
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
            <Th>Action</Th> {/* New column for delete button */}
          </Tr>
        </Thead>
        <Tbody>
          {groupedData.map((group, idx) => (
            <Tr key={idx} bg={ROW_COLOR}>
              <Td>
                {new Date(group.date).toLocaleDateString("en-CA")}
              </Td>
              <Td>{group.supplier}</Td>
              <Td>{translateTransactionType(group.transaction_type)}</Td>
              <Td isNumeric>{group.total_amount.toFixed(2)}</Td>
              <Td isNumeric>{group.amount_paid}</Td>
              <Td isNumeric>
                {parseFloat(group.amount_unpaid).toFixed(2)}
              </Td>
              <Td>
                <Box whiteSpace="pre-wrap" fontSize="xs">
                  {JSON.stringify(group.line_items, null, 2)}
                </Box>
              </Td>
              <Td>
                {group.mainEntryId && (
                  <IconButton
                    aria-label="Delete"
                    icon={<DeleteIcon />}
                    colorScheme="red"
                    onClick={() => handleDeleteRow(group.mainEntryId)}
                  />
                )}
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
