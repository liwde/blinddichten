export default class EventEmitter {
  constructor() {
    this.handlers = new Map();
  }

  on(eventName, handler) {
    let allHandlers = this.handlers.get(eventName);
    if (!allHandlers) {
      allHandlers = new Set();
      this.handlers.set(eventName, allHandlers);
    }
    allHandlers.add(handler);
  }

  off(eventName, handler) {
    let allHandlers = this.handlers.get(eventName);
    if (allHandlers) {
      allHandlers.delete(handler);
    }
  }

  emit(eventName, ...data) {
    let allHandlers = this.handlers.get(eventName);
    if (allHandlers) {
      allHandlers.forEach(handler => handler(...data));
    }
  }
}
