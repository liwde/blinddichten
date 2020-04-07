import { Server }  from './servers/Server';
import { UiServer } from './servers/UiServer';
import { WsServer } from './servers/WsServer';
import { Lobby } from './handlers/Lobby';
import { InMemoryPersistence } from './persistence/InMemoryPersistence';
import { Writing } from './handlers/Writing';
import { Viewing } from './handlers/Viewing';
import { GamePhaseHandler } from './handlers/GamePhases';

// home-brewed IoC
const server = new Server();
const uiServer = new UiServer(server);
const wsServer = new WsServer(server);

const persistenceApi = new InMemoryPersistence();
const gamePhaseHandler = new GamePhaseHandler(wsServer, persistenceApi);

const lobby = new Lobby(wsServer, persistenceApi, gamePhaseHandler);
const writing = new Writing(wsServer, persistenceApi, gamePhaseHandler);
const viewing = new Viewing(wsServer, persistenceApi, gamePhaseHandler);

server.start();
