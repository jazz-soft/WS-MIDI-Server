const os = require('os');
const http = require('http');
const openurl = require('openurl');
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const midi = require('./midi');

const app = express();
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
const index = express.Router();
index.all('/', function(req, res) {
  res.render(req.headers.host.split(':')[0] == 'localhost' && !midi.master() ? 'server' : 'client');
});
app.use('/', index);

app.use(express.static(path.join(__dirname, '/content')));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

var port = process.argv[2] || 8888;
app.set('port', port);
const server = http.createServer(app);
server.on('listening', function() {
  console.log(`http://${myIP()}:${port}`);
  openurl.open(`http://localhost:${port}`);
});

server.on('upgrade', midi.wss);
server.listen(port);

function myIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family == 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}