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

    },


    update: function() {}


};
