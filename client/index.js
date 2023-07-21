const dgram = require('dgram');
const bencode = require('bencode');

// 用时间戳模拟id标识
const ID = (+new Date()) + "";
//创建UDP服务
const udp_server = dgram.createSocket('udp4');
// 绑定随机端口
udp_server.bind();

// 监听端口
udp_server.on('listening', function (a) {
    console.log('UDP启动监听');
});
// 客户端信息，以及测试用的客户端信息
let clients, testClient;
//接收消息
udp_server.on('message', function (msg, rinfo) {
    var data = bencode.decode(msg);
    if (data.type == "server") {
        clients = data.clients;
        //获取测试的客户端
        for (let k in clients) {
            if (k !== ID) {
                testClient = clients[k];
                break;
            }
        }
    } else if (data.type == "client") {
        //显示获取的信息
        console.log((new Date()).toLocaleString(), data.id.toString(), rinfo.address.toString(), data.data.toString());
    }
})
//错误处理
udp_server.on('error', function (err) {
    console.log(err);
    udp_server.close();
});
// 向服务器发送消息
function sendServer() {
    var buff = bencode.encode({ id: ID, data: "Hello Server", type: "client" });
    // 自定义发送 服务器 外网端口与ip
    udp_server.send(buff, 0, buff.length, 1111, '39.98.113.76');
}
sendServer();
// 向其他客户端发送测试数据
function sendClient() {
    if (testClient) {
        var buff = bencode.encode({ id: ID, data: "Hello Client", type: "client" });
        udp_server.send(buff, 0, buff.length, testClient.port, testClient.address.toString());
    }
}
// 定时发送服务器（发送心跳包）
setInterval(sendServer, 10000);
// 发送测试数据
setInterval(sendClient, 2000);
