( function( window, Phaser )
{
    function Game()
    {
        this.width = Math.min( ( Math.round( window.screen.width ) * 0.9 ), 1024 );
        this.height = Math.round( ( this.width / 16 ) * 9 );
        this.scaleCoef = this.width / 1024 / 2; // Retina
        
        this.game = new Phaser.Game( this.width, this.height, Phaser.AUTO, "" );
    }
    
    Game.prototype.addState = function( name, state )
    {
        this.game.state.add( name, state );
    }
    
    Game.prototype.goToLevel = function( level )
    {
        setTimeout( function()
        {
            this.game.state.start( level );
        }.bind( this ) );
    }
    
    window.Game = new Game;
} )( top, Phaser );