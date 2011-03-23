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
		this.feedback( $('#last-name') );
		this.feedback( $('#specialties') );
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
	
	view_manager.feedback = function(ul, max, length) {
		var msg = "",
			max = max || 0;
			length = length || 0;
			
		if (term.length === 0 && length === 0) {
			msg = "Enter a term to begin search.";
		} else if (term.length > 0 && length === 0) {
			msg = "No matches found";
		} else {
			var count = (length < max) ? length : max;
			var seeall = (length < max) ? "" : " (see all)";
			msg = "Viewing " + count + " of " + length + seeall;
		}
		ul.parent().find(".feedback").html(msg);
	}
	
	/*
		TEMPLATES
	*/
	
	view_manager.template.services = function(obj) {
		return '<li><a href="'+ obj.path + '">' + obj.title + '</a></li>';
	}
	
	view_manager.template.last_names = function(obj) {
		return '<li class="name_item"><div class="loading" id="'+ obj.id +'"></div><span class="name">' + obj.full_name + '</span></li>';
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
	list = function(obj){
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
				view_manager.clear_list(ul);
				view_manager.feedback(ul, max, 0);
			} else {
				list.init_services();
			}
		}
	};
	
	list.init_services = function() {
		$(services).each(function(i){
			var li = '<li><a href="'+ context.settings.base_url + services[i].path + '">' + services[i].title + '</a></li>';
			$('#services').find('ul').append(li);
		});
	}

	
	//not using this at the moment, getting count from get_filtered arr.count
	list.get_count = function(list, attribute_name) {
		var count = 0;
		$(list).each(function(i){
			var test_value = list[i][attribute_name] || list[i];;
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
	
	data_manager.initialize_data = function() {
		$.getJSON(context.settings.services, function(data){
			services = data.services;
			list.init_services();
			
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
		
		list({
			'div'		: '#last-name',
			'max'		: 6
		});
		
		list({
			'div'		: '#specialties',
			'max'		: 12
		});
		
		list({
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

	
	
	var card = {};
	
	card.on_click = function(name) {
		name_regex = new RegExp('^'+name);
		
		var data = data_manager.get_json_node_data(names, "full_name", name_regex);
		card.populate_data(data[0], function(){
			$('#card').fadeIn();
			
			$('#card').find('#card-close').click(function(){
				$('#card').fadeOut(function(){
					card.on_close();
					data = {};
					$(context.settings.inputId).focus();
				});
			});
		});
	}
	
	card.populate_data = function(data, callback) {
		var card = $('#card');
		//full name
		card.find('#name').text(data.full_name);
		
		card.find('#headshot').attr('src', data.headshot_url);
		card.find('#pops').attr('href', data.profile_url);
		
		$(data.faculty_appointments).each(function(i){
			$('#appointments').append('<p>' + this.title + '<br><em>' + this.institution + '</em></p>');
		});
		
		card.find('#phone').text(data.phone || "N/A");
		card.find('#fax').text(data.phone || "N/A");
		card.find('#address').text(data.address || "N/A");

		card.find('#expertise div').html(data_manager.get_multicol_list(data.expertise, {
			'cols' : 4,
			'max_depth' : 10
		}));
		
		
		if($.isFunction(callback)){
			log($.isFunction(callback));
			callback.apply();
		}
		
		return;
	}
	
	card.on_close = function(){
		$('#card').find('#appointments').html("");
	}
	
	// list = json obj, sections = int
	data_manager.split_list_equally = function(list, sections) {
		var depth = Math.ceil(list.length / sections);
			ret = [],
			inc = 0;
			
		
	}
	
	data_manager.get_multicol_list = function(source, args) {
		var cols = args.cols,
			max = args.max_depth,
			total = source.length;
			
			
		
		
		
		if((source.length/options.cols) < options.max_depth ){
			return "good cols";
		}
		
		
		
		
	}
	
	data_manager.get_json_node_data = function(source, attribute, regexp) {
		var arr = [];
		$(source).each(function(i){
			var test_value = source[i][attribute] || source[i];
			if( regexp.test(test_value) ) {
				arr.push(source[i]);
			}
		});
		return arr;
	}
	
	
	
	context.init = function(options) {
		context.settings = {
			data : 'js/data.json',
			services : 'js/services.json',
			inputId : '#input',
			results : '#results',
			base_url : "http://cornellsurgery.org/patients/"
		};
		
		//initialize to empty text field
		view_manager.clear_input(true);
		
		//establish data manager and retrieve json data
		data_manager.initialize_data();

		//bind the keyup event, publish value
		$(context.settings.inputId).keyup(function(){
			data_manager.parse_input( $(this).val() );
			
			$('#last-name').find('.name_item').each(function(){
				$(this).click(function(){
					card.on_click( $(this).text() );
				});
			});
		});
		
		
		
	}
	
})(SRCH);


$(document).ready(function() {
	SRCH.init();
});