import { Server }  from './servers/Server';
import { UiServer } from './servers/UiServer';
import { WsServer } from './servers/WsServer';
import { Lobby } from './handlers/Lobby';
import { PersistenceApi } from './persistence/API';
import { Writing } from './handlers/Writing';
import { Viewing } from './handlers/Viewing';
import { GamePhaseHandler } from './handlers/GamePhases';

// home-brewed IoC
const server = new Server();
const uiServer = new UiServer(server);
const wsServer = new WsServer(server);

const persistenceApi = new PersistenceApi();
const gamePhaseHandler = new GamePhaseHandler(persistenceApi);

const lobby = new Lobby(wsServer, persistenceApi, gamePhaseHandler);
const writing = new Writing(wsServer, persistenceApi, gamePhaseHandler);
const viewing = new Viewing(wsServer, persistenceApi);

server.start();
