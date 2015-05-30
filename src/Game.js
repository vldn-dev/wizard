/*
			JS library reference:
			http://developers.bistri.com/webrtc-sdk/js-library-reference
			*/

var room;
var users = {};
var dataChannels = {};

// when Bistri API client is ready, function
// "onBistriConferenceReady" is invoked
onBistriConferenceReady = function () {

		// test if the browser is WebRTC compatible
		if ( !bc.isCompatible() ) 	{
				// if the browser is not compatible, display an alert
				alert( "your browser is not WebRTC compatible !" );
				// then stop the script execution
				return;
		}

		/* Set events handler */

		// when local user is connected to the server
		bc.signaling.bind( "onConnected", function () {
				// show pane with id "pane_1"
				showPanel( "pane_1" );
		} );

		// when an error occured on the server side
		bc.signaling.bind( "onError", function () {
				// display an alert message
				alert( error.text + " (" + error.code + ")" );
		} );

		// when the user has joined a room
		bc.signaling.bind( "onJoinedRoom", function ( data ) {
				// set the current room name
				room = data.room;
				// show pane with id "pane_2"
				showPanel( "pane_2" );
				// then, for every single members present in the room
				for ( var i=0, max=data.members.length; i<max; i++ ) {
						// set a couple id/nickname to "users" object
						users[ data.members[ i ].id ] = data.members[ i ].name;
						// and open a data channel
						bc.openDataChannel( data.members[ i ].id, "chat", data.room );
				}
		} );

		// when an error occurred while trying to join a room
		bc.signaling.bind( "onJoinRoomError", function ( error ) {
				// display an alert message
				alert( error.text + " (" + error.code + ")" );
		} );

		// when the local user has quitted the room
		bc.signaling.bind( "onQuittedRoom", function( room ) {
				// show pane with id "pane_1"
				showPanel( "pane_1" ); 
				// stop the local stream
				bc.stopStream();
		} );

		// when a remote user has joined a room in which the local user is
		bc.signaling.bind( "onPeerJoinedRoom", function ( peer ) {
				// set a couple id/nickname to "users" object        
				users[ peer.pid ] = peer.name;
		} );

		// when a remote user has quitted a room in which the local user is
		bc.signaling.bind( "onPeerQuittedRoom", function ( peer ) {
				// delete couple id/nickname in "users" object
				delete users[ peer.pid ];
		} );

		// when the local user has created a data channel, invoke "onDataChannel" callback
		bc.channels.bind( "onDataChannelCreated", onDataChannel );

		// when the remote user has created a data channel, invoke "onDataChannel" callback
		bc.channels.bind( "onDataChannelRequested", onDataChannel );

		// bind function "setNickname" to button "Set Nickname"
		q( "#nick" ).addEventListener( "click", setNickname );

		// bind function "joinChatRoom" to button "Join Chat Room"
		q( "#join" ).addEventListener( "click", joinChatRoom );

		// bind function "quitChatRoom" to button "Quit Chat Room"
		q( "#quit" ).addEventListener( "click", quitChatRoom );

		// bind function "sendChatMessage" to button "Send Message"
		q( "#send" ).addEventListener( "click", sendChatMessage );

}

// when "onDataChannelCreated" or "onDataChannelRequested" events are triggered
function onDataChannel( dataChannel, remoteUserId ){

		/* set data channel events handler */

		// when the data channel is open 
		dataChannel.onOpen = function(){
				// set a couple id/datachannel to "dataChannels" object
				dataChannels[ remoteUserId ] = this;
				// check chat partner presence
				isThereSomeone();
		};

		// when the data channel is closed
		dataChannel.onClose = function(){
				// delete couple id/datachannel from "dataChannels" object
				delete dataChannels[ remoteUserId ];
				// check chat partner presence
				isThereSomeone();
		};

		// when a message is received through the data channel
		dataChannel.onMessage = function( event ){
				// display the received message
				displayMessage( users[ remoteUserId ], event.data );
		};

}

