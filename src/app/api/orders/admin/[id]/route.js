import { NextResponse } from "next/server";
import { dbGet, dbRun } from "../../../../../lib/db.js";
import { getAuthenticatedUser } from "../../../../../lib/auth.js";

// PUT /api/orders/admin/:id (Admin Only) - Update order status
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
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { message: "Status state is required" },
        { status: 400 }
      );
    }

    const validStatuses = ["Pending", "Shipped", "Delivered", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { message: "Invalid order status code" },
        { status: 400 }
      );
    }

    const existing = await dbGet("SELECT id FROM orders WHERE id = ?", [id]);
    if (!existing) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    await dbRun("UPDATE orders SET status = ? WHERE id = ?", [status, id]);
    return NextResponse.json({ message: `Order status successfully updated to ${status}` });
  } catch (error) {
    console.error("Admin update order API error:", error);
    return NextResponse.json(
      { message: "Failed to update order status" },
      { status: 500 }
    );
  }
}
