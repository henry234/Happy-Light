(function() {
    'use strict';

    angular
        .module('app', [
            'angular-loading-bar',
            'oc.lazyLoad',
            'ncy-angular-breadcrumb',
            'ui.router',
            'toastr',
            'ui.utils.masks',
            'google.places',
            'ui.utils.masks',
            'ui.select2',
            '720kb.tooltips'
        ])
        .factory('socket', function($rootScope) {
            var socket = io.connect();
            return {
                on: function(eventName, callback) {
                    socket.on(eventName, function() {
                        var args = arguments;
                        $rootScope.$apply(function() {
                            callback.apply(socket, args);
                        });
                    });
                },
                emit: function(eventName, data, callback) {
                    socket.emit(eventName, data, function() {
                        var args = arguments;
                        $rootScope.$apply(function() {
                            if (callback) {
                                callback.apply(socket, args);
                            }
                        });
                    })
                }
            };
        })
        .directive('icheck', ['$timeout', '$parse', function($timeout, $parse) {
            return {
                require: 'ngModel',
                link: function($scope, element, $attrs, ngModel) {
                    return $timeout(function() {
                        var value;
                        value = $attrs['value'];

                        $scope.$watch($attrs['ngModel'], function(newValue) {
                            $(element).iCheck('update');
                        });

                        $scope.$watch($attrs['ngDisabled'], function(newValue) {
                            $(element).iCheck(newValue ? 'disable' : 'enable');
                            $(element).iCheck('update');
                        })

                        return $(element).iCheck({
                            checkboxClass: 'icheckbox_square-green',
                            radioClass: 'iradio_square-green'

                        }).on('ifChanged', function(event) {
                            if ($(element).attr('type') === 'checkbox' && $attrs['ngModel']) {
                                $scope.$apply(function() {
                                    return ngModel.$setViewValue(event.target.checked);
                                })
                            }
                        }).on('ifClicked', function(event) {
                            if ($(element).attr('type') === 'radio' && $attrs['ngModel']) {
                                return $scope.$apply(function() {
                                    //set up for radio buttons to be de-selectable
                                    if (ngModel.$viewValue != value)
                                        return ngModel.$setViewValue(value);
                                    else
                                        ngModel.$setViewValue(null);
                                    ngModel.$render();
                                    return
                                });
                            }
                        });
                    });
                }
            }
        }])
        .config(($stateProvider, $urlRouterProvider, $ocLazyLoadProvider, $breadcrumbProvider) => {
            // default route
            $urlRouterProvider.otherwise("/home");

            $ocLazyLoadProvider.config({
                // Set to true if you want to see what and when is dynamically loaded
                debug: true
            });

            $breadcrumbProvider.setOptions({
                prefixStateName: 'index.home',
                includeAbstract: true,
                template: `<li class="breadcrumb-item" ng-repeat="step in steps" ng-class="{active: $last}" ng-switch="$last || !!step.abstract"><a ng-switch-when="false" href="{{step.ncyBreadcrumbLink}}">{{step.ncyBreadcrumbLabel}}</a><span ng-switch-when="true">{{step.ncyBreadcrumbLabel}}</span></li>`
            });

            $stateProvider
                .state('index', {
                    abstract: true,
                    templateUrl: '/app/layouts/full.html',
                    //page title goes here
                    ncyBreadcrumb: {
                        label: 'Root',
                        skip: true
                    },
                    resolve: {
                        loadCSS: ['$ocLazyLoad', function($ocLazyLoad) {
                            // you can lazy load CSS files
                            return $ocLazyLoad.load([{
                                serie: true,
                                name: 'Font Awesome',
                                files: ['/public/css/font-awesome.min.css']
                            }, {
                                serie: true,
                                name: 'Simple Line Icons',
                                files: ['/public/css/simple-line-icons.css']
                            }]);
                        }],
                        loadPlugin: ['$ocLazyLoad', function($ocLazyLoad) {
                            // you can lazy load files for an existing module
                            return $ocLazyLoad.load([{
                                serie: true,
                                name: 'chart.js',
                                files: [
                                    '/bower_components/chart.js/dist/Chart.min.js',
                                    '/bower_components/angular-chart.js/dist/angular-chart.min.js',
                                    '/app/app-services/user.service.js',
                                    '/app/default.controller.js'
                                ]
                            }]);
                        }]
                    }
                })
                .state('index.trafficLight', {
                    url: '/traffic-light/:_id',
                    templateUrl: '/app/traffic-light/index.html',
                    //page title goes here
                    controller: "Light.Controller",
                    controllerAs: "vm",
                    ncyBreadcrumb: {
                        label: 'Traffic Light',
                    },
                    resolve: {
                        loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                files: [
                                    '/app/traffic-light/index.controller.js',
                                    '/app/app-services/form.service.js'
                                ]
                            });
                        }]
                    }
                })
                .state('index.home', {
                    url: '/home',
                    templateUrl: '/app/home/index.html',
                    //page title goes here
                    controller: "Home.IndexController",
                    controllerAs: "vm",
                    ncyBreadcrumb: {
                        label: 'Dashboard',
                    },
                    //page subtitle goes here
                    params: {
                        subtitle: 'Welcome to ROOT powerfull Bootstrap & AngularJS UI Kit'
                    },
                    resolve: {
                        loadPlugin: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load([{
                                serie: true,
                                name: 'chart.js',
                                files: [
                                    '/bower_components/chart.js/dist/Chart.min.js',
                                    '/bower_components/angular-chart.js/dist/angular-chart.min.js'
                                ]
                            }]);
                        }],
                        loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                files: ['/app/home/index.controller.js']
                            });
                        }]
                    }
                })
                ;
        })
        .config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
            cfpLoadingBarProvider.includeSpinner = false;
            cfpLoadingBarProvider.latencyThreshold = 1;
        }])
        .factory('socket', function($rootScope) {
            var socket = io.connect();
            return {
                on: function(eventName, callback) {
                    socket.on(eventName, function() {
                        var args = arguments;
                        $rootScope.$apply(function() {
                            callback.apply(socket, args);
                        });
                    });
                },
                emit: function(eventName, data, callback) {
                    socket.emit(eventName, data, function() {
                        var args = arguments;
                        $rootScope.$apply(function() {
                            if (callback) {
                                callback.apply(socket, args);
                            }
                        });
                    })
                }
            };
        })
        .factory('Toastr', function($rootScope, toastr) {
            return {
                success: function(content) {
                    toastr.success(content, "Success");
                },
                info: function(content) {
                    toastr.info(content, "Info");
                },
                warning: function(content) {
                    toastr.warning(content, "Warning");
                },
                error: function(content) {
                    toastr.error(content, "Error");
                },
            }
        })
        .run(['$rootScope', '$state', '$stateParams', function($rootScope, $state, $stateParams) {
            $rootScope.$on('$stateChangeSuccess', function() {
                document.body.scrollTop = document.documentElement.scrollTop = 0;
            });
            $rootScope.$state = $state;
            return $rootScope.$stateParams = $stateParams;
        }])
        .run(($http, $rootScope, $window) => {
            // add JWT token as default auth header
            $http.defaults.headers.common['Authorization'] = 'Bearer ' + $window.jwtToken;

            // update active tab on state change
            $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
                $rootScope.activeTab = toState.data.activeTab;
            });
        });

    // manually bootstrap angular after the JWT token is retrieved from the server
    $(function() {
        // get JWT token from server
        $.get('/app/token', function(token) {
            window.jwtToken = token;

            angular.bootstrap(document, ['app']);
        });
    });
})();