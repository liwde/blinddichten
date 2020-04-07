export interface Player {
  privatePlayerId: string; // key
  publicPlayerId: string;
  gameId: string;
  name: string;
  isOwner: boolean;
  ready: boolean;
}
