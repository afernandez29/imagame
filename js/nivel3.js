( function( window, Phaser )
{
    "use strict";
    
    /***************************
     * GAME INSTANCE
     ***************************/
    function Game()
    {
        this.gameInstance = null;
        
        window.addEventListener( 'load', function()
        {
            this.gameInstance = new Phaser.Game( 480, 240, Phaser.AUTO, "" );
            
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
        this.game.load.image( "road",     "/sprites/nivel3/road.png" );
        this.game.load.image( "car",      "/sprites/nivel3/car.png" );
        this.game.load.image( "obstacle", "/sprites/nivel3/obstacle.png" );
        this.game.load.image( "target",   "/sprites/nivel3/target.png" );
    }
    
    GameContext.prototype.create = function()
    {
        // Start physics
        this.game.physics.startSystem( Phaser.Physics.ARCADE );
        this.game.add.sprite( 0, 0, "road" );
        
        // Initialize parameters
        this.numberLanes   = 3;
        this.obstacleSpeed = 350;
        this.obstacleDelay = 1400;
        this.carTurnSpeed  = 250;
        
        this.obstacleGroup = this.game.add.group();
        this.targetGroup   = this.game.add.group();
        
        // Set game listeners
        this.gameEvents = new GameEvents( this );
        
        // Set posible entities positions
        this.entitiesPositions = [];
        for( var i = 0; i < this.numberLanes; i++ )
        {
            this.entitiesPositions.push( this.game.height * ( ( i * 2 ) + 1 ) / 6 );
        }
        
        // Initialize car
        this.car           = this.game.add.sprite( 60, this.entitiesPositions[ 0 ], "car" );
        this.game.physics.enable( this.car, Phaser.Physics.ARCADE );
        
        this.car.curLane   = 0;
        this.car.body.allowRotation = false;
        this.car.body.moves         = false;
        this.car.anchor.set( 0.5 );
        
        // Game Bar
        this.gasBar = new GasBar( this );
        
        // Game Loop
        this.currentLoop = this.game.time.events.loop( this.obstacleDelay, this.loop.bind( this ) );
    }
    
    GameContext.prototype.update = function()
    {
        this.game.physics.arcade.collide( this.car, this.obstacleGroup, function()
        {
            this.stop();
        }.bind( this ) );
        
        this.game.physics.arcade.collide( this.car, this.targetGroup, function( c, t )
        {
            t.destroy();
        }.bind( this ) );
    }
    
    GameContext.prototype.restart = function()
    {
        this.game.state.restart( true, false );
    }
    
    GameContext.prototype.stop = function()
    {
        this.game.time.events.remove( this.currentLoop );
        this.gameEvents.disableEvents();
        
        this.obstacleSpeed = 0;
        this.targetSpeed = 0;
    }
    
    GameContext.prototype.loop = function()
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
    
    /***************************
     * GAME EVENTS
     ***************************/
    function GameEvents( gameContext )
    {
        this.gameContext = gameContext;
        
        this.keyUp = this.gameContext.game.input.keyboard.addKey( Phaser.Keyboard.UP );
        this.keyDown = this.gameContext.game.input.keyboard.addKey( Phaser.Keyboard.DOWN );
        
        this.keyUp.onDown.add( this.moveCar.bind( this.gameContext, -1 ) );
        this.keyDown.onDown.add( this.moveCar.bind( this.gameContext, 1 ) );
    }
    
    GameEvents.prototype.moveCar = function( direction )
    {
        if( this.car.curLane + direction < 0 || this.car.curLane + direction > this.numberLanes -1 )
        {
            return;
        }
        
        this.car.curLane += direction;
        
        this.game.add.tween( this.car ).to( 
            {
                angle: 20 - 40 * ( direction == -1 ? 1 : 0 )
            }, 
            this.carTurnSpeed / 2, 
            Phaser.Easing.Linear.None, 
            true
        ).onComplete.add( function()
        {
            this.game.add.tween( this.car ).to(
                {
                    angle: 0
                }, 
                this.carTurnSpeed / 2, 
                Phaser.Easing.Linear.None, 
                true 
            );
        }.bind( this ) );
        
        this.game.add.tween( this.car ).to(
            { 
                y: this.entitiesPositions[ this.car.curLane ],
            }, 
            this.carTurnSpeed, 
            Phaser.Easing.Linear.None, 
            true 
        );
    }
    
    GameEvents.prototype.disableEvents = function()
    {
        this.keyUp.enabled = false;
        this.keyDown.enabled = false;
        
        for( var i = 0; i < this.gameContext.tweens._tweens.length; i++ )
        {
            this.gameContext.tweens._tweens[i].stop();
        }
    }
    
    /***************************
     * OBSTACLES
     ***************************/
    function Obstacle( gameContext )
    {
        this.gameContext = gameContext;
        
        var position = this.gameContext.game.rnd.between( 0, this.gameContext.numberLanes - 1 );   
        Phaser.Sprite.call( 
            this, 
            this.gameContext.game, 
            this.gameContext.game.width + 20,
            this.gameContext.entitiesPositions[ position ],
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
        
        var position = this.gameContext.game.rnd.between( 0, this.gameContext.numberLanes - 1 );
        Phaser.Sprite.call( 
            this, 
            this.gameContext.game,
            this.gameContext.game.width + 20,
            this.gameContext.entitiesPositions[ position ],
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
        this.gameContext = gameContext;
        
        var graphics = this.gameContext.game.add.graphics( 20, 20 );
        graphics.lineStyle( 10, 0x33FF00 );
        graphics.lineTo( 100, 0 );
    }
    
    GasBar.prototype.add = function( quantity )
    {
        
    }
    
    GasBar.prototype.sustract = function( quantity )
    {
        
    }
    
    // Init
    new Game();
} )( top, Phaser );