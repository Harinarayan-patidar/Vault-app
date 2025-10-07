import { NextResponse } from "next/server";
import VaultItem from "@/models/VaultItem";
import { connectDB } from "@/lib/db";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET as string;
if (!SECRET) throw new Error("JWT_SECRET not defined");

interface PatchRequestBody {
  title?: string;
  username?: string;
  password?: string;
  url?: string;
  notes?: string;
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Type-safe JWT decoding
    const decoded = jwt.verify(token, SECRET) as jwt.JwtPayload;
    const userId = typeof decoded === "object" && decoded && "userId" in decoded ? decoded.userId as string : undefined;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body: PatchRequestBody = await req.json();
    const { title, username, password, url, notes } = body;

    const updated = await VaultItem.findOneAndUpdate(
      { _id: params.id, userId },
      { title, username, password, url, notes },
      { new: true }
    );

    if (!updated)
      return NextResponse.json({ error: "Item not found" }, { status: 404 });

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update", details: message },
      { status: 500 }
    );
  }
}
