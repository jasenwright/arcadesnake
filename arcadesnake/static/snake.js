var canvas;
var ctx;
var currentscr;
var highscr;
var keyBuffer = [];

window.onload = function() {
	canvas = document.getElementById("snakeCanvas");
	currentscr = document.getElementById("currentScore");
	highscr = document.getElementById("highScore");
	ctx = canvas.getContext('2d');
	document.addEventListener("keydown", keydown);
	setInterval(update, 1000/12); // 1000ms, 15fps
	//menu();
}
//global variables
px=py=10; 	// player's current positions
dx=dy=0;  	// change in positions
grid=20;
ax=ay=15; 	// apple's initial position
trail = []; // snake's trail
tail = 3;	// snake length
currentScore = 0;
highScore = 0;

function update() {
	// Move player
	updatePlayer();

	// Draw (happens last)
	drawPlayer();
}

function keydown(e) {
	// e : key event, type integer
	var keyCode = e.which ? e.which : e.keyCode;
    // *** Queue the arrow key presses
    if (keyCode >= 37 && keyCode <= 40 && keyCode !== keyBuffer[keyBuffer.length-1]) {
        keyBuffer.push(keyCode);
    }
}

function updatePlayer()
{
	var key = keyBuffer.shift();
	switch (key){
			// top left corner 0,0 bottom right is 100,100
			/* 37: left
			   38: up
			   39: right
			   40: down */
			case 37:
				if (dx == 1)
					break;
				else {
					dx = -1;
					dy = 0;
					break;
				}
			case 38:
				if (dy == 1)
					break;
				else {
					dx = 0;
					dy = -1;
					break;
				}
			case 39:
				if (dx == -1)
					break;
				else {
					dx = 1;
					dy = 0;
					break;
				}
			case 40:
				if (dy == -1)
					break;
				else {
					dx = 0;
					dy = 1;
					break;
				}

		}
	px += dx;
	py += dy;
	checkCollision();

	if (ax == px && ay == py) {
		tail++;
		currentScore++;
		currentscr.innerHTML = "Current Score: " + currentScore;
		if (currentScore > highScore) {
			highScore = currentScore;
			highscr.innerHTML = "High Score: " + highScore;
		}
		spawnApple();
	}

	trail.push({x: px, y:py});
	while (trail.length > tail) {
		trail.shift();
	}

}

function drawPlayer() {
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	ctx.fillStyle = 'lime';
	for (var i = 0; i < trail.length; i++) {
		ctx.fillRect(trail[i].x * grid, trail[i].y * grid, grid - 2, grid - 2);
	}
	ctx.fillRect(px * grid, py * grid, grid - 2, grid - 2);

	ctx.fillStyle = 'red';
	ctx.fillRect(ax * grid, ay * grid, grid - 2, grid - 2);
}

function spawnApple() {

	ax = Math.floor(Math.random() * grid);
	ay = Math.floor(Math.random() * grid);

	if(ax == px && ay == py)
		spawnApple();
	else {
		for(var i = 0; i < trail.length; i++)
		{
			if(ax == trail[i].x && ay == trail[i].y)
				spawnApple();
		}
	}
}

function checkCollision() {
	if(px < 0 || px >= grid || py < 0 || py >= grid) { // Outside boundries
		tail = 3;
		px=py=10;
		dx=dy=0;
		currentScore = 0;
		currentscr.innerHTML = "Current Score: " + currentScore;
		document.getElementById('highScoreInput').value=highScore;
	} else { // collided with self
		for (var i = 0; i < trail.length; i++) {
			if(px == trail[i].x && py == trail[i].y) {
				tail = 3;
				px=py=10;
				dx=dy=0;
				currentScore = 0;
				currentscr.innerHTML = "Current Score: " + currentScore;
				document.getElementById('highScoreInput').value=highScore;
			}
		}
	}
}
