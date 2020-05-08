import JSON5 from "json5";

const pathList = [];

export function swaggerHandle(res) {
  Object.keys(res.paths).forEach(function (pathKey) {
    const pathData = res.paths[pathKey];
    Object.keys(pathData).forEach(function (methodKey) {
      const methodData = pathData[methodKey];
      // 响应数据
      let resData = {};

      const responses = Object.keys(methodData.responses);
      let response = null;
      for (let i = 0; i < responses.length; i++) {
        if (responses[i] === 200) {
          response = methodData.responses[responses[i]].schema;
          break;
        }
      }
      resData = getResData(response);

      const api = {
        name: methodData.summary,
        path: pathKey,
        data: resData,
        sourceData: JSON5.stringify(JSON.stringify(resData, null, 2)),
        method: methodKey.toLocaleUpperCase(),
        prefix: res.basePath,
        isOpen: true,
      };

      res.tags.forEach(function (tag) {
        if (tag.name === methodData.tags[0]) {
          // 同一tag
          if (!tag.paths) {
            tag.paths = [api];
          } else {
            tag.paths.push(api);
          }
        }
      });

      pathList.push(api);
    });
  });

  return res.tags;
}

// 组装响应数据
function getResData(data) {
  if (!data) return {};

  let res;
  if (data.type === "object") {
    res = {};
    data = data.properties;
    if (!data) return {};
    Object.keys(data).forEach(function (propKey) {
      res[propKey] = getResData(data[propKey]);
    });
  } else if (data.type === "array") {
    res = [];
    res.push(getResData(data.items));
  } else {
    if (!data.example) {
      if (data.type === "integer" || data.type === "number") data.example = 0;
      if (data.type === "boolean") data.example = true;
      if (data.type === "string") data.example = "";
    }
    res = data.example;
  }

  return res;
}
