const SERVER_IP = "localhost";
const SERVER_PORT = 3000;


var socket;

var playerLocations = {};
var myId = -1;

var jumpCount = 0;

const sideMargin = 30;

var xVelocity = 0;
var yVelocity = 0;

var blocks = [Block(300, 250), Block(329, 250), Block(358, 250)];

function drawBird(data, image_bird){
	image(image_bird, data.x, data.y, data.width, data.height);
}

function setup() {
    

    socket = io.connect('http://' + SERVER_IP + ":" + SERVER_PORT);
    socket.on("canvas", function(data){
        var canv = createCanvas(data.width, data.height);
        background(255,255,255);
    });
    
    socket.on("yourId", function(data){
        myId = data;
    });
    socket.on('positionUpdate', update);
}

function update(data) {
    playerLocations = data;
}


function move(){
    xVelocity = 0;
    if(keyIsDown(68)){
        xVelocity = 3;
    }
    else if(keyIsDown(65)){
        xVelocity = -3;
    }
    
    var data = {
        velocityX: xVelocity,
        velocityY: yVelocity
    };
    
    socket.emit('positionUpdate', data);
    yVelocity = 0;
}

    
// on press space bar, jump
function keyTyped(){
    if(keyCode==32){
        yVelocity = -10;
        jumpCount += 1;
    }
}

var moving = setInterval(move, 10);

//p5js functions
function preload(){
    our_bird_left = loadImage("images/our_bird_left.png")
    our_bird_right = loadImage("images/our_bird_right.png")
    bird_left = loadImage("images/bird_left.png")
	bird_right = loadImage("images/bird_right.png")
    block_tile = loadImage("images/block.png")
}

function draw(){
	clear();
	background(color(87, 217, 255));
    for (var key in playerLocations){
        
        if(key == myId){
            var tile = playerLocations[key].horizontalDirection === "R" ? our_bird_right : our_bird_left;
            if(!playerLocations[key].dead){
                drawBird(playerLocations[key], tile);
            } else {
                textSize(40);
                text("GAME OVER", 180, 200);
                disconnect();
            }
        }
        else {
            var tile = bird_right;
            if(playerLocations[key].xVelocity < 0){
                tile = bird_left;
            }
            if(!playerLocations[key].dead){
                drawBird(playerLocations[key], tile);
            }
        }
    }
    
    blocks.forEach(function(block) {
		block.draw();
	});
    
	fill("#FFF");
}

function disconnect(){
    clearInterval(moving);
}

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

