import { WsPlayer } from "./servers/WsPlayer";

type Task<T> = () => Promise<T>

// Queueing Engine
class Queue {
  private queueTail: Promise<any> = Promise.resolve();
  executeQueued<T>(fn: Task<T>): Promise<T> {
    const awaitUpToNow = this.queueTail;
    const executionResult = awaitUpToNow.then(fn); // execute fn after the queue
    // tslint:disable-next-line: no-empty
    this.queueTail = executionResult.catch(() => {}); // new queue: execution result + catch errors
    return executionResult; // return execution result, errors uncaught
  }
}

const queues: Map<string, Queue> = new Map();

async function executeQueued<T>(key: string, fn: Task<T>): Promise<T> {
  let queue = queues.get(key);
  if (!queue) {
    queue = new Queue();
    queues.set(key, queue);
  }
  return queue.executeQueued(fn);
}


// Decorator
export function synchronize(on: (...args: any[]) => string) {
  return function synchronizeOn(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const queueName = on(args);
      if (queueName) {
        return executeQueued(on(args), () => originalMethod.apply(this, args));
      } else {
        return originalMethod.apply(this, args);
      }
    }
  }
}

export const synchronizePerGameId = synchronize((_ws, _msg, player: WsPlayer) => player?.gameId);
