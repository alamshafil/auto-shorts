var app = new InkPaint.Application();
document.body.appendChild(app.view);
var ctx, canvas;
var width = app.screen.width;
var height = app.screen.height;

ctx = createCanvas(400, 400);
var sprite = new InkPaint.Sprite();
sprite.anchor.set(0.5);
sprite.x = width / 2;
sprite.y = height / 2;
app.stage.addChild(sprite);

setTimeout(() => {
    var texture = InkPaint.Texture.fromCanvas(canvas);
    sprite.texture = texture;
    sprite.width = 200;
    sprite.height = 200;
}, 100);

var x = 0;
var ticker = new InkPaint.Ticker();
ticker.start();
ticker.add(function(delta) {
    app.render();
    drawBall((x += 0.5));
});

function createCanvas(width, height) {
    canvas = InkPaint.createCanvas();
    canvas.width = width;
    canvas.height = height;
    $(canvas).css({
        top: 0,
        left: 0,
        width: width,
        height: height,
        zIndex: 999,
        position: "absolute",
        border: "1px solid #32a1ce"
    });
    $("body").append(canvas);
    var ctx = canvas.getContext("2d");

    return ctx;
}

function drawBall(x) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.arc(x, 200, 100, 0, Math.PI * 2, true);
    ctx.fillStyle = "rgb(0, 0, 255)";
    ctx.fill();
}
