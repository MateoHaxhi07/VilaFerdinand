require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const port = process.env.PORT || 5000;
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../build')));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
  
});

// Serve the React app for all other routes (React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});



// Endpoint for all data with dynamic filters
app.get("/sales/all-data", async (req, res) => {
  try {
    const {
      limit = 50,
      offset = 0,
      startDate,
      endDate,
      sellers,
      sellerCategories,
      articleNames,
      categories,
    } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Please provide startDate and endDate" });
    }


    const sellerArray = sellers ? sellers.split(",") : [];
    const sellerCategoryArray = sellerCategories ? sellerCategories.split(",") : [];
    const articleNameArray = articleNames ? articleNames.split(",") : [];
    const categoryArray = categories ? categories.split(",") : [];

    let query = `
      SELECT "Order_ID","Seller", "Article_Name", "Category", "Quantity"::numeric, "Article_Price"::numeric,
             "Total_Article_Price"::numeric, "Datetime", "Seller Category"
      FROM "sales"
      WHERE "Datetime" BETWEEN $1 AND $2
    `;
    const params = [startDate, adjustedEndDate];
    let paramIndex = 3;
    if (sellerArray.length) {
      query += ` AND "Seller" = ANY($${paramIndex}::text[])`;
      params.push(sellerArray);
      paramIndex++;
    }
    if (sellerCategoryArray.length) {
      query += ` AND "Seller Category" = ANY($${paramIndex}::text[])`;
      params.push(sellerCategoryArray);
      paramIndex++;
    }
    if (articleNameArray.length){
      query += ` AND "Article_Name" = ANY($${paramIndex}::text[])`;
      params.push(articleNameArray);
      paramIndex++;
    }
    if (categoryArray.length) {
      query += ` AND "Category" = ANY($${paramIndex}::text[])`;
      params.push(categoryArray);
      paramIndex++;
    }
    query += ` ORDER BY "Datetime" DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to get distinct Sellers (no dynamic filtering here)
app.get("/sales/sellers", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT "Seller"
      FROM "sales"
      ORDER BY "Seller";
    `);
    res.json(result.rows.map(row => row.Seller));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to get distinct Seller Categories (no dynamic filtering here)
app.get("/sales/seller-categories", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT "Seller Category"
      FROM "sales"
      ORDER BY "Seller Category";
    `);
    res.json(result.rows.map(row => row["Seller Category"]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dynamic Categories Endpoint
// Returns only the categories based on optional filters: date range, sellers, sellerCategories, and articleNames.
app.get("/sales/categories", async (req, res) => {
  try {
    const { startDate, endDate, sellers, sellerCategories, articleNames } = req.query;
    let query = `SELECT DISTINCT "Category" FROM "sales"`;
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (startDate && endDate) {
      conditions.push(`"Datetime" BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
      params.push(startDate, endDate);
      paramIndex += 2;
    }
    if (sellers) {
      const sellerArray = sellers.split(",");
      conditions.push(`"Seller" = ANY($${paramIndex}::text[])`);
      params.push(sellerArray);
      paramIndex++;
    }
    if (sellerCategories) {
      const sellerCategoryArray = sellerCategories.split(",");
      conditions.push(`"Seller Category" = ANY($${paramIndex}::text[])`);
      params.push(sellerCategoryArray);
      paramIndex++;
    }
    if (articleNames) {
      const articleNameArray = articleNames.split(",");
      conditions.push(`"Article_Name" = ANY($${paramIndex}::text[])`);
      params.push(articleNameArray);
      paramIndex++;
    }
    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }
    query += " ORDER BY \"Category\"";
    const result = await pool.query(query, params);
    res.json(result.rows.map(row => row.Category));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to get distinct Article Names with optional filters (date, categories, sellers, sellerCategories)
