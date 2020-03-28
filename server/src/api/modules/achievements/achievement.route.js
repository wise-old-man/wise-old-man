const express = require("express");
const controller = require("./achievement.controller");

const api = express.Router();

api.get("/", controller.get);

module.exports = api;
