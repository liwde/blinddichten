const errorList = {
  'unknownError': {
    text: 'Ein unbekannter Fehler ist aufgetreten.'
  },
  'unhandledEvent': {
    silent: true
  },
  'gameNotFound': {
    text: 'Das angegebene Spiel wurde nicht gefunden.'
  },
  'wrongGamePhase': {
    text: 'Du bist in der falschen Spielphase für diese Aktion.',
    recoverable: true,
  },
  'nothingEntered': {
    text: 'Du solltest vielleicht etwas eingeben…',
    recoverable: true
  },
  'nextGameAlreadyStarted': {
    silent: true
  }
};

export default errorList;
