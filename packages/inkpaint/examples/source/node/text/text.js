var app = new InkPaint.Application(800, 600, {
    // useGL: true,
    backgroundColor: 0x1099bb
});
document.body.appendChild(app.view);

module.exports = app;

var basicText = new InkPaint.Text("abcde 没有字体");
basicText.x = 50;
basicText.y = 100;
var index = 0;
var id = setInterval(() => {
    console.log(basicText.font);
    if (index++ >= 20) clearInterval(id);
}, 1000 / 30);
app.stage.addChild(basicText);

var text = new InkPaint.Text("Basic text周杰伦 in pixi没有字体");
text.updateStyle({
    fill: "#ffffff",
    backgroundColor: "#ff0000",
    padding: 10
});
text.x = 250;
text.y = 200;
app.stage.addChild(text);

var logo = InkPaint.Sprite.fromImage(paths("source/assets/logo/logo2.png"));
logo.x = 400;
logo.y = 50;
logo.anchor.set(0.5);
logo.scale.set(0.5);
app.stage.addChild(logo);

var bunny = InkPaint.Sprite.fromImage(paths("source/assets/eggHead.png"));
bunny.x = 500;
bunny.y = 400;
app.stage.addChild(bunny);

var text = new InkPaint.Text("你好周杰伦! 哈哈");
text.updateStyle({
    fill: "#ffffff",
    backgroundColor: "#00eeee",
    padding: 10
});
text.x = 450;
text.y = 300;
app.stage.addChild(text);

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
    wordWrapWidth: 420
});

var richText = new InkPaint.Text(
    "FFCreator文字多行的示例，FFCreator文字多行的示例，FFCreator文字多行的示例，FFCreator文字多行的示例，FFCreator文字多行的示例，FFCreator文字多行的示例，FFCreator文字多行的示例。",
    style
);
richText.x = 50;
richText.y = 250;

app.stage.addChild(richText);
app.render();
