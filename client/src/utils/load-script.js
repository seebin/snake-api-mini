/**
 * 批量异步加载script脚本
 * @param {*} srcList src地址集合
 */
export function AsyncLoadScript(srcList) {
  let scPromise = [];
  srcList.forEach((src) => {
    scPromise.push(load(src, true));
  });
  return Promise.all(scPromise);
}

/**
 * 批量同步加载script脚本
 * @param {*} srcList 
 */
export function LoadScript(srcList) {
  let emp = true;
  srcList.forEach(async (src) => {
    try {
      await load(src, false);
    } catch (reason) {
      emp = false;
    }
  });
  return new Promise((resolve, reject) => {
    if (emp) {
      resolve();
    } else {
      reject();
    }
  });
}
function load(src, isAsync) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = isAsync;
    script.onload = function () {
      resolve();
    };
    script.onerror = function () {
      reject();
    };
    document.body.appendChild(script);
  });
}
