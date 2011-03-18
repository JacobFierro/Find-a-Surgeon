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
		data_manager = {};
	
	view_manager.template = {};
	
	
	view_manager.on_initialize_complete = function() {
		$(context.settings.results).fadeIn();
		this.zero_match( $('#last-name').find('ul') );
		this.zero_match( $('#specialties').find('ul') );
	}
	
	view_manager.clear_input = function(focus) {
		$(context.settings.inputId).val("");
		if (focus !== "undefined" && focus) {
			$(context.settings.inputId).focus();
		}
	}
	
	/**
	** @params: type $('ul')
	*/
	view_manager.clear_list = function(list) {
		list.html("");
	}
	
	view_manager.zero_match = function(ul) {
		var msg = "";
		log(ul.parent().attr('id'));
		if (term !== msg ) {
			msg = 'No matches for term "'+term+'".';
		} else {
			msg = "Enter a term to begin search.";
		}
		$(ul).html('<li class="helper">'+msg+'</li>');
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
					$(names).each(function(i){
						var item = names[i].last_name;
						var test = regex.test(item);
						if (test && (count < max) ) {
							ul.append( 
								view_manager.template.last_names({
									"full_name" : data_manager.get_matched_string(names[i].full_name),
									"id" : 'id' + i
								})
							);
							data_manager.get_image(names[i].headshot_url, 'id'+i, term.length);
							count++;
						} else if (test && (count === max) ) {
							var total = 1;
							$(names).each(function(i){
								if ( regex.test(names[i].last_name) ) {
									total++;
								}
							});
							ul.append('<li><a href="#">Viewing ' + max + ' of ' + total + ' (see all)</a></li>');
							count++;
						} 
						
					});
					break;
					
				case "#specialties" :
					$(specialties).each(function(i){
						var item = specialties[i];
						var test = regex.test(item);
						if (test && (count < max) ) {
							ul.append( 
								view_manager.template.specialties({
									"path" : "/index.html",
									"title" : data_manager.get_matched_string(item)
								})
							);
							count++;
						} else if (test && (count === max) ) {
							var total = 1;
							$(specialties).each(function(i){
								if ( regex.test(specialties[i]) ) {
									total++;
								}
							});
							ul.append('<li><a href="#">Viewing ' + max + ' of ' + total + ' (see all)</a></li>');
							count++;
						} 
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