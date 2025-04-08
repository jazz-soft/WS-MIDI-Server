# WS-MIDI-Server
WebSocket MIDI Server

## Usage
`npm install`  
`npm start` or `npm start -- <port>`,  
where `<port>` is the port number, default: `8888`

## How it works
![MIDI via WebSockets server screenshot](https://raw.githubusercontent.com/jazz-soft/WS-MIDI-Server/refs/heads/main/content/screen.png)

This application exposes the MIDI ports available on your system,
plus Virtual Piano and Web Audio synth on the Master page.

Remote client applications can use https://github.com/jazz-soft/JZZ-midi-WS
to access these MIDI ports via the WebSockets.

Or, you can implement your own client in any language,
since the JSON protocol is quite straightforward. (Just check the code!)

Test client page is included.