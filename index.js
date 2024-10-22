const express = require("express");
const BoundarySurveyRoutes = require("./");
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");

const catchAsyncError = require("./utils/catchAsyncError");

//load environment variables
require("dotenv").config();

const app = express();

app.engine("ejs", ejsMate);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//mongo db
const mongoose = require("mongoose");

// *************************************
//   BEGIN mongoose connection
// *************************************
const dbUrl = process.env.DB_URL;
console.log("dbUrl ", dbUrl);
const dbUrlLocal = "mongodb://localhost:27017/survey";
// "mongodb://localhost:27017/survey";
const dbConnection = mongoose
  .connect(dbUrl)
  .then(() => {
    console.log("DATABASE CONNECTED");
  })
  .catch((e) => {
    console.log("DATABASE CONNECTion ERROR: ", e);
  });

// *************************************
//   END mongoose connection
// *************************************

// *************************************
//   BEGIN SCHEMA AND MODEL DEFINITION
// *************************************
const Schema = mongoose.Schema;
// const geojsonValidator = require("geojson-validator");
const geojsonValidator = require("geojson-validation");
const AppError = require("./AppError");

const boundarySchema = new Schema({
  //   boundary_id: String,
  //   survey_date: Date,
  land_use: String,
  //   area: Number,
  //   perimeter: Number,
  surveyor: String,
  client: String,
  description: String,
  cord: Number,
  geometry: {
    type: {
      type: String,
      enum: ["Polygon", "LineString", "Point"],
    },
    coordinates: [],
  },
});

//define a presave and use the validator here
// boundarySchema.pre("save", function (next) {
//   const boundary = this;
//   const geojson = {
//     type: "Feature",
//     geometry: {
//       type: boundary.geometry.type,
//       coordinates: boundary.geometry.coordinates,
//     },
//     properties: {
//       boundary_id: boundary.boundary_id,
//       survey_date: boundary.survey_date,
//       land_use: boundary.land_use,
//       area: boundary.area,
//       perimeter: boundary.perimeter,
//       surveyor: boundary.surveyor,
//       client: boundary.client,
//       description: boundary.description,
//     },
//   };
//   if (!geojsonValidator.valid(geojson)) {
//     // const errors = geojsonValidator.errors(geojson);
//     const trace = geojsonValidator.isFeature(geojson, true);
//     // console.log(trace);
//     next(new Error(`Invalid GeoJSON: ${trace}`));
//   } else {
//     next();
//   }
// });

// Add a method to convert Boundary document to GeoJSON

const Boundary = mongoose.model("Boundary", boundarySchema);
Boundary.schema.methods.toGeoJSON = function () {
  return {
    type: "Feature",
    geometry: {
      type: this.geometry.type,
      coordinates: this.geometry.coordinates,
    },
    properties: {
      boundary_id: this.boundary_id,
      survey_date: this.survey_date,
      land_use: this.land_use,
      area: this.area,
      perimeter: this.perimeter,
      surveyor: this.surveyor,
      client: this.client,
      description: this.description,
    },
  };
};

// module.exports = Boundary;

// *************************************
//   END SCHEMA AND MODEL DEFINITION
// *************************************

//enable post requests
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

//we use the method override package to mimick patch and put requests
// const methodOverride = require("method-override");
// app.use(methodOverride("_method"));
app.use(methodOverride("_method"));
const port = process.env.PORT || 4000;

app.get("/surveys", async (req, res) => {
  const allSurveys = await Boundary.find({});
  res.render("pages/survey/index", { surveys: allSurveys });
});

//show form route
app.get("/surveys/new", (req, res) => {
  res.render("pages/survey/surveyForm");
});

//show form route
app.get("/surveys/:id", async (req, res) => {
  const { id } = req.params;
  const survey = await Boundary.findById(id);
  res.render("pages/survey/details", { survey });
});

app.get("/surveys/map/:id", async (req, res) => {
  const { id } = req.params;
  const survey = await Boundary.findById(id);
  //   console.log(survey.geometry.coordinates);
  console.log("object");
  res.render("pages/survey/map", { survey: survey });
  //   res.render("pages/survey/map", { survey: survey.geometry.coordinates });
});

