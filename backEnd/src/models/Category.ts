import mongoose, { HydratedDocument, Model, Schema, Types } from "mongoose";

export type CategoryType = "income" | "expense";

export interface ICategory {
  userId: Types.ObjectId;
  name: string;
  type: CategoryType;
  limit: number; // The budget limit for this category
  createCategory(): Promise<CategoryDocument>;
  deleteCategory(): Promise<void>;
}

export type CategoryDocument = HydratedDocument<ICategory>;

interface CategoryModel extends Model<ICategory> {}

const categorySchema = new Schema<ICategory, CategoryModel>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      maxlength: [50, "Category name cannot exceed 50 characters"],
    },
    type: {
      type: String,
      required: [true, "Category type is required"],
      enum: {
        values: ["income", "expense"],
        message: "Category type must be income or expense",
      },
    },
    limit: {
      type: Number,
      default: 0, // 0 means no limit or not set
    },
  },
  {
    timestamps: true,
  },
);

categorySchema.methods.createCategory =
  async function (): Promise<CategoryDocument> {
    return await this.save();
  };

categorySchema.methods.deleteCategory = async function (): Promise<void> {
  await this.deleteOne();
};

const Category = mongoose.model<ICategory, CategoryModel>(
  "Category",
  categorySchema,
);
export default Category;
