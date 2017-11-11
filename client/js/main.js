var canvasHeight = 400;
var canvasWidth = 600;
const sideMargin = 30;
var score = 0;
//bird
var bird = {
	x: 100,
	y: 190,
	width: 40,
	height: 40,
	xVelocity: 0,
	draw : function(){
		var tile = image_bird_right;
		if(bird.xVelocity < 0) {
			tile = image_bird_left;
		} 
		image(tile, this.x, this.y, this.width, this.height);
	},
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
	if(keyIsDown(68) && !bird.isRightMost()){
		bird.xVelocity = 10;
	}
	else if(keyIsDown(65)){
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
