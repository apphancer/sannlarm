var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var SerialPort = require('serialport');
var moment = require('moment');
const util = require('util');

var index = require('./routes/index');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');



// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);

/*
app.use(function(req, res, next){
  res.io = io;
  next();
});
*/

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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





// Socket.io program
var port = new SerialPort("/dev/serial0");
var dimmer_value = 0;
var brightness = convertSliderValueToArduinoValue(dimmer_value);

io.sockets.on('connection', function (socket) {

    socket.emit('light', {value: dimmer_value});

    socket.on('light', function (data) {

        dimmer_value = data.value;
        brightness = convertSliderValueToArduinoValue(dimmer_value);
        port.write(brightness.toString()); // @todo: change arduino code to accept integer

        io.sockets.emit('light', {value: dimmer_value});

        console.log('Value was: '+dimmer_value+'; Sent: ' + brightness);

    });

    socket.on('alarmClock', function (data) {
        if(data.alarm_on)
        {
            stored_alarm_time = data.alarm_time;
            setAlarm();
        }
        else
            unsetAlarm();
    });

    socket.on('startSunset', function (data) {
        if(data.value)
        {
            fading_value = 100;
            handleSunset = setInterval(sunset, dimming_pause);
        }
    });

});


function convertSliderValueToArduinoValue(value)
{
    var arduino_min_value = 5;
    var arduino_max_value = 125;
    var arduino_step_size = (arduino_max_value-arduino_min_value)/100; // e.g. 1.2

    var result = (value*arduino_step_size)+arduino_min_value; // e.g. value = 50; result = (50*1.2)+5 = 65

    return Math.round((arduino_min_value+arduino_max_value)-result);
}



var dimming_duration = 5*60*1000; // 5 minutes = 300,000 milliseconds
var fading_steps = 100;
var fading_value = 0;
var dimming_pause = Math.round(dimming_duration/fading_steps);
var socket_io_client = require("socket.io-client");
var client = socket_io_client.connect("http://localhost:3000");
var handleRaiseTheSun;

function raiseTheSun() {

    client.emit('light', {value: fading_value});

    if(fading_value >= 100)
        clearInterval(handleRaiseTheSun);

    fading_value++;
}

function sunset() {

    client.emit('light', {value: fading_value});

    if(fading_value <= 0)
        clearInterval(handleSunset);

    fading_value--;
}





var stored_alarm_time = '18:50';
var currentTime =  new Date();
var goneOff = false;


var setAlarm = function() {

    alarm_time = moment(stored_alarm_time, 'HH:mm');

    // if (today's date + alarm_time) < now, then set alarm for tomorrow + alarm_time
    if(alarm_time < currentTime)
        alarm_time = moment(stored_alarm_time, 'HH:mm').add(1, 'days');

    handleAlarm = setInterval(checkAlarm, 1000);

    console.log('Alarm clock is set for:');
    console.log(alarm_time);

    io.sockets.emit('alarmClock', {next_alarm: moment(alarm_time).format('MMMM Do YYYY, HH:mm')});
};


var getTime = function() {
    currentTime = new Date();
};


// play alarm
function playAlarm() {
    unsetAlarm();
    console.log('alarm ON');
    handleRaiseTheSun = setInterval(raiseTheSun, dimming_pause);
    setAlarm();
}

// stop alarm
function unsetAlarm() {

    clearInterval(handleRaiseTheSun);

    clearInterval(handleAlarm);
    console.log('alarm OFF');
    io.sockets.emit('alarmClock', {next_alarm: false});
}

function checkAlarm() {
    getTime();

    //if(moment(alarm_time).subtract(5, 'minutes') <= currentTime) {
    if(alarm_time <= currentTime) {
        goneOff = true;
        playAlarm();
        return;
    }
}

setAlarm();


// module.exports = app;
module.exports = {app: app, server: server};