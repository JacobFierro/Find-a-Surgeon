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
		term = "",
		regex,
		settings = {},
		view_manager = {},
		data_manager = {},
		list = {};
	
	view_manager.template = {};
	
	
	view_manager.on_initialize_complete = function() {
		$(context.settings.results).fadeIn();
		this.zero_match( $('#last-name') );
		this.zero_match( $('#specialties') );
	}
	
	view_manager.clear_input = function(focus) {
		$(context.settings.inputId).val("");
		if (focus !== "undefined" && focus) {
			$(context.settings.inputId).focus();
		}
	}
	
	/**
	** @params: jQuery Selector $('ul')
	*/
	view_manager.clear_list = function(list) {
		list.html("");
	}
	
	view_manager.zero_match = function(ul) {
		var msg = "";
		if (term !== msg ) {
			msg = 'No matches for term "'+term+'".';
		} else {
			msg = "Enter a term to begin search.";
		}
		$(ul).find('.feedback').html(msg);
	}
	
	view_manager.feedback = function() {
		
	}
	
	/*
		TEMPLATES
	*/
	
	view_manager.template.services = function(obj) {
		return '<li><a href="'+ obj.path + '">' + obj.title + '</a></li>';
	}
	
	view_manager.template.last_names = function(obj) {
		return '<li><div class="loading" id="'+ obj.id +'"></div><span class="name">' + obj.full_name + '</span></li>';
	}
	
	view_manager.template.specialties = function(obj) {
		return '<li><a href="'+ context.settings.base_url + obj.path + '">' + obj.title + '</a></li>';
	}
	
	
	/*
		LIST VIEW
	*/
	
	list.get_count = function(list, attribute_name) {
		var count = 0;
		$(list).each(function(i){
			var test_value = list[i][attribute_name];
			if( regex.test(test_value) ) {
				count++;
			}
		});
		return count;
	}
	
	list.get_filtered = function(list, attribute_name) {
		var arr = [];
		$(list).each(function(i){
			var test_value = list[i][attribute_name] || list[i];
			if( regex.test(test_value) ) {
				arr.push(list[i]);
			}
		});
		return arr;
	}
	
	view_manager.feedback = function(ul, max, length) {
		var msg = "";
		if (term.length === 0 && length === 0) {
			msg = "Enter a term to begin search.";
		} else if (term.length > 0 && length === 0) {
			msg = "Viewing 0 matches";
		} else {
			max = (length < max) ? length : max;
			msg = "Viewing " + max + " of " + length + " (see all)";
		}
		ul.parent().find(".feedback").html(msg);
	}
	
	view_manager.short_list = function(ul, data, max) {
		var inc = 0;
		view_manager.feedback(ul, max, data.length);
		$(data).each(function(i){
			
			if (inc < max) {
				ul.append( 
					view_manager.template.last_names({
						"full_name" : data_manager.get_matched_string(data[i].full_name),
						"id" : 'id' + i
					})
				);
				data_manager.get_image(data[i].headshot_url, 'id'+i, term.length);
			}
			inc++;
		});
	}
	
	/**
	** (int) max - max number to show
	** (string) div - the div to target e.g. #last-name, #specialties, #services
	*/
	view_manager.filterable_list = function(obj){
		var max		= obj.max,
			ul		= $(obj.div).find('ul'),
			count	= 0;
			
		view_manager.clear_list(ul); //clear and redraw for each call
		
		if (term.length > 0) {
			switch (obj.div) {
				case "#last-name" :
					var filtered = list.get_filtered(names, "last_name"); //returned array
					var inc = 0;
					view_manager.feedback(ul, max, filtered.length);
					$(filtered).each(function(i){
						if (inc < max) {
							ul.append( 
								view_manager.template.last_names({
									"full_name" : data_manager.get_matched_string(filtered[i].full_name),
									"id" : 'id' + i
								})
							);
							data_manager.get_image(filtered[i].headshot_url, 'id'+i, term.length);
						}
						inc++;
					});
					break;
					
				case "#specialties" :
					var filtered = list.get_filtered(specialties); //returned array
					var inc = 0;
					view_manager.feedback(ul, max, filtered.length);
					$(filtered).each(function(i){
						if (inc < max) {
							ul.append( 
								view_manager.template.specialties({
									"path" : "/index.html",
									"title" : data_manager.get_matched_string(filtered[i])
								})
							);
						}
						inc++;
					});
					break;
					
				case "#services" :
					$(services).each(function(i){
						var item = services[i].title;
						if (regex.test(item)) {
							item = data_manager.get_matched_string(item);
						}
						ul.append(view_manager.template.services({
							"path" : services[i].path,
							"title" : item
						}));
					});
					break;
				default :
					log('you have not provided list_name to view_manager.filterable_list');
					error('there has been an initialization error');
			}
		} else {
			if (obj.div !== "#services") {
				view_manager.zero_match(ul);
				view_manager.feedback(ul, max, 0);
			} else {
				view_manager.filterable_list.init_services();
			}
		}
	};
	
	view_manager.filterable_list.init_services = function() {
		$(services).each(function(i){
			var li = '<li><a href="'+ context.settings.base_url + services[i].path + '">' + services[i].title + '</a></li>';
			$('#services').find('ul').append(li);
		});
	}

	
	
	
	data_manager.initialize_data = function() {
		$.getJSON(context.settings.services, function(data){
			services = data.services;
			view_manager.filterable_list.init_services();
			
			// flow control, better way?
			$.getJSON(context.settings.data, function(data){
	            names = data.physicians;
				specialties = data.specialties;
				view_manager.on_initialize_complete();
	        });
		});
	}
	
	data_manager.parse_input = function(input) {
		term = input;
		regex = new RegExp('\\b' + term, "i");
		
		view_manager.filterable_list({
			'div'		: '#last-name',
			'max'		: 6
		});
		
		view_manager.filterable_list({
			'div'		: '#specialties',
			'max'		: 12
		});
		
		view_manager.filterable_list({
			'div'		: '#services',
			'max'		: null
		});
	}
	
	data_manager.get_matched_string = function(item) {
		return item.replace(regex, '<span class="match">'+ item.match(regex) +'</span>');
	}
	
	/**
	** @params (string) full path to image, (string) the id of the loading div, (int) the count of the current term
	*/
	data_manager.get_image = function(url, el, count) {
		var el = '#'+el;
		
		//count lets me know whether the image needs to be loaded or not, only load on the first letter
		if (count > 1) {
			$(el).append('<img src="'+ url +'">');
		} else {
			var img = new Image();
			$(img)
				.load(function(){
					$(el).removeClass('loading').append(this);
				})
				.error(function(){
					url = "https://images.med.cornell.edu/headshots/default.jpg";
				})
				.attr('src', url);
		}
	}
	
	
	context.init = function(options) {
		context.settings = {
			data : 'js/data.json',
			services : 'js/services.json',
			inputId : '#input',
			results : '#results',
			base_url : "http://new.weill.cornell.edu/testspace/fas"
		};
		
		//initialize to empty text field
		view_manager.clear_input(true);
		
		//establish data manager and retrieve json data
		data_manager.initialize_data();

		//bind the keyup event, publish value
		$(context.settings.inputId).keyup(function(){
			data_manager.parse_input( $(this).val() );
		});
	}
	
})(SRCH);


$(document).ready(function() {
	SRCH.init();
});