
   var enemy;
   var flag;
           var channel = new DataChannel(location.hash.substr(1) || 'auto-session-establishment', {
                    firebase: 'webrtc-experiment'
                });
Candy.Game = function(game){
		this.pad;
		this.stick;
	// define needed variables for Candy.Game
	this._player = null;

	this._candyGroup = null;
	this._spawnCandyTimer = 0;
	this._fontStyle = null;
	// define Candy variables to reuse them in Candy.item functions
	Candy._scoreText = null;
	Candy._score = 0;
	Candy._health = 0;

};
Candy.Game.prototype = {



	create: function(){
   

                channel.onmessage = function(data, userid, latency) {
                 //   console.debug(userid, 'posted', data);
                //    appendDIV(data, userid);
                //    console.log('latency:', latency, 'ms');
                    enemy.position = data;
                };

                channel.onopen = function() {
                    if (document.getElementById('chat-input')) document.getElementById('chat-input').disabled = false;
                   // if (document.getElementById('file')) document.getElementById('file').disabled = false;
                    if (useridBox) useridBox.disabled = false;
                      
                };

        //     channel.onFileProgress = function(packets, uuid) {
        //            appendDIV(uuid + ': ' + (
         //                   packets.sent
         //                       ? (packets.sent + ' sent')
        //                        : (packets.received + ' received')
        //                ) + ' / ' + packets.remaining + ' remaining', 'file', fileProgress);
        //        };

        //        channel.onFileSent = function(file) {
      //              appendDIV(file.name + ' sent.', 'file', fileProgress);
      //          };

      //          channel.onFileReceived = function(fileName) {
       //             appendDIV(fileName + ' received.', 'file', fileProgress);
       //         };

           ///     document.getElementById('file').onchange = function() {
           //        var file = this.files[0];
           //         channel.send(file);
          //   };

                var chatOutput = document.getElementById('chat-output');
               //     fileProgress = document.getElementById('file-progress');

                function appendDIV(data, userid, parent) {
                    var div = document.createElement('div');
                    if (parent) div.innerHTML = data;
                    else {
                        div.innerHTML = '<section class="user-id" contenteditable title="Use his user-id to send him direct messages or throw out of the room!">' + userid + '</section>'
                            + '<section class="message" contenteditable>' + data + '</section>';
                    }

                    if (!parent) chatOutput.appendChild(div, chatOutput.firstChild);
                 

                    div.tabIndex = 0;
                    div.focus();

                    chatInput.focus();
                }

                var chatInput = document.getElementById('chat-input');
                var useridBox = document.getElementById('user-id');
                chatInput.onkeypress = function(e) {
                    if (e.keyCode !== 13 || !this.value) return;

                    if (useridBox.value.length) {
                        var user = channel.channels[useridBox.value];
                        if (user) user.send(this.value);
                        else return alert('No such user exists.');
                    } else channel.send(this.value);

                    appendDIV(this.value, 'Me');

                    this.value = '';
                    this.focus();
                };

    /* users presence detection */
                channel.onleave = function(userid) {
                    var message = 'A user whose id is ' + userid + ' left you!';
                    appendDIV(message, userid);
                    console.warn(message);
                };

            // channel.leave( userid ); --- eject a user
            // channel.leave(); --- leave the room yourself!
		// start the physics engine
		this.game.renderer.renderSession.roundPixels = true;
		this.physics.startSystem(Phaser.Physics.ARCADE);
		// set the global gravity
	//	this.physics.arcade.gravity.y = 200;
		// display images: background, floor and score
		this.add.sprite(0, 0, 'background');
		//this.add.sprite(-30, Candy.GAME_HEIGHT-160, 'floor');
		this.add.sprite(10, 5, 'score-bg');
		// add pause button
		this.add.button(Candy.GAME_WIDTH-96-10, 5, 'button-pause', this.managePause, this);
		// create the player
		this._player = this.add.sprite(5, 260, 'monster-idle');
		enemy = this.add.sprite(200, 260, 'monster-idle');
		// add player animation
	//	this._player.animations.add('idle', [0,1,2,3,4,5,6,7,8,9,10,11,12], 10, true);
		// play the animation
		this._player.animations.play('idle');
		// set font style
		this._fontStyle = { font: "40px Arial", fill: "#FFCC00", stroke: "#333", strokeThickness: 5, align: "center" };
		// initialize the spawn timer
	    this.physics.arcade.enable(this._player);
		this._spawnCandyTimer = 0;
		// initialize the score text with 0
		Candy._scoreText = this.add.text(120, 20, "0", this._fontStyle);
		// set health of the player
		Candy._health = 10;
		// create new group for candy
		this._candyGroup = this.add.group();
		// spawn first candy
		//Candy.item.spawnCandy(this);

			this.pad = this.game.plugins.add(Phaser.VirtualJoystick); 
				this.stick = this.pad.addStick(0, 0, 200, 'arcade');
				this.stick.showOnTouch = true;
	},
	managePause: function(){
		// pause the game
		this.game.paused = true;

		// add proper informational text
		var pausedText = this.add.text(100, 250, "Game paused.\nTap anywhere to continue.", this._fontStyle);
		// set event listener for the user's click/tap the screen
		this.input.onDown.add(function(){
			// remove the pause text
			pausedText.destroy();
			// unpause the game
			this.game.paused = false;
		}, this);
	},
	update: function(){
			var maxSpeed = 400;

				if (this.stick.isDown)
				{
						channel.send(this._player.position);
						this.physics.arcade.velocityFromRotation(this.stick.rotation, this.stick.force * maxSpeed, this._player.body.velocity);
				}
				else
				{
						this._player.body.velocity.set(0);
				}
		// update timer every frame
	//	this._spawnCandyTimer += this.time.elapsed;
		// if spawn timer reach one second (1000 miliseconds)
		//if(this._spawnCandyTimer > 1000) {
			// reset it
	//		this._spawnCandyTimer = 0;
			// and spawn new candy
	//		Candy.item.spawnCandy(this);
		}
		// loop through all candy on the screen
	//	this._candyGroup.forEach(function(candy){
			// to rotate them accordingly
	//		candy.angle += candy.rotateMe;
	//	});
	//	// if the health of the player drops to 0, the player dies = game over
	//	if(!Candy._health) {
			// show the game over message
	//		this.add.sprite((Candy.GAME_WIDTH-594)/2, (Candy.GAME_HEIGHT-271)/2, 'game-over');
			// pause the game
	//		this.game.paused = true;
	//	}
	//}
};

