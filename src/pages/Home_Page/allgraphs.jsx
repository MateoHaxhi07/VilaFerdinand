/* allgraphs.jsx */
import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Heading,
  Flex,
  Divider,
  Select,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  Button,
  Spinner,
  VStack,
  useBreakpointValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Tfoot,
  Td,
  TableContainer,
  Card,
  CardBody,
} from "@chakra-ui/react";
import { TriangleUpIcon, TriangleDownIcon } from "@chakra-ui/icons";
import ReactEcharts from "echarts-for-react";
import moment from "moment-timezone";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate, useOutletContext } from "react-router-dom";

// 1) Import the default ComparisonChart component from ComparisonChart.jsx
import ComparisonChart from "./ComparisonChart.jsx"; // Adjust path if needed

import Papa from "papaparse";
import { saveAs } from "file-saver";
import { scaleOrdinal } from "d3-scale";
import { schemeSet3 } from "d3-scale-chromatic";

/* ----------------------------------------------------------
   1) EChartSellerCategories (Pie Chart)
---------------------------------------------------------- */
export function EChartSellerCategories({ pieData }) {
  const transformedData = pieData.map((item) => ({
    name: item.label === "NaN" ? "Elona" : item.label,
    value: item.value,
  }));

  const option = {
    tooltip: {
      trigger: "item",
      formatter: (params) =>
        `${params.name}: ${params.value.toLocaleString()} ALL (${params.percent}%)`,
    },
    legend: {
      orient: "horizontal",
      bottom: 10,
      textStyle: { color: "#666" },
    },
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        center: ["50%", "45%"],
        data: transformedData,
        label: {
          formatter: "{d}%",
          fontSize: 14,
          fontWeight: "bold",
        },
        itemStyle: {
          borderRadius: 6,
          borderColor: "#fff",
          borderWidth: 2,
        },
      },
    ],
  };

  return (
    <Box w="100%" h="100%">
      <ReactEcharts option={option} style={{ width: "100%", height: "100%" }} />
    </Box>
  );
}

/* ----------------------------------------------------------
   1B) CategoryTreemap (Funnel Chart for Sub-Categories)
---------------------------------------------------------- */
export function CategoryTreemap({ data }) {
  const navigate = useNavigate();

  const sortedData = [...data].sort(
    (a, b) => parseFloat(b.total_price) - parseFloat(a.total_price)
  );
  const top10Data = sortedData.slice(0, 10);
  const funnelData = top10Data.map((item) => ({
    name: item.Category,
    value: parseFloat(item.total_price),
  }));

  const option = {
    tooltip: {
      trigger: "item",
      formatter: (params) => {
        const { name, value, percent } = params;
        return `${name}: ${value.toLocaleString()} ALL (${percent}%)`;
      },
    },
    legend: { show: false },
    toolbox: { feature: { saveAsImage: {} } },
    series: [
      {
        type: "funnel",
        left: "5%",
        top: 20,
        bottom: 20,
        width: "90%",
        min: 0,
        max: funnelData[0]?.value || 100,
        sort: "descending",
        gap: 2,
        label: { show: false },
        labelLine: { show: false },
        itemStyle: {
          borderColor: "#fff",
          borderWidth: 1,
        },
        emphasis: { label: { fontSize: 18 } },
        data: funnelData,
      },
    ],
  };

  return (
    <Box
      w="100%"
      h="100%"
      onClick={() => navigate("/full-funnel")}
      cursor="pointer"
    >
      <ReactEcharts option={option} style={{ width: "100%", height: "100%" }} />
    </Box>
  );
}

/* ----------------------------------------------------------
   2) FullFunnelChart (Full Page funnel, e.g. /full-funnel route)
---------------------------------------------------------- */
export function FullFunnelChart({ data }) {
  const sortedData = [...data].sort(
    (a, b) => parseFloat(b.total_price) - parseFloat(a.total_price)
  );
  const top10Data = sortedData.slice(0, 10);
  const funnelData = top10Data.map((item) => ({
    name: item.Category,
    value: parseFloat(item.total_price),
  }));

  const option = {
    tooltip: {
      trigger: "item",
      formatter: (params) => {
        const { name, value, percent } = params;
        return `${name}: ${value.toLocaleString()} ALL (${percent}%)`;
      },
    },
    legend: { show: false },
    toolbox: { feature: { saveAsImage: {} } },
    series: [
      {
        type: "funnel",
        left: "5%",
        top: 20,
        bottom: 20,
        width: "90%",
        min: 0,
        max: funnelData[0]?.value || 100,
        sort: "descending",
        gap: 2,
        label: { show: false },
        labelLine: { show: false },
        itemStyle: {
          borderColor: "#fff",
          borderWidth: 1,
        },
        emphasis: { label: { fontSize: 18 } },
        data: funnelData,
      },
    ],
  };

  return (
    <Box w="100vw" h="100vh">
      <ReactEcharts option={option} style={{ width: "100%", height: "100%" }} />
    </Box>
  );
}

