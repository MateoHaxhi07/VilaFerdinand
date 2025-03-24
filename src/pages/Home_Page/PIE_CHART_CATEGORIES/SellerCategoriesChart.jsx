import React from "react";
import { Box, Heading, Flex } from "@chakra-ui/react";
import { ResponsivePie } from "@nivo/pie";
import { scaleOrdinal } from "d3-scale";
import { schemeSet3 } from "d3-scale-chromatic";

// Use a D3 ordinal scale for colors (or define your own array)
const colorScale = scaleOrdinal(schemeSet3);

export default function SellerCategoriesChart({ pieData }) {
  // Example total if you want to display arc labels as percentages
  const total = pieData.reduce((acc, cur) => acc + cur.value, 0);

  // Example transformation – rename "NaN" label to "Elona" for demonstration
  const transformedPieData = pieData.map((item) =>
    item.label === "NaN" ? { ...item, label: "Elona" } : item
  );

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
          Categories
        </Heading>
      </Box>

      {/* 
        We removed the custom legend on the right 
        and will rely on Nivo’s "legends" prop at the bottom
      */}
      <Flex direction="column" w="100%" h="calc(100% - 3rem)">
        {/* The Pie Chart */}
        <Box flex="1" minW="300px" height="100%">
          <ResponsivePie
            data={transformedPieData}
            // Use your color scale
            colors={(d) => colorScale(d.id)}
            margin={{ top: 40, right: 0, bottom: 60, left: 0 }}
            innerRadius={0.5}
            padAngle={0.7}
            cornerRadius={3}
            borderWidth={1}
            borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
            defs={[
              {
                id: "sliceOverlay",
                type: "radialGradient",
                colors: [
                  { offset: 0, color: "rgba(255, 255, 255, 0.4)" },
                  { offset: 100, color: "rgba(0, 0, 0, 0.2)" },
                ],
              },
            ]}
            fill={[
              {
                match: "*", // match all slices
                id: "sliceOverlay",
              },
            ]}
            theme={{
              labels: {
                text: { fontSize: 16, fontWeight: "bold" },
              },
            }}
            // Show percentages inside arcs
            arcLabel={(d) => `${((d.value / total) * 100).toFixed(0)}%`}
            arcLabelsSkipAngle={10}
            arcLabelsTextColor={{ from: "color", modifiers: [["darker", 20]] }}
            enableArcLinkLabels={false}
            tooltip={({ datum: { label, value } }) => (
              <Box p="8px" bg="white" border="1px solid #ccc" borderRadius="md">
                <strong style={{ color: "black", fontWeight: "bold" }}>
                  {label}
                </strong>
                <br />

                <Box as="span" fontWeight="bold" color="black">
                  {value.toLocaleString()} ALL
                </Box>
              </Box>
            )}
            // Nivo legend config at the bottom
            legends={[
              {
                anchor: "bottom",
                direction: "row",
                translateY: 50,        // shift the legend down
                itemWidth: 80,
                itemHeight: 18,
                itemTextColor: "#333",
                symbolSize: 18,
                symbolShape: "circle",
                effects: [
                  {
                    on: "hover",
                    style: {
                      itemTextColor: "#000",
                    },
                  },
                ],
              },
            ]}
          />
        </Box>
      </Flex>
    </Box>
  );
}
