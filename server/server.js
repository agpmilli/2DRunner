var config = require(__dirname + '/config');
var express = require('express');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(config.port);

app.use(express.static(__dirname + '/public'));
app.get('/', function (req, res) {
    res.sendfile(__dirname + '/public/index.html');
});

console.log(' * Running on http://' + config.server + ':' + config.port.toString());

io.sockets.on('connection', function (socket) {
    console.log('[*] info: new connection ' + socket.id);

    socket.on('mouse', MouseReceive);
    
    function MouseReceive(data) {
        socket.broadcast.emit('mouse', data);
    };
});