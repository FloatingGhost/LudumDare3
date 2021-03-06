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
    //console.log(a);
}


function kindaEqual(a,b) {
    var diff = Math.abs(a-b);
    return diff < 0.3;
}

MainGame.prototype = {

    init: function() {

    },

    preload: function() {
        this.load.tilemap('map', 'res/map/map', null, Phaser.Tilemap.CSV);
        this.load.image('tiles', 'res/img/spawn-sheet.png');
        this.load.image("player", "res/img/player.png");
        this.load.image("enemy", "res/img/enemy.png");
        this.load.image("path", "res/img/path.png");
        this.load.image("bullet", "res/img/bullet.png");
        this.load.image("add_1", "res/img/add_1.png");
        this.load.image("add_2", "res/img/add_2.png");
        this.load.image("add_3", "res/img/add_3.png");
        this.load.image("food", "res/img/foody.png");

        this.load.audio("spawn","res/sfx/spawn.wav");
        this.load.audio("shoot","res/sfx/shoot.wav");
        this.load.audio("click","res/sfx/click.wav");
        this.load.audio("death","res/sfx/zombie_death.wav");
        this.load.audio("eat", "res/sfx/eat.wav");


        this.load.spritesheet("playerS", "res/img/zombie.png", 32, 32);
        this.load.spritesheet("enemyS", "res/img/player-sheet.png",32,32);
    },

    add1: function() {
        if (this.money >= 100) {
            this.money-=100;
            this.moneyText.text = "Money: " + this.money;
            this.createPlayer(1, 1);
        }
    },

    add2: function() {
        if (this.money >= 200) {
            this.money-=100;
            this.moneyText.text = "Money: " + this.money;
            this.createPlayer(3, 1);
        }
    },

    add3: function() {
        if (this.money >= 200) {
            this.money-=100;
            this.moneyText.text = "Money: " + this.money;
            this.createPlayer(1, 3);
        }
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

        //Load audio
        this.spawn = this.add.audio("spawn");
        this.shoot = this.add.audio("shoot");
        this.click = this.add.audio("click");
        this.death = this.add.audio("death");
        this.eatt = this.add.audio("eat");

        this.add.button( 100, 30*32, 'add_1', this.add1, this, 2, 1, 0);
        this.add.button( 200, 30*32, 'add_2', this.add2, this, 2, 1, 0);
        this.add.button( 300, 30*32, 'add_3', this.add3, this, 2, 1, 0);

        this.money = 100;

        this.moneyText = this.add.text(20*30, 32*30, "Money: " + this.money);
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
        for (var y = 0; y<30; y++) {
            var toPush = [];
            for (var x = 0; x < 30; x++) {
                toPush.push((this.map.getTile(this.layer.getTileX(x*32), this.layer.getTileY(y*32)).index==5 ||
                this.map.getTile(this.layer.getTileX(x*32), this.layer.getTileY(y*32)).index==7 ||
                this.map.getTile(this.layer.getTileX(x*32), this.layer.getTileY(y*32)).index==10)?1:0);
            }
            this.grid.push(toPush);
        }

        this.pf = new PF.Grid(this.grid);
        this.path = new PF.AStarFinder();

        this.players = this.add.group();

        for (var i = 0; i<4; i++) {
            this.createPlayer(1,1);
        }
        this.enemy = this.add.sprite(32*28, 64, "enemyS");
        this.enemy.animations.add('walk_left');
        this.physics.arcade.enable(this.enemy);
        this.enemy.goal = [32*28, 64];
        this.enemy.tweeny = null;
        this.food = this.createFud();
    },

    rand: function(lo, hi) {
        var d = hi-lo;
        return lo + Math.floor(Math.random()*d)
    },

    createPlayer: function(s, h) {
        var player = this.add.sprite(16+(32*24+ 32*this.rand(0,4)),  16+(32*24 + 32*this.rand(0,4)), "playerS");
        player.selected = false;
        player.alpha = 1;
        player.speed = s;
        player.tweeny = 0;
        player.hp = h;

        player.animations.add('walk_left', [0,1,2,3,4]);
        player.animations.add('walk_right', [5,6,7,8,9]);
        player.animations.add('walk_up', [10,11,12,13,14]);
        player.animations.add('walk_down', [15,16,17,18,19]);

        if (h == 3)
            player.tint = 0xff0000;
        if (s == 3)
            player.tint = 0x0000ff;
        this.physics.arcade.enable(player);
        this.players.add(player);

        this.spawn.play();
    },

    createFud: function() {
        var x = 0;
        var y = 0;
        while(this.map.getTile(this.layer.getTileX(x*32), this.layer.getTileY(y*32)).index==7 ||
        this.map.getTile(this.layer.getTileX(x*32), this.layer.getTileY(y*32)).index==5 ||
        this.map.getTile(this.layer.getTileX(x*32), this.layer.getTileY(y*32)).index==3 ||
        this.map.getTile(this.layer.getTileX(x*32), this.layer.getTileY(y*32)).index==4 ||
        this.map.getTile(this.layer.getTileX(x*32), this.layer.getTileY(y*32)).index==10) {
            x = Math.floor(Math.random()*30);
            y = Math.floor(Math.random()*30);
        }
        var food = this.add.sprite(x*32, y*32, "food");
        this.physics.arcade.enable(food);
        return food;
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

    convertToWorld2: function(q) {
        var pathx = [];
        var pathy = [];

        for (var z=1; z< q.length; z++) {
            pathx.push( q[z][0]*32);
            pathy.push( q[z][1]*32);
        }
        return [pathx, pathy];
    },

    distance: function (x1, y1, x2, y2) {

        var dx = x1 - x2;
        var dy = y1 - y2;

        return Math.sqrt(dx * dx + dy * dy);

    },

    killThings: function(obj1, obj2) {
        if (obj1.hp != undefined) {
            obj2.x = null;
            obj2.y = null;
            obj2.kill();
            obj1.hp -= 1;
            if (obj1.hp == 0) {
                obj1.x = null;
                obj1.y = null;
                obj1.kill();

                if (this.countAlive() == 0 && this.money == 0) {
                    this.state.start("loss");
                }
            }
        } else {
            obj1.x = null;
            obj1.y = null;
            obj1.kill();
            obj2.hp -= 1;
            if (obj2.hp == 0) {
                obj2.x = null;
                obj2.y = null;
                obj2.kill();
                this.death.play();
                echo (this.countAlive());
                if (this.countAlive() == 0 && this.money == 0) {
                    this.state.start("loss");
                }
            }
        }

    },

    countAlive: function() {
        var c = 0;
        for (var i in this.players.children) {
            if (this.players.children[i].hp > 0) {
                c += 1;
            }
        }
        return c;
    },

    eat: function(obj1, obj2) {
        this.money += 100;
        this.moneyText.text = "Money: " + this.money;
        this.food.kill();
        this.food.x = null;
        this.food.y = null;
        this.food = this.createFud();
        this.eatt.play();
    },

    wall: function(obj1, obj2) {
        obj1.x = null;
        obj1.y = null;
        obj1.kill();
    },

    win: function(obj1, obj2) {
        this.enemy.kill();
        this.state.start("win");
    },

    update: function() {

        this.physics.arcade.overlap(this.players, this.enemy, this.win, null, this);
        this.physics.arcade.overlap( this.food,this.players, this.eat, null, this);
        for (var i in this.bullets) {
            this.physics.arcade.overlap (this.players, this.bullets[i], this.killThings, null, this);
            try {
                if ((this.map.getTile(this.layer.getTileX(this.bullets[i].x), this.layer.getTileY(this.bullets[i].y)).index == 7)) {
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
                    if (tile.index == 7 || tile.index == 5) {
                        break;
                    } else {
                        for (var q in this.players.children) {
                            var p = this.players.children[q];
                            if (this.clickedOn(p, this.enemy.x+16 + 32*j*Math.cos(i), this.enemy.y+16 + 32*j*Math.sin(i)) && p.hp > 0) {
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

            if (j.tweeny != null) {

                if (j.tweeny.isRunning) {
                    var p = j.tweeny.timeline[0];
                    var percent = p.percent;
                    var end = p.vEnd;
                    var next = Math.floor(end.x.length * percent)+1;

                    if (undefined != end.x[next]) {
                        var direction = Math.atan2(end.x[next] - j.x, end.y[next] - j.y) + (Math.PI / 2);
                        if (kindaEqual(direction, 0))
                            j.animations.play("walk_left", 500);
                        if (kindaEqual(direction, Math.PI/2))
                                j.animations.play("walk_down", 500);
                        if (kindaEqual(direction, Math.PI * (3/2)))
                                j.animations.play("walk_up", 500);
                        if (kindaEqual(direction, Math.PI))
                                j.animations.play("walk_right", 500);




                    }

                } else {
                    j.animations.stop("walk_left");
                    j.animations.stop("walk_right");
                    j.animations.stop("walk_up");
                    j.animations.stop("walk_down");
                }
            }
        }

        if (this.enemy.tweeny != null) {
            if (this.enemy.tweeny.isRunning) {
                var p = this.enemy.tweeny.timeline[0];
                var percent = p.percent;
                var end = p.vEnd;
                var next = Math.floor(end.x.length * percent)+1;

                if (undefined != end.x[next]) {
                    var direction = Math.atan2(end.x[next] - this.enemy.x, end.y[next] - this.enemy.y) + (Math.PI / 2);
                    if (kindaEqual(direction, 0))
                        this.enemy.animations.frame = 2;
                    if (kindaEqual(direction, Math.PI/2))
                        this.enemy.animations.frame = 0;
                    if (kindaEqual(direction, Math.PI * (3/2)))
                        this.enemy.animations.frame = 3;
                    if (kindaEqual(direction, Math.PI))
                        this.enemy.animations.frame = 1;




                }

            }
        }
        var min_p = null;
        if (cansee.length == 0) {
            if (arraysEqual(this.enemy.goal,[this.enemy.x, this.enemy.y])) {
                //Player movement
                var path = [];
                while (path.length < 2) {
                    var gridBackup = this.pf.clone();
                    path = this.path.findPath(Math.floor(this.enemy.x / 32), Math.floor(this.enemy.y / 32),
                        Math.floor(29 * Math.random()), Math.floor(29 * Math.random()), this.pf);

                    this.pf = gridBackup;
                    if (path.length < 2) {
                        path = [];
                    } else {
                        if (path[0].length < 2 || path[0] == path[1]) {
                            path = [];
                        }
                    }
                }
                path = this.convertToWorld(path);
                this.enemy.tweeny = this.add.tween(this.enemy).to({x: path[0], y: path[1]}, 300 * path[0].length);
                this.enemy.tweeny.start();
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
                if (this.shotCooldown == 0) {
                    this.shotCooldown = 100;
                    var direction = -Math.atan2(min_p.x - this.enemy.x, min_p.y - this.enemy.y)+(Math.PI/2);

                    if (Math.random() > 0.5)
                        direction += Math.PI*Math.random() / 20;
                    else
                        direction -= Math.PI*Math.random() / 20;
                    var b = this.add.sprite(this.enemy.x+16, this.enemy.y+16, "bullet");
                    this.physics.arcade.enable(b);
                    b.body.velocity.x = 500*Math.cos(direction);
                    b.body.velocity.y = 500*Math.sin(direction);
                    b.hp = undefined;
                    this.bullets.push(b);
                    this.shoot.play();
                }

            }

        }

        if (this.input.mousePointer.isDown && this.cooldown <= 0) {
            for (i in this.players.children) {
                this.cooldown = 20;
                if (this.clickedOn(this.players.children[i], this.input.mousePointer.x, this.input.mousePointer.y)) {
                    this.click.play();
                    if (!this.players.children[i].selected) {
                        this.players.children[i].selected = true;
                        this.players.children[i].tween = this.add.tween(this.players.children[i]).to({alpha: 0.5}, 200, "Linear", true, 0, -1);
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
                        x = this.convertToWorld2(x);
                        if (x[0][0] != undefined) {
                            this.players.children[i].tweeny =  this.add.tween(this.players.children[i]).to({x: x[0], y: x[1]}, (300/this.players.children[i].speed) * x[0].length);
                            this.players.children[i].animations.play("walk", 500, true);
                            this.players.children[i].tweeny.start();
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
