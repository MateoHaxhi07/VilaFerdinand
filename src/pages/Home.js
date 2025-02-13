import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Grid,
  GridItem,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Box,
  Button,
} from "@chakra-ui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import { ResponsiveLine } from "@nivo/line";
import { ResponsiveBar } from "@nivo/bar";

// Define the API base URL from the environment variable (or fallback to localhost)
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Home = () => {
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

  // Metric states
  const [totalSales, setTotalSales] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [avgArticlePrice, setAvgArticlePrice] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [mostSoldItems, setMostSoldItems] = useState([]);
  const [mostSoldItemsByPrice, setMostSoldItemsByPrice] = useState([]);
  // New state for daily sales data (for the chart)
  const [dailySales, setDailySales] = useState([]);

  // Dropdown options for filters
  const [sellers, setSellers] = useState([]);
  const [sellerCategories, setSellerCategories] = useState([]);
  const [articleNames, setArticleNames] = useState([]);
  const [categories, setCategories] = useState([]);

  // Metric fetch functions
  const fetchTotalSales = async () => {
    try {
      const response = await fetch(
        `${API_URL}/sales/total-sales?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&sellers=${selectedSellers.map(s => s.value).join(",")}&sellerCategories=${selectedSellerCategories.map(cat => cat.value).join(",")}&articleNames=${selectedArticleNames.map(a => a.value).join(",")}&categories=${selectedCategories.map(cat => cat.value).join(",")}`
      );
      const data = await response.json();
      setTotalSales(data.total_sales);
    } catch (error) {
      console.error("Error fetching total sales:", error);
    }
  };

  const fetchTotalQuantity = async () => {
    try {
      const response = await fetch(
        `${API_URL}/sales/total-quantity?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&sellers=${selectedSellers.map(s => s.value).join(",")}&sellerCategories=${selectedSellerCategories.map(cat => cat.value).join(",")}&articleNames=${selectedArticleNames.map(a => a.value).join(",")}&categories=${selectedCategories.map(cat => cat.value).join(",")}`
      );
      const data = await response.json();
      setTotalQuantity(data.total_quantity);
    } catch (error) {
      console.error("Error fetching total quantity:", error);
    }
  };

  const fetchAvgArticlePrice = async () => {
    try {
      const response = await fetch(
        `${API_URL}/sales/avg-article-price?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&sellers=${selectedSellers.map(s => s.value).join(",")}&sellerCategories=${selectedSellerCategories.map(cat => cat.value).join(",")}&articleNames=${selectedArticleNames.map(a => a.value).join(",")}&categories=${selectedCategories.map(cat => cat.value).join(",")}`
      );
      const data = await response.json();
      setAvgArticlePrice(data.avg_price);
    } catch (error) {
      console.error("Error fetching average article price:", error);
    }
  };

  const fetchMostSoldItems = async () => {
    try {
      const response = await fetch(
        `${API_URL}/sales/most-sold-items?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&sellers=${selectedSellers.map(s => s.value).join(",")}&sellerCategories=${selectedSellerCategories.map(cat => cat.value).join(",")}&articleNames=${selectedArticleNames.map(a => a.value).join(",")}&categories=${selectedCategories.map(cat => cat.value).join(",")}`
      );
      const data = await response.json();
      setMostSoldItems(data);
    } catch (error) {
      console.error("Error fetching most sold items:", error);
    }
  };

  const fetchMostSoldItemsByPrice = async () => {
    try {
      const response = await fetch(
        `${API_URL}/sales/most-sold-items-by-price?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&sellers=${selectedSellers.map(s => s.value).join(",")}&sellerCategories=${selectedSellerCategories.map(cat => cat.value).join(",")}&articleNames=${selectedArticleNames.map(a => a.value).join(",")}&categories=${selectedCategories.map(cat => cat.value).join(",")}`
      );
      const data = await response.json();
      setMostSoldItemsByPrice(data);
    } catch (error) {
      console.error("Error fetching most sold items by price:", error);
    }
  };

  // New fetch function for Daily Sales data (for the chart)
  const fetchDailySales = async () => {
    try {
      const response = await fetch(
        `${API_URL}/sales/daily-sales?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&sellers=${selectedSellers.map(s => s.value).join(",")}&sellerCategories=${selectedSellerCategories.map(cat => cat.value).join(",")}&articleNames=${selectedArticleNames.map(a => a.value).join(",")}&categories=${selectedCategories.map(cat => cat.value).join(",")}`
      );
      const data = await response.json();
      setDailySales(data);
    } catch (error) {
      console.error("Error fetching daily sales:", error);
    }
  };

  // Dropdown fetch functions
  const fetchSellers = async () => {
    try {
      const response = await fetch(`${API_URL}/sales/sellers`);
      const data = await response.json();
      setSellers(data.map(s => ({ value: s, label: s })));
    } catch (error) {
      console.error("Error fetching sellers:", error);
    }
  };

  const fetchSellerCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/sales/seller-categories`);
      const data = await response.json();
      setSellerCategories(data.map(cat => ({ value: cat, label: cat })));
    } catch (error) {
      console.error("Error fetching seller categories:", error);
    }
  };

  // Dynamic fetch for Categories based on filters
  const fetchCategories = async () => {
    try {
      let url = `${API_URL}/sales/categories?`;
      const queryParams = [];
      if (startDate && endDate) {
        queryParams.push(`startDate=${startDate.toISOString()}`);
        queryParams.push(`endDate=${endDate.toISOString()}`);
      }
      if (selectedSellers && selectedSellers.length > 0) {
        queryParams.push(`sellers=${selectedSellers.map(s => s.value).join(",")}`);
      }
      if (selectedSellerCategories && selectedSellerCategories.length > 0) {
        queryParams.push(`sellerCategories=${selectedSellerCategories.map(sc => sc.value).join(",")}`);
      }
      if (selectedArticleNames && selectedArticleNames.length > 0) {
        queryParams.push(`articleNames=${selectedArticleNames.map(a => a.value).join(",")}`);
      }
      url += queryParams.join("&");
      const response = await fetch(url);
      const data = await response.json();
      setCategories(data.map(cat => ({ value: cat, label: cat })));
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchArticleNames = async () => {
    try {
      let url = `${API_URL}/sales/article-names?`;
      const queryParams = [];
      if (selectedCategories && selectedCategories.length > 0) {
        queryParams.push(`categories=${selectedCategories.map(cat => cat.value).join(",")}`);
      }
      if (selectedSellers && selectedSellers.length > 0) {
        queryParams.push(`sellers=${selectedSellers.map(s => s.value).join(",")}`);
      }
      if (selectedSellerCategories && selectedSellerCategories.length > 0) {
        queryParams.push(`sellerCategories=${selectedSellerCategories.map(sc => sc.value).join(",")}`);
      }
      if (startDate && endDate) {
        queryParams.push(`startDate=${startDate.toISOString()}`);
        queryParams.push(`endDate=${endDate.toISOString()}`);
      }
      url += queryParams.join("&");
      const response = await fetch(url);
      const data = await response.json();
      setArticleNames(data.map(article => ({ value: article, label: article })));
    } catch (error) {
      console.error("Error fetching article names:", error);
    }
  };

  // Re-fetch metrics whenever any filter changes
  useEffect(() => {
    fetchTotalSales();
    fetchTotalQuantity();
    fetchAvgArticlePrice();
    fetchMostSoldItems();
    fetchMostSoldItemsByPrice();
    fetchDailySales();
  }, [startDate, endDate, selectedSellers, selectedSellerCategories, selectedArticleNames, selectedCategories]);

  // Fetch dropdown options on mount
  useEffect(() => {
    fetchSellers();
    fetchSellerCategories();
    fetchCategories();
    fetchArticleNames();
  }, []);

  // Re-fetch Article Names when related filters change
  useEffect(() => {
    fetchArticleNames();
  }, [selectedCategories, selectedSellers, selectedSellerCategories, startDate, endDate]);

  // Re-fetch Categories when related filters change
  useEffect(() => {
    fetchCategories();
  }, [selectedSellers, selectedSellerCategories, selectedArticleNames, startDate, endDate]);

  useEffect(() => {
    if (selectedSellerCategories.length > 0) {
      fetchArticleNames().then(() => {
        setSelectedArticleNames(articleNames);
      });
    }
  }, [selectedSellerCategories]);

  // Prepare data for Nivo Line Chart:
  // Transform dailySales into the format: [{ id, data: [{ x, y }, ...] }]
  const nivoData = [
    {
      id: "Daily Sales",
      data: dailySales.map(item => ({
        x: item.date,
        y: Number(item.total)
      }))
    }
  ];

  const barData = (dailySales || [])
    .filter(item => item && item.date && item.total !== undefined)
    .map(item => ({
      date: item.date,
      total: Number(item.total)
    }));

  // ...existing chart tooltip code...

  const CustomTooltip = ({ value, indexValue, average }) => (
    <div
      style={{
        padding: "8px",
        background: "white",
        border: "1px solid #ccc",
      }}
    >
      <strong>{indexValue}</strong>
      <br />
      Total Article Price: <span style={{ fontWeight: "bold", color: "black" }}>{Number(value).toLocaleString()} ALL</span>
      <br />
    </div>
  );

  const AverageTooltip = ({ average }) => (
    <div
      style={{
        padding: "8px",
        background: "white",
        border: "1px solid #ccc",
      }}
    >
      <strong>Average</strong>
      <br />
      Average ALL: <span style={{ fontWeight: "bold", color: "black" }}>{Number(average).toLocaleString()} ALL</span>
    </div>
  );

  // Calculate the average value of the total field in the barData
  const averageTotal = barData.reduce((sum, item) => sum + item.total, 0) / barData.length;

  return (
    <div>
      <h1 style={{ color: "white" }}>Home Page</h1>
      <Grid templateColumns="repeat(4, 1fr)" gap={6} mb="6">
        {/* Total Sales */}
        <GridItem>
          <Card overflow="hidden" variant="outline" bg="blackAlpha.900">
            <CardBody>
              <Stat>
                <StatLabel color="white">Total Sales</StatLabel>
                <StatNumber color="white">{parseFloat(totalSales).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ALL</StatNumber>
                <StatHelpText color="white">Based on selected filters</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>
        {/* Total Quantity */}
        <GridItem>
          <Card overflow="hidden" variant="outline" bg="blackAlpha.900">
            <CardBody>
              <Stat>
                <StatLabel color="white">Total Quantity</StatLabel>
                <StatNumber color="white">{parseFloat(totalQuantity).toFixed(0)}</StatNumber>
                <StatHelpText color="white">Based on selected filters</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>
        {/* Average Article Price */}
        <GridItem>
          <Card overflow="hidden" variant="outline" bg="blackAlpha.900">
            <CardBody>
              <Stat>
                <StatLabel color="white">Avg. Article Price</StatLabel>
                <StatNumber color="white">{parseFloat(avgArticlePrice).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ALL</StatNumber>
                <StatHelpText color="white">Calculated from total sales/quantity</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>
        {/* Order Count */}
        <GridItem>
          <Card overflow="hidden" variant="outline" bg="blackAlpha.900">
            <CardBody>
              <Stat>
                <StatLabel color="white">Transactions</StatLabel>
                <StatNumber color="white">{orderCount}</StatNumber>
                <StatHelpText color="white">Unique orders by datetime</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* Filter Row */}
      <Grid gap={6} mb="6" templateColumns={{ base: "repeat(1,1fr)", lg: "repeat(5,1fr)" }}>
        {/* Date Range Filter */}
        <GridItem>
          <Card overflow="hidden" variant="outline" bg="blackAlpha.900">
            <CardBody>
              <Stat>
                <StatLabel color="white">Date Range</StatLabel>
                <Box>
                  <StatLabel color="white">Start Date</StatLabel>
                  <Box zIndex="1000">
                    <DatePicker selected={startDate} onChange={setStartDate} portalId="root-portal" />
                  </Box>
                </Box>
                <Box mt={4}>
                  <StatLabel color="white">End Date</StatLabel>
                  <Box zIndex="1000">
                    <DatePicker selected={endDate} onChange={setEndDate} portalId="root-portal" />
                  </Box>
                </Box>
                <Button
                  onClick={() => {
                    fetchTotalSales();
                    fetchTotalQuantity();
                    fetchAvgArticlePrice();
                    fetchOrderCount();
                    fetchMostSoldItems();
                    fetchMostSoldItemsByPrice();
                    fetchArticleNames();
                    fetchCategories();
                    fetchSellers();
                    fetchDailySales();
                  }}
                  colorScheme="teal"
                  mt={4}
                >
                  Fetch Data
                </Button>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>
        {/* Seller Filter */}
        <GridItem>
          <Card overflow="hidden" variant="outline" bg="blackAlpha.900">
            <CardBody>
              <Stat>
                <StatLabel color="white">Seller</StatLabel>
                <Select
                  isMulti
                  options={sellers}
                  onChange={setSelectedSellers}
                  placeholder="Select sellers"
                  menuPortalTarget={document.body}
                  styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                  value={selectedSellers}
                />
              </Stat>
            </CardBody>
          </Card>
        </GridItem>
        {/* Seller Category Filter */}
        <GridItem>
          <Card overflow="hidden" variant="outline" bg="blackAlpha.900">
            <CardBody>
              <Stat>
                <StatLabel color="white">Seller Category</StatLabel>
                <Select
                  isMulti
                  options={sellerCategories}
                  onChange={setSelectedSellerCategories}
                  placeholder="Select seller categories"
                  menuPortalTarget={document.body}
                  styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                  value={selectedSellerCategories}
                />
              </Stat>
            </CardBody>
          </Card>
        </GridItem>
        {/* Article Name Filter */}
        <GridItem>
          <Card overflow="hidden" variant="outline" bg="blackAlpha.900">
            <CardBody>
              <Stat>
                <StatLabel color="white">Article Name</StatLabel>
                <Box height="200px" overflow="auto">
                  <Select
                    isMulti
                    options={articleNames}
                    onChange={setSelectedArticleNames}
                    placeholder="Select article names"
                    menuPortalTarget={document.body}
                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                    value={selectedArticleNames}
                  />
                </Box>
                <Button mt={2} colorScheme="teal" size="sm" onClick={() => setSelectedArticleNames(articleNames)}>
                  Select All
                </Button>
                <Button mt={2} ml={2} colorScheme="red" size="sm" onClick={() => setSelectedArticleNames([])}>
                  Deselect All
                </Button>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>
        {/* Category Filter */}
        <GridItem>
          <Card overflow="hidden" variant="outline" bg="blackAlpha.900">
            <CardBody>
              <Stat>
                <StatLabel color="white">Category</StatLabel>
                <Select
                  isMulti
                  options={categories}
                  onChange={setSelectedCategories}
                  placeholder="Select categories"
                  menuPortalTarget={document.body}
                  styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                  value={selectedCategories}
                />
              </Stat>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      <div style={{ height: 400, marginTop: "2rem" }}>
        <h3 style={{ color: "white", textAlign: "center" }}>Daily Sales</h3>
        <ResponsiveBar
          data={barData}
          keys={["total"]}
          indexBy="date"
          margin={{ top: 50, right: 50, bottom: 50, left: 60 }}
          padding={0.3}
          valueScale={{ type: "linear" }}
          indexScale={{ type: "band", round: true }}
          colors={() => "#00008B"}
          borderColor={{ theme: 'background' }}
          tooltip={({ value, indexValue }) => <CustomTooltip value={value} indexValue={indexValue} average={averageTotal} />}
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
            legend: "  ",
            legendOffset: -40,
            legendPosition: "middle",
          }}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor="white"
          theme={{
            axis: {
              ticks: {
                text: {
                  fontSize: 12,
                  fontWeight: "bold",
                  fill: "#000000",
                  fontFamily: "Arial, sans-serif",
                },
              },
              legend: {
                text: {
                  fontSize: 14,
                  fontWeight: "bold",
                  fill: "#000000",
                  fontFamily: "Arial, sans-serif",
                },
              },
            },
          }}
          markers={[
            {
              axis: 'y',
              value: averageTotal,
              lineStyle: { stroke: '#b0413e', strokeWidth: 2 },
              legend: 'Average',
              legendOrientation: 'vertical',
              legendPosition: 'right',
            },
          ]}
          layers={[
            'grid',
            'axes',
            'bars',
            'markers',
            'legends',
            ({ bars, xScale, yScale }) => (
              <g>
                {bars.map(bar => (
                  <rect
                    key={bar.key}
                    x={bar.x}
                    y={yScale(averageTotal)}
                    width={bar.width}
                    height={2}
                    fill="transparent"
                    onMouseEnter={(event) => {
                      const tooltip = document.createElement('div');
                      tooltip.innerHTML = `<div style="padding: 8px; background: white; border: 1px solid #ccc;">
                        <strong>Average</strong><br />
                        Average Value: <span style="font-weight: bold; color: black;">${Number(averageTotal).toLocaleString()} ALL</span>
                      </div>`;
                      tooltip.style.position = 'absolute';
                      tooltip.style.pointerEvents = 'none';
                      tooltip.style.top = `${event.clientY}px`;
                      tooltip.style.left = `${event.clientX}px`;
                      tooltip.id = 'average-tooltip';
                      document.body.appendChild(tooltip);
                    }}
                    onMouseLeave={() => {
                      const tooltip = document.getElementById('average-tooltip');
                      if (tooltip) {
                        document.body.removeChild(tooltip);
                      }
                    }}
                  />
                ))}
              </g>
            ),
          ]}
        />
      </div>

      {/* Most Sold Items Sections */}
      <Grid gap={6} mb="6" templateColumns={{ base: "repeat(1,1fr)", lg: "repeat(2,1fr)" }}>
        <GridItem>
          <Card overflow="hidden" variant="outline" bg="blackAlpha.900">
            <CardBody>
              <Stat>
                <StatLabel color="white">Most Sold Items</StatLabel>
                {mostSoldItems.map((item, index) => (
                  <Box key={index} color="white">
                    {item.Article_Name}: {item.total_quantity}
                  </Box>
                ))}
              </Stat>
            </CardBody>
          </Card>
        </GridItem>
        <GridItem>
          <Card overflow="hidden" variant="outline" bg="blackAlpha.900">
            <CardBody>
              <Stat>
                <StatLabel color="white">Most Sold Items by Price</StatLabel>
                {mostSoldItemsByPrice.map((item, index) => (
                  <Box key={index} color="white">
                    {item.Article_Name}: $
                    {typeof item.total_price === "number"
                      ? item.total_price.toFixed(2)
                      : item.total_price}
                  </Box>
                ))}
              </Stat>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </div>
  );
};

export default Home;
