const KEY = 'lastGames';

export function getLastGames(n) {
  try {
    const lastGames = JSON.parse(window.localStorage.getItem(KEY)).map(g => { g.date = new Date(g.date); return g; });
    if (n) {
      return lastGames.sort((g1, g2) => g2.date - g1.date).slice(0, n);
    } else {
      return lastGames;
    }
  } catch(e) {
    return [];
  }
}

export function addNewGame(gameId, players) {
  const games = getLastGames();
  if (!games.find(g => g.gameId === gameId)) {
    games.push({
      gameId: gameId,
      date: new Date(),
      players,
      finished: false
    })
    window.localStorage.setItem(KEY, JSON.stringify(games));
  }
}

export function finishGame(gameId) {
  const games = getLastGames();
  games.find(g => g.gameId === gameId).finished = true;
  window.localStorage.setItem(KEY, JSON.stringify(games));
}

export function removeGame(gameId) {
  const games = getLastGames();
  games.splice(games.find(g => g.gameId === gameId), 1);
  window.localStorage.setItem(KEY, JSON.stringify(games));
}
