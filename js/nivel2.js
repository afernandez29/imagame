var game;
var gameIsOver = false;

var score = 0;

/*var star;
var starGroup;
var starDelay = 3000;
var starSound;*/

var ship;
var shipPosition;
var shipPositionsX;
var shipHorizontalSpeed = 400;
var shipMoveDelay = 100;
var shipHit = 0;

var barrierGroup;
var barrierPositionsX;
var barrierSpeed = 150;
var barrierDelay = 2000;
var barrierPosition = 0;


var whale;
var whaleGroup;
var whaleSpeed = 200;
var whaleDelay = 8000;
var barrierSpeeds;
var whaleFocus;

var music;
var boatSound;
var whaleSound;
var boatMoveSound;

window.onload = function() {  

     /***************************
     * GAME INSTANCE
     ***************************/
     World.addState( 'Level2', playGame );
     World.goToLevel( 'Level2' );

     game = World.game;
}

var playGame = function(game){};

playGame.prototype = {
     preload: function(){
          game.load.image("ship", "/sprites/nivel2/02_barco.png");
          game.load.image("boya", "/sprites/nivel2/02_boya.png");
          game.load.image("faro", "/sprites/nivel2/02_faro.png");
          game.load.image("tortugas", "/sprites/nivel2/02_tortugas.png");
          game.load.image("whale", "/sprites/nivel2/02_ballena.png");
          game.load.image("whale_r", "/sprites/nivel2/02_ballena_r.png");
          game.load.image('starfield', '/sprites/nivel2/02_fondo-mar.png');
          game.load.audio('music', ['/music/nivel2/level2.mp3', '/music/nivel2/level2.ogg']);
          game.load.audio('boatSound', ['/music/nivel2/boat.mp3', '/music/nivel2/boat.ogg']);
          game.load.audio('whaleSound', ['/music/nivel2/whale.mp3', '/music/nivel2/whale.ogg']);
          game.load.audio('boatMoveSound', ['/music/nivel2/boatMove.mp3', '/music/nivel2/boatMove.ogg']);
          /*game.load.audio('starSound', ['/music/nivel2/Ding.mp3', '/music/nivel2/Ding.ogg']);
          game.load.spritesheet('star', '/sprites/nivel2/01-04_estrella_bonus.png', 157, 150, 8);*/
     },
     create: function(){

          game.physics.startSystem(Phaser.Physics.ARCADE);

          initKeys();

          initBackground();

          initScore();

          initVariables();

          initShip();

          initSounds();

          this.timer = new Timer( this.game, end.bind( this ) );

          game.time.events.loop(barrierDelay, function(){
               addBarrier();
          });

          game.time.events.loop(whaleDelay, function(){
               addWhale();
          });

          /*game.time.events.loop(starDelay, function(){
               addStar();
          });*/
     },
     update: function(){

          starfield.tilePosition.y += 2;

          if(shipHit > 0){
               ship.alpha = 1 - (0.8 * (shipHit%2));
               shipHit--;
               return;
          }
          else
               ship.alpha = 1;

          if(gameIsOver){
               return;
          }

          game.physics.arcade.collide(ship, whaleGroup, function(){
               //score = 0;//parseInt(score * 0.5);
               //scoreText.text = scoreString + score;
               shipHit = 100;   
               music.stop();
               whaleSound.stop();
               game.state.start("Level2");
          });

          game.physics.arcade.collide(ship, barrierGroup, function(){
               //score = 0;//parseInt(score * 0.5);
               //scoreText.text = scoreString + score;
               shipHit = 100; 
               music.stop();
               whaleSound.stop();
               game.state.start("Level2"); 
          });

          /*starGroup.forEach(function(star){
               game.physics.arcade.collide(ship, star, function(){
                    //score += 25;
                    starSound.play();
                    //scoreText.text = scoreString + score;
                    star.destroy();    
               });
          })*/
     }
}

function moveShipRight(){
          shipPosition = shipPosition + 1;
          if(shipPosition > 2) shipPosition--;
          barrierPositionsX[5] = shipPositionsX[shipPosition];
          barrierPositionsX[6] = shipPositionsX[shipPosition];

          ship.angle += 20;

          var moveTween = game.add.tween(ship).to({ 
               x: shipPositionsX[shipPosition],
          }, shipHorizontalSpeed, Phaser.Easing.Linear.None, true);
          moveTween.onComplete.add(function(){
               game.time.events.add(shipMoveDelay, function(){
                    ship.angle -= 20;
               });
          });
          
          boatMoveSound.play();
}

function moveShipLeft(){
          shipPosition = shipPosition - 1;
          if(shipPosition < 0) shipPosition++;
          barrierPositionsX[5] = shipPositionsX[shipPosition];
          barrierPositionsX[6] = shipPositionsX[shipPosition];

          ship.angle -= 20;

          var moveTween = game.add.tween(ship).to({ 
               x: shipPositionsX[shipPosition],
          }, shipHorizontalSpeed, Phaser.Easing.Linear.None, true);
          moveTween.onComplete.add(function(){
               game.time.events.add(shipMoveDelay, function(){
                    ship.angle += 20;
               });
          });

          boatMoveSound.play();
}

Barrier = function (game) {
     var position = game.rnd.between(0, 6);

     barrierPosition = position;

     var image;

     var rand = game.rnd.between(0,2);

     if(rand == 1){
          image = "boya";
          barrierSpeeds = 1;
     }
     else if(rand == 2){
          image = "faro";
          barrierSpeeds = 1;
     }
     else{
          image = "tortugas";
          barrierSpeeds = 2;
     }

     Phaser.Sprite.call(this, game, barrierPositionsX[position]-(40 * World.scaleCoef), (-20 * World.scaleCoef), image);
     game.physics.enable(this, Phaser.Physics.ARCADE);
     this.anchor.set(0.5);
};

