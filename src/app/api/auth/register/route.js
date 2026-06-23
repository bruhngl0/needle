import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { dbGet, dbRun } from "../../../../lib/db.js";

const JWT_SECRET = process.env.JWT_SECRET || "needle_secret_key_123_abc";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await dbGet("SELECT id FROM users WHERE email = ?", [email.toLowerCase()]);
    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const role = email.toLowerCase() === "admin@needle.com" ? "admin" : "user";

    // Insert user
    await dbRun(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email.toLowerCase(), hashedPassword, role]
    );

    // Get the newly created user
    const newUser = await dbGet("SELECT id, name, email, role FROM users WHERE email = ?", [email.toLowerCase()]);

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Register API error:", error);
    return NextResponse.json(
      { message: "Failed to register user" },
      { status: 500 }
    );
  }
}
