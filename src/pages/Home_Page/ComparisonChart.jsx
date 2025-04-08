// ComparisonChart.jsx
import React, { useEffect, useState } from "react";
import ReactEcharts from "echarts-for-react";
import { Box, Spinner } from "@chakra-ui/react";
import moment from "moment-timezone";

// Helper: generate date strings ("YYYY-MM-DD") for every day in [start, end]
function getAllDatesInRange(start, end) {
  const dates = [];
  let curr = moment(start);
  const last = moment(end);
  while (curr.isSameOrBefore(last, "day")) {
    dates.push(curr.format("YYYY-MM-DD"));
    curr.add(1, "day");
  }
  return dates;
}

export default function ComparisonChart({
  startDate,
  endDate,
  apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000",
  // Optional filter props – these should be arrays of objects with a "value" property.
  selectedSellers = [],
  selectedSellerCategories = [],
  selectedArticleNames = [],
  selectedCategories = [],
  selectedHours = []
}) {
  const [dataThisYear, setDataThisYear] = useState([]);
  const [dataLastYear, setDataLastYear] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!startDate || !endDate) return;

    async function fetchComparison() {
      try {
        setLoading(true);
        // Format dates as "YYYY-MM-DD"
        const startStr = moment(startDate).format("YYYY-MM-DD");
        const endStr = moment(endDate).format("YYYY-MM-DD");

        // Build base URL with date range parameters
        let url = `${apiUrl}/sales/comparison-daily-sales?startDate=${startStr}&endDate=${endStr}`;

        // Append filter parameters if they exist.
        if (selectedSellers.length > 0) {
          url += `&sellers=${selectedSellers.map((s) => s.value).join(",")}`;
        }
        if (selectedSellerCategories.length > 0) {
          url += `&sellerCategories=${selectedSellerCategories.map((sc) => sc.value).join(",")}`;
        }
        if (selectedArticleNames.length > 0) {
          url += `&articleNames=${selectedArticleNames.map((a) => a.value).join(",")}`;
        }
        if (selectedCategories.length > 0) {
          url += `&categories=${selectedCategories.map((c) => c.value).join(",")}`;
        }
        if (selectedHours.length > 0) {
          url += `&hours=${selectedHours.map((h) => h.value).join(",")}`;
        }

        console.log("ComparisonChart fetching from URL:", url);
        const resp = await fetch(url);
        const result = await resp.json();
        // Expecting result structure: { thisYear: [...], lastYear: [...] }
        setDataThisYear(result.thisYear || []);
        setDataLastYear(result.lastYear || []);
        setLoading(false);
      } catch (err) {
        console.error("Comparison fetch error:", err);
        setLoading(false);
      }
    }
    fetchComparison();
    // IMPORTANT: Ensure that filter arrays are stable (do not recreate them on every render)
  }, [
    startDate,
    endDate,
    apiUrl,
    selectedSellers,
    selectedSellerCategories,
    selectedArticleNames,
    selectedCategories,
    selectedHours
  ]);

  // If dates are not provided, do not render the chart.
  if (!startDate || !endDate) {
    return null;
  }

  // Show a spinner while data is loading.
  if (loading) {
    return (
      <Box minH="300px" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="lg" />
      </Box>
    );
  }

  // Generate the list of dates in the range as "YYYY-MM-DD" strings.
  const startStr = moment(startDate).format("YYYY-MM-DD");
  const endStr = moment(endDate).format("YYYY-MM-DD");
  const allDatesThisYear = getAllDatesInRange(startStr, endStr);

  // Helper: look up total for a given date in "DD/MM" format
  function findTotalForDate(dataArray, formattedDate) {
    const found = dataArray.find((d) => d.date === formattedDate);
    return found ? Number(found.total) : 0;
  }

  const xLabels = [];
  const seriesThisYear = [];
  const seriesLastYear = [];

  // Loop over every day in the range to build chart data.
  for (let i = 0; i < allDatesThisYear.length; i++) {
    const currentDate = moment(allDatesThisYear[i]);
    // The API returns dates in "DD/MM" format.
    const formattedThis = currentDate.format("DD/MM");
    const lastYearDate = currentDate.clone().subtract(1, "year");
    const formattedLast = lastYearDate.format("DD/MM");

    // Use a friendly format like "Apr-01" for the x-axis.
    xLabels.push(currentDate.format("MMM-DD"));
    seriesThisYear.push(findTotalForDate(dataThisYear, formattedThis));
    seriesLastYear.push(findTotalForDate(dataLastYear, formattedLast));
  }

  const chartOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" }
    },
    legend: {
      data: ["This Year", "Last Year"]
    },
    xAxis: {
      type: "category",
      data: xLabels
    },
    yAxis: {
      type: "value"
    },
    series: [
      {
        name: "This Year",
        type: "bar",
        barGap: "30%",
        data: seriesThisYear
      },
      {
        name: "Last Year",
        type: "bar",
        data: seriesLastYear
      }
    ]
  };

  return (
    <Box w="100%" h="450px" border="1px solid #ccc" borderRadius="md" p={2}>
      <ReactEcharts option={chartOption} style={{ width: "100%", height: "100%" }} />
    </Box>
  );
}
