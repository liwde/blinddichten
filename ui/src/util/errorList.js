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
  'cantEnterGame': {
    text: 'Du kannst dem Spiel nicht mehr beitreten.'
  },
  'wrongGamePhase': {
    text: 'Du bist in der falschen Spielphase für diese Aktion.',
    recoverable: true,
  },
  'notInGame': {
    text: 'Du bist nicht Teil dieses Spiels.'
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
