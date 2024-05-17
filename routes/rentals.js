const express = require("express");
const mongoose = require("mongoose");
const Fawn = require("fawn");
const { Rental, validate } = require("../models/rentals");
const { Customer } = require("../models/customer");
const { Movie } = require("../models/movies");
const router = express.Router();

Fawn.init(mongoose);

// Get All rentals
router.get("/", async (req, res) => {
  const rentals = await Rental.find().sort("-dateOut");
  if (!rentals) return res.status(404).send("No rentals found.");

  res.send(rentals);
});

// Create a rental
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).status(error.message);

  const customer = await Customer.findById(req.body.customerId);
  if (!customer) return res.status(400).send("Invalid customer");

  const movie = await Movie.findById(req.body.movieId);
  if (!movie) return res.status(400).send("Invalid movie");

  if (movie.numberInStock === 0)
    return res.status(400).send("Movie not in stock.");

  let rental = new Rental({
    customer: {
      _id: customer._id,
      name: customer.name,
      phone: customer.phone,
    },
    movie: {
      _id: movie._id,
      title: movie.titla,
      dailyRentalRate: movie.dailyRentalRate,
    },
  });

  try {
    new Fawn.Task()
      .save("rentals", rental)
      .update(
        "movies",
        { _id: movie._id },
        {
          $inc: { numberInStock: -1 },
        }
      )
      .run();

    res.send(rental);
  } catch (ex) {
    res.status(500).send("Something failed.");
  }
});

router.get("/:id", async (req, res) => {
  const rental = await Rental.findById(req.params.id);
  if (!rental)
    return res.status(404).send("The rental with the given ID was not found.");

  res.send(rental);
});

module.exports = router;