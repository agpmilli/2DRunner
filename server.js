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

var playerLocations = {};
var yAcceleration = 0.3;
var birdWidth=40;
var birdHeight=40;
var canvasWidth=400;
var canvasHeight=800;

const MAX_JUMPS = 1;

var blocks = [{x:300, y:250, size:3}];

io.sockets.on('connection', function (socket) {
    console.log('[*] info: new connection ' + socket.id);
    
    socket.emit("yourId", socket.id);
    socket.emit("canvas", {width:canvasWidth, height:canvasHeight});
    
    socket.on('disconnect', function() {
        console.log('[*] info: disconnected ' + socket.id);
        delete playerLocations[socket.id];
    });
    
    playerLocations[socket.id] = {
        x:100,
        y:300,
        dead:false,
        jumpCount:0,
        yVelocity: 0,
        xVelocity: 0,
        width:birdWidth,
        height:birdHeight,
        horizontalDirection: "R"
    };
    
    socket.on('positionUpdate', positionUpdate);
    
    function positionUpdate(data) {
        var myBird = playerLocations[socket.id]
        myBird.x = myBird.x + data.velocityX;
        myBird.xVelocity = data.velocityX;

        var direction = data.velocityX > 0 ? "R" : "L";
        myBird.horizontalDirection = data.velocityX === 0 ? myBird.horizontalDirection : direction;
        
        if(data.velocityY==-10 && myBird.jumpCount < MAX_JUMPS){
            myBird.yVelocity = data.velocityY;
            myBird.jumpCount++;
        }
        
        // update y position
        myBird.yVelocity = myBird.yVelocity + yAcceleration;
		myBird.y = Math.min(ground(myBird), myBird.y + myBird.yVelocity);
        
        myBird.jumpCount = isDown(myBird) ? 0 : myBird.jumpCount;
        
        myBird.dead=myBird.y>=canvasHeight;         

    };
});

function isDown(bird){
    return bird.y + birdHeight >= ground(bird);
}

function ground(bird){
    for(var i = 0; i < blocks.length; i++) {
        block = blocks[i];
        if(bird.x + birdWidth / 2 >= block.x && bird.x <= (block.x + block.width) && (bird.y + birdHeight) <= block.y) {
            return block.y - birdHeight;
        }
    }
    return canvasHeight;
}

setInterval(function(){io.sockets.emit('positionUpdate', playerLocations); }, 10);
