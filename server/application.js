var express = require("express");
const httpProxy = require("http-proxy");
const path = require("path");

var router = require("./controllers/index");

var TodoModal = require("./modal/modal");
var ConfigModal = require("./modal/configModal");

var config = require("../config");

var app = new express();

app.use("/mock", express.static(path.join(__dirname, "../client/build")));

app.use(router);

app.use((req, res, next) => {
  ConfigModal.find({}, (err, item) => {
    if (err) throw err;
    var data = item[0] || {};

    req.target = data.target;
    req.changeOrigin = !!data.changeOrigin;
    if (data.mock) {
      // 拿到地址，去数据库中查询，如果没有则用axios调用接口，否则返回数据库里面的mock数据字段
      TodoModal.find({ url: req.path }, (err, item) => {
        if (err) throw err;
        // 查询到数据并且开启了mock状态，则返回mock数据
        if (JSON.stringify(item) !== "[]" && item[0].isOpen) {
          setTimeout(() => {
            res.send(item[0].data);
          }, data.delay);
          return;
        }
        // 否则做代理转发
        next();
      });
    } else {
      // 否则做代理转发
      next();
    }
  });
});

// 非挡板接口代理到目标环境
app.use(function (req, res) {
  // if (!req.target) {
  //   res.writeHead(500, {
  //     "Content-Type": "text/plain;charset=UTF-8",
  //   }); 
  //   res
  //     .status(500)
  //     .end(
  //       `未设置项目代理地址, 请先进入 http://127.0.0.1:${config.port}/config.html 去设置代理地址!`
  //     );
  //   return;
  // }
  //创建代理对象
  var proxy = httpProxy.createProxyServer({
    //代理地址为http时
    target: req.target || 'http://12.168.3.15',
    //是否需要改变原始主机头为目标URL
    changeOrigin: req.changeOrigin,
    // 重写cookie的作用域
    // cookieDomainRewrite: {
    //   '*': 'dev.yilihuo.com'
    // }

    // 当地址为https时加上秘钥和
    // ssl: {
    //     key: fs.readFileSync('server_decrypt.key', 'utf8'),
    //     cert: fs.readFileSync('server.crt', 'utf8')
    // },
    // if you want to verify the SSL Certs
    // secure: false
  });
  //配置错误处理
  proxy.on("error", function (err, request, response) {
    response.writeHead(500, {
      "Content-Type": "text/plain",
    });
    response.status(500).end("服务器异常！");
  });
  proxy.web(req, res);
  return;
});

app.listen(config.port, () => {
  console.log(
    `service is started. listen to ${config.port} port. open the following address in the browser.\n  http://127.0.0.1:${config.port}/mock`
  );
});
