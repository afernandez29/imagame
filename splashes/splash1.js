var game = World.game;

function preload()
{
    game.load.image( 'button', '/sprites/shared/play_button.gif' );
    game.load.image( 'background','/sprites/level1/background.png' );
}

function create()
{
	var background = game.add.tileSprite( 0, 0, game.width, game.height, 'background' );
    background.tileScale.y = 0.5;
   	background.tileScale.x = 0.5;

   	var button = game.add.button( 
    	game.world.centerX - game.cache.getImage( "button" ).width / 2, 
    	game.world.centerY - game.cache.getImage( "button" ).height / 2, 
    	'button', 
    	World.goToLevel.bind( this, 'Level1' ), 
    	this 
    );

   	var enter = game.input.keyboard.addKey( Phaser.Keyboard.ENTER );
   	enter.onDown.add( World.goToLevel.bind( this, 'Level1' ) );
}

World.addState( 'Splash1', { preload: preload, create: create } );
World.goToLevel( 'Splash1' );