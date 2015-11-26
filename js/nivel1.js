//Dimensiones
var sWidth = Math.min( (Math.round(screen.width) * 0.9), 1024 );
var sHeight = Math.round( (sWidth / 16) * 9 ); 
var scaleCoef = sWidth/1024 / 2; // tamanio x2 para retina

//Initialize Phaser, and create a sWidth px * sHeight px game
var game = new Phaser.Game(sWidth, sHeight, Phaser.AUTO, 'gameDiv');

var score = 0;
var player;
var cursors;
var bg;
var eats;
var medicines;
var books;
var stones;
var scoreText;
var scoreString;
var timeScore = 30;
var timeScoreText;
KG = 150;

//Create our 'main' state that will contain the game
var nivel1 = {
		
		preload: function () {
			facing = 'left';

			game.load.spritesheet('player', 'sprites/nivel1/player.png', 354, 357);
			game.load.image('background', 'splashes/nivel1/background.png');
			game.load.image('eat', 'sprites/nivel1/comida_.png');
			game.load.image('medicine', 'sprites/nivel1/medicina_.png');
			game.load.image('book', 'sprites/nivel1/libro_.png');
			game.load.image('stone', 'sprites/nivel1/stone_.png');
			
		},

		create: function () {

			game.physics.startSystem(Phaser.Physics.ARCADE);

			game.stage.backgroundColor = '#71c5cf';

			bg = game.add.image(0, 0, 'background');
			bg.scale.setTo(scaleCoef, scaleCoef);

			game.physics.arcade.gravity.y = 250;

			player = game.add.sprite(32, 32, 'player');
//			player.scale.setTo(scaleCoef, scaleCoef);
			game.physics.enable(player, Phaser.Physics.ARCADE);
//			player.hitArea= new Phaser.Rectangle(0, 40, 64, 56);
			player.body.collideWorldBounds = true;
			player.scale.setTo(scaleCoef, scaleCoef);
			
			player.animations.add('left', [0, 1, 2], 10, true);
			player.animations.add('turn', [3], 20, true);
			player.animations.add('right', [3, 4, 5], 10, true);
			
			// items de comida
		    eats = game.add.group();
		    eats.enableBody = true;
		    eats.physicsBodyType = Phaser.Physics.ARCADE;
		    eats.createMultiple(30, 'eat');
		    eats.setAll('anchor.x', 0.5);
		    eats.setAll('anchor.y', 1);
		    eats.setAll('outOfBoundsKill', true);
		    eats.setAll('checkWorldBounds', true);
		    eats.setAll('scale.x', scaleCoef);
		    eats.setAll('scale.y', scaleCoef);
		    
		    // items de medicina
		    medicines = game.add.group();
		    medicines.enableBody = true;
		    medicines.physicsBodyType = Phaser.Physics.ARCADE;
		    medicines.createMultiple(30, 'medicine');
		    medicines.setAll('anchor.x', 0.5);
		    medicines.setAll('anchor.y', 1);
		    medicines.setAll('outOfBoundsKill', true);
		    medicines.setAll('checkWorldBounds', true);
		    medicines.setAll('scale.x', scaleCoef);
		    medicines.setAll('scale.y', scaleCoef);
		    
		    // items de libros
		    books = game.add.group();
		    books.enableBody = true;
		    books.physicsBodyType = Phaser.Physics.ARCADE;
		    books.createMultiple(30, 'book');
		    books.setAll('anchor.x', 0.5);
		    books.setAll('anchor.y', 1);
		    books.setAll('outOfBoundsKill', true);
		    books.setAll('checkWorldBounds', true);
		    books.setAll('scale.x', scaleCoef);
		    books.setAll('scale.y', scaleCoef);
		    
		    // items de libros
		    stones = game.add.group();
		    stones.enableBody = true;
		    stones.physicsBodyType = Phaser.Physics.ARCADE;
		    stones.createMultiple(30, 'stone');
		    stones.setAll('anchor.x', 0.5);
		    stones.setAll('anchor.y', 1);
		    stones.setAll('outOfBoundsKill', true);
		    stones.setAll('checkWorldBounds', true);
		    stones.setAll('scale.x', scaleCoef);
		    stones.setAll('scale.y', scaleCoef);
		    
		    scoreString = 'Score: ';
		    scoreText = game.add.text(10, 10, scoreString + score, { font: '16px Arial', fill: '#fff' });

		    timeScore = 30;
		    timeScoreText = game.add.text(game.world.width - 20, 10, timeScore, { font: '16px Arial', fill: '#fff' });
		    timeInterval = setInterval(this.updateTime, 1000);
		    
			cursors = game.input.keyboard.createCursorKeys();
			game.input.mouse.capture = true;
			
			// lanzar items
			itemsInterval = setInterval(this.throwItems, 750);
			
			// Duracion de juego 30 s
			setTimeout(this.gameOver, 31000); 

		},

		update: function () {
			
			player.body.velocity.x = 0;
			
			if (cursors.left.isDown)
			{
				player.body.velocity.x = -550;

				if (facing != 'left')
				{
					player.animations.play('left');
					facing = 'left';
				}
			}
			else if (cursors.right.isDown)
			{
				player.body.velocity.x = 550;

				if (facing != 'right')
				{
					player.animations.play('right');
					facing = 'right';
				}
			}
			else
			{
				if (facing != 'idle')
				{
					player.animations.stop();

					if (facing == 'left')
					{
						player.frame = 0;
					}
					else
					{
						player.frame = 5;
					}

					facing = 'idle';
				}
			}

			// Conseguir punto
	        game.physics.arcade.collide(player, eats, this.getEatPoint, null, this);
	        game.physics.arcade.collide(player, medicines, this.getMedicinePoint, null, this);
	        game.physics.arcade.collide(player, books, this.getBookPoint, null, this);
	        game.physics.arcade.collide(player, stones, this.getStone, null, this);
			
		},
		
		selectItem: function (){
			var rnd = game.rnd.integerInRange(0, 3);
			console.log(rnd);
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
			nivel1.selectItem();
			rnd = game.rnd.integerInRange(0, 3);
			var rndTime = game.rnd.integerInRange(300, 800);
			setTimeout(this.selectItem, rndTime);
			
		},
		
		
		
		throwEat: function () {
		    //  Grab the first bullet we can from the pool
		    eat = eats.getFirstDead(false);
		   
		    if (eat)
		    {
		        var rnd = game.rnd.integerInRange(0, game.world.width - 100) + 100;
		        var vel = game.rnd.integerInRange(150, 400);
		        eat.reset(rnd, 0);
		        eat.body.velocity.y = vel;
		    }

		},
		
		throwMedicine: function () {
		    //  Grab the first bullet we can from the pool
		    medicine = medicines.getFirstDead(false);


		    if (medicine)
		    {
		        var rnd = game.rnd.integerInRange(0, game.world.width - 100) + 100;
		        var vel = game.rnd.integerInRange(150, 400);
		        medicine.reset(rnd, 0);
		        medicine.body.velocity.y = vel;
		    }

		},
		
		throwBook: function () {
		    //  Grab the first bullet we can from the pool
		    book = books.getFirstDead(false);


		    if (book)
		    {
		        var rnd = game.rnd.integerInRange(0, game.world.width - 100) + 100;
		        var vel = game.rnd.integerInRange(150, 400);
		        book.reset(rnd, 0);
		        book.body.velocity.y = vel;
		    }

		},
		
		throwStone: function () {
		    //  Grab the first bullet we can from the pool
		    stone = stones.getFirstDead(false);


		    if (stone)
		    {
		        var rnd = game.rnd.integerInRange(0, game.world.width - 100) + 100;
		        var vel = game.rnd.integerInRange(150, 400);
		        stone.reset(rnd, 0);
		        stone.body.velocity.y = vel;
		    }

		},
		
		getEatPoint: function(){
			var eat = eats.getFirstAlive(false);
			this.getPoint(eat, KG);
		},
		
		getMedicinePoint: function(){
			var medicine = medicines.getFirstAlive(false);
			this.getPoint(medicine, KG);
		},
		
		getBookPoint: function(){
			var book = books.getFirstAlive(false);
			this.getPoint(book, KG);
		},
		
		getPoint: function(item, point){
			score += point;
			scoreText.text = scoreString + score;

			item.destroy();
		},
		
		getStone: function(){
			var stone = stones.getFirstAlive(false);
			this.getPoint(stone, 0);
		},
		
		updateTime: function(){
			 timeScore --;
			 timeScoreText.text = timeScore;
		},
		
		gameOver: function(){
		    eats.removeAll();
		    medicines.removeAll();
		    clearInterval(itemsInterval);
		    clearInterval(timeInterval);
			game.state.start('splash1');
		},

		render: function () {
		}

};


var splash1 = {
		
		preload: function(){
			
		},

		create: function(){
			game.stage.backgroundColor = '#fabada';
			
			var t = game.add.text(10, 10, "Ha conseguido " + score + " Kg de ayuda. Pasa a siguiente nivel.", { font: '16px Arial', fill: '#fff' });
			game.input.onTap.addOnce(this.nextGame,this);
		},
		
		nextGame: function(){
			game.state.start('nivel1', true, false);
		}
}
//Add and start the 'main' state to start the game
game.state.add('nivel1', nivel1);
game.state.add('splash1', splash1);
game.state.start('nivel1');
