var loader = new InkPaint.Loader();
loader.add("t1", paths("source/assets/bg_grass.jpg"));
loader.add("bg_rotate", paths("source/assets/bg_rotate2.jpg"));
loader.add("bunny", paths("source/assets/bunny.png"));
loader.load(setup);

var app = new InkPaint.Application(800, 600, {
    backgroundColor: 0x1099bb
});
var index = 0;
var now = Date.now();

function setup(l, resources) {
    const texture1 = resources.bunny.texture;
    const texture2 = resources.bg_rotate.texture;
    const texture3 = resources.t1.texture;
    console.log(texture1.frame.toString());
    console.log(texture2.frame.toString());
    console.log(texture3.frame.toString());

    var bunny1 = new InkPaint.Sprite(resources.bunny.texture);
    var bunny2 = new InkPaint.Sprite(resources.bunny.texture);
    var bunny3 = new InkPaint.Sprite(resources.bunny.texture);
    var bg = new InkPaint.Sprite(resources.bg_rotate.texture);

    // center the sprite's anchor point
    bunny1.anchor.set(0.5);
    bunny2.anchor.set(0.5);
    bunny3.anchor.set(0.5);

    // move the sprite to the center of the screen
    bunny1.x = app.screen.width / 2 - 200;
    bunny1.y = app.screen.height / 2 - 200;

    bunny2.x = 100;
    bunny2.y = 100;
    bunny3.x = 100;
    bunny3.y = 150;
    bunny3.rotation = 3.14 / 2;

    app.stage.addChild(bg);
    app.stage.addChild(bunny1);
    app.stage.addChild(bunny2);
    app.stage.addChild(bunny3);

    // Listen for animate update
    var ticker = new InkPaint.Ticker();
    ticker.start();
    ticker.add(function(delta) {
        app.render();
        bunny1.rotation += 0.1 * delta;
        index++;
        if (index >= 20) {
            //console.log("耗时", Date.now() - now);
            now = Date.now();
            index = 0;
        }
    });
}

module.exports = app;
