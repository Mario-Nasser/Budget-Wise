const ReportModel = require('../models/report');
const ReportClass = require('../classes/report');

const { v4: uuidv4 } = require('uuid');

exports.getReport = async (req, res) => {
    try {
        const { id } = req.params;
        const isChartNeeded = req.query.chart === 'true';

        // 1. Fetch data from MongoDB
        const reportData = await ReportModel.findOne({ reportId: id });

        if (!reportData) {
            return res.status(404).json({ message: "Report not found" });
        }

        // 2. Instantiate your class with the DB data
        const reportInstance = new ReportClass(
            reportData.reportId,
            reportData.startDate,
            reportData.endDate
        );

        // 3. Execute logic from your class
        const result = reportInstance.generateReport(isChartNeeded);

        res.status(200).json({
            data: reportData,
            generatedOutput: result
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createReport = async (req, res) => {
    try {
        const reportData = {
            reportId: uuidv4(),
            ...req.body
        };

        const newReport = new ReportModel(reportData);
        await newReport.save();
        res.status(201).json(newReport);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};