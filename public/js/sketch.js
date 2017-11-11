var socket;

var playerLocations = {};
var myId = -1;

var jumpCount = 0;

const sideMargin = 30;
var score = 0;

var xVelocity = 0;
var yVelocity = 0;

var blocks = [{x:300, y:250, size:3}];

function drawBird(data, image_bird){
	image(image_bird, data.x, data.y, data.width, data.height);
}

function setup() {
    socket = io.connect('http://128.179.131.152:3000');
    socket.on("canvas", function(data){
        var canv = createCanvas(data.width, windowHeight-200);
        background(255,255,255);
    });
    
    socket.on("yourId", function(data){
        myId = data;
    });
    socket.on('positionUpdate', update);
    
    socket.on('blocks', updateBlocks);
}

function update(data) {
    playerLocations = data;
}

function updateBlocks(data) {
    blocks = data;
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
    left_block_tile = loadImage("images/left_block.png")
    middle_block_tile = loadImage("images/middle_block.png")
    right_block_tile = loadImage("images/right_block.png")
}

function draw(){
	clear();
	background(color(87, 217, 255));
    for (var key in playerLocations){
        if(key == myId){
            var tile = our_bird_right;
            if(playerLocations[key].xVelocity < 0){
                tile = our_bird_left;
            }
            if(!playerLocations[key].dead){
                drawBird(playerLocations[key], tile);
            } else {
                textSize(40);
                text("GAME OVER", 85, 400);
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
        Block(block.x, block.y, block.size).draw();
	});
    
	fill("#FFF");
	text("score : " + score, 10, 10);
}

function disconnect(){
    clearInterval(moving);
}

function Block(x, y, n) {
	return {
		width: 10,
		height: 10,
		x: x,
		y: y,
		draw : function(){
            image(left_block_title, this.x, this.y, this.width, this.height);
            for( i in range(1,n-2)){
                image(middle_block_tile, this.x+10*i, this.y, this.width, this.height);
            }
            image(right_block_tile, this.x+10*n-1, this.y, this.width, this.height);
		}
	}
}

