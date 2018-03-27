var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('config.json');
var formService = require("../services/form.service");


router.get('/', function (req, res) {
    formService.getAll("groups")
        .then (function (rows) {
            res.send ({signal : rows[0].data[4].latLng})
        })
        .catch (function (err) {
            console.log(err);
            res.send(err);
        })
});

module.exports = router;