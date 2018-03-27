var config = require('../../config.json');
var express = require('express');
var router = express.Router();
var formService = require('services/form.service');

// routes
router.post('/:module', save);
router.get('/:module', getAll);
router.get('/:module/:_id', getById);
router.post('/:module/:_id', update);
router.delete('/:module/:_id', _delete);

module.exports = router;

function getAll(req, res) {
    formService.getAll(req.params.module)
        .then(function (rows) {
            if (rows) {
                res.send(rows);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getById(req, res) {
    formService.getAll(req.params.module, req.params._id)
        .then(function (row) {
            if (row) {
                res.send(row);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function update(req, res) {
    formService.update(req.params.module, req.params._id, req.body)
        .then(function (row) {
            res.send(row);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function save(req, res) {
    formService.save(req.params.module, req.body)
        .then(function (row) {
            res.send(row);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function _delete(req, res) {

    formService.delete(req.params.module, req.params._id)
        .then(function (row) {
            res.send(row);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}