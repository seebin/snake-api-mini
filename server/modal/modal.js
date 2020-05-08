var mongoose = require('mongoose');

var todoSchemas = mongoose.Schema({
  url: String,                        // 接口完整路径 前缀+接口地址
  path: String,                       // 接口地址
  name: String,                       // 接口名称
  data: mongoose.Schema.Types.Mixed,  // 接口响应数据
  sourceData: String,                 // json5源代码
  isOpen: Boolean,                    // mock状态 true为开启mock
  isLock: Boolean,                    // 是否锁住  锁住不会被批量删除
  method: String,                     // 请求类型
  prefix: String,                     // 接口地址前缀
});

var TodoModal = mongoose.model('Interface', todoSchemas);

module.exports = TodoModal;