app.get("/sales/article-names", async (req, res) => {
  try {
    const { categories, sellers, sellerCategories, startDate, endDate } = req.query;
    let query = `SELECT DISTINCT "Article_Name" FROM "sales"`;
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (startDate && endDate) {
      conditions.push(`"Datetime" BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
      params.push(startDate, endDate);
      paramIndex += 2;
    }
    if (categories) {
      const categoryArray = categories.split(",");
      conditions.push(`"Category" = ANY($${paramIndex}::text[])`);
      params.push(categoryArray);
      paramIndex++;
    }
    if (sellers) {
      const sellerArray = sellers.split(",");
      conditions.push(`"Seller" = ANY($${paramIndex}::text[])`);
      params.push(sellerArray);
      paramIndex++;
    }
    if (sellerCategories) {
      const sellerCategoryArray = sellerCategories.split(",");
      conditions.push(`"Seller Category" = ANY($${paramIndex}::text[])`);
      params.push(sellerCategoryArray);
      paramIndex++;
    }
    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }
    query += " ORDER BY \"Article_Name\"";
    const result = await pool.query(query, params);
    res.json(result.rows.map(row => row.Article_Name));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint for most sold items by quantity
app.get("/sales/most-sold-items", async (req, res) => {
  try {
    const { startDate, endDate, sellers, sellerCategories, articleNames, categories } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Please provide startDate and endDate" });
    }
    const sellerArray = sellers ? sellers.split(",") : [];
    const sellerCategoryArray = sellerCategories ? sellerCategories.split(",") : [];
    const articleNameArray = articleNames ? articleNames.split(",") : [];
    const categoryArray = categories ? categories.split(",") : [];
    let query = `
      SELECT "Article_Name", SUM("Quantity") AS total_quantity
      FROM "sales"
      WHERE "Datetime" BETWEEN $1 AND $2
    `;
    const params = [startDate, endDate];
    let paramIndex = 3;
    if (sellerArray.length) {
      query += ` AND "Seller" = ANY($${paramIndex}::text[])`;
      params.push(sellerArray);
      paramIndex++;
    }
    if (sellerCategoryArray.length) {
      query += ` AND "Seller Category" = ANY($${paramIndex}::text[])`;
      params.push(sellerCategoryArray);
      paramIndex++;
    }
    if (articleNameArray.length) {
      query += ` AND "Article_Name" = ANY($${paramIndex}::text[])`;
      params.push(articleNameArray);
      paramIndex++;
    }
    if (categoryArray.length) {
      query += ` AND "Category" = ANY($${paramIndex}::text[])`;
      params.push(categoryArray);
      paramIndex++;
    }
    query += `
      GROUP BY "Article_Name"
      ORDER BY total_quantity DESC
      LIMIT 10;
    `;
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint for most sold items by price
app.get("/sales/most-sold-items-by-price", async (req, res) => {
  try {
    const { startDate, endDate, sellers, sellerCategories, articleNames, categories } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Please provide startDate and endDate" });
    }
    const sellerArray = sellers ? sellers.split(",") : [];
    const sellerCategoryArray = sellerCategories ? sellerCategories.split(",") : [];
    const articleNameArray = articleNames ? articleNames.split(",") : [];
    const categoryArray = categories ? categories.split(",") : [];
    let query = `
      SELECT "Article_Name", SUM("Total_Article_Price") AS total_price
      FROM "sales"
      WHERE "Datetime" BETWEEN $1 AND $2
    `;
    const params = [startDate, endDate];
    let paramIndex = 3;
    if (sellerArray.length) {
      query += ` AND "Seller" = ANY($${paramIndex}::text[])`;
      params.push(sellerArray);
      paramIndex++;
    }
    if (sellerCategoryArray.length) {
      query += ` AND "Seller Category" = ANY($${paramIndex}::text[])`;
      params.push(sellerCategoryArray);
      paramIndex++;
    }
    if (articleNameArray.length) {
      query += ` AND "Article_Name" = ANY($${paramIndex}::text[])`;
      params.push(articleNameArray);
      paramIndex++;
    }
    if (categoryArray.length) {
      query += ` AND "Category" = ANY($${paramIndex}::text[])`;
      params.push(categoryArray);
      paramIndex++;
    }
    query += `
      GROUP BY "Article_Name"
      ORDER BY total_price DESC
      LIMIT 10;
    `;
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint for Total Sales
app.get("/sales/total-sales", async (req, res) => {
  try {
    const { startDate, endDate, sellers, sellerCategories, articleNames, categories } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Please provide startDate and endDate" });
    }
    const sellerArray = sellers ? sellers.split(",") : [];
    const sellerCategoryArray = sellerCategories ? sellerCategories.split(",") : [];
    const articleNameArray = articleNames ? articleNames.split(",") : [];
    const categoryArray = categories ? categories.split(",") : [];
    let query = `
      SELECT COALESCE(SUM("Total_Article_Price"), 0) AS total_sales
      FROM "sales"
      WHERE "Datetime" BETWEEN $1 AND $2
    `;
    const params = [startDate, endDate];
    let paramIndex = 3;
    if (sellerArray.length) {
      query += ` AND "Seller" = ANY($${paramIndex}::text[])`;
      params.push(sellerArray);
      paramIndex++;
    }
    if (sellerCategoryArray.length) {
      query += ` AND "Seller Category" = ANY($${paramIndex}::text[])`;
      params.push(sellerCategoryArray);
      paramIndex++;
    }
    if (articleNameArray.length) {
      query += ` AND "Article_Name" = ANY($${paramIndex}::text[])`;
      params.push(articleNameArray);
      paramIndex++;
    }
    if (categoryArray.length) {
      query += ` AND "Category" = ANY($${paramIndex}::text[])`;
      params.push(categoryArray);
      paramIndex++;
    }
    const result = await pool.query(query, params);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint for Total Quantity
app.get("/sales/total-quantity", async (req, res) => {
  try {
    const { startDate, endDate, sellers, sellerCategories, articleNames, categories } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Please provide startDate and endDate" });
    }
    const sellerArray = sellers ? sellers.split(",") : [];
    const sellerCategoryArray = sellerCategories ? sellerCategories.split(",") : [];
    const articleNameArray = articleNames ? articleNames.split(",") : [];
    const categoryArray = categories ? categories.split(",") : [];
    let query = `
      SELECT COALESCE(SUM("Quantity"), 0) AS total_quantity
      FROM "sales"
      WHERE "Datetime" BETWEEN $1 AND $2
    `;
    const params = [startDate, endDate];
    let paramIndex = 3;
    if (sellerArray.length) {
      query += ` AND "Seller" = ANY($${paramIndex}::text[])`;
      params.push(sellerArray);
      paramIndex++;
    }
    if (sellerCategoryArray.length) {
      query += ` AND "Seller Category" = ANY($${paramIndex}::text[])`;
      params.push(sellerCategoryArray);
      paramIndex++;
    }
    if (articleNameArray.length) {
      query += ` AND "Article_Name" = ANY($${paramIndex}::text[])`;
      params.push(articleNameArray);
      paramIndex++;
    }
    if (categoryArray.length) {
      query += ` AND "Category" = ANY($${paramIndex}::text[])`;
      params.push(categoryArray);
      paramIndex++;
    }
    const result = await pool.query(query, params);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint for Average Article Price
app.get("/sales/avg-article-price", async (req, res) => {
  try {
    const { startDate, endDate, sellers, sellerCategories, articleNames, categories } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Please provide startDate and endDate" });
    }
    const sellerArray = sellers ? sellers.split(",") : [];
    const sellerCategoryArray = sellerCategories ? sellerCategories.split(",") : [];
    const articleNameArray = articleNames ? articleNames.split(",") : [];
    const categoryArray = categories ? categories.split(",") : [];
    let query = `
      SELECT COALESCE(SUM("Total_Article_Price")/NULLIF(SUM("Quantity"),0), 0) AS avg_price
      FROM "sales"
      WHERE "Datetime" BETWEEN $1 AND $2
    `;
    const params = [startDate, endDate];
    let paramIndex = 3;
    if (sellerArray.length) {
      query += ` AND "Seller" = ANY($${paramIndex}::text[])`;
      params.push(sellerArray);
      paramIndex++;
    }
    if (sellerCategoryArray.length) {
      query += ` AND "Seller Category" = ANY($${paramIndex}::text[])`;
      params.push(sellerCategoryArray);
      paramIndex++;
    }
    if (articleNameArray.length) {
      query += ` AND "Article_Name" = ANY($${paramIndex}::text[])`;
      params.push(articleNameArray);
      paramIndex++;
    }
    if (categoryArray.length) {
      query += ` AND "Category" = ANY($${paramIndex}::text[])`;
      params.push(categoryArray);
      paramIndex++;
    }
    const result = await pool.query(query, params);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// New Endpoint: Daily Sales Data
// Aggregates the total article price per day (formatted as DD/MM) using the current filters.
app.get("/sales/daily-sales", async (req, res) => {
  try {
    const { startDate, endDate, sellers, sellerCategories, articleNames, categories } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Please provide startDate and endDate" });
    }
    const sellerArray = sellers ? sellers.split(",") : [];
    const sellerCategoryArray = sellerCategories ? sellerCategories.split(",") : [];
    const articleNameArray = articleNames ? articleNames.split(",") : [];
    const categoryArray = categories ? categories.split(",") : [];
    
    let query = `
      SELECT to_char("Datetime", 'DD/MM') AS date,
             SUM("Total_Article_Price") AS total
      FROM "sales"
      WHERE "Datetime" BETWEEN $1 AND $2
    `;
    const params = [startDate, endDate];
    let paramIndex = 3;
    
    if (sellerArray.length) {
      query += ` AND "Seller" = ANY($${paramIndex}::text[])`;
      params.push(sellerArray);
      paramIndex++;
    }
    if (sellerCategoryArray.length) {
      query += ` AND "Seller Category" = ANY($${paramIndex}::text[])`;
      params.push(sellerCategoryArray);
      paramIndex++;
    }
    if (articleNameArray.length) {
      query += ` AND "Article_Name" = ANY($${paramIndex}::text[])`;
      params.push(articleNameArray);
      paramIndex++;
    }
    if (categoryArray.length) {
      query += ` AND "Category" = ANY($${paramIndex}::text[])`;
      params.push(categoryArray);
      paramIndex++;
    }
    
    query += `
      GROUP BY to_char("Datetime", 'DD/MM')
      ORDER BY MIN("Datetime") ASC;
    `;
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});