// src/pages/Xhiro_Ditore/DailyExpensesWrapper.js
import React, { useEffect } from "react";
import { useBreakpointValue } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import DailyExpenses from "./DailyExpenses";

export default function DailyExpensesWrapper() {
  const navigate = useNavigate();
  // On small screens (base = mobile), isMobile = true
  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    if (isMobile) {
      // redirect to the mobile version
      navigate("/daily-expenses-mobile");
    }
  }, [isMobile, navigate]);

  // If not mobile, show the normal daily expenses
  return <DailyExpenses />;
}
