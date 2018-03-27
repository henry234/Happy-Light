(function () {
    'use strict';

    angular
        .module('app')
        .controller('Home.IndexController', Controller);

    function Controller(UserService, GoogleMap, FormService, Toastr, $q, $http) {

        var vm = this;
        var collection = "clusters";
        vm.cluster = {};
        vm.clusters = [];
        vm.user = null;
        vm.enableAdd = false;
        vm.enableControl = false;
        vm.enableSelect = false;
        vm.selectCluster = null;

        initController();

        function initController() {
            // get current user
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
            });

            FormService.getAll(collection)
                .then(function (data) {
                    vm.clusters = data;
                })
                .catch (function (err) {
                    console.log(err);
                })

            FormService.getAll("nodes")
                .then (function (data) {
                    GoogleMap.initialize(data);
                })
                .catch (function (err) {
                    console.log(err);
                })

            vm.screenHeight = $(document).height();

            

            vm.addCluster = () => {
                FormService.save(collection, vm.cluster)
                    .then(function (res) {
                        vm.clusters.push(res.ops[0]);
                    })
                    .catch(function (err) {
                        console.log(err);
                    })
            }

            vm.addTrafficLight = () => {
                vm.enableAdd = !vm.enableAdd;
                GoogleMap.setAdd(vm.enableAdd, vm.selectCluster);
            }

            vm.showCluster = (idx) => {
                vm.enableControl = true;
                vm.selectCluster = idx;
                GoogleMap.toggleMarkers(vm.selectCluster);
                GoogleMap.fitBounds();
            }

            vm.saveNode = () => {
                var nodes = GoogleMap.getMarkers(vm.selectCluster);
                nodes.forEach(function(nodeData) {
                    let node = {
                        _id: nodeData._id,
                        clusterId: nodeData.clusterId,
                        location: {
                            lat: nodeData.location.lat,
                            lng: nodeData.location.lng
                        }
                    }

                    if (node._id === undefined) {
                        FormService.save("nodes", node)
                            .then (function (data) {
                                GoogleMap.updateMarker(nodeData.idx, data);
                            })
                            .catch (function (err) {
                                console.log(err);
                            })
                    } else {
                        let id = node._id;
                        delete node._id;
                        FormService.update("nodes", id, node)
                            .then (function (data) {
                                
                            })
                            .catch (function (err) {
                                console.log(err);
                            })
                    }
                }, this);
            }

            vm.selectNode = () => {
                vm.enableSelect = !vm.enableSelect;
                if (vm.enableSelect) {
                    Toastr.success("Start add relation");
                } else {
                    Toastr.success("Cancle add relation");
                }
                GoogleMap.selectNode(vm.enableSelect, function (arr) {
                    if (arr.length == 5) {
                        FormService.save("groups", {clusterId: vm.selectCluster, data: arr});
                    }
                });
            }
        }
    }
})();