// when button "Set Nickname" has been clicked
function setNickname(){
		// get nickname field content
		var nickname = Math.floor((Math.random() * 100) + 1);
		// if a nickname has been set ...
		if( nickname ){
				// initialize API client with application keys and nickname
				// if you don't have your own, you can get them at:
				// https://api.developers.bistri.com/login
				bc.init( {
						appId: "be2dad56",
						appKey: "332ab4c0c5b530b3fc4040e0bd41273e",
						userName: nickname,
						debug: true
				} ); 
				// open a new session on the server
				bc.connect();
		}
		else{
				// otherwise, display an alert
				alert( "you must enter a nickname !" );
		} 
}

// when button "Join Chat Room" has been clicked
function joinChatRoom(){
		// get chat room field content
		var roomToJoin = q( "#room_field" ).value;
		// if a chat room name has been set ...
		if( roomToJoin ){
				// ... join the room
				bc.joinRoom( roomToJoin );
		}
		else{
				// otherwise, display an alert
				alert( "you must enter a room name !" );
		}  
}

// when button "Quit Chat Room" has been clicked
function quitChatRoom(){   
		// for each data channel present in "dataChannels" object ...
		for( var id in dataChannels ){
				// ... close the data channel
				dataChannels[ id ].close();
		}  
		// and quit chat room
		bc.quitRoom( room );
}

// when button "Send Message" has been clicked
function sendChatMessage(){
		// get message field content
		var message = q( "#message_field" ).value;
		// if a chat room name has been set ...
		if( message ){
				// for each data channel present in "dataChannels" object ...
				for( var id in dataChannels ){
						// ... send a message
						dataChannels[ id ].send( message );
				}
				// display the sent message
				displayMessage( "me", message );
				// reset message field content
				q( "#message_field" ).value = "";
		}   
}

// when a message must be dislpayed
function displayMessage( user, message ){
		// create a message node and insert it in div#messages_container node
		var container = q( "#messages_container" );
		var textNode = document.createTextNode( user + " > " + message );
		var node = document.createElement( "div" );
		node.className = "message";
		node.appendChild( textNode );
		container.appendChild( node );
		// scroll to bottom to always display the last message
		container.scrollTop = container.scrollHeight;
}

// when checking for chat partner presence
function isThereSomeone(){
		// if "dataChannels" object contains one or more data channel objects ...
		if( Object.keys( dataChannels ).length ){
				// ... enabled "Send Message" button
				q( "#send" ).removeAttribute( "disabled" );
		}
		else{
				// otherwise disable "Send Message" button
				q( "#send" ).setAttribute( "disabled", "disabled" );
		}
}

function showPanel( id ){ 
		var panes = document.querySelectorAll( ".pane" );
		// for all nodes matching the query ".pane"
		for( var i=0, max=panes.length; i<max; i++ ){
				// hide all nodes except the one to show
				panes[ i ].style.display = panes[ i ].id == id ? "block" : "none";
		};
}

function q( query ){
		// return the DOM node matching the query
		return document.querySelector( query );
}
Candy.Game = function(game){
	// define needed variables for Candy.Game
		this.pad;
		this.stick;
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
		// add player animation
		this._player.animations.add('idle', [0,1,2,3,4,5,6,7,8,9,10,11,12], 10, true);
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
//		Candy.item.spawnCandy(this);
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
				this.physics.arcade.velocityFromRotation(this.stick.rotation, this.stick.force * maxSpeed, this._player.body.velocity);
				}
		else
				{
				this._player.body.velocity.set(0);
				}
		// update timer every frame
/*		this._spawnCandyTimer += this.time.elapsed;
		// if spawn timer reach one second (1000 miliseconds)
		if(this._spawnCandyTimer > 1000) {
			// reset it
			this._spawnCandyTimer = 0;
			// and spawn new candy
			Candy.item.spawnCandy(this);
		}
		// loop through all candy on the screen
		this._candyGroup.forEach(function(candy){
			// to rotate them accordingly
			candy.angle += candy.rotateMe;
		});
		*/
		// if the health of the player drops to 0, the player dies = game over
		if(!Candy._health) {
			// show the game over message
			this.add.sprite((Candy.GAME_WIDTH-594)/2, (Candy.GAME_HEIGHT-271)/2, 'game-over');
			// pause the game
			this.game.paused = true;
		}
	}
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
