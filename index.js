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

// ensure token middleware. make sure endpoint have token, valid token, and active user
async function ensureToken(req, res, next) {
  try {
    var bearerHeader = req.headers['authorization']
    if (typeof bearerHeader == 'undefined') {
      console.log('undefined, gak ada token');
      return res.status(403).send({
        'message': 'token not provided'
      })
    }
    var bearerToken = bearerHeader.split(' ')
    var tokenBracket = bearerToken[0]
    var tokenProvided = bearerToken[1]

    if (tokenBracket !== 'bearer')
      return res.status(403).send({'message': 'worng format header Authorization'})

    const user = await jwt.verify(tokenProvided, process.env.SECRET_KEY)

    if(user.isActive==false)
      return res.status(403).send({"message":"need activation user."})
    
    req.body.user = user
    next()
  } catch (error) {
    console.log(error);
    return res.status(403).send({
      'message': 'token is not valid'
    })
  }
}

app.get('/', function (req, res) {
  return res.send('root endpoint');
});

app.post('/send_message', ensureToken, function (req, res, next) {
  if (typeof (req.body.message) == 'undefined' || typeof (req.body.phone_number) == 'undefined')
    return res.status(422).send({ "message": "message or phone number can't be null!" })

  const userData = req.body.user //get from middleware
  const data = {
    "message": req.body.message,
    "phone_number": req.body.phone_number
  }

  io.emit(`sendsms:${userData.id}`, data);

  return res.send({ "message": "ok" });
})

app.post("/foo", function (req, res, next) {
  io.emit("foo", req.body);
  res.send({ "hallo": "hallo" });
})

http.listen(app.get('port'), function () {
  console.log('Server jalan di port ' + app.get('port'));
});