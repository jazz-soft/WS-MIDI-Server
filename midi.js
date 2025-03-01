const ws = require('ws');
const JZZ = require('jzz');
require('jzz-midi-ws')(JZZ);
const wss1 = new ws.WebSocketServer({ noServer: true });
const wss2 = new ws.WebSocketServer({ noServer: true });
const midiws = new JZZ.WS.Server(wss1);

const virtual_in = new JZZ.Widget();
const virtual_out = new JZZ.Widget();

var master;
var timeout;
wss2.on('connection', function connection(ws) {
  if (timeout) clearTimeout(timeout);
  timeout = undefined;
  master = ws;
  ws.on('error', console.error);
  ws.on('close', function message() {
    master = undefined;
    timeout = setTimeout(process.exit, 1000);
  });
  ws.on('message', function message(data) {
  });
});

JZZ().and(function() {
    var p;
    var info = JZZ().info();
    for (p of info.inputs) addMidiIn(p.name, JZZ().openMidiIn(p.name));
    for (p of info.outputs) addMidiOut(p.name, JZZ().openMidiOut(p.name));
    addMidiIn('Virtual', virtual_in);
    addMidiOut('Web Audio', virtual_out);
}).or('Cannot start MIDI engine!');
JZZ().onChange(function(x) {
  var p;
  for (p of x.inputs.added) addMidiIn(p.name, JZZ().openMidiIn(p.name));
  for (p of x.outputs.added) addMidiOut(p.name, JZZ().openMidiOut(p.name));
  for (p of x.inputs.removed) removeMidiIn(p.name);
  for (p of x.outputs.removed) removeMidiOut(p.name);
});

function addMidiIn(name, port) {
  midiws.addMidiIn(name, port);
}
function addMidiOut(name, port) {
  midiws.addMidiOut(name, port);
}
function removeMidiIn(name, port) {
  midiws.removeMidiIn(name, port);
}
function removeMidiOut(name, port) {
  midiws.removeMidiOut(name, port);
}

module.exports = {
  wss: function (req, socket, head) {
    if (req.url == '/') {
      wss1.handleUpgrade(req, socket, head, function(ws) { wss1.emit('connection', ws, req); });
    }
    else if (req.url == '/master' && req.headers.host.split(':')[0] == 'localhost' && !master) {
      wss2.handleUpgrade(req, socket, head, function(ws) { wss2.emit('connection', ws, req); });
    }
    else {
      socket.destroy();
    }
  },
  master: function() { return !!master; }
}