const mongoose = require('mongoose');
const Transaction = require('./Transaction');

/**
 * @module Income
 * @description Represents money received by the user.
 * Relationship: Increases the user's balance when added.
 */

const incomeScheme = new mongoose.Schema({ // bey inherte men el transaction beyzawd bs el source bet3 el feloos (freelance, salary, etc...)

    source:{
        type: String,
        required: [true, 'Income source is required'],
        trim: true,
        maxlength: [100, 'Source cannot exceed 100 characters']
    }
});

const Income = Transaction.discriminator('Income', incomeScheme);
module.exports = Income;