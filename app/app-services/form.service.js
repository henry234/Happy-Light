(function () {
    'use strict';

    angular
        .module('app')
        .factory('FormService', Service);

    function Service($http, $q) {
        var service = {};

        service.getAll = getAll;
        service.getById = getById;
        service.save = save;
        service.update = update;
        service.delete = _delete;

        return service;

        function getAll(collection) {
            return $http.get('/api/forms/' + collection).then(handleSuccess, handleError);
        }

        function getById(collection, _id) {
            return $http.get('/api/forms/' + collection + "/" + _id).then(handleSuccess, handleError);
        }

        function save(collection, data) {
            return $http.post('/api/forms/' + collection, data).then(handleSuccess, handleError);
        }

        function update(collection, _id, data) {
            return $http.post('/api/forms/' + collection + "/" + _id, data).then(handleSuccess, handleError);
        }

        function _delete(collection, _id) {
            return $http.delete('/api/forms/' + collection + "/" + _id).then(handleSuccess, handleError);
        }

        // private functions

        function handleSuccess(res) {
            return res.data;
        }

        function handleError(res) {
            return $q.reject(res.data);
        }
    }

})();
