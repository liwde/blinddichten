export const UI_PATH = process.env.DB_UI_PATH || '../ui/public';
export const SERVER_PORT = parseInt(process.env.BD_SERVER_PORT, 10) || 5001;
export const HEARTBEAT_TIMEOUT = parseInt(process.env.BD_HEARTBEAT_TIMEOUT, 10) || 9 * 1000;
export const HEARTBEAT_INTERVAL = parseInt(process.env.BD_HEARTBEAT_INTERVAL, 10) || 3 * 1000;
export const CLOSE_EMPTY_GAME_TIMEOUT = parseInt(process.env.BD_CLOSE_EMPTY_GAME_TIMEOUT, 10) || 10 * 60 * 1000;
export const DEFAULT_NUM_ROUNDS = parseInt(process.env.BD_DEFAULT_NUM_ROUNDS, 10) || 1;
