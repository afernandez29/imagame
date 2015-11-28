( function( window, World )
{
    "use strict";
    
    /***************************
     * GAME INSTANCE
     ***************************/
    World.addState( 'Level3', new GameContext() );
    
    /***************************
     * GAME CONTEXT
     ***************************/
    function GameContext( game )
    {
        this.game = World.game;
    }
    
    GameContext.prototype.preload = function()
    {
        this.game.load.image( "background", "/sprites/level3/03_fondo-01.png" );
        this.game.load.image( "road", "/sprites/level3/03_camino-loop.png" );
        this.game.load.image( "car", "/sprites/level3/03_coche.png" );
        this.game.load.image( "camels", "/sprites/level3/03_camellos.png" );
        this.game.load.image( "rocks", "/sprites/level3/03_rocas.png" );
        this.game.load.image( "palm", "/sprites/level3/03_palmera.png" );
        this.game.load.image( "gas", "/sprites/level3/03_gasolina.png" );
        this.game.load.image( "cloud", "/sprites/level3/03_nube.png" );

        this.game.load.audio( 'themeSong', 
            [ '/music/level3/Level3_Song.mp3', '/music/level3/Level3_Song.ogg' ] 
        );
    }

    GameContext.prototype.create = function()
    {
        // Start physics
        this.game.physics.startSystem( Phaser.Physics.ARCADE );
        
        // Initialize parameters
        this.maxNumberLanes = 3;
        this.roadSpeed = 11.6;
        this.entitiesDelay = 1400;
        this.gameIsOver = false;
        
        // Init music
        this.themeSong = this.game.add.audio( 'themeSong' );
        this.themeSong.play();

        // Load Background
        this.loadBackground();
        
        // Car / Obstacle / Target Groups
        this.entitiesGroup = this.game.add.group();

        // Clouds group
        this.cloudsGroup = this.game.add.group();
        
        // Game Bar
        this.gasBar = new GasBar( this );
        
        // Score
        this.score = new Score( this.game );
        
        // Timer
        this.timer = new Timer( this.game, this.end.bind( this ), 15 );

        // Initialize car
        this.car = new Car( this );
        this.entitiesGroup.add( this.car.carSprite );
        
        // Game Loop
        this.loop = this.game.time.events.loop( this.entitiesDelay, this.gameLoop.bind( this ) );
        this.loopIterations = 0;
    }
    
    GameContext.prototype.update = function()
    {
        // Background movement
        this.roadTile.tilePosition.x -= this.roadSpeed;

        if( !this.gameIsOver )
        {
            // Car against obstacle
            this.entitiesGroup.forEach( function( entity )
            {
                // OBSTACLE
                if( entity.obstacleSpeed )
                {
                    if( this.car.currentLane == entity.currentLane )
                    {
                        this.game.physics.arcade.overlap( this.car.carSprite, entity, function()
                        {
                            this.themeSong.stop();
                            this.game.state.start( 'Level3', true, false );

                            /*if( this.car.damage == 0 )
                            {
                                this.car.damage = 100;
                                this.gasBar.sustract( 30 );
                            }*/
                        }.bind( this ) );   
                    }
                }
                // TARGET
                else if( entity.targetSpeed )
                {
                    if( this.car.currentLane == entity.currentLane )
                    {
                        this.game.physics.arcade.collide( this.car.carSprite, entity, function( c, t )
                        {
                            t.destroy();

                            this.gasBar.add( 120 );
                        }.bind( this ) );
                    }
                }
            }, this );

            // Add Clouds
            if( this.game.rnd.between( 0, 300 ) > 298 )
            {
                this.cloudsGroup.add( new Cloud( this ) );
            }
        }
        
        // Car blink
        if( this.car.damage > 0 )
        {
           this.car.carSprite.alpha = 1 - ( 0.8 * ( this.car.damage % 2 ) );
           this.car.damage--;
           return;
        }
        else
        {
            this.car.carSprite.alpha = 1;
        }
    }
    
    GameContext.prototype.restart = function()
    {
        this.game.state.restart( true, false );
    }
    
    GameContext.prototype.end = function()
    {
        this.gameIsOver = true;
        
        this.movementTween = this.game.add.tween( this.car.carSprite ).to(
            { 
                x: this.game.width * 2.5,
            }, 
            this.car.carOutOfScreen, 
            Phaser.Easing.Linear.None, 
            true 
        );

        this.movementTween.onComplete.add( function()
        {
            this.themeSong.stop();
            World.goToLevel( 'Splash4' );
        }.bind( this ) );
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
        this.roadTile.tilePosition.y -= 1;
    }
    
    GameContext.prototype.gameLoop = function()
    {
        if( this.loopIterations % 3 != 0 )
        {
            var obstacle = new Obstacle( this );
            this.game.add.existing( obstacle );
            this.entitiesGroup.add( obstacle );
        }
        else
        {
            var target = new Target( this );
            this.game.add.existing( target );
            this.entitiesGroup.add( target );
        }

        this.loopIterations++;
    }
    
    /***************************
     * CAR
     ***************************/
    function Car( gameContext )
    {
        this.gameContext = gameContext;
        
        this.damage = 0;
        this.carTurnSpeed = 250;
        this.carOutOfScreen = 2500;
        this.currentLane = 0;
        this.carPositions = [];        
        
        var roadHeight = this.gameContext.game.cache.getImage( 'road' ).height / 2;
        var yBeginRoad = this.gameContext.game.height - roadHeight;
        
        // Set car positions
        for( var i = 0; i < this.gameContext.maxNumberLanes; i++ )
        {
            this.carPositions.push( yBeginRoad + ( roadHeight * ( ( i * 2 ) + 1 ) / 6 ) );
        }

        // Car Sprite
        this.carSprite = this.gameContext.game.add.sprite( 90, this.carPositions[ 0 ], "car" );
        this.carSprite.animations.add( 'walk' );
        this.carSprite.animations.play( 'walk', 10, true );

        // Enable physics
        this.gameContext.game.physics.enable( this.carSprite, Phaser.Physics.BODY );

        this.carSprite.body.allowRotation = false;
        this.carSprite.body.moves = false;
        this.carSprite.anchor.set( 0.5 );
        this.carSprite.scale.x = 0.40;
        this.carSprite.scale.y = 0.40;

        // Events
        this.keyUp = this.gameContext.game.input.keyboard.addKey( Phaser.Keyboard.UP );
        this.keyDown = this.gameContext.game.input.keyboard.addKey( Phaser.Keyboard.DOWN );
        
        this.keyUp.onDown.add( this.move.bind( this, -1 ) );
        this.keyDown.onDown.add( this.move.bind( this, 1 ) );
        
        // Tap Event
        this.gameContext.game.input.onTap.add( function( event )
        {
            // RIGHT ( DOWN )
            if( Math.floor( event.x / ( this.gameContext.game.width / 2 ) ) === 0 )
            {
                this.move( -1 );
            }

            // LEFT ( UP )
            if( Math.floor( event.x / ( this.gameContext.game.width / 2 ) ) === 1 )
            {
                this.move( 1 );
            }
        }.bind( this ) );
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
        
        this.gameContext.entitiesGroup.sort( 'currentLane', Phaser.Group.SORT_ASCENDING );
    }

    Car.prototype.stop = function()
    {
        this.keyUp.enabled = false;
        this.keyDown.enabled = false;
        
        if( this.steerTween )
        {
            this.steerTween.stop();
        }
        
        if( this.movementTween )
        {
            this.movementTween.stop();
        }
    }
    
    /***************************
     * OBSTACLES
     ***************************/
    function Obstacle( gameContext )
    {
        this.gameContext = gameContext;
        
        this.obstaclesList = [ 
            { key: 'camels', scale: 0.5 },
            { key: 'rocks', scale: 0.5 },
            { key: 'palm', scale: 0.5 } 
        ]; 
        this.obstacleSpeed = 350;
        this.obstaclePositions = [];
        this.currentLane = this.gameContext.game.rnd.between( 0, this.gameContext.maxNumberLanes - 1 );

        // Set obstacles positions
        var roadHeight = this.gameContext.game.cache.getImage( 'road' ).height / 2;
        var yBeginRoad = this.gameContext.game.height - roadHeight - 25;
        
        for( var i = 0; i < this.gameContext.maxNumberLanes; i++ )
        {
            this.obstaclePositions.push( yBeginRoad + ( roadHeight * ( ( i * 2 ) + 1 ) / 6 ) );
        }

        var rnd = this.gameContext.game.rnd.between( 0, this.obstaclesList.length - 1 );
        
        Phaser.Sprite.call( 
            this, 
            this.gameContext.game, 
            this.gameContext.game.width + 20,
            this.obstaclePositions[ this.currentLane ],
            this.obstaclesList[ rnd ].key
        );
        
        this.gameContext.physics.enable( this, Phaser.Physics.BODY );
        this.anchor.set( 0.5 );
        this.scale.x = this.obstaclesList[ rnd ].scale;
        this.scale.y = this.obstaclesList[ rnd ].scale;
    }

    Obstacle.prototype = Object.create( Phaser.Sprite.prototype );
    
    Obstacle.prototype.constructor = Obstacle;

    Obstacle.prototype.update = function()
    {
        this.body.velocity.x = -1 * this.obstacleSpeed;
        
        if( this.x < -100 )
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
        
        this.targetSpeed = 350;
        this.targetPositions = [];
        this.currentLane = this.gameContext.game.rnd.between( 0, this.gameContext.maxNumberLanes - 1 );

        var roadHeight = this.gameContext.game.cache.getImage( 'road' ).height / 2;
        var yBeginRoad = this.gameContext.game.height - roadHeight;
        
        // Set target positions
        for( var i = 0; i < this.gameContext.maxNumberLanes; i++ )
        {
            this.targetPositions.push( yBeginRoad + ( roadHeight * ( ( i * 2 ) + 1 ) / 6 ) );
        }
        
        Phaser.Sprite.call( 
            this, 
            this.gameContext.game,
            this.gameContext.game.width + 20,
            this.targetPositions[ this.currentLane ],
            "gas"
        );
        
        this.gameContext.game.physics.enable( this, Phaser.Physics.ARCADE );
        this.scale.x = 0.5;
        this.scale.y = 0.5;
        this.anchor.set( 0.5 );
    }

    Target.prototype = Object.create( Phaser.Sprite.prototype );
    
    Target.prototype.constructor = Target;

    Target.prototype.update = function()
    {
        this.body.velocity.x = -1 * this.targetSpeed;
        
        if( this.x < 0 )
        {
            this.destroy();
        }
    }
    
    /***************************
     * CLOUD
     ***************************/
    function Cloud( gameContext )
    {
        this.gameContext = gameContext;
        
        this.speed = this.gameContext.game.rnd.between( 100, 200 );

        Phaser.Sprite.call( 
            this, 
            this.gameContext.game,
            this.gameContext.game.width + 100,
            this.gameContext.game.rnd.between( 50, 150 ),
            "cloud"
        );
        this.gameContext.game.physics.enable( this, Phaser.Physics.BODY );
        
        var scale = this.gameContext.game.rnd.between( 6, 10 ) / 10;
        this.scale.x = scale;
        this.scale.y = scale;
        this.anchor.set( 0.5 );
    }
    
    Cloud.prototype = Object.create( Phaser.Sprite.prototype );
    
    Cloud.prototype.constructor = Cloud;
    
    Cloud.prototype.update = function()
    {
        this.body.velocity.x = -1 * this.speed;
        
        if( this.x < -100 )
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

        this.x             = 50;
        this.y             = 30;
        this.currentGas    = 200;
        this.color         = 0x33FF00;
        this.gasBarGraphic = this.drawGasBar();
        this.loop          = this.gameContext.game.time.events.loop( 50, this.gasLoop.bind( this ) );
    }
    
    GasBar.prototype.add = function( quantity )
    {
        if( this.currentGas + quantity > 200 )
        {
            this.currentGas = 200;
        }
        else
        {
            this.currentGas += quantity;
        }

        this.gasLoop( true );
    }
    
    GasBar.prototype.sustract = function( quantity )
    {
        if( this.currentGas - quantity <= 0 )
        {
            this.gameContext.end();
        }
        else
        {
            this.currentGas -= quantity;
        }
    }

    GasBar.prototype.drawGasBar = function()
    {
        var graphic = this.gameContext.game.add.graphics( this.x, this.y );
        graphic.lineStyle( 30, this.color );
        graphic.lineTo( this.currentGas, 0 );
        
        this.gasIcon = this.gameContext.game.add.sprite( this.x - 30, this.y / 2, "gas" );
        this.gasIcon.scale.x = 0.2;
        this.gasIcon.scale.y = 0.2;

        return graphic;
    }

    GasBar.prototype.gasLoop = function( force )
    {
        if( !force )
        {
            this.sustract( 1 );
        }

        this.setColor();
        this.gasBarGraphic.destroy();
        this.gasIcon.destroy();
        this.gasBarGraphic = this.drawGasBar();
    }

    GasBar.prototype.setColor = function()
    {
        if( this.currentGas < 51 )
        {
            this.color = 0xFF0000;   
        }
        else if( this.currentGas < 101 )
        {
            this.color = 0xF7FE2E;
        }
        else
        {
            this.color = 0x33FF00;
        }
    }
} )( top, World );