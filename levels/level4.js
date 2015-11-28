var DEBUG = false;
var SPEED = 690;
var GRAVITY = 600;
var FLAP = 300;
var SPAWN_RATE = 1 / 1.2;
var OPENING = 134;
var CREDITS = 0;
var CREDITS_DEFAULT = 3;

var game,
	gameIsOver = false,
	gameStarted,
    gameOver,
    score,
    bg,
    aldeas,
    fingers,
    aldeasTimer,
    invs,
    gameFinish,
    helicopter,
    fence,
    scoreText,
    instText,
    gameOverText,
    flapSnd,
    scoreSnd,
    hurtSnd,
    basesound,
    jugador,
	municion,
	timeAldea,
	timeFinger,
	tiempoDisparo=0,
	teclas,
	teclaDisparo,
	empieza=false,
    packageIcon,
    packageText,
    scoreCredit,
	contador;
var score = 0;

window.onload = function() {  

     /***************************
     * GAME INSTANCE
     ***************************/
    World.addState( 'Level4', heliGame );

    game = World.game;
}

var heliGame = function(game){};

heliGame.prototype = {
     preload: function(){
          var assets = {
        image: {
        	background: ["/sprites/level4/04_fondo.png"],
            municion: ['/sprites/level4/04_paq_ayuda.png'],
            fence: ['/sprites/level4/fence.png'],
            finger: ['/sprites/level4/Arbol.png']
        },
        audio: {
            //flap: ['/music/level4/flap.wav'],
            scoresound: ['/music/level4/collect.mp3']
            //hurt: ['/music/level4/hurt.wav']
        }
    };
    Object.keys(assets).forEach(function(type) {
        Object.keys(assets[type]).forEach(function(id) {
            game.load[type].apply(game.load, [id].concat(assets[type][id]));
        });
    });
    helicopter = game.load.image("helicopter" , "/sprites/level4/04_helicoptero.png");
    aldea = game.load.image("aldea" , "/sprites/level4/04_aldea.png");
    package = game.load.image("package" , "/sprites/level4/municion.gif");
    game.load.audio('base', ['/music/level4/jungle_loop.mp3','/music/level4/jungle_loop.ogg']);
    game.load.audio('gameoversound', ['/music/level4/game-over.mp3']);
    game.load.audio('helicoptersound', ['/music/level4/helicopter.mp3']);
     },
     create: function(){

    basesound = game.add.audio('base');
    scoresound = game.add.audio('scoresound');
    gameoversound = game.add.audio('gameoversound');
    helicoptersound = game.add.audio('helicoptersound');
    municion = game.add.group();
    municion.enableBody = true;
    initBackground();
    scoreCredit = new Score( this.game );
	helicopter = this.game.add.sprite(0.5, 0.5, 'helicopter');
    this.game.physics.enable(helicopter, Phaser.Physics.ARCADE);
    this.game.physics.enable(municion, Phaser.Physics.ARCADE);
    helicopter.scale.setTo(0.2,0.2);
    helicopter.anchor.setTo(0.5,0.5);
    helicopter.body.gravity.y = GRAVITY;
    municion.setAll('anchor.x', 0.5);
    municion.setAll('anchor.y', 1);
    municion.setAll('checkWorldBounds', true);
    municion.setAll('outOfBoundsKill', true);
    aldeas = game.add.group();
    fingers = game.add.group();
    // Add invisible thingies
    invs = game.add.group();
    fence = game.add.tileSprite(0, this.game.height - 32, this.game.width, 32, 'fence');
    fence.tileScale.setTo(2, 2);
    this.game.physics.enable(fence, Phaser.Physics.ARCADE);

    // Add score text
    scoreText = game.add.text(
        this.game.width / 2,
        this.game.height / 4,
        ""
    );
    scoreText.anchor.setTo(0.5, 0.5);
    // Add instructions text
    instText = game.add.text(
        this.game.width / 2,
        this.game.height - this.game.height / 4,
        ""
    );
    instText.anchor.setTo(0.5, 0.5);
    //Add game over text
    gameOverText = this.game.add.text(
        this.game.width / 2,
        this.game.height / 2,
        ""
    );
    gameOverText.anchor.setTo(0.5, 0.5);
    gameOverText.scale.setTo(2, 2);

          game.physics.startSystem(Phaser.Physics.ARCADE);

          initKeys();

		reset();

     },
     update: function(){
		 if (gameStarted) {
  
        var dvy = FLAP + helicopter.body.velocity.y;
      
        if (
            gameOver ||
            helicopter.angle > 90 ||
            helicopter.angle < -90
        ) {
            helicopter.angle = 90;
            helicopter.animations.stop();
            helicopter.frame = 3;
        } else {
            helicopter.animations.play('fly');
        }
        if (gameOver) {
            if (helicopter.scale.x < 4) {
                helicopter.scale.setTo(
                    helicopter.scale.x * 1.2,
                    helicopter.scale.y * 1.2
                );
            }
            gameOverText.angle = Math.random() * 5 * Math.cos(game.time.now / 100);
        } else {
            
            if(game.physics.arcade.overlap(municion, aldeas)){
				municion.kill();
            	addScore();
            	if(gameFinish){
					finish();
				}
            }
            if(game.physics.arcade.overlap(helicopter, fingers)){
				if(!gameFinish)
					setGameOver();
            }
            if(game.physics.arcade.overlap(municion, fence)){
            	municion.kill();
            	gameoversound.play();
            	if(gameFinish){
					finish();
				}
            }
            if(game.physics.arcade.overlap(municion, fingers)){
            	municion.kill();
            	gameoversound.play();
            	if(gameFinish){
					finish();
				}
            }
            if (!gameOver && !gameFinish && helicopter.body.bottom >= this.game.world.bounds.bottom) {
                setGameOver();
            }
        }

    } else {
        helicopter.y = (this.game.world.height / 2) + 8 * Math.cos(this.game.time.now / 200);
    }
    if (!gameStarted || gameOver) {
        instText.scale.setTo(
            2 + 0.1 * Math.sin(game.time.now / 100),
            2 + 0.1 * Math.cos(game.time.now / 100)
        );
    }
    scoreText.scale.setTo(
        2 + 0.1 * Math.cos(game.time.now / 100),
        2 + 0.1 * Math.sin(game.time.now / 100)
    );
    if (!gameOver) {
        fence.tilePosition.x -= game.time.physicsElapsed * SPEED;
        background.tilePosition.x -= game.time.physicsElapsed * SPEED;
    }
          
     }
}
function finish(){
		helicopter.body.allowGravity = false;
		helicopter.body.angle = 90;
		helicopter.body.velocity.x+=300;
		helicopter.body.allowGravity = false;
		World.goToLevel( 'Splash5' );
}
function setGameOver() {
	reset();
}

