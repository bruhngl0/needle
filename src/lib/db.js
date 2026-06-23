import pg from "pg";
import bcrypt from "bcryptjs";
import path from "path";
import fs from "fs";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

let pool = null;
let sqliteDb = null;

if (connectionString) {
  pool = new Pool({
    connectionString,
    ssl: connectionString.includes("localhost") || connectionString.includes("127.0.0.1") 
      ? false 
      : { rejectUnauthorized: false }
  });
} else {
  console.warn("⚠️ DATABASE_URL environment variable is missing. Falling back to SQLite database.");
}

async function getSqliteDb() {
  if (sqliteDb) return sqliteDb;
  const sqlite3 = (await import("sqlite3")).default;
  let dbPath = path.join(process.cwd(), "database.sqlite");
  const serverDbPath = path.join(process.cwd(), "../server/database.sqlite");
  if (fs.existsSync(serverDbPath)) {
    dbPath = serverDbPath;
  }
  return new Promise((resolve, reject) => {
    sqliteDb = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error("SQLite connection error:", err.message);
        reject(err);
      } else {
        console.log("Connected to SQLite database at:", dbPath);
        resolve(sqliteDb);
      }
    });
  });
}

// Helper: Translate SQLite '?' to Postgres '$1, $2, ...'
function translateQuery(sql) {
  let index = 1;
  return sql.replace(/\?/g, () => `$${index++}`);
}

export const dbRun = async (sql, params = []) => {
  if (pool) {
    const pgSql = translateQuery(sql);
    const isInsert = pgSql.trim().toUpperCase().startsWith("INSERT INTO");
    const finalSql = isInsert && !pgSql.toUpperCase().includes("RETURNING") 
      ? `${pgSql} RETURNING id` 
      : pgSql;

    const result = await pool.query(finalSql, params);
    
    return {
      lastID: isInsert && result.rows[0] ? result.rows[0].id : null,
      changes: result.rowCount
    };
  } else {
    const db = await getSqliteDb();
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }
};

export const dbGet = async (sql, params = []) => {
  if (pool) {
    const pgSql = translateQuery(sql);
    const result = await pool.query(pgSql, params);
    return result.rows[0] || null;
  } else {
    const db = await getSqliteDb();
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });
  }
};

export const dbAll = async (sql, params = []) => {
  if (pool) {
    const pgSql = translateQuery(sql);
    const result = await pool.query(pgSql, params);
    return result.rows;
  } else {
    const db = await getSqliteDb();
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }
};

export const initDb = async () => {
  if (!pool) {
    console.warn("Skipping DB schema init: connection pool not configged.");
    return;
  }

  // Create Users table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'user'
    )
  `);

  // Create Products table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      price DOUBLE PRECISION NOT NULL,
      category VARCHAR(255) NOT NULL,
      image VARCHAR(255) NOT NULL,
      sizes VARCHAR(255) DEFAULT 'S,M,L,XL',
      stock INTEGER DEFAULT 10
    )
  `);

  // Create Orders table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      shipping_name VARCHAR(255) NOT NULL,
      shipping_address VARCHAR(255) NOT NULL,
      shipping_city VARCHAR(255) NOT NULL,
      shipping_zip VARCHAR(50) NOT NULL,
      total_price DOUBLE PRECISION NOT NULL,
      status VARCHAR(50) DEFAULT 'Pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Order Items table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price DOUBLE PRECISION NOT NULL,
      size VARCHAR(50) NOT NULL
    )
  `);

  console.log("PostgreSQL database schemas successfully checked/created.");

  // Seed default admin and user
  const adminUser = await dbGet("SELECT * FROM users WHERE email = $1", ["admin@needle.com"]);
  if (!adminUser) {
    const adminHash = bcrypt.hashSync("adminpassword", 10);
    const userHash = bcrypt.hashSync("userpassword", 10);
    
    await dbRun(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      ["Needle Admin", "admin@needle.com", adminHash, "admin"]
    );
    await dbRun(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      ["John Doe", "user@needle.com", userHash, "user"]
    );
    console.log("Seed profiles added to PostgreSQL database.");
  }

  // Seed default products
  const productCount = await dbGet("SELECT COUNT(*) as count FROM products");
  if (parseInt(productCount.count, 10) === 0) {
    const defaultProducts = [
      {
        name: "Crimson Silk Gown",
        description: "A gorgeous, flowy crimson silk gown with open-back detailing. Crafted from 100% pure silk for a dramatic drape, perfect for gala evenings and formal events.",
        price: 249.99,
        category: "Dresses",
        image: "model1.png",
        sizes: "S,M,L",
        stock: 12
      },
      {
        name: "Elegance Knit Blazer",
        description: "Double-breasted knitted blazer structured with peak lapels and customized gold buttons. Blends casual warmth with modern sharp tailoring.",
        price: 189.99,
        category: "Outerwear",
        image: "model2.png",
        sizes: "S,M,L,XL",
        stock: 8
      },
      {
        name: "Minimalist Linen Coat",
        description: "A clean-lined lightweight coat made from premium washed linen. Embellished with subtle geometric stitch lines and a removable waist belt.",
        price: 299.99,
        category: "Dresses",
        image: "model3.png",
        sizes: "S,M,L",
        stock: 15
      },
      {
        name: "Cream Trench Outerwear",
        description: "An iconic neutral-tone trench coat tailored with heavy duty water-repellent gabardine. Features epaulets and a storm flap for ultimate seasonal layering.",
        price: 329.99,
        category: "Outerwear",
        image: "model4.png",
        sizes: "M,L,XL",
        stock: 6
      },
      {
        name: "Monochrome Knitwear Set",
        description: "Ultra-cozy high neck rib-knit top combined with high-waisted ribbed pants. Gives a sleek elongated silhouette in soft merino wool blend.",
        price: 159.99,
        category: "Knitwear",
        image: "model5.png",
        sizes: "S,M,L",
        stock: 10
      },
      {
        name: "Urban Casual Top",
        description: "Comfortable asymmetric knit top with raw sleeve edges. Easily pairs with high-waisted trousers or structured denim for daytime styling.",
        price: 89.99,
        category: "Tops",
        image: "model6.png",
        sizes: "S,M,L,XL",
        stock: 20
      },
      {
        name: "Signature Structured Dress",
        description: "A signature dress crafted in a sculptural weave, featuring a wrap neck bodice and an asymmetric hemline. A versatile item for desk-to-dinner elegance.",
        price: 210.00,
        category: "Dresses",
        image: "model7.png",
        sizes: "S,M,L",
        stock: 14
      },
      {
        name: "Crimson Velvet Pantsuit",
        description: "Richly textured crimson velvet matching set including a slim lapel blazer and wide-leg trousers. Designed to stand out in festive cocktail nights.",
        price: 275.00,
        category: "Outerwear",
        image: "model8.png",
        sizes: "S,M,L,XL",
        stock: 7
      }
    ];

    for (const p of defaultProducts) {
      await dbRun(
        "INSERT INTO products (name, description, price, category, image, sizes, stock) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [p.name, p.description, p.price, p.category, p.image, p.sizes, p.stock]
      );
    }
    console.log("Seed products added to PostgreSQL database.");
  }
};

if (pool) {
  initDb().catch(err => {
    console.error("Failed to automatically initialize/seed database:", err);
  });
}

