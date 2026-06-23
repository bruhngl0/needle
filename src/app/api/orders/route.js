import { NextResponse } from "next/server";
import { dbAll, dbGet, dbRun } from "../../../lib/db.js";
import { getAuthenticatedUser } from "../../../lib/auth.js";

// GET /api/orders (Authenticated User) - Get current user's order history
export async function GET(request) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { message: "Authentication token required" },
        { status: 401 }
      );
    }

    const orders = await dbAll(
      "SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC",
      [user.id]
    );

    const ordersWithItems = [];
    for (const order of orders) {
      const items = await dbAll(
        `SELECT oi.*, p.name as product_name, p.image as product_image
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      ordersWithItems.push({
        ...order,
        items,
      });
    }

    return NextResponse.json(ordersWithItems);
  } catch (error) {
    console.error("Fetch user orders API error:", error);
    return NextResponse.json(
      { message: "Failed to load order history" },
      { status: 500 }
    );
  }
}

// POST /api/orders (Authenticated User) - Place a new order
export async function POST(request) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { message: "Authentication token required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { shipping_name, shipping_address, shipping_city, shipping_zip, items } = body;

    if (!shipping_name || !shipping_address || !shipping_city || !shipping_zip || !items || !items.length) {
      return NextResponse.json(
        { message: "Shipping details and checkout items are required" },
        { status: 400 }
      );
    }

    // Calculate total price based on items
    let total_price = 0;
    for (const item of items) {
      total_price += item.price * item.quantity;
    }

    // Create the order entry
    const orderResult = await dbRun(
      `INSERT INTO orders (user_id, shipping_name, shipping_address, shipping_city, shipping_zip, total_price, status)
       VALUES (?, ?, ?, ?, ?, ?, 'Pending')`,
      [user.id, shipping_name, shipping_address, shipping_city, shipping_zip, total_price]
    );

    const orderId = orderResult.lastID;

    // Create order items & subtract product stock
    for (const item of items) {
      await dbRun(
        `INSERT INTO order_items (order_id, product_id, quantity, price, size)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.quantity, item.price, item.size]
      );

      // Subtract from product stock using Postgres GREATEST
      await dbRun(
        "UPDATE products SET stock = GREATEST(0, stock - ?) WHERE id = ?",
        [item.quantity, item.product_id]
      );
    }

    return NextResponse.json({
      message: "Order placed successfully",
      orderId,
      total_price,
    }, { status: 201 });
  } catch (error) {
    console.error("Place order API error:", error);
    return NextResponse.json(
      { message: "Failed to place order" },
      { status: 500 }
    );
  }
}
