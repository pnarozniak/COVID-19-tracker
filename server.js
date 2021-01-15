const express = require('express');
const app = express();
app.use(express.static(__dirname + '/public'));

const indexRouter = require('./routes/indexRouter.js');
app.use('/', indexRouter);

const { fetchAPIData } = require('./services/covid-api.js');
app.listen(8080, () => {
  console.log('Listening...');
  fetchAPIData();
});
