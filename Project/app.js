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
var tanks = {};
var tanks_w = {};
var names = {};
var namesLen = {};
var angles = {};

var Entity = function(){	// Entity Class
	var self = {
		x:710,
		y:308,
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
	self.name = ".";
	self.angle = 0;
	self.determinantOfStart = false;
	self.pressingRight = false;
	self.pressingLeft = false;
	self.pressingUp = false;
	self.pressingDown = false;
	self.tank = 'css/keys/tanks/red/r_b.png';
	self.tankw = 'css/keys/tanks/red/r_1.png';	
	self.detOfName = 0;
	self.maxSpd = 10;	// this attribute might change because of the powerups of the shop
	var super_update = self.update;
	self.update = function(){
		self.updateSpd();
		self.updateTank();
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
	self.updateTank = function(){
		self.tank = tanks[self.id];
		self.tankw = tanks_w[self.id];
		self.name = names[self.id];
		self.angle = angles[self.id];
		var cont = 0;
		for(var i in self.name){
			cont += 1;
		};
		if(cont == 0){
			self.detOfName = 0;
		}else{
			var cont_ = ((1 - cont) * 5) + 20; // only change the 30 and 7
			self.detOfName = cont_;
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
			determinantOfStart:player.determinantOfStart,
			angle:player.angle,
			tank:player.tank,
			tankw:player.tankw,
			name:player.name,
			detOfName:player.detOfName,
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
	socket.on("tankOfClient", function(data){
		player.determinantOfStart = true;
		tanks[socket.id] = data.tankId; // gets the actual tank for every client
		names[socket.id] = data.name; // gets the actual name for every client
		tanks_w[socket.id] = data.weatank; // gets the actual tank's weapon for every client
	});
	socket.on("mousePos", function(data){
		angleRad = Math.atan2((data.mouseY - 348), (data.mouseX - 750));
		angleDeg = (angleRad * 180) / Math.PI;
		angleDeg = angleDeg + 90;
		angles[socket.id] = angleDeg;  // gets the actual angle for every client
	});
};
Player.onDisconnect = function(socket){
	delete Player.list[socket.id];
	delete tanks[socket.id];
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
	socket.on("sendMsgToServer", function(data){
		var playerName = names[socket.id];
		for(var i in SOCKET_LIST){
			SOCKET_LIST[i].emit("addToChat", playerName + ":" + data);
		};
	});	
});
setInterval(function(){	// Must important function
	var pack = {
		player:Player.update(),
	};
	for(var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		for(var j = 0; j < pack.player.length; j++){
			console.log(pack);
			if(pack.player[j].determinantOfStart)
				socket.emit("new_position",pack);
		};
	};
},1000/25);
