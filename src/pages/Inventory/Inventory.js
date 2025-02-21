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
  Center,
  Spinner,
  Stack,
  useBreakpointValue,
  Select,
} from "@chakra-ui/react";
import {
  EditIcon,
  CheckIcon,
  CloseIcon,
  AddIcon,
  DeleteIcon,
  CalendarIcon,
} from "@chakra-ui/icons";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Inventory = () => {
  const toast = useToast();
  const cancelRef = useRef();

  // ================= Bulk Add Section State =================
  // entryDate is used to select the date for the new inventory record.
  const [entryDate, setEntryDate] = useState(new Date());
  // Each new row now includes an "inventory_type" field ("entry" or "removal")
  const [inventoryRows, setInventoryRows] = useState([
    { article_name: "", total: "", inventory_type: "entry" },
  ]);
  const [loadingInput, setLoadingInput] = useState(false);

  // ================= Date‑Filtered View State =================
  const [viewDate, setViewDate] = useState(new Date());
  const [dateInventory, setDateInventory] = useState([]);
  const [loadingDate, setLoadingDate] = useState(true);

  // ================= All Inventory Summary State =================
  const [allInventory, setAllInventory] = useState([]);
  const [loadingAll, setLoadingAll] = useState(true);

  // ================ State for Editing Summary Group =================
  const [editingGroupKey, setEditingGroupKey] = useState(null); // article_name as key
  const [editingGroupValue, setEditingGroupValue] = useState("");

  // ================ Handlers for Bulk Input Section ================
  const handleAddInventoryRow = () => {
    setInventoryRows((prev) => [
      ...prev,
      { article_name: "", total: "", inventory_type: "entry" },
    ]);
  };

  const handleRemoveInventoryRow = (index) => {
    if (inventoryRows.length === 1) {
      toast({
        title: "Cannot remove",
        description: "At least one row is required",
        status: "warning",
      });
      return;
    }
    setInventoryRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (index, field, value) => {
    setInventoryRows((prev) => {
      const newRows = [...prev];
      newRows[index][field] = value;
      return newRows;
    });
  };

  const handleSaveInventory = async () => {
    // Filter out empty rows (article_name is required)
    const entries = inventoryRows.filter(
      (row) => row.article_name.trim() !== ""
    );
    if (entries.length === 0) {
      toast({
        title: "No Data",
        description: "Please fill in at least one row with an article name",
        status: "warning",
      });
      return;
    }
    setLoadingInput(true);
    try {
      // Send each entry individually (or adjust to your bulk endpoint)
      await Promise.all(
        entries.map((entry) =>
          fetch(`${API_URL}/inventory`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // Send the selected date (formatted as YYYY-MM-DD) and inventory_type
            body: JSON.stringify({
              ...entry,
              date: entryDate.toLocaleDateString("en-CA"),
            }),
          })
        )
      );
      toast({
        title: "Success",
        description: "Inventory entries added successfully",
        status: "success",
      });
      setInventoryRows([{ article_name: "", total: "", inventory_type: "entry" }]);
      fetchAllInventory();
      fetchDateInventory(viewDate);
    } catch (error) {
      console.error("Error adding inventory:", error);
      toast({
        title: "Error",
        description: "Failed to add inventory",
        status: "error",
      });
    } finally {
      setLoadingInput(false);
    }
  };

  // ================ Fetching Date‑Filtered Inventory =================
  const fetchDateInventory = async (date) => {
    setLoadingDate(true);
    const dateStr = date.toLocaleDateString("en-CA");
    try {
      const response = await fetch(
        `${API_URL}/inventory/date?date=${dateStr}`
      );
      if (!response.ok) throw new Error("Failed to fetch date inventory");
      const data = await response.json();
      setDateInventory(data);
    } catch (error) {
      console.error("Error fetching date inventory:", error);
      toast({
        title: "Error",
        description: "Failed to fetch inventory for the selected date",
        status: "error",
      });
    } finally {
      setLoadingDate(false);
    }
  };

  // ================ Fetching All Inventory =================
  const fetchAllInventory = async () => {
    setLoadingAll(true);
    try {
      const response = await fetch(`${API_URL}/inventory`);
      if (!response.ok) throw new Error("Failed to fetch all inventory");
      const data = await response.json();
      setAllInventory(data);
    } catch (error) {
      console.error("Error fetching all inventory:", error);
      toast({
        title: "Error",
        description: "Failed to fetch all inventory",
        status: "error",
      });
    } finally {
      setLoadingAll(false);
    }
  };

  // ================ Effects to Fetch Data =================
  useEffect(() => {
    fetchDateInventory(viewDate);
  }, [viewDate]);

  useEffect(() => {
    fetchAllInventory();
  }, []);

  // ================ Grouping Logic ================
  // Group date-filtered inventory by article name, date, and inventory_type
  const groupedDateInventory = useMemo(() => {
    const groups = {};
    dateInventory.forEach((row) => {
      // Convert created_at (or entry_date) to a date string (YYYY-MM-DD)
      const dateOnly = new Date(row.created_at).toLocaleDateString("en-CA");
      const key = `${row.article_name.trim()}_${dateOnly}_${row.inventory_type}`;
      if (!groups[key]) {
        groups[key] = {
          article_name: row.article_name,
          date: dateOnly,
          inventory_type: row.inventory_type,
          total: 0,
          entries: [],
        };
      }
      groups[key].total += Number(row.total) || 0;
      groups[key].entries.push(row);
    });
    return Object.values(groups);
  }, [dateInventory]);

  // Group all inventory by article name and compute net total (entries minus removals)
  const groupedAllInventory = useMemo(() => {
    const groups = {};
    allInventory.forEach((row) => {
      const key = row.article_name.trim();
      if (!groups[key]) {
        groups[key] = {
          article_name: row.article_name,
          netTotal: 0, // netTotal = sum(entry totals) - sum(removal totals)
          count: 0,
          entries: [],
        };
      }
      // Add total for entries; subtract for removals
      groups[key].netTotal += row.inventory_type === "entry"
        ? Number(row.total) || 0
        : - (Number(row.total) || 0);
      groups[key].count += 1;
      groups[key].entries.push(row);
    });
    return Object.values(groups);
  }, [allInventory]);

  // ================ Delete Group Functionality ================
  const handleDeleteGroup = async (group) => {
    try {
      await Promise.all(
        group.entries.map((row) =>
          fetch(`${API_URL}/inventory/${row.id}`, { method: "DELETE" })
        )
      );
      toast({
        title: "Deleted",
        description: "Group deleted successfully",
        status: "success",
      });
      fetchDateInventory(viewDate);
      fetchAllInventory();
    } catch (error) {
      console.error("Error deleting group:", error);
      toast({
        title: "Error",
        description: "Failed to delete group",
        status: "error",
      });
    }
  };

  // ================ Edit Group Functionality for Summary ================
  // In the summary, allow editing the net total value. Here we update the most recent record.
  const handleSaveGroupEdit = async (group) => {
    try {
      // Sort the group's entries by created_at descending to find the most recent record.
      const sortedEntries = group.entries.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      const latestRecord = sortedEntries[0];
      const response = await fetch(`${API_URL}/inventory/${latestRecord.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          article_name: latestRecord.article_name,
          // When editing a summary, we assume the update represents a correction for the record.
          // In a real scenario, you might update multiple records or use a dedicated field.
          total: editingGroupValue,
        }),
      });
      if (!response.ok) throw new Error("Failed to update inventory record");
      toast({
        title: "Success",
        description: "Inventory updated successfully",
        status: "success",
      });
      setEditingGroupKey(null);
      setEditingGroupValue("");
      fetchAllInventory();
      fetchDateInventory(viewDate);
    } catch (error) {
      console.error("Error updating group:", error);
      toast({
        title: "Error",
        description: "Failed to update inventory group",
        status: "error",
      });
    }
  };

  // ================ Responsive Layout ================
  const isMobile = useBreakpointValue({ base: true, md: false });

  // ================= Render Functions =================

  // Bulk Add Section
  const renderInputSection = () => {
    return (
      <Card mb={6} p={4} borderRadius="md" boxShadow="md" bg="white">
        <Heading size="md" mb={4}>
          Add Inventory Items
        </Heading>
        {/* Date Picker for selecting entry date */}
        <Flex align="center" mb={4}>
          <CalendarIcon boxSize={6} mr={2} />
          <DatePicker
            selected={entryDate}
            onChange={setEntryDate}
            dateFormat="dd/MM/yyyy"
            className="custom-datepicker"
          />
        </Flex>
        {inventoryRows.map((row, index) => (
          <Flex key={index} mb={2} align="center">
            <Input
              placeholder="Article Name"
              value={row.article_name}
              onChange={(e) =>
                handleInputChange(index, "article_name", e.target.value)
              }
              mr={2}
            />
            <Input
              placeholder="Total Quantity"
              type="number"
              value={row.total}
              onChange={(e) =>
                handleInputChange(index, "total", e.target.value)
              }
              mr={2}
            />
            <Select
              value={row.inventory_type}
              onChange={(e) =>
                handleInputChange(index, "inventory_type", e.target.value)
              }
              width="120px"
              mr={2}
            >
              <option value="entry">Entry</option>
              <option value="removal">Removal</option>
            </Select>
            <IconButton
              aria-label="Remove row"
              icon={<DeleteIcon />}
              size="sm"
              onClick={() => handleRemoveInventoryRow(index)}
            />
          </Flex>
        ))}
        <Button leftIcon={<AddIcon />} onClick={handleAddInventoryRow} mt={2}>
          Add Another Row
        </Button>
        <Button
          colorScheme="blue"
          onClick={handleSaveInventory}
          mt={4}
          isLoading={loadingInput}
        >
          Save Inventory
        </Button>
      </Card>
    );
  };

  // Date-Filtered View Section
  const renderDateViewSection = () => {
    return (
      <Card mb={6} p={4} borderRadius="md" boxShadow="md" bg="white">
        <CardHeader>
          <Heading size="md">Inventory Added on Selected Date</Heading>
        </CardHeader>
        <CardBody>
          <Flex align="center" mb={4}>
            <CalendarIcon boxSize={6} mr={2} />
            <DatePicker
              selected={viewDate}
              onChange={setViewDate}
              dateFormat="dd/MM/yyyy"
              className="custom-datepicker"
            />
          </Flex>
          {loadingDate ? (
            <Center>
              <Spinner size="xl" />
            </Center>
          ) : groupedDateInventory.length > 0 ? (
            <TableContainer>
              <Table variant="simple">
                <Thead bg="gray.200">
                  <Tr>
                    <Th>Date</Th>
                    <Th>Article Name</Th>
                    <Th>Type</Th>
                    <Th isNumeric>Total {`(${"Entry"}/{ "Removal" })`}</Th>
                    <Th>Action</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {groupedDateInventory.map((group, idx) => (
                    <Tr key={idx}>
                      <Td>{group.date}</Td>
                      <Td>{group.article_name}</Td>
                      <Td>{group.inventory_type}</Td>
                      <Td isNumeric>
                        {group.inventory_type === "removal"
                          ? `- ${group.total}`
                          : group.total}
                      </Td>
                      <Td>
                        <IconButton
                          aria-label="Delete group"
                          icon={<DeleteIcon />}
                          size="sm"
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
            <Text>No inventory added on this date.</Text>
          )}
        </CardBody>
      </Card>
    );
  };

  // All Inventory Summary Section (Editable)
  const renderAllInventorySection = () => {
    return (
      <Card p={4} borderRadius="md" boxShadow="md" bg="white">
        <CardHeader>
          <Heading size="md">All Inventory Summary</Heading>
        </CardHeader>
        <CardBody>
          {loadingAll ? (
            <Center>
              <Spinner size="xl" />
            </Center>
          ) : groupedAllInventory.length > 0 ? (
            <TableContainer>
              <Table variant="simple">
                <Thead bg="gray.200">
                  <Tr>
                    <Th>Article Name</Th>
                    <Th isNumeric>Net Quantity</Th>
                    <Th isNumeric>Entries Count</Th>
                    <Th>Action</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {groupedAllInventory.map((group, idx) => (
                    <Tr key={idx}>
                      <Td>{group.article_name}</Td>
                      <Td isNumeric>
                        {editingGroupKey === group.article_name ? (
                          <Input
                            value={editingGroupValue}
                            onChange={(e) =>
                              setEditingGroupValue(e.target.value)
                            }
                            size="sm"
                          />
                        ) : (
                          group.netTotal
                        )}
                      </Td>
                      <Td isNumeric>{group.count}</Td>
                      <Td>
                        {editingGroupKey === group.article_name ? (
                          <>
                            <IconButton
                              aria-label="Save"
                              icon={<CheckIcon />}
                              size="sm"
                              colorScheme="green"
                              onClick={() => handleSaveGroupEdit(group)}
                              mr={2}
                            />
                            <IconButton
                              aria-label="Cancel"
                              icon={<CloseIcon />}
                              size="sm"
                              onClick={() => {
                                setEditingGroupKey(null);
                                setEditingGroupValue("");
                              }}
                              mr={2}
                            />
                          </>
                        ) : (
                          <IconButton
                            aria-label="Edit group"
                            icon={<EditIcon />}
                            size="sm"
                            onClick={() => {
                              setEditingGroupKey(group.article_name);
                              setEditingGroupValue(group.netTotal);
                            }}
                            mr={2}
                          />
                        )}
                        <IconButton
                          aria-label="Delete group"
                          icon={<DeleteIcon />}
                          size="sm"
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
            <Text>No inventory data available.</Text>
          )}
        </CardBody>
      </Card>
    );
  };

  return (
    <Box p={isMobile ? 2 : 4} bg="gray.50" minH="100vh">
      <Heading mb={6} textAlign="center">
        Inventory Management
      </Heading>
      {renderInputSection()}
      {renderDateViewSection()}
      {renderAllInventorySection()}
    </Box>
  );
};

export default Inventory;
