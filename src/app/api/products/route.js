import { NextResponse } from "next/server";
import { dbAll, dbGet, dbRun } from "../../../lib/db.js";
import { getAuthenticatedUser } from "../../../lib/auth.js";

// GET /api/products (Public) - supports query parameters ?category=X & q=search_term
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const q = searchParams.get("q");

    let query = "SELECT * FROM products WHERE 1=1";
    const params = [];

    if (category) {
      if (category.toLowerCase() === "new arrivals") {
        query += " AND category = ?";
        params.push("New Arrivals");
      } else if (category.toLowerCase() === "categories") {
        query += " AND category = ?";
        params.push("Categories");
      } else {
        query += " AND LOWER(category) = LOWER(?)";
        params.push(category);
      }
    }

    if (q) {
      query += " AND (LOWER(name) LIKE ? OR LOWER(description) LIKE ?)";
      const wildCard = `%${q.toLowerCase()}%`;
      params.push(wildCard, wildCard);
    }

    query += " ORDER BY id DESC";

    const products = await dbAll(query, params);
    return NextResponse.json(products);
  } catch (error) {
    console.error("Fetch products API error:", error);
    return NextResponse.json(
      { message: "Failed to load products" },
      { status: 500 }
    );
  }
}

// POST /api/products (Admin Only)
export async function POST(request) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { message: "Access denied: Admins only" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, price, category, image, sizes, stock } = body;

    if (!name || !description || price === undefined || !category || !image) {
      return NextResponse.json(
        { message: "Name, description, price, category, and image are required" },
        { status: 400 }
      );
    }

    const sizesStr = sizes || "S,M,L,XL";
    const stockVal = stock === undefined ? 10 : stock;

    const result = await dbRun(
      `INSERT INTO products (name, description, price, category, image, sizes, stock) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, description, price, category, image, sizesStr, stockVal]
    );

    const newProduct = await dbGet("SELECT * FROM products WHERE id = ?", [result.lastID]);
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("Add product API error:", error);
    return NextResponse.json(
      { message: "Failed to add product" },
      { status: 500 }
    );
  }
}
