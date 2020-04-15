const poets: string[] = [
  'William S.',
  'Friedrich S.',
  'Johann Wolfgang von G.',
  'Jane A.',
  'Berthold B.',
  'Charlotte B.',
  'Emily B.',
  'Charles B.',
  'Annette von D.-H.',
  'Gotthold Ephraim L.',
  'Edgar Allan P.',
  'Rainer Maria R.',
  'Walther von der V.'
];

function rand(n: number) {
  return Math.floor(Math.random() * n);
}

function chooseOne(arr: any[]) {
  if (!Array.isArray(arr) || arr.length === 0) {
    throw new Error('Invalid Array');
  }
  return arr[rand(arr.length)];
}

export function getDefaultPlayerName(): string {
  return chooseOne(poets);
}
