(function () {

    //importScripts(pixi.min.js);

    //console display type for debugging
    var pixiSurfaceType = "WebGL";
    if (!PIXI.utils.isWebGLSupported()) {
        pixiSurfaceType = "Canvas";
    }
    PIXI.utils.sayHello(pixiSurfaceType);


    //setup the pixi renderer
    var renderingOptions = {
        transparent: false,
        resolution: 1,
        backgroundColor: '0x000000',
        antialias: false
    };

    var renderer = PIXI.autoDetectRenderer(640, 480, renderingOptions);
    document.getElementById('display').appendChild(renderer.view);


    //set up pixi stage
    var stage = new PIXI.Container();
    var mapContainer = new PIXI.Container();
    stage.addChild(mapContainer);
    renderer.render(stage);
    renderer.autoResize = false;
    //renderer.resize(512, 512);
    StageSizeX = 640;
    StageSizeY = 480;

    var player = {};
    player.pos = {};
    player.vel = {};
    player.pos.x = 96;
    player.pos.y = 96;
    player.vel.max = 5;
    player.vel.default = 0;
    player.vel.left = 0;
    player.vel.right = 0;
    player.vel.up = 0;
    player.vel.down = 0;
    player.vel.x = 0;
    player.vel.y = 0;

    loadJSON("maps/test_empty.json", mapLoaded);

    var map;
    var imagesLocation = "maps/";

    function mapLoaded(rMap) {
        map = rMap;

        for (var i = 0; i < map.tilesets.length; i++) {
            PIXI.loader.add([imagesLocation + map.tilesets[0].image]);
        }

        PIXI.loader.load(loaded);
    }


    function loaded() {
        //called when resources requested are loaded

        var rx = 0;
        var ry = 0;
        var textures = [];
        for (var tiles = 0; tiles < map.tilesets[0].tilecount; tiles++) {
            var texture = new PIXI.Texture(PIXI.loader.resources[imagesLocation + map.tilesets[0].image].texture,
                new PIXI.Rectangle(rx, ry, map.tilesets[0].tilewidth, map.tilesets[0].tileheight));
            textures.push(texture);

            rx += map.tilesets[0].tilewidth;
            if (rx >= map.tilesets[0].imagewidth) {
                rx = 0;
                ry += map.tilesets[0].tileheight;
            }
        }

        var tileNumber = 0;

        for (var y = 0; y < map.height; y++) {
            for (var x = 0; x < map.width; x++) {
                var sprite = new PIXI.Sprite(textures[map.layers[0].data[tileNumber] - 1]);
                sprite.x = x * map.tilesets[0].tilewidth;
                sprite.y = y * map.tilesets[0].tileheight;
                mapContainer.addChild(sprite);

                tileNumber++;
            }
        }

        //mapContainer.position.set(100,100);

        mapContainer.x = 96;
        mapContainer.y = 96;
        mapContainer.height = 1024;
        mapContainer.width = 1024;

        //Capture the keyboard arrow keys
        //var key = init_keys();


        init_keys(player);
        //Left arrow key `press` method

        //Set the game state
        state = play;

        gameLoop();
    }

    function gameLoop() {

        //Loop this function 60 times per second
        requestAnimationFrame(gameLoop);

        //Update the current game state
        state();

        //Render the stage
        renderer.render(stage);
    }


    function play() {

        //Use the cat's velocity to make it move
        player.vel.x =  player.vel.left - player.vel.right;
        player.vel.y =  player.vel.up - player.vel.down;
        mapContainer.x += player.vel.x;
        mapContainer.x += player.vel.x;
        mapContainer.y += player.vel.y;

        if (mapContainer.x < 0 - mapContainer.width) {
            mapContainer.x = 0 - mapContainer.width;
            //cat.vx=0;
        }
        if (mapContainer.x > StageSizeX) {
            mapContainer.x = StageSizeX;
            //cat.vx=0;
        }
        if (mapContainer.y < 0 - mapContainer.height) {
            mapContainer.y = 0 - mapContainer.height;
            //cat.vy=0;
        }
        if (mapContainer.y > StageSizeY) {
            mapContainer.y = StageSizeY;
            //cat.vy=0;
        }
    }



    //binds default keys and
    function init_keys(obj) {
        var keyinit = {};

        //Set Keybindings
        keyinit.left = keyboard(37);
        keyinit.up = keyboard(38);
        keyinit.right = keyboard(39);
        keyinit.down = keyboard(40);
        keyinit.w = keyboard(87);
        keyinit.a = keyboard(65);
        keyinit.s = keyboard(83);
        keyinit.d = keyboard(68);

        //define key-press and release actions
        //Left
        keyinit.left.press = function () {
            //Change the directional velocity when the key is pressed
            obj.vel.left = obj.vel.max;
        };

        keyinit.left.release = function () {
            //Set directional velocity to 0
            obj.vel.left = obj.vel.default;
        };

        //Up
        keyinit.up.press = function () {
            obj.vel.up = obj.vel.max;
        };

        keyinit.up.release = function () {
            obj.vel.up = obj.vel.default;
        };

        //Right
        keyinit.right.press = function () {
            obj.vel.right = obj.vel.max;
        };

        keyinit.right.release = function () {
            obj.vel.right = obj.vel.default;
        };

        //Down
        keyinit.down.press = function () {
            obj.vel.down = obj.vel.max;
        };

        keyinit.down.release = function () {
            obj.vel.down = obj.vel.default;
        };

        keyinit.w.press = keyinit.up.press;
        keyinit.w.release = keyinit.up.release;
        keyinit.a.press = keyinit.left.press;
        keyinit.a.release = keyinit.left.release;
        keyinit.s.press = keyinit.down.press;
        keyinit.s.release = keyinit.down.release;
        keyinit.d.press = keyinit.right.press;
        keyinit.d.release = keyinit.right.release;

        //return keyinit;
    }


    //The `keyboard` helper function
    function keyboard(keyCode) {

        var key = {};
        key.code = keyCode;
        key.isDown = false;
        key.isUp = true;
        key.press = undefined;
        key.release = undefined;

        //The `downHandler`
        key.downHandler = function (event) {
            if (event.keyCode === key.code) {
                if (key.isUp && key.press) key.press();
                key.isDown = true;
                key.isUp = false;
            }
            event.preventDefault();
        };


        //The `upHandler`

        key.upHandler = function (event) {

            if (event.keyCode === key.code) {
                if (key.isDown && key.release) key.release();
                key.isDown = false;
                key.isUp = true;
            }
            event.preventDefault();
        };


        //Attach event listeners
        window.addEventListener(
            "keydown", key.downHandler.bind(key), false
        );

        window.addEventListener(
            "keyup", key.upHandler.bind(key), false
        );
        return key;
    }

})();