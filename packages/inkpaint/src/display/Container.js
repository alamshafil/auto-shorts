import { removeItems } from "../utils";
import DisplayObject from "./DisplayObject";

export default class Container extends DisplayObject {
  constructor() {
    super();
    this.children = [];
  }

  onChildrenChange() {
    /* empty */
  }

  addChild(child) {
    const argumentsLength = arguments.length;

    if (argumentsLength > 1) {
      for (let i = 0; i < argumentsLength; i++) {
        this.addChild(arguments[i]);
      }
    } else {
      if (child.parent) {
        child.parent.removeChild(child);
      }

      child.parent = this;
      child.transform._parentID = -1;
      this.children.push(child);
      this._boundsID++;

      this.onChildrenChange(this.children.length - 1);
      child.emit("added", this);
    }

    return child;
  }

  addChildAt(child, index) {
    if (index < 0 || index > this.children.length) {
      throw new Error(
        `${child}addChildAt: The index ${index} supplied is out of bounds ${this.children.length}`
      );
    }

    if (child.parent) {
      child.parent.removeChild(child);
    }

    child.parent = this;
    child.transform._parentID = -1;

    this.children.splice(index, 0, child);
    this._boundsID++;
    this.onChildrenChange(index);
    child.emit("added", this);

    return child;
  }

  swapChildren(child, child2) {
    if (child === child2) {
      return;
    }

    const index1 = this.getChildIndex(child);
    const index2 = this.getChildIndex(child2);

    this.children[index1] = child2;
    this.children[index2] = child;
    this.onChildrenChange(index1 < index2 ? index1 : index2);
  }

  getChildIndex(child) {
    const index = this.children.indexOf(child);

    if (index === -1) {
      throw new Error(
        "The supplied DisplayObject must be a child of the caller"
      );
    }

    return index;
  }

  setChildIndex(child, index) {
    if (index < 0 || index >= this.children.length) {
      throw new Error(
        `The index ${index} supplied is out of bounds ${this.children.length}`
      );
    }

    const currentIndex = this.getChildIndex(child);

    removeItems(this.children, currentIndex, 1); // remove from old position
    this.children.splice(index, 0, child); // add at new position
    this.onChildrenChange(index);
  }

  getChildAt(index) {
    if (index < 0 || index >= this.children.length) {
      throw new Error(`getChildAt: Index (${index}) does not exist.`);
    }
    return this.children[index];
  }

  removeChild(child) {
    const argumentsLength = arguments.length;

    if (argumentsLength > 1) {
      for (let i = 0; i < argumentsLength; i++) {
        this.removeChild(arguments[i]);
      }
    } else {
      const index = this.children.indexOf(child);

      if (index === -1) return null;

      child.parent = null;
      // ensure child transform will be recalculated
      child.transform._parentID = -1;
      removeItems(this.children, index, 1);
      this._boundsID++;
      this.onChildrenChange(index);
      child.emit("removed", this);
    }

    return child;
  }

  removeChildAt(index) {
    const child = this.getChildAt(index);
    child.parent = null;
    child.transform._parentID = -1;
    removeItems(this.children, index, 1);
    this._boundsID++;
    this.onChildrenChange(index);
    child.emit("removed", this);

    return child;
  }

  removeChildren(beginIndex = 0, endIndex) {
    const begin = beginIndex;
    const end = typeof endIndex === "number" ? endIndex : this.children.length;
    const range = end - begin;
    let removed;

    if (range > 0 && range <= end) {
      removed = this.children.splice(begin, range);

      for (let i = 0; i < removed.length; ++i) {
        removed[i].parent = null;
        if (removed[i].transform) {
          removed[i].transform._parentID = -1;
        }
      }

      this._boundsID++;
      this.onChildrenChange(beginIndex);

      for (let i = 0; i < removed.length; ++i) {
        removed[i].emit("removed", this);
      }

      return removed;
    } else if (range === 0 && this.children.length === 0) {
      return [];
    }

    throw new RangeError(
      "removeChildren: numeric values are outside the acceptable range."
    );
  }

  removeAllChildren() {
    for (let i = this.children.length - 1; i >= 0; i--) {
      this.removeChild(this.children[i]);
    }
  }

