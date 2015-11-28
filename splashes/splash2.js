var game = World.game;

function preload()
{
    game.load.image( 'button', '/sprites/shared/play_button.gif' );
    game.load.image( 'background','/sprites/level2/02_fondo-mar.png' );
}

function create()
{
	var background = game.add.tileSprite( 0, 0, game.width, game.height, 'background' );
    background.tileScale.y = 0.5;
   	background.tileScale.x = 0.5;

   	var button = game.add.button( 
    	game.world.centerX - game.cache.getImage( "button" ).width / 2, 
    	game.world.centerY - game.cache.getImage( "button" ).height / 2 + 150, 
    	'button', 
    	World.goToLevel.bind( this, 'Level2' ), 
    	this 
    );

   	var text = game.add.text( 
        0, 
        150, 
        "Has recogido " + World.totalScore + " Kg ", 
        { fontSize: '52px', fill: '#FFF', stroke: '#000', strokeThickness: '5' } 
    );
    text.x = game.world.centerX - text.width / 2;

    var text2 = game.add.text( 
        0, 
        225, 
        "Cruza el estrecho con el cargamento ", 
        { fontSize: '42px', fill: '#FFF', stroke: '#000', strokeThickness: '5' } 
    );
    text2.x = game.world.centerX - text2.width / 2;

   	var enter = game.input.keyboard.addKey( Phaser.Keyboard.ENTER );
   	enter.onDown.add( World.goToLevel.bind( this, 'Level2' ) );
}

World.addState( 'Splash2', { preload: preload, create: create } );