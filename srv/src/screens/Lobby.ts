import { WsServer } from '../servers/WsServer';
import { PersistenceApi } from '../persistence/API';

export class Lobby {
  constructor(private wsServer: WsServer, private persistenceApi: PersistenceApi) {}
}
