World.addState( 'Splash2', { preload: preload, create: create } );
//World.goToLevel( 'Splash2' );

var game = World.game;

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
    game.add.text(10, 10, "Ha conseguido " + World.totalScore + " Kg de ayuda. Pasa a siguiente nivel.", { font: '16px Arial', fill: '#fff' });
    button = game.add.button( game.world.centerX - 150 , game.world.centerY, 'button', World.goToLevel.bind( this, 'Level2'), this );
}
