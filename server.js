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
var canvasWidth=600;
var canvasHeight=400;

const MAX_JUMPS = 1;

var blocks = [Block(300, 250), Block(329, 250), Block(358, 250)];

io.sockets.on('connection', function (socket) {
    console.log('[*] info: new connection ' + socket.id);
    
    socket.emit("yourId", socket.id);
    socket.emit("canvas", {width:canvasWidth, height:canvasHeight});
    
    socket.on('disconnect', function() {
        console.log('[*] info: disconnected ' + socket.id);
        delete playerLocations[socket.id];
    });
    
    playerLocations[socket.id]={x:100, y:300, dead:false, jumpCount:0, yVelocity: 0, xVelocity: 0,width:birdWidth, height:birdHeight};
    
    socket.on('positionUpdate', positionUpdate);
    
    function positionUpdate(data) {
        myBird = playerLocations[socket.id]
        myBird.x = myBird.x + data.velocityX;
        myBird.xVelocity = data.velocityX;
        
        if(data.velocityY==-10 && myBird.jumpCount < MAX_JUMPS){
            myBird.yVelocity = data.velocityY;
            myBird.jumpCount++;
        }
        
        // update y position
        myBird.yVelocity = myBird.yVelocity + yAcceleration;
		myBird.y = Math.min(ground(myBird), myBird.y + myBird.yVelocity);
        
        myBird.jumpCount = isDown(myBird) ? 0 : myBird.jumpCount;
        
        myBird.dead=myBird.x<=0;         

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
    return canvasHeight-birdHeight;
}

setInterval(function(){io.sockets.emit('positionUpdate', playerLocations); }, 10);


function Block(x, y) {
	return {
		width: 30,
		height: 30,
		x: x,
		y: y,
		draw : function(){
			image(block_tile, this.x, this.y, this.width, this.height);
		}
	}
}