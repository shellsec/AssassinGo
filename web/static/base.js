String.prototype.format = function(args) {
    var result = this;
    if (arguments.length < 1) {
        return result;
    }

    var data = arguments; 
    if (arguments.length == 1 && typeof (args) == "object") {
        data = args;
    }
    for (var key in data) {
        var value = data[key];
        if (undefined != value) {
            result = result.replace("{" + key + "}", value);
        }
    }
    return result;
}

var routes = ["#home", "#seek", "#shadow", "#attack", "#assassinate"];

var animates = ["horizontal flip", "vertical flip", "drop", "zoom", 
        "slide down", "slide up", "slide left", "slide right", 
        "fade up", "fade left","fade down", "fade right"];

var iconMap = {'#home':'home', 
            '#seek':'search',
            '#shadow':'spy',
            '#attack':'block layout',
            '#assassinate':'smile'};

var html_shadow_port = `
        <tr>
        <td>{port}</td>
        <td>{service}</td>
        </tr>
        `

var html_shadow_url = `
        <tr>
        <td>{url}</td>
        </tr>
`

var html_attack_sqli_url = `
        <tr>
        <td>{url}</td>
        </tr>
`

var html_attack_xss_url = `
        <tr>
        <td>{url}</td>
        </tr>
`

var html_attack_inturder = `
        <tr>
        <td>{payload}</td>
        <td>{resp_status}</td>
        <td>{resp_len}</td>
        </tr>
`

var html_seeker = `
        <tr>
        <td>{url}</td>
        </tr>
`

function router() {
    hash = window.location.hash;
    if (hash == "") {
        $(location).attr('href', '/#home');
    }
    for (var i=0; i<routes.length; i++) {
        if (routes[i]!=hash) {
            $(routes[i]).transition('hide');
        }
    }
    j = Math.floor(Math.random() * Math.floor(animates.length));
    $(hash).transition(animates[j], '400ms');
}

function changeColor() {
    hash = window.location.hash;
    $(hash+"-sd").attr("class", "orange "+iconMap[hash]+" icon");
    for (var i=0; i<routes.length; i++) {
        if (routes[i]!=hash) {
            $(routes[i]+"-sd").attr("class", "teal "+iconMap[routes[i]]+" icon");
        }
    }
}

$(window).bind('hashchange', function() {
    router();
    changeColor();
});

function reset() {
    $("#port-table").html("");
    $("#ip").html("IP Address: ");
    $("#server").html("Web Server: ");
    $("#cms").html("CMS: ");
    $("#url-table").html("");
    $("#email-table").html("");
    $("#sqli-url-table").html("");
    $("#xss-url-table").html("");
}

// function portScan() {
//     $("#port-table").html("");
//     $.ajax({
//         url: "/api/info/port",
//         type: "GET",
//         dataType: "JSON",
//         beforesend: $("#port-loading").show(),
//     }).done(function (result) {
//         $("#port-loading").hide();
//         ports = result.data.ports.sort(function sequence(a,b){
//             return a - b;
//         });
//         if (ports.length>0) {
//             for (var i=0; i<ports.length;i++) {
//                 h = html_shadow_port.format({"port":ports[i],"service":"open"})
//                 $("#port-table").append(h)
//             }
//         }
//     })
// }

// function basicInfo() {
//     $("#ip").html("IP Address: ")
//     $("#server").html("Web Server: ")
//     $.ajax({
//         url: "/api/info/basic",
//         type: "GET",
//         dataType: "JSON",
//         beforesend: $("#ip-loading, #server-loading").show(),
//     }).done(function (result) {
//         $("#ip-loading, #server-loading").hide();
//         ip=result.data.ip; server=result.data.webserver;
//         $("#ip").html("IP Address: "+ip);
//         $("#server").html("Web Server: "+server);
//     })
// }

// function cmsDetect() {
//     $("#cms").html("CMS: ");
//     $.ajax({
//         url: "/api/info/cms",
//         type: "GET",
//         dataType: "JSON",
//         beforesend: $("#cms-loading").show(),
//     }).done(function (result) {
//         $("#cms-loading").hide();
//         cms=result.data.cms;
//         if (cms.length==0) {
//             cms = "Unknown";
//         }
//         $("#cms").html("CMS: "+cms);
//     })
// }