/* ----------------------------------------------------------
   3) AllGraphs (Main Dashboard layout)
---------------------------------------------------------- */
export function AllGraphs(props) {
  // Pull out props
  const {
    totalSales,
    orderCount,
    barData,
    barViewMode,
    setBarViewMode,
    pieData,
    categoryTreemapData,
    startDate,
    endDate,
    selectedSellers,
    selectedSellerCategories,
    selectedArticleNames,
    selectedCategories,
    selectedHours,
  } = props;

  // Build the main line chart (daily or monthly)
  const categories = barData.map((item) => item.date);
  const seriesData = barData.map((item) => item.total);

  // Calculate average for highlight
  const averageValue =
    seriesData.reduce((acc, cur) => acc + cur, 0) / (seriesData.length || 1);

  let minDiff = Infinity;
  let closestIndex = 0;
  for (let i = 0; i < seriesData.length; i++) {
    const diff = Math.abs(seriesData[i] - averageValue);
    if (diff < minDiff) {
      minDiff = diff;
      closestIndex = i;
    }
  }

  const lineChartOption = {
    xAxis: { type: "category", boundaryGap: false, data: categories },
    yAxis: { type: "value", boundaryGap: [0, "30%"] },
    series: [
      {
        type: "line",
        smooth: 0.6,
        symbol: "none",
        lineStyle: { color: "#5470C6", width: 5 },
        markArea: {
          itemStyle: { color: "rgba(255, 0, 0, 0.3)" },
          data: [[{ xAxis: closestIndex - 0.4 }, { xAxis: closestIndex + 0.4 }]],
        },
        markLine: {
          symbol: "none",
          lineStyle: { color: "#999", type: "dashed" },
          label: { formatter: " {c}", position: "end" },
          data: [{ yAxis: averageValue }],
        },
        data: seriesData,
      },
    ],
    tooltip: {
      trigger: "axis",
      formatter: (params) => {
        const point = params[0];
        const dateLabel = point.axisValue;
        const val = point.data;
        return `<strong>${dateLabel}</strong><br/>Total Sales: ${val.toLocaleString()} ALL`;
      },
    },
  };

  const navigate = useNavigate();

  return (
    <Box bg="white" p={6} minH="100vh">
      <Box bg="white" borderRadius="md" boxShadow="lg" p={6} maxW="100%" mx="auto">
        {/* Main Heading */}
        <Box mb={6}>
          <Heading as="h2" size="lg" color="gray.800" mb={1}>
            Ecommerce Dashboard
          </Heading>
          <Text color="gray.500" fontWeight="semibold">
            Here’s what’s going on at your business right now
          </Text>
        </Box>

        {/* MAIN GRID: Left Column (stats + line chart), Right Column (pie + funnel) */}
        <Grid templateColumns={{ base: "1fr", md: "2fr 1fr" }} gap={4}>
          {/* LEFT COLUMN */}
          <Box>
            {/* TOP ROW: 2 Stats */}
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4} mb={4}>
              {/* TOTAL SALES */}
              <Box
                p={4}
                bg="gray.50"
                borderRadius="md"
                boxShadow="sm"
                _hover={{ boxShadow: "md" }}
              >
                <Stat>
                  <StatLabel fontWeight="bold" color="gray.600">
                    Total Sales
                  </StatLabel>
                  <StatNumber fontSize="2xl" fontWeight="bold" color="blue.600">
                    {Number(totalSales).toLocaleString()} ALL
                  </StatNumber>
                  <Text fontSize="sm" color="gray.400">
                    Shitjet totale
                  </Text>
                </Stat>
              </Box>

              {/* TOTAL ORDERS */}
              <Box
                p={4}
                bg="gray.50"
                borderRadius="md"
                boxShadow="sm"
                _hover={{ boxShadow: "md" }}
              >
                <Stat>
                  <StatLabel fontWeight="bold" color="gray.600">
                    Porosite
                  </StatLabel>
                  <StatNumber fontSize="2xl" fontWeight="bold" color="purple.600">
                    {Number(orderCount).toLocaleString()}
                  </StatNumber>
                  <Text fontSize="sm" color="gray.400">
                    Porosite totale
                  </Text>
                </Stat>
              </Box>
            </Grid>

            <Divider borderColor="gray.700" mb={4} />

            {/* ECharts line chart */}
            <Box>
              {/* "Total Sales" header & dropdown */}
              <Flex
                justifyContent="space-between"
                alignItems={{ base: "flex-start", md: "center" }}
                mb={4}
                flexDirection={{ base: "column", md: "row" }}
                gap={4}
              >
                <Box>
                  <Heading as="h3" size="md" mb={1}>
                    Total Sales
                  </Heading>
                  <Text fontSize="sm" color="gray.500" mb={0}>
                    Payment received across all channels
                  </Text>
                </Box>
                <Box>
                  <Select
                    size="sm"
                    w="200px"
                    onChange={(e) => setBarViewMode(e.target.value)}
                    value={barViewMode}
                  >
                    <option value="daily">Daily View</option>
                    <option value="monthly">Monthly View</option>
                  </Select>
                </Box>
              </Flex>

              <Box height="316px">
                <ReactEcharts
                  option={lineChartOption}
                  notMerge
                  lazyUpdate
                  style={{ width: "100%", height: "100%" }}
                />
              </Box>
            </Box>
          </Box>

          {/* RIGHT COLUMN: Pie & Funnel */}
          <Grid templateRows="1fr 1fr" gap={4}>
            <Box
              p={4}
              bg="gray.50"
              borderRadius="md"
              boxShadow="sm"
              position="relative"
              minH="220px"
            >
              <Heading as="h5" size="sm" mb={2}>
                Categories
              </Heading>
              <Box position="absolute" top="60px" left="0" right="0" bottom="0">
                <EChartSellerCategories pieData={pieData} />
              </Box>
            </Box>

            <Box
              p={4}
              bg="gray.50"
              borderRadius="md"
              boxShadow="sm"
              position="relative"
              minH="220px"
            >
              <Heading as="h5" size="sm" mb={2}>
                Sub-Categories
              </Heading>
              <Box position="absolute" top="60px" left="0" right="0" bottom="0">
                <CategoryTreemap data={categoryTreemapData} />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* ComparisonChart: Show year-over-year (daily) comparison */}
      <Box mt={6}>
      <Heading as="h3" size="md" mb={2}>
        Year-over-Year Comparison
      </Heading>
      <Text fontSize="sm" color="gray.500">
        Compare this year’s daily sales vs. last year
      </Text>
      <ComparisonChart
  startDate={startDate}
  endDate={endDate}
  apiUrl={process.env.REACT_APP_API_URL}
  selectedSellers={selectedSellers}
  selectedSellerCategories={selectedSellerCategories}
  selectedArticleNames={selectedArticleNames}
  selectedCategories={selectedCategories}
  selectedHours={selectedHours}
/>
    </Box>

      {/* SECOND BIG CARD: Left => Top 7 RENDITURA, Right => Top 7 SHITJET ANALITIKE */}
      <Box mt={6}>
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
          {/* Left: RendituraCardTop7 */}
          <Box>
            <RendituraCardTop7 />
          </Box>

          {/* Right: ShitjetAnalitikeCardTop7 */}
          <Box>
            <ShitjetAnalitikeCardTop7 />
          </Box>
        </Grid>
      </Box>
    </Box>
  );
}

