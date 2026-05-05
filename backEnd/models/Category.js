const mongoose = require('mongoose');

/**
 * @module Category
 * @description Represents a classification for expenses.
 * Directly maps to the Category entity in the class diagram.

 * Methods from class diagram:
 *   - createCategory()
 *   - deleteCategory()
 */

const DEFAULT_CATEGORIES = [ //b3rf el hagat el defualt lel categories bet3t el user
    { name: 'Food & Dining',    type: 'expense', isDefault: true },
    { name: 'Transport',        type: 'expense', isDefault: true },
    { name: 'Bills & Utilities',type: 'expense', isDefault: true },
    { name: 'Entertainment',    type: 'expense', isDefault: true },
    { name: 'Healthcare',       type: 'expense', isDefault: true },
    { name: 'Shopping',         type: 'expense', isDefault: true },
    { name: 'Education',        type: 'expense', isDefault: true },
    { name: 'Other',            type: 'expense', isDefault: true },
    { name: 'Salary',           type: 'income',  isDefault: true },
    { name: 'Freelance',        type: 'income',  isDefault: true },
    { name: 'Investment',       type: 'income',  isDefault: true }
];

const categorySchema = new mongoose.Schema(
    {
        userId: { // dah lel user sa7b el haga
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null    // null = default/global category
        },

        name: { // esm el category
            type: String,
            required: [true, 'Category name is required'],
            trim: true,
            maxlength: [50, 'Category name cannot exceed 50 characters']
        },

        type: { // beyshoof income wala expense
            type: String,
            required: [true, 'Category type is required'],
            enum: {
                values: ['income', 'expense'],
                message: 'Category type must be income or expense'
            }
        },

        isDefault: { // beyshoof law true system default category bs law false yeb2a user 3aml custom
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

/**
 * @method createCategory
 * @description Saves this category to the database.
 * Maps to createCategory() in the class diagram.
 * @returns {Promise<Category>} The saved category document
 */

categorySchema.methods.createCategory = async function () {
    return await this.save();
};

/**
 * @method deleteCategory
 * @description Removes this category from the database.
 * Maps to deleteCategory() in the class diagram.
 * @returns {Promise<void>}
 * @throws {Error} If trying to delete a default category
 */

categorySchema.methods.deleteCategory = async function () { // bs lel custom category
    if (this.isDefault) {
        throw new Error('Cannot delete a default system category.');
    }
    return await this.deleteOne();
};

/**
 * @method seedDefaultCategories
 * @description Creates the default categories in the database.
 * Called once when the server starts if no default categories exist.
 * @returns {Promise<void>}
 */

categorySchema.statics.seedDefaultCategories = async function () {
    const existingDefaults = await this.findOne({ isDefault: true });

    if (!existingDefaults) {
        await this.insertMany(DEFAULT_CATEGORIES);
        console.log('Default categories seeded successfully.');
    }
};

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;