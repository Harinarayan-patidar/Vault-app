import { Schema, model, models, Document, Types } from "mongoose";

interface IVaultItem extends Document {
  userId: Types.ObjectId;
  title?: string;
  username?: string;
  password?: string;
  url?: string;
  notes?: string;
}

const VaultItemSchema = new Schema<IVaultItem>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String },
    username: { type: String },
    password: { type: String },
    url: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

const VaultItem = models.VaultItem || model<IVaultItem>("VaultItem", VaultItemSchema);
export default VaultItem;
