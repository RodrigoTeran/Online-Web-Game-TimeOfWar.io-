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

var Entity = function(){	// Entity Class
	var self = {
		x:700,
		y:268,
		spdX:0,
		spdY:0,
		id:"",
	};
	self.update = function(){
		self.updatePosition();
	};
	self.updatePosition = function(){
		self.x += self.spdX;
		self.y += self.spdY;
	};
	return self;
};
var Player = function(id){	// PLayer Class
	var self = Entity();
	self.id = id;
	self.pressingRight = false;
	self.pressingLeft = false;
	self.pressingUp = false;
	self.pressingDown = false;			
	self.maxSpd = 10;	// this attribute might change because of the powerups of the shop
	var super_update = self.update;
	self.update = function(){
		self.updateSpd();
		super_update();
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
	Player.list[id] = self;
	return self;
};
Player.list = {};
Player.update = function(){
	var pack = [];
	for(var i in Player.list){
		var player = Player.list[i];
		player.update();
		pack.push({
			x:player.x,
			y:player.y,
		});
	};
	return pack;
};
Player.onConnect = function(socket){
	var player = Player(socket.id);
	socket.on("keyPress", function(data){
		if(data.inputId === "left")
			player.pressingLeft = data.state;
		else if(data.inputId === "right")
			player.pressingRight = data.state;
		else if(data.inputId === "up")
			player.pressingUp = data.state;
		else if(data.inputId === "down")
			player.pressingDown = data.state;									
	});
};
Player.onDisconnect = function(socket){
	delete Player.list[socket.id];
};
var io = require("socket.io")(serv,{});	// Player connects
io.sockets.on("connection", function(socket){
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;
	Player.onConnect(socket);
	
	socket.on("disconnect", function(){
		delete SOCKET_LIST[socket.id];
		Player.onDisconnect(socket);
	});
});
setInterval(function(){	// Must important function
	var pack = {
		player:Player.update(),
	};
	for(var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		socket.emit("new_position",pack);
	};	
},1000/25);
