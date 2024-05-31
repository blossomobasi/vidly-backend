const Joi = require("joi");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const express = require("express");
const router = express.Router();
const { User } = require("../models/user");

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.message);

  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid email or password.");

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Invalid email or password.");

  const token = user.generateAuthToken();
  res.json({ token: token, user: _.pick(user, ["_id", "name", "email"]) });
});

function validate(req) {
  const schema = Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().min(5).max(255).required(),
  });

  const result = schema.validate(req);
  return result;
}

module.exports = router;
