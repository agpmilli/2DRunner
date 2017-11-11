var socket;

var playerLocations = {};
var myId = -1;
var canvasHeight = 400;
var canvasWidth = 600;

var birdWidth=40;
var birdHeight=40;

const sideMargin = 30;
var score = 0;
//bird

function drawBird(data, image_bird){
	image(image_bird, data.x, data.y, birdWidth, birdHeight);
}


var bird = {
	x: 100,
	y: 100,
	xVelocity: 0,
	update : function(){
		bird.x += bird.xVelocity;
	},
	isDead: function(){
		return bird.x <= 0;
	},
	isRightMost: function(){
		return bird.x + bird.width >= canvasWidth -sideMargin;
	}
}

function setup() {
    var canv = createCanvas(canvasWidth, canvasHeight);
    //canv.parent('canvas');
    background(255,255,255);

    socket = io.connect('http://128.179.131.152:3000');
    socket.on("yourId", function(data){
        myId = data;
    });
    socket.on('positionUpdate', update);
}

function update(data) {
    //console.log(data);
    playerLocations = data;
}


function move(){
    var xVelocity = 0;
    var yVelocity = 0;
    if(keyIsDown(68) && !bird.isRightMost()){
        xVelocity = 0.5;
    }
    else if(keyIsDown(65)){
        xVelocity = -0.5;
    }

    var data = {
        velocityX: xVelocity,
        velocityY: yVelocity
    };
    socket.emit('positionUpdate', data);
}

var moving = setInterval(move, 5);

//p5js functions
function preload(){
	image_bird = loadImage("images/bird.png")
    our_bird = loadImage("images/bird2.png")
}

function draw(){
	clear();
	background(45);
    for (var key in playerLocations){
        if(key == myId){
            if(!playerLocations[key].dead){
                drawBird(playerLocations[key], our_bird);
            } else {
                textSize(40);
                text("GAME OVER", 180, 200);
                disconnect();
            }
        }
        else {
            if(!playerLocations[key].dead){
                drawBird(playerLocations[key], image_bird);
            }
        }
    }
	fill("#FFF");
	text("score : " + score, 10, 10);
}

function disconnect(){
    clearInterval(moving);
}
