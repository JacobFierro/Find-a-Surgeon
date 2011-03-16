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
	
	view_manager.template = {};
	
	view_manager.clear_input = function(focus) {
		$(context.settings.inputID).val("");
		if (focus !== "undefined" && focus) {
			$(context.settings.inputID).focus();
		}
	}
	
	/**
	** @params: type $('ul')
	*/
	view_manager.clear_list = function(list) {
		list.html("");
	}
	
	
	
	
	view_manager.template.highlight_string = function(value) {
		return '<span class="highlight">' + value + '</span>';
	}
	
	view_manager.template.list_item = function(type, value) {
		switch (type) {
			case "last_name" :
				return '<li>' + value + '</li>';
				break;
			case "specialties" :
				"<li>" + value + "</li>";
				break;
		}
	}
	
	
	
	view_manager.on_initialize_complete = function() {
		$(context.settings.results).fadeIn();
	}
	
	view_manager.list_view = function(type) {
		
			
	}
	
	view_manager.list_view.match_string = function(term, regex, item) {
		var match = item.match(regex);
		return item.replace(regex, '<span class="yellow">'+match+'</span>');
	}
	
	
	view_manager.list_view.last_name = function(term, regex) {
		var ul = $('#last-name').find('ul');
		view_manager.clear_list(ul);
		
		if (term.length > 0) {
			$(names).each(function(i){
				var item = names[i].last_name;
				if (regex.test(item)) {
					ul.append("<li>" + view_manager.list_view.match_string(term, regex, names[i].full_name) + "</li>");	
				}	
			});
		} else {
			view_manager.clear_list(ul);
		}
		
	}
	
	view_manager.list_view.specialties = function(term, regex) {
		var ul = $('#specialties').find('ul');
		view_manager.clear_list(ul);
		
		if (term.length > 0) {
			$(specialties).each(function(i){
				var item = specialties[i];
				if (regex.test(item)) {
					ul.append("<li>" + view_manager.list_view.match_string(term, regex, item) + "</li>");
				}	
			});
		} else {
			view_manager.clear_list(ul);
		}
		
	}
	
	
	data_manager.initialize_data = function() {
		$.getJSON(context.settings.url, function(data){
            names = data.physicians;
			specialties = data.specialties;
			view_manager.on_initialize_complete();
        });
	}
	
	data_manager.parse_input = function(term) {
		var regex = new RegExp('\\b' + term, "i");
		
		view_manager.list_view.last_name(term, regex);
		view_manager.list_view.specialties(term, regex);
		
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
			data_manager.parse_input(value);
		});
	}
	
})(SRCH);


$(document).ready(function() {
	SRCH.init();
});
