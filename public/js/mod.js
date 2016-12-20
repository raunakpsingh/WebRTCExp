(function() {
    $('#second_box').css("visibility", "hidden");

    var peerId = null;
    var conn = null;
    var opponent = {
        peerId: null
    };
    var turn = false;
    var ended = false;
    var name = "";
    var mediaConnection = null;
    var destId = "";

    $('#second_box').css("visibility", "initial");

    navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
    window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL;

    var constraints = { video: true, audio: true };
    if (navigator.getUserMedia) {
        navigator.getUserMedia({ video: true, audio: true }, getMediaSuccess, getMediaError);
    } else {
        alert('getUserMedia not supported.');
    }

    function getMediaSuccess(mediaStream) {
        myStream = mediaStream;
        PlayVideo(mediaStream);
    };

    function getMediaError() {

    };

    function PlayVideo(stream) {
        video = document.querySelector('video');
        console.log(stream);
        video.src = window.URL.createObjectURL(stream);
        video.onloadedmetadata = function(e) {
            video.play();
        }
    };

    // $('#proceed').on('click', function(event) {
    //     if ($("#name").val().trim() == "") {
    //         return;
    //     } else {
    //         name = $("#name").val().trim();
    //         console.log(name);
    //     }
    //     $("#second_box").append("<div >Your name is:" + name + "</div>");
    //     $('#second_box').css("visibility", "initial");
    //     $('#first_box').css("display", "none");
    //     $('#first_box').css("visibility", "hidden");
    // });

    function setUpMediaConnection(mediaConn) {
        mediaConn.on("stream", function(stream) {
            PlayVideo2(stream);
        });
    };

    function begin() {
        conn.on('data', function(data) {
            console.log(data);
        });
        conn.on('close', function() {
            alert(name + " has ended the conversation");
        });
        peer.on('error', function(err) {
            alert('' + err);
        });
    };

    function PlayVideo2(stream) {
        console.log("stream received");
        console.log(stream);
        remoteStream = document.getElementById('remoteVideo');
        remoteStream.src = window.URL.createObjectURL(stream);
        remoteStream.onloadedmetadata = function(e) {
            remoteStream.play();
        };
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
            secPeerId = id;
        });
        peer.on('error', function(err) {
            alert(err);
        });
    };

    function start() {
        initialize();
        peer.on('connection', function(c) {
            if (conn) {
                c.close();
                return;
            }
            conn = c;
            begin();
        });
        peer.on('call', function(recdConn) {
            recdConn.answer(myStream);
            recdConn.on("stream",function(stream){
                PlayVideo2(stream);
            });
            mediaConnection = recdConn;
            console.log(mediaConnection.type);
            PlayVideo2(mediaConnection);
            // Answer the call, providing our mediaStream
            setUpMediaConnection(mediaConnection);
            mediaConnection.answer([myStream]);
            mediaConnection.on('stream', PlayVideo2);
            mediaConnection.on('close', function() {
                console.log("Closed MediaStream");
            });
            mediaConnection.on("error", function() {
                console.log("error occured");
            });

        });
    };

    function join() {
        initialize();
        peer.on('open', function(id) {
            console.log(id);
            secPeerId = id;
            destId = prompt("Opponent's peer ID:")
            console.log(destId);
            conn = peer.connect(destId, {
                reliable: true
            });
            conn.on('open', function() {

                begin();
            });
        });
    };

    function callPeer() {
        console.log("Not My Peer Id " + destId);

        console.log("My Id " + secPeerId);

        var call = peer.call(destId, myStream);

        call.on('stream', function(stream) {
            console.log("Here");
            // `stream` is the MediaStream of the remote peer.
            // Here you'd add it to an HTML video/canvas element.
            PlayVideo2(stream);
        });
        //PlayAudio(stream);

    };

    $('a[href="#start"]').on('click', function(event) {
        event.preventDefault();
        start();
    });
    $('a[href="#join"]').on('click', function(event) {
        event.preventDefault();
        join();
    });
    $('a[href="#call"]').on('click', function(event) {
        event.preventDefault();
        console.log("Clicke");
        callPeer();
    });

})()
