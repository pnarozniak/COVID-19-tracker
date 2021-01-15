const {
  getDetails,
  getCountries,
  getLastUpdate,
  isDataFetched,
} = require('../services/covid-summary.js');
const { getMonthly } = require('../services/covid-monthly.js');

exports.getData = async (req, res, next) => {
  if (isDataFetched()) {
    const details = getDetails(req.countryName);
    if (!details) {
      return res.status(404).send('Selected country does not exists');
    }

    req.details = details;
    req.countries = getCountries();
    req.lastUpdate = getLastUpdate();
    return next();
  }
  return res.status(503).send('An error occured please reload the page');
};

exports.attachParameter = (req, res, next, countryName) => {
  req.countryName = countryName;
  next();
};

exports.renderView = (req, res) => {
  res.render('../views/index.ejs', {
    details: req.details,
    countries: req.countries,
    monthly: req.monthly,
    lastUpdate: req.lastUpdate,
  });
};

exports.getChartData = async (req, res) => {
  const names = [['Date', 'Confirmed', 'Recovered', 'Deaths']];
  try {
    const monthly = await getMonthly(req.params.countryName);
    const chartData = names.concat(monthly);
    res.status(200).json({
      chartData: chartData,
    });
  } catch (err) {
    res.status(599).send('no jest tragedia');
  }
};
