const fetch = require('node-fetch');
const { getSlug } = require('./covid-summary.js');

const options = {
  from: '2020-03-01',
  get monthDiff() {
    const yearsDiff = (d1, d2) => {
      let date1 = new Date(d1);
      let date2 = new Date(d2);
      let yearsDiff = date2.getFullYear() - date1.getFullYear();
      return yearsDiff;
    };

    let date1 = new Date(this.from);
    let date2 = new Date(this.to);
    let years = yearsDiff(this.from, this.to);
    let months = years * 12 + (date2.getMonth() - date1.getMonth());
    return months;
  },
};

let monthly = {};

const fetchMonthlyData = async (countryName) => {
  options.to = new Date().toISOString().slice(0, 10);

  const query = `from=${options.from}&to=${options.to}`;
  const url = `https://api.covid19api.com/country/${countryName}?${query}`;

  const response = await fetch(url);
  const jsonResponse = await response.json();
  return Array.from(jsonResponse);
};

exports.getMonthly = async (countryName) => {
  if (!countryName) return ['', 0, 0, 0];

  if (monthly[countryName]) {
    return monthly[countryName];
  }

  const slug = getSlug(countryName);

  const response = await fetchMonthlyData(slug);
  const { monthDiff, from } = options;

  let [year, month] = from.split('-');
  month = parseInt(month);
  year = 2020;
  const monthlyData = [];

  let m = month;
  const sum = {
    confirmed: 0,
    recovered: 0,
    deaths: 0,
  };

  for (let i = 1; i <= monthDiff + 1; i++) {
    if (m > 12) {
      year = parseInt(year) + 1;
      m = '1';
    }
    m = m <= 9 ? `0${m}` : `${m}`;

    const matchingArray = response.filter((elem) => {
      return elem.Date.split('-')[1] == m && elem.Date.split('-')[0] == year;
    });

    const data = matchingArray[matchingArray.length - 1];

    let confirmed = data ? data.Confirmed - sum.confirmed : 0;
    let recovered = data ? data.Recovered - sum.recovered : 0;
    let deaths = data ? data.Deaths - sum.deaths : 0;

    sum.confirmed = data.Confirmed;
    sum.recovered = data.Recovered;
    sum.deaths = data.Deaths;

    monthlyData.push([`${year}-${m}`, confirmed, recovered, deaths]);
    m = month + i;
  }

  monthly[countryName] = monthlyData;
  return monthly[countryName];
};

exports.clearMonthly = () => {
  monthly = {};
};
