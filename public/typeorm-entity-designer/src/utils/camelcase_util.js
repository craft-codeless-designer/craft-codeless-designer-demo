//TODO:把这些工具函数放到 fabric.util 上去，而不是暴露到全局空间
function convertToString(input) {
  input = input || '';
  if (typeof input === 'string') return input;
  return String(input);
}

function toWords(input) {
  input = convertToString(input);
  let reg = /[A-Z\xC0-\xD6\xD8-\xDE]?[a-z\xDF-\xF6\xF8-\xFF]+|[A-Z\xC0-\xD6\xD8-\xDE]+(?![a-z\xDF-\xF6\xF8-\xFF])|\d+/g;
  return input.match(reg);
}

function toCamelCase(inputArray = [], pascal = false) {
  let result = '';
  for (let i = 0, len = inputArray.length; i < len; i++) {
    let currentStr = inputArray[i];
    let tempStr = currentStr.toLowerCase();
    if (pascal) {
      tempStr = tempStr.substr(0, 1).toUpperCase() + tempStr.substr(1);
    } else {
      if (i != 0) {
        tempStr = tempStr.substr(0, 1).toUpperCase() + tempStr.substr(1);
      }
    }
    result += tempStr;
  }
  return result;
}

/**
 * 工具函数，字符串转换成驼峰形式。
 */
export function camelCase(input, pascal = false) {
  let words = toWords(input);
  return toCamelCase(words, pascal);
}
