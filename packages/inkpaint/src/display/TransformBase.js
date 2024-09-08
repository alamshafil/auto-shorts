import { Matrix } from "../math";

export default class TransformBase {
  constructor() {
    this.worldTransform = new Matrix();
    this.localTransform = new Matrix();

    this._worldID = 0;
    this._parentID = 0;
  }

  updateLocalTransform() {
    // empty
  }

  updateTransform(parentTransform) {
    const pt = parentTransform.worldTransform;
    const wt = this.worldTransform;
    const lt = this.localTransform;

    // concat the parent matrix with the objects transform.
    wt.a = lt.a * pt.a + lt.b * pt.c;
    wt.b = lt.a * pt.b + lt.b * pt.d;
    wt.c = lt.c * pt.a + lt.d * pt.c;
    wt.d = lt.c * pt.b + lt.d * pt.d;
    wt.tx = lt.tx * pt.a + lt.ty * pt.c + pt.tx;
    wt.ty = lt.tx * pt.b + lt.ty * pt.d + pt.ty;

    this._worldID++;
  }
}

TransformBase.prototype.updateWorldTransform =
  TransformBase.prototype.updateTransform;

TransformBase.IDENTITY = new TransformBase();
