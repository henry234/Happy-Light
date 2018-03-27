require('rootpath')();
var express = require('express');
var app = express();
var session = require('express-session');
var bodyParser = require('body-parser');
var expressJwt = require('express-jwt');
var config = require('config.json');

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({ secret: config.secret, resave: false, saveUninitialized: true }));

// use JWT auth to secure the api
app.use('/api', expressJwt({ secret: config.secret }).unless({ path: ['/api/users/authenticate', '/api/users/register'] }));

// routes
app.use('/login', require('./controllers/login.controller'));
app.use('/register', require('./controllers/register.controller'));
app.use('/app', require('./controllers/app.controller'));
app.use('/api/users', require('./controllers/api/users.controller'));
app.use('/api/forms', require('./controllers/api/forms.controller'));


app.use('/directions', require('./controllers/direction.controller'))
app.use('/public', express.static(__dirname + '/public/'));
app.use('/node_modules', express.static(__dirname + '/node_modules/'));
app.use('/bower_components', express.static(__dirname + '/bower_components/'));
app.use('/app', express.static(__dirname + '/app/'));


// make '/app' default route
app.get('/', function (req, res) {
    return res.redirect('/app');
});

// start server
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var formService = require("services/form.service");

// Khởi chạy server trên port được quy định trong config
server.listen(3000);
console.log("Starting server on: 3000");
startTime = new Date();
console.log("Initialize completed: " + startTime.toString());

var groups = {};
var connections = [];
io.sockets.on("connection", function(socket) {
    socket.on("initNode", function (data, fn) {
        formService.getAll("groups", { data: { $elemMatch: { _id: data._id } } })
            .then(function (rows) {
                let group = rows.pop();
                socket.nodeRecvId = group.data[4]._id;
                socket.nodeId = data._id;

                if (!groups[group.data[4]._id]){
                    groups[group.data[4]._id] = {idx: 0};
                    
                    for (var i = 0; i < 4; i++) {
                        groups[socket.nodeRecvId][group.data[i]._id] = {
                            distance: group.data[i].distance,
                            queue: [],
                            idx: i
                        };
                    }
                    
                    setInterval(function () {
                        var roads = groups[group.data[4]._id];
                        var i = 0;

                        for (var road in roads) {
                            if (road != "time" && road != "idx") {
                                // update queue
                                for (var i = roads[road].queue.length - 1; i >= 0; i--) {
                                    var elem = roads[road].queue[i];

                                    if (roads.idx == i) {
                                        if (roads[road].distance - elem.time <= 0) {
                                            roads[road].queue.splice(i, 1);
                                        } else {
                                            elem.time += 1;
                                        }
                                    } else {
                                        if (roads[road].distance - elem.time <= 0) {
                                            // wait for run
                                        } else {
                                            elem.time += 1;
                                        }
                                    }
                                }
                                i++;
                            }
                        }
                        
                        
                        roads.time--;
                        if (roads.time == 0) {
                            var sks = connections.filter(function (e) {
                                return e.nodeId == e.nodeRecvId;
                            });
                            
                            roads.idx = (roads.idx + 1) % 4;

                            let calTime = 0;
                            let t = 0;
                            for (var road in roads) {
                                if (road != "time" && road != "idx") {
                                    if (roads[road].idx == roads.idx) {
                                        if (roads[road].queue.length > 0) {

                                            for (var j = 0; j < roads[road].queue.length; j++) {
                                                if (t >= 200) {
                                                    calTime = roads[road].distance - roads[road].queue[j].time;
                                                } else {
                                                    t += roads[road].queue[j].vehicle;
                                                }
                                            }

                                            if (calTime == 0) {
                                                calTime = roads[road].distance - roads[road].queue[roads[road].queue.length - 1].time;
                                            }
                                        }
                                        break;
                                    }
                                }
                            }


                            var vehicles = [];
                            for (var road in roads) {
                                if (road != "time" && road != "idx") {
                                    var temp = 0;
                                    if (roads[road].queue.length > 0) {
                                        for (var j = 0; j < roads[road].queue.length; j++) {
                                            temp += roads[road].queue[j].vehicle;
                                        }
                                    }
                                    vehicles.push({ vehicles: temp, _id: road });
                                }
                            }

                            for (var i = 0; i < 4; i++) {
                                if (vehicles[i].vehicles > 200) {
                                    var _sks = connections.filter(function (e) {
                                        return e.nodeId == vehicles[i]._id;
                                    });
                                    try {
                                        _sks[0].emit("changeTimeFre", {f: vehicles[i].vehicles / 200 - 1});
                                    } catch (ex) {
                                        console.log("1");
                                        console.log(ex);
                                    }
                                }
                            }
                            
                            if (sks[0] && calTime > 0) {
                                sks[0].emit("updateTime", {time: calTime, idx: roads.idx, vehicle: t, vehicles: vehicles});
                            }
                        }
                        
                    }, 1000);
                }

                connections.push(socket);

                groups[socket.nodeRecvId].time = 5;
                fn ({time: 5, idx: 0});  
            })
            .catch(function (err) {
                console.log(err);
            })
    });

    socket.on("addVehicle", function (data, fn) {
        try {
            if (socket.nodeRecvId == socket.nodeId) {
                groups[socket.nodeRecvId].time = data.time;
            } else {
                groups[socket.nodeRecvId][socket.nodeId].queue.push({time: data.time, vehicle: data.vehicle});
            }
        } catch (ex) {
            console.log(ex);
        }
    });

    socket.on("disconnect", function (data) {
        connections.splice(connections.indexOf(socket), 1);
    });
});

