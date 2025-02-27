require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const moment = require("moment");
const bcrypt = require("bcrypt");
const port = process.env.PORT || 5000;

const jwt = require("jsonwebtoken");
const app = express();
const path = require("path");
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "build")));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});







/* ===============================
   LOGIN & AUTHENTICATION   - SQL TABLE USERS 
   =============================== */

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const authenticateAdmin = (req, res, next) => {
  authenticateToken(req, res, () => {
    if (req.user.role !== "admin") {
      return res.sendStatus(403);
    }
    next();
  });
};

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid email or password" });
    }
    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ error: "Failed to login user" });
  }
});

// Register a new user
app.post("/auth/register", async (req, res) => {
  const { email, password, role } = req.body; // role can be 'admin' or 'user'
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING *',
      [email, hashedPassword, role]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Failed to register user" });
  }
});

// Example of a protected admin route
app.get("/admin", authenticateAdmin, (req, res) => {
  res.json({ message: "This is an admin route", user: req.user });
});

// Example of a protected route
app.get("/protected", authenticateToken, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});





/* ===============================
   LOGIN & AUTHENTICATION   - END
   =============================== */









   




















































/* ===============================
   SALES ENDPOINTS - SQL TABLE SALES

   CONTAINS ENDPOINTS FOR HOME_PAGE, SHITJET ANALITIKE, SHITJET RENDITURA
   =============================== */

// Create table for 'sales' if it does not exist
const createSalesTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS sales (
      "Order_ID" TEXT,
      "Seller" TEXT,
      "Article_Name" TEXT,
      "Category" TEXT,
      "Quantity" NUMERIC,
      "Article_Price" NUMERIC,
      "Total_Article_Price" NUMERIC,
      "Datetime" TIMESTAMP,
      "Seller Category" TEXT
    );
  `;
  try {
    await pool.query(query);
    console.log("sales table created or already exists.");
  } catch (error) {
    console.error("Error creating sales table:", error);
  }
};
createSalesTable();

// Helper: if hours query parameter exists, add hour filter condition.
// For endpoints that do NOT subtract an hour from Datetime.
const addHourFilter = (req, queryFragment = 'EXTRACT(HOUR FROM "Datetime")') => {
  if (req.query.hours) {
    const hoursArray = req.query.hours.split(",").map(Number);
    return {
      condition: ` AND ${queryFragment} = ANY($PARAM::int[])`,
      hoursArray,
    };
  }
  return null;
};




// Endpoint: Seller Categories Total ( TO CONSTRUCT PIE CHART) 


app.get("/sales/seller-categories-total", async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      sellers,
      sellerCategories,
      articleNames,
      categories,
    } = req.query;
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "Please provide startDate and endDate" });
    }

    // Adjust dates to cover the full day
    const adjustedStartDate = moment(startDate).startOf("day").toISOString();
    const adjustedEndDate = moment(endDate).endOf("day").toISOString();

    let query = `
      SELECT "Seller Category", SUM("Total_Article_Price") AS total_sales
      FROM "sales"
      WHERE "Datetime" BETWEEN $1 AND $2
    `;
    const params = [adjustedStartDate, adjustedEndDate];
    let paramIndex = 3;

    if (sellers) {
      const sellerArray = sellers.split(",");
      query += ` AND "Seller" = ANY($${paramIndex}::text[])`;
      params.push(sellerArray);
      paramIndex++;
    }
    if (sellerCategories) {
      const sellerCategoryArray = sellerCategories.split(",");
      query += ` AND "Seller Category" = ANY($${paramIndex}::text[])`;
      params.push(sellerCategoryArray);
      paramIndex++;
    }
    if (articleNames) {
      const articleNameArray = articleNames.split(",");
      query += ` AND "Article_Name" = ANY($${paramIndex}::text[])`;
      params.push(articleNameArray);
      paramIndex++;
    }
    if (categories) {
      const categoryArray = categories.split(",");
      query += ` AND "Category" = ANY($${paramIndex}::text[])`;
      params.push(categoryArray);
      paramIndex++;
    }
    // Hour filter
    const hourFilter = addHourFilter(req);
    if (hourFilter) {
      query += hourFilter.condition.replace("PARAM", paramIndex);
      params.push(hourFilter.hoursArray);
      paramIndex++;
    }

    query += `
      GROUP BY "Seller Category"
      ORDER BY total_sales DESC;
    `;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching seller categories total:", error);
    res.status(500).json({ error: error.message });
  }
});





// Endpoint: Hourly Sales (TO CONSTRUCT HOURLY SALES CHART)
app.get("/sales/hourly-sales", async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      sellers,
      sellerCategories,
      articleNames,
      categories,
    } = req.query;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "Please provide startDate and endDate" });
    }

    const adjustedStartDate = moment(startDate).startOf("day").toISOString();
    const adjustedEndDate = moment(endDate).endOf("day").toISOString();

    const sellerArray = sellers ? sellers.split(",") : [];
    const sellerCategoryArray = sellerCategories ? sellerCategories.split(",") : [];
    const articleNameArray = articleNames ? articleNames.split(",") : [];
    const categoryArray = categories ? categories.split(",") : [];

    let query = `
      SELECT EXTRACT(HOUR FROM ("Datetime" - interval '1 hour')) AS hour,
             SUM("Total_Article_Price"::numeric) AS total_sales
      FROM "sales"
      WHERE "Datetime" BETWEEN $1 AND $2
    `;
    const params = [adjustedStartDate, adjustedEndDate];
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
    // For hourly-sales, use the same expression as grouping:
    const hourFilter = addHourFilter(req, 'EXTRACT(HOUR FROM ("Datetime" - interval \'1 hour\'))');
    if (hourFilter) {
      query += hourFilter.condition.replace("PARAM", paramIndex);
      params.push(hourFilter.hoursArray);
      paramIndex++;
    }

    query += `
      GROUP BY hour
      ORDER BY hour;
    `;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// Endpoint: All Data FOR SALES GOTTEN FROM THE PYTHON SCRIPTS FROM DEVPOS WEBSITE OF RESTAURANT SALES


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
      return res
        .status(400)
        .json({ error: "Please provide startDate and endDate" });
    }
    const adjustedStartDate = moment(startDate).startOf("day").toISOString();
    const adjustedEndDate = moment(endDate).endOf("day").toISOString();
    const sellerArray = sellers ? sellers.split(",") : [];
    const sellerCategoryArray = sellerCategories ? sellerCategories.split(",") : [];
    const articleNameArray = articleNames ? articleNames.split(",") : [];
    const categoryArray = categories ? categories.split(",") : [];

    let query = `
      SELECT "Order_ID", "Seller", "Article_Name", "Category", "Quantity"::numeric,
             "Article_Price"::numeric, "Total_Article_Price"::numeric, "Datetime", "Seller Category"
      FROM "sales"
      WHERE "Datetime" BETWEEN $1 AND $2
    `;
    const params = [adjustedStartDate, adjustedEndDate];
    let paramIndex = 3;
    if (sellerArray.length) {
      query += ` AND UPPER("Seller") = ANY($${paramIndex}::text[])`;
      params.push(sellerArray.map(s => s.toUpperCase()));
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
    // Hour filter
    const hourFilter = addHourFilter(req);
    if (hourFilter) {
      query += hourFilter.condition.replace("PARAM", paramIndex);
      params.push(hourFilter.hoursArray);
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



// ENDPOINT FOR AVERAGE ORDER VALUE VS TIME

app.get("/sales/avg-order-value", async (req, res) => {
  try {
    const { startDate, endDate, categories, sellers, sellerCategories } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Please provide startDate and endDate" });
    }
    
    // Adjust datetime to start/end of day
    const adjustedStartDate = moment(startDate).startOf("day").toISOString();
    const adjustedEndDate = moment(endDate).endOf("day").toISOString();
    
    const conditions = [];
    const params = [];
    let paramIndex = 1;
    
    // Base filter for date
    conditions.push(`"Datetime" BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
    params.push(adjustedStartDate, adjustedEndDate);
    paramIndex += 2;
    
    // Optional filters: categories, sellers, sellerCategories
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
    
    // Build the inner query to aggregate orders
    let innerQuery = `
      SELECT "Order_ID",
             DATE_TRUNC('day', "Datetime") AS order_date,
             SUM("Total_Article_Price"::numeric) AS order_total
      FROM "sales"
    `;
    if (conditions.length > 0) {
      innerQuery += " WHERE " + conditions.join(" AND ");
    }
    innerQuery += `
      GROUP BY "Order_ID", DATE_TRUNC('day', "Datetime")
    `;
    
    // Now, wrap the inner query to calculate the average order value per day
    const finalQuery = `
      SELECT order_date, AVG(order_total) AS avg_order_value
      FROM (${innerQuery}) AS orders
      GROUP BY order_date
      ORDER BY order_date
    `;
    
    const result = await pool.query(finalQuery, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});






