/***************************
 * World
 ***************************/
( function( window, Phaser )
{
    function World()
    {
        this.width = Math.min( ( Math.round( window.screen.width * window.devicePixelRatio ) * 0.9 ), 1024 );
        this.height = Math.round( ( this.width / 16 ) * 9 );
        this.scaleCoef = this.width / 1024 / 2; // Retina
        this.totalScore = 0;

        this.game = new Phaser.Game( this.width, this.height, Phaser.AUTO, "" );
    }
    
    World.prototype.addState = function( name, state )
    {
        this.game.state.add( name, state );
    }
    
    World.prototype.goToLevel = function( level )
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

    window.World = new World;
} )( top, Phaser );

/***************************
 * SCORE
 ***************************/
( function( window, Phaser )
{
    function Score( game )
    {
        this.game      = game;

        this.total     = 0;
        this.x         = this.game.width - 100;
        this.y         = 10;
        this.scoreText = this.draw();
    }

    Score.prototype.draw = function()
    {
        return this.game.add.text( 
            this.x, 
            this.y, 
            this.total  + ' ', 
            { fontSize: '32px', fill: '#FFF', stroke: '#000', strokeThickness: '5' } 
        );
    }

    Score.prototype.add = function( value )
    {
        this.total += value;

        this.scoreText.text = this.total  + ' ';
    }

    Score.prototype.sustract = function( value )
    {
        this.total -= value;

        this.scoreText.text = this.total  + ' ';
    }

    window.Score = Score;
} )( top, Phaser, World );

/***************************
 * TIMER
 ***************************/
( function( window, Phaser )
{
    function Timer( game, endCallback )
    {
        this.game        = game;

        this.remaining   = 30;
        this.x           = this.game.width / 2 - 40;
        this.y           = 20;
        this.endCallback = endCallback;
        this.timerText   = this.draw();
        this.loop        = this.game.time.events.loop( 1000, this.sustract.bind( this, 1 ) );
    }

    Timer.prototype.draw = function()
    {
        return this.game.add.text( 
            this.x, 
            this.y, 
            this.remaining + ' ', 
            { fontSize: '52px', fill: '#FFF', stroke: '#000', strokeThickness: '5' } 
        );
    }

    Timer.prototype.sustract = function( time )
    {
        if( this.remaining - time < 0 )
        {
            this.endCallback();
        }
        
        this.remaining -= time;

        this.timerText.text = this.remaining + ' ';
    }

    Timer.prototype.stop = function( time )
    {
        this.game.time.events.remove( this.loop );
    }

    window.Timer = Timer;
} )( top, Phaser );
