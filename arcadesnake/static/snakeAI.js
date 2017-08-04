var canvas;
var ctx;

window.onload = function() {
	canvas = document.getElementById("snakeCanvas");
	ctx = canvas.getContext('2d');
	init();
	setInterval(update, 1000/12); // 1000ms, 15fps
	//menu();
}
//global variables
px=py=10; 	// player's current positions
grid=20;
ax=ay=15; 	// apple's initial position
trail = []; // snake's trail
tail = 5;	// snake length

var squares;
var moves = new Array();
var snake;
var runTimeout = 0;

function init() {
	squares = new Array(grid);
	for(var i=0;i<grid;i++){
		squares[i] = new Array(grid);
	}
	//initialize square values, set walls
	for(var i=0;i<grid;i++){
		for(var j=0;j<grid;j++){
			if(i == 0 || j == 0 || i == grid-1 || j == grid-1){
				squares[i][j] = 3;
			}else{
				squares[i][j] = 0;
			}
		}
	}
	snake = place_snake(tail);
	spawnApple();
}

function update() {
	// Move player
	updatePlayer();

	// Draw (happens last)
	drawPlayer();

	//wait and then continue with the next move.
	clearTimeout(runTimeout);
	runTimeout = setTimeout(update, 500);//need to wait a bit, otherwise CPU get overloaded and browser becomes unresponsive.
}

//Point class, used to refer to a specific square on the grid
function Point(pos_x,pos_y){
	this.x = pos_x;
	this.y = pos_y;
}

//Node class, used by searches as nodes in a tree.
function Node(parent,point,children){
	this.parent = parent;
	this.point = point;
	this.children = children;
}

//Breadth First Search
function findpath_bfs(){
	// Creating our Open and Closed Lists
	var openList = new Array();
	var closedList = new Array(grid);
	for(var i=0;i<grid;i++){
		closedList[i] = new Array(grid);
	}
	//initialize closedList values to 0
	for(var i=0;i<grid;i++){
		for(var j=0;j<grid;j++){
			closedList[i][j] = 0;
		}
	}

	// Adding our starting point to Open List
	openList.push(new Node(null,snake[0],new Array()));
	// Loop while openList contains some data.
	while (openList.length != 0) {
		var n = openList.shift();
		if(closedList[n.point.x][n.point.y] == 1)
			continue;
		// Check if node is food
		if (squares[n.point.x][n.point.y] == 2) {
			//if we have reached food, climb up the tree until the root to obtain path
			while (n.parent != null) {
				moves.unshift(n.point);
				if(squares[n.point.x][n.point.y] == 0)
					squares[n.point.x][n.point.y] = 1;
				n = n.parent;
			}
			break;
		}
		// Add current node to closedList
		closedList[n.point.x][n.point.y] = 1;
		// Add adjacent nodes to openlist to be processed.
		if(closedList[n.point.x][n.point.y-1] == 0 && (squares[n.point.x][n.point.y-1] == 0 || squares[n.point.x][n.point.y-1] == 2))
			n.children.unshift(new Node(n,new Point(n.point.x,n.point.y-1),new Array()));
		if(closedList[n.point.x+1][n.point.y] == 0 && (squares[n.point.x+1][n.point.y] == 0 || squares[n.point.x+1][n.point.y] == 2))
			n.children.unshift(new Node(n,new Point(n.point.x+1,n.point.y),new Array()));
		if(closedList[n.point.x][n.point.y+1] == 0 && (squares[n.point.x][n.point.y+1] == 0 || squares[n.point.x][n.point.y+1] == 2))
			n.children.unshift(new Node(n,new Point(n.point.x,n.point.y+1),new Array()));
		if(closedList[n.point.x-1][n.point.y] == 0 && (squares[n.point.x-1][n.point.y] == 0 || squares[n.point.x-1][n.point.y] == 2))
			n.children.unshift(new Node(n,new Point(n.point.x-1,n.point.y),new Array()));
		for(var i=0;i<n.children.length;i++){
			openList.push(n.children[i]);
		}
	}
}

//helper function checks if two points are adjacent. Used to check if moves are legal.
function is_adjacent(point1, point2){
	if(point1.x == point2.x && (point1.y == point2.y-1 || point1.y == point2.y+1))
		return true;
	if(point1.y == point2.y && (point1.x == point2.x-1 || point1.x == point2.x+1))
		return true;
	return false;
}

//move the snake to the new Point given
function move(new_head){
	//check that this is a legal move. Square must be adjacent and empty (can move to empty, food or path.
	if((!is_adjacent(new_head,snake[0])) || squares[new_head.x][new_head.y] > 2){
		return false;
	}

	//clear the tail
	squares[snake[snake.length-1].x][snake[snake.length-1].y] = 0;

	//move the snake forward
	for(var i=snake.length-1;i>0;i--){
		snake[i].x = snake[i-1].x;
		snake[i].y = snake[i-1].y;
	}
	snake[0].x = new_head.x;
	snake[0].y = new_head.y;

	//update squares with new snake information for redrawing
	for(var i=0;i<snake.length;i++){
		squares[snake[i].x][snake[i].y] = 5+i;
	}
}

//place the snake on the grid.
function place_snake(length){
	var middle_x = Math.floor(grid/2);
	var middle_y = Math.floor(grid/2);
	var snake = new Array(length);
	while(length){
		squares[middle_x+length][middle_y] = 4+length;
		snake[length-1] = new Point(middle_x+length,middle_y);
		length--;
	}
	return snake;
}

function updatePlayer()
{
	//moves is a list of moves that the snake is to carry out. IF there are no moves left, then run a search to find more.
	if(moves.length == 0){
		findpath_bfs();
	} else {
		//we still have moves left, so move the snake to the next square.
		move(moves.shift());
	}

	if (ax == snake[0].x && ay == snake[0].y) {
		spawnApple();
	}

}

function drawPlayer() {
	// Colour background
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// Colour snake
	ctx.fillStyle = 'lime';
	for (var i = 0; i < snake.length; i++) {
		ctx.fillRect(snake[i].x * grid, snake[i].y * grid, grid - 2, grid - 2);
	}

	// Colour apple
	ctx.fillStyle = 'red';
	ctx.fillRect(ax * grid, ay * grid, grid - 2, grid - 2);
}

function spawnApple() {

	ax = Math.floor(Math.random() * (grid - 1));
	ay = Math.floor(Math.random() * (grid - 1));
	if (ax == 0)
		ax++;
	if (ay == 0)
		ay++;
	squares[ax][ay] = 2;

	for(var i = 0; i < snake.length; i++)
	{
		if(ax == snake[i].x && ay == snake[i].y)
			spawnApple();
	}
}
