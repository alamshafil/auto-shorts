var app = new InkPaint.Application(800, 600, {
    backgroundColor: 0x1099bb
});

document.body.appendChild(app.view);

var container = new InkPaint.Container();
app.stage.addChild(container);

// Create a new texture
var texture = InkPaint.Texture.fromImage(paths("source/assets/bunny.png"));

// Create a 5x5 grid of bunnies
for (var i = 0; i < 25; i++) {
    var bunny = new InkPaint.Sprite(texture);
    bunny.anchor.set(0.5);
    bunny.x = (i % 5) * 40;
    bunny.y = Math.floor(i / 5) * 40;
    bunny.rotation = Math.random() * 3.14;
    bunny.speed = Math.random();
    container.addChild(bunny);
}

// Move container to the center
container.x = app.screen.width / 2;
container.y = app.screen.height / 2;

// Center bunny sprite in local container coordinates
container.pivot.x = container.width / 2;
container.pivot.y = container.height / 2;

// Listen for animate update
var ticker = new InkPaint.Ticker();
ticker.start();
ticker.add(function(delta) {
    app.render();
    container.rotation -= 0.01 * delta;

    for (var i = 0; i < container.children.length; i++) {
        var bunny = container.children[i];
        bunny.rotation -= 0.05 * bunny.speed;
    }
});

module.exports = app;
