Game.addState( 'Splash2', { preload: preload, create: create } );
Game.goToLevel( 'Splash2' );

var game = Game.game;

function preload()
{
    game.load.image('button', '/splashes/nivel2/play_buttom.gif');
    game.load.image('background','/sprites/nivel2/02_fondo-mar.png');
}

var button;
var background;

function create()
{
    game.stage.backgroundColor = '#182d3b';
    background = game.add.tileSprite(0, 0, 1024, 780, 'background');
    button = game.add.button( game.world.centerX - 150 , game.world.centerY, 'button', Game.goToLevel.bind( this, 'Level2'), this );
}