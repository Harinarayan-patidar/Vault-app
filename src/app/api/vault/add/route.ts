import { NextResponse } from "next/server";
import VaultItem from "@/models/VaultItem";
import { connectDB } from "@/lib/db";
import jwt from "jsonwebtoken";
import CryptoJS from "crypto-js";

const SECRET = process.env.JWT_SECRET!;
const CRYPTO_SECRET = process.env.CRYPTO_SECRET!; // same key for encryption/decryption

export async function POST(req: Request) {
  try {
    // 1️⃣ Get JWT token
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 2️⃣ Verify JWT and get userId
    const decoded: any = jwt.verify(token, SECRET);

    // 3️⃣ Parse request body
    const body = await req.json();

    // 4️⃣ Connect to DB
    await connectDB();

    // 5️⃣ Encrypt all fields in body
    const encryptedData: Record<string, string> = {};
    for (const key in body) {
      if (body.hasOwnProperty(key)) {
        encryptedData[key] = CryptoJS.AES.encrypt(
          body[key].toString(),
          CRYPTO_SECRET
        ).toString();
      }
    }

    // 6️⃣ Create the item in DB with encrypted fields
    const item = await VaultItem.create({
      ...encryptedData,
      userId: decoded.userId, // userId can stay as plain text if needed for querying
    });

    // 7️⃣ Return success (do NOT return decrypted data)
    return NextResponse.json({ message: "Item added", item });
  } catch (err: any) {
    console.error("Vault POST error:", err);
    return NextResponse.json(
      { error: "Failed to add vault item", details: err.message },
      { status: 500 }
    );
  }
}
