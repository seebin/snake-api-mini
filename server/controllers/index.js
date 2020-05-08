const express = require("express");
const request = require("request");

const router = express.Router();

var mongoose = require("mongoose");

var bodyParser = require("body-parser");
// create application/json parser
var jsonParser = bodyParser.json({ limit: "50mb" });
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ limit: "50mb", extended: true });

var config = require("../../config");

var TodoModal = require("../modal/modal");
var BaseDataModal = require("../modal/baseDataModal");
var prefixModal = require("../modal/prefixModal");
var ConfigModal = require("../modal/configModal");

mongoose.connect(config.mongodb, { useNewUrlParser: true });
var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  // console.log('mongodb is connected.')
});

// 新增批量保存接口
router.post("/api/import-interface", jsonParser, (req, res) => {
  let reqBody = req.body;
  const param = [];
  // 去重
  TodoModal.find({}, (err, items) => {
    if (err) throw err;
    reqBody.forEach((data) => {
      data.url = data.prefix + data.path;
      data.isLock = false;
      let emp = false;
      items.forEach((item) => {
        if (item.url === data.url) {
          emp = true;
        }
      });
      if (!emp) param.push(data);
    });

    TodoModal.insertMany(param, (err, items) => {
      if (err) throw err;
      res.send({
        success: true,
        errorMsg: "",
      });
    });
  });
});

// 新增保存接口
router.post("/api/add-interface", jsonParser, (req, res) => {
  let reqBody = req.body;
  reqBody.url = reqBody.prefix + reqBody.path;
  reqBody.isLock = false;

  // 保证url唯一性
  TodoModal.find({ url: reqBody.url }, (err, item) => {
    if (err) throw err;
    if (JSON.stringify(item) !== "[]") {
      res.send({
        success: false,
        errorMsg: "已经存在的mock地址",
        data: {},
      });
    } else {
      // 存入数据库
      var todoObj = new TodoModal(reqBody);

      todoObj.save((err, todo) => {
        if (err) throw err;
        res.send({
          success: true,
        });
      });
    }
  });
});

// 获取接口列表
router.post("/api/get-interface-list", jsonParser, (req, res) => {
  var param = {};
  // 添加接口名称入参
  if (req.body && req.body.name) {
    param.name = { $regex: req.body.name };
  }
  // 添加接口地址入参
  if (req.body && req.body.url) {
    param.url = { $regex: req.body.url };
  }
  if (!req.body.page) req.body.page = 1;
  if (!req.body.rows) req.body.rows = 5;

  TodoModal.find(param, (err, items) => {
    if (err) throw err;
    var total = items.length;
    var pages = Math.ceil(total / req.body.rows);
    TodoModal.find(param)
      .sort({ _id: -1 }) // 1 为生序  -1为降序
      .skip((req.body.page - 1) * req.body.rows)
      .limit(req.body.rows * 1)
      .exec((err, items) => {
        if (err) throw err;

        res.send({
          success: true,
          data: {
            pages: pages,
            total: total,
            page: req.body.page,
            rows: req.body.rows,
            list: items,
          },
        });
      });
  });
});

// 删除接口
router.post("/api/delete-interface", jsonParser, (req, res) => {
  if (!req.body || !req.body.id) {
    res.send({
      success: false,
      errorMsg: "缺少接口id",
    });
    return;
  }
  TodoModal.deleteOne({ _id: req.body.id }, (err) => {
    if (err) throw err;
    res.send({
      success: true,
    });
  });
});

// 清空接口
router.get("/api/delete-all-interface", jsonParser, (req, res) => {
  TodoModal.deleteMany({ isLock: false }, (err) => {
    if (err) throw err;
    res.send({
      success: true,
    });
  });
});

// 获取单个接口详情
router.post("/api/get-interface-detail", jsonParser, (req, res) => {
  if (!req.body || !req.body.id) {
    res.send({
      success: false,
      errorMsg: "缺少接口id",
    });
    return;
  }
  TodoModal.findById(req.body.id, (err, item) => {
    if (err) throw err;
    res.send({
      success: true,
      data: item,
    });
  });
});

// 更新单个接口
router.post("/api/update-interface", jsonParser, (req, res) => {
  if (!req.body || !req.body.id) {
    res.send({
      success: false,
      errorMsg: "缺少接口id",
    });
    return;
  }
  TodoModal.findById(req.body.id, (err, item) => {
    if (err) throw err;
    item.name = req.body.name;
    item.path = req.body.path;
    item.prefix = req.body.prefix;
    item.url = req.body.prefix + req.body.path;
    item.data = req.body.data;
    item.sourceData = req.body.sourceData;
    item.method = req.body.method;

    item.save((err) => {
      if (err) throw err;
      res.send({
        success: true,
      });
    });
  });
});

// 修改接口mock状态
router.post("/api/change-interface-mock-status", jsonParser, (req, res) => {
  if (!req.body || !req.body.id) {
    res.send({
      success: false,
      errorMsg: "缺少接口id",
    });
    return;
  }
  TodoModal.findById(req.body.id, (err, item) => {
    if (err) throw err;
    item.isOpen = req.body.isOpen;
    item.save((err) => {
      if (err) throw err;
      res.send({
        success: true,
      });
    });
  });
});

// 修改接口锁状态
router.post("/api/change-interface-lock-status", jsonParser, (req, res) => {
  if (!req.body || !req.body.id) {
    res.send({
      success: false,
      errorMsg: "缺少接口id",
    });
    return;
  }
  if (
    req.body.isLock === undefined ||
    req.body.isLock === null ||
    typeof req.body.isLock !== "boolean"
  ) {
    res.send({
      success: false,
      errorMsg: "参数isLock未传或数据类型错误 应为boolean类型",
    });
  }
  TodoModal.findById(req.body.id, (err, item) => {
    if (err) throw err;
    item.isLock = req.body.isLock;
    item.save((err) => {
      if (err) throw err;
      res.send({
        success: true,
      });
    });
  });
});

