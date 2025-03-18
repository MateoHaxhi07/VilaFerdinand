// BaseLayout.js
import { Outlet } from 'react-router-dom';
import React, { useState } from 'react';

export default function BaseLayout() {
  // If you still want global date/filter states:
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [selectedSellers, setSelectedSellers] = useState([]);
  const [selectedSellerCategories, setSelectedSellerCategories] = useState([]);
  const [selectedArticleNames, setSelectedArticleNames] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  return (
    <Outlet
      context={{
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
      }}
    />
  );
}
