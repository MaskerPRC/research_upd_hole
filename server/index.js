var dgram = require('dgram');
var bencode = require('bencode');

//创建 udp server
var udp_server = dgram.createSocket('udp4');
// 绑定端口
udp_server.bind(8888);
// 绑定端口（自定义）
const clients = {};
// 监听端口
udp_server.on('listening', function () {
    console.log('UDP启动监听');
});

//接收消息
udp_server.on('message', function (msg, rinfo) {
    msg = bencode.decode(msg);
    clients[msg.id] = rinfo;
    // 将以记录的请求数据全部发送给请求的客户端
    let buf = bencode.encode({
        address: rinfo.address,
        port: rinfo.port,
        clients: clients,
        data: msg.data,
        id: msg.id,
        type: "server"
    });
    udp_server.send(buf, 0, buf.length, rinfo.port, rinfo.address); //将接收到的消息返回给客户端
    console.log(`客户端 ${rinfo.address}:${rinfo.port} 发送请求`);
});
//错误处理
udp_server.on('error', function (err) {
    console.log(err);
    udp_server.close();
});
