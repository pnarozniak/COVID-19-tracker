const { fetchSummaryData } = require('./covid-summary.js');
const { clearMonthly } = require('./covid-monthly.js');

exports.fetchAPIData = async () => {
  await fetchSummaryData();
  clearMonthly();

  setTimeout(() => {
    this.fetchAPIData();
  }, 60 * 60 * 1000);
};