// Endpoint: Distinct Sellers FOR FILTER BUTTON
app.get("/sales/sellers", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT "Seller"
      FROM "sales"
      ORDER BY "Seller";
    `);
    res.json(result.rows.map((row) => row.Seller));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint: Distinct Seller Categories FOR FILTER BUTTON

app.get("/sales/seller-categories", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT "Seller Category"
      FROM "sales"
      ORDER BY "Seller Category";
    `);
    res.json(result.rows.map((row) => row["Seller Category"]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint: Dynamic Categories based on filters
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
    // Hour filter
    const hourFilter = addHourFilter(req);
    if (hourFilter) {
      conditions.push(hourFilter.condition.replace("PARAM", paramIndex));
      params.push(hourFilter.hoursArray);
      paramIndex++;
    }
    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }
    query += " ORDER BY \"Category\"";
    const result = await pool.query(query, params);
    res.json(result.rows.map((row) => row.Category));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



//********************************//
//  */ CATEGORY ENDPOINT  = USED FOR TREEMAP GRAPH
//********************************//



app.get("/sales/category-total-price", async (req, res) => {
  try {
    const { startDate, endDate, categories, sellers, sellerCategories } = req.query;
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "Please provide startDate and endDate" });
    }

    // Adjust datetime to start/end of day
    const adjustedStartDate = moment(startDate).startOf("day").toISOString();
    const adjustedEndDate = moment(endDate).endOf("day").toISOString();

    const conditions = [];
    const params = [];
    let paramIndex = 1;

    // Base query
    let query = `
      SELECT "Category", SUM("Total_Article_Price"::numeric) AS total_price
      FROM "sales"
    `;

    // Date filter using adjusted dates
    conditions.push(`"Datetime" BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
    params.push(adjustedStartDate, adjustedEndDate);
    paramIndex += 2;

    // Filter by categories if provided
    if (categories) {
      const categoryArray = categories.split(",");
      conditions.push(`"Category" = ANY($${paramIndex}::text[])`);
      params.push(categoryArray);
      paramIndex++;
    }

    // Filter by sellers if provided
    if (sellers) {
      const sellerArray = sellers.split(",");
      conditions.push(`"Seller" = ANY($${paramIndex}::text[])`);
      params.push(sellerArray);
      paramIndex++;
    }

    // Filter by seller categories if provided
    if (sellerCategories) {
      const sellerCategoryArray = sellerCategories.split(",");
      conditions.push(`"Seller Category" = ANY($${paramIndex}::text[])`);
      params.push(sellerCategoryArray);
      paramIndex++;
    }

    // Hour filter if exists
    const hourFilter = addHourFilter(req);
    if (hourFilter) {
      conditions.push(hourFilter.condition.replace("PARAM", paramIndex));
      params.push(hourFilter.hoursArray);
      paramIndex++;
    }

    // Append conditions to query
    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    // Group by category and order by total_price descending
    query += `
      GROUP BY "Category"
      ORDER BY total_price DESC
    `;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




// Endpoint: Distinct Article Names with filters
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
    // Hour filter
    const hourFilter = addHourFilter(req);
    if (hourFilter) {
      conditions.push(hourFilter.condition.replace("PARAM", paramIndex));
      params.push(hourFilter.hoursArray);
      paramIndex++;
    }
    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }
    query += " ORDER BY \"Article_Name\"";
    const result = await pool.query(query, params);
    res.json(result.rows.map((row) => row.Article_Name));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint: Most Sold Items by Quantity
app.get("/sales/most-sold-items", async (req, res) => {
  try {
    const { startDate, endDate, sellers, sellerCategories, articleNames, categories } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Please provide startDate and endDate" });
    }

    const adjustedStartDate = moment(startDate).startOf("day").toISOString();
    const adjustedEndDate = moment(endDate).endOf("day").toISOString();
    const sellerArray = sellers ? sellers.split(",") : [];
    const sellerCategoryArray = sellerCategories ? sellerCategories.split(",") : [];
    const articleNameArray = articleNames ? articleNames.split(",") : [];
    const categoryArray = categories ? categories.split(",") : [];
    let query = `
      SELECT "Article_Name", SUM("Quantity") AS total_quantity
      FROM "sales"
      WHERE "Datetime" BETWEEN $1 AND $2
    `;
    const params = [adjustedStartDate, adjustedEndDate];
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
    // Hour filter
    const hourFilter = addHourFilter(req);
    if (hourFilter) {
      query += hourFilter.condition.replace("PARAM", paramIndex);
      params.push(hourFilter.hoursArray);
      paramIndex++;
    }
    query += `
      GROUP BY "Article_Name"
      ORDER BY total_quantity DESC;
    `;
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint: Most Sold Items by Price
app.get("/sales/most-sold-items-by-price", async (req, res) => {
  try {
    const { startDate, endDate, sellers, sellerCategories, articleNames, categories } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Please provide startDate and endDate" });
    }

    const adjustedStartDate = moment(startDate).startOf("day").toISOString();
    const adjustedEndDate = moment(endDate).endOf("day").toISOString();
    const sellerArray = sellers ? sellers.split(",") : [];
    const sellerCategoryArray = sellerCategories ? sellerCategories.split(",") : [];
    const articleNameArray = articleNames ? articleNames.split(",") : [];
    const categoryArray = categories ? categories.split(",") : [];
    let query = `
      SELECT "Article_Name", 
             SUM("Total_Article_Price") AS total_price,
             SUM("Quantity") AS total_quantity
      FROM "sales"
      WHERE "Datetime" BETWEEN $1 AND $2
    `;
    const params = [adjustedStartDate, adjustedEndDate];
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
    // Hour filter
    const hourFilter = addHourFilter(req);
    if (hourFilter) {
      query += hourFilter.condition.replace("PARAM", paramIndex);
      params.push(hourFilter.hoursArray);
      paramIndex++;
    }
    query += `
      GROUP BY "Article_Name"
      ORDER BY total_price DESC;
    `;
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint: Total Sales
app.get("/sales/total-sales", async (req, res) => {
  try {
    const { startDate, endDate, sellers, sellerCategories, articleNames, categories } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Please provide startDate and endDate" });
    }

    const adjustedStartDate = moment(startDate).startOf("day").toISOString();
    const adjustedEndDate = moment(endDate).endOf("day").toISOString();

    const sellerArray = sellers ? sellers.split(",") : [];
    const sellerCategoryArray = sellerCategories ? sellerCategories.split(",") : [];
    const articleNameArray = articleNames ? articleNames.split(",") : [];
    const categoryArray = categories ? categories.split(",") : [];
    let query = `
      SELECT COALESCE(SUM("Total_Article_Price"), 0) AS total_sales
      FROM "sales"
      WHERE "Datetime" BETWEEN $1 AND $2
    `;
    const params = [adjustedStartDate, adjustedEndDate];
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
    // Hour filter
    const hourFilter = addHourFilter(req);
    if (hourFilter) {
      query += hourFilter.condition.replace("PARAM", paramIndex);
      params.push(hourFilter.hoursArray);
      paramIndex++;
    }
    const result = await pool.query(query, params);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint: Sales by Seller Category
app.get("/sales/sales-by-seller-category", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Please provide startDate and endDate" });
    }

    let query = `
      SELECT "Seller Category", SUM("Total_Article_Price") AS total_sales
      FROM "sales"
      WHERE "Datetime" BETWEEN $1 AND $2
    `;
    const params = [startDate, endDate];
    let paramIndex = 3;
    // Hour filter
    const hourFilter = addHourFilter(req);
    if (hourFilter) {
      query += hourFilter.condition.replace("PARAM", paramIndex);
      params.push(hourFilter.hoursArray);
      paramIndex++;
    }
    query += `
      GROUP BY "Seller Category"
      ORDER BY total_sales DESC;
    `;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint: Total Quantity
app.get("/sales/total-quantity", async (req, res) => {
  try {
    const { startDate, endDate, sellers, sellerCategories, articleNames, categories } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Please provide startDate and endDate" });
    }
    const adjustedStartDate = moment(startDate).startOf("day").toISOString();
    const adjustedEndDate = moment(endDate).endOf("day").toISOString();
    const sellerArray = sellers ? sellers.split(",") : [];
    const sellerCategoryArray = sellerCategories ? sellerCategories.split(",") : [];
    const articleNameArray = articleNames ? articleNames.split(",") : [];
    const categoryArray = categories ? categories.split(",") : [];
    let query = `
      SELECT COALESCE(SUM("Quantity"), 0) AS total_quantity
      FROM "sales"
      WHERE "Datetime" BETWEEN $1 AND $2
    `;
    const params = [adjustedStartDate, adjustedEndDate];
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
    // Hour filter
    const hourFilter = addHourFilter(req);
    if (hourFilter) {
      query += hourFilter.condition.replace("PARAM", paramIndex);
      params.push(hourFilter.hoursArray);
      paramIndex++;
    }
    const result = await pool.query(query, params);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint: Average Article Price
app.get("/sales/avg-article-price", async (req, res) => {
  try {
    const { startDate, endDate, sellers, sellerCategories, articleNames, categories } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Please provide startDate and endDate" });
    }
    const adjustedStartDate = moment(startDate).startOf("day").toISOString();
    const adjustedEndDate = moment(endDate).endOf("day").toISOString();
    const sellerArray = sellers ? sellers.split(",") : [];
    const sellerCategoryArray = sellerCategories ? sellerCategories.split(",") : [];
    const articleNameArray = articleNames ? articleNames.split(",") : [];
    const categoryArray = categories ? categories.split(",") : [];
    let query = `
      SELECT COALESCE(SUM("Total_Article_Price")/NULLIF(SUM("Quantity"),0), 0) AS avg_price
      FROM "sales"
      WHERE "Datetime" BETWEEN $1 AND $2
    `;
    const params = [adjustedStartDate, adjustedEndDate];
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
    // Hour filter
    const hourFilter = addHourFilter(req);
    if (hourFilter) {
      query += hourFilter.condition.replace("PARAM", paramIndex);
      params.push(hourFilter.hoursArray);
      paramIndex++;
    }
    const result = await pool.query(query, params);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint: Daily Sales Data
app.get("/sales/daily-sales", async (req, res) => {
  try {
    const { startDate, endDate, sellers, sellerCategories, articleNames, categories } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Please provide startDate and endDate" });
    }

    const adjustedStartDate = moment(startDate).startOf("day").toISOString();
    const adjustedEndDate = moment(endDate).endOf("day").toISOString();
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
    const params = [adjustedStartDate, adjustedEndDate];
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
    // Hour filter
    const hourFilter = addHourFilter(req);
    if (hourFilter) {
      query += hourFilter.condition.replace("PARAM", paramIndex);
      params.push(hourFilter.hoursArray);
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

// Endpoint: Unique Order_ID count (order count)
app.get("/sales/order-count", async (req, res) => {
  try {
    const { startDate, endDate, sellers, sellerCategories, articleNames, categories } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Please provide startDate and endDate" });
    }

    const adjustedStartDate = moment(startDate).startOf("day").toISOString();
    const adjustedEndDate = moment(endDate).endOf("day").toISOString();

    const sellerArray = sellers ? sellers.split(",") : [];
    const sellerCategoryArray = sellerCategories ? sellerCategories.split(",") : [];
    const articleNameArray = articleNames ? articleNames.split(",") : [];
    const categoryArray = categories ? categories.split(",") : [];

    let query = `
      SELECT COUNT(DISTINCT "Order_ID") AS order_count
      FROM "sales"
      WHERE "Datetime" BETWEEN $1 AND $2
    `;
    const params = [adjustedStartDate, adjustedEndDate];
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
    // Hour filter
    const hourFilter = addHourFilter(req);
    if (hourFilter) {
      query += hourFilter.condition.replace("PARAM", paramIndex);
      params.push(hourFilter.hoursArray);
      paramIndex++;
    }

    const result = await pool.query(query, params);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});









/* ===============================
   SALES ENDPOINTS - SQL TABLE SALES

  END OF SALES ENDPOINTS
   =============================== */






























































// -----------------------------------------------------------------------------
// 2) Create daily_expenses table if not exists
// -----------------------------------------------------------------------------
const createDailyExpensesTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS daily_expenses (
      id SERIAL PRIMARY KEY,
      date DATE NOT NULL,
      seller TEXT NOT NULL,
      daily_total TEXT,
      cash_daily_total TEXT,
      expense TEXT,
      amount TEXT,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(query);
    console.log("daily_expenses table created or already exists.");
  } catch (error) {
    console.error("Error creating daily_expenses table:", error);
  }
};
createDailyExpensesTable();

// -----------------------------------------------------------------------------
// 3) API Endpoints
// -----------------------------------------------------------------------------

/**
 * POST /expenses/bulk
 * Insert multiple entries for the same date in one transaction.
 */
app.post("/expenses/bulk", async (req, res) => {
  const { selectedDate, entries } = req.body;
  if (!selectedDate || !entries || !Array.isArray(entries)) {
    return res.status(400).json({ error: "Invalid request payload" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const entry of entries) {
      const { seller, dailyTotal, cashDailyTotal, expense, amount, description } = entry;
      await client.query(
        `INSERT INTO daily_expenses
         (date, seller, daily_total, cash_daily_total, expense, amount, description, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)`,
        [selectedDate, seller, dailyTotal, cashDailyTotal, expense, amount, description]
      );
    }
    await client.query("COMMIT");
    res.status(201).json({ message: "Daily expenses saved successfully" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error inserting daily expenses:", error);
    res.status(500).json({ error: "Failed to save daily expenses" });
  } finally {
    client.release();
  }
});

/**
 * GET /expenses/bulk?date=YYYY-MM-DD
 * Fetch all expenses for a specific date
 */
app.get("/expenses/bulk", async (req, res) => {
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ error: "Please provide a date in YYYY-MM-DD format" });
  }
  try {
    // Use moment.utc to avoid local timezone shifts
    const adjustedStartDate = moment.utc(date).startOf("day").toISOString();
    const adjustedEndDate = moment.utc(date).endOf("day").toISOString();

    const result = await pool.query(
      `SELECT id, seller, daily_total, cash_daily_total, expense, amount, description, date
       FROM daily_expenses
       WHERE date BETWEEN $1 AND $2
       ORDER BY date ASC`,
      [adjustedStartDate, adjustedEndDate]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching daily expenses:", err);
    res.status(500).json({ error: "Failed to fetch daily expenses" });
  }
});

/**
 * DELETE /expenses/bulk?date=YYYY-MM-DD
 * Deletes all daily_expenses for the specified date (bulk delete).
 */
app.delete("/expenses/bulk", async (req, res) => {
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ error: "Missing date in query params" });
  }

  try {
    // Start/end of the day in UTC
    const startOfDay = moment.utc(date).startOf("day").format("YYYY-MM-DD HH:mm:ss");
    const endOfDay = moment.utc(date).endOf("day").format("YYYY-MM-DD HH:mm:ss");

    const result = await pool.query(
      `DELETE FROM daily_expenses
       WHERE date >= $1 AND date <= $2`,
      [startOfDay, endOfDay]
    );

    res.json({
      message: `Deleted ${result.rowCount} entries for date ${date}`,
    });
  } catch (error) {
    console.error("Error deleting daily expenses by date:", error);
    res.status(500).json({ error: "Failed to delete daily expenses by date" });
  }
});

/**
 * DELETE /expenses/bulk/:id
 * Delete a single expense by ID
 */
app.delete("/expenses/bulk/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM daily_expenses WHERE id = $1 RETURNING *", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Expense not found" });
    }
    res.json({ message: "Daily expense deleted successfully" });
  } catch (error) {
    console.error("Error deleting daily expense:", error);
    res.status(500).json({ error: "Failed to delete daily expense" });
  }
});

/**
 * PUT /expenses/bulk/:id
 * Update a single expense by ID
 */
app.put("/expenses/bulk/:id", async (req, res) => {
  const { id } = req.params;
  const { expense, amount, dailyTotal, cashDailyTotal } = req.body;
  try {
    const result = await pool.query(
      `UPDATE daily_expenses
       SET expense = $2,
           amount = $3,
           daily_total = $4,
           cash_daily_total = $5
       WHERE id = $1
       RETURNING *`,
      [id, expense, amount, dailyTotal, cashDailyTotal]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Expense not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).json({ error: "Failed to update expense" });
  }
});















const createModifiedExpensesTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS modified_expenses (
      id SERIAL PRIMARY KEY,
      date DATE NOT NULL,
      supplier TEXT NOT NULL,
      total_amount TEXT,
      amount_paid TEXT,
      description TEXT,
      transaction_type TEXT,  -- new column for transaction type
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(query);
    console.log("modified_expenses table created or already exists.");
  } catch (error) {
    console.error("Error creating modified_expenses table:", error);
  }
};
createModifiedExpensesTable();

// -----------------------------------------------------------------------------
// POST Endpoint to Save a Custom Modified Row (now accepts transactionType)
// -----------------------------------------------------------------------------
app.post("/modified-expenses", async (req, res) => {
  const { selectedDate, supplier, totalAmount, amountPaid, description, transactionType } = req.body;
  
  if (!selectedDate || !supplier) {
    return res.status(400).json({ error: "Missing required fields: selectedDate and supplier are required" });
  }
  
  try {
    const result = await pool.query(
      `INSERT INTO modified_expenses
       (date, supplier, total_amount, amount_paid, description, transaction_type, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
       RETURNING *`,
      [selectedDate, supplier, totalAmount, amountPaid, description, transactionType]
    );
    res.status(201).json({ message: "Modified expense saved successfully", row: result.rows[0] });
  } catch (error) {
    console.error("Error saving modified expense:", error);
    res.status(500).json({ error: "Failed to save modified expense" });
  }
});

// -----------------------------------------------------------------------------
// GET Endpoint to Retrieve All Custom Rows for a Specific Date
// -----------------------------------------------------------------------------
app.get("/modified-expenses", async (req, res) => {
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ error: "Missing date query parameter" });
  }
  
  try {
    const formattedDate = moment(date).format("YYYY-MM-DD");
    const result = await pool.query(
      `SELECT * FROM modified_expenses
       WHERE date = $1
       ORDER BY created_at ASC`,
      [formattedDate]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching modified expenses:", error);
    res.status(500).json({ error: "Failed to fetch modified expenses" });
  }
});

// -----------------------------------------------------------------------------
// PUT Endpoint to Update a Custom Modified Row (now accepts transactionType)
// -----------------------------------------------------------------------------
app.put("/modified-expenses/:id", async (req, res) => {
  const { id } = req.params;
  const { supplier, totalAmount, amountPaid, description, transactionType } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE modified_expenses
       SET supplier = $1,
           total_amount = $2,
           amount_paid = $3,
           description = $4,
           transaction_type = $5,
           created_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [supplier, totalAmount, amountPaid, description, transactionType, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Modified expense not found" });
    }
    res.json({ message: "Modified expense updated successfully", row: result.rows[0] });
  } catch (error) {
    console.error("Error updating modified expense:", error);
    res.status(500).json({ error: "Failed to update modified expense" });
  }
});

// -----------------------------------------------------------------------------
// DELETE Endpoint to Remove a Custom Modified Row
// -----------------------------------------------------------------------------
app.delete("/modified-expenses/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM modified_expenses WHERE id = $1 RETURNING *", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Modified expense not found" });
    }
    res.json({ message: "Modified expense deleted successfully" });
  } catch (error) {
    console.error("Error deleting modified expense:", error);
    res.status(500).json({ error: "Failed to delete modified expense" });
  }
});

// -----------------------------------------------------------------------------
// NEW Aggregated GET Endpoint: Group by Supplier Across ALL Dates
// -----------------------------------------------------------------------------
app.get("/aggregated-modified-expenses", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT supplier,
             SUM(COALESCE(CAST(total_amount AS NUMERIC), 0)) AS aggregated_total_amount,
             SUM(COALESCE(CAST(amount_paid AS NUMERIC), 0)) AS aggregated_amount_paid
      FROM modified_expenses
      GROUP BY supplier
      ORDER BY supplier ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching aggregated modified expenses:", error);
    res.status(500).json({ error: "Failed to fetch aggregated modified expenses" });
  }
});






























































































/******************************************************
 * ARTICLE_INGREDIENTS TABLE & ENDPOINTS (Manual Entry)
 ******************************************************/



app.post("/article-ingredients/bulk", async (req, res) => {
  const { entries } = req.body;
  if (!entries || !Array.isArray(entries)) {
    return res.status(400).json({ error: "Invalid request payload" });
  }
  
  // Group the entries by article name
  const grouped = {};
  entries.forEach(entry => {
    const { articleName, ingredientName, ingredientUsage } = entry;
    const art = articleName.trim();
    if (!art) return;
    if (!grouped[art]) {
      grouped[art] = [];
    }
    if (ingredientName.trim() || ingredientUsage.trim()) {
      grouped[art].push({
        ingredientName: ingredientName.trim(),
        ingredientUsage: ingredientUsage.trim()
      });
    }
  });
  
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const maxIngredients = 5;
    for (const article in grouped) {
      const ingredients = grouped[article];
      // Create arrays for ingredient names and usage values, filling missing slots with null.
      const ingColumns = [];
      const usageColumns = [];
      for (let i = 0; i < maxIngredients; i++) {
        if (i < ingredients.length) {
          ingColumns.push(ingredients[i].ingredientName);
          // Convert usage to a numeric value; if conversion fails or is empty, set to null.
          const usage = ingredients[i].ingredientUsage;
          usageColumns.push(usage !== "" ? parseFloat(usage) : null);
        } else {
          ingColumns.push(null);
          usageColumns.push(null);
        }
      }
      const query = `
        INSERT INTO article_ingredients (
          article_name,
          ingredient_name_01, usage_amount_01,
          ingredient_name_02, usage_amount_02,
          ingredient_name_03, usage_amount_03,
          ingredient_name_04, usage_amount_04,
          ingredient_name_05, usage_amount_05
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (article_name)
        DO UPDATE SET
          ingredient_name_01 = EXCLUDED.ingredient_name_01,
          usage_amount_01 = EXCLUDED.usage_amount_01,
          ingredient_name_02 = EXCLUDED.ingredient_name_02,
          usage_amount_02 = EXCLUDED.usage_amount_02,
          ingredient_name_03 = EXCLUDED.ingredient_name_03,
          usage_amount_03 = EXCLUDED.usage_amount_03,
          ingredient_name_04 = EXCLUDED.ingredient_name_04,
          usage_amount_04 = EXCLUDED.usage_amount_04,
          ingredient_name_05 = EXCLUDED.ingredient_name_05,
          usage_amount_05 = EXCLUDED.usage_amount_05;
      `;
      await client.query(query, [
        article,
        ingColumns[0], usageColumns[0],
        ingColumns[1], usageColumns[1],
        ingColumns[2], usageColumns[2],
        ingColumns[3], usageColumns[3],
        ingColumns[4], usageColumns[4]
      ]);
    }
    await client.query("COMMIT");
    res.status(201).json({ message: "Article → Ingredients saved successfully" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error saving article ingredients:", error);
    res.status(500).json({ error: "Failed to save article ingredients" });
  } finally {
    client.release();
  }
});

// GET /article-ingredients - Fetch all article-ingredient mappings
app.get("/article-ingredients", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
         article_name, 
         ingredient_name_01, usage_amount_01,
         ingredient_name_02, usage_amount_02,
         ingredient_name_03, usage_amount_03,
         ingredient_name_04, usage_amount_04,
         ingredient_name_05, usage_amount_05,
         created_at
       FROM article_ingredients
       ORDER BY article_name`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching article ingredients:", error);
    res.status(500).json({ error: "Failed to fetch article ingredients" });
  }
});

app.patch("/article-ingredients/:article_name", async (req, res) => {
  const { article_name } = req.params;
  const { new_article_name } = req.body;

  if (!new_article_name || new_article_name.trim() === "") {
    return res.status(400).json({ error: "New article name is required" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Update the article name in the database
    const result = await client.query(
      `UPDATE article_ingredients
       SET article_name = $1
       WHERE article_name = $2;`,
      [new_article_name.trim(), article_name]
    );

    if (result.rowCount === 0) {
      throw new Error("Article not found or name already exists");
    }

    await client.query("COMMIT");
    res.status(200).json({ message: "Article name updated successfully" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating article name:", error);
    res.status(500).json({ error: "Failed to update article name" });
  } finally {
    client.release();
  }
});

app.put("/article-ingredients/:article_name", async (req, res) => {
  const { article_name } = req.params;
  const updates = req.body;

  // Convert empty string fields to null
  Object.keys(updates).forEach((key) => {
    if (updates[key] === "") {
      updates[key] = null;
    }
  });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const query = `
      UPDATE article_ingredients
      SET
        ingredient_name_01 = $2,
        usage_amount_01 = $3,
        ingredient_name_02 = $4,
        usage_amount_02 = $5,
        ingredient_name_03 = $6,
        usage_amount_03 = $7,
        ingredient_name_04 = $8,
        usage_amount_04 = $9,
        ingredient_name_05 = $10,
        usage_amount_05 = $11
      WHERE article_name = $1;
    `;

    await client.query(query, [
      article_name,
      updates.ingredient_name_01,
      updates.usage_amount_01,
      updates.ingredient_name_02,
      updates.usage_amount_02,
      updates.ingredient_name_03,
      updates.usage_amount_03,
      updates.ingredient_name_04,
      updates.usage_amount_04,
      updates.ingredient_name_05,
      updates.usage_amount_05,
    ]);

    await client.query("COMMIT");
    res.status(200).json({ message: "Article updated successfully" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating article ingredients:", error);
    res.status(500).json({ error: "Failed to update article ingredients" });
  } finally {
    client.release();
  }
});

// DELETE /article-ingredients/:article_name - Delete an article by name
app.delete("/article-ingredients/:article_name", async (req, res) => {
  const { article_name } = req.params;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const result = await client.query(
      `DELETE FROM article_ingredients WHERE article_name = $1;`,
      [article_name]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Article not found" });
    }

    await client.query("COMMIT");
    res.status(200).json({ message: "Article deleted successfully" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error deleting article:", error);
    res.status(500).json({ error: "Failed to delete article" });
  } finally {
    client.release();
  }
});


































































/******************************************************
 * report endpoint total ingredient usage for article names
 ******************************************************/











// GET /report/ingredient-usage - Report total ingredient usage based on sales
app.get("/report/ingredient-usage", async (req, res) => {
  try {
    const { startDate, endDate, articleNames } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Please provide startDate and endDate" });
    }
    
    // Adjust dates to UTC start and end of day
    const adjustedStartDate = moment.utc(startDate).startOf("day").toISOString();
    const adjustedEndDate = moment.utc(endDate).endOf("day").toISOString();
    
    // Base query: aggregate total quantity sold per article within the date range,
    // and join with article_ingredients table to get per-article ingredient mapping.


    
    let query = `
  
      SELECT 
        s."Article_Name" AS article_name,
        SUM(s."Quantity"::numeric) AS total_sold,
        ai.ingredient_name_01,
        ai.usage_amount_01,
        ai.ingredient_name_02,
        ai.usage_amount_02,
        ai.ingredient_name_03,
        ai.usage_amount_03,
        ai.ingredient_name_04,
        ai.usage_amount_04,
        ai.ingredient_name_05,
        ai.usage_amount_05
      FROM "sales" s
      JOIN article_ingredients ai ON s."Article_Name" = ai.article_name
      WHERE s."Datetime" BETWEEN $1 AND $2
    `;
    
    const params = [adjustedStartDate, adjustedEndDate];
    
    // Optionally filter by a list of article names if provided.
    if (articleNames) {
      const articleArray = articleNames.split(",").map(a => a.trim());
      query += ` AND s."Article_Name" = ANY($3::text[]) `;
      params.push(articleArray);
    }
    
    query += `
      GROUP BY s."Article_Name", 
               ai.ingredient_name_01, ai.usage_amount_01,
               ai.ingredient_name_02, ai.usage_amount_02,
               ai.ingredient_name_03, ai.usage_amount_03,
               ai.ingredient_name_04, ai.usage_amount_04,
               ai.ingredient_name_05, ai.usage_amount_05
      ORDER BY s."Article_Name"
    `;
    
    const result = await pool.query(query, params);
    
    // For each article row, calculate total ingredient usage.
    const report = result.rows.map(row => {
      const ingredientUsage = {};
      for (let i = 1; i <= 5; i++) {
        const ingKey = `ingredient_name_0${i}`;
        const usageKey = `usage_amount_0${i}`;
        const ingredient = row[ingKey];
        const usagePerUnit = row[usageKey];
        if (ingredient && usagePerUnit != null) {
          ingredientUsage[ingredient] = parseFloat(usagePerUnit) * parseFloat(row.total_sold);
        }
      }
      return {
        articleName: row.article_name,
        totalSold: parseFloat(row.total_sold),
        ingredientUsage,
      };
    });
    
    res.json(report);
  } catch (err) {
    console.error("Error generating ingredient usage report:", err);
    res.status(500).json({ error: err.message });







































































  }
});
/******************************************************
 * MISSING ARTICLES PAGE
 ******************************************************/









// GET /report/missing-articles - Find articles from sales not in article_ingredients
app.get("/report/missing-articles", async (req, res) => {
  try {
    const { startDate, endDate, search } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Please provide startDate and endDate" });
    }

    let query = `
      SELECT DISTINCT s."Article_Name" AS article_name
      FROM sales s
      LEFT JOIN article_ingredients ai
      ON s."Article_Name" = ai.article_name
      WHERE s."Datetime" BETWEEN $1 AND $2
      AND ai.article_name IS NULL
    `;

    const params = [startDate, endDate];

    // Optional: Filter by article name (search)
    if (search) {
      query += ` AND s."Article_Name" ILIKE $3`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY s."Article_Name";`;

    const result = await pool.query(query, params);

    const missingArticles = result.rows.map(row => ({
      articleName: row.article_name,
    }));

    res.json(missingArticles);
  } catch (err) {
    console.error("Error generating missing articles report:", err);
    res.status(500).json({ error: err.message });
  }
});







































































/* ===============================
   INVENTORY ENDPOINTS
   =============================== */




   app.get("/inventory/date", async (req, res) => {
    const { date } = req.query; // date expected in YYYY-MM-DD format
    if (!date) {
      return res.status(400).json({ error: "Please provide a date in YYYY-MM-DD format" });
    }
    try {
      const result = await pool.query(
        `SELECT id, article_name, total, inventory_type, entry_date, created_at
         FROM inventory
         WHERE entry_date = $1
         ORDER BY entry_date ASC`,
        [date]
      );
      res.json(result.rows);
    } catch (err) {
      console.error("Error fetching inventory by date:", err);
      res.status(500).json({ error: err.message });
    }
  });
  
  // POST /inventory - Add a new inventory item
  app.post("/inventory", async (req, res) => {
    try {
      const { article_name, total, inventory_type, date } = req.body;
      if (!article_name || total === undefined || !inventory_type || !date) {
        return res.status(400).json({ error: "article_name, total, inventory_type and date are required" });
      }
      const result = await pool.query(
        `INSERT INTO inventory (article_name, total, inventory_type, entry_date)
         VALUES ($1, $2, $3, $4)
         RETURNING id, article_name, total, inventory_type, entry_date, created_at`,
        [article_name, total, inventory_type, date]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error("Error adding inventory item:", err);
      res.status(500).json({ error: err.message });
    }
  });
  // PUT /inventory/:id - Update an inventory item
  app.put("/inventory/:id", async (req, res) => {
    try {
      const { id } = req.params;
      // Allow updating article_name, total and optionally inventory_type and entry_date.
      const { article_name, total, inventory_type, date } = req.body;
      if (!article_name || total === undefined) {
        return res.status(400).json({ error: "article_name and total are required" });
      }
      const result = await pool.query(
        `UPDATE inventory
         SET article_name = $1, total = $2, inventory_type = COALESCE($3, inventory_type), entry_date = COALESCE($4, entry_date)
         WHERE id = $5
         RETURNING id, article_name, total, inventory_type, entry_date, created_at`,
        [article_name, total, inventory_type, date, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Inventory item not found" });
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error("Error updating inventory item:", err);
      res.status(500).json({ error: err.message });
    }
  });
  
  
  app.delete("/inventory/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        `DELETE FROM inventory WHERE id = $1 RETURNING id`,
        [id]
      );
      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Inventory item not found" });
      }
      res.json({ message: "Inventory item deleted successfully" });
    } catch (err) {
      console.error("Error deleting inventory item:", err);
      res.status(500).json({ error: err.message });
    }
  });
  
  // Optional: GET /inventory/date - Get inventory items created on a given date
  app.get("/inventory/date", async (req, res) => {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: "Please provide a date in YYYY-MM-DD format" });
    }
    try {
      const result = await pool.query(
        `SELECT id, article_name, total, entry_date, created_at
         FROM inventory
         WHERE entry_date = $1
         ORDER BY entry_date ASC`,
        [date]
      );
      res.json(result.rows);
    } catch (err) {
      console.error("Error fetching inventory by date:", err);
      res.status(500).json({ error: err.message });
    }
  });


























/* ===============================
   SERVING THE REACT APP
   =============================== */

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// Serve the React app for all other routes (React Router)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
