( function( window, Phaser )
{
    function Game()
    {
        this.width = Math.min( ( Math.round( window.screen.width * window.devicePixelRatio ) * 0.9 ), 1024 );
        this.height = Math.round( ( this.width / 16 ) * 9 );
        this.scaleCoef = this.width / 1024 / 2; // Retina
        this.score = 0;       
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

            // Set game scale mode
            this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.game.scale.maxWidth = 1024 * window.devicePixelRatio;
            this.game.scale.maxHeight = 576 * window.devicePixelRatio;
            this.game.scale.forceLandscape = true;
            this.game.scale.pageAlignHorizontally = true;
            this.game.scale.pageAlignVertically = true;
        }.bind( this ) );
    }
    
    window.Game = new Game;
} )( top, Phaser );