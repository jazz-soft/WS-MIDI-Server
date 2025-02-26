const ws = require('ws');
const JZZ = require('jzz');
require('jzz-midi-ws')(JZZ);
const wss1 = new ws.WebSocketServer({ noServer: true });
const wss2 = new ws.WebSocketServer({ noServer: true });
const midiws = new JZZ.WS.Server(wss1);

const virtual_in = new JZZ.Widget();
const virtual_out = new JZZ.Widget();

JZZ().and(function() {
    var p;
    var info = JZZ().info();
    for (p of info.inputs) midiws.addMidiIn(p.id, JZZ().openMidiIn(p.id));
    for (p of info.outputs) midiws.addMidiOut(p.id, JZZ().openMidiOut(p.id));
    midiws.addMidiIn('Virtual', virtual_in);
    midiws.addMidiOut('Web Audio', virtual_out);
}).or('Cannot start MIDI engine!');

module.exports = {
  wss: function (req, socket, head) {
    console.log('Req URL:', req.url);
    if (req.url == '/') {
      wss1.handleUpgrade(req, socket, head, function(ws) { wss1.emit('connection', ws, req); });
    }
    else if (req.url == '/master' && req.get('host').split(':')[0] == 'localhost') {
      wss2.handleUpgrade(req, socket, head, function(ws) { wss2.emit('connection', ws, req); });
    }
    else {
      socket.destroy();
    }
  }
}