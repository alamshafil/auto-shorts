export default class TickerListener {
  constructor(fn, context = null, priority = 0, once = false) {
    this.fn = fn;
    this.context = context;
    this.priority = priority;
    this.once = once;
    this.next = null;
    this.previous = null;

    this.destroyed = false;
  }

  match(fn, context) {
    context = context || null;

    return this.fn === fn && this.context === context;
  }

  emit(deltaTime) {
    if (this.fn) {
      if (this.context) {
        this.fn.call(this.context, deltaTime);
      } else {
        this.fn(deltaTime);
      }
    }

    const redirect = this.next;

    if (this.once) {
      this.destroy(true);
    }

    if (this.destroyed) {
      this.next = null;
    }

    return redirect;
  }

  connect(previous) {
    this.previous = previous;
    if (previous.next) {
      previous.next.previous = this;
    }
    this.next = previous.next;
    previous.next = this;
  }

  destroy(hard = false) {
    if (this.destroyed) return;

    this.destroyed = true;
    this.fn = null;
    this.context = null;

    // Disconnect, hook up next and previous
    if (this.previous) {
      this.previous.next = this.next;
    }

    if (this.next) {
      this.next.previous = this.previous;
    }

    // Redirect to the next item
    const redirect = this.next;

    // Remove references
    this.next = hard ? null : redirect;
    this.previous = null;

    return redirect;
  }
}
