import React from "react";
import {
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Grid,
  GridItem,
  Heading,
  Box,
  Flex,
  Button,
} from "@chakra-ui/react";
import { ResponsiveBar } from "@nivo/bar";

import SellerCategoriesChart from "./PIE_CHART_CATEGORIES/SellerCategoriesChart";
import CategoryTreemap from "./TREE_MAP/CategoryTreemap";

export default function AllGraphs({
  // Metrics
  totalSales,
  totalQuantity,
  avgArticlePrice,
  orderCount,

  // Bar chart data & toggles
  barData,
  barViewMode,
  setBarViewMode,

  // Pie & Treemap data
  pieData,
  categoryTreemapData,
}) {
  return (
    <Card mb={6} boxShadow="md" borderRadius="md">
      <CardBody p={0} /* remove default padding */>

        {/* 
          (A) TOP SECTION (gray):
              - 4 metrics
              - daily/monthly toggle
        */}
        <Box bg="gray.100" p={4}>
          {/* 4 Stats in a grid */}
          <Grid
            templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }}
            gap={4}
            mb={6}
          >
            {/* Total Sales */}
            <GridItem
              bgGradient="linear(to-r, green.300, teal.300)"
              borderRadius="md"
              p={4}
            >
              <Stat>
                <StatLabel fontSize={{ base: "sm", md: "lg" }} color="black" fontWeight="bold">
                  Total Sales
                </StatLabel>
                <StatNumber fontSize={{ base: "md", md: "xl" }} color="black" fontWeight="bold">
                  {Number(totalSales).toLocaleString()} ALL
                </StatNumber>
                <StatHelpText fontSize="sm" color="black" fontWeight="bold">
                  Based on selected filters
                </StatHelpText>
              </Stat>
            </GridItem>

            {/* Total Quantity */}
            <GridItem
              bgGradient="linear(to-r, green.300, teal.300)"
              borderRadius="md"
              p={4}
            >
              <Stat>
                <StatLabel fontSize={{ base: "sm", md: "lg" }} color="black" fontWeight="bold">
                  Total Quantity
                </StatLabel>
                <StatNumber fontSize={{ base: "md", md: "xl" }} color="black" fontWeight="bold">
                  {Number(totalQuantity).toLocaleString()}
                </StatNumber>
                <StatHelpText fontSize="sm" color="black" fontWeight="bold">
                  Based on selected filters
                </StatHelpText>
              </Stat>
            </GridItem>

            {/* Average Article Price */}
            <GridItem
              bgGradient="linear(to-r, green.300, teal.300)"
              borderRadius="md"
              p={4}
            >
              <Stat>
                <StatLabel fontSize={{ base: "sm", md: "lg" }} color="black" fontWeight="bold">
                  Avg. Article Price
                </StatLabel>
                <StatNumber fontSize={{ base: "md", md: "xl" }} color="black" fontWeight="bold">
                  {Number(avgArticlePrice).toLocaleString()} ALL
                </StatNumber>
                <StatHelpText fontSize="sm" color="black" fontWeight="bold">
                  totalSales / totalQuantity
                </StatHelpText>
              </Stat>
            </GridItem>

            {/* Orders */}
            <GridItem
              bgGradient="linear(to-r, green.300, teal.300)"
              borderRadius="md"
              p={4}
            >
              <Stat>
                <StatLabel fontSize={{ base: "sm", md: "lg" }} color="black" fontWeight="bold">
                  Orders
                </StatLabel>
                <StatNumber fontSize={{ base: "md", md: "xl" }} color="black" fontWeight="bold">
                  {orderCount}
                </StatNumber>
                <StatHelpText fontSize="sm" color="black" fontWeight="bold">
                  Unique orders
                </StatHelpText>
              </Stat>
            </GridItem>
          </Grid>

          {/* Toggle Buttons only (no chart) */}
          <Flex justifyContent="center" alignItems="center" flexDirection="column">
            <Heading as="h3" size="md" color="black" textAlign="center" mb={4}>
              Sales Over Time
            </Heading>
            <Box mb={2}>
              <Button
                onClick={() => setBarViewMode("daily")}
                colorScheme={barViewMode === "daily" ? "blue" : "gray"}
                mr={2}
              >
                Daily View
              </Button>
              <Button
                onClick={() => setBarViewMode("monthly")}
                colorScheme={barViewMode === "monthly" ? "blue" : "gray"}
              >
                Monthly View
              </Button>
            </Box>
          </Flex>
        </Box>

        {/* 
          (B) MIDDLE SECTION (white):
              - The Bar Chart
        */}
        <Box bg="white" p={4}>
          <Box height="400px">
            <ResponsiveBar
              data={barData}
              keys={["total"]}
              indexBy="date"
              margin={{ top: 50, right: 50, bottom: 50, left: 60 }}
              padding={0.3}
              valueScale={{ type: "linear" }}
              indexScale={{ type: "band", round: true }}
              colors={() => "#009de0"}
              borderColor={{ theme: "background" }}
              tooltip={({ value, indexValue }) => (
                <Box p="8px" bg="black" border="1px solid #ccc" borderRadius="md">
                  <strong style={{ color: "white", fontWeight: "bold" }}>
                    {indexValue}
                  </strong>
                  <br />
                  <Box as="span" color="white">
                    Totali Shitjeve:
                  </Box>{" "}
                  <Box as="span" fontWeight="bold" color="white">
                    {Number(value).toLocaleString()} ALL
                  </Box>
                </Box>
              )}
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: "",
                legendOffset: 32,
                legendPosition: "middle",
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: "",
                legendOffset: -40,
                legendPosition: "middle",
              }}
              enableLabel={false}
              theme={{
                background: "#ffffff",
                axis: {
                  domain: { line: { stroke: "#000000" } },
                  ticks: {
                    line: { stroke: "#000000", strokeWidth: 1 },
                    text: { fontSize: 12, fontWeight: "bold", fill: "#000000" },
                  },
                  legend: { text: { fill: "#000000" } },
                },
              }}
            />
          </Box>
        </Box>

        {/*
          (C) BOTTOM SECTION (gray):
              - Pie + Treemap side by side
              - Remove 'bg="white"' from GridItems, so they match the gray parent.
        */}
        <Box bg="gray.100" p={4}>
          <Grid
            templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
            gap={6}
            height={{ base: "auto", md: "600px" }}
          >
            {/* LEFT: Pie */}
            <GridItem
              // remove bg="white"
              borderRadius="md"
              overflow="hidden"
              minH={{ base: "400px", md: "100%" }}
            >
              <SellerCategoriesChart pieData={pieData} />
            </GridItem>

            {/* RIGHT: Treemap */}
            <GridItem
              // remove bg="white"
              borderRadius="md"
              overflow="hidden"
              minH={{ base: "400px", md: "100%" }}
            >
              <CategoryTreemap data={categoryTreemapData} />
            </GridItem>
          </Grid>
        </Box>

      </CardBody>
    </Card>
  );
}
