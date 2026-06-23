import { NextResponse } from "next/server";
import { dbAll } from "../../../../../lib/db.js";
import { getAuthenticatedUser } from "../../../../../lib/auth.js";

// GET /api/orders/admin/list (Admin Only) - Get all orders across the platform
export async function GET(request) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { message: "Access denied: Admins only" },
        { status: 403 }
      );
    }

    const orders = await dbAll(
      `SELECT o.*, u.name as user_name, u.email as user_email 
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.id DESC`
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
    console.error("Admin fetch orders API error:", error);
    return NextResponse.json(
      { message: "Failed to retrieve order logs" },
      { status: 500 }
    );
  }
}
