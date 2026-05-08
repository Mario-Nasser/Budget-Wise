import { Schema } from 'mongoose';
import Transaction, { ITransaction } from './Transaction';

export interface IIncome extends ITransaction {
    source: string;
    category?: Schema.Types.ObjectId;
}

const incomeSchema = new Schema<IIncome>({
    source: {
        type: String,
        required: [true, 'Income source is required'],
        trim: true,
        maxlength: [100, 'Source cannot exceed 100 characters']
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: false
    }
});

const Income = Transaction.discriminator<IIncome>('Income', incomeSchema);
export default Income;
