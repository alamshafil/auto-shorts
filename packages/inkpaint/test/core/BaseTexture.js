'use strict';

const URL = 'foo.png';
const NAME = 'foo';
const NAME2 = 'bar';

function cleanCache()
{
    delete InkPaint.utils.BaseTextureCache[URL];
    delete InkPaint.utils.BaseTextureCache[NAME];
    delete InkPaint.utils.BaseTextureCache[NAME2];

    delete InkPaint.utils.TextureCache[URL];
    delete InkPaint.utils.TextureCache[NAME];
    delete InkPaint.utils.TextureCache[NAME2];
}

describe('BaseTexture', function ()
{
    describe('updateImageType', function ()
    {
        it('should allow no extension', function ()
        {
            cleanCache();

            const baseTexture = new InkPaint.BaseTexture();

            baseTexture.imageUrl = 'http://some.domain.org/100/100';
            baseTexture._updateImageType();

            expect(baseTexture.imageType).to.be.equals('png');
        });
    });

    it('should remove Canvas BaseTexture from cache on destroy', function ()
    {
        cleanCache();

        const canvas = document.createElement('canvas');
        const baseTexture = InkPaint.BaseTexture.fromCanvas(canvas);
        const _pixiId = canvas._pixiId;

        expect(baseTexture.textureCacheIds.indexOf(_pixiId)).to.equal(0);
        expect(InkPaint.utils.BaseTextureCache[_pixiId]).to.equal(baseTexture);
        baseTexture.destroy();
        expect(baseTexture.textureCacheIds).to.equal(null);
        expect(InkPaint.utils.BaseTextureCache[_pixiId]).to.equal(undefined);
    });

    it('should remove Image BaseTexture from cache on destroy', function ()
    {
        cleanCache();

        const image = new Image();

        const texture = InkPaint.Texture.fromLoader(image, URL, NAME);

        expect(texture.baseTexture.textureCacheIds.indexOf(NAME)).to.equal(0);
        expect(texture.baseTexture.textureCacheIds.indexOf(URL)).to.equal(1);
        expect(InkPaint.utils.BaseTextureCache[NAME]).to.equal(texture.baseTexture);
        texture.destroy(true);
        expect(texture.baseTexture).to.equal(null);
        expect(InkPaint.utils.BaseTextureCache[NAME]).to.equal(undefined);
        expect(InkPaint.utils.BaseTextureCache[URL]).to.equal(undefined);
    });

    it('should remove BaseTexture from entire cache using removeFromCache (by BaseTexture instance)', function ()
    {
        cleanCache();

        const baseTexture = new InkPaint.BaseTexture();

        InkPaint.BaseTexture.addToCache(baseTexture, NAME);
        InkPaint.BaseTexture.addToCache(baseTexture, NAME2);
        expect(baseTexture.textureCacheIds.indexOf(NAME)).to.equal(0);
        expect(baseTexture.textureCacheIds.indexOf(NAME2)).to.equal(1);
        expect(InkPaint.utils.BaseTextureCache[NAME]).to.equal(baseTexture);
        expect(InkPaint.utils.BaseTextureCache[NAME2]).to.equal(baseTexture);
        InkPaint.BaseTexture.removeFromCache(baseTexture);
        expect(baseTexture.textureCacheIds.indexOf(NAME)).to.equal(-1);
        expect(baseTexture.textureCacheIds.indexOf(NAME2)).to.equal(-1);
        expect(InkPaint.utils.BaseTextureCache[NAME]).to.equal(undefined);
        expect(InkPaint.utils.BaseTextureCache[NAME2]).to.equal(undefined);
    });

    it('should remove BaseTexture from single cache entry using removeFromCache (by id)', function ()
    {
        cleanCache();

        const baseTexture = new InkPaint.BaseTexture();

        InkPaint.BaseTexture.addToCache(baseTexture, NAME);
        InkPaint.BaseTexture.addToCache(baseTexture, NAME2);
        expect(baseTexture.textureCacheIds.indexOf(NAME)).to.equal(0);
        expect(baseTexture.textureCacheIds.indexOf(NAME2)).to.equal(1);
        expect(InkPaint.utils.BaseTextureCache[NAME]).to.equal(baseTexture);
        expect(InkPaint.utils.BaseTextureCache[NAME2]).to.equal(baseTexture);
        InkPaint.BaseTexture.removeFromCache(NAME);
        expect(baseTexture.textureCacheIds.indexOf(NAME)).to.equal(-1);
        expect(baseTexture.textureCacheIds.indexOf(NAME2)).to.equal(0);
        expect(InkPaint.utils.BaseTextureCache[NAME]).to.equal(undefined);
        expect(InkPaint.utils.BaseTextureCache[NAME2]).to.equal(baseTexture);
    });

    it('should not throw an error destroying a destroyed BaseTexture', function ()
    {
        const baseTexture = new InkPaint.BaseTexture();

        baseTexture.destroy();
        baseTexture.destroy();
    });

    it('should set source.crossOrigin to anonymous if explicitly set', function ()
    {
        cleanCache();

        const baseTexture = InkPaint.BaseTexture.fromImage(URL, true);

        expect(baseTexture.source.crossOrigin).to.equal('anonymous');
    });
});
