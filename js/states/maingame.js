var MainGame = function() {
};

MainGame.prototype = {

    init: function() {
    },

    preload: function() {
        this.load.tilemap('map', 'res/map/Map', null, Phaser.Tilemap.CSV);
        this.load.image('tiles', 'res/img/sprites.png');
        this.load.image("player", "res/img/player.png");
    },

    create: function() {

        //Tracking Variables


        //SCREW THIS WITH A VENGEANCE

        //  Because we're loading CSV map data we have to specify the tile size here or we can't render it
        this.map = this.add.tilemap('map', 32, 32);

        //  Now add in the tileset
        this.map.addTilesetImage('tiles');

        //  Create our layer
        this.layer = this.map.createLayer(0);

        //  Resize the world
        this.layer.resizeWorld();
        console.log("MAP",this.layer);

        this.easystar = new EasyStar.js();

        this.grid = [];
        for (var y = 0; y<15; y++) {
            var toPush = [];
            for (var x = 0; x < 15; x++) {
                toPush.push(this.map.getTile(this.layer.getTileX(x*32), this.layer.getTileY(y*32)).index);;
            }
            this.grid.push(toPush);
        }
        console.log(this.grid);

        this.easystar.setGrid(this.grid);
        this.easystar.setAcceptableTiles([1]);

        this.player = this.add.sprite(0,0,"player");
        this.player.selected = false;

    },


    update: function() {
        if (this.input.mousePointer.isDown) {
           if (this.clickedOn(this.player, this.input.mousePointer.x, this.input.mousePointer.y)) {
               if (!this.player.selected) {
                   this.player.selected = true;
                   //  Create our tween. This will fade the sprite to alpha 1 over the duration of 2 seconds
                   var tween = this.add.tween(this.player).to( { alpha: 0.5 }, 100, "Linear", true, 0, -1);

                   //  And this tells it to yoyo, i.e. fade back to zero again before repeating.
                   //  The 3000 tells it to wait for 3 seconds before starting the fade back.
                   tween.yoyo(true, 0);
               }
           }
        }
    },

    clickedOn: function(spr, x, y) {
        return x > spr.x && x < spr.x + spr.width && y > spr.y && y < spr.y + spr.height;
    }


};
