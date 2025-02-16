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
} from "@chakra-ui/react";
import { EditIcon, CheckIcon, CloseIcon } from "@chakra-ui/icons";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function EditableArticleIngredients() {
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(true);
  // Track the article currently being edited
  const [editingArticle, setEditingArticle] = useState(null);
  // Local state for the row being edited
  const [editValues, setEditValues] = useState({});

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

  const handleEdit = (row) => {
    setEditingArticle(row.article_name);
    // Set the current values to local state
    setEditValues({ ...row });
  };

  const handleCancel = () => {
    setEditingArticle(null);
    setEditValues({});
  };

  const handleChange = (field, value) => {
    setEditValues((prev) => ({ ...prev, [field]: value }));
  };

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
      const data = await response.json();
      console.log("Update successful:", data);
      setEditingArticle(null);
      setEditValues({});
      fetchMappings();
    } catch (error) {
      console.error("Error updating article:", error);
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
                <Td>
                  {editingArticle === row.article_name ? (
                    <Input
                      value={editValues.article_name}
                      onChange={(e) => handleChange("article_name", e.target.value)}
                    />
                  ) : (
                    row.article_name
                  )}
                </Td>
                {["ingredient_name_01", "ingredient_name_02", "ingredient_name_03", "ingredient_name_04", "ingredient_name_05"].map((field, i) => (
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
                ))}
                {["usage_amount_01", "usage_amount_02", "usage_amount_03", "usage_amount_04", "usage_amount_05"].map((field, i) => (
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
                ))}
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
                    <IconButton
                      aria-label="Edit"
                      icon={<EditIcon />}
                      size="sm"
                      onClick={() => handleEdit(row)}
                    />
                  )}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
}
