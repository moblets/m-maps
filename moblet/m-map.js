require('./m-map.scss');
var path = require('path');
var fs = require('fs');
/* eslint no-undef: [0]*/
angular.module("uMoblets")
  .directive('mMap', function($uInjector) {
    return {
      restrict: 'E',
      template: fs.readFileSync(path.join(__dirname, 'm-map.html'), 'utf8'),
      link: function() {
        $uInjector.inject("http://maps.google.com/maps/api/js?key=AIzaSyDNzstSiq9llIK8b49En0dT-yFA5YpManU&amp;sensor=true");
      },
      controller: function($scope, $uPlatform, $uMoblet, $uFeedLoader) {
        $scope.load = function() {
          $scope.isLoading = true;
          $uFeedLoader.load($scope.moblet, 1, false)
            .then(function(data) {
              $scope.mapData = data;
              $scope.isLoading = false;
              $scope.loadMap();
            });
        };

        $scope.init = function() {
          $scope.isLoading = false;
          $scope.moblet = $uMoblet.load();
          $scope.load();
        };

        $scope.computeMapStyle = function() {
          var tabs = document.querySelectorAll(".with-tabs").length > 0;
          var banner = document.querySelectorAll(".with-banner").length > 0;

          var descount = 44;
          if ($uPlatform.isIOS() && $uPlatform.isWebView()) {
            descount += 20;
          }
          if (banner) {
            descount += 53;
          }
          if (tabs) {
            descount += 53;
          }

          return {
            height: (window.innerHeight - descount - 100) + 'px'
          };
        };

        $scope.loadMap = function() {
          setTimeout(function() {
            // Wait until 'maps api' has been injected
            if (typeof google === "undefined") {
              $scope.loadMap();
            } else {
              var locations = $scope.mapData.locations;
              var options = $scope.mapData.options;

              var mapOptions = {
                zoom: options.zoom,
                center: new google.maps.LatLng(
                  options.centerLatitude,
                  options.centerLongitude
                ),
                mapTypeId: google.maps.MapTypeId[
                  options.mapTypeId
                ]
              };

              $scope.googleMap = new google.maps.Map(
                document.getElementById("m-map-" + $scope.moblet.id),
                mapOptions);

              var infoWindow = new google.maps.InfoWindow();
              var marker;
              var i;

              for (i = 0; i < locations.length; i++) {
                marker = new google.maps.Marker({
                  position: new google.maps.LatLng(
                    locations[i].latitude, locations[i].longitude),
                  map: $scope.googleMap
                });

                google.maps.event.addListener(
                  marker,
                  'click',
                  (function(marker, i) {
                    return function() {
                      infoWindow.setContent(
                        locations[i].title +
                        "<br>" +
                        $scope.mapData.description);
                      infoWindow.open($scope.googleMap, marker);
                    }
                  })(marker, i));
              }

              // google.maps.event.addListenerOnce(
              //   $scope.googleMap, 'idle', function() {
              //     var marker = new google.maps.Marker({
              //       map: $scope.googleMap,
              //       animation: google.maps.Animation.DROP,
              //       position: latLng
              //     });
              //
              //     var infoWindow = new google.maps.InfoWindow({
              //       content: $scope.mapData.address + "<br>" + $scope.mapData.description
              //     });
              //
              //     google.maps.event.addListener(marker, 'click', function() {
              //       infoWindow.open($scope.googleMap, marker);
              //     });
              //   });

              return true;
            }
          }, 100);
        };

        $scope.init();
      },
      controllerAs: 'uMapController'
    };
  });
