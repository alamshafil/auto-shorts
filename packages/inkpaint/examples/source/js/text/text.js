var app = new InkPaint.Application(800, 600, {
    backgroundColor: 0x1099bb,
    preserveDrawingBuffer: true
});
document.body.appendChild(app.view);

var basicText = new InkPaint.Text("Basic 没有字体 text in pixi");
basicText.x = 50;
basicText.y = 100;
app.stage.addChild(basicText);

var text = new InkPaint.Text("Basic text in 没有字体 pixi");
text.updateStyle({
    fill: "#ffffff",
    backgroundColor: "#ff0000",
    padding: 10
});
text.x = 250;
text.y = 200;
app.stage.addChild(text);

var text1 = new InkPaint.Text("你好周杰伦! 哈哈");
text1.updateStyle({
    fill: "#ffffff",
    backgroundColor: "#00eeee",
    padding: 10
});
text1.x = 450;
text1.y = 300;
app.stage.addChild(text1);

var bunny = InkPaint.Sprite.fromImage("source/assets/eggHead.png");
bunny.x = 500;
bunny.y = 400;
app.stage.addChild(bunny);

var style = new InkPaint.TextStyle({
    fontFamily: "Arial",
    fontSize: 36,
    fontStyle: "italic",
    fontWeight: "bold",
    fill: ["#ffffff", "#00ff99"], // gradient
    stroke: "#4a1850",
    strokeThickness: 5,
    dropShadow: true,
    dropShadowColor: "#000000",
    dropShadowBlur: 4,
    dropShadowAngle: Math.PI / 6,
    dropShadowDistance: 6,
    wordWrap: true,
    wordWrapWidth: 440
});

var richText = new InkPaint.Text(
    "FFCreator文字多行的示例，FFCreator文字多行的示例，FFCreator文字多行的示例，FFCreator文字多行的示例，FFCreator文字多行的示例，FFCreator文字多行的示例，FFCreator文字多行的示例。",
    style
);
richText.x = 50;
richText.y = 350;

app.stage.addChild(richText);

var length = 10;
var ticker = new InkPaint.Ticker();
ticker.start();
ticker.add(function() {
    app.render();

    length -= 0.1;
    if (length <= -5) length = 10;
    text1.text = "你好周杰伦! 哈哈".substr(0, Math.max(0, length) >> 0);
});
