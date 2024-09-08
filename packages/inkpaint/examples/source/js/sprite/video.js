var app = new InkPaint.Application(800, 600, { transparent: true });
document.body.appendChild(app.view);

// Create play button that can be used to trigger the video
var button = new InkPaint.Graphics()
    .beginFill(0x0, 0.5)
    .drawRoundedRect(0, 0, 100, 100, 10)
    .endFill()
    .beginFill(0xffffff)
    .moveTo(36, 30)
    .lineTo(36, 70)
    .lineTo(70, 50);

// Position the button
button.x = (app.screen.width - button.width) / 2;
button.y = (app.screen.height - button.height) / 2;

// Enable interactivity on the button
button.interactive = true;
button.buttonMode = true;

// Add to the stage
app.stage.addChild(button);
app.view.addEventListener("mousedown", onPlayVideo);

function onPlayVideo() {
    button.destroy();
    app.view.removeEventListener("mousedown", onPlayVideo);

    var texture = InkPaint.Texture.fromVideo("source/assets/video.mp4");
    texture.baseTexture.mipmap = false;
    var videoSprite = new InkPaint.Sprite(texture);
    videoSprite.width = app.screen.width;
    videoSprite.height = app.screen.height;
    app.stage.addChild(videoSprite);
}
