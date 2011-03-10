/* 
	Author: Jacob Fierro
	Purpose: Find a Surgeon App
	Date: 2-23-11
*/

// create namespace
var SRCH = typeof(SRCH) === "undefined" ? {} : SRCH;

(function(context){
	
	var names = "",
		specialties = "",
		settings = {},
		view_manager = {},
		data_manager = {};
		
	view_manager.clear_input = function(clear) {
		$(context.settings.inputID).val("");
		if (clear) {
			$(context.settings.inputID).focus();
		}
	}
	
	view_manager.on_initialize_complete = function() {
		$(context.settings.results).fadeIn();
	}
	
	
	data_manager.initialize_data = function() {
		$.getJSON(context.settings.url, function(data){
            names = data.physicians;
			specialties = data.specialties;
			view_manager.on_initialize_complete();
        });
	}
	
	data_manager.parse_input = function() {
		
	}
	
	
	context.init = function(options) {
		context.settings = {
			url : 'js/data.json',
			inputID : '#input',
			results : '#results'
		};
		
		//initialize to empty text field
		view_manager.clear_input(true);
		
		//establish data manager and retrieve json data
		data_manager.initialize_data();

		//bind the keyup event, publish value
		$('#input').keyup(function(){
			var value = $('#input').val().toLowerCase();

		});
	}
	
})(SRCH);


$(document).ready(function() {
	SRCH.init();
});
