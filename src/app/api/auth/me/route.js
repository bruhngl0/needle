import { NextResponse } from "next/server";
import { dbGet } from "../../../../lib/db.js";
import { getAuthenticatedUser } from "../../../../lib/auth.js";

export async function GET(request) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { message: "Authentication token required or invalid" },
        { status: 401 }
      );
    }

    const userData = await dbGet("SELECT id, name, email, role FROM users WHERE id = ?", [user.id]);
    if (!userData) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(userData);
  } catch (error) {
    console.error("Get profile details error:", error);
    return NextResponse.json(
      { message: "Failed to fetch profile details" },
      { status: 500 }
    );
  }
}
