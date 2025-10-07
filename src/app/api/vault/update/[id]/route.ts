import { NextResponse } from "next/server";
import VaultItem from "@/models/VaultItem";
import { connectDB } from "@/lib/db";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET!;

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded: any = jwt.verify(token, SECRET);
    await connectDB();

    const { title, username, password, url, notes } = await req.json();
    const updated = await VaultItem.findOneAndUpdate(
      { _id: params.id, userId: decoded.userId },
      { title, username, password, url, notes },
      { new: true }
    );

    if (!updated) return NextResponse.json({ error: "Item not found" }, { status: 404 });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update", details: err.message }, { status: 500 });
  }
}
