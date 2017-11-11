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

var playerLocations = { };

io.sockets.on('connection', function (socket) {
    console.log('[*] info: new connection ' + socket.id);
    
    socket.emit("yourId", socket.id);
    
    socket.on('disconnect', function() {
        console.log('[*] info: disconnected ' + socket.id);
        delete playerLocations[socket.id];
    });
    
    playerLocations[socket.id]={x:100, y:300, dead:false};
    
    socket.on('positionUpdate', positionUpdate);
    
    function positionUpdate(data) {
        myBird = playerLocations[socket.id]
        myBird.x = myBird.x + data.velocityX;
        myBird.y = myBird.y + data.velocityY;
        if(myBird.x <= 0){
           myBird.dead=true;          
        } else {
           myBird.dead=false; 
        }
    };
});

setInterval(function(){io.sockets.emit('positionUpdate', playerLocations); }, 5);