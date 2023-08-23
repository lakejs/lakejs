import { debug } from '../utils/debug';

type CommandHandler = (...data: any[]) => void;

export class Commands {
  private commandMap: { [key: string]: CommandHandler };

  constructor() {
    this.commandMap = {};
  }

  public add(name: string, handler: CommandHandler) {
    this.commandMap[name] = handler;
    debug(`Command '${name}' is added.`);
  }

  public run(name: string, ...data: any[]) {
    const handler = this.commandMap[name];
    if (!handler) {
      throw new Error(`Handler '${name}' doesn't exist.`);
    }
    handler.apply(this, data);
  }
}