/* ----------------------------------------------------------
   4) RendituraCardTop7 (Top 7 preview with sorting icons)
---------------------------------------------------------- */
export function RendituraCardTop7() {
  const navigate = useNavigate();
  const {
    startDate,
    endDate,
    selectedSellers,
    selectedSellerCategories,
    selectedArticleNames,
    selectedCategories,
    selectedHours,
    showFilters,
  } = useOutletContext();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sorting state
  const [sortConfig, setSortConfig] = useState({
    key: "total_price",
    direction: "desc",
  });

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchTop7();
    // eslint-disable-next-line
  }, [
    startDate,
    endDate,
    selectedSellers,
    selectedSellerCategories,
    selectedArticleNames,
    selectedCategories,
    selectedHours,
  ]);

  function toDateString(d) {
    return d ? moment(d).format("YYYY-MM-DD") : "";
  }

  function buildHoursQuery() {
    if (!selectedHours || selectedHours.length === 0) return "";
    return `&hours=${selectedHours.map((h) => h.value).join(",")}`;
  }

  async function fetchTop7() {
    try {
      if (!startDate || !endDate) {
        setLoading(false);
        return;
      }
      setLoading(true);

      const startStr = toDateString(startDate);
      const endStr = toDateString(endDate);

      let url = `${API_URL}/sales/most-sold-items-by-price?limit=1000&offset=0`;
      url += `&startDate=${startStr}&endDate=${endStr}`;

      if (selectedSellers?.length) {
        url += `&sellers=${selectedSellers.map((s) => s.value).join(",")}`;
      }
      if (selectedSellerCategories?.length) {
        url += `&sellerCategories=${selectedSellerCategories
          .map((cat) => cat.value)
          .join(",")}`;
      }
      if (selectedArticleNames?.length) {
        url += `&articleNames=${selectedArticleNames
          .map((a) => a.value)
          .join(",")}`;
      }
      if (selectedCategories?.length) {
        url += `&categories=${selectedCategories
          .map((c) => c.value)
          .join(",")}`;
      }
      url += buildHoursQuery();

      const resp = await fetch(url);
      if (!resp.ok) {
        throw new Error(`Fetch error: ${resp.statusText}`);
      }
      const result = await resp.json();
      const fullData = Array.isArray(result) ? result : result.data;

      // Default sort: descending by total_price
      const sorted = [...fullData].sort(
        (a, b) => parseFloat(b.total_price) - parseFloat(a.total_price)
      );

      setData(sorted.slice(0, 7));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching top7 data:", error);
      setLoading(false);
    }
  }

  // Sorting helper
  const handleSort = (columnKey) => {
    setSortConfig((prev) => {
      if (prev.key === columnKey) {
        return {
          key: columnKey,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key: columnKey, direction: "asc" };
    });
  };

  function getSortIcon(columnKey) {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === "asc" ? (
      <TriangleUpIcon ml={1} />
    ) : (
      <TriangleDownIcon ml={1} />
    );
  }

  const getSortedData = () => {
    if (!data || data.length === 0) return [];
    const sorted = [...data];
    const { key, direction } = sortConfig;

    sorted.sort((a, b) => {
      let aVal, bVal;
      switch (key) {
        case "rank":
          return 0;
        case "Article_Name":
          aVal = a.Article_Name?.toLowerCase() || "";
          bVal = b.Article_Name?.toLowerCase() || "";
          return direction === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        case "total_quantity":
          aVal = parseFloat(a.total_quantity) || 0;
          bVal = parseFloat(b.total_quantity) || 0;
          return direction === "asc" ? aVal - bVal : bVal - aVal;
        case "total_price":
          aVal = parseFloat(a.total_price) || 0;
          bVal = parseFloat(b.total_price) || 0;
          return direction === "asc" ? aVal - bVal : bVal - aVal;
        default:
          return 0;
      }
    });
    return sorted;
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="100px">
        <Spinner size="lg" />
      </Flex>
    );
  }

  if (!data || data.length === 0) {
    return <Text>No data available for that date range.</Text>;
  }

  const sortedData = getSortedData();

  return (
    <>
      <Heading size="md" mb={4}>
        Shitjet Renditura
      </Heading>
      <Box
        overflowX="auto"
        borderWidth="1px"
        borderRadius="md"
        boxShadow="sm"
        p={4}
        bg="gray.50"
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#EDF2F7", textAlign: "left" }}>
              <th
                style={{ padding: "8px", cursor: "pointer" }}
                onClick={() => handleSort("rank")}
              >
                Rank {getSortIcon("rank")}
              </th>
              <th
                style={{ padding: "8px", cursor: "pointer" }}
                onClick={() => handleSort("Article_Name")}
              >
                Article {getSortIcon("Article_Name")}
              </th>
              <th
                style={{ padding: "8px", cursor: "pointer" }}
                onClick={() => handleSort("total_quantity")}
              >
                Quantity Sold {getSortIcon("total_quantity")}
              </th>
              <th
                style={{ padding: "8px", cursor: "pointer" }}
                onClick={() => handleSort("total_price")}
              >
                Total Price (ALL) {getSortIcon("total_price")}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid #E2E8F0" }}>
                <td style={{ padding: "8px" }}>{idx + 1}</td>
                <td style={{ padding: "8px" }}>{row.Article_Name}</td>
                <td style={{ padding: "8px" }}>{row.total_quantity}</td>
                <td style={{ padding: "8px" }}>
                  {Number(row.total_price).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>

      <Flex justify="end" mt={4}>
        <Button colorScheme="blue" onClick={() => navigate("/renditura-full")}>
          See More Details
        </Button>
      </Flex>
    </>
  );
}

/* ----------------------------------------------------------
   5) ShitjetAnalitikeCardTop7 (Top 7 preview with sorting icons)
---------------------------------------------------------- */
export function ShitjetAnalitikeCardTop7() {
  const navigate = useNavigate();
  const {
    startDate,
    endDate,
    selectedSellers,
    selectedSellerCategories,
    selectedArticleNames,
    selectedCategories,
    selectedHours,
  } = useOutletContext();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sorting state
  const [sortConfig, setSortConfig] = useState({
    key: "Total_Article_Price",
    direction: "desc",
  });

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchTop7Analitike();
    // eslint-disable-next-line
  }, [
    startDate,
    endDate,
    selectedSellers,
    selectedSellerCategories,
    selectedArticleNames,
    selectedCategories,
    selectedHours,
  ]);

  function buildHoursQuery() {
    if (!selectedHours || selectedHours.length === 0) return "";
    return `&hours=${selectedHours.map((h) => h.value).join(",")}`;
  }

  async function fetchTop7Analitike() {
    if (!startDate || !endDate) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const startStr = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate(),
      0,
      0,
      0
    ).toISOString();
    const endStr = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate(),
      23,
      59,
      59
    ).toISOString();

    let url = `${API_URL}/sales/all-data?limit=9999&offset=0`;
    url += `&startDate=${startStr}&endDate=${endStr}`;

    if (selectedSellers?.length) {
      url += `&sellers=${selectedSellers.map((s) => s.value).join(",")}`;
    }
    if (selectedSellerCategories?.length) {
      url += `&sellerCategories=${selectedSellerCategories
        .map((cat) => cat.value)
        .join(",")}`;
    }
    if (selectedArticleNames?.length) {
      url += `&articleNames=${selectedArticleNames.map((a) => a.value).join(",")}`;
    }
    if (selectedCategories?.length) {
      url += `&categories=${selectedCategories.map((c) => c.value).join(",")}`;
    }
    url += buildHoursQuery();

    try {
      const resp = await fetch(url);
      const result = await resp.json();
      const fetchedData = Array.isArray(result) ? result : [];

      // Sort by "Total_Article_Price" descending by default
      const sorted = fetchedData
        .map((item) => {
          const priceNum = Number(item.Total_Article_Price ?? 0);
          return { ...item, _priceNum: priceNum };
        })
        .sort((a, b) => b._priceNum - a._priceNum);

      setData(sorted.slice(0, 7));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching Shitjet Analitike top 7:", error);
      setLoading(false);
    }
  }

  const handleSort = (columnKey) => {
    setSortConfig((prev) => {
      if (prev.key === columnKey) {
        return {
          key: columnKey,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key: columnKey, direction: "asc" };
    });
  };

  function getSortIcon(columnKey) {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === "asc" ? (
      <TriangleUpIcon ml={1} />
    ) : (
      <TriangleDownIcon ml={1} />
    );
  }

  const getSortedData = () => {
    if (!data || data.length === 0) return [];
    const sorted = [...data];
    const { key, direction } = sortConfig;

    sorted.sort((a, b) => {
      let aVal, bVal;
      switch (key) {
        case "rank":
          return 0;
        case "Seller":
          aVal = a.Seller?.toLowerCase() || "";
          bVal = b.Seller?.toLowerCase() || "";
          return direction === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        case "Article_Name":
          aVal = a.Article_Name?.toLowerCase() || "";
          bVal = b.Article_Name?.toLowerCase() || "";
          return direction === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        case "Quantity":
          aVal = parseFloat(a.Quantity) || 0;
          bVal = parseFloat(b.Quantity) || 0;
          return direction === "asc" ? aVal - bVal : bVal - aVal;
        case "Total_Article_Price":
          aVal = parseFloat(a.Total_Article_Price) || 0;
          bVal = parseFloat(b.Total_Article_Price) || 0;
          return direction === "asc" ? aVal - bVal : bVal - aVal;
        case "Datetime":
          aVal = moment.utc(a.Datetime).valueOf();
          bVal = moment.utc(b.Datetime).valueOf();
          return direction === "asc" ? aVal - bVal : bVal - aVal;
        default:
          return 0;
      }
    });
    return sorted;
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="100px">
        <Spinner size="lg" />
      </Flex>
    );
  }
  if (!data || data.length === 0) {
    return <Text>No Shitjet Analitike data found.</Text>;
  }

  const sortedData = getSortedData();

  return (
    <>
      <Heading size="md" mb={4}>
        Shitjet Analitike
      </Heading>
      <Box
        overflowX="auto"
        borderWidth="1px"
        borderRadius="md"
        boxShadow="sm"
        p={4}
        bg="gray.50"
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#EDF2F7", textAlign: "left" }}>
              <th
                style={{ padding: "8px", cursor: "pointer" }}
                onClick={() => handleSort("rank")}
              >
                Rank {getSortIcon("rank")}
              </th>
              <th
                style={{ padding: "8px", cursor: "pointer" }}
                onClick={() => handleSort("Seller")}
              >
                Seller {getSortIcon("Seller")}
              </th>
              <th
                style={{ padding: "8px", cursor: "pointer" }}
                onClick={() => handleSort("Article_Name")}
              >
                Article {getSortIcon("Article_Name")}
              </th>
              <th
                style={{ padding: "8px", cursor: "pointer" }}
                onClick={() => handleSort("Quantity")}
              >
                Quantity {getSortIcon("Quantity")}
              </th>
              <th
                style={{ padding: "8px", cursor: "pointer" }}
                onClick={() => handleSort("Total_Article_Price")}
              >
                Sales (ALL) {getSortIcon("Total_Article_Price")}
              </th>
              <th
                style={{ padding: "8px", cursor: "pointer" }}
                onClick={() => handleSort("Datetime")}
              >
                Datetime {getSortIcon("Datetime")}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid #E2E8F0" }}>
                <td style={{ padding: "8px" }}>{idx + 1}</td>
                <td style={{ padding: "8px" }}>{row.Seller}</td>
                <td style={{ padding: "8px" }}>{row.Article_Name}</td>
                <td style={{ padding: "8px" }}>{row.Quantity}</td>
                <td style={{ padding: "8px" }}>
                  {Number(row.Total_Article_Price ?? 0).toLocaleString()}
                </td>
                <td style={{ padding: "8px" }}>
                  {moment
                    .utc(row.Datetime)
                    .subtract(1, "hours")
                    .tz("Europe/Tirane")
                    .format("YYYY-MM-DD HH:mm")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>

      <Flex justify="end" mt={4}>
        <Button colorScheme="blue" onClick={() => navigate("/shitjet-analitike-full")}>
          See More Details
        </Button>
      </Flex>
    </>
  );
}

