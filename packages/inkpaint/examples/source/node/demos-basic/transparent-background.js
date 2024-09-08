var app = new InkPaint.Application(800, 600, {
    backgroundColor: 0x1099bb,
    antialias: true,
    resolution: 1
});

InkPaint.loader.add("t1", paths("source/assets/bg_grass.jpg"));
InkPaint.loader.add("bg_rotate", paths("source/assets/bg_rotate2.jpg"));
InkPaint.loader.add("bunny", paths("source/assets/bunny.png"));
InkPaint.loader.load(setup);

function setup(l, resources) {
    var bunny = new InkPaint.Sprite(resources.bunny.texture);
    var bg_rotate = new InkPaint.Sprite(resources.bg_rotate.texture);

    // center the sprite's anchor point
    bunny.anchor.set(0.5);
    bunny.x = app.screen.width / 2;
    bunny.y = app.screen.height / 2;

    bg_rotate.anchor.set(0.5);
    bg_rotate.x = app.screen.width / 2;
    bg_rotate.y = app.screen.height / 2;

    app.stage.addChild(bg_rotate);
    app.stage.addChild(bunny);

    var ticker = new InkPaint.Ticker();
    ticker.start();
    ticker.add(function() {
        const now = Date.now();
        app.render();
        bunny.rotation += 0.1;
        bg_rotate.rotation -= 0.01;
        //console.log(Date.now() - now);
    });
}

module.exports = app;
