var express = require("express");
const googleImages = require('google-images');
var client = googleImages('014961637787447552939:ukel08tsrps', 'AIzaSyAL1NHb040PFKxfiX-caPZg_X6EU9_ynjM');
var mongoClient = require("mongodb").MongoClient;
var user = 'admin';
var password = '12345678';

var MONGOLAB_URI = 'mongodb://'+user+':'+password+'@ds017736.mlab.com:17736/urlshortener';

var app = express();

app.set('port', process.env.PORT || 5000);

app.get('/api/imagesearch/:search_str', (req,res) => {
    var search_str = req.params.search_str;
    var offset = 1;
    
    mongoClient.connect(MONGOLAB_URI,(error,db) => {
        if (error) throw(error);
         db.collection('searchs')
            .insertOne({
                term:search_str,
                when: new Date()
            },(err,result) => {
                db.close();
                if (err) throw(err);
            });
    });
    
    if (req.query.offset){
        offset = req.query.offset;    
    }
    
    client.search(search_str,{
        page:offset
    })
    .then(function (images) {
        res.json(images);
    });

});

app.get('/api/latest/imagesearch/',(req,res) => {
    mongoClient.connect(MONGOLAB_URI,(err,db) => {
        if (err) throw(err);
        var collection = db.collection('searchs');
        collection.find({},{_id:0}).toArray(function(err, docs) {
          res.json(docs);
          db.close();
        });
    })
});

app.listen(app.get('port'),() => {
    console.log('App is listening at port ' + app.get('port'));
})