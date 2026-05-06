class Report {
    #reportId: string;
    #startDate: Date | string;
    #endDate: Date | string;

    constructor(reportId: string, startDate: Date | string, endDate: Date | string) {
        this.#reportId = reportId;
        this.#startDate = startDate;
        this.#endDate = endDate;
    }

    generateReport(isChartNeeded: boolean): void {
        if (isChartNeeded) {
            // Generate a report with charts.
            return;
        }

        // Generate a report without charts.
        // Report shows total income, total expenses, net savings, category breakdown, and goals progress.
    }
}

export default Report;