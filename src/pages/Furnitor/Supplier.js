import React, { useState, useEffect, useMemo, useRef } from "react";
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
  Flex,
  IconButton,
  useToast,
  Text,
  Card,
  CardHeader,
  CardBody,
  VStack,
  useBreakpointValue,
  Select,
} from "@chakra-ui/react";
import { DeleteIcon, AddIcon, CalendarIcon } from "@chakra-ui/icons";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const MAX_ITEM_SETS = 20;
const ROW_COLOR = "#e8f5e9";

export default function Supplier() {
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

  // Dates for entry and view
  const [entryDate, setEntryDate] = useState(new Date());
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
      items: Array.from({ length: MAX_ITEM_SETS }, () => ({
        name: "",
        quantity: "",
      })),
    },
  ]);

  // Fetched supplier records for the date-filtered view
  const [fetchedRows, setFetchedRows] = useState([]);

  // All historical supplier data (without date filter)
  const [historicalData, setHistoricalData] = useState([]);

  // Group data for the date-filtered view (group by supplier + transaction type + date)
  const groupedData = useMemo(() => {
    const groups = {};
    fetchedRows.forEach((row) => {
      const type = row.transaction_type || row.transactionType;
      const total = parseFloat(row.total_amount || row.totalAmount) || 0;
      const unpaid = parseFloat(row.amount_unpaid || row.amountUnpaid) || 0;
      const key = `${row.supplier.trim()}_${type}_${row.date}`;
      if (!groups[key]) {
        groups[key] = {
          supplier: row.supplier,
          transaction_type: type,
          date: row.date,
          total_amount: 0,
          amount_unpaid: 0,
          line_items: [],
          mainEntryId: null,
        };
      }
      if (!row.item_name || row.item_name.trim() === "") {
        groups[key].total_amount += total;
        groups[key].amount_unpaid += unpaid;
        if (!groups[key].mainEntryId) {
          groups[key].mainEntryId = row.id;
        }
      } else {
        groups[key].line_items.push({
          item_name: row.item_name,
          quantity: row.quantity,
        });
      }
    });
    Object.values(groups).forEach((group) => {
      group.amount_paid = (group.total_amount - group.amount_unpaid).toFixed(2);
    });
    return Object.values(groups);
  }, [fetchedRows]);

  // Group historical data by supplier and transaction type (ignoring date)
  const groupedHistoricalData = useMemo(() => {
    const groups = {};
    historicalData.forEach((row) => {
      const type = row.transaction_type || row.transactionType;
      const total = parseFloat(row.total_amount || row.totalAmount) || 0;
      const unpaid = parseFloat(row.amount_unpaid || row.amountUnpaid) || 0;
      // Group by supplier and transaction type only
      const key = `${row.supplier.trim()}_${type}`;
      if (!groups[key]) {
        groups[key] = {
          supplier: row.supplier,
          transaction_type: type,
          total_amount: 0,
          amount_unpaid: 0,
          line_items: [],
          mainEntryId: null,
          dates: new Set(),
        };
      }
      groups[key].total_amount += total;
      groups[key].amount_unpaid += unpaid;
      groups[key].dates.add(row.date);
      if (!row.item_name || row.item_name.trim() === "") {
        if (!groups[key].mainEntryId) {
          groups[key].mainEntryId = row.id;
        }
      } else {
        groups[key].line_items.push({
          item_name: row.item_name,
          quantity: row.quantity,
        });
      }
    });
    Object.values(groups).forEach((group) => {
      group.amount_paid = (group.total_amount - group.amount_unpaid).toFixed(2);
      group.dates = Array.from(group.dates).sort();
    });
    return Object.values(groups);
  }, [historicalData]);

  function translateTransactionType(type) {
    return type === "purchase" ? "Blerje" : "Borxh Klienta";
  }

  // Handlers for manual input
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

  // Save manual entries
  const handleSave = async () => {
    const dateStr = entryDate.toLocaleDateString("en-CA");
    const finalEntries = [];
    supplierRows.forEach((row) => {
      const rowHasData =
        row.supplier.trim() ||
        row.totalAmount.trim() ||
        row.amountPaid.trim() ||
        row.items.some((it) => it.name.trim() || it.quantity.trim());
      if (!rowHasData) return;
      const total = parseFloat(row.totalAmount) || 0;
      const paid = parseFloat(row.amountPaid) || 0;
      const unpaid = (total - paid).toFixed(2);
      const mainEntry = {
        supplier: row.supplier.trim(),
        transactionType: row.transactionType,
        totalAmount: row.totalAmount.trim(),
        amountUnpaid: unpaid,
        itemName: "",
        itemQuantity: "",
        date: dateStr,
      };
      finalEntries.push(mainEntry);
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
            date: dateStr,
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
    console.log("Final Entries:", finalEntries);
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
        description: "Supplier expenses saved successfully",
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
      fetchHistoricalData();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
      });
    }
  };

  // Fetch records for a specific date
  const fetchExisting = async (date) => {
    const dateStr = date.toLocaleDateString("en-CA");
    try {
      const resp = await fetch(`${API_URL}/suppliers/bulk?date=${dateStr}`);
      if (!resp.ok) {
        throw new Error("Failed to fetch supplier data");
      }
      const data = await resp.json();
      console.log("Fetched Rows:", data);
      setFetchedRows(data);
    } catch (error) {
      toast({
        title: "Error fetching suppliers",
        description: error.message,
        status: "error",
      });
    }
  };

  // Fetch all historical data (requires backend endpoint /suppliers/all)
  const fetchHistoricalData = async () => {
    try {
      const resp = await fetch(`${API_URL}/suppliers/all`);
      if (!resp.ok) {
        throw new Error("Failed to fetch historical data");
      }
      const data = await resp.json();
      console.log("Historical Data:", data);
      setHistoricalData(data);
    } catch (error) {
      toast({
        title: "Error fetching historical data",
        description: error.message,
        status: "error",
      });
    }
  };

  useEffect(() => {
    fetchExisting(viewDate);
  }, [viewDate]);

  useEffect(() => {
    fetchHistoricalData();
  }, []);

  const handleDeleteGroup = async (group) => {
    const rowsToDelete = fetchedRows.filter((row) => {
      const type = row.transaction_type || row.transactionType;
      return (
        row.supplier.trim() === group.supplier.trim() &&
        type === group.transaction_type &&
        row.date === group.date
      );
    });
    try {
      await Promise.all(
        rowsToDelete.map((row) =>
          fetch(`${API_URL}/suppliers/bulk/${row.id}`, { method: "DELETE" })
        )
      );
      toast({
        title: "Deleted",
        description: "Supplier expense group removed",
        status: "success",
      });
      fetchExisting(viewDate);
      fetchHistoricalData();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
      });
    }
  };

  // Determine if the device is mobile or desktop
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Render entry section (input form)
  const renderEntrySection = () => {
    return isMobile ? renderEntryMobile() : renderEntryDesktop();
  };

  const renderEntryMobile = () => {
    return (
      <VStack spacing={4} align="stretch">
        {supplierRows.map((row, rowIndex) => (
          <Box
            key={rowIndex}
            borderWidth="1px"
            borderRadius="md"
            p={4}
            bg="white"
            boxShadow="md"
          >
            <Text>
              <strong>Supplier:</strong>
              <Input
                placeholder="Supplier"
                value={row.supplier}
                onChange={(e) =>
                  handleRowChange(rowIndex, "supplier", e.target.value)
                }
                size="sm"
                mt={1}
              />
            </Text>
            <Text mt={2}>
              <strong>Lloji Borxhit:</strong>{" "}
              <Select
                value={row.transactionType}
                onChange={(e) =>
                  handleRowChange(rowIndex, "transactionType", e.target.value)
                }
                size="sm"
                mt={1}
              >
                <option value="purchase">
                  Blerje (Me borxh ose pa borxh)
                </option>
                <option value="service">
                  Borxh Klienta (Na kan borxh ose jo)
                </option>
              </Select>
            </Text>
            <Text mt={2}>
              <strong>Totali Fatures:</strong>{" "}
              <Input
                placeholder="Total Amount"
                value={row.totalAmount}
                onChange={(e) =>
                  handleRowChange(rowIndex, "totalAmount", e.target.value)
                }
                size="sm"
                mt={1}
              />
            </Text>
            <Text mt={2}>
              <strong>Paguar nga Fatura:</strong>{" "}
              <Input
                placeholder="Amount Paid"
                value={row.amountPaid}
                onChange={(e) =>
                  handleRowChange(rowIndex, "amountPaid", e.target.value)
                }
                size="sm"
                mt={1}
              />
            </Text>
            <Text mt={2}>
              <strong>Amount Left:</strong>{" "}
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
                size="sm"
                mt={1}
              />
            </Text>
            {Array.from({ length: itemSetsCount }).map((_, itemIndex) => (
              <Box key={itemIndex} mt={2} p={2} border="1px dashed gray">
                <Text>
                  <strong>
                    Item {String(itemIndex + 1).padStart(2, "0")}:
                  </strong>{" "}
                  <Input
                    placeholder={`Item ${String(itemIndex + 1).padStart(2, "0")}`}
                    value={row.items[itemIndex].name}
                    onChange={(e) =>
                      handleItemChange(rowIndex, itemIndex, "name", e.target.value)
                    }
                    size="sm"
                    mt={1}
                  />
                </Text>
                <Text mt={1}>
                  <strong>
                    Qty {String(itemIndex + 1).padStart(2, "0")}:
                  </strong>{" "}
                  <Input
                    placeholder={`Qty ${String(itemIndex + 1).padStart(2, "0")}`}
                    value={row.items[itemIndex].quantity}
                    onChange={(e) =>
                      handleItemChange(rowIndex, itemIndex, "quantity", e.target.value)
                    }
                    size="sm"
                    mt={1}
                  />
                </Text>
              </Box>
            ))}
          </Box>
        ))}
      </VStack>
    );
  };

  const renderEntryDesktop = () => {
    return (
      <TableContainer overflowX="auto" border="1px solid" borderColor="gray.200">
        <Table variant="simple">
          <Thead bg="gray.200">
            <Tr>
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
              <Tr key={rowIndex} bg={ROW_COLOR}>
                <Td>
                  <Input
                    placeholder="Supplier"
                    value={row.supplier}
                    onChange={(e) =>
                      handleRowChange(rowIndex, "supplier", e.target.value)
                    }
                    size="sm"
                  />
                </Td>
                <Td>
                  <Select
                    value={row.transactionType}
                    onChange={(e) =>
                      handleRowChange(rowIndex, "transactionType", e.target.value)
                    }
                    size="sm"
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
                    size="sm"
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Amount Paid"
                    value={row.amountPaid}
                    onChange={(e) =>
                      handleRowChange(rowIndex, "amountPaid", e.target.value)
                    }
                    size="sm"
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
                    size="sm"
                  />
                </Td>
                {[...Array(itemSetsCount)].map((_, itemIndex) => (
                  <React.Fragment key={itemIndex}>
                    <Td>
                      <Input
                        placeholder={`Item ${String(itemIndex + 1).padStart(2, "0")}`}
                        value={row.items[itemIndex].name}
                        onChange={(e) =>
                          handleItemChange(rowIndex, itemIndex, "name", e.target.value)
                        }
                        size="sm"
                      />
                    </Td>
                    <Td>
                      <Input
                        placeholder={`Qty ${String(itemIndex + 1).padStart(2, "0")}`}
                        value={row.items[itemIndex].quantity}
                        onChange={(e) =>
                          handleItemChange(rowIndex, itemIndex, "quantity", e.target.value)
                        }
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
  };

  // Render view section (date-filtered data)
  const renderViewSection = () => {
    return isMobile ? renderViewMobile() : renderViewDesktop();
  };

  const renderViewMobile = () => {
    return (
      <VStack spacing={4} align="stretch">
        <Heading fontSize="md" mb={3} textColor="black.100">
          ZGJIDH DATEN PER TE SHIKUAR HISTORIKUN
        </Heading>
        <Flex direction="column" gap={3} mb={4}>
          <Flex align="center" direction="row">
            <CalendarIcon boxSize={6} mr={2} />
            <DatePicker
              selected={viewDate}
              onChange={setViewDate}
              dateFormat="dd/MM/yyyy"
              className="custom-datepicker"
            />
          </Flex>
        </Flex>
        {groupedData.length > 0 ? (
          groupedData.map((group, idx) => (
            <Card key={idx} mt={4} p={3} bg="white" borderRadius="md" boxShadow="md">
              <CardHeader>
                <Heading size="sm" mb={2}>
                  {group.supplier} - {translateTransactionType(group.transaction_type)}
                </Heading>
              </CardHeader>
              <CardBody>
                <Text>
                  <strong>Date:</strong>{" "}
                  {new Date(group.date).toLocaleDateString("en-CA")}
                </Text>
                <Text>
                  <strong>Total Amount:</strong> {group.total_amount.toFixed(0)}
                </Text>
                <Text>
                  <strong>Amount Paid:</strong> {group.amount_paid}
                </Text>
                <Text>
                  <strong>Amount Unpaid:</strong>{" "}
                  {parseFloat(group.amount_unpaid).toFixed(0)}
                </Text>
                {group.line_items.map((item, ci) => (
                  <Box key={ci} borderWidth="1px" borderRadius="md" p={2} my={1}>
                    <Text>
                      <strong>Item:</strong> {item.item_name}
                    </Text>
                    <Text>
                      <strong>Qty:</strong> {item.quantity}
                    </Text>
                  </Box>
                ))}
              </CardBody>
              <Flex justify="center" p={2}>
                <IconButton
                  aria-label="Delete"
                  icon={<DeleteIcon />}
                  colorScheme="red"
                  onClick={() => handleDeleteGroup(group)}
                />
              </Flex>
            </Card>
          ))
        ) : (
          <Box>No supplier expenses found for this date.</Box>
        )}
      </VStack>
    );
  };

  // Desktop view for date-filtered data
  const renderViewDesktop = () => {
    return (
      <Box mt={8}>
        <Heading fontSize="md" mb={5} textColor="black.100">
          ZGJIDH DATEN PER TE SHIKUAR HISTORIKUN
        </Heading>
        <Flex align="center" gap={3} mb={4}>
          <CalendarIcon boxSize={6} />
          <DatePicker
            selected={viewDate}
            onChange={setViewDate}
            dateFormat="dd/MM/yyyy"
            className="custom-datepicker"
          />
        </Flex>
        {groupedData.length > 0 ? (
          <TableContainer>
            <Table variant="simple">
              <Thead bg="gray.200">
                <Tr>
                  <Th>Date</Th>
                  <Th>Supplier</Th>
                  <Th>Type</Th>
                  <Th isNumeric>Total Amount</Th>
                  <Th isNumeric>Amount Paid</Th>
                  <Th isNumeric>Amount Unpaid</Th>
                  <Th>Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {groupedData.map((group, idx) => (
                  <Tr key={idx} bg={ROW_COLOR}>
                    <Td>{new Date(group.date).toLocaleDateString("en-CA")}</Td>
                    <Td>{group.supplier}</Td>
                    <Td>{translateTransactionType(group.transaction_type)}</Td>
                    <Td isNumeric>{group.total_amount.toFixed(0)}</Td>
                    <Td isNumeric>{group.amount_paid}</Td>
                    <Td isNumeric>{parseFloat(group.amount_unpaid).toFixed(0)}</Td>
                    <Td>
                      <IconButton
                        aria-label="Delete"
                        icon={<DeleteIcon />}
                        colorScheme="red"
                        onClick={() => handleDeleteGroup(group)}
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
    );
  };

  // Render historical data (grouped by supplier and transaction type across all dates)
  const renderHistoricalDataDesktop = () => {
    return (
      <Box mt={8}>
        <Heading fontSize="md" mb={5} textColor="black.100">
         PERMBLEDHESE HISTORIKE
        </Heading>
        <TableContainer>
          <Table variant="simple">
            <Thead bg="gray.200">
              <Tr>
                <Th>Supplier</Th>
                <Th>Type</Th>
                <Th isNumeric>Total Amount</Th>
                <Th isNumeric>Amount Paid</Th>
                <Th isNumeric>Amount Unpaid</Th>
              </Tr>
            </Thead>
            <Tbody>
              {groupedHistoricalData.map((group, idx) => (
                <Tr key={idx} bg={ROW_COLOR}>
                  <Td>{group.supplier}</Td>
                  <Td>{translateTransactionType(group.transaction_type)}</Td>
                  <Td isNumeric>{group.total_amount.toFixed(0)}</Td>
                  <Td isNumeric>{group.amount_paid}</Td>
                  <Td isNumeric>{parseFloat(group.amount_unpaid).toFixed(0)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const renderHistoricalDataMobile = () => {
    return (
      <VStack spacing={4} align="stretch" mt={8}>
        <Heading fontSize="md" mb={3} textColor="black.100">
          PERMBLEDHESE HISTORIKE
        </Heading>
        {groupedHistoricalData.length > 0 ? (
          groupedHistoricalData.map((group, idx) => (
            <Card key={idx} mt={4} p={3} bg="white" borderRadius="md" boxShadow="md">
              <CardHeader>
                <Heading size="sm" mb={2}>
                  {group.supplier} - {translateTransactionType(group.transaction_type)}
                </Heading>
              </CardHeader>
              <CardBody>
                <Text>
                  <strong>Dates:</strong> {group.dates.join(", ")}
                </Text>
                <Text>
                  <strong>Total Amount:</strong> {group.total_amount.toFixed(0)}
                </Text>
                <Text>
                  <strong>Amount Paid:</strong> {group.amount_paid}
                </Text>
                <Text>
                  <strong>Amount Unpaid:</strong>{" "}
                  {parseFloat(group.amount_unpaid).toFixed(0)}
                </Text>
              </CardBody>
            </Card>
          ))
        ) : (
          <Box>No historical data found.</Box>
        )}
      </VStack>
    );
  };

  const renderHistoricalData = () => {
    return isMobile
      ? renderHistoricalDataMobile()
      : renderHistoricalDataDesktop();
  };

  return (
    <Box p={isMobile ? 2 : 4} bg="gray.50" minH="100vh">
      {/* Input Section */}
      <Card mb={10} borderRadius="md" boxShadow="md">
        <CardHeader bg="teal.500" color="white">
          <Heading size="md">SHTO BLERJE & BORXHE</Heading>
        </CardHeader>
        <CardBody>
          <FormLabel fontWeight="bold">ZGJIDH DATEN</FormLabel>
          <Flex align="center" mb={4}>
            <CalendarIcon boxSize={6} mr={2} />
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
            <Button leftIcon={<AddIcon />} onClick={handleAddItemSet} colorScheme="gray">
              Add Item Columns
            </Button>
            <Button onClick={handleRemoveItemSet} isDisabled={itemSetsCount <= 1} colorScheme="gray">
              Remove Item Columns
            </Button>
            <Button colorScheme="green" onClick={handleAddSupplierRow}>
              Add Supplier Row
            </Button>
            <Button colorScheme="blue" onClick={handleSave}>
              Save Expenses
            </Button>
          </Flex>
        </CardBody>
      </Card>

      {/* Date-Filtered View Section */}
      <Card mb={10} borderRadius="md" boxShadow="md">
        <CardHeader bg="teal.500" color="white">
          <Heading size="md">SHIKO HISTORIKUN BLERJEVE & BORXHEVE</Heading>
        </CardHeader>
        <CardBody>{renderViewSection()}</CardBody>
      </Card>

      {/* All Historical Data Section */}
      <Card borderRadius="md" boxShadow="md">
        <CardHeader bg="teal.500" color="white">
          <Heading size="md">PERMBLEDHJE GJITHE DATAT</Heading>
        </CardHeader>
        <CardBody>{renderHistoricalData()}</CardBody>
      </Card>
    </Box>
  );
}