/* ----------------------------------------------------------
   6) ShitjetAnalitikeFullPage (full table w/ filters + sorting + pagination)
---------------------------------------------------------- */
export function ShitjetAnalitikeFullPage() {
  const {
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
    categories,
    selectedCategories,
    setSelectedCategories,
    articleNamesOptions,
    selectedArticleNames,
    setSelectedArticleNames,
    hoursOptions,
    selectedHours,
    setSelectedHours,
    showFilters,
  } = useOutletContext();

  const [data, setData] = useState([]);
  const [limit, setLimit] = useState(50);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);

  const [sortConfig, setSortConfig] = useState({
    key: "Total_Article_Price",
    direction: "desc",
  });

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    setOffset(0);
  }, [
    startDate,
    endDate,
    selectedSellers,
    selectedSellerCategories,
    selectedArticleNames,
    selectedCategories,
    selectedHours,
  ]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [
    limit,
    offset,
    startDate,
    endDate,
    selectedSellers,
    selectedSellerCategories,
    selectedArticleNames,
    selectedCategories,
    selectedHours,
  ]);

  function buildHoursQuery() {
    if (!selectedHours || selectedHours.length === 0) return "";
    return `&hours=${selectedHours.map((h) => h.value).join(",")}`;
  }

  async function fetchData() {
    if (!startDate || !endDate) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const startStr = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate(),
      0,
      0,
      0
    ).toISOString();
    const endStr = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate(),
      23,
      59,
      59
    ).toISOString();

    let url = `${API_URL}/sales/all-data?limit=${limit}&offset=${offset}`;
    url += `&startDate=${startStr}&endDate=${endStr}`;

    if (selectedSellers?.length) {
      url += `&sellers=${selectedSellers.map((s) => s.value).join(",")}`;
    }
    if (selectedSellerCategories?.length) {
      url += `&sellerCategories=${selectedSellerCategories
        .map((sc) => sc.value)
        .join(",")}`;
    }
    if (selectedArticleNames?.length) {
      url += `&articleNames=${selectedArticleNames
        .map((a) => a.value)
        .join(",")}`;
    }
    if (selectedCategories?.length) {
      url += `&categories=${selectedCategories.map((c) => c.value).join(",")}`;
    }
    url += buildHoursQuery();

    try {
      const resp = await fetch(url);
      const result = await resp.json();
      setData(Array.isArray(result) ? result : []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching Shitjet Analitike full data:", error);
      setLoading(false);
    }
  }

  function handleLoadMore() {
    setOffset((prev) => prev + limit);
  }
  function handleLoadLess() {
    setOffset((prev) => Math.max(0, prev - limit));
  }
  function handleLimitChange(e) {
    setLimit(parseInt(e.target.value, 10));
    setOffset(0);
  }

  const handleSort = (columnKey) => {
    setSortConfig((prev) => {
      if (prev.key === columnKey) {
        return {
          key: columnKey,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key: columnKey, direction: "asc" };
    });
  };
  function getSortIcon(columnKey) {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === "asc" ? (
      <TriangleUpIcon ml={1} />
    ) : (
      <TriangleDownIcon ml={1} />
    );
  }

  const getSortedData = () => {
    if (!data || data.length === 0) return [];
    const sorted = [...data];
    const { key, direction } = sortConfig;

    sorted.sort((a, b) => {
      let aVal, bVal;
      switch (key) {
        case "Seller":
          aVal = a.Seller?.toLowerCase() || "";
          bVal = b.Seller?.toLowerCase() || "";
          return direction === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        case "Article_Name":
          aVal = a.Article_Name?.toLowerCase() || "";
          bVal = b.Article_Name?.toLowerCase() || "";
          return direction === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        case "Quantity":
          aVal = parseFloat(a.Quantity) || 0;
          bVal = parseFloat(b.Quantity) || 0;
          return direction === "asc" ? aVal - bVal : bVal - aVal;
        case "Total_Article_Price":
          aVal = parseFloat(a.Total_Article_Price) || 0;
          bVal = parseFloat(b.Total_Article_Price) || 0;
          return direction === "asc" ? aVal - bVal : bVal - aVal;
        case "Datetime":
          aVal = moment.utc(a.Datetime).valueOf();
          bVal = moment.utc(b.Datetime).valueOf();
          return direction === "asc" ? aVal - bVal : bVal - aVal;
        default:
          return 0;
      }
    });
    return sorted;
  };

  const totalQuantity = data.reduce(
    (sum, row) => sum + Number(row.Quantity ?? 0),
    0
  );
  const totalSales = data.reduce(
    (sum, row) => sum + Number(row.Total_Article_Price ?? 0),
    0
  );

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="200px" position="relative" zIndex="1">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box p={4} position="relative" zIndex="1">
        {/* No data message or your custom layout */}
      </Box>
    );
  }

  const sortedData = getSortedData();

  return (
    <Box p={4} minH="100vh" position="relative" zIndex="1">
      {/* If showFilters => render the Filters overlay at top */}
      {showFilters && (
        <Box position="absolute" zIndex="5" top="0" left="0" right="0">
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
            categories={categories}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            articleNamesOptions={articleNamesOptions}
            selectedArticleNames={selectedArticleNames}
            setSelectedArticleNames={setSelectedArticleNames}
            hoursOptions={hoursOptions}
            selectedHours={selectedHours}
            setSelectedHours={setSelectedHours}
            selectStyles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
          />
        </Box>
      )}

      <Heading mb={4} mt={showFilters ? "320px" : "0"}></Heading>

      {isMobile ? (
        // MOBILE LIST
        <VStack spacing={4} align="stretch">
          {sortedData.map((row, idx) => (
            <Box
              key={idx}
              borderWidth="1px"
              borderRadius="md"
              p={4}
              bg="gray.50"
              boxShadow="sm"
            >
              <Text>
                <strong>Seller:</strong> {row.Seller}
              </Text>
              <Text>
                <strong>Article:</strong> {row.Article_Name}
              </Text>
              <Text>
                <strong>Quantity:</strong> {row.Quantity}
              </Text>
              <Text>
                <strong>Price:</strong> {row.Total_Article_Price}
              </Text>
              <Text>
                <strong>Datetime:</strong>{" "}
                {moment
                  .utc(row.Datetime)
                  .subtract(1, "hours")
                  .tz("Europe/Tirane")
                  .format("YYYY-MM-DD HH:mm")}
              </Text>
            </Box>
          ))}

          {/* Totals at bottom */}
          <Box borderTop="1px solid #ccc" pt={2} mt={4}>
            <Flex justifyContent="space-between">
              <Text fontWeight="bold">TOTAL Quantity:</Text>
              <Text fontWeight="bold">{totalQuantity}</Text>
            </Flex>
            <Flex justifyContent="space-between">
              <Text fontWeight="bold">TOTAL Sales:</Text>
              <Text fontWeight="bold">{totalSales}</Text>
            </Flex>
          </Box>
        </VStack>
      ) : (
        // DESKTOP TABLE
        <TableContainer mt={4}>
          <Table variant="striped" colorScheme="gray">
            <Thead>
              <Tr>
                <Th
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSort("Seller")}
                >
                  Seller {getSortIcon("Seller")}
                </Th>
                <Th
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSort("Article_Name")}
                >
                  Article {getSortIcon("Article_Name")}
                </Th>
                <Th
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSort("Quantity")}
                >
                  Quantity {getSortIcon("Quantity")}
                </Th>
                <Th
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSort("Total_Article_Price")}
                >
                  Sales {getSortIcon("Total_Article_Price")}
                </Th>
                <Th
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSort("Datetime")}
                >
                  Datetime {getSortIcon("Datetime")}
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {sortedData.map((row, idx) => (
                <Tr key={idx}>
                  <Td>{row.Seller}</Td>
                  <Td>{row.Article_Name}</Td>
                  <Td>{row.Quantity}</Td>
                  <Td>{row.Total_Article_Price}</Td>
                  <Td>
                    {moment
                      .utc(row.Datetime)
                      .subtract(1, "hours")
                      .tz("Europe/Tirane")
                      .format("YYYY-MM-DD HH:mm")}
                  </Td>
                </Tr>
              ))}
            </Tbody>
            <Tfoot>
              <Tr>
                <Th>TOTAL</Th>
                <Th />
                <Th>{totalQuantity}</Th>
                <Th>{totalSales}</Th>
                <Th />
              </Tr>
            </Tfoot>
          </Table>
        </TableContainer>
      )}

      {/* Pagination Controls */}
      <Flex
        mt={6}
        justifyContent="space-between"
        alignItems="center"
        width="100%"
        maxW="800px"
        mx="auto"
      >
        <Button onClick={handleLoadLess} isDisabled={offset === 0}>
          Previous
        </Button>
        <Select width="150px" value={limit} onChange={handleLimitChange}>
          <option value={50}>50 rows</option>
          <option value={200}>200 rows</option>
          <option value={500}>500 rows</option>
        </Select>
        <Button onClick={handleLoadMore} isDisabled={sortedData.length < limit}>
          Next
        </Button>
      </Flex>
    </Box>
  );
}

