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
var canvasHeight=800;
var topMargin = canvasHeight/5;
var blocks = [];
var totalShift=0;
var iter = 1;

const blockSize = 20;

const MAX_JUMPS = 1;

var blocks = [{x:0, y:canvasHeight-blockSize, length: 31, type: "grass"}];
Array.prototype.push.apply(blocks, generateMap(-canvasHeight, canvasHeight));


io.sockets.on('connection', function (socket) {
    console.log('[*] info: new connection ' + socket.id);
    
    socket.emit("yourId", socket.id);
    socket.emit("canvas", {width:canvasWidth, height:canvasHeight});
    
    socket.on('disconnect', function() {
        console.log('[*] info: disconnected ' + socket.id);
        delete playerLocations[socket.id];
    });
    
    playerLocations[socket.id] = {
        username:"undefined",
        x:100,
        y:canvasHeight-2*birdHeight,
        dead:false,
        jumpCount:0,
        yVelocity: 0,
        xVelocity: 0,
        width:birdWidth,
        height:birdHeight,
        horizontalDirection: "R",
        totalShift: totalShift
    };
    socket.on("username", function(data) {
        playerLocations[data.id]['username'] = data.username;
    });
    
    socket.on('positionUpdate', positionUpdate);
    socket.on('restart', restartGame);
    
    // called when a player updates its position
    function positionUpdate(data) {
        var myBird = playerLocations[socket.id]
        myBird.x = myBird.x + data.velocityX;
        if(myBird.x < 0){
            myBird.x = canvasWidth-myBird.x;
        } else if (myBird.x > canvasWidth){
            myBird.x = myBird.x-canvasWidth;
        }
        myBird.xVelocity = data.velocityX;

        var direction = data.velocityX > 0 ? "R" : "L";
        myBird.horizontalDirection = data.velocityX === 0 ? myBird.horizontalDirection : direction;
        
        // update jump counts
        if(data.velocityY==-7 && myBird.jumpCount < MAX_JUMPS){
            myBird.yVelocity = data.velocityY;
            myBird.jumpCount++;
        }
        
        // update y position
        myBird.yVelocity = myBird.yVelocity + yAcceleration;
		myBird.y = Math.min(ground(myBird), myBird.y + myBird.yVelocity);
        
        myBird.jumpCount = isDown(myBird) ? 0 : myBird.jumpCount;
        
        myBird.dead=myBird.y>=canvasHeight;         

        myBird.totalShift = totalShift;
    };
    socket.emit('map', blocks);
});

function isDown(bird){
    return bird.y + birdHeight >= ground(bird);
}

function ground(bird){
    var finalGround = canvasHeight;
    for(var i = 0; i < blocks.length; i++) {
        block = blocks[i];
        if(bird.x + birdWidth >= block.x && bird.x + birdWidth / 2 <= (block.x + blockSize*block.length) && (bird.y + birdHeight) <= block.y) {
            newGround = block.y - birdHeight;
            if(newGround < finalGround) {
                finalGround = newGround;
            }
        }
    }
    return finalGround;
}

setInterval(function(){
    // shift map
    shiftMap();
    if(totalShift>canvasHeight * iter){
        Array.prototype.push.apply(blocks, generateMap(-canvasHeight, 0));
        iter++;
        blocks = blocks.filter(block => block.y < canvasHeight);
    }
    // send positions to players
    io.sockets.emit('positionUpdate', playerLocations);
    io.sockets.emit('map', blocks);

}, 10);

function generateMap(yMin, yMax) {
    newBlocks = []
    var proportion = Math.min(1, iter/6);
    for(var y = yMin; y <= yMax; y += blockSize * Math.max(2, 4* proportion)) {
        length = randomInt(3, 10);
        upperRightBound = canvasWidth - length * blockSize;
        newBlocks.push({x:randomInt(0, upperRightBound), y: y, length: length, type: Math.random() < proportion ? "snow" : "grass"});
    }
    return newBlocks;
}

// if one player if high enough on the map, it must be shifted down
//returns: shift value
function shiftMap() {
    let higherPlayer = getHigherPlayerId();
    if(higherPlayer == null){
        return;
    }
    // shift the map if the higher player is high enough, while he's going up
    if(playerLocations[higherPlayer].y < topMargin && playerLocations[higherPlayer].yVelocity < 0){
        // higher player stays at the top while going up
        playerLocations[higherPlayer].y = topMargin;
        // move down each other player
        Object.keys(playerLocations).filter(id => id != higherPlayer).forEach(function(id){
            playerLocations[id].y -= playerLocations[higherPlayer].yVelocity;
        });
        // move all blocks down
        blocks.map(block => block.y -= playerLocations[higherPlayer].yVelocity);
        totalShift-=playerLocations[higherPlayer].yVelocity;
    }
}

function getHigherPlayerId() {
    let min = canvasHeight;
    let minId = null;
    Object.keys(playerLocations).forEach(function(key){
        if(playerLocations[key].y < min){
            min = playerLocations[key].y;
            minId = key;
        }
    });
    return minId;
}

//TOOD: when a player is above, update substract its velocity from all other players velocities
function randomInt(min, max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}

function restartGame(id){
    let alive = 0;
    Object.values(playerLocations).forEach(function(player){
        if(!player.dead){
            alive += 1;
        }
    });
    // restart
    if(alive < 2){
        totalShift = 0;
        blocks = [{x:0, y:canvasHeight-blockSize, length: 31}];
        Array.prototype.push.apply(blocks, generateMap(-canvasHeight, canvasHeight));
        Object.keys(playerLocations).forEach(function(key){
            playerLocations[key].x = randomInt(0, canvasWidth - birdWidth);
            playerLocations[key].y = canvasHeight - birdHeight - 50;
            playerLocations[key].dead = false;
            console.log(Object.keys(playerLocations).length + " players online");
        });
        io.sockets.emit("restart", 1);
    }
}
