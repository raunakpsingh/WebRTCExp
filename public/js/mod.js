(function() {
    $('#conversation_box').css("visibility", "hidden");

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
        // var audioContext = new AudioContext; //or webkitAudioContext
        // var source = audioContext.createMediaStreamSource(mediaStream);

        // var volume = audioContext.createGain();
        // source.connect(volume);
        // volume.connect(audioContext.destination);
        // volume.gain.value = 0; //turn off the speakers

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
            destId = data[0];
            $("#conversation").append("<div >Opponent's message: " + data[1] + '</div>');
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
            $("#details_box").append("<div > Your peer id is: " + secPeerId + '</div>');
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
            $('#conversation_box').css("visibility", "initial");
            begin();
        });
        peer.on('call', function(recdConn) {
            recdConn.answer(myStream);
            recdConn.on("stream", function(stream) {
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
            destId = prompt("Opponent's peer ID:");
            $("#details_box").append("<div > Your opponent's peer id is: " + destId + '</div>');
            console.log(destId);
            conn = peer.connect(destId, {
                reliable: true
            });
            conn.on('open', function() {
                console.log(":Hell");
                $('#conversation_box').css("visibility", "initial");
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

    $('#enter').on('click', function(event) {
        sendMessage(event);
    });

    $('#message').on('keypress', function(e) {
        if (e.which === 13) {
            sendMessage(e);
        }
    });

    function sendMessage(event) {
        event.preventDefault();
        console.log("Entered");
        var data = $("#message").val();
        console.log(data);
        name = secPeerId;
        conn.send([name, data]);
        $("#conversation").append("<div > You: " + data + '</div>');
        $("#message").val("");
    }
})()
