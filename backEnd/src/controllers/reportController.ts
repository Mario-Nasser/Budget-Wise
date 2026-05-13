import { Request, Response } from "express";
import ReportService from "../services/reportService";

export const generateReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, pattern } = req.query;
    const allowedPatterns = ["day", "week", "month"] as const;
    const reportPattern = allowedPatterns.includes(pattern as any)
      ? (pattern as "day" | "week" | "month")
      : "week";

    const report = await ReportService.getReport(
      (req as any).user.id,
      {
        startDate: startDate as string,
        endDate: endDate as string,
      },
      reportPattern
    );

    res.status(200).json({ data: report });

  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const reportController = {
  generateReport,
};
