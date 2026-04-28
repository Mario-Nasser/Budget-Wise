class Report {
    #reportId;
    #startDate;
    #endDate;
    constructor(reportId, startDate, endDate) {
        this.#reportId = reportId;
        this.#startDate = startDate;
        this.#endDate = endDate;
    }
    generateReport(isChartNeeded) {
        if (isChartNeeded) {
            // Generate a report with charts
            
        }else {
            // Generate a report without charts
            // report shows the total income, total expenses, and net savings for the specified period
            // the report also includes a breakdown of expenses by category and a summary of financial goals progress
            
        }
    }

}