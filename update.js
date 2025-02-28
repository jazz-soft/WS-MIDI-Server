const fs = require('fs');
const path = require('path');

const modules = path.join(__dirname, 'node_modules');
const content = path.join(__dirname, 'content');

fs.copyFileSync(path.join(modules, 'jzz', 'javascript', 'JZZ.js'), path.join(content, 'JZZ.js'));
fs.copyFileSync(path.join(modules, 'jzz-gui-select', 'javascript', 'JZZ.gui.Select.js'), path.join(content, 'JZZ.gui.Select.js'));
fs.copyFileSync(path.join(modules, 'jzz-input-kbd', 'javascript', 'JZZ.input.Kbd.js'), path.join(content, 'JZZ.input.Kbd.js'));
fs.copyFileSync(path.join(modules, 'jzz-midi-ws', 'javascript', 'JZZ.midi.WS.js'), path.join(content, 'JZZ.midi.WS.js'));
fs.copyFileSync(path.join(modules, 'jzz-synth-tiny', 'javascript', 'JZZ.synth.Tiny.js'), path.join(content, 'JZZ.synth.Tiny.js'));
