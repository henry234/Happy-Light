(function() {
    'use strict';

    angular
        .module('app')
        .controller('Light.Controller', function($rootScope, Toastr, $scope, socket, $state, $stateParams, FormService) {
            var vm = this;
            
            var isDown = false;
            var data = null;
            var arr_data;
            var stt = false;
            var arr = [15, 15, 3];
            
            var random = function (a, b) {
                return Math.floor(Math.random() * (b - a)) + a;
            }
            
            
            vm.node = {};
            vm.node._id = $stateParams._id;
            vm.btn_status = "Connect";
            
            vm.connect = function () {
                if (vm.node._id == "") {
                    alert("Please enter id");
                    return;
                }
                
                socket.emit("initNode", vm.node, function (data) {
                    vm.lanRun = data.idx;
                    vm.time = data.time;
                    
                    vm.connected = true;
                });

                socket.on("updateTime", function (data) {
                    vm.lanRun = data.idx;
                    vm.time = data.time;
                    vm.vehicle = data.vehicle;
                    vm.vehicles = data.vehicles;
                    vm._time = data.time;
                });

                socket.on("changeTimeFre", function (data) {
                    isDown = true;
                });
            }
            
            vm.connect();
            vm.color = 0;
            vm.traffic = 0;
            angular.element(document).ready(function() {
                vm.time = arr[0];
                
                setInterval(function() { 
                    vm.time--;
        
                    if (vm.time < 0){
                        vm.color = (vm.color + 1) % 3;
                        if (isDown) {
                            if (vm.color == 1) {
                                vm.time = arr[vm.color] + 2; 
                            } else if (vm.color == 0) {
                                vm.time = arr[vm.color] - 2
                            }
                        } else {
                            vm.time = arr[vm.color]; 
                        }
                    }

                    if (vm.connected) {
                        socket.emit("addVehicle", { vehicle: random(3, 10), time: vm.time, color: vm.color }, function (data) {
                            console.log(data);
                        });
                    }
        
                    $scope.$apply();
                }, 1000);
        
            });
        
        });
})();