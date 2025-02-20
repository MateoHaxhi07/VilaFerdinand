import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Tfoot,
  Td,
  TableContainer,
  Heading,
  Button,
  Input,
  IconButton,
  VStack,
  Flex,
  Center,
  Spinner,
  useToast,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Stack,
  useBreakpointValue,
} from "@chakra-ui/react";
import { EditIcon, CheckIcon, CloseIcon, AddIcon, DeleteIcon } from "@chakra-ui/icons";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [newInventory, setNewInventory] = useState({ article_name: "", total: "" });
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const toast = useToast();
  const cancelRef = useRef();

  // Fetch inventory data from the server
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/inventory`);
      if (!response.ok) throw new Error("Failed to fetch inventory");
      const data = await response.json();
      setInventory(data);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      toast({
        title: "Error",
        description: "Failed to fetch inventory",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Inline edit handlers
  const handleEdit = (row) => {
    setEditingId(row.id);
    setEditValues({ article_name: row.article_name, total: row.total });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  const handleChange = (field, value) => {
    setEditValues((prev) => ({ ...prev, [field]: value }));
  };

  // Update inventory item via PUT
  const handleSave = async () => {
    try {
      const response = await fetch(`${API_URL}/inventory/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editValues),
      });
      if (!response.ok) throw new Error("Failed to update inventory");
      toast({
        title: "Success",
        description: "Inventory updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setEditingId(null);
      setEditValues({});
      fetchInventory();
    } catch (error) {
      console.error("Error updating inventory:", error);
      toast({
        title: "Error",
        description: "Failed to update inventory",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // New inventory handlers
  const handleNewInventoryChange = (field, value) => {
    setNewInventory((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddInventory = async () => {
    if (!newInventory.article_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Article Name is required",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setAdding(true);
    try {
      const response = await fetch(`${API_URL}/inventory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newInventory),
      });
      if (!response.ok) throw new Error("Failed to add inventory");
      toast({
        title: "Success",
        description: "New inventory item added successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setNewInventory({ article_name: "", total: "" });
      fetchInventory();
    } catch (error) {
      console.error("Error adding inventory:", error);
      toast({
        title: "Error",
        description: "Failed to add inventory",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setAdding(false);
    }
  };

  // Delete inventory item
  const handleDeleteInventory = async () => {
    try {
      const response = await fetch(`${API_URL}/inventory/${deletingId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete inventory");
      toast({
        title: "Success",
        description: "Inventory item deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setDeletingId(null);
      fetchInventory();
    } catch (error) {
      console.error("Error deleting inventory:", error);
      toast({
        title: "Error",
        description: "Failed to delete inventory",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Responsive layout determination
  const isMobile = useBreakpointValue({ base: true, md: false });

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  // Mobile view: Render inventory items as vertical cards
  const renderMobile = () => {
    return (
      <VStack spacing={4} align="stretch">
        {inventory.length > 0 ? (
          inventory.map((row) => (
            <Box key={row.id} borderWidth="1px" borderRadius="md" p={4} bg="white" boxShadow="sm">
              <Text>
                <strong>ID:</strong> {row.id}
              </Text>
              <Text>
                <strong>Article Name:</strong>{" "}
                {editingId === row.id ? (
                  <Input
                    value={editValues.article_name || ""}
                    onChange={(e) => handleChange("article_name", e.target.value)}
                  />
                ) : (
                  row.article_name
                )}
              </Text>
              <Text>
                <strong>Total:</strong>{" "}
                {editingId === row.id ? (
                  <Input
                    value={editValues.total || ""}
                    type="number"
                    onChange={(e) => handleChange("total", e.target.value)}
                  />
                ) : (
                  row.total
                )}
              </Text>
              <Flex mt={2}>
                {editingId === row.id ? (
                  <>
                    <IconButton
                      aria-label="Save"
                      icon={<CheckIcon />}
                      size="sm"
                      onClick={handleSave}
                      mr={2}
                    />
                    <IconButton
                      aria-label="Cancel"
                      icon={<CloseIcon />}
                      size="sm"
                      onClick={handleCancelEdit}
                    />
                  </>
                ) : (
                  <>
                    <IconButton
                      aria-label="Edit"
                      icon={<EditIcon />}
                      size="sm"
                      onClick={() => handleEdit(row)}
                      mr={2}
                    />
                    <IconButton
                      aria-label="Delete"
                      icon={<DeleteIcon />}
                      colorScheme="red"
                      size="sm"
                      onClick={() => setDeletingId(row.id)}
                    />
                  </>
                )}
              </Flex>
            </Box>
          ))
        ) : (
          <Text textAlign="center">No inventory available</Text>
        )}
        <Box borderTop="1px solid #ccc" pt={2} mt={4}>
          <Flex justifyContent="space-between">
            <Text fontWeight="bold">Total Quantity:</Text>
            <Text fontWeight="bold">
              {inventory.reduce((sum, row) => sum + Number(row.total || 0), 0)}
            </Text>
          </Flex>
        </Box>
      </VStack>
    );
  };

  // Desktop view: Render inventory in a table
  const renderDesktop = () => {
    return (
      <TableContainer bg="white" p={4} borderRadius="md" boxShadow="md">
        <Table variant="striped" size="sm">
          <Thead bg="gray.200">
            <Tr>
              <Th>ID</Th>
              <Th>Article Name</Th>
              <Th>Total</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {inventory.length > 0 ? (
              inventory.map((row) => (
                <Tr key={row.id}>
                  <Td>{row.id}</Td>
                  <Td>
                    {editingId === row.id ? (
                      <Input
                        value={editValues.article_name || ""}
                        onChange={(e) => handleChange("article_name", e.target.value)}
                      />
                    ) : (
                      row.article_name
                    )}
                  </Td>
                  <Td>
                    {editingId === row.id ? (
                      <Input
                        value={editValues.total || ""}
                        type="number"
                        onChange={(e) => handleChange("total", e.target.value)}
                      />
                    ) : (
                      row.total
                    )}
                  </Td>
                  <Td>
                    {editingId === row.id ? (
                      <>
                        <IconButton
                          aria-label="Save"
                          icon={<CheckIcon />}
                          size="sm"
                          onClick={handleSave}
                          mr={2}
                        />
                        <IconButton
                          aria-label="Cancel"
                          icon={<CloseIcon />}
                          size="sm"
                          onClick={handleCancelEdit}
                        />
                      </>
                    ) : (
                      <>
                        <IconButton
                          aria-label="Edit"
                          icon={<EditIcon />}
                          size="sm"
                          onClick={() => handleEdit(row)}
                          mr={2}
                        />
                        <IconButton
                          aria-label="Delete"
                          icon={<DeleteIcon />}
                          colorScheme="red"
                          size="sm"
                          onClick={() => setDeletingId(row.id)}
                        />
                      </>
                    )}
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={4} textAlign="center">
                  No inventory available
                </Td>
              </Tr>
            )}
          </Tbody>
          <Tfoot>
            <Tr>
              <Th colSpan={2}>Totals</Th>
              <Th>
                {inventory.reduce((sum, row) => sum + Number(row.total || 0), 0)}
              </Th>
              <Th />
            </Tr>
          </Tfoot>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box p={4} bg="gray.50" minH="100vh">
      <Heading mb={6} textAlign="center">Inventory</Heading>

      {/* Add New Inventory Section */}
      <Box bg="white" p={4} borderRadius="md" boxShadow="md" mb={6}>
        <Heading fontSize="lg" mb={4}>Add New Inventory Item</Heading>
        <Stack direction="row" spacing={2} wrap="wrap">
          <Input
            placeholder="Article Name"
            value={newInventory.article_name}
            onChange={(e) => handleNewInventoryChange("article_name", e.target.value)}
          />
          <Input
            placeholder="Total Quantity"
            type="number"
            value={newInventory.total}
            onChange={(e) => handleNewInventoryChange("total", e.target.value)}
          />
          <Button
            leftIcon={<AddIcon />}
            colorScheme="green"
            isLoading={adding}
            onClick={handleAddInventory}
          >
            Add
          </Button>
        </Stack>
      </Box>

      {isMobile ? renderMobile() : renderDesktop()}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={!!deletingId}
        leastDestructiveRef={cancelRef}
        onClose={() => setDeletingId(null)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Inventory Item
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete this inventory item? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button onClick={() => setDeletingId(null)}>Cancel</Button>
              <Button colorScheme="red" onClick={handleDeleteInventory} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default Inventory;
