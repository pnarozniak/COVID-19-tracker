const express = require('express');
const indexRouter = express.Router();
const {
  getData,
  attachParameter,
  renderView,
  getChartData,
} = require('../controllers/indexController.js');

indexRouter.param('countryName', attachParameter);

indexRouter.get('/', getData, renderView);
indexRouter.get('/countries/:countryName', getData, renderView);
indexRouter.get('/chart-data/countries/:countryName', getChartData);

module.exports = indexRouter;
