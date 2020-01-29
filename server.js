// Dependencies
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongojs = require("mongojs");

let mongoose = require("mongoose");
let workout = require("./dev/models/workout.js");

const app = express();
const PORT = process.env.PORT || 5500;

// Sets up the Express app to handle data parsing
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost/workout", {
    useNewUrlParser: true
  })
  .then(() => console.log("MongoDB successfully connected"))
  .catch(err => console.log(err));

app.get("/exercise", function(req, res) {
  console.log("we hit the route");
  res.sendFile(path.join(__dirname, "public/exercise.html"));
});

app.get("/stats", function(req, res) {
  console.log("we hit the route");
  res.sendFile(path.join(__dirname, "public/stats.html"));
});

app.get("/api/workouts", function(req, res) {
  workout.find({}).then(function(w) {
    res.json(w);
  });
});

app.get("/api/workouts/range", function(req, res) {
  workout.find({}).then(function(w) {
    while (w.length > 7) {
      let first = workout.shift();
    }
    res.json(w);
  });
});

//create new workout
app.post("/api/workouts/", function(req, res) {
  workout.create({}).then(data => {
    res.json(data);
  });
});

app.put("/api/workouts/:id", function(req, res) {
  workout.find({ _id: mongojs.ObjectId(req.params.id) }, (error, found) => {
    if (error) {
      console.log(error);
    } else {
      console.log(found);
      const newWorkout = req.body;
      console.log(newWorkout);
      const workoutList = found[0].exercises;
      workoutList.push(newWorkout);
      workout.updateOne(
        {
          _id: mongojs.ObjectId(req.params.id)
        },
        {
          $set: {
            exercises: workoutList
          }
        },
        (error, edited) => {
          if (error) {
            console.log(error);
          } else {
            res.send(edited);
          }
        }
      );
    }
  });
});

// Starts the server to begin listening
app.listen(PORT, function() {
  console.log("App listening on PORT " + PORT);
});
