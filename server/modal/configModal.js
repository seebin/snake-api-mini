var mongoose = require("mongoose");
// 基础数据
var configSchemas = mongoose.Schema(
  {
    target: String, // 代理地址
    changeOrigin: Boolean, // 是否变更来源
    delay: Number, // mock数据响应延时
    mock: Boolean, // 是否开启mock
  },
  { minimize: false }
);

var ConfigModal = mongoose.model("config", configSchemas);

module.exports = ConfigModal;
