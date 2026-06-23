import { NextResponse } from "next/server";
import { dbGet, dbRun } from "../../../../lib/db.js";
import { getAuthenticatedUser } from "../../../../lib/auth.js";

// GET /api/products/:id (Public)
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const product = await dbGet("SELECT * FROM products WHERE id = ?", [id]);
    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error("Fetch single product API error:", error);
    return NextResponse.json(
      { message: "Failed to load product details" },
      { status: 500 }
    );
  }
}

// PUT /api/products/:id (Admin Only)
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const user = getAuthenticatedUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { message: "Access denied: Admins only" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, price, category, image, sizes, stock } = body;

    const existing = await dbGet("SELECT id FROM products WHERE id = ?", [id]);
    if (!existing) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    if (!name || !description || price === undefined || !category || !image) {
      return NextResponse.json(
        { message: "Name, description, price, category, and image are required" },
        { status: 400 }
      );
    }

    await dbRun(
      `UPDATE products 
       SET name = ?, description = ?, price = ?, category = ?, image = ?, sizes = ?, stock = ? 
       WHERE id = ?`,
      [name, description, price, category, image, sizes, stock, id]
    );

    const updated = await dbGet("SELECT * FROM products WHERE id = ?", [id]);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update product API error:", error);
    return NextResponse.json(
      { message: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE /api/products/:id (Admin Only)
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const user = getAuthenticatedUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { message: "Access denied: Admins only" },
        { status: 403 }
      );
    }

    const existing = await dbGet("SELECT id FROM products WHERE id = ?", [id]);
    if (!existing) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    await dbRun("DELETE FROM products WHERE id = ?", [id]);
    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product API error:", error);
    return NextResponse.json(
      { message: "Failed to delete product" },
      { status: 500 }
    );
  }
}
