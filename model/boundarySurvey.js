const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const geojsonValidator = require("geojson-validator");
const boundarySchema = new Schema({
  boundary_id: String,
  survey_date: Date,
  land_use: String,
  area: Number,
  perimeter: Number,
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
//     const errors = geojsonValidator.errors(geojson);
//     next(new Error(`Invalid GeoJSON: ${errors.join(", ")}`));
//   } else {
//     next();
//   }
// });
const BoundarySurvey = mongoose.model("Boundary", boundarySchema);
module.exports = BoundarySurvey;
