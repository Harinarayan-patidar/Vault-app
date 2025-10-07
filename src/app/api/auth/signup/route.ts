import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import { connectDB } from "@/lib/db";

interface SignupRequestBody {
  email: string;
  password: string;
}

export async function POST(req: Request) {
  try {
    const body: SignupRequestBody = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Ensure DB is connected
    await connectDB();

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({ email, password: hashedPassword });

    return NextResponse.json({
      message: "User created successfully",
      userId: newUser._id,
    });
  } catch (err) {
    console.error("Signup error:", err);

    // Generic type-safe error handling
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
