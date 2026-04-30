const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Report:
 *       type: object
 *       required:
 *         - reportId
 *         - startDate
 *         - endDate
 *       properties:
 *         reportId:
 *           type: string
 *           description: The unique identifier for the report.
 *         startDate:
 *           type: string
 *           format: date
 *           description: The beginning date of the report period.
 *         endDate:
 *           type: string
 *           format: date
 *           description: The ending date of the report period.
 *       example:
 *         reportId: "REP-2023-001"
 *         startDate: "2023-01-01"
 *         endDate: "2023-01-31"
 */

/**
 * @swagger
 * /api/reports/{id}:
 *   get:
 *     summary: Retrieve a specific financial report
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The reportId of the report to generate.
 *       - in: query
 *         name: chart
 *         schema:
 *           type: boolean
 *         description: If true, returns the report with visual chart data.
 *     responses:
 *       200:
 *         description: Report successfully generated.
 *       404:
 *         description: The report with the specified ID was not found.
 *       500:
 *         description: Server error.
 */
router.get('/:id', reportController.getReport);

/**
 * @swagger
 * /api/reports:
 *   post:
 *     summary: Create a new report entry
 *     tags: [Reports]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateReportInput' # Use the input schema here
 *     responses:
 *       201:
 *         description: Report created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReportResponse'
 */
router.post('/', reportController.createReport);

module.exports = router;
