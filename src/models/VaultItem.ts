import mongoose, { Schema, model, models } from "mongoose";

const vaultSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: String,
  username: String,
  password: String,
  url: String,
  notes: String,
});

const VaultItem = models.VaultItem || model("VaultItem", vaultSchema);
export default VaultItem;