function flap() {
    if (!gameStarted) {
        start();
    }
    if (!gameOver) {
        helicopter.body.velocity.y = -FLAP;
    }
}
function tirar () {
	if(!gameStarted || gameFinish)return;
	contador++;
    packageText.text = ( ( World.totalScore / 10 ) - contador ) + ' ';
    if(contador==CREDITS){
    	gameFinish=true;
    	//reset();
    }
    if(contador<=CREDITS){
		municion = this.game.add.sprite(helicopter.x, helicopter.y, 'municion');
		this.game.physics.enable(municion, Phaser.Physics.ARCADE);
		municion.body.velocity.setTo(20, 200);
		municion.body.bounce.set(0.1);
		municion.body.gravity.set(0, 100); 
	}  
};
function start() {
    helicopter.body.allowGravity = true;
    //scoreCredit.total = World.totalScore;
    //scoreText.setText(score);
    instText.renderable = false;
    scoreText.renderable = false;
    gameStarted = true;
    if(!timeAldea)
    timeAldea = this.game.time.events.loop(game.rnd.integerInRange(500, 3000), spawnaldea,this);
    if(!timeFinger)
    timeFinger = this.game.time.events.loop(game.rnd.integerInRange(500, 3000), spawnfinger,this);
}

function drawPackages()
{
    if( packageIcon )
    {
        packageIcon.destroy();
    }

    packageIcon = this.game.add.sprite( 40, 15, "package" );
    packageIcon.scale.x = 0.6;
    packageIcon.scale.y = 0.6;

    if( packageText )
    {
        packageText.destroy();
    }

    packageText = this.game.add.text( 
        80, 
        12, 
        World.totalScore / 10 + " ", 
        { fontSize: '28px', fill: '#FFF', stroke: '#000', strokeThickness: '5' } 
    );
}

