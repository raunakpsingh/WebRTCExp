(function() {
    $('#conversation_box').css("visibility", "hidden");
    $('#second_box').css("visibility", "hidden");

    var peer = null;
    var peerId = null;
    var conn = null;
    var opponent = {
        peerId: null
    };
    var turn = false;
    var ended = false;
    var name = "";

    $('#proceed').on('click', function(event) {
        if ($("#name").val().trim() == "") {
            return;
        }else{
            name = $("#name").val().trim();
            console.log(name);
        }
        $("#second_box").append("<div >Your name is:" + name + "</div>");
        $('#second_box').css("visibility", "initial");
        $('#first_box').css("display", "none");
        $('#first_box').css("visibility", "hidden");
    });

    function begin() {
        conn.on('data', function(data) {
            console.log(data);
            $("#conversation").append("<div >" + data[0] + "'s message: " + data[1] + '</div>');
        });
        conn.on('close', function() {
            alert(name + " has ended the conversation");
        });
        peer.on('error', function(err) {
            alert('' + err);
        });
    };

    $('#enter').on('click', function(event) {
        event.preventDefault();
        console.log("Entered");
        var data = $("#message").val();
        console.log(data);
        conn.send([name, data]);
        $("#conversation").append("<div > You: " + data + '</div>');
    });

    function initialize() {
        peer = new Peer('', {
            host: location.hostname,
            port: location.port || (location.protocol === 'https:' ? 443 : 80),
            path: '/peerjs',
            debug: 3
        });
        peer.on('open', function(id) {
            console.log(id);
            peerId = id;
        });
        peer.on('error', function(err) {
            alert(err);
        });
    };

    function start() {
        initialize();
        peer.on('open', function() {
            console.log("Open");
        });
        peer.on('connection', function(c) {
            if (conn) {
                c.close();
                return;
            }
            conn = c;
            $('#conversation_box').css("visibility", "initial");
            begin();
        });
    };

    function join() {
        initialize();
        peer.on('open', function() {
            var destId = prompt("Opponent's peer ID:")
            conn = peer.connect(destId, {
                reliable: true
            });
            conn.on('open', function() {
                opponent.peerId = destId;
                $('#conversation_box').css("visibility", "initial");
                turn = false;
                begin();
            });
        });
    };

    $('a[href="#start"]').on('click', function(event) {
        event.preventDefault();
        start();
    });
    $('a[href="#join"]').on('click', function(event) {
        event.preventDefault();
        join();
    });

})()
