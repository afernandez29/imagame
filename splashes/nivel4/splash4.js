World.addState( 'Splash4', { preload: preload, create: create } );
//World.goToLevel( 'Splash3' );

var game = World.game;

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
    game.add.text(10, 10, "Ha conseguido " + World.totalScore + " Kg de ayuda. Pasa a siguiente nivel.", { font: '16px Arial', fill: '#fff' });
    button = game.add.button( game.world.centerX - 150 , game.world.centerY, 'button', World.goToLevel.bind( this, 'Level4'), this );
}

