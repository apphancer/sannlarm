var express = require('express');
var router = express.Router();
var SerialPort = require('serialport');

/* GET home page. */
router.get('/', function(req, res, next) {

  // Socket.io program
  /*
  var port = new SerialPort("/dev/serial0");
  var brightness = 0;

  io.sockets.on('connection', function (socket) {
      socket.on('led', function (data) {
          brightness = data.value;

          port.write(brightness);

          io.sockets.emit('led', {value: brightness});

          console.log(brightness);
      });

      socket.emit('led', {value: brightness});
  });
*/


  res.render('index', { title: 'Express' });
});

module.exports = router;
