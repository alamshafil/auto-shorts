var app = new InkPaint.Application(800, 600, {
    backgroundColor: 0x1099bb,
    antialias: true
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
        app.render();
        // just for fun, let's rotate mr rabbit a little
        bunny.rotation += 0.1;
        bg_rotate.rotation -= 0.01;
    });

    setInterval(mousedown, 1000 / 10);
}

function mousedown() {
    var width = (Math.random() * 800) >> 0;
    var height = (Math.random() * 600) >> 0;
    app.renderer.resize(width, height);

    app.renderer.view.width = width;
    app.renderer.view.height = height;
    console.log(width, height);
}

module.exports = app;
