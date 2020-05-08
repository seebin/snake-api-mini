var mongoose = require('mongoose');
// 前缀数据
var prefixDataSchemas = mongoose.Schema({
  remark: String,                       // 备注
  code: String,                       // 前缀编码
});

var prefixDataModal = mongoose.model('prefixData', prefixDataSchemas);

module.exports = prefixDataModal;