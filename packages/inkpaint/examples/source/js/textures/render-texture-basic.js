var app = new InkPaint.Application(800, 600, { backgroundColor: 0x008000 });
document.body.appendChild(app.view);

var container = new InkPaint.Container();
app.stage.addChild(container);

var texture = InkPaint.Texture.fromImage('source/assets/bunny.png');

for (var i = 0; i < 25; i++) {
    var bunny = new InkPaint.Sprite(texture);
    bunny.x = (i % 5) * 30;
    bunny.y = Math.floor(i / 5) * 30;
    bunny.rotation = Math.random() * (Math.PI * 2);
    container.addChild(bunny);
}

var brt = new InkPaint.BaseRenderTexture(300, 300, InkPaint.SCALE_MODES.LINEAR, 1);
var rt = new InkPaint.RenderTexture(brt);

var sprite = new InkPaint.Sprite(rt);

sprite.x = 450;
sprite.y = 60;
app.stage.addChild(sprite);

container.x = 100;
container.y = 60;

var ticker = new InkPaint.Ticker();
ticker.start();
ticker.add(function() {
    app.render();
   // app.renderer.render(container, rt);
});
