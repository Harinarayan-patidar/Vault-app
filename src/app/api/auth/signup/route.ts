import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import { connectDB } from "@/lib/db";

interface SignupRequestBody {
  email: string;
  password: string;
}

interface SignupResponse {
  message?: string;
  userId?: string;
  error?: string;
}

export async function POST(req: Request): Promise<NextResponse<SignupResponse>> {
  try {
    const body: SignupRequestBody = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    await connectDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ email, password: hashedPassword });

    return NextResponse.json({
      message: "User created successfully",
      userId: newUser._id.toString(),
    });
  } catch (err: unknown) {
    console.error("Signup error:", err);

    // Optionally extract message if err is Error
    const message = err instanceof Error ? err.message : "Internal server error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
