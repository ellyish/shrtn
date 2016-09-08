var express = require('express');
var app = express();
var firebase = require("firebase");
var request = require("request");
var cheerio = require("cheerio");
var wildcardSubdomains = require('wildcard-subdomains')
var cors = require('cors')


app.use(wildcardSubdomains({
    namespace: 's',
    www: 'false',
}))



app.use(express.static('./frontend/build'));


firebase.initializeApp({
    serviceAccount: "shrtn-c1fd13366162.json",
    databaseURL: "https://shrtn-7a4f0.firebaseio.com/"
});

// Get a database reference to our posts
var db = firebase.database();


var urls = db.ref("/urls");
var counter = db.ref("/counter");

var alphabet = "1234567890abcdefghijkmnopqrstuvwxyz";
var base = alphabet.length; // base is the length of the alphabet (58 in this case)


var bodyParser = require('body-parser');

// handles JSON bodies
app.use(bodyParser.json());
// handles URL encoded bodies
app.use(bodyParser.urlencoded({
    extended: true
}));


app.use(cors())



// utility function to convert base 10 integer to base 58 string
function encode(num) {
    var encoded = '';
    while (num) {
        var remainder = num % base;
        num = Math.floor(num / base);
        encoded = alphabet[remainder].toString() + encoded;
    }
    return encoded;
}




app.post('/api/shorten', function(req, res, next) {

    var regex = new RegExp("^(http[s]?:\\/\\/(www\\.)?|ftp:\\/\\/(www\\.)?|www\\.){1}([0-9A-Za-z-\\.@:%_\+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?");

    var longUrl = req.body.url;

    if (regex.test(longUrl)) {

        try {

            request({
                uri: longUrl,
            }, function(error, response, body) {

                if (error) {
                    res.status(500).send('Something broke!');

                } else {
                    var $ = cheerio.load(body);





                    urls.orderByChild("long_url").equalTo(longUrl).limitToFirst(1).once('value', function(snapshot) {

                        if (snapshot.val() === null) {

                            counter.transaction(function(curr) {
                                return (curr || 0) + 1;
                            }, function(err, committed, ss) {

                                urls.push({
                                    long_url: longUrl,
                                    id: ss.val(),
                                    views: 0,
                                    short_url: (encode(ss.val())),
                                    title: $("title").html()
                                });

                                res.send(encode(ss.val()));

                            })

                        } else {

                            res.send(encode((snapshot.val()[Object.keys(snapshot.val())[0]]).id));

                        }


                    })
                }





            });

        } catch (err) {
            console.log(err);
            res.status(500).send('Something broke!');
        }
    } else {
        res.status(500).send('not a url!');
        return false;
    }


});



function decode(str) {
    var decoded = 0;
    while (str) {
        var index = alphabet.indexOf(str[0]);
        var power = str.length - 1;
        decoded += index * (Math.pow(base, power));
        str = str.substring(1);
    }
    return decoded;
}




app.get('/s/:encoded_id', function(req, res) {
    var base58Id = req.params.encoded_id;
    var id = decode(base58Id);

    urls.orderByChild("id").equalTo(id).limitToFirst(1).once('value', function(snapshot) {
        if (snapshot.val()) {

            var ref = db.ref("urls/" + Object.keys(snapshot.val())[0] + "/views");
            ref.transaction(function(curr) {
                return curr + 1;
            }, function function_name() {
                res.redirect((snapshot.val()[Object.keys(snapshot.val())[0]]).long_url);
            })



        } else {
            res.redirect(req.get('host'));
        }
    })



});


app.get('/:encoded_id', function(req, res) {
    var base58Id = req.params.encoded_id;
    var id = decode(base58Id);

    urls.orderByChild("id").equalTo(id).limitToFirst(1).once('value', function(snapshot) {
        if (snapshot.val()) {

            var ref = db.ref("urls/" + Object.keys(snapshot.val())[0] + "/views");
            ref.transaction(function(curr) {
                return curr + 1;
            }, function function_name() {
                res.redirect((snapshot.val()[Object.keys(snapshot.val())[0]]).long_url);
            })



        } else {
            res.redirect('http://urlsh.me');
        }
    })



});







app.listen(3001)