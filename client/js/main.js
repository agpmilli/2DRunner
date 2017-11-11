var canvasHeight = 400;
var canvasWidth = 600;
const sideMargin = 30;
var score = 0;
const birdHeight = 40;
const birdWidth = 40;
const MAX_JUMPS = 2;
//bird
var bird = {
	jumpCount: 0,
	x: 100,
	y: canvasHeight - birdHeight,
	width: 40,
	height: 40,
	xVelocity: 0,
	yVelocity : 0,
	yAcceleration: 1.7,
	draw : function(){
		var tile = image_bird_right;
		if(bird.xVelocity < 0) {
			tile = image_bird_left;
		} 
		image(tile, this.x, this.y, this.width, this.height);
	},
	update : function(){
		//update x position
		this.x += this.xVelocity;

		// update y position
		this.yVelocity = this.yVelocity + this.yAcceleration;
		this.y = min(canvasHeight-birdHeight, this.y+this.yVelocity);

		//reset jump count when you touch the ground
		if(this.isDown()){
			this.jumpCount = 0;
		}

	},
	isDead: function(){
		return bird.x <= 0;
	},
	isRightMost: function(){
		return bird.x + bird.width >= canvasWidth -sideMargin;
	},
	isDown: function(){
		return bird.y + birdHeight >= canvasHeight;
	}
}

//p5js functions
var image_bird_left;
var image_bird_right;
function preload(){
	image_bird_left = loadImage("images/bird_left.png")
	image_bird_right = loadImage("images/bird_right.png")
}
function setup(){
	createCanvas(canvasWidth, canvasHeight);
}
function draw(){
	clear();
	background(45);

	if(keyIsDown(RIGHT_ARROW) && !bird.isRightMost()){
		bird.xVelocity = 10;
	}
	else if(keyIsDown(LEFT_ARROW)){
		bird.xVelocity = -5;
	}
	else{
		bird.xVelocity = 0;
	}
	bird.update();
	bird.draw();
	fill("#FFF");
	text("score : " + score, 10, 10);

	if(bird.isDead()){
		noLoop();
		textSize(40);
		text("GAME OVER", 180, 200)
	}
}

// on press space bar, jump
function keyTyped(){
	if(keyCode == 32 && bird.jumpCount < MAX_JUMPS){
		bird.yVelocity = -20;
		bird.jumpCount += 1;
	}
}