import express from 'express';
import { SERVER_PORT } from '../config';

export class Server {
  public app: express.Application;

  constructor() {
    this.app = express();
  }

  public start() {
    this.app.listen(SERVER_PORT, () => {
      console.log(`server started at http://localhost:${SERVER_PORT}`);
    });
  }
}
