var app = new InkPaint.Application();
document.body.appendChild(app.view);

var bg = InkPaint.Sprite.fromImage(
    "source/assets/pixi-filters/bg_depth_blur.jpg"
);
bg.width = app.screen.width;
bg.height = app.screen.height;
app.stage.addChild(bg);

var littleDudes = InkPaint.Sprite.fromImage(
    "source/assets/pixi-filters/depth_blur_dudes.jpg"
);
littleDudes.x = app.screen.width / 2;
littleDudes.y = 300;
app.stage.addChild(littleDudes);

var littleRobot = InkPaint.Sprite.fromImage(
    "source/assets/pixi-filters/depth_blur_moby.jpg"
);
littleRobot.x = app.screen.width / 2;
littleRobot.y = 250;
app.stage.addChild(littleRobot);

InkPaint.settings.PRECISION_FRAGMENT = InkPaint.PRECISION.HIGH;

var blurFilter1 = new InkPaint.filters.FXAAFilter();
var blurFilter2 = new InkPaint.filters.FXAAFilter();
littleDudes.filters = [blurFilter1];
littleRobot.filters = [blurFilter2];

var count = 0;
littleDudes.anchor.x = 0.5;
littleDudes.anchor.y = 0.5;
littleRobot.anchor.x = 0.5;
littleRobot.anchor.y = 0.5;

var ticker = new InkPaint.Ticker();
ticker.start();
ticker.add(function() {
    app.render();
    littleDudes.rotation += 0.005;
    littleRobot.rotation -= 0.01;
});
