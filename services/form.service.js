var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('users');

var service = {};

service.getAll = getAll;
service.getById = getById;
service.save = save;
service.update = update;
service.delete = _delete;

module.exports = service;


function getById(collection, _id) {
    if (db[collection] === undefined) {
        db.bind(collection);
    }

    var deferred = Q.defer();

    db[collection].findById(_id, function (err, row) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (row) {
            deferred.resolve(row);
        } else {
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function getAll(collection, query) {
    if (db[collection] === undefined) {
        db.bind(collection);
    }

    var deferred = Q.defer();

    db[collection].find(query).toArray(function (err, rows) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (rows) {
            deferred.resolve(rows);
        } else {
            deferred.resolve([]);
        }
    });

    return deferred.promise;
}

function save(collection, data) {
    if (db[collection] === undefined) {
        db.bind(collection);
    }

    var deferred = Q.defer();

    db[collection].insert(
        data,
        function (err, doc) {
            if (err) deferred.reject(err.name + ': ' + err.message);
            deferred.resolve(doc);
        });

    return deferred.promise;
}

function update(collection, _id, data) {
    if (db[collection] === undefined) {
        db.bind(collection);
    }
    var deferred = Q.defer();
    
    var set = data;
    try {
        db[collection].update(
            { _id: mongo.helper.toObjectID(_id) },
            { $set: set },
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    } catch (ex) {
        console.log(ex);
    }

    return deferred.promise;
}

function _delete(collection, _id) {
    if (db[collection] === undefined) {
        db.bind(collection);
    }
    var deferred = Q.defer();

    db[collection].remove(
        { _id: mongo.helper.toObjectID(_id) },
        function (err, row) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve(row);
        });

    return deferred.promise;
}