async function wrapAsync(fn) {
  return function (req, res, next) {
    fn(req, res, next).catch((e) => {
      return next(e);
    });
  };
}
//submit form processing route
app.post(
  "/surveys/new",
  catchAsyncError(async (req, res, next) => {
    const boundaryData = req.body;

    //   console.log("boundaryData.coordinates", boundaryData.coordinates);

    //split and convert text field content into array of arrays
    const splitToLinesCordinates = boundaryData.coordinates.split("\r\n");
    //   console.log("splittedCordinates - ", splitToLinesCordinates);
    const reconstructedArray = [];

    for (let line of splitToLinesCordinates) {
      let lineValues = line.split(",");
      let newLineArray = [parseFloat(lineValues[0]), parseFloat(lineValues[1])];
      reconstructedArray.push(newLineArray);
    }
    console.log("reconstructedArray ", reconstructedArray);
    //   console.log("reconstructedArray -:- ", reconstructedArray);
    const boundary = new Boundary({
      boundary_id: "id1", //boundaryData.boundary_id,
      survey_date: boundaryData.survey_date,
      land_use: boundaryData.land_use,
      area: boundaryData.area,
      perimeter: boundaryData.perimeter,
      surveyor: boundaryData.surveyor,
      client: boundaryData.client,
      description: boundaryData.description,
      geometry: {
        //type: boundaryData.geometry.type,
        type: boundaryData.type,
        //   coordinates: boundaryData.geometry.coordinates,
        coordinates: [reconstructedArray], //boundaryData.coordinates,
        //   coordinates: [
        //     [
        //       [3.395833, 6.435278],
        //       [3.395833, 6.435556],
        //       [3.395111, 6.435556],
        //       [3.395111, 6.435278],
        //       [3.395833, 6.435278],
        //     ],
        //   ], //boundaryData.coordinates,

        //   3.395833, 6.435278
        //       3.395833, 6.435556
        //       3.395111, 6.435556
        //       3.395111, 6.435278
        //     3.395833, 6.435278

        //crafted portion
        //   coordinates: [
        //     [
        //       [3.396111, 6.435556],
        //       [3.396389, 6.435833],
        //       [3.395833, 6.436111],
        //       [3.395556, 6.435833],
        //       [3.396111, 6.435556],
        //     ],
        //   ],
      },
    });

    //   res.send(JSON.stringify(boundary));
    //   try {
    console.log("boundary: ", boundary);
    const savedData = await boundary.save();
    res.redirect(`/surveys/${savedData._id}`);
    res.send(`Boundary saved successfully <br> ${boundary}`);
    // res.send(JSON.stringify(boundaryData.coordinates));
    // res.send(JSON.stringify(boundary));

    // res.send({
    //   message: "Boundary saved successfully",
    //   data: boundary.toGeoJSON(),
    // });
    //   } catch (error) {
    //     const { status, message } = error;
    //     return next(new AppError(message, status));
    //     //res.status(500).send({ message: `Error saving boundary: ${error}` });
    //   }

    //   boundary.save((err, data) => {
    //     if (err) {
    //       res.status(500).send({ message: "Error saving boundary" });
    //     } else {
    //       res.send({
    //         message: "Boundary saved successfully",
    //         data: data.toGeoJSON(),
    //       });
    //     }
    //   });
  })
);

app.get("/boundaries", async (req, res) => {
  try {
    const boundaries = await Boundary.findById("670e95e932ae48f0f2ce3ab8");
    //res.json(boundaries);
    res.render("pages/viewMap");
  } catch (err) {
    res.status(500).json({ message: "Error fetching boundaries" });
  }
});

app.use("/posts/:id/search", (req, res) => {
  console.log("/posts/:id/search");
  console.log("req.query", req.query);
  console.log("req.params", req.params);
  res.send("dir(req)");
});

app.use("/posts/:id/:name", (req, res) => {
  console.log("/posts/:id/:name");
  console.log("req.query", req.query);
  console.log("req.params", req.params);
  res.send("dir(req)");
});

app.use("/posts", (req, res) => {
  console.log("/posts");
  console.log("req.query", req.query);
  console.log("req.params", req.params);
  res.send("dir(req)");
});

app.use("/", (req, res) => {
  console.dir(req.query);
  res.render("home", { name: "John" });
});

// error handler
app.use((err, req, res, next) => {
  const { status = 500, message = "Something went wrong" } = err;
  res.status(status).send(message);
});
app.listen(port, () => {
  console.log(`Serving on port ${port}`);
});
