var express = require('express'),
  debug = require('debug')('projectx:server'),
  path = require('path'),
  favicon = require('serve-favicon'),
  http = require('http'),
  logger = require('morgan'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),

  io_client = require('socket.io-client');
app = express(),
  routes = require('./routes/index'),
  users = require('./routes/users'),
  chat = require('./routes/chat');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// port setup
var port = normalizePort(process.argv[2]);
var remotePort = normalizePort(process.argv[3])
app.set('port', port);
app.set('remotePort', remotePort);

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }
  if (port >= 0) {
    // port number
    return port;
  }
  return false;
}

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});



//Create a new io object of a given namespace,
//listens for connections
// function createNewRoom(pid) {
//   var nsp = io.of('/' + pid);
//   nsp.on('connection', function (socket) {
//     console.log('someone connected to ', pid)


//     socket.on('chat message', function (msg) {
//       console.log("received a message: ", msg);
//       nsp.emit('chat message', msg);
//     })

//     socket.on('disconnect', function(){
//       console.log("somone disconnected")
//     })
//   })
// }

app.get('/', function (req, res) {
  res.status(200).end("Up and running");
});

app.get("/connectedUsers", function (req, res, next) {
  res.send(JSON.stringify(connectedUsers))
})


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,

      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var connectedUsers = {};

//Server setup
var server = http.createServer(app);
var io = require('socket.io')(server);

//Create a client to talk to other socket servers
if (remotePort) {
  var remoteSocketServer = io_client("http://localhost:" + remotePort);
}


//Handle incoming events here
io.on('connection', function (socket) {

  console.log("connection event fired");
  socket.on("join", function (data) {
    console.log("Join event received. Data is ", data);

    if (connectedUsers[data.room]) {
      connectedUsers[data.room]++;
    } else {
      connectedUsers[data.room] = 1;
    }
    socket.join(data.room);

    //Relay the join to the other socket server
    if (remoteSocketServer) {
      remoteSocketServer.emit("join", data);
    }
  })

  socket.on('chat message', function (data) {
    console.log("Received chat message event. Socket's rooms are ", socket.rooms);
    console.log("Received chat message event. Data is ", data);
    io.sockets.in(data.room).emit("chat message", { room: data.room, chat: data.chat });
    if (remoteSocketServer) {
      remoteSocketServer.emit("chat message", { room: data.room, chat: data.chat });
    }
  })

  //Update other servers with new connected user count

  socket.on("peer:connectedUsers", function (data) {
    console.log(data);
  })
})

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
