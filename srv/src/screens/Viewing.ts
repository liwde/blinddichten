import { WsServer } from '../servers/WsServer';
import { PersistenceApi } from '../persistence/API';

export class Viewing {
  constructor(private wsServer: WsServer, private persistenceApi: PersistenceApi) {}
}
