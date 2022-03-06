//TODO:把这些工具函数挂载到 fabric.util 上去，而不是暴露到全局空间
/**
 * 一组三角函数工具
 */
/**
 * @method sinx
 * @param {*} x x position
 * @param {*} y y position
 */
export function sinx(x, y) {
  return y / Math.sqrt(x * x + y * y);
}

/**
 * @method asinx
 * @param {*} x x position
 * @param {*} y y position
 */
export function asinx(x, y) {
  let sin = sinx(x, y);
  return Math.asin(sin);
}

/**
 * @method cosx
 * @param {*} x x position
 * @param {*} y y position
 */
export function cosx(x, y) {
  return x / Math.sqrt(x * x + y * y);
}

/**
 * @method atanx
 * @param {*} x x position
 * @param {*} y y position
 */
export function atanx(x, y) {
  return Math.atan(y / x);
}
