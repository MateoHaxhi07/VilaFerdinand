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
  const [entryDate, setEntryDate] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date());
  const [itemSetsCount, setItemSetsCount] = useState(1);

  const [supplierRows, setSupplierRows] = useState([
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

  const [fetchedRows, setFetchedRows] = useState([]);

  /* --------------------------------
   * 1) ADD / REMOVE ROWS or COLUMNS
   -------------------------------- */
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

  /* --------------------------------
   * 2) HANDLE INPUT CHANGES
   -------------------------------- */
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

  /* --------------------------------
   * 3) SAVE => UPSERT
   -------------------------------- */
  const handleSave = async () => {
    const dateStr = entryDate.toISOString().split("T")[0];
    const finalEntries = [];

    supplierRows.forEach((row) => {
      const rowHasData =
        row.supplier.trim() ||
        row.totalAmount.trim() ||
        row.amountPaid.trim() ||
        row.items.some((it) => it.name.trim() || it.quantity.trim());
      if (!rowHasData) return;

      const mainEntry = {
        supplier: row.supplier.trim(),
        transactionType: row.transactionType,
        totalAmount: row.totalAmount.trim(),
        amountPaid: row.amountPaid.trim(),
        itemName: "",
        itemQuantity: "",
      };
      finalEntries.push(mainEntry);

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
        description: "No valid supplier rows to save",
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
        throw new Error("Failed to upsert supplier expenses");
      }
      toast({
        title: "Success",
        description: "Supplier expenses upserted",
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

      if (dateStr === viewDate.toISOString().split("T")[0]) {
        fetchExisting(viewDate);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
      });
    }
  };

  /* --------------------------------
   * 4) FETCH & DELETE
   -------------------------------- */
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

  // Helper to convert transaction_type
  const translateTransactionType = (type) => {
    return type === "purchase" ? "Blerje" : "Borxh Klienta";
  };

  /* --------------------------------
   * VIEW TABLE DISPLAY
   -------------------------------- */
  return (
    <Box p={4} bg="gray.50" minH="100vh">
      <Heading textAlign="center" mb={6}>
        Supplier Expenses (Updated View Table)
      </Heading>

      {/* ---- Input Table for Adding Rows ---- */}
      <Box mb={10} p={4} bg="white" borderRadius="md" boxShadow="md">
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
          <Button colorScheme="green" onClick={handleAddSupplierRow}>
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
                {[...Array(itemSetsCount)].map((_, i) => {
                  const colNum = String(i + 1).padStart(2, "0");
                  return (
                    <React.Fragment key={i}>
                      <Th>{`Item ${colNum}`}</Th>
                      <Th>{`Qty ${colNum}`}</Th>
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
                        handleRowChange(rowIndex, "supplier", e.target.value)
                      }
                    />
                  </Td>
                  <Td>
                    <Select
                      value={row.transactionType}
                      onChange={(e) =>
                        handleRowChange(
                          rowIndex,
                          "transactionType",
                          e.target.value
                        )
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
                  {[...Array(itemSetsCount)].map((_, itemIndex) => {
                    const colNum = String(itemIndex + 1).padStart(2, "0");
                    return (
                      <React.Fragment key={itemIndex}>
                        <Td>
                          <Input
                            placeholder={`Item ${colNum}`}
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
                            placeholder={`Qty ${colNum}`}
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

        <Flex mt={4} justify="center" gap={4}>
          <Button colorScheme="blue" onClick={handleSave}>
            Save Supplier Expenses
          </Button>
        </Flex>
      </Box>

      {/* ---- VIEW TABLE (With Translations) ---- */}
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
                  <Th>Items</Th>
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