/*Star = function (game) {
     var position = game.rnd.between(0, 4);

     if(barrierPositionsX[position] == barrierPositionsX[barrierPosition]){
          position = (position +1) % 5;
     }

     Phaser.Sprite.call(this, game, barrierPositionsX[position]-(40 * World.scaleCoef), (-20 * World.scaleCoef), 'star');
     game.physics.enable(this, Phaser.Physics.ARCADE);

     this.anchor.set(0.5);
     
     var shine = this.animations.add('shine');
     this.animations.play('shine', 30, true);
};*/

Whale = function (game) {
     var position = 4 * game.rnd.between(0, 1);

     if (position == 0){
          var image = "whale_r";
          whaleFocus = 1;
     }
     else{
          var image = "whale";
          whaleFocus = -1;
     }

     Phaser.Sprite.call(this, game, barrierPositionsX[position]-(40 * World.scaleCoef), (-20 * World.scaleCoef), image);
     game.physics.enable(this, Phaser.Physics.ARCADE);
     this.anchor.set(0.5 * World.scaleCoef);
     whaleSound.play();
};

/*Star.prototype = Object.create(Phaser.Sprite.prototype);
Star.prototype.constructor = Star;

Star.prototype.update = function() {
     this.body.velocity.y = barrierSpeed * barrierSpeeds;
     if(this.y > game.height){
          this.destroy();
     }
};*/

Barrier.prototype = Object.create(Phaser.Sprite.prototype);
Barrier.prototype.constructor = Barrier;

Barrier.prototype.update = function() {
     this.body.velocity.y = barrierSpeed * barrierSpeeds;
     if(this.y > game.height){
          this.destroy();
          //score += 10;
          //scoreText.text = scoreString + score;
     }
};

Whale.prototype = Object.create(Phaser.Sprite.prototype);
Whale.prototype.constructor = Whale;

Whale.prototype.update = function() {
     this.body.velocity.y = whaleSpeed;
     this.body.velocity.x = whaleFocus * whaleSpeed;
     if(this.y > game.height){
          this.destroy();
          //score += 25;
          //scoreText.text = scoreString + score;
     }
};

function initKeys(){
     key1 = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
     key1.onDown.add(moveShipLeft);

     key2 = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
     key2.onDown.add(moveShipRight);

     game.input.onTap.add( function( event )
     {
       if( Math.floor( event.x / ( game.width / 2 ) ) === 0 )
       {
           moveShipLeft();
       }

       if( Math.floor( event.x / ( game.width / 2 ) ) === 1 )
       {
           moveShipRight();
       }
   });
}

function initBackground(){
     starfield = game.add.tileSprite(0, 0, game.width, game.height, 'starfield');
     starfield.tileScale.x = 0.5;
     starfield.tileScale.y = 0.5;
}

function initScore(){
     score = new Score( game );
     /*scoreString = 'Score : ';
     scoreText = game.add.text(10, 10, scoreString + World.totalScore, { font: '34px Arial', fill: '#fff' });*/
}

function initVariables(){
     shipPosition = 0;
     barrierGroup = game.add.group();
     //starGroup = game.add.group();
     whaleGroup = game.add.group();
     shipPositionsX = [100 * World.scaleCoef, (game.width/2) - (80 * World.scaleCoef), game.width - (100 * World.scaleCoef)];
     barrierPositionsX = [100 * World.scaleCoef, (game.width/4), (game.width/2), (game.width*3/4), game.width - (100 * World.scaleCoef), 100 * World.scaleCoef, 100 * World.scaleCoef];
}

function initShip(){
     ship = game.add.sprite(shipPositionsX[shipPosition], game.height - (150 * World.scaleCoef), "ship");

     ship.scale.setTo(0.5 * World.scaleCoef, 0.5 * World.scaleCoef);
     ship.anchor.set(1 * World.scaleCoef);

     game.physics.enable(ship, Phaser.Physics.ARCADE);
     ship.body.allowRotation = false;
     ship.body.moves = false;
}

function addWhale(){
     var whale = new Whale(game);
               
     whale.scale.setTo(0.6 * World.scaleCoef,0.6 * World.scaleCoef);

     game.add.existing(whale);
     whaleGroup.add(whale);
}

function addBarrier(){
     var barrier = new Barrier(game);
               
     barrier.scale.setTo(0.5 * World.scaleCoef,0.5 * World.scaleCoef);

     game.add.existing(barrier);
     barrierGroup.add(barrier);
}

/*function addStar(){
     var star = new Star(game);
               
     star.scale.setTo(0.5 * World.scaleCoef,0.5 * World.scaleCoef);

     game.add.existing(star);
     starGroup.add(star);
}*/

function initSounds(){

     boatSound = game.add.audio('boatSound');
     boatSound.play();

     music = game.add.audio('music');
     music.play();

     whaleSound = game.add.audio('whaleSound');
     //whaleSound.volume += 0.5;

     /*starSound = game.add.audio('starSound');
     starSound.volume += 0.5;*/

     boatMoveSound = game.add.audio('boatMoveSound');
     boatMoveSound.volume -= 0.9;
}

function end(){

     gameIsOver = true;

     movementTween = game.add.tween( ship ).to(
       { 
           y: -game.height * 2.5,
       }, 
       3000, 
       Phaser.Easing.Linear.None, 
       true 
     );

     movementTween.onComplete.add( function()
     {
          music.stop();
          whaleSound.stop();
          //starSound.stop();
          //game.lockRender = true;

          World.goToLevel( 'Splash3' );
     });

}