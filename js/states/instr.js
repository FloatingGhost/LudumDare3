var Instr = function() {
};

Instr.prototype = {

    init: function() {},

    preload: function() {
      this.load.image("menu","res/img/instr_bg.png");
      this.load.image("button", "res/img/start_button.png");
    },

     create: function() {
      this.add.sprite(0,0,"menu");
      this.add.button(400, 800, 'button', this.startGame, this, 2, 1, 0);
    },

    update: function() {},

    startGame: function () {
        this.state.start("MainGame");
    }


};