Candy.item = {
	spawnCandy: function(game){
		// calculate drop position (from 0 to game width) on the x axis
		var dropPos = Math.floor(Math.random()*Candy.GAME_WIDTH);
		// define the offset for every candy
		var dropOffset = [-27,-36,-36,-38,-48];
		// randomize candy type
		var candyType = Math.floor(Math.random()*5);
		// create new candy
		var candy = game.add.sprite(dropPos, dropOffset[candyType], 'candy');
		// add new animation frame
		candy.animations.add('anim', [candyType], 10, true);
		// play the newly created animation
		candy.animations.play('anim');
		// enable candy body for physic engine
		game.physics.enable(candy, Phaser.Physics.ARCADE);
		// enable candy to be clicked/tapped
		candy.inputEnabled = true;
		// add event listener to click/tap
		candy.events.onInputDown.add(this.clickCandy, this);
		// be sure that the candy will fire an event when it goes out of the screen
		candy.checkWorldBounds = true;
		// reset candy when it goes out of screen
		candy.events.onOutOfBounds.add(this.removeCandy, this);
		// set the anchor (for rotation, position etc) to the middle of the candy
		candy.anchor.setTo(0.5, 0.5);
		// set the random rotation value
		candy.rotateMe = (Math.random()*4)-2;
		// add candy to the group
		game._candyGroup.add(candy);
	},
	clickCandy: function(candy){
		// kill the candy when it's clicked
		candy.kill();
		// add points to the score
		Candy._score += 1;
		// update score text
		Candy._scoreText.setText(Candy._score);
	},
	removeCandy: function(candy){
		// kill the candy
		candy.kill();
		// decrease player's health
		Candy._health -= 10;
	}
};