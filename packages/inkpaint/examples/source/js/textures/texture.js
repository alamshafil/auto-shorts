var app = new InkPaint.Application();
document.body.appendChild(app.view);

var base = InkPaint.BaseTexture.fromImage("source/assets/flowerTop.png");
var frame = new InkPaint.Rectangle(0, 0, 100, 100);
var orig = new InkPaint.Rectangle(0, 0, 119, 181);
var trim = new InkPaint.Rectangle(0, 0, 300, 300);
var texture = new InkPaint.Texture(base, frame, orig);
var width = app.screen.width;
var height = app.screen.height;

var graphics = new InkPaint.Graphics();
graphics.beginFill(0xde3249);
graphics.drawRect(width / 2 - 50, height / 2 - 50, 100, 100);
graphics.endFill();

var dude1 = new InkPaint.Sprite(texture);
dude1.anchor.set(0.5);
dude1.x = width / 2;
dude1.y = height / 2;

var dude2 = new InkPaint.Sprite(
    InkPaint.Texture.fromImage("source/assets/flowerTop.png")
);
dude2.anchor.set(0.5);
dude2.x = width / 2 + 150;
dude2.y = height / 2;

app.stage.addChild(graphics);
app.stage.addChild(dude1);
//app.stage.addChild(dude2);

var ticker = new InkPaint.Ticker();
ticker.start();
ticker.add(function(delta) {
    app.render();
});
