$(function () {
    $('#datetimepicker').datetimepicker({
        format: 'HH:mm'
    }).on('dp.change', function (e) {
        $('#alarm-switch').bootstrapToggle('on');
    });

    var socket = io.connect();

    socket.on('light', function (data) {
        $('#dimmer_slider').val(data.value);
        $('#dimmer-value span').html(data.value);
    });

    socket.on('alarmClock', function (data) {
        var result = (data.next_alarm) ? data.next_alarm : 'Off';
        $('#alarm-feedback strong').html(result);
    });

    // allow light brightness to be set by slider
    $('#dimmer_slider').on('change', function (e) {
        var new_value = $(e.target).val();
        socket.emit('light', {value: new_value});
        $('#dimmer-value span').html(new_value);

        /*
        if(new_value == 0)
            $('#light-switch').bootstrapToggle('off')
        else
            $('#light-switch').bootstrapToggle('on')
         */
    });




    // Set Sunset
    $('#start-sunset').on('click', function() {
        socket.emit('startSunset', {value: true});
    });

    // toggle light on/off
    $('#light-switch').change(function() {
        var new_value = $(this).prop('checked') ? 100 : 0;
        socket.emit('light', {value: new_value});
        $('#dimmer-value span').html(new_value);
    });

    // toggle alarm
    $('#alarm-switch').change(function() {

        if($(this).prop('checked'))
        {
            // Set the alarm time
            socket.emit('alarmClock', {
                alarm_time: $('#alarm-time').val(),
                alarm_on: true
            });
        }
        else
        {
            socket.emit('alarmClock', {
                alarm_on: false
            });
        }
    });

});