import { Schema } from 'mongoose';
import Transaction, { ITransaction } from './Transaction';

export interface IIncome extends ITransaction {
    source: string;
}

const incomeSchema = new Schema<IIncome>({
    source: {
        type: String,
        required: [true, 'Income source is required'],
        trim: true,
        maxlength: [100, 'Source cannot exceed 100 characters']
    }
});

const Income = Transaction.discriminator<IIncome>('Income', incomeSchema);
export default Income;
