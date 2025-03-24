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

const MetricsCard = ({
  totalSales,
  totalQuantity,
  avgArticlePrice,
  orderCount,
  barData,
  // 1) Accept these new props for toggling
  barViewMode,
  setBarViewMode,
}) => {
  return (
    <Card mb={6}>
      <CardBody        boxShadow="lg"
        border="20px"
        borderColor="black.200"
        p={4}
      >
        <Grid
          templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }}
          gap={4}
          mb={6}
        >
          {/* Total Sales */}
          <GridItem
            bgGradient="linear(to-r, green.300, teal.300)"
            border={1}
            borderRadius="md"
            p={4}
          >
            <Stat>
              <StatLabel fontSize={{ base: "sm", md: "lg" }} color="black" fontWeight="bold">
                Total Sales
              </StatLabel>
              <StatNumber fontSize={{ base: "md", md: "xl" }} color="black" fontWeight="bold">
                {parseFloat(totalSales).toLocaleString()} ALL
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
                {parseFloat(totalQuantity).toFixed(0)}
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
                {parseFloat(avgArticlePrice).toLocaleString()} ALL
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

        {/* Daily Sales Bar Chart */}
        <Box height="400px">
          {/* NEW: Heading + Toggle Buttons above the bar chart */}
          <Flex justifyContent="center" alignItems="center" flexDirection="column" mb={4}>

  <Box>
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
                <strong style={{ color: "white", fontWeight: "bold" }}>{indexValue}</strong>
                <br />
                <Box as="span" >
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
      </CardBody>
    </Card>
  );
};

export default MetricsCard;
