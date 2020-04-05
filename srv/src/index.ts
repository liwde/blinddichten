import { Server }  from './servers/Server';
import { UiServer } from './servers/UiServer';
import { WsServer } from './servers/WsServer';
import { Lobby } from './screens/Lobby';
import { PersistenceApi } from './persistence/API';
import { Writing } from './screens/Writing';
import { Viewing } from './screens/Viewing';

// home-brewed IoC
const server = new Server();
const uiServer = new UiServer(server);
const wsServer = new WsServer(server);

const persistenceApi = new PersistenceApi();

const lobby = new Lobby(wsServer, persistenceApi);
const writing = new Writing(wsServer, persistenceApi);
const viewing = new Viewing(wsServer, persistenceApi);

server.start();
