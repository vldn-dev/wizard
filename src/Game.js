var user = [];
var enemy;
var flag;
var enemies;
var bullets;
var IDE_HOOK = false;
var fireRate = 600;
var nextFire = 0;
var shootButton;
var stream = {x:"0", y:"0", msg:"0", bullet:"0"};
var channel = new DataChannel(location.hash.substr(1) || 'auto-session-establishment', {
		firebase: 'webrtc-experiment'
});
var useranzahl = 0;
Candy.Game = function (game) {
		this.pad;
		this.shootstick;
		this.stick;
		this._player = null;
		this._candyGroup = null;
		this._fontStyle = null;
		Candy._scoreText = null;
		//Candy._enemyName = null;
		Candy._score = 0;
		Candy._health = 0;


};


Candy.Game.prototype = {
		create: function () {
				this.game.renderer.renderSession.roundPixels = true;
				this.physics.startSystem(Phaser.Physics.ARCADE);
				this.add.button(Candy.GAME_WIDTH - 96 - 10, 5, 'button-pause', this.managePause, this);
				this._player = this.add.sprite(5, 260, 'monster-idle');
				bullets = this.add.group();
				bullets.enableBody = true;
				bullets.physicsBodyType = Phaser.Physics.ARCADE;
				enemies = this.add.group();


				bullets.createMultiple(10, 'bullet');
				bullets.setAll('checkWorldBounds', true);
				bullets.setAll('outOfBoundsKill', true);

				this._fontStyle = {
						font: "40px Arial",
						fill: "#FFFFFF",
						stroke: "#333",
						strokeThickness: 5,
						align: "center"
				};

				this._player.anchor.set(0.5);
				this.physics.arcade.enable(this._player);
				this._spawnCandyTimer = 0;

				Candy._scoreText = this.add.text(120, 20, "0", this._fontStyle);
				//Candy._enemyName = this.add.text(20, 20, "0", this._fontStyle);
				Candy._health = 10;
				this._candyGroup = this.add.group();
				this.pad = this.game.plugins.add(Phaser.VirtualJoystick);
				this.stick = this.pad.addStick(0, 0, 200, 'arcade');
				this.stick.scale = 0.6;
				this.stick.alignBottomLeft(48);
				this.shootstick = this.pad.addStick(0, 0, 200, 'arcade');
				this.shootstick.scale = 0.6;
				this.shootstick.alignBottomRight(48);
				shootButton = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

				this.input.maxPointers = 2;
				this.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;

				this.scale.startFullScreen(false);

				channel.onopen = function (userid) {
						if (document.getElementById('chat-input')) document.getElementById('chat-input').disabled = false;

						if (useridBox) useridBox.disabled = false;

						var message = 'Connected';
						appendDIV(message, userid);
	 		stream.x = this._player.x - 50;
						stream.y = this._player.y - 64;
						channel.send(stream);
				};


				channel.onmessage = function (data, userid, latency) {

//		


						if (data.msg == "0"){
								var i = user.indexOf(userid);
								if (user.indexOf(userid) != -1){
if (data.bullet != "0"){ 
								var bullet = bullets.getFirstAlive(); 
							bullet.position = data.bullet; 
					}

										enemies.children[i].x = data.x;
										enemies.children[i].y = data.y;

								}else{
										user.push(userid);
										Candy._scoreText.text = user.length;
										enemy = enemies.create(data.x, data.y, 'monster-idle');
								}


						}else{


								appendDIV(data.msg, userid);	
								console.debug(userid, 'posted', data);
						}

				};
				channel.onleave = function (userid) {
						var message = 'Left you!';
						appendDIV(message, userid);
						console.warn(message);
	
						var i = user.indexOf(userid);
						if (user.indexOf(userid) != -1) {
								user.splice(i,1);
								enemies.children[i].kill();
						}else{
								user.pop;
								enemies.remove(enemy);
						}


						Candy._scoreText.text = user.length;


				};

				var chatOutput = document.getElementById('chat-output');
				var chatInput = document.getElementById('chat-input');
				var useridBox = document.getElementById('user-id');

				function appendDIV(data, userid, parent) {
						var div = document.createElement('div');
						if (parent) div.innerHTML = data;
						else {
								div.innerHTML = '<section class="user-id" contenteditable title="Use his user-id to send him direct messages or throw out of the room!">' + userid + '</section>' + '<section class="message" contenteditable>' + data + '</section>';
						}
						if (!parent) chatOutput.appendChild(div, chatOutput.firstChild);
						div.tabIndex = 0;
						div.focus();
						chatInput.focus();
				}


				chatInput.onkeypress = function (e) {
						if (e.keyCode !== 13 || !this.value) return;
						if (useridBox.value.length) {
								var user = channel.channels[useridBox.value];
								if (user) user.send(this.value);
								else return alert('No such user exists.');
						} 
						else {
								stream.msg = this.value;
								channel.send(stream);
								stream.msg = "0";

						}
						appendDIV(this.value, 'Me');
						this.value = '';
						this.focus();
				};

		},


		managePause: function () {
				this.game.paused = true;
				var pausedText = this.add.text(100, 250, "Game paused.\nTap anywhere to continue.", this._fontStyle);
				this.input.onDown.add(function () {
						pausedText.destroy();
						this.game.paused = false;
				}, this);
		},

		update: function () {

				if (this.shootstick.isDown)

				{


						if (this.time.now > nextFire && bullets.countDead() > 0)
						{
								nextFire = this.time.now + fireRate;

								var bullet = bullets.getFirstDead();

								bullet.reset(this._player.x - 8, this._player.y - 8);

								this.physics.arcade.velocityFromRotation(this.shootstick.rotation, 400, bullet.body.velocity);
stream.bullet = bullet.position;
			channel.send(stream);
						}
				}
				var maxSpeed = 400;
				if (this.stick.isDown) {
						this.physics.arcade.velocityFromRotation(this.stick.rotation, this.stick.force * maxSpeed, this._player.body.velocity); 
						stream.x = this._player.x - 50;
						stream.y = this._player.y - 64;
						channel.send(stream);


				} else {
						this._player.body.velocity.set(0);
				}
		}

};
