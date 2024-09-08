export default class GraphicsData {
  constructor(
    lineWidth,
    lineColor,
    lineAlpha,
    fillColor,
    fillAlpha,
    fill,
    nativeLines,
    shape,
    lineAlignment
  ) {
    this.lineWidth = lineWidth;
    this.lineAlignment = lineAlignment;
    this.nativeLines = nativeLines;
    this.lineColor = lineColor;

    this.lineAlpha = lineAlpha;
    this._lineTint = lineColor;

    /**
     * the color of the fill
     * @member {number}
     */
    this.fillColor = fillColor;

    /**
     * the alpha of the fill
     * @member {number}
     */
    this.fillAlpha = fillAlpha;

    /**
     * cached tint of the fill
     * @member {number}
     * @private
     */
    this._fillTint = fillColor;

    /**
     * whether or not the shape is filled with a colour
     * @member {boolean}
     */
    this.fill = fill;

    this.holes = [];

    /**
     * The shape object to draw.
     * @member {InkPaint.Circle|InkPaint.Ellipse|InkPaint.Polygon|InkPaint.Rectangle|InkPaint.RoundedRectangle}
     */
    this.shape = shape;

    /**
     * The type of the shape, see the Const.Shapes file for all the existing types,
     * @member {number}
     */
    this.type = shape.type;
  }

  /**
   * Creates a new GraphicsData object with the same values as this one.
   *
   * @return {InkPaint.GraphicsData} Cloned GraphicsData object
   */
  clone() {
    return new GraphicsData(
      this.lineWidth,
      this.lineColor,
      this.lineAlpha,
      this.fillColor,
      this.fillAlpha,
      this.fill,
      this.nativeLines,
      this.shape,
      this.lineAlignment
    );
  }

  /**
   * Adds a hole to the shape.
   *
   * @param {InkPaint.Rectangle|InkPaint.Circle} shape - The shape of the hole.
   */
  addHole(shape) {
    this.holes.push(shape);
  }

  /**
   * Destroys the Graphics data.
   */
  destroy() {
    this.shape = null;
    this.holes = null;
  }
}
