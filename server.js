io.sockets.on('connection', function (socket) {
    socket.on('message', function (data) {
        socket.broadcast.emit('message', data);
    });
});