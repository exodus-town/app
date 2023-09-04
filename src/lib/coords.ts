export function toCoords(id: number): [number, number] {
  const dx = [1, 0, -1, 0];
  const dy = [0, 1, 0, -1];
  let x = 0;
  let y = 0;
  let turn = 0;
  let step = 0;
  let length = 1;
  let increase = false;
  while (step < id) {
    for (let i = 0; i < length; i++) {
      x += dx[turn % 4];
      y += dy[turn % 4];
      step++;
      if (step === id) break;
    }
    if (increase) {
      length++;
      increase = false;
    } else {
      increase = true;
    }
    turn++;
  }
  return [x, y];
}
