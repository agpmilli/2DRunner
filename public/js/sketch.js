const SERVER_IP = "128.179.131.152";
const SERVER_PORT = 3000;


var socket = null;
var moving = null;

var playerLocations = {};
var myId = -1;

var jumpCount = 0;

const sideMargin = 30;

var xVelocity = 0;
var yVelocity = 0;

var blocks = [];

function drawBird(data, image_bird){
	image(image_bird, data.x, data.y, data.width, data.height);
}

function move(){
    xVelocity = 0;
    if(keyIsDown(68) || keyIsDown(RIGHT_ARROW)){
        xVelocity = 3;
    }
    else if(keyIsDown(65) || keyIsDown(LEFT_ARROW)){
        xVelocity = -3;
    }

    var data = {
        velocityX: xVelocity,
        velocityY: yVelocity
    };

    socket.emit('positionUpdate', data);
    yVelocity = 0;
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
    socket.on('map', updateBlocks);
    moving = setInterval(move, 10);
}

function update(data) {
    playerLocations = data;
}

function updateBlocks(data) {
    blocks = data;
}
    
// on press space bar, jump
function keyTyped(){
    if(keyCode==32){
        yVelocity = -7;
        jumpCount += 1;
    }
}

//p5js functions
function preload(){
    our_bird_left = loadImage("images/our_bird_left.png")
    our_bird_right = loadImage("images/our_bird_right.png")
    bird_left = loadImage("images/bird_left.png")
	bird_right = loadImage("images/bird_right.png")
    left_block_grass_tile = loadImage("images/left_block_grass.png")
    middle_block_grass_tile = loadImage("images/middle_block_grass.png")
    right_block_grass_tile = loadImage("images/right_block_grass.png")
    left_block_snow_tile = loadImage("images/left_block_snow.png")
    middle_block_snow_tile = loadImage("images/middle_block_snow.png")
    right_block_snow_tile = loadImage("images/right_block_snow.png")
}

function draw(){
	clear();
	background(color(10, 20, 30));
    for (var key in playerLocations){
        if(key == myId){
            var tile = playerLocations[key].horizontalDirection === "R" ? our_bird_right : our_bird_left;
            if(!playerLocations[key].dead){
                drawBird(playerLocations[key], tile);
            } else {
                textSize(40);
                text("GAME OVER", 120, 300);
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
        Block(block.x, block.y, block.length, block.type).draw();
	});
    
	fill("#FFF");
}

function disconnect(){
    clearInterval(moving);
}

function Block(x, y, n, type) {
	return {
		width: 20,
		height: 20,
		x: x,
		y: y,
		draw : function(){
            if(type=="snow"){
                var left=left_block_snow_tile;
                var right=right_block_snow_tile;
                var middle=middle_block_snow_tile;
            } else {
                var left=left_block_grass_tile;
                var right=right_block_grass_tile;
                var middle=middle_block_grass_tile;
            }
            var posX = this.x;
            image(left, posX, this.y, this.width, this.height);
            posX+=this.width;
            for(var i = 1; i<n-2;i++){
                image(middle, posX, this.y, this.width, this.height);
                posX+=this.width;
            }
            image(right, posX, this.y, this.width, this.height);
		}
	}
}

