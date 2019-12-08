require('dotenv').config()
var express = require("express");
var app = express();
const { Client } = require('tplink-smarthome-api');

var password = process.env.PASSWORD
var plugIP = process.env.PLUGIP

const client = new Client();
var plug = client.getDevice({host: plugIP})

var togglePlug = async () => {
    client.getDevice({host: plugIP}).then(plug =>{
        plug.togglePowerState().then(console.log())
    })
}

var trigger = async (req, res) => {
    res.type('json')
    var resPassword;
    if(req.method == 'GET'){
        resPassword = req.query.pass
    } else if(req.method == 'POST'){
        resPassword = req.headers.auth
    }
    if(!resPassword){
        var error = {
            status: 401,
            message: "invalid body"
        }
        res.end(JSON.stringify(error))
    }
    if(resPassword != password) {
        var error = {
            status: 401,
            message: "invalid password"
    }
        res.status(error.status)
        res.end(JSON.stringify(error))
    } else if(resPassword == password) {
        var relay_state;
        await client.getDevice({host: plugIP}).then(async (device) => {
            await device.getSysInfo().then(info => {
                relay_state = info.relay_state
            });
          });
        if(relay_state == 1){
            var response = {
                status: 200,
                message: "The smart plug was already turned on!"
            }
        res.status(response.status)
        res.end(JSON.stringify(response))
        }
        togglePlug()
        setTimeout(() => {
            togglePlug()
        }, 5000);
        var response = {
            status: 200,
            message: "Success!"
        }
        res.status(response.status)
        res.end(JSON.stringify(response))
    }
}

//console.log(plug)
/* serves main page */
app.get("/", function(req, res) {
   res.sendFile(__dirname + '/index.html')
});

app.get('/trigger', (req, res) => {
    trigger(req, res)
})

app.post('/trigger', (req, res) => {
    trigger(req, res)
})
var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
