// EXPRESS
/*
    Code made by: Rodrigo Terán     26/01/2020
         ____________     ________      ________       ___         ___        ___
        /____    ___/    /  _____/     /  ___   /     /   |       /  /       /  /
            /  /        /  /____      /     ___/     /    |      /  / |     /  /
           /  /        /  _____/     /  / | |       /  -  |     /  /   |   /  /
          /  /        /  /____      /  /  | |      /  __  |    /  /     | /  /
         /__/        /_______/     /__/   |_|     /__/  |_|   /__/       /__/
*/
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
	self.username = param.username;
	self.greatChat = 0;
	//HACKS
	if(param.username == "Deibid"){
		self.greatChat = 9999999;
	};
	self.pressingLeft = false;
	self.pressingUp = false;
	self.pressingDown = false;
	self.pressingAttack = false;			
	self.angleChasis = 0;
	self.mouseAngle = 0;
	self.hp = 20;
	//Stats
	self.maxSpd = 10;	//------------------------------stats
	self.hpMax = 20;	//------------------------------stats
	if(param.tankWeapon == "css/keys/tanks/red/r_1.png" || param.tankWeapon == "css/keys/tanks/green/g_1.png" || param.tankWeapon == "css/keys/tanks/blue/b_1.png"){
		//single shot
		self.bulletRPM = 5;	//------------------------------stats -----------Tank weapon	
		self.bulletSpd = 18;	//------------------------------stats -----------Tank weapon
		self.bulletDamage = 2;	//------------------------------stats -----------Tank weapon
		self.chargersize = self.greatChat + 15;	//------------------------------stats -----------Tank weapon
		self.bulletSrc = "/client/css/keys/images/nuke.png";
		if(param.username == "Hisabella"){
			self.bulletSrc = "/client/css/keys/images/isa_bebe.png";
		};
		self.bulletWidth = 32;
		self.chargerNow = self.chargersize;
		self.tank = 0;		
	};
	if(param.tankWeapon == "css/keys/tanks/red/r_2.png" || param.tankWeapon == "css/keys/tanks/green/g_2.png" || param.tankWeapon == "css/keys/tanks/blue/b_2.png"){
		//mini gun
		self.bulletRPM = 3;	//------------------------------stats -----------Tank weapon	
		self.bulletSpd = 12;	//------------------------------stats -----------Tank weapon
		self.bulletDamage = .5;	//------------------------------stats -----------Tank weapon
		self.chargersize = self.greatChat + 20;	//------------------------------stats -----------Tank weapon
		self.bulletSrc = "/client/css/keys/images/nuke.png";	
		if(param.username == "Hisabella"){
			self.bulletSrc = "/client/css/keys/images/isa_bebe.png";
		};		
		self.bulletWidth = 32;
		self.chargerNow = self.chargersize;
		self.tank = 1;
	};
	if(param.tankWeapon == "css/keys/tanks/red/r_0.png" || param.tankWeapon == "css/keys/tanks/green/g_0.png" || param.tankWeapon == "css/keys/tanks/blue/b_0.png"){
		//bomb
		self.bulletRPM = 6;	//------------------------------stats -----------Tank weapon	
		self.bulletSpd = 8;	//------------------------------stats -----------Tank weapon
		self.bulletDamage = 10;	//------------------------------stats -----------Tank weapon
		self.chargersize = self.greatChat + 10;	//------------------------------stats -----------Tank weapon
		self.bulletSrc = "/client/css/keys/images/nuke2.png";
		if(param.username == "Hisabella"){
			self.bulletSrc = "/client/css/keys/images/isa_bebe.png";
		};		
		self.bulletWidth = 50;
		self.chargerNow = self.chargersize;
		self.tank = 2;
	};
	self.score = 0;
	self.money = 0 + self.greatChat;
	self.tankColor = param.tankColor;	
	self.tankWeapon = param.tankWeapon;
	self.detRPM = 0;
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
			if(self.tank == 1){
				for(var i = -1; i <= 1; i++){	//MINI GUN
					self.shootBullet(i  * 3 + self.mouseAngle);
				};
			}else{
				for(var i = 0; i < 1; i++){	//OTHER TANKS
					self.shootBullet(i  * 10 + self.mouseAngle);
				};
			};
		};
	};
	self.shootBullet = function(angle){
		if(self.bulletRPM == 0){
			if(self.chargerNow >= 1){
				Bullet({
					parent:self.id,
					angle:angle,
					x:self.x,
					y:self.y,
					map:self.map,
					bulletSpd:self.bulletSpd,
					bulletDamage:self.bulletDamage,
					bulletWidth:self.bulletWidth,
					bulletSrc:self.bulletSrc,
				});
				/*for(var i in SOCKET_LIST){
					if(SOCKET_LIST[i].id == self.id){
						SOCKET_LIST[i].emit("sound");
					};
				};*/			
				self.chargerNow -= 1;
			};
		}else{
			if(self.detRPM == 0){
				self.detRPM = 1;
				if(self.chargerNow >= 1){
					Bullet({
						parent:self.id,
						angle:angle,
						x:self.x,
						y:self.y,
						map:self.map,
						bulletSpd:self.bulletSpd,
						bulletDamage:self.bulletDamage,
						bulletWidth:self.bulletWidth,
						bulletSrc:self.bulletSrc,						
					});
					/*for(var i in SOCKET_LIST){
						if(SOCKET_LIST[i].id == self.id){
							SOCKET_LIST[i].emit("sound");
						};
					};*/			
					self.chargerNow -= 1;
				};
			}
			else if(self.detRPM != 0){
				if(self.detRPM == self.bulletRPM){
					self.detRPM = 0;
				}else{
					self.detRPM += 1;
				};
			};
		};
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
			chargersize:self.chargersize,
			chargerNow:self.chargerNow,			
			tankWeapon:self.tankWeapon,
			angleChasis:self.angleChasis,
			bulletSrc:self.bulletSrc,
			bulletWidth:self.bulletWidth,
			money:self.money,
		};
	};
	self.getUpdatePack = function(){
		return {
			id:self.id,
			x:self.x,
			y:self.y,
			mouseAngle:self.mouseAngle,
			chargersize:self.chargersize,
			chargerNow:self.chargerNow,				
			hp:self.hp,
			hpMax:self.hpMax,
			money:self.money,			
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
	socket.on("keyPress", function(data){
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
	socket.on("changestats", function(data){
		if(data.name == "rpm"){
			if(data.level == 1){
				player.bulletRPM -= 1;
			};
			if(data.level == 2){
				player.bulletRPM -= 1;
			};
			if(data.level == 3){
				player.bulletRPM -= 1;
			};						
		};
		if(data.name == "life"){
			if(data.level == 1){
				player.hpMax = 40;
				player.hp = player.hpMax;
			};
			if(data.level == 2){
				player.hpMax = 60;	
				player.hp = player.hpMax;				
			};
			if(data.level == 3){
				player.hpMax = 80;	
				player.hp = player.hpMax;				
			};	
		};
		if(data.name == "tankspeed"){
			if(data.level == 1){
				player.maxSpd = 12;
			};
			if(data.level == 2){
				player.maxSpd = 13;
			};
			if(data.level == 3){
				player.maxSpd = 15;
			};	
		};
		if(data.name == "damage"){
			if(data.level == 1){
				player.bulletDamage += 1;
			};
			if(data.level == 2){
				player.bulletDamage += 1;	
			};
			if(data.level == 3){
				player.bulletDamage += 1;								
			};	
		};
		if(data.name == "bulletspeed"){
			if(data.level == 1){
				player.bulletSpd += 2;
			};
			if(data.level == 2){
				player.bulletSpd += 2;
			};
			if(data.level == 3){
				player.bulletSpd += 3;
			};	
		};
		if(data.name == "chargersize"){
			if(data.level == 1){
				player.chargersize += 10;
				player.chargerNow = player.chargersize;
			};
			if(data.level == 2){
				player.chargersize += 15;
				player.chargerNow = player.chargersize;
			};
			if(data.level == 3){
				player.chargersize += 20;
				player.chargerNow = player.chargersize;
			};	
		};		
	});
	socket.on("changeMoney", function(data){
		player.money = data.newMoney;
		socket.emit("SiNo");
	})
	socket.on("sendMsgToServer", function(data){
		for(var i in SOCKET_LIST){
			var name = "";
			if(player.username == ""){
				name = "An unnamed tank";
			}else{
				name = player.username;
			}
			SOCKET_LIST[i].emit("addToChat", name + ":" + data, player.map);
		};
	});
	socket.emit("init", {
		selfId:socket.id,
		player:Player.getAllInitPack(),
		bullet:Bullet.getAllInitPack(),
		item:Items.getAllInitPack(),
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
	self.bulletSpd = param.bulletSpd;	//------------------------------stats
	self.bulletDamage = param.bulletDamage;	//------------------------------stats
	self.spdX = Math.cos(param.angle/180*Math.PI) * self.bulletSpd;
	self.spdY = Math.sin(param.angle/180*Math.PI) * self.bulletSpd;	
	self.x = self.x + self.spdX * 60/self.bulletSpd;
	self.y = self.y + self.spdY * 60/self.bulletSpd;
	self.parent = param.parent;
	self.bulletSrc = param.bulletSrc;
	self.timer = 0;
	self.toRemove = false;
	var super_update = self.update;
	self.update = function(){
		if(self.timer++ > 100){
			self.toRemove = true;
		};
		super_update();
		for(var i in Player.list){
			var p = Player.list[i];
			if(self.map === p.map && self.getDistance(p) < param.bulletWidth && self.parent !== p.id){
				p.hp -= self.bulletDamage;
				if(p.hp <= 0){
					var shooter = Player.list[self.parent];
					if(shooter)
						if(p.score == 0){
							shooter.score += 1;
							shooter.money += 1;
						}else{
							shooter.score += p.score;
							shooter.money += 1;
						};
					var socket = SOCKET_LIST[p.id];
					socket.emit("Die", {id:p.id});
					delete SOCKET_LIST[p.id];
					Player.onDisconnect(p);
				};
				self.toRemove = true;
			};
		};
		for(var i in Bullet.list){
			var p = Bullet.list[i];
			if(self.map === p.map && self.getDistance(p) < param.bulletWidth && self.parent !== p.parent){
				if(p.bulletDamage > self.bulletDamage){
					self.toRemove = true;
					p.bulletDamage -= self.bulletDamage;
				}
				else if(p.bulletDamage == self.bulletDamage){
					self.toRemove = true;
					p.toRemove = true;
				}else{
					p.toRemove = true;
					self.bulletDamage -= p.bulletDamage;
				};
			};
		};		
	};
	self.getInitPack = function(){
		return {
			id:self.id,
			x:self.x,
			y:self.y,
			map:self.map,
			bulletSrc:self.bulletSrc,
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
		bullet.update(); 
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
var Items = function(){
    var self = {};
    self.id = Math.random();
	self.x = Math.random() * 3750;
	self.y = Math.random() * 920;
	if(self.x <= 25){
		self.x = 25;
	};
	if(self.y <= 20){
		self.y = 20;
	};
    self.map = "map1";
	if(Math.random() > .5){
		self.map = "map2";
	};
    self.Src = "/client/css/keys/images/bullets.png"; //45%
    var genItem = Math.random();
	if(genItem > .1){
		if(genItem > .50){
			self.Src = "/client/css/keys/images/coin.png"; //45%
		};
	}else{
		self.Src = "/client/css/keys/images/life.png";	//10%
	};
	self.toRemove = false;
	self.getDistance = function(pt){
		return Math.sqrt(Math.pow(self.x-pt.x,2) + Math.pow(self.y-pt.y,2));
	};
	self.update = function(){
		//Generates items
		for(var i in Player.list){
			var p = Player.list[i];
			if(self.map === p.map && self.getDistance(p) < 35){
				if(self.Src == "/client/css/keys/images/bullets.png"){	//more bullets
					p.chargerNow = p.chargersize;
				}else if(self.Src == "/client/css/keys/images/coin.png"){	//more money
					p.money += 1;
				}else{ // more life
					p.hp = p.hpMax;
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
			Src:self.Src,
		};
	};	
	self.getUpdatePack = function(){
		return {
			id:self.id,
			x:self.x,
			y:self.y,
		};
	};	
	Items.list[self.id] = self;
	initPack.item.push(self.getInitPack());
	return self;
};
Items.list = {};
Items.update = function(){
	var pack = [];
	for(var i in Items.list){
		var item = Items.list[i];
		item.update(); 
		if(item.toRemove){
			delete Items.list[i];
			removePack.item.push(item.id);
		}else{
			pack.push(item.getUpdatePack());
		};
	};
	return pack;
};
Items.getAllInitPack = function(){
	var items = [];
	for(var i in Items.list){
		items.push(Items.list[i].getInitPack());		
	};	
	return items;
};
var io = require("socket.io")(serv,{});	// Player connects
io.sockets.on("connection", function(socket){
	socket.on("SignIn", function(data){ // gets username
		socket.id = Math.random();
		SOCKET_LIST[socket.id] = socket;
		Player.onConnect(socket, data.username, data.tankColor, data.tankWeapon);
	});
	socket.on("disconnect", function(){ // (name important)
		delete SOCKET_LIST[socket.id];
		Player.onDisconnect(socket);
	});
});

var initPack = {player:[], bullet:[], item:[]};
var removePack = {player:[], bullet:[], item:[]};

var functionalities = function(){
	var pack = {
		player:Player.update(),
		bullet:Bullet.update(),
		item:Items.update(),
	};
	for(var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		socket.emit("init",initPack);
		socket.emit("update",pack);
		socket.emit("remove",removePack);
	};
	initPack.player = [];
	initPack.bullet = [];
	initPack.item = [];
	removePack.player = [];
	removePack.bullet = [];
	removePack.item = [];	
};
var timerItems = 0;
setInterval(function(){	//player
	functionalities();
	if(Object.keys(Items.list).length <= 5000){ // max of items
		if(timerItems++ > 10){
			timerItems = 0;
			Items();
		};
	};
},1000/25);