// 查询所有基础数据
router.get("/api/get-base-list", (req, res) => {
  BaseDataModal.find({}, (err, items) => {
    if (err) throw err;
    res.send({
      success: true,
      data: items,
    });
  });
});

// 更新单个基础数据
router.post("/api/update-base-data", jsonParser, (req, res) => {
  if (!req.body.id) {
    // 置为新增
    var todoObj = new BaseDataModal(req.body);

    todoObj.save((err, todo) => {
      if (err) throw err;
      res.send({
        success: true,
      });
    });
  } else {
    // 更新数据
    BaseDataModal.findById(req.body.id, (err, item) => {
      if (err) throw err;
      item.aceData = req.body.aceData;
      item.data = req.body.data;
      item.remark = req.body.remark;

      item.save((err) => {
        if (err) throw err;
        res.send({
          success: true,
        });
      });
    });
  }
});

// 删除单个基础数据
router.post("/api/delete-base-data", jsonParser, (req, res) => {
  if (!req.body || !req.body.id) {
    res.send({
      success: false,
      errorMsg: "缺少id",
    });
    return;
  }
  BaseDataModal.deleteOne({ _id: req.body.id }, (err) => {
    if (err) throw err;
    res.send({
      success: true,
    });
  });
});

// 查询单个基础数据
router.post("/api/get-base-data-by-id", jsonParser, (req, res) => {
  if (!req.body || !req.body.id) {
    res.send({
      success: false,
      errorMsg: "缺少接口id",
    });
    return;
  }
  BaseDataModal.findById(req.body.id, (err, item) => {
    if (err) throw err;
    res.send({
      success: true,
      data: item,
    });
  });
});

// 查询前缀数据
router.get("/api/get-prefix-list", (req, res) => {
  prefixModal.find({}, (err, items) => {
    if (err) throw err;
    res.send({
      success: true,
      data: items,
    });
  });
});

// 新增前缀数据保存
router.post("/api/add-prefix", jsonParser, (req, res) => {
  let reqBody = req.body;

  // 保证url唯一性
  prefixModal.find({ code: reqBody.code }, (err, item) => {
    if (err) throw err;
    if (JSON.stringify(item) !== "[]") {
      res.send({
        success: false,
        errorMsg: "已经存在的前缀",
        data: {},
      });
    } else {
      // 存入数据库
      var prefixObj = new prefixModal(reqBody);

      prefixObj.save((err, todo) => {
        if (err) throw err;
        res.send({
          success: true,
        });
      });
    }
  });
});

// 删除前缀数据
router.post("/api/delete-prefix", jsonParser, (req, res) => {
  if (!req.body || !req.body.id) {
    res.send({
      success: false,
      errorMsg: "缺少id",
    });
    return;
  }
  prefixModal.deleteOne({ _id: req.body.id }, (err) => {
    if (err) throw err;
    res.send({
      success: true,
    });
  });
});

// 导入swagger接口
router.get("/api/import-swagger-json", (req, res) => {
  if (!req.query.url) {
    res.send({
      success: false,
      errorMsg: "swagger-json地址不能为空",
    });
  }
  request(
    req.query.url,
    {
      proxy: config.swaggerProxy,
    },
    (error, response, data) => {
      if (!error && response.statusCode == 200) {
        try {
          JSON.parse(data);
          res.send(data);
        } catch (e) {
          res.send({
            success: false,
            errorMsg: "地址错误,非JSON数据地址",
            data,
          });
        }
      } else {
        res.send({
          success: false,
          errorMsg: error,
        });
      }
    }
  );
});

// 查询配置信息
router.get("/api/get-config", (req, res) => {
  ConfigModal.find({}, (err, items) => {
    if (err) throw err;
    res.send({
      success: true,
      data: items[0] || {
        target: "",
        delay: "",
        changeOrigin: false,
      },
    });
  });
});

// 更新配置信息
router.post("/api/update-config", jsonParser, (req, res) => {
  let reqBody = req.body;

  // 更新或新增数据
  if (reqBody.id) {
    // 更新
    ConfigModal.findById(reqBody.id, (err, item) => {
      if (err) throw err;
      item.target = reqBody.target;
      item.delay = reqBody.delay;
      item.changeOrigin = reqBody.changeOrigin;

      item.save((err) => {
        if (err) throw err;
        res.send({
          success: true,
        });
      });
    });
  } else {
    // 新增
    reqBody.mock = true; // 默认开启mock
    var configObj = new ConfigModal(reqBody);

    configObj.save((err, todo) => {
      if (err) throw err;
      res.send({
        success: true,
      });
    });
  }
});

// 切换项目mock状态
router.post("/api/update-config-mock", jsonParser, (req, res) => {
  let reqBody = req.body;
  if (!reqBody.id) {
    res.send({
      success: false,
      errorMsg: "缺少id参数",
    });
    return;
  }
  if (typeof reqBody.mock != "boolean") {
    res.send({
      success: false,
      errorMsg: "缺少mock参数或数据格式不正确",
    });
    return;
  }
  ConfigModal.findById(reqBody.id, (err, item) => {
    if (err) throw err;
    item.mock = reqBody.mock;

    item.save((err) => {
      if (err) throw err;
      res.send({
        success: true,
      });
    });
  });
});

module.exports = router;
