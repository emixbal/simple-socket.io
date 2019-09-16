require('dotenv').config();
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

app.set('port', process.env.PORT || 3030);

app.use(bodyParser.urlencoded({
    extended: true
}));
// parse application/json
app.use(bodyParser.json())



app.get('/', function (req, res) {
    return res.send('root endpoint');
});

app.post('/send_message', function(req, res, next){
    if (!req.headers.authorization) {
        return res.status(403).json({ error: 'Aauthorization token is not provied!' });
    }
    const token = req.headers.authorization
    var user = jwt.verify(token, process.env.SECRET_KEY);

    console.log(user);

    const { pesan, no_hp } = req.body
    const data = {
        "pesan":pesan,
        "no_hp":no_hp
    }
    io.on('connection', function (socket) {
        io.emit(`chatpesan:${user.id}`, data);
    });
    res.send({"hallo":"hallo"});
    next()
})

app.post("/foo", function(req, res, next) {
    io.emit("foo", req.body);
    res.send({"hallo":"hallo"});
})

io.on('connection', function (socket) {
    socket.on('chatpesan', function (pesan) {
        console.log(pesan);
        io.emit(`chatpesan:${pesan.to}`, pesan);
    });
});

http.listen(app.get('port'), function () {
    console.log('Server jalan di port ' + app.get('port'));
});
