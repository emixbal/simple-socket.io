var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);


app.set('port', process.env.PORT || 3030);


app.get('/', function (req, res) {
    return res.send('root endpoint');
});

io.on('connection', function (socket) {
    socket.on('chatpesan', function (pesan) {
        console.log(pesan);
        io.emit(`chatpesan:${pesan.to}`, pesan);
    });
});

http.listen(app.get('port'), function () {
    console.log('Server jalan di port ' + app.get('port'));
});