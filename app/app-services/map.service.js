(function() {
    'use strict';

    angular
        .module('app')
        .factory('GoogleMap', Service);

    function Service(Toastr, $q) {
        (function(A) {
            if (!Array.prototype.forEach)
                A.forEach = A.forEach || function(action, that) {
                    for (var i = 0, l = this.length; i < l; i++)
                        if (i in this)
                            action.call(that, this[i], i, this);
                };

        })(Array.prototype);
        
        var that = this;
        that._enableAdd = false;
        that.clusterId = undefined;
        that.selects = [];
        var bounds = new google.maps.LatLngBounds();
        var directionsService = new google.maps.DirectionsService();

        function getDistance(from, to) {
            var deferred = $q.defer();

            var start = new google.maps.LatLng(from.lat, from.lng);
            var end = new google.maps.LatLng(to.lat, to.lng);
            var request = {
                origin: start,
                destination: end,
                travelMode: google.maps.TravelMode.DRIVING
            };
            directionsService.route(request, function (response, status) {
                deferred.resolve(response);
            });

            return deferred.promise;
        }

        var
            imageHost = "/upload/",
            mapObject,
            markers = [],
            markerTypes = [{
                name: 'Beach',
                icon: 'beachv',
                marker: 'beach',
                class: 'club'
            }, {
                name: 'Mountain',
                icon: 'mountainv',
                marker: 'mountain',
                class: 'cafe'
            }, {
                name: 'Island',
                icon: 'Islandv',
                marker: 'Island',
                class: 'cinema'
            }, {
                name: 'Cafe',
                icon: 'cafev',
                marker: 'cafe',
                class: 'shop'
            }, {
                name: 'Park',
                icon: 'parkv',
                marker: 'park',
                class: 'sport'
            }, {
                name: 'Restaurant',
                icon: 'resv',
                marker: 'Restaurant',
                class: 'port'
            }, {
                name: 'Theme',
                icon: 'touristdesv',
                marker: 'Theme',
                class: 'bank'
            }];



        function initialize(places) {
            var mapOptions = {
                gestureHandling: 'greedy',
                zoom: 10,
                center: new google.maps.LatLng(10.777935, 106.692778),
                mapTypeId: google.maps.MapTypeId.ROADMAP,

                mapTypeControl: false,
                mapTypeControlOptions: {
                    style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
                    position: google.maps.ControlPosition.LEFT_CENTER
                },
                panControl: false,
                panControlOptions: {
                    position: google.maps.ControlPosition.TOP_RIGHT
                },
                zoomControl: false,
                zoomControlOptions: {
                    style: google.maps.ZoomControlStyle.LARGE,
                    position: google.maps.ControlPosition.TOP_RIGHT
                },
                scaleControl: false,
                scaleControlOptions: {
                    position: google.maps.ControlPosition.TOP_LEFT
                },
                streetViewControl: false,
                streetViewControlOptions: {
                    position: google.maps.ControlPosition.LEFT_TOP
                },
                styles: []
            };

            mapObject = new google.maps.Map(document.getElementById('map'), mapOptions);
            places.forEach(function(item) {
                addMarker(item);
            });

            mapObject.addListener('click', function(event) {
                if (that._enableAdd) {
                    addMarker({
                        location: {
                            lat: event.latLng.lat(),
                            lng: event.latLng.lng()
                        }, 
                        clusterId: that.clusterId
                    });
                } else {

                }
            }); 
            mapObject.fitBounds(bounds);
        };

        function addMarker(item) {
            var marker;
            marker = new google.maps.Marker({
                draggable: true,
                position: new google.maps.LatLng(item.location.lat, item.location.lng),
                map: mapObject,
                clusterId: that.clusterId ? that.clusterId : item.clusterId,
                _id: item._id
            });


            if ('undefined' === typeof markers[item.clusterId])
                markers[item.clusterId] = [];

            markers[item.clusterId].push(marker);
            google.maps.event.addListener(marker, 'click', (function() {
                if (that.startAdd) {
                    that.selects.push({_id: marker._id, latLng: {lat: marker.position.lat(), lng: marker.position.lng()}});
                    if (that.selects.length == 5) {
                        Toastr.success("Add Center");
                        let promises = [];
                        for (var i = 0; i < 4; i++) {
                            promises.push(getDistance(that.selects[i].latLng, that.selects[4].latLng));
                        }
                        $q.all(promises)
                            .then(function (data) {
                                data.forEach(function (e, i) {
                                    if (e.routes[0] && e.routes[0].legs[0])
                                        that.selects[i].distance = e.routes[0].legs[0].duration.value;
                                })
                                that.selectComplete(that.selects);
                            })
                            .catch(function (err) {
                                console.log(err);
                            })
                        
                        that.startAdd = false;
                    } else {
                        Toastr.success("Add Rel");
                    }
                }
            }));
            bounds.extend(marker.position);
        }

        function fitBounds() {
            mapObject.fitBounds(bounds);
        }

        function hideAllMarkers() {
            for (var key in markers)
                markers[key].forEach(function(marker) {
                    marker.setMap(null);
                });
        };

        function toggleMarkers(category) {
            hideAllMarkers();
            closeInfoBox();

            if ('undefined' === typeof markers[category])
                return false;

            markers[category].forEach(function(marker) {
                marker.setMap(mapObject);
                marker.setAnimation(google.maps.Animation.DROP);
            });
        };

        function closeInfoBox() {
            $('div.infoBox').remove();
        };

        function getInfoBox(item) {
            var rating = 0;
            var strRate = '';
            item.checkins.forEach(function(checkin) {
                rating += checkin.vote;
            });
            if (item.checkins.length == 0) {
                strRate = "Not yet evaluated";
            } else {
                rating = Math.round(rating / item.checkins.length);
                for (var i = 1; i <= 5; i++) {
                    if (i <= rating) {
                        strRate += '<i class="yellow fa-2x fa fa-star"></i>'
                    } else {
                        strRate += '<i class="fa fa-2x fa-star"></i>'
                    }
                }
            }

            console.log(item);
            return new InfoBox({
                content: '<div class="marker_info none" id="marker_info">' +
                    '<div class="info" id="info">' +
                    '<img src="' + imageHost + item.imageId + '" class="logotype" alt=""/>' +
                    '<a href="/app/#!/timeline/' + item._id + '"><h2>' + item.location.name + '<span></span></h2></a>' +
                    '<div class="text-center">' + strRate + '</div>' +
                    '<br>' +
                    '<span>' + item.desc.substr(0, 100) + '...' + '</span>' +
                    '<a href="/app/#!/timeline/' + item._id + '/check-in" class="green_btn">Check-in</a>' +
                    '<span class="arrow"></span>' +
                    '</div>' +
                    '</div>',
                disableAutoPan: true,
                maxWidth: 0,
                pixelOffset: new google.maps.Size(40, -210),
                closeBoxMargin: '50px 200px',
                closeBoxURL: '',
                isHidden: false,
                pane: 'floatPane',
                enableEventPropagation: true
            });
        };

        return {
            initialize: initialize,
            hideAllMarkers: hideAllMarkers,
            toggleMarkers: toggleMarkers,
            closeInfoBox: closeInfoBox,
            getInfoBox: getInfoBox,
            addMarker: addMarker,
            fitBounds: fitBounds,
            setCenter: setCenter,
            setAdd: function (b, clusterId) {
                that._enableAdd = b;
                that.clusterId = clusterId;
            },
            getMarkerTypes: function() { return markerTypes; },
            getMarkers:  function (clusterId) {
                if ('undefined' === typeof markers[clusterId])
                    markers[clusterId] = [];

                return markers[clusterId].map(function (e, i) {
                    return {
                        _id: e._id,
                        clusterId: e.clusterId,
                        location: {
                            lat: e.position.lat(),
                            lng: e.position.lng()
                        },
                        idx: i
                    }
                });
            },
            updateMarker: (idx, data) => {
                markers[data.ops[0].clusterId][idx]._id = data.insertedIds[0];
            },
            selectNode: function (b, callback) {
                that.selects = [];
                that.startAdd = b;
                that.selectComplete = callback;
            }
        }

        function setCenter(lat, lng) {
            mapObject.setCenter(new google.maps.LatLng(lat, lng));
            mapObject.zoom = 13;
        }
    }

})();