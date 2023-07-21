var net = require('net');
var bencode = require('bencode');

//创建 tcp server
var tcp_server = net.createServer();

// 监听端口
tcp_server.listen(8888, function() {
    console.log('TCP启动监听');
});

//定义客户端列表
const clients = {};

//处理连接
tcp_server.on('connection', function(socket) {
    var remoteAddress = socket.remoteAddress;
    var remotePort = socket.remotePort;

    console.log(`客户端 ${remoteAddress}:${remotePort} 已连接`);

    //接收数据
    socket.on('data', function(data) {
        data = bencode.decode(data);
        clients[data.id] = {
            address: remoteAddress,
            port: remotePort
        };

        // 将已记录的请求数据全部发送给请求的客户端
        let buf = bencode.encode({
            address: remoteAddress,
            port: remotePort,
            clients: clients,
            data: data.data,
            id: data.id,
            type: "server"
        });

        socket.write(buf); //将接收到的消息返回给客户端
    });

    //处理断开连接
    socket.on('end', function() {
        console.log(`客户端 ${remoteAddress}:${remotePort} 已断开连接`);
    });
});

//错误处理
tcp_server.on('error', function(err) {
    console.log(err);
});
