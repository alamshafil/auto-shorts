'use strict';

describe('InkPaint.prepare.CountLimiter', function ()
{
    it('should limit to specified number per beginFrame()', function ()
    {
        const limit = new InkPaint.prepare.CountLimiter(3);

        limit.beginFrame();
        expect(limit.allowedToUpload()).to.be.true;
        expect(limit.allowedToUpload()).to.be.true;
        expect(limit.allowedToUpload()).to.be.true;
        expect(limit.allowedToUpload()).to.be.false;

        limit.beginFrame();
        expect(limit.allowedToUpload()).to.be.true;
        expect(limit.allowedToUpload()).to.be.true;
        expect(limit.allowedToUpload()).to.be.true;
        expect(limit.allowedToUpload()).to.be.false;
    });
});
