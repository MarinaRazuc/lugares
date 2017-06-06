var express = require("express");
var bodyParser = require("body-parser");
const path = require('path');
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;

var CONTACTS_COLLECTION = "lugares";

var app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

// Connect to the database before starting the application server. 
mongodb.MongoClient.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/lugares", function (err, database) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  // Save database object from the callback for reuse.
  db = database;
  console.log("Database connection ready");

  // Initialize the app.
  var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
});

// CONTACTS API ROUTES BELOW

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

/*  "/lugares"
 *    GET: finds all contacts
 *    POST: creates a new contact
 */

app.get("/lugares", function(req, res) {
  db.collection(CONTACTS_COLLECTION).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get lugares.");
    } else {
      res.status(200).json(docs);  
    }
  });
});

app.post("/lugares", function(req, res) {
  var newLugar = req.body;

  newLugar.createDate = new Date();

  if (!(req.body.nombre)){
    handleError(res, "Invalid user input", "Must provide nombre.", 400);
  }
  else
  if(!(req.body.latitud)){
    handleError(res, "Invalid user input", "Must provide latitud.", 400);
  }
  else
  if (!(req.body.longitud)) 
  {
        handleError(res, "Invalid user input", "Must provide longitud", 400);
  }


  db.collection(CONTACTS_COLLECTION).insertOne(newLugar, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to create new contact.");
    } else {
      res.status(201).json(doc.ops[0]);
    }
  });
});

/*  "/contacts/:id"
 *    GET: find contact by id
 *    PUT: update contact by id
 *    DELETE: deletes contact by id
 */

app.get("/lugares/:id", function(req, res) {
  db.collection(CONTACTS_COLLECTION).find({ _id: new ObjectID(req.params.id) }).limit(1).next(function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to get contact");
    } else {
      res.status(200).json(doc);  
    }
  });
});

app.put("/lugares/:id", function(req, res) {
  var updateDoc = req.body;
  delete updateDoc._id;

  db.collection(CONTACTS_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, updateDoc, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to update contact");
    } else {
      res.status(204).end();
    }
  });
});

app.delete("/lugares/:id", function(req, res) {
  db.collection(CONTACTS_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {
    if (err) {
      handleError(res, err.message, "Failed to delete contact");
    } else {
      res.status(204).end();
    }
  });
});