import { NextResponse } from "next/server";
import VaultItem from "@/models/VaultItem";
import { connectDB } from "@/lib/db";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET!;

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded: any = jwt.verify(token, SECRET);
    await connectDB();

    const deleted = await VaultItem.findOneAndDelete({ _id: params.id, userId: decoded.userId });
    if (!deleted) return NextResponse.json({ error: "Item not found" }, { status: 404 });

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete", details: err.message }, { status: 500 });
  }
}
