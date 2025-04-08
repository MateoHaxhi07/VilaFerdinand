import React from "react";
import ReactEcharts from "echarts-for-react";
import { Box } from "@chakra-ui/react";

export default function EChartSellerCategories({ pieData }) {
  // Calculate total sales for reference
  const total = pieData.reduce((acc, cur) => acc + cur.value, 0);

  // Transform data (example: rename "NaN" to "Elona")
  const transformedData = pieData.map((item) => ({
    name: item.label === "NaN" ? "Elona" : item.label,
    value: item.value,
  }));

  // ECharts option for a donut chart
  const option = {
    tooltip: {
      trigger: "item",
      formatter: (params) =>
        `${params.name}: ${params.value.toLocaleString()} ALL (${params.percent}%)`,
    },
    legend: {
      orient: "horizontal",
      bottom: 10,
      textStyle: {
        color: "#666",
      },
    },
    series: [
      {
        name: "Sales Split",
        type: "pie",
        radius: ["40%", "70%"], // Creates the donut shape
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
