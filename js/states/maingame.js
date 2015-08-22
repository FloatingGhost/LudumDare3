var MainGame = function() {
};

MainGame.prototype = {

    init: function() {
    },

    preload: function() {
        this.load.tilemap('map', 'res/map/Map', null, Phaser.Tilemap.CSV);
        this.load.image('tiles', 'res/img/sprites.png');
        this.load.image("player", "res/img/player.png");
        this.load.image("enemy", "res/img/enemy.png");
    },

    create: function() {
        //Tracking Variables
        this.startX = 0;
        this.startY = 0;
        this.endX = 0;
        this.endY = 0;
        this.cooldown = 0;

        this.money = 100;

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
                toPush.push((this.map.getTile(this.layer.getTileX(x*32), this.layer.getTileY(y*32)).index==1)?1:0);
            }
            this.grid.push(toPush);
        }
        console.log(this.grid);

        this.pf = new PF.Grid(this.grid);
        this.path = new PF.BestFirstFinder();

        this.players = [];

        for (var i = 0; i<4; i++) {
            var player = this.add.sprite(64*i, 64*i, "player");
            player.selected = false;
            player.alpha = 1;
            this.players.push(player);
        }

        this.enemy = this.add.sprite(13*32, 0, "enemy");


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
        var cansee = [];

        //Raycast from player
        for (var i=0; i<2*Math.PI; i+= (2*Math.PI)/32) {
            for (var j = 0; j<20; j++) {
                try {
                    var tile = this.map.getTile(this.layer.getTileX(this.enemy.x + 32*j*Math.cos(i)), this.layer.getTileY(this.enemy.y + 32*j*Math.sin(i)));
                    if (tile.index == 1) {
                        break;
                    } else {
                        for (var q in this.players) {
                            var p = this.players[q];
                            if (this.clickedOn(p, this.enemy.x + 32*j*Math.cos(i), this.enemy.y + 32*j*Math.sin(i))) {
                               cansee.push(p);
                                console.log("I SEE!");
                            }
                        }

                    }
                } catch (e) {
                    break;
                }
            }
        }

        if (this.input.mousePointer.isDown && this.cooldown <= 0) {
            for (i in this.players) {
                this.cooldown = 20;
                if (this.clickedOn(this.players[i], this.input.mousePointer.x, this.input.mousePointer.y)) {
                    if (!this.players[i].selected) {
                        this.players[i].selected = true;
                        this.players[i].tween = this.add.tween(this.players[i]).to({alpha: 0.5}, 100, "Linear", true, 0, -1);
                        this.players[i].tween.yoyo(true, 0);

                        this.startX = Math.floor(this.players[i].x / 32);
                        this.startY = Math.floor(this.players[i].y / 32);
                    } else {
                        this.players[i].selected = false;
                        this.players[i].tween.stop();
                        this.players[i].tween = undefined;
                        this.players[i].alpha = 1;
                    }
                } else {
                    if (this.players[i].selected) {
                        this.endX = Math.floor(this.input.mousePointer.x / 32);
                        this.endY = Math.floor(this.input.mousePointer.y / 32);
                        console.log(Math.floor(this.players[i].x / 32), Math.floor(this.players[i].y / 32), this.endX, this.endY);
                        var gridBackup = this.pf.clone();
                        var x = this.path.findPath(Math.floor(this.players[i].x / 32), Math.floor(this.players[i].y / 32), this.endX, this.endY, this.pf);
                        x = this.convertToWorld(x);
                        console.log("X:", x);
                        if (x[0][0] != undefined) {
                            var t = this.add.tween(this.players[i]).to({x: x[0], y: x[1]}, 300 * x[0].length).start();
                        }
                        this.pf = gridBackup;
                        this.players[i].selected = false;
                        this.players[i].tween.stop();
                        this.players[i].tween = undefined;
                        this.players[i].alpha = 1;
                        break;

                    }
                }

            }
        }
        else {
                if (this.cooldown > 0) {
                    this.cooldown -= 1;
                }
            }

    },


    clickedOn: function(spr, x, y) {
        return x >= spr.x && x <= spr.x + spr.width && y >= spr.y && y <= spr.y + spr.height;
    }


};
