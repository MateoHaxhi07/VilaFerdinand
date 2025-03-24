import React from "react";
import {
  Box,
  Stat,
  StatLabel,
  StatNumber,
  Grid,
  GridItem,
  Heading,
  Flex,
  Button,
} from "@chakra-ui/react";
import { ResponsiveBar } from "@nivo/bar";

// Import your chart components
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
    <>
      {/* TOP-LEVEL BOX (Removed the <Card> & <CardBody>, replaced with <Box>) */}
      <Box
        mb={6}
        boxShadow="md"
        borderRadius="md"
        width="60%"
        height="20%"
        mx="auto"
        bg="gray.100"
        p={0}
      >
        {/* --- TOP SECTION (4 metrics + daily/monthly toggle) --- */}
        <Box p={4}>
          <Grid
            templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }}
            gap={4}
            mb={6}
          >
            {/* 1) TOTAL SALES */}
            <GridItem
              position="relative"
              w="260px"
              h="80px"
               bg="linear-gradient(91deg, rgba(149,110,73,0.75) 0%, rgb(149,110,73) 100%)"
              clipPath="polygon(
                0% 0%, 
                calc(100% - 30px) 0%, 
                100% 50%, 
                calc(100% - 30px) 100%, 
                0% 100%
              )"
              pb={2}
            >
              <Box p={4}>
                <Stat>
                  <StatLabel fontSize="lg" color="white" fontWeight="bold">
                    Total Sales
                  </StatLabel>
                  <StatNumber fontSize="xl" color="white" fontWeight="bold">
                    {Number(totalSales).toLocaleString()} ALL
                  </StatNumber>
                </Stat>
              </Box>
            </GridItem>

            {/* 2) TOTAL QUANTITY */}
            <GridItem
              position="relative"
              w="260px"
              h="80px"
              bgGradient="linear-gradient(91deg, rgba(49, 114, 176, 0.75) 0%, rgb(49, 114, 176), rgb(49, 114, 176));"
              clipPath="polygon(
                0% 0%, 
                calc(100% - 30px) 0%, 
                100% 50%, 
                calc(100% - 30px) 100%, 
                0% 100%
              )"
              pb={2}
            >
              <Box p={4}>
                <Stat>
                  <StatLabel fontSize="lg" color="white" fontWeight="bold">
                    Total Quantity
                  </StatLabel>
                  <StatNumber fontSize="xl" color="white" fontWeight="bold">
                    {Number(totalQuantity).toLocaleString()}
                  </StatNumber>
                </Stat>
              </Box>
            </GridItem>

            {/* 3) AVERAGE ARTICLE PRICE */}
            <GridItem
              position="relative"
              w="260px"
              h="80px"
              bgGradient="linear-gradient(91deg, rgba(43, 131, 126, 0.75) 0%, rgb(43, 131, 126), rgb(43, 131, 126))"
              clipPath="polygon(
                0% 0%, 
                calc(100% - 30px) 0%, 
                100% 50%, 
                calc(100% - 30px) 100%, 
                0% 100%
              )"
              pb={2}
            >
              <Box p={4}>
                <Stat>
                  <StatLabel fontSize="lg" color="white" fontWeight="bold">
                    Avg Article Price
                  </StatLabel>
                  <StatNumber fontSize="xl" color="white" fontWeight="bold">
                    {Number(avgArticlePrice).toLocaleString()} ALL
                  </StatNumber>
                </Stat>
              </Box>
            </GridItem>

            {/* 4) ORDERS */}
            <GridItem
              position="relative"
              w="260px"
              h="80px"
              bgGradient="linear-gradient(to right, rgb(115, 87, 144), rgba(115, 87, 144, 0.75));
"
              clipPath="polygon(
                0% 0%, 
                calc(100% - 30px) 0%, 
                100% 50%, 
                calc(100% - 30px) 100%, 
                0% 100%
              )"
              pb={2}
            >
              <Box p={4}>
                <Stat>
                  <StatLabel fontSize="lg" color="white" fontWeight="bold">
                    Orders
                  </StatLabel>
                  <StatNumber fontSize="xl" color="white" fontWeight="bold">
                    {orderCount}
                  </StatNumber>
                </Stat>
              </Box>
            </GridItem>
          </Grid>

          {/* Toggle Buttons */}
          <Flex justifyContent="center" alignItems="center" flexDirection="column">
          <Box
      as="header"
      bg="rgb(180, 189, 208)"
      borderRadius="18px"
      px="16px"
      py="7.5px"
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      mb={4}            // spacing below the pill
    >
      <Heading
        as="h3"
        size="md"
        color="black"
        fontWeight="bold"
        textAlign="center"
        mb={0}           // remove heading's default bottom margin
      >
        Sales Over Time
      </Heading>
    </Box>
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

        {/* MIDDLE SECTION: Bar Chart */}
        <Box p={4}>
          <Box height="400px" position="relative">
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
                <Box
                  p="8px"
                  bg="black"
                  border="1px solid #ccc"
                  borderRadius="md"
                >
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
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
              }}
              enableLabel={false}
              theme={{
                background: "#f0f0f0",
                axis: {
                  domain: { line: { stroke: "#000000" } },
                  ticks: {
                    line: { stroke: "#000000", strokeWidth: 1 },
                    text: {
                      fontSize: 12,
                      fontWeight: "bold",
                      fill: "#000000",
                    },
                  },
                  legend: { text: { fill: "#000000" } },
                },
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Spacer */}
      <Box height={10} />

      {/* TWO CARDS side by side (Pie + Treemap) */}
      <Grid
        width="60%"
        mx="auto"
        templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
        gap={4}
        mb={6}
      >
        {/* LEFT CARD: Pie Chart */}
        <Box boxShadow="md" borderRadius="md" bg="gray.100" minH="400px">
          <Box position="relative" height="100%">
            <Box position="absolute" top="0" left="0" right="0" bottom="0">
              <SellerCategoriesChart pieData={pieData} />
            </Box>
          </Box>
        </Box>

        {/* RIGHT CARD: Treemap */}
        <Box boxShadow="md" borderRadius="md" bg="gray.100" minH="400px">
          <Box position="relative" height="100%">
            <Box position="absolute" top="0" left="0" right="0" bottom="0">
              <CategoryTreemap data={categoryTreemapData} />
            </Box>
          </Box>
        </Box>
      </Grid>
    </>
  );
}
