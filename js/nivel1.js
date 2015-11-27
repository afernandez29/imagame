//Initialize Phaser, and create a sWidth px * sHeight px game
//var game = new Phaser.Game(sWidth, sHeight, Phaser.AUTO, 'gameDiv');
var game = World.game;

var score = 0;
var player;
var cursors;
var bg;
var eats;
var medicines;
var books;
var stones;
var dir;

KG = 150;

//Create our 'main' state that will contain the game
var nivel1 = {
		
		preload: function () {
			facing = 'right';

			this.game.load.spritesheet('player', 'sprites/nivel1/player.png', 354, 357);
			this.game.load.image('background', 'splashes/nivel1/background.png');
			this.game.load.image('eat', 'sprites/nivel1/comida_.png');
			this.game.load.image('medicine', 'sprites/nivel1/medicina_.png');
			this.game.load.image('book', 'sprites/nivel1/libro_.png');
			this.game.load.image('stone', 'sprites/nivel1/stone_.png');
			this.game.load.audio('collect', 'music/nivel1/collect.wav');
			this.game.load.audio('errorCollect', 'music/nivel1/game-over.wav');
			
		},

		create: function () {

			this.game.physics.startSystem(Phaser.Physics.ARCADE);

			this.game.stage.backgroundColor = '#71c5cf';
			bg = this.game.add.image(0, 0, 'background');
			bg.scale.setTo(World.scaleCoef, World.scaleCoef);

			this.game.physics.arcade.gravity.y = 250;

			player = this.game.add.sprite(32, 32, 'player');
			this.game.physics.enable(player, Phaser.Physics.ARCADE);
			player.body.collideWorldBounds = true;
			player.scale.setTo(World.scaleCoef, World.scaleCoef);
			
			player.animations.add('left', [0, 1, 2], 10, true);
			player.animations.add('turn', [3], 20, true);
			player.animations.add('right', [3, 4, 5], 10, true);
			
			// items de comida
		    eats = this.game.add.group();
		    eats.enableBody = true;
		    eats.physicsBodyType = Phaser.Physics.ARCADE;
		    eats.createMultiple(30, 'eat');
		    eats.setAll('anchor.x', 0.5);
		    eats.setAll('anchor.y', 1);
		    eats.setAll('outOfBoundsKill', true);
		    eats.setAll('checkWorldBounds', true);
		    eats.setAll('scale.x', World.scaleCoef);
		    eats.setAll('scale.y', World.scaleCoef);
		    
		    // items de medicina
		    medicines = this.game.add.group();
		    medicines.enableBody = true;
		    medicines.physicsBodyType = Phaser.Physics.ARCADE;
		    medicines.createMultiple(30, 'medicine');
		    medicines.setAll('anchor.x', 0.5);
		    medicines.setAll('anchor.y', 1);
		    medicines.setAll('outOfBoundsKill', true);
		    medicines.setAll('checkWorldBounds', true);
		    medicines.setAll('scale.x', World.scaleCoef);
		    medicines.setAll('scale.y', World.scaleCoef);
		    
		    // items de libros
		    books = this.game.add.group();
		    books.enableBody = true;
		    books.physicsBodyType = Phaser.Physics.ARCADE;
		    books.createMultiple(30, 'book');
		    books.setAll('anchor.x', 0.5);
		    books.setAll('anchor.y', 1);
		    books.setAll('outOfBoundsKill', true);
		    books.setAll('checkWorldBounds', true);
		    books.setAll('scale.x', World.scaleCoef);
		    books.setAll('scale.y', World.scaleCoef);
		    
		    // items de libros
		    stones = this.game.add.group();
		    stones.enableBody = true;
		    stones.physicsBodyType = Phaser.Physics.ARCADE;
		    stones.createMultiple(30, 'stone');
		    stones.setAll('anchor.x', 0.5);
		    stones.setAll('anchor.y', 1);
		    stones.setAll('outOfBoundsKill', true);
		    stones.setAll('checkWorldBounds', true);
		    stones.setAll('scale.x', World.scaleCoef);
		    stones.setAll('scale.y', World.scaleCoef);
		    
			this.score = new Score( this.game );

			cursors = this.game.input.keyboard.createCursorKeys();
			this.game.input.onTap.add(this.moveElement, this);
			dir = "";

			// Audio
			audioCollect = this.game.add.audio('collect');
		    audioError = this.game.add.audio('errorCollect');
			audioError.volume += 10;
			
			// lanzar items
			itemsInterval = setInterval(this.throwItems.bind(this), 1000);
			
			// Duracion de juego 30 s
			this.timer = new Timer( this.game, this.gameOver.bind(this) );

			//setTimeout(this.gameOver, 31000); 

			if (facing == 'left')
			{
				player.frame = 0;
			}else
			{
				player.frame = 5;
			}
		},

		update: function () {
			if (this.timer.remaining < 1){
                        	var tween = game.add.tween(player).to( { x: this.game.world.width * 2 }, 500, Phaser.Easing.Linear.None, true);
			}	
			
			if (cursors.left.isDown || dir == 'left')
			{
				player.body.velocity.x = -550;

					player.animations.play('left');
					facing = 'left';
				
				dir = "";
			}
			else if (cursors.right.isDown || dir == 'right')
			{
				player.body.velocity.x = 550;

					player.animations.play('right');
					facing = 'right';
				dir = "";
			}

			

			// Conseguir punto
	        this.game.physics.arcade.collide(player, eats, this.getEatPoint, null, this);
	        this.game.physics.arcade.collide(player, medicines, this.getMedicinePoint, null, this);
	        this.game.physics.arcade.collide(player, books, this.getBookPoint, null, this);
	        this.game.physics.arcade.collide(player, stones, this.getStone, null, this);
			
		},		
		
		selectItem: function (){
			var rnd = Math.round(Math.random() * 3);
			switch (rnd){
				case 0:
					nivel1.throwEat();
					break;
				case 1:
					nivel1.throwMedicine();
					break;
				case 2:
					nivel1.throwBook();
					break;
				case 3:
					nivel1.throwStone();
					break;
				}
		},
		
		throwItems: function(){
			nivel1.selectItem.call(this);
			rnd = this.game.rnd.integerInRange(0, 3);
			var rndTime = this.game.rnd.integerInRange(300, 800);
			setTimeout(this.selectItem, rndTime);
			
		},
		
		
		
		throwEat: function () {
		    //  Grab the first bullet we can from the pool
		    eat = eats.getFirstDead(false);
		   
		    if (eat)
		    {
		        var rnd = this.game.rnd.integerInRange(0, this.game.world.width - 100) + 100;
		        var vel = this.game.rnd.integerInRange(150, 400);
		        eat.reset(rnd, 0);
		        eat.body.velocity.y = vel;
		    }

		},
		
		throwMedicine: function () {
		    //  Grab the first bullet we can from the pool
		    medicine = medicines.getFirstDead(false);


		    if (medicine)
		    {
		        var rnd = this.game.rnd.integerInRange(0, this.game.world.width - 300) + 100;
		        var vel = this.game.rnd.integerInRange(150, 400);
		        medicine.reset(rnd, 0);
		        medicine.body.velocity.y = vel;
		    }

		},
		
		throwBook: function () {
		    //  Grab the first bullet we can from the pool
		    book = books.getFirstDead(false);


		    if (book)
		    {
		        var rnd = this.game.rnd.integerInRange(0, this.game.world.width - 100) + 100;
		        var vel = this.game.rnd.integerInRange(150, 400);
		        book.reset(rnd, 0);
		        book.body.velocity.y = vel;
		    }

		},
		
		throwStone: function () {
		    //  Grab the first bullet we can from the pool
		    stone = stones.getFirstDead(false);


		    if (stone)
		    {
		        var rnd = this.game.rnd.integerInRange(0, this.game.world.width - 100) + 100;
		        var vel = this.game.rnd.integerInRange(150, 400);
		        stone.reset(rnd, 0);
		        stone.body.velocity.y = vel;
		    }

		},
		
		getEatPoint: function(){
			audioCollect.play();
			var eat = eats.getFirstAlive(false);
			this.getPoint(eat, KG);
		},
		
		getMedicinePoint: function(){
			audioCollect.play();
			var medicine = medicines.getFirstAlive(false);
			this.getPoint(medicine, KG);
		},
		
		getBookPoint: function(){
			audioCollect.play();
			var book = books.getFirstAlive(false);
			this.getPoint(book, KG);
		},
		
		getPoint: function(item, point){
			this.score.add( point );
			item.destroy();
		},
		
		getStone: function(){
			var tween = game.add.tween(player).to( { y: player.body.y + 25 }, 500, Phaser.Easing.Bounce.Out, true);
			audioError.play();
			var stone = stones.getFirstAlive(false);
			this.getPoint(stone, 0);
		},
		
		moveElement: function(p){
			if (p.x <= (game.world.width / 2)) dir = "left";
			else dir = "right";
		},
				
		gameOver: function(){
		    eats.removeAll();
		    medicines.removeAll();
		    clearInterval(itemsInterval);
			World.totalScore = this.score.total;
			World.goToLevel('Splash2');
		},

		render: function () {
		}

};


var splash2 = {
		
		preload: function(){
			
		},

		create: function(){
			this.game.stage.backgroundColor = '#fabada';
			
			var t = this.game.add.text(10, 10, "Ha conseguido " + World.totalScore + " Kg de ayuda. Pasa a siguiente nivel.", { font: '16px Arial', fill: '#fff' });
			this.game.input.onTap.addOnce(this.nextGame,this);
		},
		
		nextGame: function(){
			World.goToLevel('splash2');
		}
}
//Add and start the 'main' state to start the game
World.addState('nivel1', nivel1);
//World.addState('splash2', splash2);
//World.goToLevel('nivel1');
