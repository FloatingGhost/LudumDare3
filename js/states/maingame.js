var MainGame = function() {
};

function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length != b.length) return false;

    // If you don't care about the order of the elements inside
    // the array, you should sort both arrays here.

    for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

function echo(a) {
    console.log(a);
}

MainGame.prototype = {

    init: function() {

    },

    preload: function() {
        this.load.tilemap('map', 'res/map/DistCSV', null, Phaser.Tilemap.CSV);
        this.load.image('tiles', 'res/img/sprites.png');
        this.load.image("player", "res/img/player.png");
        this.load.image("enemy", "res/img/enemy.png");
        this.load.image("path", "res/img/path.png");
        this.load.image("bullet", "res/img/bullet.png");
    },

    create: function() {

        this.physics.startSystem(Phaser.Physics.ARCADE);
        this.stage.backgroundColor = 0xffffff;
        //Tracking Variables
        this.startX = 0;
        this.startY = 0;
        this.endX = 0;
        this.endY = 0;
        this.shotCooldown = 20;
        this.cooldown = 0;

        this.bullets = [];


        this.money = 100;

        this.moneyText = this.add.text(500, 0, "Money: " + this.money);
        //SCREW THIS WITH A VENGEANCE

        //  Because we're loading CSV map data we have to specify the tile size here or we can't render it
        this.map = this.add.tilemap('map', 32, 32);

        //  Now add in the tileset
        this.map.addTilesetImage('tiles');
        this.map.setCollision(1);
        //  Create our layer
        this.layer = this.map.createLayer(0);

        //  Resize the world
        this.layer.resizeWorld();
        this.grid = [];
        for (var y = 0; y<15; y++) {
            var toPush = [];
            for (var x = 0; x < 15; x++) {
                toPush.push((this.map.getTile(this.layer.getTileX(x*32), this.layer.getTileY(y*32)).index==1)?1:0);
            }
            this.grid.push(toPush);
        }

        this.pf = new PF.Grid(this.grid);
        this.path = new PF.BestFirstFinder();

        this.players = this.add.group();

        for (var i = 0; i<2; i++) {
            var player = this.add.sprite(32*13, 32*(12+i*2), "player");
            player.selected = false;
            player.alpha = 1;
            player.tint = 0x00ff00;
            this.physics.arcade.enable(player);
            //player.body.static = true;
            this.players.add(player);
        }
        echo(this.players);
        this.enemy = this.add.sprite(13*32, 32, "enemy");
        this.enemy.goal = [13*32, 32];

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

    distance: function (x1, y1, x2, y2) {

        var dx = x1 - x2;
        var dy = y1 - y2;

        return Math.sqrt(dx * dx + dy * dy);

    },

    killThings: function(obj1, obj2) {
        obj1.x = null;
        obj1.y = null;
        obj2.x = null;
        obj2.y = null;
        obj1.kill();
        obj2.kill();
    },

    wall: function(obj1, obj2) {
        obj1.x = null;
        obj1.y = null;
        obj1.kill();
    },

    update: function() {

        for (var i in this.bullets) {
            this.physics.arcade.overlap (this.players, this.bullets[i], this.killThings, null, this);
            try {
                if ((this.map.getTile(this.layer.getTileX(this.bullets[i].x), this.layer.getTileY(this.bullets[i].y)).index == 1)) {
                    this.bullets[i].x = null;
                    this.bullets[i].y = null;
                    this.bullets[i].kill();
                }
            } catch (e) {
                this.bullets[i].x = null;
                this.bullets[i].y = null;
                this.bullets[i].kill();
            }
        }

        if (this.shotCooldown > 0) {
            this.shotCooldown -= 1;
        }
        var cansee = [];

        //Raycast from player
        for (var i=0; i<=2*Math.PI; i+= Math.PI/20) {
            for (var j = 0; j<40; j++) {
                try {
                    var tile = this.map.getTile(this.layer.getTileX(this.enemy.x+16 + 32*j*Math.cos(i)), this.layer.getTileY(this.enemy.y+16 + 32*j*Math.sin(i)));
                    if (tile.index == 1) {
                        break;
                    } else {
                        for (var q in this.players.children) {
                            var p = this.players.children[q];
                            if (this.clickedOn(p, this.enemy.x+16 + 32*j*Math.cos(i), this.enemy.y+16 + 32*j*Math.sin(i))) {
                               cansee.push(p);
                            }
                        }

                    }
                } catch (e) {
                    break;
                }
            }
        }



        for (var i in this.players.children) {
            j = this.players.children[i];
            if (j.tint == 0x00000) {
                j.tint = 0x00ff00;
            }
            if (cansee.indexOf(j) != -1) {
                j.tint=0xff0000;
            } else {
                j.tint=0x00ff00;
            }
        }

        if (cansee.length == 0) {
            if (arraysEqual(this.enemy.goal,[this.enemy.x, this.enemy.y])) {
                //Player movement
                var path = [];
                while (path.length == 0) {
                    var gridBackup = this.pf.clone();
                    path = this.path.findPath(Math.floor(this.enemy.x / 32), Math.floor(this.enemy.y / 32),
                        Math.floor(14 * Math.random()), Math.floor(14 * Math.random()), this.pf);

                    this.pf = gridBackup;
                }
                path = this.convertToWorld(path);
                this.add.tween(this.enemy).to({x: path[0], y: path[1]}, 300 * path[0].length).start();
                this.enemy.goal = [path[0][path[0].length - 1], path[1][path[1].length - 1]];
            }
        } else {
            //Find closest enemy
            var min_dist = 100000;
            var min_p = null;
            for (var i in this.players.children) {
                var p = this.players.children[i];
                if (cansee.indexOf(p) != -1) {
                    if (p != null) {
                        var dist = this.distance(this.enemy.x, this.enemy.y, p.x, p.y);
                        if (dist < min_dist) {
                            min_dist = dist;
                            min_p = p;
                        }
                    }
                }
            }
            //Shoot
            //Get direction
            if (min_p != null) {
                echo(min_p.x);
                if (this.shotCooldown == 0) {
                    this.shotCooldown = 20;
                    var direction = -Math.atan2(min_p.x - this.enemy.x, min_p.y - this.enemy.y)+(Math.PI/2);
                    var b = this.add.sprite(this.enemy.x+16, this.enemy.y+16, "bullet");
                    this.physics.arcade.enable(b);
                    b.body.velocity.x = 500*Math.cos(direction);
                    b.body.velocity.y = 500*Math.sin(direction);
                    this.bullets.push(b);
                }

            }

        }

        if (this.input.mousePointer.isDown && this.cooldown <= 0) {
            for (i in this.players.children) {
                this.cooldown = 20;
                if (this.clickedOn(this.players.children[i], this.input.mousePointer.x, this.input.mousePointer.y)) {
                    if (!this.players.children[i].selected) {
                        this.players.children[i].selected = true;
                        this.players.children[i].tween = this.add.tween(this.players.children[i]).to({alpha: 0.5}, 100, "Linear", true, 0, -1);
                        this.players.children[i].tween.yoyo(true, 0);

                        this.startX = Math.floor(this.players.children[i].x / 32);
                        this.startY = Math.floor(this.players.children[i].y / 32);
                    } else {
                        this.players.children[i].selected = false;
                        this.players.children[i].tween.stop();
                        this.players.children[i].tween = undefined;
                        this.players.children[i].alpha = 1;
                    }
                } else {
                    if (this.players.children[i].selected) {
                        this.endX = Math.floor(this.input.mousePointer.x / 32);
                        this.endY = Math.floor(this.input.mousePointer.y / 32);
                        var gridBackup = this.pf.clone();
                        var x = this.path.findPath(Math.floor(this.players.children[i].x / 32), Math.floor(this.players.children[i].y / 32), this.endX, this.endY, this.pf);
                        x = this.convertToWorld(x);
                        if (x[0][0] != undefined) {
                            var t = this.add.tween(this.players.children[i]).to({x: x[0], y: x[1]}, 300 * x[0].length).start();
                        }
                        this.pf = gridBackup;
                        this.players.children[i].selected = false;
                        this.players.children[i].tween.stop();
                        this.players.children[i].tween = undefined;
                        this.players.children[i].alpha = 1;
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
        return x > spr.x && x < spr.x + spr.width && y > spr.y && y < spr.y + spr.height;
    }


};
