import { NextResponse } from "next/server";
import VaultItem from "@/models/VaultItem";
import { connectDB } from "@/lib/db";
import jwt from "jsonwebtoken";
import CryptoJS from "crypto-js";

const SECRET = process.env.JWT_SECRET!;
const CRYPTO_SECRET = process.env.CRYPTO_SECRET!; // same key used while encrypting

export async function GET(req: Request) {
  try {
    // 1️⃣ Get JWT token
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 2️⃣ Verify JWT and get userId
    const decoded: any = jwt.verify(token, SECRET);

    // 3️⃣ Connect to DB
    await connectDB();

    // 4️⃣ Fetch all vault items for the user
    const items = await VaultItem.find({ userId: decoded.userId });

    // 5️⃣ Decrypt all fields for each item
    const decryptedItems = items.map((item) => {
      const decryptedItem: Record<string, any> = {};
      for (const key in item._doc) {
        if (key === "_id" || key === "userId" || key === "__v") {
          // keep non-encrypted fields as-is
          decryptedItem[key] = item[key];
        } else {
          try {
            decryptedItem[key] = CryptoJS.AES.decrypt(
              item[key],
              CRYPTO_SECRET
            ).toString(CryptoJS.enc.Utf8);
          } catch {
            decryptedItem[key] = item[key]; // fallback if not encrypted
          }
        }
      }
      return decryptedItem;
    });

    // 6️⃣ Return decrypted items
    return NextResponse.json(decryptedItems);
  } catch (err: any) {
    console.error("Vault GET error:", err);
    return NextResponse.json(
      { error: "Failed to fetch vault items", details: err.message },
      { status: 500 }
    );
  }
}
