import mongoose, { HydratedDocument, Model, Schema, Types } from 'mongoose';

export type CategoryType = 'income' | 'expense';

export interface ICategory {
    userId: Types.ObjectId | null;
    name: string;
    type: CategoryType;
    isDefault: boolean;
    createCategory(): Promise<CategoryDocument>;
    deleteCategory(): Promise<void>;
}

export type CategoryDocument = HydratedDocument<ICategory>;

interface CategoryModel extends Model<ICategory> {
    seedDefaultCategories(): Promise<void>;
}

const DEFAULT_CATEGORIES: Array<Pick<ICategory, 'name' | 'type' | 'isDefault'>> = [
    { name: 'Food & Dining', type: 'expense', isDefault: true },
    { name: 'Transport', type: 'expense', isDefault: true },
    { name: 'Bills & Utilities', type: 'expense', isDefault: true },
    { name: 'Entertainment', type: 'expense', isDefault: true },
    { name: 'Healthcare', type: 'expense', isDefault: true },
    { name: 'Shopping', type: 'expense', isDefault: true },
    { name: 'Education', type: 'expense', isDefault: true },
    { name: 'Other', type: 'expense', isDefault: true },
    { name: 'Salary', type: 'income', isDefault: true },
    { name: 'Freelance', type: 'income', isDefault: true },
    { name: 'Investment', type: 'income', isDefault: true }
];

const categorySchema = new Schema<ICategory, CategoryModel>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        name: {
            type: String,
            required: [true, 'Category name is required'],
            trim: true,
            maxlength: [50, 'Category name cannot exceed 50 characters']
        },
        type: {
            type: String,
            required: [true, 'Category type is required'],
            enum: {
                values: ['income', 'expense'],
                message: 'Category type must be income or expense'
            }
        },
        isDefault: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

categorySchema.methods.createCategory = async function (): Promise<CategoryDocument> {
    return await this.save();
};

categorySchema.methods.deleteCategory = async function (): Promise<void> {
    if (this.isDefault) {
        throw new Error('Cannot delete a default system category.');
    }
    await this.deleteOne();
};

categorySchema.statics.seedDefaultCategories = async function (): Promise<void> {
    const existingDefaults = await this.findOne({ isDefault: true });

    if (!existingDefaults) {
        await this.insertMany(DEFAULT_CATEGORIES);
        console.log('Default categories seeded successfully.');
    }
};

const Category = mongoose.model<ICategory, CategoryModel>('Category', categorySchema);
export default Category;