function tracert() {
    $("#xss-url-table").html("")
    var socket = new WebSocket("ws://localhost:8000/ws/info/tracert")
    socket.onmessage = function (e) {
        ret = JSON.parse(e.data);
        console.log(e.data)
    }
    socket.onclose = function () {
        $("#xss-url-table").append("Finished");
    }
}

function crawl() {
    $("#url-table").html("");
    $("#email-table").html("");
    var socket = new WebSocket("ws://localhost:8000/ws/info/crawl")
    // socket.onopen = function() {
    //     container.append("<p>Socket is open</p>");
    // };
    socket.onmessage = function (e) {
        ret = JSON.parse(e.data);
        h = html_shadow_url.format({"url": ret.url})
        $("#url-table").append(h);
    }
    socket.onclose = function () {
        $("#url-table").append("Finished");
    }
    return socket;
}

function sqliCheck() {
    $("#sqli-url-table").html("")
    var socket = new WebSocket("ws://localhost:8000/ws/vul/sqli")
    socket.onmessage = function (e) {
        ret = JSON.parse(e.data);
        h = html_attack_sqli_url.format({"url":ret.url})
        $("#sqli-url-table").append(h)
    }
    socket.onclose = function () {
        $("#sqli-url-table").append("Finished");
    }
}

function xssCheck() {
    $("#xss-url-table").html("")
    var socket = new WebSocket("ws://localhost:8000/ws/vul/xss")
    socket.onmessage = function (e) {
        ret = JSON.parse(e.data);
        h = html_attack_xss_url.format({"url":ret.url})
        $("#xss-url-table").append(h)
    }
    socket.onclose = function () {
        $("#xss-url-table").append("Finished");
    }
}


function intruder() {
    $("#intruder-table").html("")
    var socket = new WebSocket("ws://localhost:8000/ws/intrude")
    socket.onopen = function(e) {
        var msg = {
            header: `POST /1.php HTTP/1.1
Host: sweety-birdsong-recg.cc:8888
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:61.0) Gecko/20100101 Firefox/61.0
Accept: */*
Accept-Language: en-US,en;q=0.5
Content-Type: application/x-www-form-urlencoded

user=$$1$$&passwd=2`,
            payload: "1,22,333",
            gort_count: 100,
        }
        var a = JSON.stringify(msg);
        
        socket.send(a)
        socket.send(JSON.stringify({stop:1}))
    }
    socket.onmessage = function (e) {
        ret = JSON.parse(e.data);
        h = html_attack_inturder.format({"payload": ret.payload,
                                        "resp_status": ret.resp_status,
                                        "resp_len": ret.resp_len})
        $("#intruder-table").append(h)
    }
    socket.onclose = function () {
        $("#intruder-table").append("Finished");
    }
}

function seeker(q, p) {
    $("#seeker-table").html("")
    var socket = new WebSocket("ws://localhost:8000/ws/seek")
    socket.onopen = function(e) {
        var msg = {
            query: q,
            se: "bing",
            max_page: p,
        }
        var a = JSON.stringify(msg);
        socket.send(a)
    }
    socket.onmessage = function (e) {
        ret = JSON.parse(e.data);
        for(var i=0;i<ret.urls.length;i++) {
            h = html_seeker.format({"url":ret.urls[i]})
            $("#seeker-table").append(h)
        }
        
    }
    socket.onclose = function () {
        $("#seeker-table").append("Finished");
    }
}


function runPoCforSA() {
    var socket = new WebSocket("ws://localhost:8000/ws/poc/run")
    socket.onopen = function(e) {
        var msg = {
            poc: "drupal-rce",
            gort_count: 2,
        }
        var a = JSON.stringify(msg);
        socket.send(a)
    }
    socket.onmessage = function (e) {
        ret = JSON.parse(e.data)
        console.log(ret)
    }
}

$(document).ready(function(){
    router();
    changeColor();
    $("#bt-set-target").click(function(){
        reset();
        $.ajax({
            url:" /api/assassin",
            type: "POST",
            data: "target="+$("#target").val(),
            dataType: "JSON",
        }).done(function (result) {
            if (result.status == "success") {
                
            } else {
                alert(result.message)
            }
        }).fail(function(result){
            alert("some thing error")
        });
        $(location).attr('href', '/#shadow');
    });

    $("#start-shadow").click(function(){
        basicInfo();
        portScan();
        cmsDetect();
        crawl();
    });

    $("#start-attack").click(function(){
        sqliCheck();
        xssCheck();
        // intruder();
    });

    $("#start-seek").click(function(){
        seeker();
    })
});