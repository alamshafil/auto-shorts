'use strict';

describe('toGlobal', function ()
{
    it('should return correct global cordinates of a point from within a displayObject', function ()
    {
        const parent = new InkPaint.Container();

        const container = new InkPaint.Container();

        parent.addChild(container);

        const point = new InkPaint.Point(100, 100);

        let globalPoint = container.toGlobal(point);

        expect(globalPoint.x).to.equal(100);
        expect(globalPoint.y).to.equal(100);

        container.position.x = 20;
        container.position.y = 20;

        container.scale.x = 2;
        container.scale.y = 2;

        globalPoint = container.toGlobal(point);

        expect(globalPoint.x).to.equal(220);
        expect(globalPoint.y).to.equal(220);
    });
});
