var app = new InkPaint.Application();
document.body.appendChild(app.view);

module.exports = app;


app.stage.interactive = true;

var bg = InkPaint.Sprite.fromImage(paths('source/assets/bg_plane.jpg'));

app.stage.addChild(bg);

var cells = InkPaint.Sprite.fromImage(paths('source/assets/cells.png'));

cells.scale.set(1.5);

var mask = InkPaint.Sprite.fromImage(paths('source/assets/flowerTop.png'));
mask.anchor.set(0.5);
mask.x = 310;
mask.y = 190;

cells.mask = mask;

app.stage.addChild(mask, cells);

var target = new InkPaint.Point();

reset();

function reset() {
    target.x = Math.floor(Math.random() * 550);
    target.y = Math.floor(Math.random() * 300);
}

var ticker = new InkPaint.Ticker();
ticker.start();
ticker.add(function() {
    app.render();
    mask.x += (target.x - mask.x) * 0.1;
    mask.y += (target.y - mask.y) * 0.1;

    if (Math.abs(mask.x - target.x) < 1) {
        reset();
    }
});
