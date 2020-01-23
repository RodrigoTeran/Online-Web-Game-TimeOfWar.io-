// EXPRESS
var express = require("express");
var path = require('path');
var app = express();
var publicPath = path.resolve(__dirname, 'client');	//to use the css styles
var serv = require("http").Server(app);
app.use(express.static(publicPath));
app.get("/", function(req, res){
	res.sendFile(__dirname + "/client/index.html");
});
app.use("/client", express.static(__dirname + "/client"));
serv.listen(2000); // Local host port
console.log("Starting Server..."); // When the server is started

// SOCKETS
var SOCKET_LIST = {}; 
var Entity = function(param){
	var self = {
		x:Math.random() * 3725 + 25,
		y:Math.random() * 900 + 20,
		spdX:0,
		spdY:0,
		id:"",
		map:"map1",
	};
	if(param){
		if(param.x){
			self.x = param.x;
		};
		if(param.y){
			self.y = param.y;		
		};
		if(param.map){
			self.map = param.map;
		};
		if(param.id){
			self.id = param.id;
		};				
	};
	self.update = function(){
		self.updatePosition();
	};
	self.updatePosition = function(){
		self.x += self.spdX;
		self.y += self.spdY;			
	};
	self.getDistance = function(pt){
		return Math.sqrt(Math.pow(self.x-pt.x,2) + Math.pow(self.y-pt.y,2));
	};
	return self;
};
var Player = function(param){
	var self = Entity(param);
	self.number = "" + Math.floor(10 * Math.random());
	self.pressingRight = false;
	self.pressingLeft = false;
	self.pressingUp = false;
	self.pressingDown = false;
	self.pressingAttack = false;			
	self.angleChasis = 0;
	self.mouseAngle = 0;
	//Stats		
	self.maxSpd = 10;	//------------------------------stats
	self.hp = 10;
	self.hpMax = 10;	//------------------------------stats
	self.score = 0;
	self.username = param.username;
	self.tankColor = param.tankColor;	
	self.tankWeapon = param.tankWeapon;
	
	var super_update = self.update;
	self.update = function(){
		self.updateSpd();
		super_update();
		if(self.x <= 25){
			self.x = 25;
		};
		if(self.x >= 4333){
			self.x = 4333;
		};
		if(self.y <= 20){
			self.y = 20;
		};
		if(self.y >= 975){
			self.y = 975;
		};		
		if(self.pressingAttack){
			for(var i = 0; i < 1; i++){
				self.shootBullet(i  * 10 + self.mouseAngle);
			};
		};
	};
	self.shootBullet = function(angle){
		Bullet({
			parent:self.id,
			angle:angle,
			x:self.x,
			y:self.y,
			map:self.map,
		});		
	};
	self.updateSpd = function(){
		if(self.pressingRight){
			self.spdX = self.maxSpd;
		}
		else if(self.pressingLeft){
			self.spdX = -self.maxSpd;
		}
		else{
			self.spdX = 0;
		};
		if(self.pressingUp){
			self.spdY = -self.maxSpd;
		}
		else if(self.pressingDown){
			self.spdY = self.maxSpd;
		}
		else{
			self.spdY = 0;
		};								
	};
	self.getInitPack = function(){
		return {
			id:self.id,
			x:self.x,
			y:self.y,
			number:self.number,
			mouseAngle:self.mouseAngle,
			hp:self.hp,
			hpMax:self.hpMax,
			score:self.score,
			map:self.map,
			username:self.username,
			tankColor:self.tankColor,
			tankWeapon:self.tankWeapon,
			angleChasis:self.angleChasis,
		};
	};
	self.getUpdatePack = function(){
		return {
			id:self.id,
			x:self.x,
			y:self.y,
			mouseAngle:self.mouseAngle,
			hp:self.hp,
			score:self.score,
			angleChasis:self.angleChasis,
		};
	};
	Player.list[self.id] = self;
	initPack.player.push(self.getInitPack());
	return self;
};
Player.list = {};
Player.onConnect = function(socket, username, tankColor, tankWeapon){
	var map = "map1";
	if(Math.random() > .5){
		map = "map2";
	};
	var player = Player({
		id:socket.id,
		username:username,
		map:map,
		tankColor:tankColor,
		tankWeapon:tankWeapon,
	});
	var detKeys = [0,0,0,0];
	socket.on("keyPress", function(data){ // (name important)
		if(data.inputId === "left"){
			player.pressingLeft = data.state;
			if(data.state == true){
				detKeys[0] = 1;
			}else{
				detKeys[0] = 0;
			};
		};
		if(data.inputId === "right"){
			player.pressingRight = data.state;
			if(data.state == true){
				detKeys[1] = 1;
			}else{
				detKeys[1] = 0;
			};
		};
		if(data.inputId === "up"){
			player.pressingUp = data.state;
			if(data.state == true){
				detKeys[2] = 1;
			}else{
				detKeys[2] = 0;
			};
		};
		if(data.inputId === "down"){
			player.pressingDown = data.state;
			if(data.state == true){
				detKeys[3] = 1;
			}else{
				detKeys[3] = 0;
			};
		};
		if(data.inputId === "attack")
			player.pressingAttack = data.state;
		if(data.inputId === "mouseAngle")
			player.mouseAngle = data.state;
		// chacar ángulo chasis
		if((detKeys[2] == 1 && detKeys[0] == 1) || (detKeys[1] == 1 && detKeys[3] == 1)){
			player.angleChasis = -45;
		}
		else if((detKeys[2] == 1 && detKeys[1] == 1) || (detKeys[3] == 1 && detKeys[0] == 1)){
			player.angleChasis = 45;
		}
		else if(detKeys[2] == 1 || detKeys[3] == 1){
			player.angleChasis = 0;
		}
		else if(detKeys[0] == 1 || detKeys[1] == 1){
			player.angleChasis = 90;
		};		
	});
	socket.on("sendMsgToServer", function(data){
		for(var i in SOCKET_LIST){
			var name = "";
			if(player.username == ""){
				name = "An unnamed tank";
			}else{
				name = player.username;
			}
			SOCKET_LIST[i].emit("addToChat", name + ":" + data);
		};
	});
	socket.emit("init", {
		selfId:socket.id,
		player:Player.getAllInitPack(),
		bullet:Bullet.getAllInitPack(),
	});
};
Player.getAllInitPack = function(){
	var players = [];
	for(var i in Player.list){
		players.push(Player.list[i].getInitPack());		
	};
	return players;
};

