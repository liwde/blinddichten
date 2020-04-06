export interface Player {
  publicPlayerId: string;
  privatePlayerId: string;
  gameId: string;
  name: string;
  isOwner: boolean;
  ready: boolean;
}
