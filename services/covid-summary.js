const fetch = require('node-fetch');

let summary;

exports.fetchSummaryData = async () => {
  const url = 'https://api.covid19api.com/summary';
  const response = await fetch(url);
  const jsonResponse = await response.json();
  summary = jsonResponse;
};

exports.isDataFetched = () => {
  if (summary) return true;
  return false;
};

exports.getDetails = (countryName) => {
  let details;
  if (countryName) {
    const { Countries } = summary;
    details = Countries.find((country) => country.Country == countryName);
  } else {
    const { Global } = summary;
    details = Global;
  }

  const formatDetails = (details) => {
    const formatter = new Intl.NumberFormat('en');
    for (const property in details) {
      if (!isNaN(details[property])) {
        details[property] = formatter.format(details[property]);
      }
    }
    return details;
  };

  return formatDetails(details);
};

exports.getCountries = () => {
  const { Countries } = summary;
  return Countries.map((country) => country.Country);
};

exports.getLastUpdate = () => {
  let date = summary.Date.split('T')[0];
  let time = summary.Date.split('T')[1].slice(0, -4);

  return `${date} ${time}`;
};

exports.getSlug = (countryName) => {
  const { Slug } = summary.Countries.find((elem) => {
    return elem.Country === countryName;
  });

  return Slug;
};
