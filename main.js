var mainState = {
  preload: function() {
    game.load.image('bird', 'assets/bird.png');
    game.load.image('pipe', 'assets/pipe.png');
    game.load.audio('jump', 'assets/jump.wav');
  },


  create: function() {
    // Mobile display
    if (game.device.desktop === false) {
      game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
      game.scale.setMinMax(game.width / 2, game.height / 2, game.width, game.height);
      game.scale.pageAlignHorizontally = true;
      game.scale.pageAlignVertically = true;
    }

    game.stage.backgroundColor = '#71c5cf';
    game.physics.startSystem(Phaser.Physics.ARCADE);
    this.jumpSound = game.add.audio('jump');

    // Brid
    this.bird = game.add.sprite(100, 245, 'bird');
    game.physics.arcade.enable(this.bird);
    this.bird.body.gravity.y = 1000;
    this.bird.anchor.setTo(-0.2, 0.5);

    // Controls
    var spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR),
        upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
    spaceKey.onDown.add(this.jump, this);
    upKey.onDown.add(this.jump, this);

    // Jump when clicking/tapping
    game.input.onDown.add(this.jump, this);

    // Pipes
    this.pipes = game.add.group();

    // Add rows of pips every 15s
    this.timer = game.time.events.loop(1500, this.addRowOfPipes, this);

    // Score
    this.score = 0;
    this.labelScore = game.add.text(20, 20, '0', {
      font: '30px Arial', fill: '#fff'
    });
  },


  update: function() {
    // Restart the game if bird goes out of the screen
    if (this.bird.y < 0 || this.bird.y > 490) {
      this.restartGame();
    }

    // Rotate bird down when not flapping
    if (this.bird.angle < 20) {
      this.bird.angle++;
    }

    // Play death animation when hit pipe
    game.physics.arcade.overlap(this.bird, this.pipes, this.hitPipe, null, this);
  },


  jump: function() {
    if (this.bird.alive == false) { return; }

    this.bird.body.velocity.y = -350;

    // Rotate bird up when flapping
    var animation = game.add.tween(this.bird);
    animation.to({ angle: -20 }, 100).start();

    this.jumpSound.play();
  },

  restartGame: function() {
    game.state.start('main');
  },


  addPipe: function(x, y) {
    var pipe = game.add.sprite(x, y, 'pipe');
    this.pipes.add(pipe);

    game.physics.arcade.enable(pipe);
    pipe.body.velocity.x = -200;

    // Remove pipes when no longer visable
    pipe.checkWorldBounds = true;
    pipe.outOfBoundsKill = true;
  },

  addRowOfPipes: function() {
    var hole = Math.floor( Math.random() * 5 ) + 1;

    for (var i = 0; i < 8; i++) {
      if (i != hole && i != hole + 1) {
        this.addPipe(400, i * 60 + 10);
      }
    }

    // Increment score when new row of pipes are added
    this.labelScore.text = this.score++;
  },

  hitPipe: function() {
    if (this.bird.alive == false) { return; }

    this.bird.alive = false;

    // Prevent new pipes from appearing
    game.time.events.remove(this.timer);

    // Stop pipes movement
    this.pipes.forEach(function(pipe) {
      pipe.body.velocity.x = 0;
    }, this);
  }
};


var game = new Phaser.Game(400, 490);

game.state.add('main', mainState);
game.state.start('main');