/* ----------------------------------------------------------
   7) Optional placeholder card
---------------------------------------------------------- */
export function MetricsCard({
  totalSales,
  totalQuantity,
  avgArticlePrice,
  orderCount,
  barData,
  barViewMode,
  setBarViewMode,
}) {
  return (
    <Box mb={6} boxShadow="lg" p={4} borderRadius="md" bg="white">
      <Text>MetricsCard placeholder</Text>
    </Box>
  );
}

/* ----------------------------------------------------------
   8) RendituraFullPage (full table w/ filters + sorting + pagination)
---------------------------------------------------------- */
export function RendituraFullPage() {
  const {
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
    categories,
    selectedCategories,
    setSelectedCategories,
    articleNamesOptions,
    selectedArticleNames,
    setSelectedArticleNames,
    hoursOptions,
    selectedHours,
    setSelectedHours,
    showFilters,
  } = useOutletContext();

  const [data, setData] = useState([]);
  const [limit, setLimit] = useState(50);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);

  const [sortConfig, setSortConfig] = useState({
    key: "total_price",
    direction: "desc",
  });

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    setOffset(0);
  }, [
    startDate,
    endDate,
    selectedSellers,
    selectedSellerCategories,
    selectedArticleNames,
    selectedCategories,
    selectedHours,
  ]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [
    limit,
    offset,
    startDate,
    endDate,
    selectedSellers,
    selectedSellerCategories,
    selectedArticleNames,
    selectedCategories,
    selectedHours,
  ]);

  function buildHoursQuery() {
    if (!selectedHours || selectedHours.length === 0) return "";
    return `&hours=${selectedHours.map((h) => h.value).join(",")}`;
  }

  function toDateString(d) {
    return d ? moment(d).format("YYYY-MM-DD") : "";
  }

  async function fetchData() {
    if (!startDate || !endDate) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const startStr = toDateString(startDate);
    const endStr = toDateString(endDate);

    let url = `${API_URL}/sales/most-sold-items-by-price?limit=${limit}&offset=${offset}`;
    url += `&startDate=${startStr}&endDate=${endStr}`;

    if (selectedSellers?.length) {
      url += `&sellers=${selectedSellers.map((s) => s.value).join(",")}`;
    }
    if (selectedSellerCategories?.length) {
      url += `&sellerCategories=${selectedSellerCategories
        .map((sc) => sc.value)
        .join(",")}`;
    }
    if (selectedArticleNames?.length) {
      url += `&articleNames=${selectedArticleNames
        .map((a) => a.value)
        .join(",")}`;
    }
    if (selectedCategories?.length) {
      url += `&categories=${selectedCategories
        .map((c) => c.value)
        .join(",")}`;
    }
    url += buildHoursQuery();

    try {
      const resp = await fetch(url);
      const result = await resp.json();
      setData(Array.isArray(result) ? result : result.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching renditura full data:", error);
      setLoading(false);
    }
  }

  function handleLoadMore() {
    setOffset((prev) => prev + limit);
  }
  function handleLoadLess() {
    setOffset((prev) => Math.max(0, prev - limit));
  }
  function handleLimitChange(e) {
    setLimit(parseInt(e.target.value, 10));
    setOffset(0);
  }

  const handleSort = (columnKey) => {
    setSortConfig((prev) => {
      if (prev.key === columnKey) {
        return {
          key: columnKey,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key: columnKey, direction: "asc" };
    });
  };
  function getSortIcon(columnKey) {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === "asc" ? (
      <TriangleUpIcon ml={1} />
    ) : (
      <TriangleDownIcon ml={1} />
    );
  }

  const getSortedData = () => {
    if (!data || data.length === 0) return [];
    const sorted = [...data];
    const { key, direction } = sortConfig;

    sorted.sort((a, b) => {
      let aVal, bVal;
      switch (key) {
        case "Article_Name":
          aVal = a.Article_Name?.toLowerCase() || "";
          bVal = b.Article_Name?.toLowerCase() || "";
          return direction === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        case "total_quantity":
          aVal = parseFloat(a.total_quantity) || 0;
          bVal = parseFloat(b.total_quantity) || 0;
          return direction === "asc" ? aVal - bVal : bVal - aVal;
        case "total_price":
          aVal = parseFloat(a.total_price) || 0;
          bVal = parseFloat(b.total_price) || 0;
          return direction === "asc" ? aVal - bVal : bVal - aVal;
        default:
          return 0;
      }
    });
    return sorted;
  };

  const totalQuantity = data.reduce(
    (sum, row) => sum + Number(row.total_quantity ?? 0),
    0
  );
  const totalPrice = data.reduce(
    (sum, row) => sum + Number(row.total_price ?? 0),
    0
  );

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="200px" position="relative" zIndex="1">
        <Spinner size="xl" />
      </Flex>
    );
  }
  if (!data || data.length === 0) {
    return (
      <Box p={4} position="relative" zIndex="1">
        {/* No data */}
      </Box>
    );
  }

  const sortedData = getSortedData();

  return (
    <Box p={4} minH="100vh" position="relative" zIndex="1">
      {showFilters && (
        <Box position="absolute" zIndex="5" top="0" left="0" right="0">
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
            categories={categories}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            articleNamesOptions={articleNamesOptions}
            selectedArticleNames={selectedArticleNames}
            setSelectedArticleNames={setSelectedArticleNames}
            hoursOptions={hoursOptions}
            selectedHours={selectedHours}
            setSelectedHours={setSelectedHours}
            selectStyles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
          />
        </Box>
      )}

      <Heading mb={4} mt={showFilters ? "320px" : "0"}></Heading>

      {isMobile ? (
        <VStack spacing={4} align="stretch">
          {sortedData.map((row, idx) => (
            <Box
              key={idx}
              borderWidth="1px"
              borderRadius="md"
              p={4}
              bg="gray.50"
              boxShadow="sm"
            >
              <Text>
                <strong>Article:</strong> {row.Article_Name}
              </Text>
              <Text>
                <strong>Quantity Sold:</strong> {row.total_quantity}
              </Text>
              <Text>
                <strong>Total Price (ALL):</strong> {row.total_price}
              </Text>
            </Box>
          ))}

          {/* Totals */}
          <Box borderTop="1px solid #ccc" pt={2} mt={4}>
            <Flex justifyContent="space-between">
              <Text fontWeight="bold">TOTAL Quantity:</Text>
              <Text fontWeight="bold">{totalQuantity}</Text>
            </Flex>
            <Flex justifyContent="space-between">
              <Text fontWeight="bold">TOTAL Price (ALL):</Text>
              <Text fontWeight="bold">{totalPrice.toLocaleString()}</Text>
            </Flex>
          </Box>
        </VStack>
      ) : (
        <TableContainer mt={4}>
          <Table variant="striped" colorScheme="gray">
            <Thead>
              <Tr>
                <Th
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSort("Article_Name")}
                >
                  Article {getSortIcon("Article_Name")}
                </Th>
                <Th
                  isNumeric
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSort("total_quantity")}
                >
                  Quantity Sold {getSortIcon("total_quantity")}
                </Th>
                <Th
                  isNumeric
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSort("total_price")}
                >
                  Total Price (ALL) {getSortIcon("total_price")}
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {sortedData.map((row, idx) => (
                <Tr key={idx}>
                  <Td>{row.Article_Name}</Td>
                  <Td isNumeric>{row.total_quantity}</Td>
                  <Td isNumeric>{Number(row.total_price).toLocaleString()}</Td>
                </Tr>
              ))}
            </Tbody>
            <Tfoot>
              <Tr>
                <Th>TOTAL</Th>
                <Th isNumeric>{totalQuantity}</Th>
                <Th isNumeric>{totalPrice.toLocaleString()}</Th>
              </Tr>
            </Tfoot>
          </Table>
        </TableContainer>
      )}

      <Flex
        mt={6}
        justifyContent="space-between"
        alignItems="center"
        width="100%"
        maxW="800px"
        mx="auto"
      >
        <Button onClick={handleLoadLess} isDisabled={offset === 0}>
          Previous
        </Button>
        <Select width="150px" value={limit} onChange={handleLimitChange}>
          <option value={50}>50 rows</option>
          <option value={200}>200 rows</option>
          <option value={500}>500 rows</option>
        </Select>
        <Button onClick={handleLoadMore} isDisabled={sortedData.length < limit}>
          Next
        </Button>
      </Flex>
    </Box>
  );
}

