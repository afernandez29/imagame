( function( window, Phaser )
{
    "use strict";
    
    /***************************
     * GAME INSTANCE
     ***************************/
    function Game()
    {
        this.gameInstance = null;
        this.width = Math.min( ( Math.round( window.screen.width ) * 0.9 ), 1024 );
        this.height = Math.round( ( this.width / 16 ) * 9 );
        this.scaleCoef = this.width / 1024 / 2; // Retina
        
        window.addEventListener( 'load', function()
        {
            this.gameInstance = new Phaser.Game( this.width, this.height, Phaser.AUTO, "" );
            
            setTimeout( function()
            { 
                this.gameInstance.state.add( "Level3", new GameContext( this.gameInstance ) );
                this.gameInstance.state.start( "Level3" );
            }.bind( this ), 0 );
        }.bind( this ) );
    }
    
    /***************************
     * GAME CONTEXT
     ***************************/
    function GameContext( game )
    {
        this.game = game;
    }
    
    GameContext.prototype.preload = function()
    {
        this.game.load.image( "background", "/sprites/nivel3/03_fondo-01.png" );
        this.game.load.image( "road", "/sprites/nivel3/03_camino-loop.png" );
        this.game.load.image( "car", "/sprites/nivel3/car.png" );
        this.game.load.image( "obstacle", "/sprites/nivel3/obstacle.png" );
        this.game.load.image( "target", "/sprites/nivel3/target.png" );
    }

    GameContext.prototype.loadBackground = function()
    {
        // Load background
        this.backgroundTile = this.game.add.tileSprite( 0, 0, this.game.width, this.game.height, 'background' );
        this.backgroundTile.tileScale.y = 0.5;
        this.backgroundTile.tileScale.x = 0.5;

        // Load road
        this.roadTile = this.game.add.tileSprite( 
            0, 
            this.game.height - this.game.cache.getImage( 'road' ).height / 2, 
            this.game.width * 4,
            this.game.cache.getImage( 'road' ).height, 
            'road' 
        );
        this.roadTile.scale.x = 0.5;
        this.roadTile.scale.y = 0.5;
    }

    GameContext.prototype.create = function()
    {
        // Start physics
        this.game.physics.startSystem( Phaser.Physics.ARCADE );
        
        // Initialize parameters
        this.maxNumberLanes = 3;
        this.obstacleSpeed = 350;
        this.obstacleDelay = 1400;

        // Game Bar
        this.gasBar = new GasBar( this );
        
        // Score
        this.score = new Score( this );

        // Load Background
        this.loadBackground();

        // Obstacle / Target Groups
        this.obstacleGroup = this.game.add.group();
        this.targetGroup   = this.game.add.group();

        // Initialize car
        this.car = new Car( this );

        // Game Loop
        this.gameLoop = this.game.time.events.loop( this.obstacleDelay, this.gameLoop.bind( this ) );
    }
    
    GameContext.prototype.update = function()
    {
        // Background movement
        this.roadTile.x -= 4;

        // Car against obstacle
        this.game.physics.arcade.collide( this.car.carSprite, this.obstacleGroup, function()
        {
            this.stop();
        }.bind( this ) );
        
        // Car against gas
        this.game.physics.arcade.collide( this.car.carSprite, this.targetGroup, function( c, t )
        {
            t.destroy();

            this.gasBar.add( 40 );
            this.score.addScore( 20 );
        }.bind( this ) );
    }
    
    GameContext.prototype.restart = function()
    {
        this.game.state.restart( true, false );
    }
    
    GameContext.prototype.stop = function()
    {
        this.game.time.events.remove( this.gameLoop );
        this.game.time.events.remove( this.gasBar.loop );
        
        this.car.stop();
        
        this.obstacleSpeed = 0;
        this.targetSpeed = 0;
    }
    
    GameContext.prototype.gameLoop = function()
    {
        if( this.game.rnd.between( 0, 1 ) == 1 )
        {
            var obstacle = new Obstacle( this );
            this.game.add.existing( obstacle );
            this.obstacleGroup.add( obstacle );  
        }
        else
        {
            var target = new Target( this );
            this.game.add.existing( target );
            this.targetGroup.add( target );
        }
    }

    GameContext.prototype.addScore = function( score )
    {
        this.score
    }
    
    /***************************
     * OBSTACLES
     ***************************/
    function Obstacle( gameContext )
    {
        this.gameContext = gameContext;
        
        this.obstaclePositions = [];

        // Set obstacles positions
        for( var i = 0; i < this.gameContext.maxNumberLanes; i++ )
        {
            this.obstaclePositions.push( this.gameContext.game.height * ( ( i * 2 ) + 1 ) / 6 );
        }

        var position = this.gameContext.game.rnd.between( 0, this.gameContext.maxNumberLanes - 1 );   
        Phaser.Sprite.call( 
            this, 
            this.gameContext.game, 
            this.gameContext.game.width + 20,
            this.obstaclePositions[ position ],
            "obstacle" 
        );
        
        this.gameContext.physics.enable( this, Phaser.Physics.BODY );
        this.anchor.set( 0.5 );
        this.tint = 0xff0000;
    }

    Obstacle.prototype = Object.create( Phaser.Sprite.prototype );
    
    Obstacle.prototype.constructor = Obstacle;

    Obstacle.prototype.update = function()
    {
        this.body.velocity.x = -1 * this.gameContext.obstacleSpeed;
        
        if( this.x < 0 )
        {
            this.destroy();
        }
    }

    /***************************
     * TARGETS
     ***************************/
    function Target( gameContext )
    {
        this.gameContext = gameContext;
        
        this.targetPositions = [];

        // Set target positions
        for( var i = 0; i < this.gameContext.maxNumberLanes; i++ )
        {
            this.targetPositions.push( this.gameContext.game.height * ( ( i * 2 ) + 1 ) / 6 );
        }

        var position = this.gameContext.game.rnd.between( 0, this.gameContext.maxNumberLanes - 1 );
        Phaser.Sprite.call( 
            this, 
            this.gameContext.game,
            this.gameContext.game.width + 20,
            this.targetPositions[ position ],
            "target"
        );
        
        this.gameContext.game.physics.enable( this, Phaser.Physics.ARCADE );
        this.anchor.set( 0.5 );
        this.tint = 0xff0000;
    }

    Target.prototype = Object.create( Phaser.Sprite.prototype );
    
    Target.prototype.constructor = Target;

    Target.prototype.update = function()
    {
        this.body.velocity.x = -1 * this.gameContext.obstacleSpeed;
        
        if( this.x < 0 )
        {
            this.destroy();
        }
    }
    
    /***************************
     * GAS BAR 
     ***************************/
    function GasBar( gameContext )
    {
        this.gameContext   = gameContext;

        this.x             = 20;
        this.y             = 20;
        this.currentGas    = 100;
        this.color         = 0x33FF00;
        this.gasBarGraphic = this.drawGasBar();
        this.loop          = this.gameContext.game.time.events.loop( 500, this.gasLoop.bind( this ) );
    }
    
    GasBar.prototype.add = function( quantity )
    {
        if( this.currentGas + quantity > 100 )
        {
            this.currentGas = 100;
        }
        else
        {
            this.currentGas += quantity;
        }

        this.gasLoop( true );
    }
    
    GasBar.prototype.sustract = function( quantity )
    {
        this.currentGas -= quantity;

        if( this.currentGas <= 0 )
        {
            this.gameContext.stop();
        }
    }

    GasBar.prototype.drawGasBar = function()
    {
        var graphic = this.gameContext.game.add.graphics( this.x, this.y );
        graphic.lineStyle( 10, this.color );
        graphic.lineTo( this.currentGas, 0 );

        return graphic;
    }

    GasBar.prototype.gasLoop = function( force )
    {
        if( !force )
        {
            this.sustract( 5 );
        }

        this.setColor();
        this.gasBarGraphic.destroy();
        this.gasBarGraphic = this.drawGasBar();
    }

    GasBar.prototype.setColor = function()
    {
        if( this.currentGas < 31 )
        {
            this.color = 0xFF0000;   
        }
        else if( this.currentGas < 61 )
        {
            this.color = 0xF7FE2E;
        }
        else
        {
            this.color = 0x33FF00;
        }
    }
    
    /***************************
     * SCORE
     ***************************/
    function Score( gameContext )
    {
        this.gameContext = gameContext;

        this.score       = 0;
        this.x           = this.gameContext.game.width - 100;
        this.y           = 16;
        this.scoreText   = this.drawScore();
    }

    Score.prototype.drawScore = function()
    {
        return this.gameContext.game.add.text( 
            this.x, 
            this.y, 
            this.score, 
            { fontSize: '32px', fill: '#FFF' } 
        );
    }

    Score.prototype.addScore = function( value )
    {
        this.score += value;

        this.scoreText.text = this.score;

        return this.score;
    }

    /***************************
     * SCORE
     ***************************/
    function Car( gameContext )
    {
        this.gameContext = gameContext;
        
        this.carTurnSpeed = 250;
        this.currentLane = 0;
        this.carPositions = [];        
        
        // Set car positions
        for( var i = 0; i < this.gameContext.maxNumberLanes; i++ )
        {
            this.carPositions.push( this.gameContext.game.height * ( ( i * 2 ) + 1 ) / 6 );
        }

        // Car Sprite
        this.carSprite = this.gameContext.game.add.sprite( 60, this.carPositions[ 0 ], "car" );
        
        // Enable physics
        this.gameContext.game.physics.enable( this.carSprite, Phaser.Physics.ARCADE );

        this.carSprite.body.allowRotation = false;
        this.carSprite.body.moves = false;
        this.carSprite.anchor.set( 0.5 );

        // Events
        this.keyUp = this.gameContext.game.input.keyboard.addKey( Phaser.Keyboard.UP );
        this.keyDown = this.gameContext.game.input.keyboard.addKey( Phaser.Keyboard.DOWN );
        
        this.keyUp.onDown.add( this.move.bind( this, -1 ) );
        this.keyDown.onDown.add( this.move.bind( this, 1 ) );
    }

    Car.prototype.move = function( direction )
    {
        if( this.currentLane + direction < 0 || this.currentLane + direction > this.gameContext.maxNumberLanes -1 )
        {
            return;
        }
        
        this.currentLane += direction;
        
        this.steerTween = this.gameContext.game.add.tween( this.carSprite ).to( 
            {
                angle: 20 - 40 * ( direction == -1 ? 1 : 0 )
            }, 
            this.carTurnSpeed / 2, 
            Phaser.Easing.Linear.None, 
            true
        );

        this.steerTween.onComplete.add( function()
        {
            this.gameContext.game.add.tween( this.carSprite ).to(
                {
                    angle: 0
                }, 
                this.gameContext.carTurnSpeed / 2, 
                Phaser.Easing.Linear.None, 
                true 
            );

            this.steerTween = null;
        }.bind( this ) );
        
        this.movementTween = this.gameContext.game.add.tween( this.carSprite ).to(
            { 
                y: this.carPositions[ this.currentLane ],
            }, 
            this.carTurnSpeed, 
            Phaser.Easing.Linear.None, 
            true 
        );

        this.movementTween.onComplete.add( function()
        {
            this.movementTween = null;
        }.bind( this ) );
    }

    Car.prototype.stop = function()
    {
        this.keyUp.enabled = false;
        this.keyDown.enabled = false;
        
        this.steerTween.stop();
        this.movementTween.stop();
    }

    // Init
    new Game();
} )( top, Phaser );