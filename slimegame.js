//alert("working");

//Player Class
function Player(x,y,vx,vy,radius,scolor){
	this.x = x;
	this.y = y;
	this.vx = vx;
	this.vy = vy;
	this.radius = radius;
	this.scolor = scolor;
	this.psize = radius*10;
	this.speedChangeTick = 20;

	this.growBigger = function(otherslime_radius){
		this.radius = Math.floor(this.radius+(otherslime_radius/2));
		this.determineSize();
	}

	this.determineSize = function(){
		this.psize = radius*10;
	}

}

//Tracks the mouse position and moves the player slime to that position
function getMouseXY(e){
	var rect = canvas.getBoundingClientRect();
	var x = e.clientX- rect.left;
	var y= e.clientY - rect.top;
	console.log(x);
	console.log(y);
	mousex = x;
	mousey = y;

}

//EVENT HANDLER (Adds the player when clicked--to start the game)
function addPlayer(e){
	if(hasGameStarted==false){
		Player1.x = mousex;
		Player1.y = mousey;
		drawPlayer();
		hasGameStarted = true;
		game_status.innerHTML = "";
	}
}


//Canvas, HTML elements, Events
var start_Button = document.getElementById("gamestart");
var canvas = document.getElementById("gamewindow");
var ctx = canvas.getContext("2d");
window.addEventListener('mousemove',getMouseXY);
window.addEventListener('mousedown',addPlayer);



//Game Elements
var number_of_slimes = 30;
var Player1 = new Player(5,5,0,0,3,"lightblue");
var slime_radius_range = 10; //starting radius range for enemy slimes
var color_list = ["blue","orange","pink","red","green","black","white","brown"];
var slime_speed_range = 5; //range of speeds for enemy slimes
var slime_list = [];
var gameloop;
var mousex; 
var mousey;
var hasGameStarted = false;
var player_score = 0;
var isGameOver = false;
var isZoom = true;
//var score_sound = new Audio("score.wav");
var score_sound = document.getElementById("score_sound");


//HTML Elements
var game_score = document.getElementById("gamescore");
var game_title = document.getElementById("gametitle");
var game_status = document.getElementById("gamestatus");



//document.addEventListener("keyDown",function)

//returns a number from offset to number
function random_num(offset, number){
	return Math.floor(Math.random()*number)+offset;
}

//Method for drawing a circle onto the canvas
function drawCircle(x,y,radius, color){
	ctx.beginPath();
	ctx.arc(x,y,radius,0,2*Math.PI);
	ctx.fillStyle = color;
	ctx.fill();
}

//calculates the distance between two points
function calcDistance(x1,y1,x2,y2){
	return Math.sqrt((Math.pow((x2-x1),2)+Math.pow((y2-y1),2)));
}


//Refreshes the Canvas
function clearCanvas(){
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	console.log("CLEARING CANVAS");
}


//Slime Class
function Slime(x,y,vx,vy,radius,scolor){
		this.x =x;
		this.y =y;
		this.vx = vx;
		this.vy = vy;
		this.radius = radius;
		this.scolor = scolor;
		this.ssize = radius*10;
		this.speedChangeTick = random_num(20,100); //this deincrements by tick timer and onces hits 0 changes speed
		this.move = function(){
			this.x += this.vx;
			this.y += this.vy;
		}


		this.changeSpeed = function(){
			if(this.x<0){
				this.x=canvas.width;
			}
			if(this.x>canvas.width){
				this.x = 0;
			}
			if(this.y<0){
				this.y = canvas.height;
			}
			if(this.y>canvas.height){
				this.y= 0;
			}
			if(this.speedChangeTick<=0){
				this.vx = random_num(0,slime_speed_range);
				this.vy = random_num(0,slime_speed_range);
				this.speedChangeTick = random_num(10,20);
			}
			else{
				this.speedChangeTick-=1;
			}
		}
}


//Adds the Enemy Slimes into the game slime list (Intially; Does not Draw them onto)
function addSlimes(n, inputlist){
	for(var i=0;i<n;i++){
		let x = random_num(0,canvas.width);
		let y = random_num(0,canvas.width);
		let vx = random_num(-1*slime_speed_range,slime_speed_range);
		let vy = random_num(-1*slime_speed_range,slime_speed_range);
		let radius = random_num(2,slime_radius_range);
		let scolor = color_list[random_num(0,inputlist.length)];

		inputlist[i] = createSlime();//new Slime(x,y,vx,vy,radius,scolor);
	}
}

