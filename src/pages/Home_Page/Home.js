import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Box,
  Heading,
  Grid,
  Text as ChakraText,
  GridItem,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Flex,
} from "@chakra-ui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveLine } from "@nivo/line";
import { ResponsivePie } from "@nivo/pie";
import { scaleOrdinal } from "d3-scale";
import { ResponsiveTreeMap } from "@nivo/treemap";
import { scaleQuantile } from "d3-scale";

import { schemeSet3 } from "d3-scale-chromatic";

// -----------------------------------------------------------------------------
// GLOBAL SETTINGS
// -----------------------------------------------------------------------------

// Create a color scale for the pie chart and legend using D3
const colorScale = scaleOrdinal(schemeSet3);

const timeframeScale = scaleOrdinal()
  .domain(["morning", "lunch", "dinner", "other"])
  .range([schemeSet3[5], schemeSet3[7], schemeSet3[9], "#ccc"]);

// Define your API URL (adjust as needed)
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function getTimeframe(hourNumber) {
  if (hourNumber >= 7 && hourNumber <= 11) return "morning";
  if (hourNumber >= 12 && hourNumber <= 16) return "lunch";
  if (hourNumber >= 17 && hourNumber <= 23) return "dinner";
  return "other"; // hours 00-06 or anything else if needed
}

// -----------------------------------------------------------------------------
// COMPONENT: Filters
// Description: Renders date pickers, multi-select dropdowns and a new hour filter.
// -----------------------------------------------------------------------------
const Filters = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  sellers,
  selectedSellers,
  setSelectedSellers,
  sellerCategoriesOptions,
  selectedSellerCategories,
  setSelectedSellerCategories,
  selectedHours,
  setSelectedHours,
  hoursOptions,
  selectStyles,
}) => {
  return (
    <Card
      bg="gray.800"
      bgGradient="linear(to-r, green.600, teal.400)"
      mb={6}
      borderRadius="md"
      boxShadow="md"
    >
      <CardBody>
        <Heading size="md" mb={4} color="white" fontWeight="bold">
          Filters
        </Heading>
        <Flex wrap="wrap" gap={4}>
          {/* Start Date Filter */}
          <Box>
            <Box
              mb={2}
              color="white"
              bgGradient="linear(to-r, green.600, teal.400)"
              fontWeight="bold"
            >
              Start Date
            </Box>
            <DatePicker
              selected={startDate}
              onChange={setStartDate}
              portalId="root-portal"
              className="dark-datepicker"
            />
          </Box>
          {/* End Date Filter */}
          <Box>
            <Box
              mb={2}
              color="white"
              bgGradient="linear(to-r, green.600, teal.400)"
              fontWeight="bold"
            >
              End Date
            </Box>
            <DatePicker
              selected={endDate}
              onChange={setEndDate}
              portalId="root-portal"
              className="dark-datepicker"
            />
          </Box>
          {/* Seller Filter */}
          <Box minW="200px">
            <Box
              mb={2}
              color="white"
              bgGradient="linear(to-r, green.600, teal.400)"
              fontWeight="bold"
            >
              Seller
            </Box>
            <Select
              isMulti
              options={sellers}
              onChange={setSelectedSellers}
              placeholder="Select sellers"
              menuPortalTarget={document.body}
              styles={selectStyles}
              value={selectedSellers}
            />
          </Box>
          {/* Seller Category Filter */}
          <Box minW="200px">
            <Box
              mb={2}
              color="white"
              bgGradient="linear(to-r, green.600, teal.400)"
              fontWeight="bold"
            >
              Seller Category
            </Box>
            <Select
              isMulti
              options={sellerCategoriesOptions}
              onChange={setSelectedSellerCategories}
              placeholder="Select categories"
              menuPortalTarget={document.body}
              styles={selectStyles}
              value={selectedSellerCategories}
            />
          </Box>
          {/* Hour Filter */}
          <Box minW="200px">
            <Box
              mb={2}
              color="white"
              bgGradient="linear(to-r, green.600, teal.400)"
              fontWeight="bold"
            >
              Hour
            </Box>
            <Select
              isMulti
              options={hoursOptions}
              onChange={setSelectedHours}
              placeholder="Select hours"
              menuPortalTarget={document.body}
              styles={selectStyles}
              value={selectedHours}
            />
          </Box>
        </Flex>
      </CardBody>
    </Card>
  );
};