Player.onDisconnect = function(socket){
	delete Player.list[socket.id];
	removePack.player.push(socket.id);
};
Player.update = function(){
	var pack = [];
	for(var i in Player.list){
		var player = Player.list[i];
		player.update();
		pack.push(player.getUpdatePack());
	};
	return pack;
};
var Bullet = function(param){
	var self = Entity(param);
	self.id = Math.random();
	self.angle = param.angle;
	self.bulletSpd = 15;	//------------------------------stats
	self.bulletDamage = 1;	//------------------------------stats
	self.scoreIfKill = 1;
	self.spdX = Math.cos(param.angle/180*Math.PI) * self.bulletSpd;
	self.spdY = Math.sin(param.angle/180*Math.PI) * self.bulletSpd;	
	self.x = self.x + self.spdX * 5;
	self.y = self.y + self.spdY * 5;
	self.parent = param.parent;
	self.timer = 0;
	self.toRemove = false;
	var super_update = self.update;
	var det = 0;
	self.update = function(){
		if(self.timer++ > 100){
			self.toRemove = true;
		};
		super_update();
		for(var i in Player.list){
			var p = Player.list[i];
			if(self.map === p.map && self.getDistance(p) < 32 && self.parent !== p.id){
				p.hp -= self.bulletDamage;
				if(p.hp <= 0){
					var shooter = Player.list[self.parent];
					if(shooter)
						shooter.score += self.scoreIfKill;
					p.hp = p.hpMax;
					p.x = Math.random() * 3750;
					p.y = Math.random() * 920;
					if(p.x <= 25){
						p.x = 25;
					};
					if(p.y <= 20){
						p.y = 20;
					};
				};
				self.toRemove = true;
			};
		};
	};
	self.getInitPack = function(){
		return {
			id:self.id,
			x:self.x,
			y:self.y,
			map:self.map,
		};
	};
	self.getUpdatePack = function(){
		return {
			id:self.id,
			x:self.x,
			y:self.y,
		};
	};		
	Bullet.list[self.id] = self;
	initPack.bullet.push(self.getInitPack());
	return self;
};
Bullet.list = {};
Bullet.update = function(){
	var pack = [];
	for(var i in Bullet.list){
		var bullet = Bullet.list[i];
		bullet.update(); // que este no se haga esperando el rpm
		if(bullet.toRemove){
			delete Bullet.list[i];
			removePack.bullet.push(bullet.id);
		}else
			pack.push(bullet.getUpdatePack());
	};
	return pack;
};
Bullet.getAllInitPack = function(){
	var bullets = [];
	for(var i in Bullet.list){
		bullets.push(Bullet.list[i].getInitPack());		
	};	
	return bullets;
};
var io = require("socket.io")(serv,{});	// Player connects
io.sockets.on("connection", function(socket){
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;

	socket.on("SignIn", function(data){ // gets username
		Player.onConnect(socket, data.username, data.tankColor, data.tankWeapon);
	});
	socket.on("disconnect", function(){ // (name important)
		delete SOCKET_LIST[socket.id];
		Player.onDisconnect(socket);
	});
	socket.on("evalServer", function(data){
		var res = eval(data);		
		socket.emit("evalAnswer", res);
	});
});

var initPack = {player:[], bullet:[]};
var removePack = {player:[], bullet:[]};

var functionalities = function(){
	var pack = {
		player:Player.update(),
		bullet:Bullet.update(),
	};
	for(var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		socket.emit("init",initPack);
		socket.emit("update",pack);
		socket.emit("remove",removePack);
	};	
	initPack.player = [];
	initPack.bullet = [];
	removePack.player = [];
	removePack.bullet = [];
};

setInterval(function(){	//player
	functionalities();
},1000/25);