//Draws the player's slime on the screen
function drawPlayer(){
	drawCircle(Player1.x,Player1.y,Player1.radius,Player1.scolor);
}


//Updates the Slime's movement
function updateSlimes(n, inputlist){
	if(hasGameStarted){
		for(var i=0;i<n;i++){
		let x = inputlist[i].x;
		let y = inputlist[i].y;
		let radius = inputlist[i].radius;
		let scolor = inputlist[i].scolor;

		drawCircle(x,y,radius,scolor);
		inputlist[i].move();
		inputlist[i].changeSpeed();
		}
	}
	else{
		for(var i=0;i<n;i++){
			let x = inputlist[i].x;
			let y = inputlist[i].y;
			let radius = inputlist[i].radius;
			let scolor = inputlist[i].scolor;

			drawCircle(x,y,radius,scolor);
		}
	}
}


//Determines whether or not the player is able to eat or is eaten by other slime
function EatOrEaten(n, inputlist){
	for(var i=0;i<n;i++){
		var distance_between = calcDistance(Player1.x,Player1.y, inputlist[i].x,inputlist[i].y)-inputlist[i].radius-Player1.radius;
		var difference_in_sizes = Math.abs(Player1.psize-inputlist[i].ssize);
		var difference_in_radius = Math.abs(Player1.radius-inputlist[i].radius);
		var threshold = 30;

		//if the player's size is bigger than the slime size
		if((distance_between<1 && difference_in_radius<=2)||(distance_between<1 && Player1.radius>inputlist[i].radius)){
			Player1.growBigger(inputlist[i].radius);
			slime_radius_range+=2;
			increaseScore(inputlist[i]);
			inputlist[i] = createSlime();
			score_sound.play();
		}
		//if the player is smaller than the other slime
		else if(distance_between<0 && Player1.radius<=inputlist[i].radius){
			Player1.radius = 0;
			isGameOver = true;
			gameEnd(gameloop);
			game_status.innerHTML = "GAME OVER";
			game_status.style.color = "red";
		}
		else{
			console.log("ERROR");
			console.log("ESLIME RADIUS=="+inputlist[i].radius.toString()+", Player RADIUS==" + Player1.radius.toString());
		}
	}
}

//Creates a Slime Object
function createSlime(){
	var x = random_num(0,canvas.width);
	var y = random_num(0,canvas.width);
	var vx = random_num((-1*(slime_speed_range/2)),slime_speed_range);
	var vy = random_num((-1*(slime_speed_range/2)),slime_speed_range);
	var radius = random_num(2,slime_radius_range);
	var scolor = color_list[random_num(0,color_list.length)];

	slime = new Slime(x,y,vx,vy,radius,scolor);

	return slime;
}


