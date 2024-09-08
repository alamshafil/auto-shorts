var app = new InkPaint.Application(800, 600, {
    backgroundColor: 0x1099bb,
    useGL: true
});

document.body.appendChild(app.view);
var container = new InkPaint.Container();

// Create a new texture
var base64 =
    "data:image/jpg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAgMDAwMDBAcFBAQEBAkGBwUHCgkLCwoJCgoMDREODAwQDAoKDhQPEBESExMTCw4UFhQSFhESExL/2wBDAQMDAwQEBAgFBQgSDAoMEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhL/wgARCAACAAIDAREAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACP/EABUBAQEAAAAAAAAAAAAAAAAAAAcJ/9oADAMBAAIQAxAAAAA6BlU//8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPwB//8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAgEBPwB//8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAwEBPwB//9k=";
var texture1 = InkPaint.Texture.fromImage("source/assets/bunny.png");
var texture2 = InkPaint.Texture.fromImage("source/assets/bg_rotate2.jpg");
var texture2 = InkPaint.Texture.fromImage(base64);

var bg = new InkPaint.Sprite();

bg.anchor.set(0.5);
bg.width = 300;
bg.height = 300;

bg.x = app.screen.width / 2;
bg.y = app.screen.height / 2;
bg.texture = texture2;
app.stage.addChild(bg);
app.stage.addChild(container);

// Create a 5x5 grid of bunnies
for (var i = 0; i < 25; i++) {
    var bunny = new InkPaint.Sprite(texture1);
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
