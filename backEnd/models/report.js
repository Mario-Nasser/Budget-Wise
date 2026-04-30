const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  reportId: { type: String, required: true, unique: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
});

module.exports = mongoose.model('report', ReportSchema);