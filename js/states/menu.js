var Menu = function() {
};

Menu.prototype = {

    init: function() {},

    preload: function() {
      this.load.image("menu","res/img/menu_bg.png");
      this.load.image("button", "res/img/start_button.png");
        this.load.image("instr", "res/img/instr_button.png");
    },

     create: function() {
      this.add.sprite(0,0,"menu");
      this.add.button(400, 800, 'button', this.startGame, this, 2, 1, 0);
         this.add.button(400, 950, 'instr', this.startInstr, this, 2, 1, 0);
    },

    update: function() {},

    startGame: function () {
        this.state.start("MainGame");
    },

    startInstr: function () {
        this.state.start("instr");
    }


};
