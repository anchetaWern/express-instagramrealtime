var express = require('express');
var app = express(); // create a new expressJS app

var exphbs  = require('express-handlebars');

var moment = require('moment');

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // set the app to use the body parser
app.use(bodyParser.urlencoded());

app.engine('handlebars', exphbs({defaultLayout: 'main'})); // set the file name of the default layout
app.set('view engine', 'handlebars'); // set the expressJS view engine to handlebars

app.use(express.static('public')); // set the path to the front-end assets

var instagram = require('instagram-node-lib');

var instagram_client_id = 'YOUR INSTAGRAM CLIENT ID';
var instagram_client_secret = 'YOUR INSTAGRAM CLIENT SECRET';

instagram.set('client_id', instagram_client_id);
instagram.set('client_secret', instagram_client_secret);

var server = app.listen(4000, function(){

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});

var io = require('socket.io').listen(server);

app.get('/', function(req, res){

    res.render('home');

});


var current_tag;

app.post('/tag/subscribe', function(req, res){

    current_tag = req.body.tag;

    console.log('current tag: ' + current_tag);

    instagram.tags.unsubscribe_all({
        complete: function(unsubscribe_data) {
            if(unsubscribe_data == null){
                console.log('unsubscribed from everything!');

                // subscribe to the new hashtag that the user has entered
                instagram.tags.subscribe(
                    { 
                        object_id: current_tag,
                        //replace callback_url with your https ngrok url
                        callback_url: 'https://xxxxxxxx.ngrok.io/subscribe',
                        complete: function(subscribe_data){
                            if(subscribe_data){ // check if response is valid
                                
                                res.send({type: 'success'});
                            }
                        }
                    }
                );

            }
        }
    });


});

app.get('/subscribe', function(req, res){

    res.send(req.query['hub.challenge']);
});

app.post('/subscribe', function(req, res){
    
    // get the most recent photo posted which has the tag that the user has specified
    instagram.tags.recent({ 
        name: current_tag,
        count: 1,
        complete: function(data){
            //store the data that you need
            var photo = {
                'user': data[0].user.username,
                'profile_pic': data[0].caption.from.profile_picture,
                'created_time': data[0].created_time,
                'image': data[0].images.standard_resolution.url,
                'caption': data[0].caption.text
            };
            //send it to the client-side
            io.sockets.emit('new_photo', photo);
        } 
    });

});