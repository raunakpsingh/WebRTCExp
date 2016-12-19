(function() {
    var peer = null;
    var connection = null;


    $('a[href="#start"]').on('click', function(event) {
        event.preventDefault();
        start();
    });
    $('a[href="#join"]').on('click', function(event) {
        event.preventDefault();
        join();
    });

    function start() {

        peer = new Peer('123456789', {
            host: location.hostname,
            port: location.port || (location.protocol === 'https:' ? 443 : 80),
            path: '/peerjs',
            debug: 3,
            secure: true
        });

        peer.on('open', function(id) {
            console.log(id);
            console.log("Peer connection open");
            secPeerId = id;
        });

        peer.on('error', function(err) {
            alert(err);
        });
    };

    function join() {

    };

})()
