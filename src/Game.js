var enemy;

var channel = new DataChannel(location.hash.substr(1) || 'auto-session-establishment', {
    firebase: 'webrtc-experiment'
});

Candy.Game = function (game) {
    this.pad;
    this.stick;
    this._player = null;
    this._candyGroup = null;
    this._fontStyle = null;
    Candy._scoreText = null;
    Candy._enemyName = null;
    Candy._score = 0;
    Candy._health = 0;
};


Candy.Game.prototype = {
    create: function () {

        this.game.renderer.renderSession.roundPixels = true;
        this.physics.startSystem(Phaser.Physics.ARCADE);
        this.add.sprite(0, 0, 'background');
        this.add.sprite(10, 5, 'score-bg');
        this.add.button(Candy.GAME_WIDTH - 96 - 10, 5, 'button-pause', this.managePause, this);
        this._player = this.add.sprite(5, 260, 'monster-idle');

        var enemies = this.add.group();

        this._fontStyle = {
            font: "40px Arial",
            fill: "#FFFFFF",
            stroke: "#333",
            strokeThickness: 5,
            align: "center"
        };
        this.physics.arcade.enable(this._player);
        this._spawnCandyTimer = 0;

        Candy._scoreText = this.add.text(120, 20, "0", this._fontStyle);
        Candy._enemyName = this.add.text(20, 20, "0", this._fontStyle);
        Candy._health = 10;
        this._candyGroup = this.add.group();
        this.pad = this.game.plugins.add(Phaser.VirtualJoystick);
        this.stick = this.pad.addStick(0, 0, 200, 'arcade');
        this.stick.showOnTouch = true;



        channel.onopen = function (userid) {
            if (document.getElementById('chat-input')) document.getElementById('chat-input').disabled = false;
            // if (document.getElementById('file')) document.getElementById('file').disabled = false;
            if (useridBox) useridBox.disabled = false;
            enemies.create(20,20, 'monster-idle');

          Candy._enemyName.text = userid;

        };
        channel.onmessage = function (data, userid, latency) {
            //   console.debug(userid, 'posted', data);
            enemies.getFirstAlive().position = data;
            Candy._enemyName.position = data;

        };
        channel.onleave = function (userid) {
            var message = 'A user whose id is ' + userid + ' left you!';
            appendDIV(message, userid);
            console.warn(message);
            enemies.getFirstAlive().kill();
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
            } else channel.send(this.value);
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
        var maxSpeed = 400;
        if (this.stick.isDown) {
            channel.send(this._player.position);
            this.physics.arcade.velocityFromRotation(this.stick.rotation, this.stick.force * maxSpeed, this._player.body.velocity);
        } else {
            this._player.body.velocity.set(0);
        }
    }
};
