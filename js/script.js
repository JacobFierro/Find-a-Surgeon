/* 
	Author: Jacob Fierro
	Purpose: Find a Surgeon App
	Date: 2-23-11
*/

var SRCH = typeof(SRCH) === "undefined" ? {} : SRCH;
(function(context){	
	var settings = {}

	var lists = {},
		list_gotten_count = 0;
		json = {},
		views = {},
		view_manager = {},
		card = false,
		term = $(context.inputId).val();
		
		view_manager.lists = [];
	
	
	
	
	/*
		View Class (i.e. Tabs)
	*/
	var View = function(settings) {
		var self = {};
		
		var control = settings.control,
			panel = settings.panel;
			
			
			settings.list = [];
			
			
		self.activate = function(callback) {
			control.addClass('active');
			panel.fadeIn();
			
			if ( $.isFunction(callback) ) {
				callback();
			}
		}
		
		self.deactivate = function(callback) {
			control.removeClass('active');
			
			//callback executes after current panel fades out
			panel.fadeOut(function(){
				if ( $.isFunction(callback) ) {
					callback();
				}
			});
		}
		
		self.prepare = function() {
			control.addClass('active');
		}
		
		self.register_list = function(li) {
			//adds List to (obj) list dictionary
			settings.list.push(li);
		}
		
		self.list_action = function() {
			
		}
		
		self.get_control = function() {
			return settings.control;
		}
		
		self.get_panel = function() {
			return settings.panel;
		}
		
		self.get_list = function() {
			return settings.list;
		}
		
		return self;
	}
	
	var EverythingView = function(settings) {
		var self = View(settings);
		
		self.print_list = function() {
			log(term);
			settings.list[0].filter();
		}
		
		self.initialize = function() {
			$.each(settings.list, function(i, item){
				this.init_feedback();
			});
			
			settings.list[2].print_all(); 
		}
		
		return self;
	}
	
	//View Manager - how the app interfaces with View(s)
	view_manager.activate_listener = function(view) {
		$.each(views, function(i, item){
			item.get_control().click(function(){
				view_manager.activate_view(item);
			});
		});	
	}
	
	//call this method whenever you want to show a new view
	view_manager.activate_view = function(view) {
		if (this.get_active() !== view) {
			view.prepare();
			this.switch_handler(view);
			this.register_active(view);
			
			
			view.print_list();
			//natural place for List interface commands
			$.each(view.get_list(), function(i, item){
				//item.get_element().append("hi");
			});
		} else {
			log('view is already active');
			return;
		}
	}
	
	// do not call this method directly, call activate_view
	view_manager.switch_handler = function(next) {
		if (this.get_active()) {
			view_manager.active.deactivate(function(){
				next.activate();
			});
		} else {
			next.activate();
		}
	}
	
	view_manager.register_active = function(view) {
		view_manager.active = view;
	}
	
	view_manager.get_active = function() {
		return view_manager.active;
	}
	
	view_manager.on_input_event = function(term) {
		var regex = new RegExp('\\b' + term, "i");
		log(term);
		
		//another natural place for List interface commands
		// mr. view, please have your lists filter for term and then show the results
	}
	
	//fires setup when all 3 lists have loaded, solves non-sequential firing problem
	view_manager.list_is_ready = function() {
		list_gotten_count++;
		if (list_gotten_count === 3) {
			//Setup view manager
			view_manager.activate_listener();
			view_manager.activate_view(views.everything);
		}
	}
	
	
	
	
	/*
		List Class
	*/
	var List = function(settings) {
		var self = {};
		
		var data = settings.data,
			max = false;
		
		
		list_balancer = function(list, sections) {
			var depth = Math.ceil(list.length / sections);
				ret = [],
				start = 0;

			for (var i=0; i < sections; i++) {
				ret.push( list.slice(start, start+depth) );
				start = start + depth;
			}

			return ret;
		}
		
		object_to_array = function(object) {
			var a = [];
			$(object).each(function(i, item){
				a.push(item);
			});
			return a;
		}
		
		//public
		
		self.get_list_sinlge_column = function() {
			var ret = '<ul>';
			
			$.each(data, function(i, item){
				ret += self.template(item, i);
			});
			
			ret += '</ul>';
			
			return ret;
		}
		
		self.set_limit = function(val) {
			settings.max = val;
		}
		
		self.get_list_all = function() {
			var ret = '<ul>';
			$(settings.data).each(function(i, item){
				ret += self.template(item, i);
			});
			ret += '</ul>';
			return ret;
		}
		
		self.print_list = function(list) {
			$.each(list, function(i, item){
				settings.element.append(self.template(item));
			});
		}
		
		self.print_all = function() {
			try {
				self.clear_list();
				$(settings.data).each(function(i, item){
					settings.element.append(self.get_list_all());
				});
			} catch(e) {
				log(new Error(e));
			}
		}
		
		self.clear_list = function() {
			settings.element.find('ul').remove();
		}
		
		self.limit = function(arr) {
			if (!arr) {
				arr = object_to_array(data);
			}
			return (settings.max) ? arr.slice(0, settings.max) : arr;
		}
		
		self.template = function(data) {
			return '<li>' + data + '</li>';
		}
		
		self.get_multi_column = function(num_cols) {
			var ret = "";
			
			var balanced = list_balancer( self.limit(object_to_array(data).sort()), num_cols);

			$(balanced).each(function(i, item){
				ret += "<ul>";
				$(item).each(function(i, item){
					ret += "<li>" + item + "</li>";
				});
				ret += "</ul>";
			});

			return ret;
		}
		
		self.get_element = function() {
			return settings.element;
		}
		
		
		return self; //List
	} //List
	
	var FilterableList = function(settings) {
		var self = List(settings);

		//private vars
		var feedback = $(settings.element).find('.feedback'),
			regex,
			max,
			term;

		//public methods
		self.get_matched_string = function(item) {
			return item.replace(settings.regex, '<span class="match">'+ item.match(settings.regex) +'</span>');
		};
		
		self.initialize_list = function() {
			settings.ul.html("");
			self.set_feedback(0);
		}
		
		self.init_feedback = function() {
			$(feedback).html("Enter a term to begin search.");
		}
		
		self.set_feedback = function(match_count) {
			var msg = "";
				matched = match_count || 0;
			
			if (settings.term.length === 0 && match_count === 0) {
				self.init_feedback();
				return;
			} else if (settings.term.length > 0 && match_count === 0) {
				msg = "No matches found";
			} else {
				var count = (match_count < settings.max) ? match_count : settings.max;
				var seeall = (match_count < settings.max) ? "" : " (see all)";
				msg = "Viewing " + count + " of " + match_count + seeall;
			}
			$(feedback).html(msg);
		}
		
		self.filter = function(term, regex) {
			settings.regex = regex;
			
			if (term.length > 0) {
				//return self.get_filtered();
				var filtered = self.get_filtered();
				//return filtered;
				self.set_feedback(filtered.length);
				//self.print_list( self.limit(filtered) );	
			} else {
				//self.initialize_list();
			}
		}
		
		//filter data crunching
		self.get_filtered = function() {
			var arr = [];
			$(settings.data).each(function(i){
				var node = settings.data[i][settings.filter_against] || settings.data[i];
				if( settings.regex.test(node) ) {
					arr.push(settings.data[i]);
				}
			});
			return self.limit(arr);
		}
		
		

		return self; //FilterableList
	}

	var NamesList = function(settings) {
		var self = FilterableList(settings);
		
		settings.filter_against = "last_name";

		//public methods
		self.print_list = function(filtered) {
			self.clear_list();

			$.each(filtered, function(i, item) {
				settings.element.append( self.template(item, i) );
				get_image(item.headshot_url, 'id'+i, settings.term.length);
			});
		}
		
		self.template = function(data, id) {
			var temp = '<li class="name_item">';
				temp += '<div class="image loading" id="id'+ id +'"></div>';
				temp += '<div class="name">' + self.get_matched_string(data.full_name) + '</div>';
				temp += (data.practicing_specialty) ? '<div class="prac_spec">'+ data.practicing_specialty  +'</div></li>' : "";
			return temp;
		};

		return self;
	}
	
	var SpecialtiesList = function(settings) {
		var self = FilterableList(settings);

		//public methods
		self.template = function(data) {
			return '<li><a href="search.html#'+ data +'">' + self.get_matched_string(data) + '</a></li>';
		}

		return self;
	}
	
	var ServicesList = function(settings) {
		var self = FilterableList(settings);
		
		print_list = function(filtered) {
			self.clear_list();
			
			$.each(filtered, function(i, item){
				settings.ul.append( self.template(item) );
			});
		}
		
		self.filter = function(term, regex) {
			settings.term = term;
			settings.regex = regex;
			
			//print_list(settings.data);
		}
		
		self.template = function(data) {
			return '<li><a href="'+ context.settings.base_url + data.path + '">' + self.get_matched_string(data.title) + '</a></li>';
		}
		
		return self;
	}
	
	
	
	
	
	
	/*
		App Private Methods
	*/	
	var get_json_node = function(term, source, attribute) {
		var regex = new RegExp('^'+term),
			ret = {};
		
		$(source).each(function(i){
			var test_value = source[i][attribute] || source[i];
			if( regex.test(test_value) ) {
				ret = source[i];
			}
		});
		return ret;
	}
	
	var get_image = function(url, el, count) {
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
	
	var on_input_event = function(term) {
		regex = new RegExp('\\b' + term, "i");
		
		var view = view_manager.get_active();
		view.display_filtered(term, regex);
		
		card_manager(term);
	}
	
	var clear_input = function(focus) {
		$(context.settings.inputId).val("");
		if (focus !== "undefined" && focus) {
			$(context.settings.inputId).focus();
		}
		term = "";
	}
	
	
	var main = function() { 
		//initialize to empty text field
		clear_input(true);
		
		
		//Establish Views
		views.everything = EverythingView({
			'control' : $('#control0'),
			'panel' : $('#view0')
		});
		
		views.names = View({
			'control' : $('#control1'),
			'panel' : $('#view1')
		});
		
		views.specialties = View({
			'control' : $('#control2'),
			'panel' : $('#view2')
		});
		
		views.services = View({
			'control' : $('#control3'),
			'panel' : $('#view3')
		});
		
		//Establish Data and Lists
		$.getJSON(context.settings.data, function(data){
			//For Last Names
			lists.names = NamesList({
				'data' : data.physicians,
				'element' : $('.last-name')
			});
			views.everything.register_list(lists.names);
			views.names.register_list(lists.names);
			view_manager.list_is_ready();
				
			//For Specialties
			lists.specialties = SpecialtiesList({
				'data' : data.specialties,
				'element' : $('.specialties')
			});
			views.everything.register_list(lists.specialties);
			views.specialties.register_list(lists.specialties);
			view_manager.list_is_ready();
        });
		
		$.getJSON(context.settings.services, function(data){
			//For Services
			lists.services = ServicesList({
				'data' : data.services,
				'element' : $('.services')
			});
			views.everything.register_list(lists.services);
			views.services.register_list(lists.services);
			view_manager.list_is_ready();
		});


		//bind the keyup event, publish value
		$(context.settings.inputId).keyup(function(){
			view_manager.on_input_event( $(this).val() );
		});		
	}
	
	
	/*
		Public
	*/
	context.init = function(options) {
		context.settings = {
			data : 'js/data.json',
			services : 'js/services.json',
			inputId : '#input',
			results : '#results',
			card : '#card',
			card_close : '#card-close',
			base_url : "http://cornellsurgery.org/patients/"
		};
		
		main();
	}
	
})(SRCH);


$(document).ready(function() {
	SRCH.init();
	//PROFILE.show();
});