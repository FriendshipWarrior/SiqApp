var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var mongoClient = mongo.MongoClient;

// REST API V2 calls go here.
router.get('/api/v2/entries.json', function(req, res) {
    mongoClient.connect('mongodb://localhost:27017/test', function(err, db) {
        if (err) {
            throw err;
        }
        db.collection('entries').find({},{subject:1}).toArray(function(err, result) {
            if (err) {
                throw err;
            }
            res.status(200).json(result);
            db.close();
        });
    });
});

// Create
router.post('/api/v2/entries.json', function(req, res){
    // Store new entry and return id.
    console.log(req.body);
    // {"subject":"Something else","contents":"This is the contents for 'Something else'"}
    var newObj = {};
    newObj.subject = req.body.subject;
    newObj.contents = req.body.contents;

    mongoClient.connect('mongodb://localhost:27017/test', function(err, db) {
        if (err) {
            throw err;
        }
        db.collection('entries').insert(newObj, function(err, result) {
            if (err) {
                throw err;
            }
            res.status(201).json(result.ops[0]._id);
            db.close();
        });
    });
});

// Read
router.get('/api/v2/entries/:id.json', function(req, res){
    var id = new mongo.ObjectId(req.params.id);

    mongoClient.connect('mongodb://localhost:27017/test', function(err, db) {
        if (err) {
            throw err;
        }
        console.log(`Checking mongodb for _id:${id}`);
        //find({_id:ObjectId("56fab77f6ab3ead947e97973")})
        db.collection('entries').find({_id:id}).toArray(function(err, result) {
            if (err) {
                console.log(`Reading _id ${id} failed: ${err}`)
                throw err;
            }
            console.log(`Reading _id succeeded with result: ${result[0]}`)
            res.status(201).json(result[0]);
            db.close();
        });
    });
});

// Update
router.put('/api/v2/entries/:id.json', function(req, res){
    var object = {};
    var id = new mongo.ObjectId(req.params.id);
    var subject = req.body.subject;
    var contents = req.body.contents;
    
    object._id = id;
    object.subject = subject;
    object.contents = contents;

    mongoClient.connect('mongodb://localhost:27017/test', function(err, db) {
        if (err) {
            throw err;
        }
        db.collection('entries').update({_id:id}, object, function(err, result) {
            if (err) {
                console.log(`Updating _id ${id} failed: ${err}`)
                throw err;
            }
            console.log(`Updating _id succeeded with result: ${result}`)
            res.sendStatus(204);
            db.close();
        });
    });
});

// Delete
router.delete('/api/v2/entries/:id', function(req, res){
    var id = new mongo.ObjectId(req.params.id);

    mongoClient.connect('mongodb://localhost:27017/test', function(err, db) {
        if (err) {
            throw err;
        }
        console.log(`Checking mongodb for _id:${id}`);
        //find({_id:ObjectId("56fab77f6ab3ead947e97973")})
        db.collection('entries').remove({_id:id}, function(err, result) {
            if (err) {
                console.log(`Deleting _id ${id} failed: ${err}`)
                throw err;
            }
            console.log(`Deleting _id succeeded with result: ${result}`)
            res.sendStatus(204);
            db.close();
        });
    });
});

module.exports = router;
// END REAST API V2 CALLS.
