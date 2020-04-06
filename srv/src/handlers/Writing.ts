import * as WebSocket from 'ws';
import { WsServer, PromisedWsHandlerFnReturn } from '../servers/WsServer';
import { PersistenceApi } from '../persistence/API';
import { GamePhaseHandler, GamePhases } from './GamePhases';
import { ClientMessage, Actions, Events, Errors, ReadyWritingMessage, WritingUpdatedMessage, WritingCompletedMessage } from '../Messages';
import { WsPlayer } from '../servers/WsPlayer';
import { synchronizePerGameId } from '../AsyncUtils';

export class Writing {
  constructor(private wsServer: WsServer, private persistenceApi: PersistenceApi, private gamePhaseHandler: GamePhaseHandler) {
    this.wsServer.on(Actions.READY_WRITING, this.onReadyWriting.bind(this));
    this.wsServer.on(Actions.UNREADY_WRITING, this.onUnreadyWriting.bind(this));
  }

  @synchronizePerGameId
  private async onReadyWriting(ws: WebSocket, msg: ReadyWritingMessage, player: WsPlayer): PromisedWsHandlerFnReturn {
    if (!this.gamePhaseHandler.isInPhase(GamePhases.LOBBY, player.gameId)) {
      this.wsServer.sendMessage(ws, {
        type: Events.ERROR_OCCURRED,
        msg: Errors.WRONG_GAME_PHASE
      });
      return;
    }
    // TODO add message to database
    // TODO mark player ready
    // TODO get all players' status
    const players = [
      { publicPlayerId: player.publicPlayerId, name: 'Lukas', ready: true }
    ];
    // END TODO

    this.wsServer.broadcastMessage(player.gameId, {
      type: Events.WRITING_UPDATED,
      players
    } as WritingUpdatedMessage);

    // TODO: Check: Everybody ready?
    if (players.every(p => p.ready)) {
      // TODO: Check: Last round finished
      if (false) {
        // TODO: get all poems as texts
        const poems = {
          [player.publicPlayerId]: {
            title: 'Ein Gedicht',
            text: 'Es war einmal in dunkler Nacht'
          }
        };
        // END TODO
        this.wsServer.broadcastMessage(player.gameId, {
          type: Events.WRITING_COMPLETED,
          poems
        } as WritingCompletedMessage);
      } else {
        // TODO: get all the poems' titles + lastVerses
        const poemsData = {
          [player.privatePlayerId]: {
            title: 'Ein Gedicht',
            lastVerse: 'Es war einmal in dunkler Nacht'
          }
        };
        // END TODO

        this.wsServer.getPlayers(player.gameId).forEach(p => {
          this.wsServer.sendMessage(p.ws, {
            type: Events.WRITING_NEXT,
            title: poemsData[p.privatePlayerId].title,
            lastVerse: poemsData[p.privatePlayerId].title
          });
        });
      }
    }
  }

  @synchronizePerGameId
  private async onUnreadyWriting(ws: WebSocket, msg: ClientMessage, player: WsPlayer): PromisedWsHandlerFnReturn {
    if (!this.gamePhaseHandler.isInPhase(GamePhases.LOBBY, player.gameId)) {
      this.wsServer.sendMessage(ws, {
        type: Events.ERROR_OCCURRED,
        msg: Errors.WRONG_GAME_PHASE
      });
      return;
    }

    // TODO mark player unready
    // TODO get all players' status
    const players = [
      { publicPlayerId: player.publicPlayerId, name: 'Lukas', ready: false }
    ];
    // END TODO

    this.wsServer.broadcastMessage(player.gameId, {
      type: Events.WRITING_UPDATED,
      players
    } as WritingUpdatedMessage);
  }
}
