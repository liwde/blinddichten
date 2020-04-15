import express from 'express';
import { SERVER_PORT } from '../config';

export class Server {
  public app: express.Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = SERVER_PORT;
  }

  public start() {
    this.app.listen(this.port, () => {
      console.log(`server started at http://localhost:${this.port}`);
    });
  }
}
