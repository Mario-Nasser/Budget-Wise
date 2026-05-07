import { Request, Response } from "express";
import ReportService from "../services/reportService";

export const generateReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, pattern } = req.query;

    const report = await ReportService.getReport(
      {
        startDate: startDate as string,
        endDate: endDate as string,
      },
      (pattern as "day" | "week" | "month") || "week"
    );

    res.status(200).json({ data: report });

  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const reportController = {
  generateReport,
};