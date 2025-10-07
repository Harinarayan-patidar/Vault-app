import { NextResponse } from "next/server";
import VaultItem from "@/models/VaultItem";
import { connectDB } from "@/lib/db";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET as string;
if (!SECRET) throw new Error("JWT_SECRET not defined");

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Type-safe JWT decoding
    const decoded = jwt.verify(token, SECRET) as unknown as { userId: string };

    await connectDB();

    const deleted = await VaultItem.findOneAndDelete({
      _id: params.id,
      userId: decoded.userId,
    });

    if (!deleted)
      return NextResponse.json({ error: "Item not found" }, { status: 404 });

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to delete", details: message },
      { status: 500 }
    );
  }
}
