const express = require("express");
const router = express.Router();
const Boundary = require("./boundary.model");
router.post("/save", (req, res) => {
  const boundaryData = req.body;
  const boundary = new Boundary({
    boundary_id: boundaryData.boundary_id,
    survey_date: boundaryData.survey_date,
    land_use: boundaryData.land_use,
    area: boundaryData.area,
    perimeter: boundaryData.perimeter,
    surveyor: boundaryData.surveyor,
    client: boundaryData.client,
    description: boundaryData.description,
    geometry: {
      type: boundaryData.geometry.type,
      coordinates: boundaryData.geometry.coordinates,
    },
  });
  boundary.save((err, data) => {
    if (err) {
      res.status(500).send({ message: "Error saving boundary" });
    } else {
      res.send({
        message: "Boundary saved successfully",
        data: data.toGeoJSON(),
      });
    }
  });
});
// Add a method to convert Boundary document to GeoJSON
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
module.exports = router;
