var app = new InkPaint.Application();
document.body.appendChild(app.view);

module.exports = app;

InkPaint.loader
    .add(paths("source/assets/spritesheet/fighter.json"))
    .load(onAssetsLoaded);

function onAssetsLoaded() {
    // create an array of textures from an image path
    var frames = [];

    for (var i = 0; i < 30; i++) {
        var val = i < 10 ? "0" + i : i;
        frames.push(InkPaint.Texture.fromFrame("rollSequence00" + val + ".png"));
    }

    // create an AnimatedSprite (brings back memories from the days of Flash, right ?)
    var anim = new InkPaint.AnimatedSprite(frames);

    anim.x = app.screen.width / 2;
    anim.y = app.screen.height / 2;
    anim.anchor.set(0.5);
    anim.animationSpeed = 0.5;
    anim.play();

    app.stage.addChild(anim);

    // Animate the rotation
    var ticker = new InkPaint.Ticker();
    ticker.start();
    ticker.add(function() {
        app.render();
        anim.rotation += 0.01;
    });
}