//Moves the player based on the mouse and actual ingame-slime positions
function movePlayer(){
	if(hasGameStarted==false){
		Player1.x = -5;
		Player1.y = -5;
		return;
	}
	var distance_from_actual = calcDistance(Player1.x,Player1.y,mousex,mousey);

	Player1.x += Player1.vx;
	Player1.y += Player1.vy;

	if(Player1.y>canvas.height){
		Player1.y = canvas.height;
	}
	if(Player1.y<0){
		Player1.y = 0;
	}
	if(Player1.x>canvas.width){
		Player1.x = canvas.width;
	}
	if(Player1.x<0){
		Player1.x = 0;
	}

	var speedlimit =3;

	if(Player1.vx>speedlimit){
		Player1.vx = speedlimit;
	}
	if(Player1.vx<(-1*speedlimit)){
		Player1.vx = (-1*speedlimit);
	}

	if(Player1.vy>speedlimit){
		Player1.vy = speedlimit;
	}
	if(Player1.vy<(-1*speedlimit)){
		Player1.vy = (-1*speedlimit);
	}


	var far = 10;
	var close = 20;

	//mouse is bottom right
	if(distance_from_actual>8){
		if(mousex>Player1.x && mousey>Player1.y){
			Player1.speedChangeTick -=far; //decreases the speedChangeTick to move quicker (in less time)
			if(Player1.speedChangeTick<0){
				Player1.speedChangeTick = 20;
				Player1.vy +=1;
				Player1.vx +=1;
			}
		}
		//mouse is bottom left
		else if(mousex<Player1.x && mousey>Player1.y){
			Player1.speedChangeTick -=far; //decreases the speedChangeTick to move quicker (in less time)
			if(Player1.speedChangeTick<0){
				Player1.speedChangeTick = 20;
				Player1.vy +=1;
				Player1.vx -=1;
			}
		}
		//mouse is top left
		else if(mousex<Player1.x && mousey<Player1.y){
			Player1.speedChangeTick -=far; //decreases the speedChangeTick to move quicker (in less time)
			if(Player1.speedChangeTick<0){
				Player1.speedChangeTick = 20;
				Player1.vy -=1;
				Player1.vx -=1;
			}
		}

		//mouse is top right
		else if(mousex>Player1.x && mousey<Player1.y){
			Player1.speedChangeTick -=far; //decreases the speedChangeTick to move quicker (in less time)
			if(Player1.speedChangeTick<0){
				Player1.speedChangeTick = 20;
				Player1.vy -=1;
				Player1.vx +=1;
			}
		}
	}

	else if(distance_from_actual>3){
		if(mousex>Player1.x && mousey>Player1.y){
			Player1.speedChangeTick -=close; //decreases the speedChangeTick to move quicker (in less time)
			if(Player1.speedChangeTick<0){
				Player1.speedChangeTick = 20;
				Player1.vy +=1;
				Player1.vx +=1;
			}
		}
		//mouse is bottom left
		else if(mousex<Player1.x && mousey>Player1.y){
			Player1.speedChangeTick -=close; //decreases the speedChangeTick to move quicker (in less time)
			if(Player1.speedChangeTick<0){
				Player1.speedChangeTick = 20;
				Player1.vy +=1;
				Player1.vx -=1;
			}
		}
		//mouse is top left
		else if(mousex<Player1.x && mousey<Player1.y){
			Player1.speedChangeTick -=close; //decreases the speedChangeTick to move quicker (in less time)
			if(Player1.speedChangeTick<0){
				Player1.speedChangeTick = 20;
				Player1.vy -=1;
				Player1.vx -=1;
			}
		}

		//mouse is top right
		else if(mousex>Player1.x && mousey<Player1.y){
			Player1.speedChangeTick -=close; //decreases the speedChangeTick to move quicker (in less time)
			if(Player1.speedChangeTick<0){
				Player1.speedChangeTick = 20;
				Player1.vy -=1;
				Player1.vx +=1;
			}
		}
	}


	else if(distance_from_actual<=3){
		if(Player1.vx ==0){
			Player1.vx = 0;
		}
		if(Player1.vy ==0){
			Player1.vy =0;
		}
		Player1.speedChangeTick = 20;
		if(Player1.vx>0){
			Player1.vx-=1;
			
		}
		else if(Player1.vx<0){
			Player1.vx +=1;
		}

		if(Player1.vy>0){
			Player1.vy -=1;
		}
		else if (Player1.vy<0){
			Player1.vy +=1;
		}
		}
	

}

//Increases the User's Score
function increaseScore(slime){
	if(isGameOver==false){
		player_score+= slime.radius*10;
		updateScore();
	}
}

//Changes the Score HTML element
function updateScore(){
	game_score.innerHTML = "Score:" + player_score.toString();
}


//Scales up/down the slimes 
function zoom(list){
	var scaledown = .3;
	if(Player1.radius>50){
		Player1.radius = Math.floor(Player1.radius*scaledown);
		slime_radius_range = Player1.radius+5; //declares a new range of how big the slimes can be

		for(var i=0;i<list.length;i++){
			var distance_between = calcDistance(Player1.x,Player1.y, inputlist[i].x,inputlist[i].y)-inputlist[i].radius-Player1.radius;
			var chance = random_num(0,100);
			list[i].radius = Math.floor(list[i].radius*scaledown);
			if(list[i].radius<=4 && chance<60 && distance_between>10){
				list[i] = createSlime();
			}
		}
	}
	
}

//Updates the game when called
function update(){
	clearCanvas();
	drawPlayer();
	updateSlimes(slime_list.length,slime_list);
	EatOrEaten(slime_list.length,slime_list); 
	movePlayer();
	zoom(slime_list);

}

//Game Tick
function gameStart(updatesec){
	gameloop = window.setInterval(function(){update();},updatesec);
	return gameloop;
}

//Stops the game when user is eaten
function gameEnd(gameloop){
	clearInterval(gameloop);
}


//Start of the Game
addSlimes(number_of_slimes,slime_list);
gameStart(100);


