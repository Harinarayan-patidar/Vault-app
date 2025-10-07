import { NextResponse } from "next/server";
import VaultItem from "@/models/VaultItem";
import { connectDB } from "@/lib/db";
import jwt from "jsonwebtoken";
import CryptoJS from "crypto-js";

const SECRET = process.env.JWT_SECRET as string;
const CRYPTO_SECRET = process.env.CRYPTO_SECRET as string;

if (!SECRET) throw new Error("JWT_SECRET not defined");
if (!CRYPTO_SECRET) throw new Error("CRYPTO_SECRET not defined");

export async function POST(req: Request) {
  try {
    // 1️⃣ Get JWT token
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 2️⃣ Verify JWT and get userId
    const decoded = jwt.verify(token, SECRET) as unknown as { userId: string };

    // 3️⃣ Parse request body
    const body: Record<string, string | number> = await req.json();

    // 4️⃣ Connect to DB
    await connectDB();

    // 5️⃣ Encrypt all fields in body
    const encryptedData: Record<string, string> = {};
    for (const key in body) {
      if (body.hasOwnProperty(key)) {
        encryptedData[key] = CryptoJS.AES.encrypt(
          body[key].toString(),
          CRYPTO_SECRET as string
        ).toString();
      }
    }

    // 6️⃣ Create the item in DB with encrypted fields
    const item = await VaultItem.create({
      ...encryptedData,
      userId: decoded.userId,
    });

    // 7️⃣ Return success (do NOT return decrypted data)
    return NextResponse.json({ message: "Item added", item });
  } catch (err) {
    console.error("Vault POST error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to add vault item", details: message },
      { status: 500 }
    );
  }
}
