// 外部公開関数
export function multiply(a, b) {
  return a * b;
}

export function carry(a, b) {
  return add(10 * a, b);
}

//内部関数
function add(a, b) {
  return a + b;
}

