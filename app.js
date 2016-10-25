var express = require('express');
var app = express();
var firebase = require("firebase");
var request = require("request");
// var cheerio = require("cheerio");
var wildcardSubdomains = require('wildcard-subdomains')
var cors = require('cors')
var ineed = require('ineed');
var validate = require('validate.js')
var geoip = require('geoip-lite');
var device = require('express-device');
var dbserver = require('rethinkdb');

//mmmm
dbserver.connect({
    host: 'localhost',
    port: 28015
}, function(err, conn) {
    if (err) throw err;
    connection = conn;
});

let rdb = 'Urlsh';
let table = 'urls';


// validation rules
let urlConstraints = {
    website: {
        url: {
            allowLocal: false,
            schemes: ["http", "https"]

        },
        presence: true
    }
};



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
app.use(device.capture());

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

    function success(attributes) {


        // atomic update for the urls table
        dbserver.db(rdb).table('counter').get('2d881463-4f2d-4e62-a979-532bd49e1d02').update({
            count: dbserver.row('count').default(0).add(1)
        }, {
            nonAtomic: false,
            returnChanges: true
        }).run(connection, (err, result) => {

            let counter = result.changes[0].new_val.count;

            dbserver.db(rdb).table(table).insert({
                long_url: req.body.url,
                counter: result.changes[0].new_val.count,
                views: 0,
                short_url: (encode(result.changes[0].new_val.count)),
                // title: result.title,
                owner: req.body.owner || 'none'
            }, {
                returnChanges: true
            }).run(connection, (err, result) => {



                ineed.collect.title.from({
                    url: req.body.url
                }, function(err, response, result) {
                    if (err) throw err;


                    dbserver.db(rdb).table(table)
                        .filter(dbserver.row("counter").eq(counter))
                        .update({
                            title: result.title
                        }).
                    run(connection, function(err, result) {
                        if (err) throw err;

                    });


                });

                res.status(200).send({ short_url: encode(counter) })

            })


        });


    }

    function error(errors) {
        if (errors instanceof Error) {
            // This means an exception was thrown from a validator
            res.status(500).send({
                message: errors
            })
        } else {
            res.status(400).send({
                message: errors
            })
        }
    }


    //validate urls
    validate.async({
        website: req.body.url
    }, urlConstraints).then(success, error)


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

    //decode the short url
    var base58Id = req.params.encoded_id;
    var counter = decode(base58Id);

    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var geo = geoip.lookup(ip);


    // if id exist in the urls table, update the VIEWS field and start pushing data to the data table then redirect

    dbserver.db(rdb).table(table).filter(dbserver.row('counter').eq(counter))
        .update({ views: dbserver.row('views').default(0).add(1) }, {
            nonAtomic: false,
            returnChanges: true
        })
        .run(connection, (err, result) => {

            if (result.replaced === 1) {
                dbserver.db(rdb).table('data').insert({
                    urls_id: result.changes[0].new_val.id,
                    timestamp: dbserver.epochTime(1376436769.923),
                    location: geo || 'local',
                    ip: ip,
                    deviceType: req.device.type,
                    host: req.get('host') || '',
                    referer: req.header('Referer') || ''
                }).run(connection)

                res.send(result)
            } else {

                res.send({ updated: false });
            }



        })




    // urls.orderByChild("id").equalTo(id).limitToFirst(1).once('value', function(snapshot) {
    //     if (snapshot.val()) {

    //         firebase.database().ref('/data/' + id)
    //             .push({
    //                 time: Date.now(),
    //                 location: geo || 'local',
    //                 ip: ip,
    //                 devicType: req.device.type,
    //                 host: req.get('host') || '',
    //                 referer: req.header('Referer') || ''
    //             });

    //         var ref = db.ref("urls/" + Object.keys(snapshot.val())[0] + "/views");
    //         ref.transaction(function(curr) {
    //             return curr + 1;
    //         }, function function_name() {
    //             res.redirect((snapshot.val()[Object.keys(snapshot.val())[0]]).long_url);
    //         })

    //     } else {
    //         res.redirect(req.get('host'));
    //     }
    // })


});



app.get('/*', (req, res) => {



    var path = 'index.html';
    res.sendFile(path, {
        root: './frontend/build'
    });



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
