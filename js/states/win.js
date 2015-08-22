var Win= function() {
};

Win.prototype = {

    init: function() {},

    preload: function() {
      this.load.image("menu","res/img/menu_bg.png");
      this.load.image("button", "res/img/start_button.png");
    },

     create: function() {
      this.add.sprite(0,0,"menu");
      this.add.button(100, 200, 'button', this.startGame, this, 2, 1, 0);
    },

    update: function() {},

    startGame: function () {
        this.state.start("MainGame");
    }


};