/* ----------------------------------------------------------
   9) Merged "Home" – Data fetching + pass to <AllGraphs />
---------------------------------------------------------- */
export function Home() {
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
    showFilters,
    setShowFilters,
  } = useOutletContext();

  const [sellers, setSellers] = useState([]);
  const [sellerCategoriesOptions, setSellerCategoriesOptions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [articleNamesOptions, setArticleNamesOptions] = useState([]);
  const [selectedHours, setSelectedHours] = useState([]);
  const hoursOptions = Array.from({ length: 24 }, (_, i) => ({
    value: i,
    label: i.toString().padStart(2, "0"),
  }));

  const [totalSales, setTotalSales] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [avgArticlePrice, setAvgArticlePrice] = useState(0);
  const [orderCount, setOrderCount] = useState(0);

  const [dailySales, setDailySales] = useState([]);
  const [monthlySales, setMonthlySales] = useState([]);

  const [pieData, setPieData] = useState([]);
  const [categoryTreemapData, setCategoryTreemapData] = useState([]);

  const [barViewMode, setBarViewMode] = useState("daily");

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  function toDateString(date) {
    if (!date) return "";
    return moment(date).format("YYYY-MM-DD");
  }

  const getHoursQuery = () =>
    selectedHours.length > 0
      ? `&hours=${selectedHours.map((h) => h.value).join(",")}`
      : "";

  const fetchTotalSales = async () => {
    try {
      const start = toDateString(startDate);
      const end = toDateString(endDate);
      if (!start || !end) return;
      const hoursQuery = getHoursQuery();
      const url =
        `${API_URL}/sales/total-sales?startDate=${start}&endDate=${end}` +
        `&sellers=${selectedSellers.map((s) => s.value).join(",")}` +
        `&sellerCategories=${selectedSellerCategories
          .map((cat) => cat.value)
          .join(",")}` +
        `&articleNames=${selectedArticleNames.map((a) => a.value).join(",")}` +
        `&categories=${selectedCategories.map((cat) => cat.value).join(",")}` +
        hoursQuery;

      const response = await fetch(url);
      const data = await response.json();
      setTotalSales(data.total_sales || 0);
    } catch (error) {
      console.error("Error fetching total sales:", error);
    }
  };

  const fetchTotalQuantity = async () => {
    try {
      const start = toDateString(startDate);
      const end = toDateString(endDate);
      if (!start || !end) return;
      const hoursQuery = getHoursQuery();
      const url =
        `${API_URL}/sales/total-quantity?startDate=${start}&endDate=${end}` +
        `&sellers=${selectedSellers.map((s) => s.value).join(",")}` +
        `&sellerCategories=${selectedSellerCategories
          .map((cat) => cat.value)
          .join(",")}` +
        `&articleNames=${selectedArticleNames.map((a) => a.value).join(",")}` +
        `&categories=${selectedCategories.map((cat) => cat.value).join(",")}` +
        hoursQuery;

      const response = await fetch(url);
      const data = await response.json();
      setTotalQuantity(data.total_quantity || 0);
    } catch (error) {
      console.error("Error fetching total quantity:", error);
    }
  };

  const fetchAvgArticlePrice = async () => {
    try {
      const start = toDateString(startDate);
      const end = toDateString(endDate);
      if (!start || !end) return;
      const hoursQuery = getHoursQuery();
      const url =
        `${API_URL}/sales/avg-article-price?startDate=${start}&endDate=${end}` +
        `&sellers=${selectedSellers.map((s) => s.value).join(",")}` +
        `&sellerCategories=${selectedSellerCategories
          .map((cat) => cat.value)
          .join(",")}` +
        `&articleNames=${selectedArticleNames.map((a) => a.value).join(",")}` +
        `&categories=${selectedCategories.map((cat) => cat.value).join(",")}` +
        hoursQuery;

      const response = await fetch(url);
      const data = await response.json();
      setAvgArticlePrice(data.avg_price || 0);
    } catch (error) {
      console.error("Error fetching average article price:", error);
    }
  };

  const fetchOrderCount = async () => {
    try {
      const start = toDateString(startDate);
      const end = toDateString(endDate);
      if (!start || !end) return;
      const hoursQuery = getHoursQuery();
      const url =
        `${API_URL}/sales/order-count?startDate=${start}&endDate=${end}` +
        `&sellers=${selectedSellers.map((s) => s.value).join(",")}` +
        `&sellerCategories=${selectedSellerCategories
          .map((cat) => cat.value)
          .join(",")}` +
        `&articleNames=${selectedArticleNames.map((a) => a.value).join(",")}` +
        `&categories=${selectedCategories.map((cat) => cat.value).join(",")}` +
        hoursQuery;

      const response = await fetch(url);
      const data = await response.json();
      setOrderCount(data.order_count || 0);
    } catch (error) {
      console.error("Error fetching order count:", error);
    }
  };

  const fetchDailySales = async () => {
    try {
      const start = toDateString(startDate);
      const end = toDateString(endDate);
      if (!start || !end) return;
      const hoursQuery = getHoursQuery();
      const url =
        `${API_URL}/sales/daily-sales?startDate=${start}&endDate=${end}` +
        `&sellers=${selectedSellers.map((s) => s.value).join(",")}` +
        `&sellerCategories=${selectedSellerCategories
          .map((cat) => cat.value)
          .join(",")}` +
        `&articleNames=${selectedArticleNames.map((a) => a.value).join(",")}` +
        `&categories=${selectedCategories.map((cat) => cat.value).join(",")}` +
        hoursQuery;

      const response = await fetch(url);
      const data = await response.json();
      setDailySales(data || []);
    } catch (error) {
      console.error("Error fetching daily sales:", error);
    }
  };

  const fetchMonthlySales = async () => {
    try {
      const start = toDateString(startDate);
      const end = toDateString(endDate);
      if (!start || !end) return;
      const hoursQuery = getHoursQuery();
      const url =
        `${API_URL}/sales/monthly-sales?startDate=${start}&endDate=${end}` +
        `&sellers=${selectedSellers.map((s) => s.value).join(",")}` +
        `&sellerCategories=${selectedSellerCategories
          .map((cat) => cat.value)
          .join(",")}` +
        `&articleNames=${selectedArticleNames.map((a) => a.value).join(",")}` +
        `&categories=${selectedCategories.map((cat) => cat.value).join(",")}` +
        hoursQuery;

      const response = await fetch(url);
      const data = await response.json();
      setMonthlySales(data || []);
    } catch (error) {
      console.error("Error fetching monthly sales:", error);
    }
  };

  const fetchSellerCategoriesTotal = async () => {
    try {
      const start = toDateString(startDate);
      const end = toDateString(endDate);
      if (!start || !end) return;
      const hoursQuery = getHoursQuery();
      const url =
        `${API_URL}/sales/seller-categories-total?startDate=${start}&endDate=${end}` +
        `&sellers=${selectedSellers.map((s) => s.value).join(",")}` +
        `&sellerCategories=${selectedSellerCategories
          .map((sc) => sc.value)
          .join(",")}` +
        `&articleNames=${selectedArticleNames.map((a) => a.value).join(",")}` +
        `&categories=${selectedCategories.map((cat) => cat.value).join(",")}` +
        hoursQuery;

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

  const fetchCategoryTotals = async () => {
    try {
      const start = toDateString(startDate);
      const end = toDateString(endDate);
      if (!start || !end) return;

      const queryParams = new URLSearchParams({
        startDate: start,
        endDate: end,
      });

      if (selectedCategories?.length) {
        queryParams.append(
          "categories",
          selectedCategories.map((cat) => cat.value).join(",")
        );
      }
      if (selectedSellers?.length) {
        queryParams.append(
          "sellers",
          selectedSellers.map((s) => s.value).join(",")
        );
      }
      if (selectedSellerCategories?.length) {
        queryParams.append(
          "sellerCategories",
          selectedSellerCategories.map((sc) => sc.value).join(",")
        );
      }
      if (selectedArticleNames?.length) {
        queryParams.append(
          "articleNames",
          selectedArticleNames.map((a) => a.value).join(",")
        );
      }
      if (selectedHours?.length) {
        queryParams.append(
          "hours",
          selectedHours.map((h) => h.value).join(",")
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
      const start = toDateString(startDate);
      const end = toDateString(endDate);
      const query = new URLSearchParams();

      if (start && end) {
        query.append("startDate", start);
        query.append("endDate", end);
      }
      if (selectedSellers?.length) {
        query.append("sellers", selectedSellers.map((s) => s.value).join(","));
      }
      if (selectedSellerCategories?.length) {
        query.append(
          "sellerCategories",
          selectedSellerCategories.map((sc) => sc.value).join(",")
        );
      }
      if (selectedArticleNames?.length) {
        query.append(
          "articleNames",
          selectedArticleNames.map((a) => a.value).join(",")
        );
      }
      if (selectedHours?.length) {
        query.append(
          "hours",
          selectedHours.map((h) => h.value).join(",")
        );
      }

      const url = `${API_URL}/sales/categories?${query.toString()}`;
      const response = await fetch(url);
      const data = await response.json();
      setCategories(data.map((cat) => ({ value: cat, label: cat })));
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchArticleNamesOptions = async () => {
    try {
      const start = toDateString(startDate);
      const end = toDateString(endDate);
      const query = new URLSearchParams();

      if (start && end) {
        query.append("startDate", start);
        query.append("endDate", end);
      }
      if (selectedCategories?.length) {
        query.append(
          "categories",
          selectedCategories.map((c) => c.value).join(",")
        );
      }
      if (selectedSellers?.length) {
        query.append(
          "sellers",
          selectedSellers.map((s) => s.value).join(",")
        );
      }
      if (selectedSellerCategories?.length) {
        query.append(
          "sellerCategories",
          selectedSellerCategories.map((sc) => sc.value).join(",")
        );
      }
      if (selectedHours?.length) {
        query.append(
          "hours",
          selectedHours.map((h) => h.value).join(",")
        );
      }

      const url = `${API_URL}/sales/article-names?${query.toString()}`;
      const response = await fetch(url);
      const data = await response.json();
      setArticleNamesOptions(
        data.map((article) => ({ value: article, label: article }))
      );
    } catch (error) {
      console.error("Error fetching article names:", error);
    }
  };

  useEffect(() => {
    fetchSellers();
    fetchSellerCategoriesOptions();
    fetchCategories();
    fetchArticleNamesOptions();
  }, []);

  useEffect(() => {
    if (!startDate || !endDate) return;
    fetchTotalSales();
    fetchTotalQuantity();
    fetchAvgArticlePrice();
    fetchOrderCount();
    fetchDailySales();
    fetchMonthlySales();
    fetchSellerCategoriesTotal();
    fetchCategoryTotals();

    // Also refresh categories & article names (dynamic)
    fetchCategories();
    fetchArticleNamesOptions();
    // eslint-disable-next-line
  }, [
    startDate,
    endDate,
    selectedSellers,
    selectedSellerCategories,
    selectedArticleNames,
    selectedCategories,
    selectedHours,
  ]);

  const dailyBarData = (dailySales || [])
    .filter((item) => item && item.date && item.total !== undefined)
    .map((item) => ({
      date: item.date,
      total: Number(item.total),
    }));

  const monthlyBarData = (monthlySales || [])
    .filter((item) => item && item.month && item.total !== undefined)
    .map((item) => ({
      date: item.month,
      total: Number(item.total),
    }));

  const barData = barViewMode === "daily" ? dailyBarData : monthlyBarData;

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
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  };

  return (
    <Box minH="100vh" w="100%" color="gray.800" pt="80px" px={4}>
      {showFilters && (
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
          categories={categories}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          articleNamesOptions={articleNamesOptions}
          selectedArticleNames={selectedArticleNames}
          setSelectedArticleNames={setSelectedArticleNames}
        />
      )}

      <AllGraphs
        totalSales={totalSales}
        totalQuantity={totalQuantity}
        avgArticlePrice={avgArticlePrice}
        orderCount={orderCount}
        barData={barData}
        barViewMode={barViewMode}
        setBarViewMode={setBarViewMode}
        pieData={pieData}
        categoryTreemapData={categoryTreemapData}
        startDate={startDate}
        endDate={endDate}
        selectedSellers={selectedSellers}
        selectedSellerCategories={selectedSellerCategories}
        selectedArticleNames={selectedArticleNames}
        selectedCategories={selectedCategories}
        selectedHours={selectedHours}
      />
    </Box>
  );
}

/* ----------------------------------------------------------
   10) Filters (inlined from FILTERS/Filters.jsx) with HOURS
---------------------------------------------------------- */
export function Filters({
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
  categories,
  selectedCategories,
  setSelectedCategories,
  articleNamesOptions,
  selectedArticleNames,
  setSelectedArticleNames,
}) {
  return (
    <Card bg="gray.600" mb={6} mt={6} borderRadius="md" boxShadow="md">
      <CardBody>
        <Heading size="lg" mb={4} color="white" align="center" fontWeight="bold">
          Filters
        </Heading>

        <Flex wrap="wrap" gap={4}>
          {/* Start Date */}
          <Box mb={4}>
            <Box mb={2} color="white" fontWeight="bold">
              Start Date
            </Box>
            <DatePicker
              selected={startDate}
              onChange={setStartDate}
              className="dark-datepicker"
            />
          </Box>

          {/* End Date */}
          <Box mb={4}>
            <Box mb={2} color="white" fontWeight="bold">
              End Date
            </Box>
            <DatePicker
              selected={endDate}
              onChange={setEndDate}
              className="dark-datepicker"
            />
          </Box>

          {/* Seller Filter */}
          <Box minW="200px" mb={4}>
            <Box mb={2} color="white" fontWeight="bold">
              Seller
            </Box>
            <Select
              isMulti
              menuPosition="fixed"
              menuPortalTarget={document.body}
              options={sellers}
              onChange={setSelectedSellers}
              placeholder="Select sellers"
              styles={selectStyles}
              value={selectedSellers}
            />
          </Box>

          {/* Seller Category Filter */}
          <Box minW="200px" mb={4}>
            <Box mb={2} color="white" fontWeight="bold">
              Seller Category
            </Box>
            <Select
              isMulti
              menuPosition="fixed"
              menuPortalTarget={document.body}
              options={sellerCategoriesOptions}
              onChange={setSelectedSellerCategories}
              placeholder="Select categories"
              styles={selectStyles}
              value={selectedSellerCategories}
            />
          </Box>

          {/* Category Filter */}
          <Box minW="200px" mb={4}>
            <Box mb={2} color="white" fontWeight="bold">
              Category
            </Box>
            <Select
              isMulti
              menuPosition="fixed"
              menuPortalTarget={document.body}
              options={categories}
              onChange={setSelectedCategories}
              placeholder="Select categories"
              styles={selectStyles}
              value={selectedCategories}
            />
          </Box>

          {/* Article Name Filter */}
          <Box minW="200px" mb={4}>
            <Box mb={2} color="white" fontWeight="bold">
              Article Name
            </Box>
            <Select
              isMulti
              menuPosition="fixed"
              menuPortalTarget={document.body}
              options={articleNamesOptions}
              onChange={setSelectedArticleNames}
              placeholder="Select article names"
              styles={selectStyles}
              value={selectedArticleNames}
            />
          </Box>

          {/* HOURS Filter */}
          <Box minW="200px" mb={4}>
            <Box mb={2} color="white" fontWeight="bold">
              Hours
            </Box>
            <Select
              isMulti
              menuPosition="fixed"
              menuPortalTarget={document.body}
              options={hoursOptions}
              onChange={setSelectedHours}
              placeholder="Select hours"
              styles={selectStyles}
              value={selectedHours}
            />
          </Box>
        </Flex>
      </CardBody>
    </Card>
  );
}
