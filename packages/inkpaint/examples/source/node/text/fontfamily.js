var app = new InkPaint.Application(800, 600, {
    backgroundColor: 0x1099bb
});
document.body.appendChild(app.view);
module.exports = app;

const font1 = paths("source/assets/font/font.ttf");
const font2 = paths("source/assets/font/font2.ttf");
InkPaint.registerFont(font1, { family: "font1" });
InkPaint.registerFont(font2, { family: "font2" });

var basicText = new InkPaint.Text("Basic 你好 text in pixi");
basicText.x = 50;
basicText.y = 100;
app.stage.addChild(basicText);

var text = new InkPaint.Text("Basic text in 你好  pixi");
text.updateStyle({
    fill: "#ffffff",
    backgroundColor: "#ff0000",
    padding: 10,
    fontFamily: "font1"
});
text.x = 250;
text.y = 200;
app.stage.addChild(text);

var text = new InkPaint.Text("你好周杰伦! 哈哈");
text.updateStyle({
    fill: "#ffffff",
    backgroundColor: "#00eeee",
    padding: 10,
    fontFamily: "font2"
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

app.stage.addChild(richText);
app.render();
