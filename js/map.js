/*
 * This file is part of Advanced Custom Fields Multiple Coordinates.
 *
 * Advanced Custom Fields Multiple Coordinates is free software: you can redistribute it
 * and/or modify it under the terms of the GNU General Public License as
 * published by he Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * Advanced Custom Fields Multiple Coordinates is distributed in the hope that it will
 * be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Advanced Custom Fields Multiple Coordinates.
 * If not, see <http://www.gnu.org/licenses/>.
 */

jQuery(function($) {

    /* ******* SET UP MultipleCoordinatesMap ******* */

    // the structure used in this code, is better described at
    // https://javascriptweblog.wordpress.com/2011/05/31/a-fresh-look-at-javascript-mixins/
    // than anything I could put together in these comments
    //
    // the benefit of this pattern is that it clearly sets up a
    // constructor (MultipleCoordinatesMap) and then gathers its methods in asMultipleCoordinatesMap
    // and to create a new MultipleCoordinatesMap, you just create a new object of type
    // MultipleCoordinatesMap - the advantage being that the code is easily organized
    // due to the mixin-like pattern, and its easy to reuse the functionality
    // for any number of coordinates maps you want

    /*
     * MultipleCoordinatesMap constructor
     */
    var MultipleCoordinatesMap = function(map_elm) {
        this.map_elm = map_elm;
        this.container_elm = this.map_elm.parent().parent();
        this.input_elm = this.container_elm.find('.location_multiple_coordinates_input_search');
        this.coordinates_button = this.container_elm.find('.location_multiple_coordinates_coordinates_button');
        this.coordinates_elm = this.container_elm.find('.location_multiple_coordinates_coordinates_div');
        this.coordinates_elm.hide();
		this.values_elm = this.container_elm.find('.location_multiple_coordinates_values');
		this.add_button = this.container_elm.find('.location_multiple_coordinates_add');
		this.remove_button = this.container_elm.find('.location_multiple_coordinates_remove');
		this.show_area_button = this.container_elm.find('.location_multiple_coordinates_show_area');
        this.geocoder = new google.maps.Geocoder();

        // set up start position
        var values = $.parseJSON(this.values_elm.val());
        var zoom = values["zoom"];
        var mapOptions = {
                mapTypeId: google.maps.MapTypeId.SATELLITE,
                zoom: zoom,
                center: new google.maps.LatLng(values["coords"][0].lat, values["coords"][0].lng)
        };

        this.map = new google.maps.Map(this.map_elm[0], mapOptions);
		this.marker_count = -1;
		this.marker = Array();
		for (var i = 0; i < values["coords"].length; i++) {
			var position = new google.maps.LatLng(values["coords"][i].lat, values["coords"][i].lng);
			this.AddMarker(position);
		}
		this.poly = "";

		this.remove_marker_mode = false;
		
        this.RegisterHandlers();

        this.UpdateUI();
    };

    /*
     * MultipleCoordinatesMap methods
     */
    var asMultipleCoordinatesMap = (function() {

        /*
         * RegisterHandlers
         *
         * Takes care of setting up events for interaction with
         * the multiple coordinates map
         */
        var RegisterHandlers = function() {
            var self = this;
			
            // detect return key press on the input element and call
            // resolveAddress with the value from the input element
            self.input_elm.keypress(function(e) {
                if (e.keyCode == 13) {
                    e.preventDefault();
                    self.ResolveAddress($(this).val());
                }
            });
			
			
			// add click event on the coords link
            self.coordinates_button.click(function(e) {
				e.preventDefault();
				self.coordinates_elm.toggle();
				self.coordinates_button.toggleClass("button-primary");
			});

			
			// add click event on the remove marker button
            self.add_button.click(function(e) {
				e.preventDefault();
				// unset remove mode
				self.remove_marker_mode = false;
				self.remove_button.removeClass("button-primary");
				self.add_button.addClass("button-primary");
			});

			
			// add click event on the remove marker button
            self.remove_button.click(function(e) {
				e.preventDefault();
				// set remove mode
				self.remove_marker_mode = true;
				self.remove_button.addClass("button-primary");
				self.add_button.removeClass("button-primary");
			});

			// add click event on the remove marker button
            self.show_area_button.click(function(e) {
				e.preventDefault();
				// set remove mode
				$(this).toggleClass("button-primary");
				self.UpdateUI();
			});


			// add a marker when click if remove_marker_mode is false (TODO: bug, this also trigger on dblclick)
			google.maps.event.addListener(this.map, 'click', function(mapEvent) {
				var lat = mapEvent.latLng.lat(),
					lng = mapEvent.latLng.lng();
				var position = new google.maps.LatLng(lat, lng);
			
				self.AddMarker(position);
			});
			

            // detect when the map marker is moved and recalculate location
            // coordinates and tell updateUI about it when it happens
			/*for (var i = 0; i < this.marker.length; i++) {
				google.maps.event.addListener(this.marker[i], 'dragend', function(mapEvent) {
					var lat = mapEvent.latLng.lat(),
						lng = mapEvent.latLng.lng(),
						// use the last typed address as the name of the address
						// when the marker is dragged
						address = self.input_elm.val();

					console.log(lat + " " + lng + " " + this);
					//self.UpdateUI(this, lat, lng, address);
				});

			}*/
        };

		
		/*
         * RemoveMarker
         *
         * @param   marker
         */
        var AddMarker = function(position) {
			var self = this;
			if (!self.remove_marker_mode) {
				// Add marker
				self.marker_count++;
				self.marker[self.marker_count] = new google.maps.Marker({
					map: self.map,
					draggable: true,
					title: self.marker_count.toString(),
					animation: google.maps.Animation.DROP
				});
				self.marker[self.marker_count].myID = self.marker_count;
				self.marker[self.marker_count].setPosition(position);
				console.log("marker added");
				self.UpdateUI();
			}
			google.maps.event.addListener(self.marker[self.marker_count], 'click', function(mapEvent) {
				self.RemoveMarker(this);
				self.UpdateUI();
			});
			google.maps.event.addListener(self.marker[self.marker_count], 'dragend', function(mapEvent) {
				var lat = mapEvent.latLng.lat(),
					lng = mapEvent.latLng.lng();

				console.log(lat + " " + lng + " " + this);
				self.UpdateUI();
			});
		}

		/*
         * RemoveMarker
         *
         * @param   marker
         */
        var RemoveMarker = function(marker) {
			var self = this;
			if (self.remove_marker_mode) {
				marker.setMap(null);
				self.marker[marker.myID] = null;
				self.remove_marker_mode = false;
				self.add_button.addClass("button-primary");
				self.remove_button.removeClass("button-primary");
				console.log("marker removed");
			}
		}
		
		
        /*
         * ResolveAddress
         *
         * Resolves a written address by finding its latitude and longitude
         *
         * @param   address - string describing a physical location
         */
        var ResolveAddress = function(address) {
            var self = this;
            this.geocoder.geocode({'address': address}, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    var latlng = results[0].geometry.location;
                    self.map.setCenter(latlng);
                    //self.UpdateUI(latlng.lat(), latlng.lng(), address);
                }
                else {
                    self.ReportError("Failed to load location");
                }
            });
        };

        /*
         * UpdateUI
         *
         * Updates the map, position and coordinations in the UI
         *
         * @param   lat - latitude
         * @param   lng - longitude
         */
        var UpdateUI = function() {
			var self = this;
			var coords = "";
			var values = {};
			values["coords"] = [];
			var v = 0;
			var polycoords = new Array();
			for (var i = 0; i < self.marker.length; i++) {
				if (self.marker[i] != null) {
					lat = self.marker[i].getPosition().lb
					lng = self.marker[i].getPosition().mb
					polycoords.push(new google.maps.LatLng(lat, lng));
					coords += lat + "," + lng + "; ";  
					values["coords"][v] = {
						'lat': lat,
						'lng': lng};
					v++;
				}
				values["zoom"] = self.map.getZoom();
					
			}
			// show area on map
			if (self.show_area_button.hasClass("button-primary")) {
				if (self.poly !== "")
					self.poly.setMap(null);
				self.poly = new google.maps.Polygon({
					paths: polycoords,
					title: title,
					strokeColor: "#999",
					strokeOpacity: 0.8,
					strokeWeight: 1,
					fillColor: "#999",
					fillOpacity: 0.35,
					id: i,
				});
				self.poly.setMap(self.map);
			}
            self.coordinates_button.val("Show coordinates (" + values["coords"].length + ")");
            self.coordinates_elm.text(coords);
			self.values_elm.val(JSON.stringify(values));
			return;
			
			
			
			
            var new_position = new google.maps.LatLng(lat, lng);
            this.marker[0].setPosition(new_position);

            this.input_elm.val(address);
            this.coordinates_elm.text(lat + ", " + lng);
            
            var values = {
                'address': address,
                'lat': lat,
                'lng': lng,
                'zoom': this.map.getZoom()};
            this.values_elm.val(JSON.stringify(values));
        };

        /*
         * ReportError
         *
         * Reports an error to the UI
         *
         * @param   msg
         */
        var ReportError = function(msg) {
            if (window.console) console.log(msg);
        };

        return function() {
            this.AddMarker = AddMarker;
            this.RemoveMarker = RemoveMarker;
            this.RegisterHandlers = RegisterHandlers;
            this.ResolveAddress = ResolveAddress;
            this.UpdateUI = UpdateUI;
            this.ReportError = ReportError;
            return this;
        };

    })();

    // assign MultipleCoordinatesMap's prototype to asMultipleCoordinatesMap this-reference
    // to propagate MultipleCoordinatesMap with methods
    asMultipleCoordinatesMap.call(MultipleCoordinatesMap.prototype);

    /* ******* INITIALIZE ******** */

    // find each map on the page and hook it up by create a new instance of
    // MultipleCoordinatesMap for each of the maps
    $(document).live('acf/setup_fields', function(ev, div) {
        $(div).find('.location_multiple_coordinates_map').each(function() {
            new MultipleCoordinatesMap($(this));
        });
    });


});
