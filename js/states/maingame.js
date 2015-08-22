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
        this.startX = 0;
        this.startY = 0;
        this.endX = 0;
        this.endY = 0;
        this.cooldown = 0;

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


        this.grid = [];
        for (var y = 0; y<15; y++) {
            var toPush = [];
            for (var x = 0; x < 15; x++) {
                toPush.push((this.map.getTile(this.layer.getTileX(x*32), this.layer.getTileY(y*32)).index==1)?0:1);
            }
            this.grid.push(toPush);
        }
        console.log(this.grid);

        this.pf = new PF.Grid(this.grid);
        this.path = new PF.AStarFinder();
        this.player = this.add.sprite(0,0,"player");
        this.player.selected = false;
        this.player.alpha = 1;

    },


    convertToWorld: function(q) {
        var pathx = [];
        var pathy = [];

      for (var z=1; z< q.length; z++) {
              pathx.push(q[z][0]*32);
              pathy.push(q[z][1]*32);
      }
        return [pathx, pathy];
    },


    update: function() {
        if (this.player.path != undefined && this.player.path != []) {

        }
        if (this.input.mousePointer.isDown && this.cooldown <= 0) {
           this.cooldown = 20;
           if (this.clickedOn(this.player, this.input.mousePointer.x, this.input.mousePointer.y)) {
               if (!this.player.selected) {
                   this.player.selected = true;
                   this.player.tween = this.add.tween(this.player).to( { alpha: 0.5 }, 100, "Linear", true, 0, -1);
                   this.player.tween.yoyo(true, 0);

                   this.startX = Math.floor(this.player.x/32);
                   this.startY = Math.floor(this.player.y/32);
               } else {
                   this.player.selected = false;
                   this.player.tween.stop();
                   this.player.tween = undefined;
                   this.player.alpha = 1;
               }
           } else {
               if (this.player.selected) {
                   this.endX = Math.floor(this.input.mousePointer.x/32);
                   this.endY = Math.floor(this.input.mousePointer.y/32);
                   console.log(Math.floor(this.player.x/32) ,Math.floor(this.player.y/32), this.endX, this.endY);
                   var gridBackup = this.pf.clone();
                   var x = this.path.findPath(Math.floor(this.player.x/32) ,Math.floor(this.player.y/32), this.endX, this.endY, this.pf);
                   x = this.convertToWorld(x);
                   console.log("X:",x);
                   if (x[0][0] != undefined) {
                       var t = this.add.tween(this.player).to({x: x[0], y: x[1]}, 500 * x.length).start();
                   }
                   this.pf=gridBackup;
                   this.player.selected = false;
                   this.player.tween.stop();
                   this.player.tween = undefined;
                   this.player.alpha = 1;


               }
           }
        } else {
            if (this.cooldown > 0) {
                this.cooldown -= 1;
            }
        }
    },


    clickedOn: function(spr, x, y) {
        return x > spr.x && x < spr.x + spr.width && y > spr.y && y < spr.y + spr.height;
    }


};
