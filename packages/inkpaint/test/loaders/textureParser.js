'use strict';

describe('InkPaint.loaders.textureParser', function ()
{
    it('should exist and return a function', function ()
    {
        expect(InkPaint.loaders.textureParser).to.be.a('function');
        expect(InkPaint.loaders.textureParser()).to.be.a('function');
    });

    it('should do nothing if the resource is not an image', function ()
    {
        const spy = sinon.spy();
        const res = {};

        InkPaint.loaders.textureParser()(res, spy);

        expect(spy).to.have.been.calledOnce;
        expect(res.texture).to.be.undefined;
    });

    it('should create a texture if resource is an image', function ()
    {
        const spy = sinon.spy();
        const res = createMockResource(InkPaint.loaders.Resource.TYPE.IMAGE, new Image());

        InkPaint.loaders.textureParser()(res, spy);

        expect(spy).to.have.been.calledOnce;
        expect(res.texture).to.be.an.instanceof(InkPaint.Texture);

        expect(InkPaint.utils.BaseTextureCache).to.have.property(res.name, res.texture.baseTexture);
        expect(InkPaint.utils.BaseTextureCache).to.have.property(res.url, res.texture.baseTexture);

        expect(InkPaint.utils.TextureCache).to.have.property(res.name, res.texture);
        expect(InkPaint.utils.TextureCache).to.have.property(res.url, res.texture);
    });
});

function createMockResource(type, data)
{
    const name = `${Math.floor(Date.now() * Math.random())}`;

    return {
        url: `http://localhost/doesnt_exist/${name}`,
        name,
        type,
        data,
    };
}
