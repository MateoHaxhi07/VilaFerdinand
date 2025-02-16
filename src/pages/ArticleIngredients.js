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
  Spinner,
  Center,
  IconButton,
  Input,
  Button,
  Stack,
  Text,
  Divider,
  useToast,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import { EditIcon, CheckIcon, CloseIcon, AddIcon, DeleteIcon } from "@chakra-ui/icons";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function EditableArticleIngredients() {
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingArticle, setEditingArticle] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [newArticle, setNewArticle] = useState({
    article_name: "",
    ingredient_name_01: "",
    usage_amount_01: "",
    ingredient_name_02: "",
    usage_amount_02: "",
    ingredient_name_03: "",
    usage_amount_03: "",
    ingredient_name_04: "",
    usage_amount_04: "",
    ingredient_name_05: "",
    usage_amount_05: "",
  });
  const [adding, setAdding] = useState(false);
  const [deletingArticle, setDeletingArticle] = useState(null); // For deletion confirmation
  const toast = useToast();

  // Fetch Article Mappings
  const fetchMappings = async () => {
    try {
      const resp = await fetch(`${API_URL}/article-ingredients`);
      if (!resp.ok) {
        throw new Error("Failed to fetch article mappings");
      }
      const data = await resp.json();
      setMappings(data);
    } catch (error) {
      console.error("Error fetching mappings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMappings();
  }, []);

  // Handle Inline Edit
  const handleEdit = (row) => {
    setEditingArticle(row.article_name);
    setEditValues({ ...row });
  };

  const handleCancel = () => {
    setEditingArticle(null);
    setEditValues({});
  };

  const handleChange = (field, value) => {
    setEditValues((prev) => ({ ...prev, [field]: value }));
  };

  // Update Ingredients and Usage
  const handleSave = async () => {
    try {
      const response = await fetch(`${API_URL}/article-ingredients/${editingArticle}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editValues),
      });
      if (!response.ok) {
        throw new Error("Failed to update article");
      }
      toast({
        title: "Success",
        description: "Article updated successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setEditingArticle(null);
      setEditValues({});
      fetchMappings();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update article.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      console.error("Error updating article:", error);
    }
  };

  // Handle Article Name Update via PATCH
  const handleArticleNameUpdate = async (oldName, newName) => {
    if (!newName.trim() || newName === oldName) {
      toast({
        title: "No changes made",
        description: "Article name is unchanged.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/article-ingredients/${oldName}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_article_name: newName }),
      });

      if (!response.ok) {
        throw new Error("Failed to update article name");
      }

      toast({
        title: "Success",
        description: "Article name updated successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchMappings(); // Refresh table
    } catch (error) {
      console.error("Error updating article name:", error);
      toast({
        title: "Error",
        description: "Failed to update article name.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle Add New Article
  const handleNewArticleChange = (field, value) => {
    setNewArticle((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddArticle = async () => {
    if (!newArticle.article_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Article name is required.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setAdding(true);
    try {
      const payload = {
        entries: [
          {
            articleName: newArticle.article_name,
            ingredientName: newArticle.ingredient_name_01,
            ingredientUsage: newArticle.usage_amount_01,
          },
          {
            articleName: newArticle.article_name,
            ingredientName: newArticle.ingredient_name_02,
            ingredientUsage: newArticle.usage_amount_02,
          },
          {
            articleName: newArticle.article_name,
            ingredientName: newArticle.ingredient_name_03,
            ingredientUsage: newArticle.usage_amount_03,
          },
          {
            articleName: newArticle.article_name,
            ingredientName: newArticle.ingredient_name_04,
            ingredientUsage: newArticle.usage_amount_04,
          },
          {
            articleName: newArticle.article_name,
            ingredientName: newArticle.ingredient_name_05,
            ingredientUsage: newArticle.usage_amount_05,
          },
        ],
      };

      const response = await fetch(`${API_URL}/article-ingredients/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to add new article");
      }

      toast({
        title: "Success",
        description: "New article added successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setNewArticle({
        article_name: "",
        ingredient_name_01: "",
        usage_amount_01: "",
        ingredient_name_02: "",
        usage_amount_02: "",
        ingredient_name_03: "",
        usage_amount_03: "",
        ingredient_name_04: "",
        usage_amount_04: "",
        ingredient_name_05: "",
        usage_amount_05: "",
      });
      fetchMappings();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add new article.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      console.error("Error adding article:", error);
    } finally {
      setAdding(false);
    }
  };

  // Handle Delete Article
  const handleDeleteArticle = async () => {
    try {
      const response = await fetch(`${API_URL}/article-ingredients/${deletingArticle}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete article");
      }

      toast({
        title: "Success",
        description: "Article deleted successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setDeletingArticle(null);
      fetchMappings();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete article.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      console.error("Error deleting article:", error);
    }
  };

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Box p={4} bg="gray.50" minH="100vh">
      <Heading mb={6} textAlign="center">
        Editable Article → Ingredients Mapping
      </Heading>

      {/* Add New Article Section */}
      <Box bg="white" p={4} borderRadius="md" boxShadow="md" mb={6}>
        <Heading fontSize="lg" mb={4}>
          Add New Article
        </Heading>
        <Stack direction="row" spacing={2} wrap="wrap">
          <Input
            placeholder="Article Name"
            value={newArticle.article_name}
            onChange={(e) => handleNewArticleChange("article_name", e.target.value)}
          />
          {[...Array(5)].map((_, i) => (
            <Stack key={i} direction="column" spacing={1}>
              <Input
                placeholder={`Ingredient ${i + 1}`}
                value={newArticle[`ingredient_name_0${i + 1}`] || ""}
                onChange={(e) =>
                  handleNewArticleChange(`ingredient_name_0${i + 1}`, e.target.value)
                }
                width="150px"
              />
              <Input
                placeholder={`Usage ${i + 1}`}
                value={newArticle[`usage_amount_0${i + 1}`] || ""}
                onChange={(e) =>
                  handleNewArticleChange(`usage_amount_0${i + 1}`, e.target.value)
                }
                width="100px"
              />
            </Stack>
          ))}
          <Button
            leftIcon={<AddIcon />}
            colorScheme="green"
            isLoading={adding}
            onClick={handleAddArticle}
          >
            Add Article
          </Button>
        </Stack>
      </Box>

      {/* Existing Articles Table */}
      <TableContainer bg="white" p={4} borderRadius="md" boxShadow="md">
        <Table variant="simple" size="sm">
          <Thead bg="gray.200">
            <Tr>
              <Th>Article Name</Th>
              <Th>Ingredient 1</Th>
              <Th>Ingredient 2</Th>
              <Th>Ingredient 3</Th>
              <Th>Ingredient 4</Th>
              <Th>Ingredient 5</Th>
              <Th>Usage 1</Th>
              <Th>Usage 2</Th>
              <Th>Usage 3</Th>
              <Th>Usage 4</Th>
              <Th>Usage 5</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {mappings.map((row, idx) => (
              <Tr key={idx}>
                {/* Editable Article Name */}
                <Td>
                  {editingArticle === row.article_name ? (
                    <Input
                      value={editValues.article_name || ""}
                      onChange={(e) => handleChange("article_name", e.target.value)}
                      onBlur={() =>
                        handleArticleNameUpdate(row.article_name, editValues.article_name)
                      }
                      placeholder="Edit Article Name"
                    />
                  ) : (
                    row.article_name
                  )}
                </Td>

                {/* Ingredients */}
                {["ingredient_name_01", "ingredient_name_02", "ingredient_name_03", "ingredient_name_04", "ingredient_name_05"].map(
                  (field) => (
                    <Td key={field}>
                      {editingArticle === row.article_name ? (
                        <Input
                          value={editValues[field] || ""}
                          onChange={(e) => handleChange(field, e.target.value)}
                        />
                      ) : (
                        row[field] || "-"
                      )}
                    </Td>
                  )
                )}

                {/* Usage */}
                {["usage_amount_01", "usage_amount_02", "usage_amount_03", "usage_amount_04", "usage_amount_05"].map(
                  (field) => (
                    <Td key={field}>
                      {editingArticle === row.article_name ? (
                        <Input
                          value={editValues[field] || ""}
                          onChange={(e) => handleChange(field, e.target.value)}
                        />
                      ) : (
                        row[field] ?? "-"
                      )}
                    </Td>
                  )
                )}

                {/* Actions */}
                <Td>
                  {editingArticle === row.article_name ? (
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
                        onClick={handleCancel}
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
                        onClick={() => setDeletingArticle(row.article_name)}
                      />
                    </>
                  )}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={!!deletingArticle}
        leastDestructiveRef={undefined}
        onClose={() => setDeletingArticle(null)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Article
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete "{deletingArticle}"? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button onClick={() => setDeletingArticle(null)}>Cancel</Button>
              <Button colorScheme="red" onClick={handleDeleteArticle} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
