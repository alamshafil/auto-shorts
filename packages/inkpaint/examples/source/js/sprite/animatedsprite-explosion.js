var app = new InkPaint.Application();
document.body.appendChild(app.view);

app.stop();

InkPaint.loader
    .add("spritesheet", "source/assets/spritesheet/mc.json")
    .load(onAssetsLoaded);

function onAssetsLoaded(loader, res) {
    var textures = [];
    var i;

    for (i = 0; i < 26; i++) {
        var texture = InkPaint.Texture.fromFrame(
            "Explosion_Sequence_A " + (i + 1) + ".png"
        );
        textures.push(texture);
    }

    for (i = 0; i < 3; i++) {
        var explosion = new InkPaint.AnimatedSprite(textures);

        explosion.x = Math.random() * app.screen.width;
        explosion.y = Math.random() * app.screen.height;
        explosion.anchor.set(0.5);
        explosion.rotation = Math.random() * Math.PI;
        explosion.scale.set(0.75 + Math.random() * 0.5);
        explosion.gotoAndPlay(Math.random() * 27);
        app.stage.addChild(explosion);
    }

    ticker.start();
}

var ticker = new InkPaint.Ticker();
ticker.add(function() {
    app.render();
});