  updateTransform() {
    this._boundsID++;
    this.transform.updateTransform(this.parent.transform);
    this.worldAlpha = this.alpha * this.parent.worldAlpha;

    for (let i = 0, j = this.children.length; i < j; ++i) {
      const child = this.children[i];

      if (child.visible) {
        child.updateTransform();
      }
    }
  }

  calculateBounds() {
    this._bounds.clear();
    this._calculateBounds();

    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      if (!child.visible || !child.renderable) {
        continue;
      }

      child.calculateBounds();
      if (child._mask) {
        child._mask.calculateBounds();
        this._bounds.addBoundsMask(child._bounds, child._mask._bounds);
      } else if (child.filterArea) {
        this._bounds.addBoundsArea(child._bounds, child.filterArea);
      } else {
        this._bounds.addBounds(child._bounds);
      }
    }

    this._lastBoundsID = this._boundsID;
  }

  _calculateBounds() {
    // FILL IN//
  }

  renderWebGL(renderer) {
    if (!this.visible || this.worldAlpha <= 0 || !this.renderable) return;

    if (this._mask || this.hasFilters()) {
      this._renderAdvancedWebGL(renderer);
    } else {
      this._renderWebGL(renderer);

      let i, j;
      for (i = 0, j = this.children.length; i < j; ++i) {
        this.children[i].renderWebGL(renderer);
      }
    }
  }

  _renderAdvancedWebGL(renderer) {
    renderer.flush();

    const filters = this.filters;
    const mask = this._mask;

    if (filters) {
      if (!this._enabledFilters) {
        this._enabledFilters = [];
      }

      this._enabledFilters.length = 0;

      for (let i = 0; i < filters.length; i++) {
        if (filters[i].enabled) {
          this._enabledFilters.push(filters[i]);
        }
      }

      if (this._enabledFilters.length) {
        renderer.filterManager.pushFilter(this, this._enabledFilters);
      }
    }

    if (mask) {
      renderer.maskManager.pushMask(this, this._mask);
    }

    this._renderWebGL(renderer);
    for (let i = 0, j = this.children.length; i < j; i++) {
      this.children[i].renderWebGL(renderer);
    }

    renderer.flush();

    if (mask) {
      renderer.maskManager.popMask(this, this._mask);
    }

    if (filters && this._enabledFilters && this._enabledFilters.length) {
      renderer.filterManager.popFilter();
    }
  }

  _renderWebGL(renderer) {
    // this is where content itself gets rendered...
  }

  _renderCanvas(renderer) {
    // this is where content itself gets rendered...
  }

  renderCanvas(renderer) {
    // if not visible or the alpha is 0 then no need to render this
    if (!this.visible || this.worldAlpha <= 0 || !this.renderable) {
      return;
    }

    if (this._mask) {
      renderer.maskManager.pushMask(this._mask);
    }

    this._renderCanvas(renderer);
    for (let i = 0, j = this.children.length; i < j; ++i) {
      this.children[i].renderCanvas(renderer);
    }

    if (this._mask) {
      renderer.maskManager.popMask(renderer);
    }
  }

  destroy(options) {
    if (this.destroyed) return;

    super.destroy();
    const destroyChildren =
      typeof options === "boolean" ? options : options && options.children;
    const oldChildren = this.removeChildren(0, this.children.length);

    if (destroyChildren) {
      for (let i = 0; i < oldChildren.length; ++i) {
        oldChildren[i].destroy(options);
      }
    }
  }

  destroyChildren(options) {
    const oldChildren = this.removeChildren(0, this.children.length);
    for (let i = 0; i < oldChildren.length; ++i) {
      oldChildren[i].destroy(options);
    }
  }

  get width() {
    return this.scale.x * this.getLocalBounds().width;
  }

  set width(value) {
    const width = this.getLocalBounds().width;

    if (width !== 0) {
      this.scale.x = value / width;
    } else {
      this.scale.x = 1;
    }

    this._width = value;
  }

  get height() {
    return this.scale.y * this.getLocalBounds().height;
  }

  set height(value) {
    const height = this.getLocalBounds().height;

    if (height !== 0) {
      this.scale.y = value / height;
    } else {
      this.scale.y = 1;
    }

    this._height = value;
  }
}

// performance increase to avoid using call.. (10x faster)
Container.prototype.containerUpdateTransform =
  Container.prototype.updateTransform;
