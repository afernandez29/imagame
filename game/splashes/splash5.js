var game = World.game;

function preload()
{
    game.load.image( 'background','/sprites/Final/final.jpg' );
}

function create()
{
	var background = game.add.tileSprite( 0, 0, game.width, game.height, 'background' );
    background.tileScale.y = 0.5;
   	background.tileScale.x = 0.5;

   	var text = game.add.text( 
        0, 
        150, 
        "Enhorabuena! ", 
        { fontSize: '52px', fill: '#FFF', stroke: '#000', strokeThickness: '5' } 
    );
    text.x = game.world.centerX - text.width / 2;

    var text2 = game.add.text( 
        0, 
        225, 
        "Has repartido " + World.totalScore + " Kg de ayuda ", 
        { fontSize: '42px', fill: '#FFF', stroke: '#000', strokeThickness: '5' } 
    );
    text2.x = game.world.centerX - text2.width / 2;
}

World.addState( 'Splash5', { preload: preload, create: create } );
