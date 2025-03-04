const ws = require('ws');
const JZZ = require('jzz');
require('jzz-midi-ws')(JZZ);
const wss1 = new ws.WebSocketServer({ noServer: true });
const wss2 = new ws.WebSocketServer({ noServer: true });
const midiws = new JZZ.WS.Server(wss1);

const inputs = {};
const outputs = {};
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
    try {
      data = JSON.parse(data);
      if (data.refresh) refresh();
      else if (data.midi) virtual_in.send(JZZ.WS.decode(data.midi));
      else if (data.input) updateIn(data.input.name, data.input.hide);
      else if (data.output) updateOut(data.output.name, data.output.hide);
      else console.log('message:', data);
    }
    catch (e) {/**/}
  });
});

inputs['Virtual Piano'] = { port: virtual_in };
midiws.addMidiIn('Virtual Piano', virtual_in);
outputs['Web Audio'] = { port: virtual_out };
midiws.addMidiOut('Web Audio', virtual_out);
virtual_out._receive = function(msg) { master.send(JSON.stringify({ midi: JZZ.WS.encode(msg) })); };

JZZ().and(function() {
  var p;
  var info = JZZ().info();
  for (p of info.inputs) addMidiIn(p.name);
  for (p of info.outputs) addMidiOut(p.name);
}).or(function() {
  console.log('Cannot start MIDI engine!');
});
JZZ().onChange(function(x) {
  var p;
  for (p of x.inputs.added) addMidiIn(p.name);
  for (p of x.outputs.added) addMidiOut(p.name);
  for (p of x.inputs.removed) removeMidiIn(p.name);
  for (p of x.outputs.removed) removeMidiOut(p.name);
});

function addMidiIn(name) {
  if (inputs[name]) return;
  inputs[name] = {};
  JZZ().openMidiIn(name).and(function() {
    inputs[name].port = this;
    midiws.addMidiIn(name, this);
    refresh();
  }).or(function() {
    console.log('Cannot open MIDI input:', name);
    refresh();
  });
}
function addMidiOut(name) {
  if (outputs[name]) return;
  outputs[name] = {};
  JZZ().openMidiOut(name).and(function() {
    outputs[name].port = this;
    midiws.addMidiOut(name, this);
    refresh();
  }).or(function() {
    console.log('Cannot open MIDI output:', name);
    refresh();
  });
}
function removeMidiIn(name) {
  midiws.removeMidiIn(name);
  delete inputs[name];
  refresh();
}
function removeMidiOut(name) {
  midiws.removeMidiOut(name);
  delete outputs[name];
  refresh();
}

function updateIn(name, hide) {
  if (!inputs[name] || hide == !!inputs[name].hide) return;
  inputs[name].hide = hide;
  if (hide) midiws.removeMidiIn(name);
  else midiws.addMidiIn(name, inputs[name].port);
  refresh();
}

function updateOut(name, hide) {
  if (!outputs[name] || hide == !!outputs[name].hide) return;
  outputs[name].hide = hide;
  if (hide) midiws.removeMidiOut(name);
  else midiws.addMidiOut(name, outputs[name].port);
  refresh();
}

function refresh() {
  if (!master) return;
  var n, inp = {}, outp = {};
  for (n of Object.keys(inputs)) inp[n] = { open: !!inputs[n].port, hide: !!inputs[n].hide };
  for (n of Object.keys(outputs)) outp[n] = { open: !!outputs[n].port, hide: !!outputs[n].hide };
  master.send(JSON.stringify({ info: { inputs: inp, outputs: outp }}));
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