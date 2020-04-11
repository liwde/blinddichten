export function rand(n) {
  return Math.floor(Math.random() * n);
}

export function chooseOne(arr) {
  if (!Array.isArray(arr) || arr.length === 0) {
    throw new Error('Invalid Array');
  }
  return arr[rand(arr.length)];
}
