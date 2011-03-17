/* 
	Author: Jacob Fierro
	Purpose: Find a Surgeon App
	Date: 2-23-11
*/

// create namespace
var SRCH = typeof(SRCH) === "undefined" ? {} : SRCH;

(function(context){
	
	var names,
		specialties,
		services,
		settings = {},
		view_manager = {},
		data_manager = {};
	
	view_manager.template = {};
	
	
	view_manager.on_initialize_complete = function() {
		$(context.settings.results).fadeIn();
	}
	
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
	
	
	/*
		TEMPLATES
	*/
	
	view_manager.template.services = function(obj) {
		return '<li><a href="'+ obj.path + '">' + obj.title + '</a></li>';
	}
	
	view_manager.template.last_names = function(obj) {
		return '<li><img src="' + obj.photo + '"><span class="name">' + obj.full_name + '</span></li>';
	}
	
	view_manager.template.specialties = function(obj) {
		return '<li><a href="'+ context.settings.base_url + obj.path + '">' + obj.title + '</a></li>';
	}
	
	view_manager.template.highlight_string = function(value) {
		return '<span class="highlight">' + value + '</span>';
	}
	
	
	/*
		LIST VIEW
	*/
	
	view_manager.list_view = {};
	
	view_manager.list_view.match_string = function(term, regex, item) {
		var match = item.match(regex);
		return item.replace(regex, '<span class="match">'+match+'</span>');
	}
	
	view_manager.list_view.last_name = function(term, regex) {
		var max = 6,
			count = 0;
		
		var ul = $('#last-name').find('ul');
		view_manager.clear_list(ul);
		
		if (term.length > 0) {
			
			$(names).each(function(i){
				var item = names[i].last_name;
				
				if (regex.test(item) && (count < max) ) {
					ul.append( 
						view_manager.template.last_names({
							"full_name" : view_manager.list_view.match_string(term, regex, names[i].full_name),
							"photo" : names[i].headshot_url
						})
					);
					count++;
				} else if (regex.test(item) && (count === max) ) {
					var total = 1;
					$(names).each(function(i){
						if ( regex.test(names[i].last_name) ) {
							total++;
						}
					});
					ul.append('<li><a href="#">Viewing ' + max + ' of ' + total + ' (see all)</a></li>');
					count++;
				} else if (count > max) {
					return;
				}
			});
		
		} else {
			view_manager.clear_list(ul);
		}
		
	}
	
	view_manager.list_view.specialties = function(term, regex) {
		var max = 12,
			count = 0;
			
		var ul = $('#specialties').find('ul');
		view_manager.clear_list(ul);
		
		if (term.length > 0) {
			
			$(specialties).each(function(i){
				var item = specialties[i];
				
				if (regex.test(item) && (count < max) ) {
					ul.append( 
						view_manager.template.specialties({
							"path" : "/index.html",
							"title" : view_manager.list_view.match_string(term, regex, item)
						})
					);
					count++;
				} else if (regex.test(item) && (count === max) ) {
					var total = 1;
					$(specialties).each(function(i){
						if ( regex.test(specialties[i]) ) {
							total++;
						}
					});
					ul.append('<li><a href="#">Viewing ' + max + ' of ' + total + ' (see all)</a></li>');
					count++;
				} else if (count > max) {
					return;
				}
			});
		
		} else {
			view_manager.clear_list(ul);
		}
		
	}
	
	view_manager.list_view.services = function(term, regex) {
		var ul = $('#services').find('ul');
		view_manager.clear_list(ul);
		
		if (term.length > 0) {
			$(services).each(function(i){
				var item = services[i].title;
				if (regex.test(item)) {
					item = view_manager.list_view.match_string(term, regex, item);
				}
				ul.append(view_manager.template.services({
					"path" : services[i].path,
					"title" : item
				}));
			});
		} else {
			view_manager.list_view.services.init();
		}
	}
	
	view_manager.list_view.services.init = function() {
		$(services).each(function(i){
			var li = '<li><a href="'+ context.settings.base_url + services[i].path + '">' + services[i].title + '</a></li>';
			$('#services').find('ul').append(li);
		});
	}
	
	
	data_manager.initialize_data = function() {
		
		$.getJSON(context.settings.services, function(data){
			services = data.services;
			view_manager.list_view.services.init();
			
			// flow control, better way?
			$.getJSON(context.settings.data, function(data){
	            names = data.physicians;
				specialties = data.specialties;
				view_manager.on_initialize_complete();
	        });
			
		});
	}
	
	data_manager.parse_input = function(term) {
		var regex = new RegExp('\\b' + term, "i");
		
		view_manager.list_view.last_name(term, regex);
		view_manager.list_view.specialties(term, regex);
		view_manager.list_view.services(term, regex);
	}
	
	
	context.init = function(options) {
		context.settings = {
			data : 'js/data.json',
			services : 'js/services.json',
			inputID : '#input',
			results : '#results',
			base_url : "http://new.weill.cornell.edu/testspace/fas"
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


/*
view_manager.list_view = function(obj) {
	// ul id, data, term, regex, filter (boolean)
	var ul = $(obj.list_id).find('ul');
	var data = obj.data;
	
	//clear list first
	view_manager.clear_list(ul);
	
	//regex match and populate
	if (obj.term.length > 0) {
		$(data).each(function(i){
			var li = view_manager.list_view.build_item();
			
			ul.append(li);
		});
	}
}

view_manager.list_view.build_item = function() {
	if (obj.type = "last_name") {
		if (regex.test(term))
	}
}
*/