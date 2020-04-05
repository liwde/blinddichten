import { WsServer } from '../servers/WsServer';
import { PersistenceApi } from '../persistence/API';

export class Writing {
  constructor(private wsServer: WsServer, private persistenceApi: PersistenceApi) {}
}