// -----------------------------------------------------------------------------
// COMPONENT: MetricsCard (Daily Sales Bar Chart)
// Description: Displays key metrics and a daily sales bar chart using Nivo.
// -----------------------------------------------------------------------------
const MetricsCard = ({
  totalSales,
  totalQuantity,
  avgArticlePrice,
  orderCount,
  barData,
}) => {
  return (
    <Card mb={6}>
      <CardBody
        bgGradient="linear(to-r, white.100, gray.100)"
        boxShadow="lg"
        border="20px"
        borderColor="black.200"
        p={4}
      >
        {/* Metrics Grid */}
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
            borderColor="blackAlpha.100"
            p={4}
          >
            <Stat>
              <StatLabel
                fontSize={{ base: "sm", md: "lg" }}
                color="black"
                fontWeight="bold"
              >
                Total Sales
              </StatLabel>
              <StatNumber
                fontSize={{ base: "md", md: "xl" }}
                color="black"
                fontWeight="bold"
              >
                {parseFloat(totalSales).toLocaleString()} ALL
              </StatNumber>
              <StatHelpText
                fontSize="sm"
                color="black"
                fontWeight="bold"
              >
                Based on selected filters
              </StatHelpText>
            </Stat>
          </GridItem>
          {/* Total Quantity */}
          <GridItem
            bgGradient="linear(to-r, green.300, teal.300)"
            border={1}
            borderRadius="md"
            borderColor="blackAlpha.100"
            p={4}
          >
            <Stat>
              <StatLabel
                fontSize={{ base: "sm", md: "lg" }}
                color="black"
                fontWeight="bold"
              >
                Total Quantity
              </StatLabel>
              <StatNumber
                fontSize={{ base: "md", md: "xl" }}
                color="black"
                fontWeight="bold"
              >
                {parseFloat(totalQuantity).toFixed(0)}
              </StatNumber>
              <StatHelpText
                fontSize="sm"
                color="black"
                fontWeight="bold"
              >
                Based on selected filters
              </StatHelpText>
            </Stat>
          </GridItem>
          {/* Average Article Price */}
          <GridItem
            bgGradient="linear(to-r, green.300, teal.300)"
            border={1}
            borderRadius="md"
            borderColor="blackAlpha.100"
            p={4}
          >
            <Stat>
              <StatLabel
                fontSize={{ base: "sm", md: "lg" }}
                color="black"
                fontWeight="bold"
              >
                Avg. Article Price
              </StatLabel>
              <StatNumber
                fontSize={{ base: "md", md: "xl" }}
                color="black"
                fontWeight="bold"
              >
                {parseFloat(avgArticlePrice).toLocaleString()} ALL
              </StatNumber>
              <StatHelpText
                fontSize="sm"
                color="black"
                fontWeight="bold"
              >
                Calculated from total sales/quantity
              </StatHelpText>
            </Stat>
          </GridItem>
          {/* Orders */}
          <GridItem
            bgGradient="linear(to-r, green.300, teal.300)"
            border={1}
            borderRadius="md"
            borderColor="blackAlpha.100"
            p={4}
          >
            <Stat>
              <StatLabel
                fontSize={{ base: "sm", md: "lg" }}
                color="black"
                fontWeight="bold"
              >
                Orders
              </StatLabel>
              <StatNumber
                fontSize={{ base: "md", md: "xl" }}
                color="black"
                fontWeight="bold"
              >
                {orderCount}
              </StatNumber>
              <StatHelpText
                fontSize="sm"
                color="black"
                fontWeight="bold"
              >
                Unique orders by datetime
              </StatHelpText>
            </Stat>
          </GridItem>
        </Grid>

        {/* Daily Sales Bar Chart */}
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
                <strong style={{ color: "white", fontWeight: "bold" }}>{indexValue}</strong>
                <br />
                <Box as="span" color="white">
                  Total Article Price:
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
            label={(d) => `${d.value.toLocaleString()} ALL`}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor="white"
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

// -----------------------------------------------------------------------------
// COMPONENT: SellerCategoriesChart
// Description: Displays a pie chart of top seller categories with a side legend.
// -----------------------------------------------------------------------------
const SellerCategoriesChart = ({ pieData }) => {
  const total = pieData.reduce((acc, cur) => acc + cur.value, 0);
  const transformedPieData = pieData.map((item) =>
    item.label === "NaN" ? { ...item, label: "Elona" } : item
  );
  return (
    <Card mb={6}>
      <CardBody
        bgGradient="linear(to-r, white.100, gray.100)"
        boxShadow="lg"
        border="20px"
        borderColor="black.200"
        p={4}
      >
        <Heading
          as="h2"
          size="md"
          mb={4}
          color="black"
          fontWeight="bold"
          textAlign="center"
        >
          Top Seller Categories
        </Heading>
        <Flex
          direction={{ base: "column", md: "row" }}
          alignItems="start"
          justifyContent="space-between"
        >
          {/* Pie Chart */}
          <Box
            flex="1"
            minWidth="300px"
            height="400px"
            mr={{ base: 0, md: 4 }}
            mb={{ base: 4, md: 0 }}
          >
            <ResponsivePie
              data={transformedPieData}
              colors={(d) => colorScale(d.id)}
              margin={{ top: 40, right: 0, bottom: 40, left: 0 }}
              innerRadius={0.5}
              padAngle={0.7}
              cornerRadius={3}
              borderWidth={1}
              borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
              theme={{
                labels: {
                  text: {
                    fontSize: 16,
                    fontWeight: "bold",
                  },
                },
              }}
              tooltip={({ datum }) => (
                <Box p="8px" bg="white" border="1px solid #ccc" borderRadius="md">
                  <strong style={{ color: "black", fontWeight: "bold" }}>
                    {datum.label}
                  </strong>
                </Box>
              )}
              arcLabel={(d) => `${((d.value / total) * 100).toFixed(0)}%`}
              arcLabelsSkipAngle={10}
              arcLabelsTextColor={{ from: "color", modifiers: [["darker", 20]] }}
              enableArcLinkLabels={false}
            />
          </Box>
          {/* Legend */}
          <Box flex="1" minWidth="250px" color="black" borderRadius="md" p={2}>
            <Heading as="h3" size="sm" mb={2} fontWeight="bold" p={5} m={0}>
              Category
            </Heading>
            {transformedPieData.map((item) => {
              const color = colorScale(item.id);
              return (
                <Flex key={item.id} justifyContent="space-between" alignItems="center" mb={2}>
                  <Box display="flex" alignItems="center">
                    <Box as="span" display="inline-block" w="12px" h="12px" bg={color} mr={2} borderRadius="2px" />
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
      </CardBody>
    </Card>
  );
};


// -----------------------------------------------------------------------------
// COMPONENT: HEATMAP
// Description: Renders a card that displays an hourly sales bar chart and aggregated totals.
// -----------------------------------------------------------------------------

const CategoryTreemap = ({ data }) => {
  // 1) Transform your raw data (array of objects) into the hierarchical structure 
  //    Nivo Treemap needs. The top-level "root" can be named anything.
  //    Each child has "name" and "value".
  const treemapData = {
    name: "root",
    children: data.map((item) => ({
      name: item.Category,
      value: parseFloat(item.total_price),
    })),
  };

  // 2) Determine the min & max so we can color big values green and small red
  const values = treemapData.children.map((d) => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  // 3) Create a 5-color scale that goes from red (small) to green (large).
  //    (Adjust the colors to your preference.)
  const colorScale = scaleQuantile()
    .domain([minValue, maxValue])
    .range(["#fc5534",  "#fcc234", "#6afe6a"]);

  return (
    <Box height="500px">
      <Heading as="h2" size="md" mb={4} color = "black" fontWeight="bold" textAlign="center">
        Category Treemap
      </Heading>



      <ResponsiveTreeMap
        data={treemapData}
        identity="name"      // the property to use as the node name
        value="value"        // the property to use as the node value
        valueFormat=">-.4s"  // e.g. format large numbers like 15.2k
        margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
        // color the rectangles by their "value" using our scale
        colors={(node) => colorScale(node.value)}
        label={(node) => node.data.name}
        
        labelSkipSize={15}
         labelTextColor="#000000"
         theme={{
          labels: {
            text: {
              fontSize: 16,
              fill: "#000000", // label color
            },
          },
        }}
        borderColor="#ffffff"
        parentLabelPosition="left"
        parentLabelTextColor="#333333"
        // optional tooltip
        tooltip={({ node }) => (
          <div
            style={{
              padding: 8,
              background: "black",
              border: "1px solid #ccc",
              borderRadius: 4,
            }}
          >
            <strong>{node.data.name}</strong>: {node.value.toLocaleString()} ALL
          </div>
        )}
      />
    </Box>
  );
};






// -----------------------------------------------------------------------------
// COMPONENT: HourlySalesChart
// Description: Renders a card that displays an hourly sales bar chart and aggregated totals.
// -----------------------------------------------------------------------------
const HourlySalesChart = ({ data }) => {
  // Calculate aggregated totals as before.
  const morningTotal = data
    .filter((item) => {
      const hr = parseInt(item.hour, 10);
      return hr >= 7 && hr <= 11;
    })
    .reduce((acc, cur) => acc + cur.total, 0);

  const lunchTotal = data
    .filter((item) => {
      const hr = parseInt(item.hour, 10);
      return hr >= 12 && hr <= 16;
    })
    .reduce((acc, cur) => acc + cur.total, 0);

  const dinnerTotal = data
    .filter((item) => {
      const hr = parseInt(item.hour, 10);
      return hr >= 17 && hr <= 23;
    })
    .reduce((acc, cur) => acc + cur.total, 0);

  const grandTotal = morningTotal + lunchTotal + dinnerTotal;

  // Transform the data for the line chart.
  // Nivo's ResponsiveLine expects an array of series with { id, data }.
  const seriesData = [
    {
      id: "Hourly Sales",
      data: data.map((item) => ({
        x: item.hour, // x-axis: hour in "00", "01", etc.
        y: item.total,
      })),
    },
  ];

  return (
    <Card mt={6}>
      <CardBody>
        <Heading as="h3" size="md" mb={4} textAlign="center">
          Hourly Sales
        </Heading>
        <Flex direction={{ base: "column", md: "row" }} gap={4}>
          {/* Hourly Line Chart */}
          <Box flex="1" height="400px">
            <ResponsiveLine
              data={seriesData}
              margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
              xScale={{ type: "point" }}
              yScale={{
                type: "linear",
                min: "auto",
                max: "auto",
                stacked: false,
                reverse: false,
              }}
              axisBottom={null} 
              axisLeft={{
                orient: "left",
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: "Total Sales",
                legendOffset: -40,
                legendPosition: "middle",
              }}
              pointSize={10}
              pointColor={{ theme: "background" }}
              pointBorderWidth={2}
              pointBorderColor={{ from: "serieColor" }}
              pointLabelYOffset={-12}
              useMesh={true}
              tooltip={({ point }) => (
                <Box p="8px" bg="white" border="1px solid #ccc" borderRadius="md">
                  <strong style={{ color: "black" }}>
                    ORA : {point.data.xFormatted}
                  </strong>
                  <br />
                  <Box as="span" color="black">
                    TOTALI :
                  </Box>{" "}
                  <Box as="span" fontWeight="bold" color="black">
                    {Number(point.data.y).toLocaleString()} ALL
                  </Box>
                </Box>
              )}
            />
          </Box>
          {/* Aggregated Totals */}
          <Box flex="1" p={4}>
            <Heading as="h4" size="sm" mb={2}>
               TOTALS
            </Heading>
            <Flex justifyContent="space-between" mb={2}>
              <Flex alignItems="center">
                <Box
                  w="12px"
                  h="12px"
                  bg={timeframeScale("morning")}
                  mr={2}
                  borderRadius="2px"
                />
                <ChakraText>Morning (07:00-11:59)</ChakraText>
              </Flex>
              <ChakraText fontWeight="bold">
                {morningTotal.toLocaleString()} ALL
              </ChakraText>
            </Flex>
            <Flex justifyContent="space-between" mb={2}>
              <Flex alignItems="center">
                <Box
                  w="12px"
                  h="12px"
                  bg={timeframeScale("lunch")}
                  mr={2}
                  borderRadius="2px"
                />
                <ChakraText>Lunch (12:00-16:59)</ChakraText>
              </Flex>
              <ChakraText fontWeight="bold">
                {lunchTotal.toLocaleString()} ALL
              </ChakraText>
            </Flex>
            <Flex justifyContent="space-between" mb={2}>
              <Flex alignItems="center">
                <Box
                  w="12px"
                  h="12px"
                  bg={timeframeScale("dinner")}
                  mr={2}
                  borderRadius="2px"
                />
                <ChakraText>Dinner (17:00-23:00)</ChakraText>
              </Flex>
              <ChakraText fontWeight="bold">
                {dinnerTotal.toLocaleString()} ALL
              </ChakraText>
            </Flex>
            <Box mt={2} pt={2} borderTop="1px solid #aaa">
              <Flex justifyContent="space-between">
                <ChakraText fontWeight="bold">Total</ChakraText>
                <ChakraText fontWeight="bold">
                  {grandTotal.toLocaleString()} ALL
                </ChakraText>
              </Flex>
            </Box>
          </Box>
        </Flex>
      </CardBody>
    </Card>
  );
};

// -----------------------------------------------------------------------------
// COMPONENT: Average Order Value Line Chart 
// -----------------------------------------------------------------------------



const AvgOrderValueChart = ({ data }) => {
  // Ensure data is available and transformed properly
  const chartData = [
    {
      id: "Average Order Value",
      data: data.map(item => ({
        x: item.order_date, // or format this date as needed
        y: parseFloat(item.avg_order_value),
      })),
    },
  ];

  return (
    <Box height="400px">
      <ResponsiveLine
        data={chartData}
        margin={{ top: 50, right: 50, bottom: 50, left: 60 }}
        xScale={{ type: "point" }}
        yScale={{ type: "linear", min: "auto", max: "auto", stacked: false }}
        axisBottom={{
          orient: "bottom",
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 45,
          legend: "Order Date",
          legendOffset: 36,
          legendPosition: "middle",
        }}
        axisLeft={{
          orient: "left",
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Avg Order Value (ALL)",
          legendOffset: -40,
          legendPosition: "middle",
        }}
        pointSize={10}
        pointColor={{ theme: "background" }}
        pointBorderWidth={2}
        pointBorderColor={{ from: "serieColor" }}
        useMesh={true}
        tooltip={({ point }) => (
          <Box p="8px" bg="white" border="1px solid #ccc" borderRadius="md">
            <strong>{point.data.xFormatted}</strong>
            <br />
            <span>{Number(point.data.y).toLocaleString()} ALL</span>
          </Box>
        )}
      />
    </Box>
  );
};




















// -----------------------------------------------------------------------------
// COMPONENT: Home (Main Dashboard)
// -----------------------------------------------------------------------------
const Home = () => {
  // Retrieve filter states from context
  const {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    selectedSellers,
    setSelectedSellers,
    selectedSellerCategories,
    setSelectedSellerCategories,
    selectedArticleNames,
    setSelectedArticleNames,
    selectedCategories,
    setSelectedCategories,
  } = useOutletContext();

  // Metrics States
  const [totalSales, setTotalSales] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [avgArticlePrice, setAvgArticlePrice] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [dailySales, setDailySales] = useState([]);

  // Pie Chart Data State
  const [pieData, setPieData] = useState([]);

  // treemap

  const [categoryTreemapData, setCategoryTreemapData] = useState([]);

  // average order value

  const [avgOrderValueData, setAvgOrderValueData] = useState([]);

  // Hourly Sales Data State
  const [hourlySales, setHourlySales] = useState([]);

  // Dropdown Options State
  const [sellers, setSellers] = useState([]);
  const [sellerCategoriesOptions, setSellerCategoriesOptions] = useState([]);
  const [articleNamesOptions, setArticleNamesOptions] = useState([]);
  const [categories, setCategories] = useState([]);
  const lineChartData = [
    {
      id: "Average Order Value",
      data: avgOrderValueData.map(item => ({
        x: item.order_date,  // formatted date string
        y: parseFloat(item.avg_order_value),
      })),
    },
  ];

  // New Hour Filter State
  const [selectedHours, setSelectedHours] = useState([]);
  const hoursOptions = Array.from({ length: 24 }, (_, i) => ({
    value: i,
    label: i.toString().padStart(2, "0"),
  }));

  const fetchCategoryTotals = async () => {
    try {
      const queryParams = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      
      // Append other filters if they exist.
      if (selectedCategories && selectedCategories.length) {
        queryParams.append(
          "categories",
          selectedCategories.map(cat => cat.value).join(",")
        );
      }
      if (selectedSellers && selectedSellers.length) {
        queryParams.append(
          "sellers",
          selectedSellers.map(s => s.value).join(",")
        );
      }
      if (selectedSellerCategories && selectedSellerCategories.length) {
        queryParams.append(
          "sellerCategories",
          selectedSellerCategories.map(sc => sc.value).join(",")
        );
      }
      // If you have an hours filter, add it too:
      if (selectedHours && selectedHours.length) {
        queryParams.append(
          "hours",
          selectedHours.map(h => h.value).join(",")
        );
      }
      
      const url = `${API_URL}/sales/category-total-price?${queryParams.toString()}`;
      const response = await fetch(url);
      const data = await response.json();
      setCategoryTreemapData(data);
    } catch (error) {
      console.error("Error fetching category totals:", error);
    }
  };

  // Custom Select Styles
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: "#2D3748",
      borderColor: state.isFocused ? "#63B3ED" : "#4A5568",
      color: "#fff",
      fontWeight: "bold",
      minHeight: "40px",
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "#2D3748",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "#4A5568" : "#2D3748",
      color: "#fff",
      fontWeight: "bold",
    }),
    singleValue: (base) => ({
      ...base,
      color: "#fff",
      fontWeight: "bold",
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "#4A5568",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "#fff",
      fontWeight: "bold",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#A0AEC0",
      fontWeight: "bold",
    }),
  };

  // Helper to conditionally add the hours query parameter
  const getHoursQuery = () => {
    return selectedHours.length > 0
      ? `&hours=${selectedHours.map((h) => h.value).join(",")}`
      : "";
  };

  // ---------------------------------------------------------------------------
  // FETCH FUNCTIONS
  // ---------------------------------------------------------------------------
  const fetchTotalSales = async () => {
    try {
      const hoursQuery = getHoursQuery();
      const url = `${API_URL}/sales/total-sales?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&sellers=${selectedSellers.map(s => s.value).join(",")}&sellerCategories=${selectedSellerCategories.map(cat => cat.value).join(",")}&articleNames=${selectedArticleNames.map(a => a.value).join(",")}&categories=${selectedCategories.map(cat => cat.value).join("")}${hoursQuery}`;
      console.log("Fetching Total Sales with URL:", url);
      const response = await fetch(url);
      const data = await response.json();
      setTotalSales(data.total_sales || 0);
    } catch (error) {
      console.error("Error fetching total sales:", error);
    }
  };






 //Fetch Average Order Value
  const fetchAvgOrderValue = async () => {
    try {
      const queryParams = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      // Append additional filters if needed
      if (selectedCategories?.length) {
        queryParams.append("categories", selectedCategories.map(c => c.value).join(","));
      }
      if (selectedSellers?.length) {
        queryParams.append("sellers", selectedSellers.map(s => s.value).join(","));
      }
      if (selectedSellerCategories?.length) {
        queryParams.append("sellerCategories", selectedSellerCategories.map(sc => sc.value).join(","));
      }
      
      const url = `${API_URL}/sales/avg-order-value?${queryParams.toString()}`;
      const response = await fetch(url);
      const data = await response.json();
      setAvgOrderValueData(data);
    } catch (error) {
      console.error("Error fetching average order value:", error);
    }
  };
  
  const fetchTotalQuantity = async () => {
    try {
      const hoursQuery = getHoursQuery();
      const url = `${API_URL}/sales/total-quantity?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&sellers=${selectedSellers.map(s => s.value).join(",")}&sellerCategories=${selectedSellerCategories.map(cat => cat.value).join(",")}&articleNames=${selectedArticleNames.map(a => a.value).join(",")}&categories=${selectedCategories.map(cat => cat.value).join("")}${hoursQuery}`;
      const response = await fetch(url);
      const data = await response.json();
      setTotalQuantity(data.total_quantity || 0);
    } catch (error) {
      console.error("Error fetching total quantity:", error);
    }
  };

  const fetchAvgArticlePrice = async () => {
    try {
      const hoursQuery = getHoursQuery();
      const url = `${API_URL}/sales/avg-article-price?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&sellers=${selectedSellers.map(s => s.value).join(",")}&sellerCategories=${selectedSellerCategories.map(cat => cat.value).join(",")}&articleNames=${selectedArticleNames.map(a => a.value).join(",")}&categories=${selectedCategories.map(cat => cat.value).join("")}${hoursQuery}`;
      const response = await fetch(url);
      const data = await response.json();
      setAvgArticlePrice(data.avg_price || 0);
    } catch (error) {
      console.error("Error fetching average article price:", error);
    }
  };

  const fetchOrderCount = async () => {
    try {
      const hoursQuery = getHoursQuery();
      const url = `${API_URL}/sales/order-count?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&sellers=${selectedSellers.map(s => s.value).join(",")}&sellerCategories=${selectedSellerCategories.map(cat => cat.value).join(",")}&articleNames=${selectedArticleNames.map(a => a.value).join(",")}&categories=${selectedCategories.map(cat => cat.value).join("")}${hoursQuery}`;
      const response = await fetch(url);
      const data = await response.json();
      setOrderCount(data.order_count || 0);
    } catch (error) {
      console.error("Error fetching order count:", error);
    }
  };

  const fetchDailySales = async () => {
    try {
      const hoursQuery = getHoursQuery();
      const url = `${API_URL}/sales/daily-sales?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&sellers=${selectedSellers.map(s => s.value).join(",")}&sellerCategories=${selectedSellerCategories.map(cat => cat.value).join(",")}&articleNames=${selectedArticleNames.map(a => a.value).join(",")}&categories=${selectedCategories.map(cat => cat.value).join("")}${hoursQuery}`;
      const response = await fetch(url);
      const data = await response.json();
      setDailySales(data || []);
    } catch (error) {
      console.error("Error fetching daily sales:", error);
    }
  };

  const fetchSellerCategoriesTotal = async () => {
    try {
      const hoursQuery = getHoursQuery();
      const url = `${API_URL}/sales/seller-categories-total?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&sellers=${selectedSellers.map(s => s.value).join(",")}&sellerCategories=${selectedSellerCategories.map(cat => cat.value).join(",")}&articleNames=${selectedArticleNames.map(a => a.value).join(",")}&categories=${selectedCategories.map(cat => cat.value).join("")}${hoursQuery}`;
      const response = await fetch(url);
      const data = await response.json();
      const formattedData = data.map((item) => ({
        id: item["Seller Category"] || "Unknown",
        label: item["Seller Category"] || "Unknown",
        value: parseFloat(item.total_sales),
      }));
      setPieData(formattedData);
    } catch (error) {
      console.error("Error fetching seller categories total:", error);
    }
  };

  const fetchHourlySales = async () => {
    try {
      const hoursQuery = getHoursQuery();
      const url = `${API_URL}/sales/hourly-sales?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&sellers=${selectedSellers.map(s => s.value).join(",")}&sellerCategories=${selectedSellerCategories.map(cat => cat.value).join(",")}&articleNames=${selectedArticleNames.map(a => a.value).join(",")}&categories=${selectedCategories.map(cat => cat.value).join("")}${hoursQuery}`;
      const res = await fetch(url);
      const data = await res.json();
      setHourlySales(data || []);
    } catch (error) {
      console.error("Error fetching hourly sales:", error);
    }
  };

  // ------------------ FETCH FUNCTIONS FOR DROPDOWN OPTIONS ------------------
  const fetchSellers = async () => {
    try {
      const response = await fetch(`${API_URL}/sales/sellers`);
      const data = await response.json();
      setSellers(data.map((s) => ({ value: s, label: s })));
    } catch (error) {
      console.error("Error fetching sellers:", error);
    }
  };

  const fetchSellerCategoriesOptions = async () => {
    try {
      const response = await fetch(`${API_URL}/sales/seller-categories`);
      const data = await response.json();
      setSellerCategoriesOptions(data.map((cat) => ({ value: cat, label: cat })));
    } catch (error) {
      console.error("Error fetching seller categories:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      let url = `${API_URL}/sales/categories?`;
      const queryParams = [];
      if (startDate && endDate) {
        queryParams.push(`startDate=${startDate.toISOString()}`);
        queryParams.push(`endDate=${endDate.toISOString()}`);
      }
      if (selectedSellers?.length) {
        queryParams.push(`sellers=${selectedSellers.map((s) => s.value).join(",")}`);
      }
      if (selectedSellerCategories?.length) {
        queryParams.push(
          `sellerCategories=${selectedSellerCategories.map((sc) => sc.value).join(",")}`
        );
      }
      if (selectedArticleNames?.length) {
        queryParams.push(
          `articleNames=${selectedArticleNames.map((a) => a.value).join(",")}`
        );
      }
      url += queryParams.join("&");
      const response = await fetch(url);
      const data = await response.json();
      setCategories(data.map((cat) => ({ value: cat, label: cat })));
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchArticleNamesOptions = async () => {
    try {
      let url = `${API_URL}/sales/article-names?`;
      const queryParams = [];
      if (selectedCategories?.length) {
        queryParams.push(
          `categories=${selectedCategories.map((cat) => cat.value).join(",")}`
        );
      }
      if (selectedSellers?.length) {
        queryParams.push(
          `sellers=${selectedSellers.map((s) => s.value).join(",")}`
        );
      }
      if (selectedSellerCategories?.length) {
        queryParams.push(
          `sellerCategories=${selectedSellerCategories.map((sc) => sc.value).join(",")}`
        );
      }
      if (startDate && endDate) {
        queryParams.push(`startDate=${startDate.toISOString()}`);
        queryParams.push(`endDate=${endDate.toISOString()}`);
      }
      url += queryParams.join("&");
      const response = await fetch(url);
      const data = await response.json();
      setArticleNamesOptions(
        data.map((article) => ({ value: article, label: article }))
      );
    } catch (error) {
      console.error("Error fetching article names:", error);
    }
  };

  // ---------------------------------------------------------------------------
  // USE EFFECTS: Fetch data on mount and whenever filters change.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    fetchSellers();
    fetchSellerCategoriesOptions();
    fetchCategories();
    fetchArticleNamesOptions();
  }, []);

  useEffect(() => {
    fetchTotalSales();
    fetchTotalQuantity();
    fetchAvgArticlePrice();
    fetchOrderCount();
    fetchDailySales();
    fetchSellerCategoriesTotal();
    fetchHourlySales();
    fetchCategoryTotals();
    fetchAvgOrderValue();
  }, [
    startDate,
    endDate,
    selectedSellers,
    selectedSellerCategories,
    selectedArticleNames,
    selectedCategories,
    selectedHours, // include hours filter dependency
  ]);

  // ---------------------------------------------------------------------------
  // CUSTOM STYLES: Inject custom DatePicker styles for dark theme
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .react-datepicker__input-container input {
        background-color: #2D3748 !important;
        color: #FFF !important;
        border: 1px solid #4A5568 !important;
        padding: 8px;
        border-radius: 5px;
        font-weight: bold;
      }
      .react-datepicker {
        background-color: #2D3748 !important;
        color: #FFF !important;
      }
      .react-datepicker__day-name,
      .react-datepicker__day,
      .react-datepicker__time-name {
        color: #FFF !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // DATA TRANSFORMATION: Prepare chart data for Daily Sales and Hourly Sales.
  // ---------------------------------------------------------------------------
  const barData = (dailySales || [])
    .filter((item) => item && item.date && item.total !== undefined)
    .map((item) => ({
      date: item.date,
      total: Number(item.total),
    }));

  const hourlyChartData = [];
  for (let h = 0; h < 24; h++) {
    const hourObj = hourlySales.find((d) => parseInt(d.hour, 10) === h);
    hourlyChartData.push({
      hour: h.toString().padStart(2, "0"),
      total: hourObj ? parseFloat(hourObj.total_sales) : 0,
    });
  }

  // ---------------------------------------------------------------------------
  // RENDER: Return the complete Dashboard UI.
  // ---------------------------------------------------------------------------
  return (
    <Box minH="100vh" p={4} color="gray.100">
      <Heading mb={6} textAlign="center" fontWeight="bold">
        {/* Dashboard Title */}
      </Heading>

      {/* Render Filters */}
      <Filters
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        sellers={sellers}
        selectedSellers={selectedSellers}
        setSelectedSellers={setSelectedSellers}
        sellerCategoriesOptions={sellerCategoriesOptions}
        selectedSellerCategories={selectedSellerCategories}
        setSelectedSellerCategories={setSelectedSellerCategories}
        selectedHours={selectedHours}
        setSelectedHours={setSelectedHours}
        hoursOptions={hoursOptions}
        selectStyles={selectStyles}
      />

      {/* Render Metrics Card */}
      <MetricsCard
        totalSales={totalSales}
        totalQuantity={totalQuantity}
        avgArticlePrice={avgArticlePrice}
        orderCount={orderCount}
        barData={barData}
      />

      {/* Render Seller Categories Chart */}
      <SellerCategoriesChart pieData={pieData} />

      {/* Render Hourly Sales Chart */}
      <HourlySalesChart data={hourlyChartData} />


      <CategoryTreemap data={categoryTreemapData} />

      <AvgOrderValueChart data={avgOrderValueData} />


    </Box>
  );
};

export default Home;
