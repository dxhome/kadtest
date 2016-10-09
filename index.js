
'use strict';

var kad = require('kad');
var traverse = require('kad-traverse');
var events = require('events');
var retry = require('retry');

var loglv = 3;

var event = new events.EventEmitter();

var NatTransport = new traverse.TransportDecorator(kad.transports.TCP);

// var localip = '10.32.109.241';
var localip = '192.168.0.4';
var seeds = [
    {
        address: localip,
        port: 2336
    },
    {
        address: localip,
        port: 2337
    },
    {
        address: localip,
        port: 2338
    }
];

var peerContact = kad.contacts.AddressPortContact({
    address: '10.0.0.210',
    port: 1336
});

var nodes = [];
var connected = 0;

console.log('Waiting...');

event.on('network-ready', dotest);

setTimeout(setupNetwork, 5000);

function setupNetwork () {

    seeds.forEach(function (seed) {
        var contact  = kad.contacts.AddressPortContact({
            address: seed.address,
            port: seed.port
        });

        nodes.push(new kad.Node({
            transport: NatTransport(contact, {
                traverse: {
                    none: {},
                    upnp: {
                        forward: contact.port,
                        ttl: 32
                    },
                    stun: { },
                    turn: { },
                },
                // logger: kad.Logger(loglv, 'RPC'+contact.port),
            }),
            // transport: kad.transports.TCP(contact),
            storage: kad.storage.MemStore(),
            logger: kad.Logger(loglv, 'NODE'+ contact.port)
        }));
    });

    // if (nodes.length < 2) {
    //     console.log('cannot create network without more than 2 nodes');
    //     process.exit();
    // }

    // connect each others at local, and then connect a remote node
    for (let n = 0; n < nodes.length; n++) {
        let node_this = nodes[n];
        // let contact_to = nodes[n + 1] ? nodes[n + 1]._self : peerContact;
        let contact_to = nodes[n + 1] ? nodes[n + 1]._self : nodes[0]._self;

        (function (nodefrom, nodeto) {

            var ops = retry.operation({
                retries: 5,
                factor: 3,
                minTimeout: 1 * 1000,
                maxTimeout: 10 * 1000,
                randomize: true,
            });

            ops.attempt(function (currentAttempt) {
                nodefrom.connect(nodeto, function(err) {
                    if (err) {
                        console.log('%s connect to %s error, tried %d times\n%s', nodefrom._self.toString(), nodeto.toString(), currentAttempt, err.stack);

                        if (ops.retry(err)) {
                            // process.exit();
                            return;
                        }
                    }

                    console.log('%s connected to %s', nodefrom._self.toString(), nodeto.toString());

                    connected++;

                    if (connected == nodes.length) {
                        event.emit('network-ready');
                    }
                });
            });

        })(node_this, contact_to);
    }
}

function dotest () {
    var self = nodes[0];
    var other = nodes[0];

    setInterval(function () {
        console.log('List current contacts...');
        for (let k in self._router._buckets) {
            let contactlist = self._router._buckets[k].getContactList();
            if (! contactlist) {
                console.log('no contacts found');
            } else {
                contactlist.forEach(function (c) {
                    console.log('found contact %j', c);
                });
            }
        }
    }, 5000);

    console.log('Transfer data...');
    var keys = ['key1', 'key2', 'key3'];
    // get sample data if have
    keys.forEach(function (key) {
        other.get(key, function (err, value2) {
            if (err) {
                console.log('node[%s].get error, %s', other._self.toString(), err);
                process.exit();
            }

            console.log('node[%s].get done: %s -> %s', other._self.toString(), key, value2);
        });
    });

    // put sample data
    // keys.forEach(function (key) {
    //     var value = key + 'data';
    //     self.put(key, value, function (err) {
    //         if (err) {
    //             console.log('node[%s].put error, %s', self._self.toString(), err);
    //             process.exit();
    //         }
    //
    //         console.log('node[%s].put done: %s -> %s', self._self.toString(), key, value);
    //
    //         // get and display from another node
    //         other.get(key, function (err, value2) {
    //             if (err) {
    //                 console.log('node[%s].get error, %s', other._self.toString(), err);
    //                 process.exit();
    //             }
    //
    //             console.log('node[%s].get done: %s -> %s', other._self.toString(), key, value2);
    //         });
    //     });
    // });
}





