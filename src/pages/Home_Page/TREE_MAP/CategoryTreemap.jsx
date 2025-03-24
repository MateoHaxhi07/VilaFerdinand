import React from "react";
import { Box, Heading } from "@chakra-ui/react";
import { ResponsiveTreeMap } from "@nivo/treemap";
import { scaleQuantile } from "d3-scale";

const CategoryTreemap = ({ data }) => {
  const treemapData = {
    name: "root",
    children: data.map(item => ({
      name: item.Category,
      value: parseFloat(item.total_price),
    })),
  };

  const values = treemapData.children.map(d => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  const colorScale = scaleQuantile()
    .domain([minValue, maxValue])
    .range(["#fc5534", "#fcc234", "#6afe6a"]);

  return (
    <Box w="100%" h="100%">
          {/* The styled container matching .dLDigV */}
          <Box
            bg="rgb(180, 189, 208)"    // same background-color
            borderRadius="18px"
            display="flex"
            px="16px"                  // horizontal padding (16px)
            py="7.5px"                 // vertical padding (7.5px)
            justifyContent="center"
            alignItems="center"
            mb={4}                     // optional margin bottom
          >
            <Heading
              as="h2"
              size="md"
              color="black"
              fontWeight="bold"
              textAlign="center"
            >
              Treemap
            </Heading>
          </Box>

      <Box w="100%" h="calc(100% - 3rem)">
        <ResponsiveTreeMap
          data={treemapData}
          identity="name"
          value="value"
          valueFormat=">-.4s"
          margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
          colors={(node) => colorScale(node.value)}
          label={(node) => node.data.name}
          labelSkipSize={60}
          labelTextColor="#000"
          leavesOnly={true}  
          // Turn off parent labels entirely
          enableParentLabel={false}  
          theme={{
            labels: {
              text: { fontSize: 14, fill: "#000" },
            },
          }}
          borderColor="#ffffff"
          parentLabelPosition="left"
          parentLabelTextColor="#333333"
          tooltip={({ node }) => (
            <div
              style={{
                padding: 8,
                background: "white",
                border: "1px solid #ccc",
                borderRadius: 4,
              }}
            >
              <strong>{node.data.name}</strong>: {node.value.toLocaleString()} ALL
            </div>
          )}
        />
      </Box>
    </Box>
  );
};

export default CategoryTreemap;
