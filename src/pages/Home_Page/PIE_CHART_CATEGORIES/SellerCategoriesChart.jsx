import React from "react";
import { Box, Heading, Flex, Text as ChakraText } from "@chakra-ui/react";
import { ResponsivePie } from "@nivo/pie";
import { scaleOrdinal } from "d3-scale";
import { schemeSet3 } from "d3-scale-chromatic";

const colorScale = scaleOrdinal(schemeSet3);

const SellerCategoriesChart = ({ pieData }) => {
  const total = pieData.reduce((acc, cur) => acc + cur.value, 0);
  const transformedPieData = pieData.map((item) =>
    item.label === "NaN" ? { ...item, label: "Elona" } : item
  );

  return (
    <Box w="100%" h="100%">
      <Heading as="h2" size="md" mb={4} color="black" fontWeight="bold" textAlign="center">
        Top Seller Categories
      </Heading>

      <Flex direction={{ base: "column", md: "row" }} w="100%" h="calc(100% - 3rem)">
        {/* Pie Chart */}
        <Box flex="1" minW="300px" height="100%" mr={{ base: 0, md: 4 }}>
          <ResponsivePie
            data={transformedPieData}
            // Base color from your colorScale
            colors={(d) => colorScale(d.id)}
            margin={{ top: 40, right: 0, bottom: 40, left: 0 }}
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
            arcLabel={(d) => `${((d.value / total) * 100).toFixed(0)}%`}
            arcLabelsSkipAngle={10}
            arcLabelsTextColor={{ from: "color", modifiers: [["darker", 20]] }}
            enableArcLinkLabels={false}
            tooltip={({ datum }) => (
              <Box p="8px" bg="white" border="1px solid #ccc" borderRadius="md">
                <strong style={{ color: "black", fontWeight: "bold" }}>{datum.label}</strong>
              </Box>
            )}
          />
        </Box>

        {/* Legend */}
        <Box flex="1" minW="220px" color="black" borderRadius="md" p={2}>
          <Heading as="h3" size="sm" mb={2} fontWeight="bold" p={5}>
            Category
          </Heading>
          {transformedPieData.map((item) => {
            const color = colorScale(item.id);
            return (
              <Flex key={item.id} justifyContent="space-between" alignItems="center" mb={2}>
                <Box display="flex" alignItems="center">
                  <Box as="span" w="12px" h="12px" bg={color} mr={2} borderRadius="2px" />
                  <ChakraText fontWeight="semibold">{item.label}</ChakraText>
                </Box>
                <ChakraText>{item.value.toLocaleString()}</ChakraText>
              </Flex>
            );
          })}

          <Box mt={4} borderTop="1px solid #aaa" pt={2}>
            <Flex justifyContent="space-between">
              <ChakraText fontWeight="bold">Total</ChakraText>
              <ChakraText fontWeight="bold">{total.toLocaleString()}</ChakraText>
            </Flex>
          </Box>
        </Box>
      </Flex>
    </Box>
  );
};

export default SellerCategoriesChart;
