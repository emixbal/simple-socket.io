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

function ensureToken(req, res, next) {
  var bearerHeader = req.headers['authorization']
  if (typeof bearerHeader=='undefined'){
    console.log('undefined, gak ada token');
    return res.status(403).send({
      'message':'token not provided'
    })
  } else {
    var bearerToken = bearerHeader.split(' ')
    var tokenBracket = bearerToken[0]
    var tokenProvided = bearerToken[1]

    if(tokenBracket !== 'bearer'){
      return res.status(403).send({
        'message':'worng format header Authorization'
      })
    }

    jwt.verify(tokenProvided, process.env.SECRET_KEY, function(err, decoded) {
      if(err){
        console.log('token is not valid');
        return res.status(403).send({
          'message':'token is not valid'
        })
        next()
      }
      return req.body.user = decoded
      next()
    });
  }
  next()
}

app.get('/', function (req, res) {
    return res.send('root endpoint');
});

app.post('/send_message', ensureToken, function(req, res, next){
    if(typeof(req.body.message)=='undefined' || typeof(req.body.phone_number)=='undefined')
        return res.status(422).send({"message":"message or phone number can't be null!"})

    const userData = req.body.user //get from middleware
    const data = {
        "message":req.body.message,
        "phone_number":req.body.phone_number
    }

    // io.on('connection', function (socket) {
    //     io.emit(`sendsms:${user.id}`, data);
    // });
    io.emit(`sendsms:${userData.id}`, data);

    return res.send({"message":"ok"});
    next()
})

app.post("/foo", function(req, res, next) {
    io.emit("foo", req.body);
    res.send({"hallo":"hallo"});
})

// io.on('connection', function (socket) {
//     socket.on('chatpesan', function (pesan) {
//         console.log(pesan);
//         io.emit(`chatpesan:${pesan.to}`, pesan);
//     });
// });

http.listen(app.get('port'), function () {
    console.log('Server jalan di port ' + app.get('port'));
});
