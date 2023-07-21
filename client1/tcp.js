const net = require('net');
const bencode = require('bencode');

// 创建TCP客户端
const client = new net.Socket();

// 连接到服务器
client.connect(8888, '39.98.113.76', function() {
    console.log('已连接到服务器');
});

// 用时间戳模拟id标识
const ID = (+new Date()) + "";

// 接收消息
client.on('data', function(data) {
    let msg = bencode.decode(data);
    if (msg.type === "server") {
        console.log('接收到服务器消息: ' + msg.data);
    } else if (msg.type === "client") {
        console.log(`客户端 ${msg.id} 发送消息: ${msg.data}`);
    }
});

// 错误处理
client.on('error', function(err) {
    console.log('发生错误: ' + err);
    client.destroy(); // 销毁socket
});

// 断开连接处理
client.on('close', function() {
    console.log('连接已断开');
});

// 向服务器发送消息
function sendServer() {
    var buff = bencode.encode({ id: ID, data: "Hello Server", type: "client" });
    client.write(buff);
}

sendServer(); // 发送初始化消息

// 定时发送服务器（发送心跳包）
setInterval(sendServer, 10000);
