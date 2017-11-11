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
		image(image_bird, this.x, this.y, this.width, this.height);
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
var image_bird;
function preload(){
	image_bird = loadImage("images/bird.png")
}
function setup(){
	createCanvas(canvasWidth, canvasHeight);
}
function draw(){
	clear();
	background(45);
	if(keyIsDown(68) && !bird.isRightMost()){
		bird.xVelocity = 5;
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
