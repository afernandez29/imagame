var game;
var ship;
var shipPosition;
var shipPositionsX;
var barrierPositionsX;
var shotPositionsY;
var shipCanShot;
var barrierGroup;
var shotGroup;
var shipHorizontalSpeed = 400;
var shipMoveDelay = 100;
var barrierSpeed = 500;
var shotSpeed = 100;
var barrierDelay = 1000;

window.onload = function() {	
	game = new Phaser.Game(1024 , 780, Phaser.AUTO, "");
     game.state.add("PlayGame",playGame);
     game.state.start("PlayGame");
}

var playGame = function(game){};

playGame.prototype = {
	preload: function(){
          game.load.image("ship", "Barco.png");
          game.load.image("barrier", "roca.png");
          game.load.image("shot", "roca.png");
	},
  	create: function(){

          key1 = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
          key1.onDown.add(moveShipLeft);

          key2 = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
          key2.onDown.add(moveShipRight);

          key3 = game.input.keyboard.addKey(Phaser.Keyboard.ONE);
          key3.onDown.add(shot);

          shipCanShot = true;
          shipPosition = 0;
          barrierGroup = game.add.group();
          shotGroup = game.add.group();
          shipPositionsX = [40, (game.width/2) - 40, game.width - 40];
          barrierPositionsX = [40, (game.width/4) - 40, (game.width/2) - 40, (game.width*3/4) - 40, game.width - 40, 40];
          shotPositionsY = [40, (game.height/4) - 40, (game.height/2) - 40, (game.height*3/4) - 40, game.height - 40, 40];
          game.physics.startSystem(Phaser.Physics.ARCADE);
          ship = game.add.sprite(shipPositionsX[shipPosition], game.height - 150, "ship");
          ship.anchor.set(0.5);
          game.physics.enable(ship, Phaser.Physics.ARCADE);
          ship.body.allowRotation = false;
          ship.body.moves = false;
          //game.input.onDown.add(moveShip);
          game.time.events.loop(barrierDelay, function(){
               var barrier = new Barrier(game);
               game.add.existing(barrier);
               barrierGroup.add(barrier);
               console.log(barrierGroup);
          }); 

          /*game.time.events.loop(barrierDelay, function(){
               shipCanShot = true;
               barrierDelay = 0;
          });*/      
	},
     update: function(){
          game.physics.arcade.collide(ship, barrierGroup, function(){
               game.state.start("PlayGame");     
          });
     }
}

function shot(){
     if(shipCanShot){
          //shipCanShot = false;
          var shot = new Shot(game);
          game.add.existing(shot);
          shotGroup.add(shot);
          console.log(shotGroup);
          //barrierDelay = 1000;
     }
}

function moveShipRight(){
     //if(shipCanMove){
          shipPosition = shipPosition + 1;
          if(shipPosition > 2) shipPosition--;
          barrierPositionsX[5] = shipPositionsX[shipPosition];

          shipCanShot = false;
          var moveTween = game.add.tween(ship).to({ 
               x: shipPositionsX[shipPosition],
          }, shipHorizontalSpeed, Phaser.Easing.Linear.None, true);
          moveTween.onComplete.add(function(){
               game.time.events.add(shipMoveDelay, function(){
                    shipCanShot = true;
               });
          })
     //}
}

function moveShipLeft(){
     //if(shipCanMove){
          shipPosition = shipPosition - 1;
          if(shipPosition < 0) shipPosition++;
          barrierPositionsX[5] = shipPositionsX[shipPosition];

          shipCanShot = false;
          var moveTween = game.add.tween(ship).to({ 
               x: shipPositionsX[shipPosition],
          }, shipHorizontalSpeed, Phaser.Easing.Linear.None, true);
          moveTween.onComplete.add(function(){
               game.time.events.add(shipMoveDelay, function(){
                    shipCanShot = true;
               });
          })
     //}
}

Shot = function (game) {
     var position = shipPositionsX[shipPosition];

     Phaser.Sprite.call(this, game, /*game.width * position*/position-40, /*-20*/game.height-280, "shot");
     game.physics.enable(this, Phaser.Physics.ARCADE);
     //this.anchor.set(0.5);
};

Barrier = function (game) {
     var position = game.rnd.between(0, 5);

	Phaser.Sprite.call(this, game, /*game.width * position*/barrierPositionsX[position]-40, /*-20*/-20, "barrier");
	game.physics.enable(this, Phaser.Physics.ARCADE);
     //this.anchor.set(0.5);
};

Barrier.prototype = Object.create(Phaser.Sprite.prototype);
Barrier.prototype.constructor = Barrier;

Barrier.prototype.update = function() {
	this.body.velocity.y = barrierSpeed;
	if(this.y > game.height){
		this.destroy();
	}
};

Shot.prototype = Object.create(Phaser.Sprite.prototype);
Shot.prototype.constructor = Shot;

Shot.prototype.update = function() {
     this.body.velocity.y = -shotSpeed;
     if(this.y < 0) {
          this.destroy();
     }
     for (var i = 0; i < barrierGroup.length; i++) {
          var rock = barrierGroup.getAt(i);
          if(this.y < rock.y && this.x == rock.x){
               rock.destroy();
               this.destroy();
          }   
     };
};