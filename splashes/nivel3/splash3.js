Game.addState( 'Splash3', { preload: preload, create: create } );
//Game.goToLevel( 'Splash3' );

var game = Game.game;

function preload()
{
    game.load.image('button', '/splashes/nivel3/play_buttom.gif');
    game.load.image('background','/sprites/nivel3/03_fondo-01.png');
}

var button;
var background;

function create()
{
    game.stage.backgroundColor = '#182d3b';
    background = game.add.tileSprite(0, 0, 1024, 780, 'background');
    button = game.add.button( game.world.centerX - 150 , game.world.centerY, 'button', Game.goToLevel.bind( this, 'Level3'), this );
}

