World.addState( 'Splash1', { preload: preload, create: create } );
World.goToLevel( 'Splash1' );

var game = World.game;

function preload()
{
    game.load.image('button', '/splashes/nivel1/play_buttom.gif');
    game.load.image('background','/sprites/nivel1/stone_.png');
}

var button;
var background;

function create()
{
    game.stage.backgroundColor = '#182d3b';
    background = game.add.tileSprite(0, 0, 1024, 780, 'background');
    button = game.add.button( game.world.centerX - 150 , game.world.centerY, 'button', World.goToLevel.bind( this, 'nivel1'), this );
}

