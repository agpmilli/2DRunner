var canvasHeight = 400;
var canvasWidth = 600;
var score = 0;
//bird
var bird = {
	x: 100,
	y: 190,
	width: 40,
	height: 40,
	yVelocity : 0,
	yAcceleration: -1.7,
	draw : function(){
		image(image_bird, this.x, this.y, this.width, this.height);
	},
	update : function(){
		this.yVelocity = this.yVelocity + 0.5*this.yAcceleration;
		var tempy = this.y - this.yVelocity;
		if(tempy<0)
			this.y = 0;
		else if(tempy > canvasHeight - this.height)
			this.y = canvasHeight - this.height;
		else
			this.y -= this.yVelocity;
	}
}

///obstacles
var obstacles = [];

function Obstacle(I){
	I.active = true;
	I.x = canvasWidth;
	I.xVelocity = 2;
	I.slitHeight = 150;
	I.width = 20;
	I.slit = Math.random() * (canvasHeight - I.slitHeight);
	I.inBounds = function(){
		return I.x +I.width;
	}
	I.update = function(){
		I.active = I.active && I.inBounds();
		I.x -= I.xVelocity;
	};
	I.draw = function(){
		rect(I.x, 0, I.width, I.slit);
		rect(I.x, I.slit + I.slitHeight, I.width, canvasHeight - (I.slit + I.slitHeight) );
	};
	return I;
}
//aut-generate obstacles
setInterval(function(){
	obstacles.push(Obstacle({}));
	score++;
}, 2000);
//collision detection function
function collision(bird, obstacle){
	return (bird.y <= obstacle.slit || bird.y + bird.width >= obstacle.slit + obstacle.slitHeight) && 
		bird.x + bird.width >= obstacle.x && bird.x <= obstacle.x + obstacle.width;
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
	if(keyIsDown(32)){
		bird.yVelocity = 10;
	}
	bird.update();
	bird.draw();
	fill("#FFF");
	text("score : " + score, 10, 10);
	obstacles = obstacles.filter(function(obstacle){
		return obstacle.active;
	});
	obstacles.forEach(function(obstacle){
		obstacle.update();
		obstacle.draw();
	});

	obstacles.forEach(function(obstacle){
		if(collision(bird, obstacle)){
			noLoop();
			textSize(40);
			text("GAME OVER", 180, 200);
		}
	});
}
