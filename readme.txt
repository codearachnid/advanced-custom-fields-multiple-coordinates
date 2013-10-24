=== Advanced Custom Fields: Multiple Coordinates ===

Contributors: web111se
Requires at least: 3.4.0
Tags: admin, advanced custom field, custom field, acf, google maps, maps, gmap, map, points, polygon, multiple points
Tested up to: 3.6.1
Stable tag: 1.0.0
License: GPLv3
License URI: http://www.gnu.org/licenses/gpl.html

This add-on to [Advanced Custom Fields (ACF)](http://www.advancedcustomfields.com/ "Advanced Custom Fields")
makes it easy to add multiple coordinates to your posts by searching a location and drop one or more points on a visual Google Map.

== Description ==

The plugin is a modified extended version of the Advanced Custom Fields: Coordinates made by Stupid Studio and is found here:
http://wordpress.org/plugins/advanced-custom-fields-coordinates/

This software is licensed under the GNU General Public License version 3. See
gpl.txt included with this software for more detail.

The plugin relies on the Google Maps API. It does not use an API-key and is
therefore operating under the [restrictions of the free Google Maps API](https://developers.google.com/maps/faq#usage_pricing),
which should be plenty for most backend usage.


== Installation ==

Install this plugin by downloading [the source](http://wordpress.org/plugins/advanced-custom-fields-multiple-coordinates/)
and unzipping it into the plugin folder in your WordPress installation. Make
sure to also have ACF installed.


== Usage ==

When you create a new custom field with ACF, set the field type to
**Multiple Coordinates map**. Now the coordinates chooser should show up when you edit
a post with your custom fields.

To get the coordinates data in your frontend, simply request the field value
and in return you get the coordinates in a latitude, longitude array and the zoom as in the sample below.

    <?php
    $values = get_field('*****FIELD_NAME*****');
	print_r($values);
	/* which will give you an array like the following sample
		Array
		(
			[coords] => Array
				(
					[0] => Array
						(
							[lat] => 57.156363766336
							[lng] => 16.364327427978
						)
					[1] => Array
						(
							[lat] => 57.159612809986
							[lng] => 16.370315551758
						)
				)
			[zoom] => 13
		)
	*/
	?>


== Frequently Asked Questions ==

= How do I get the plugin to show a map on the website? =

By implementing a map on your own. We do not provide a frontend-implementation - this is up to you.


== Screenshots ==

1. The plugin in action in the backend.

== Changelog ==

= 1.0.0 =

* First release.