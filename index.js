
'use strict';

var kad = require('kad');
var traverse = require('kad-traverse');
var events = require('events');

var loglv = 3;

var event = new events.EventEmitter();
event.on('network-ready', senddata);

var NatTransport = new traverse.TransportDecorator(kad.transports.TCP);

var seeds = [
    {
        address: '127.0.0.1',
        port: 1336
    },
    {
        address: '127.0.0.1',
        port: 1337
    },
    {
        address: '127.0.0.1',
        port: 1338
    }
];

var nodes = [];
var connected = 0;

seeds.forEach(function (seed) {
    var contact  = kad.contacts.AddressPortContact({
        address: seed.address,
        port: seed.port
    });

    nodes.push(new kad.Node({
        transport: NatTransport(contact, {
            traverse: {
                upnp: {
                    forward: contact.port,
                    ttl: 32,
                    log: kad.Logger(loglv, 'UPnP'+contact.port)
                },
                stun: { },
                turn: { },
                log: kad.Logger(loglv, 'Traverse'+contact.port)
            }
        }),
        // transport: kad.transports.TCP(contact),
        storage: kad.storage.MemStore(),
        logger: kad.Logger(loglv, 'NODE'+ contact.port)
    }));
});

if (nodes.length < 2) {
    console.log('cannot create network without more than 2 nodes');
    process.exit();
}

for (var n = 0; n < nodes.length; n++) {
    let node_this = nodes[n];
    let node_next = nodes[n + 1] ? nodes[n + 1] : nodes[0];

    node_this.connect(node_next._self, function(err) {
        if (err) {
            console.log('%s connect to %s error, %s', node_this._self.nodeID, node_next._self.nodeID, err);
            process.exit();
        }

        console.log('%s connected to %s', node_this._self.nodeID, node_next._self.nodeID);

        connected++;

        if (connected == nodes.length) {
            event.emit('network-ready');
        }

    });
}

function senddata () {
    var keys = ['key1', 'key2', 'key3'];

    console.log('start to transfer data...');

    // put sample data
    keys.forEach(function (key) {
        var value = key + 'data';
        nodes[0].put(key, value, function (err) {
            if (err) {
                console.log('node[1].put error, %s', err);
                process.exit();
            }

            console.log('node[1].put done: %s -> %s', key, value);

            // get and display from another node
            nodes[1].get(key, function (err, value2) {
                if (err) {
                    console.log('node[2].get error, %s', err);
                    process.exit();
                }

                console.log('node[2].get done: %s -> %s', key, value2);
            });
        });
    });
}