function addScore() {
    score += 1;
    scoresound.play();
    scoreCredit.add( 10 );
    //scoreText.setText(score);
}
function spawnfinger() {
	
    finger = fingers.create(
        this.game.width,
        this.game.height -100,
        'finger'
    );
    this.game.physics.enable(finger, Phaser.Physics.ARCADE);
    finger.body.allowGravity = false;
    fingerYrandom =  game.rnd.integerInRange(0,1);
	finger.scale.setTo(2,2);
	//fingerY += (fingerYrandom ? -o() + game.rnd.integerInRange(0,100) : (o()) /4) + game.rnd.integerInRange(0,100) ;
	finger.reset(this.game.width, (this.game.height - game.rnd.integerInRange(finger.body.height*2,finger.body.height -32)) );
	
    //aldea.body.offset.y = flipped ? -aldea.body.height * 0 : 0;
	
    // Move to the left
    finger.body.velocity.x -=  (game.time.physicsElapsed*50) * SPEED;
	this.game.time.events.remove(timeFinger);
	timeFinger = this.game.time.events.loop(game.rnd.integerInRange(500, 3000), spawnfinger,this);

    return finger;
}
function o() {
    return OPENING + 60 * ((score > 50 ? 50 : 50 - score) / 50);
}
function spawnaldea() {

    aldea = aldeas.create(
        this.game.width,
        this.game.height -100,
        'aldea'
    );
    this.game.physics.enable(aldea, Phaser.Physics.ARCADE);
    aldea.body.allowGravity = false;
	aldea.reset(this.game.width, this.game.height - aldea.body.height/2 - fence.body.height);
    aldea.scale.setTo(0.5,0.5);
    //aldea.body.offset.y = flipped ? -aldea.body.height * 0 : 0;
	
    // Move to the left
    aldea.body.velocity.x -=  (game.time.physicsElapsed*50) * SPEED;
	this.game.time.events.remove(timeAldea);
	timeAldea = this.game.time.events.loop(game.rnd.integerInRange(500, 3000), spawnaldea,this);

    return aldea;
}
function initKeys(){
     key1 = game.input.keyboard.addKey(Phaser.Keyboard.UP);
     key1.onDown.add(flap);

     key2 = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
     key2.onDown.add(tirar);
}


function initBackground(){
	//helicopter = game.add.sprite(0.5, 0.5, 200,200,'helicopter');
    background = game.add.tileSprite(0, 0, this.game.width, this.game.height, 'background');
    background.tileScale.x = 0.5;
    background.tileScale.y = 0.5;
}

function render() {
    if (DEBUG) {
        game.debug.renderSpriteBody(helicopter);
        aldeas.forEachAlive(function(aldea) {
            this.game.debug.renderSpriteBody(aldea);
        });
         fingers.forEachAlive(function(finger) {
            this.game.debug.renderSpriteBody(finger);
        });
        invs.forEach(function(inv) {
            this.game.debug.renderSpriteBody(inv);
        });
    }
}
function reset() {
    gameStarted = false;
    gameOver = false;
    score = 0;
    scoreCredit.reset();
    CREDITS = World.totalScore / 10;
    if( CREDITS <= 0 ){
        CREDITS = CREDITS_DEFAULT;
        World.totalScore = CREDITS_DEFAULT * 10;
    }
    contador = 0;
    gameFinish = false;
    scoreText.setText("COMENZAR");
    instText.setText("PULSAR ARRIBA\nPARA COMENZAR");
    instText.renderable=true;
    helicopter.body.angle.y = 500;
    helicopter.reset((this.game.width * World.scaleCoef)/2, this.game.height * World.scaleCoef);
    helicopter.scale.setTo(0.5, 0.5);
    helicopter.animations.play('fly',4,true);
    fingers.removeAll();
    aldeas.removeAll();
    invs.removeAll();
    basesound.loopFull(1);
    helicoptersound.loopFull(1);
    helicoptersound.volume = 0.2;
    //basesound.onLoop.add(hasLooped, this);
    //
    drawPackages();
}




