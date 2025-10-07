import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import { connectDB } from "@/lib/db";

interface SignupRequestBody {
  email: string;
  password: string;
}

interface SignupResponse {
  message: string;
  userId?: string;
  error?: string;
}

export async function POST(req: Request): Promise<NextResponse<SignupResponse>> {
  try {
    // Parse request body
    const body: SignupRequestBody = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Ensure DB is connected
    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({ email, password: hashedPassword });

    return NextResponse.json({
      message: "User created successfully",
      userId: newUser._id.toString(),
    });
  } catch (err: any) {
    console.error("Signup error:", err);
    return NextResponse.json({ message: "Internal server error", error: "Internal server error" }, { status: 500 });
  }
}
