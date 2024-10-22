const mongoose = require("mongoose");
const Product = require("../models/product");
const BoundarySurvey = require("../model/boundarySurvey");
const dbConnection = mongoose
  .connect("mongodb://localhost:27017/farmApp", {})
  .then(() => {
    console.log("CONNECTION OPENED");
  })
  .catch((error) => {
    console.log("ERROR! CONNECTION NOT OPENED !!!");
    console.log(error);
  });

const seedSurveys = [
  {
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
      coordinates: [
        [
          //boundaryData.coordinates,
          [3.618408, 6.468537],
          [3.618622, 6.468447],
          [3.618528, 6.468844],
          [3.618558, 6.468746],
          [3.618408, 6.468537],
        ],
      ],
    },
  },
];
//

// seed the database
const seedDb = async () => {
  //first delete everything in the database
  await BoundarySurvey.deleteMany({});

  //insert all elements of the array
  return await BoundarySurvey.insertMany(seedSurveys);

  //   for (let i = 0; i < 50; i++) {
  //     const rand1000 = Math.floor(Math.random() * 1000);
  //     const price = Math.floor(Math.random() * 20) + 10;

  //     const camp = new Campground({
  //       title: `${getRandomItemFromArray(descriptors)} ${getRandomItemFromArray(
  //         places
  //       )}`,
  //       // price: String,
  //       // description: String,
  //       location: `${cities[rand1000].city}, ${cities[rand1000].state}`,
  //       image: "https://source.unsplash.com/collection/483251",
  //       description:
  //         "Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptates blanditiis eum distinctio dolorum nostrum, reprehenderit placeat commodi consectetur error nam ab recusandae minus voluptas? Non dignissimos at illum facilis sequi.",
  //       price,kibvcrfsez`2aQ1{?P.IMJHBYFxseaq} `
  //     });
  //     await camp.save();
  //   }
};

seedDb().then(() => {
  mongoose.connection.close();
  console.log("CONNECTION CLOSED");
});
