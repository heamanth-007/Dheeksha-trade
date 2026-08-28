import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  slNo: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    slNo: { type: Number, required: true },
    name: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
