/* 
	Author: Jacob Fierro
	Purpose: Find a Surgeon App
	Date: 2-23-11
*/

var SRCH = typeof(SRCH) === "undefined" ? {} : SRCH;
(function(context){	
	var settings = {};

	//new and needed
	var num_json_loaded = 0,
		json = {},
		views = {},
		view_manager = {},
		card = false,
		regex = null;
	
	
	
	/*
		List Class - Data Class
	*/
	var List = function(settings) {
		var self = {};
		
		var data = settings.data,
			id = settings.id; //wrapper div
		
		self.get_element = function() {
			return settings.id;
		}
		
		self.get_all = function() {
			var ret = [];
			$.each(data, function(i, item) {
				ret.push(item);
			});
			return ret;
		}
		
		self.get_length = function() {
			return settings.data.length;
		}
		
		return self; //List
	} //List
		
	var FilterableList = function(settings) {
		var self = List(settings);

		//private vars
		var feedback = $(settings.id).find('.feedback');
		
		//Instance Variables
		self.filtered = [];
		
		//sets self.filtered
		self.filter = function(term, regex) { //saves the filtered list to the instance variable
			settings.term = term;
			settings.regex = regex;
			
			if (term.length > 0) {
				self.filtered = self.filter_tester(regex);
			} else {
				self.filtered = [];
			}
		}
		
		// tests node against regex, returns array
		self.filter_tester = function(regex) {
			var arr = [];
			$(settings.data).each(function(i, item){
				var node = item[settings.filter_against] || item;
				if ( regex.test(node) ) {
					arr.push( item );
				}
			});
			return arr;
		}
		
		// returns array
		self.get_filtered = function() {
			return self.filtered;
		}

		self.get_length = function() {
			return self.filtered.length;
		}

		return self; //List
	}

	var NamesList = function(settings) {
		var self = FilterableList(settings);
		
		settings.filter_against = "last_name";
		
		return self;
	}
	
	var SpecialtiesList = function(settings) {
		var self = FilterableList(settings);

		//Nothing here, but leaving it for future use

		return self;
	}
	
	var ServicesList = function(settings) {
		var self = FilterableList(settings);
		
		settings.filter_against = "title";
		
		//required because services do not filter out
		self.filter = function(term, regex) { 
			settings.term = term;
			settings.regex = regex;
			
			var arr = [];
			$(settings.data).each(function(i, item){
				arr.push( item );
			});
			self.filtered = arr;
		}
		
		return self;
	}
	
	
	
	/*
		List Printer 
	*/
	var ListPrinter = function(settings) {
		var self = {};
		
		var panel = settings.panel,
			target = settings.target,
			ul = panel.find(settings.target).find('ul'),
			feedback = panel.find(settings.target).find('.feedback'),
			max = null,
			paginate = {};
		
		settings.paginate_option = false;
		paginate.controls = {};
		
		//Pagination
		var set_paginate_option = function( option, num_per_page ){
			settings.paginate_option = option;
			settings.paginate_num_per_page = num_per_page;
		}
		self.set_paginate_option = set_paginate_option;
		
		var get_paginate_option = function(){
			return settings.paginate_option;
		}
		self.get_paginate_option = get_paginate_option;
		
		var paginate = function( obj ){
			//hide all to start
			//self.paginate_hide_all();

			//total pages needed
			var num_pages = Math.ceil( obj.num_items / settings.paginate_num_per_page );
			
			//create classes array
			var classes = [];
			for (var i=1; i <= num_pages; i++){
				classes[i] = 'page' + i;
			}
			
			//add the right classes to the uls
			var inc = 0;
			var page = 1;
			$(target).find('.multi_col_holder').find('ul').each(function(i, item){
				if (inc < obj.num_cols) {
					inc++;
				} else {
					page++;
					inc = 1;
				}
				$(item).addClass(classes[page]);
			});
			
			self.paginate_show_page( 'page1' );
			
			if (classes.length-1 > 1) {
				self.paginate_controls(classes);
			} else {
				settings.panel.find('.pag_controls').html('');
			}
		}
		self.paginate = paginate;
		
		var paginate_hide_all = function() {
			$(target).find('.multi_col_holder').find('ul').hide();
		}
		self.paginate_hide_all = paginate_hide_all;
		
		var paginate_controls = function(classes) {
			var holder = settings.panel.find('.pag_controls');
			holder.html('');
			
			for (var i=1; i < classes.length; i++) {
				holder.append('<span class="control"><a href="#">'+ i +'</a></span>');
			}
			
			//listen for click
			holder.find('.control a').each(function(){
				$(this).click(function(){
					self.paginate_show_page('page'+$(this).text());
				});
			})
		}
		self.paginate_controls = paginate_controls;
		
		var paginate_show_page = function( page ) {
			self.paginate_hide_all();
			self.paginate_register_active(page);
			
			settings.panel.find('.'+page).fadeIn();
		}
		self.paginate_show_page = paginate_show_page;
		
		var paginate_register_active = function( page ) {
			var regex = /[0-9]+/,
				page_num = parseInt(page.match(regex)),
				holder = settings.panel.find('.pag_controls');
			
			holder.find('.active').removeClass();
			
			holder.find('.control').each(function() {
				if ( parseInt( $(this).find('a').html() ) === page_num ) {
					$(this).find('a').addClass('active');
				}
			});
		}
		self.paginate_register_active = paginate_register_active;
		
		
		
		
		//multi-col, TODO needs better implementation
		self.list_balancer = function(list, sections) {
			var ret = [],
				start = 0;
			
			if (self.get_paginate_option() === true) {
				var depth = Math.ceil(settings.paginate_num_per_page / sections);
			} else {
				var depth = Math.ceil(list.length / sections);
			}
			
			var num_lists = list.length / depth;
			
			for (var i=0; i < num_lists; i++) {
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
		
		
		self.clear_list = function() {
			ul.html("");
		}
		
		self.print_list = function( list ) {
			self.clear_list();
			var limited = self.limit( list );
			$.each(limited, function(i, item){
				ul.append( self.template(item) );
			});
		}
		
		self.print_names_list = function( list ) {
			self.clear_list();
			var limited = self.limit(list);
			$.each(limited, function(i, item){
				ul.append( self.template(item, i) );
				self.print_image(item.headshot_url, 'id'+i, i);
			});
			//card_manager( get_term() );
		}
		
		self.print_services_list = function() {
			self.clear_list();
			$.each(items, function(i, item){
				ul.append(item);
			});
		}
		
		self.print_list_multi_column = function( list, num_cols ) {
			var limited = self.limit( list );
			var balanced = self.list_balancer( limited, num_cols );

			var html = "";
			$(balanced).each(function(i, item){
				html += '<ul>';
				$(item).each(function(i, item){
					html += self.template(item);
				});	
				html += '</ul>';
			});
			
			$(target).find('.multi_col_holder').html(html);
			
			if (settings.paginate_option === true) {
				self.paginate({
					'num_items' : limited.length,
					'num_uls' : balanced.length,
					'num_cols' : num_cols
				});
			}
		}
		
		self.print_image = function(url, el, count) {
			var el = settings.panel.find('#'+el);

			//count lets me know whether the image needs to be loaded or not, only load on the first letter
			if (count > 1) {
				el.append('<img src="'+ url +'">');
			} else {
				var img = new Image();
				$(img)
					.load(function(){
						el.removeClass('loading').append(this);
					})
					.error(function(){
						url = "https://images.med.cornell.edu/headshots/default.jpg";
					})
					.attr('src', url);
			}
		}
		
		self.set_limit = function(num) {
			settings.max = num;
		}
		
		self.get_limit = function() {
			return (settings.max) ? settings.max : 1;
		}
		
		self.limit = function(all) {
			return (settings.max) ? all.slice(0, settings.max) : all;
		}	
		
		self.set_feedback = function(term, match_count) {
			var msg = "";
			
			if (term.length === 0 && match_count === 0) {
				self.init_feedback();
				return;
			} else if (term.length > 0 && match_count === 0) {
				msg = "No matches found";
			} else {
				if (settings.max) {
					var count = (match_count < settings.max) ? match_count : settings.max;
					var seeall = (match_count < settings.max) ? "" : " (see all)";
				} else {
					var count = match_count;
					var seeall = "";
				}
				msg = "Viewing " + count + " of " + match_count + seeall;
			}
			$(feedback).html(msg);
		}
		
		self.init_feedback = function() {
			feedback.html("Enter a term to begin search.");
		}
		
		//used by template, TODO needs access to regex
		self.get_matched_string = function(item) {
			var regex = get_regex();
			return item.replace(regex, '<span class="match">'+ item.match(regex) +'</span>');
		};
		
		self.template = function(data) {
			return '<li>' + data + '</li>';
		}
			
		return self;
	}
	
	var NamesPrinter = function(settings) {
		var self = ListPrinter(settings);
		
		self.template = function(data, id) {
			var temp = '<li class="name_item">';
				temp += '<div class="image loading" id="id'+ id +'"></div>';
				temp += '<div class="name">' + self.get_matched_string(data.full_name) + '</div>';
				temp += (data.practicing_specialty) ? '<div class="prac_spec">'+ data.practicing_specialty  +'</div></li>' : "";
			return temp;
		};
		
		var print_list_multi_column = function( list, num_cols ) {			
			var limited = self.limit( list );
			var balanced = self.list_balancer( limited, num_cols );

			var html = "";
			var img = [];
			var inc = 0;
			
			$(balanced).each(function(i, item){
				html += '<ul>';
				$(item).each(function(x, item){
					html += self.template(item, inc);
					img.push(item.headshot_url);
					inc++;
				});	
				html += '</ul>';
			});

			$(settings.target).find('.multi_col_holder').html(html);
			$.each(img, function(i, item){
				self.print_image(item, 'id'+i, i);
			});
			
			
			if (settings.paginate_option === true) {
				self.paginate({
					'num_items' : limited.length,
					'num_uls' : balanced.length,
					'num_cols' : num_cols
				});
			}
		}
		self.print_list_multi_column = print_list_multi_column;
		
		return self;
	}
	
	var SpecialtiesPrinter = function(settings) {
		var self = ListPrinter(settings);
		
		self.template = function(data) {
			var href = context.settings.base_url + 'results.html?' +  encodeURIComponent(data); 
			return '<li><a href="'+ href +'">' + self.get_matched_string(data) + '</a></li>';
		}
		
		return self;
	}
	
	var ServicesPrinter = function(settings) {
		var self = ListPrinter(settings);
		
		self.template = function(data) {
			return '<li><a href="'+ context.settings.base_url + data.path + '">' + self.get_matched_string(data.title) + '</a></li>';
		}
		
		return self;
	}
	
	
	
	/*
		Card Class
	*/
	var Card = function(settings) {
		var self = {};
		
		var name = settings.name,
			el = settings.el,
			close_el = settings.close_el,
			data = settings.data,
			expertise;
		
		
		//Private		
		populate_card = function() {
			//full name
			$(el).find('#name').text(data.full_name);

			el.find('#headshot').attr('src', data.headshot_url);
			el.find('#pops').attr('href', data.profile_url);
			
			$('#appointments').html("");
			$(data.faculty_appointments).each(function(i){
				$('#appointments').append('<p>' + this.title + '<br><em>' + this.institution + '</em></p>');
			});

			el.find('#phone').text(data.phone || "N/A");
			el.find('#fax').text(data.fax || "N/A");
			var address = (data.address === true) ? data.address.street +"<br>"+ data.address.room +"<br>"+ data.address.city +', '+ data.address.state + ' ' + data.address.zip : 'no havey';
			el.find('#address').text(address || "N/A");
			
			expertise = List({
				'data' : data.expertise,
				'id' : '#expertise',
				'max' : 40
			});
			
			var printer = ListPrinter({
				'panel' : settings.el.parent(),
				'target' : expertise.get_element()
			});
			
			printer.set_limit(40);
			printer.print_list_multi_column( expertise.get_all(), 4 );
			
			//el.find('#expertise div').html( expertise );	
		}
		
		//Public	
		self.show = function() {
			populate_card();
			 
			el.fadeIn();
			
			//close card listener
			close_el.click(function(){
				self.close_card();
			});
		}
		
		self.close_card = function() {
			el.fadeOut();
			$(context.settings.inputId).focus();
		}
		
		
		return self;
	} // Card
	
	
	
	/* 
		View Class
	*/
	var View = function(settings) {
		
		var self = {};
		
		var control = settings.control,
			panel = settings.panel;
			
			settings.list = [];
			
		self.activate = function() {
			control.addClass('active');
			panel.fadeIn();
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
		
		//todo remove this
		self.register_list = function(li) {
			//adds List to (obj) list dictionary
			settings.list.push(li);
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
		
		//TODO is this being used?
		self.do_filter = function(term, regex) {
			lists.names.filter(term,regex);
			lists.specialties.filter(term, regex);
			lists.services.filter(term, regex);
		}
		
		
		//TODO write generic handler
		self.list_handler = function() {
			
		}
		
		//TODO write generic setup
		self.initial_setup = function() {
			log('why');
		}
		
		
		return self;
	
	}
		
	var EverythingView = function(settings) {
		self = View(settings);
		
		var lists = {}, printers = {}, // lookup objects in this view only
			term = get_term(),
			regex = get_regex();
		
		var initial_state = function() {
			printers.names.init_feedback();
			printers.specialties.init_feedback();
			printers.services.print_list( lists.services.get_all() );
		}
		
		self.list_handler = function(term, regex) {
			// Tell List to process term, does not return
			lists.names.filter(term, regex);
			lists.specialties.filter(term, regex);
			lists.services.filter(term, regex);
			
			//Set limits
			printers.names.set_limit(6);
			printers.specialties.set_limit(12);
			printers.services.set_limit(14);
			
			//Set Feedback
			printers.names.set_feedback( term, lists.names.get_length() );
			printers.specialties.set_feedback( term, lists.specialties.get_length() );
			
			//Print Shit Out
			printers.names.print_names_list( lists.names.get_filtered() );
			printers.specialties.print_list( lists.specialties.get_filtered() );
			printers.services.print_list( lists.services.get_filtered() );
			
			//Init Card Manager
			card_manager( get_term() );
		}

		self.activate = function() {
			//Names: List and Printer
			lists.names = NamesList({
				'data' : json.names,
				'id' : '.last-name',
				'ul' : $('.last-name').find('ul')
			});
			
			printers.names = NamesPrinter({
				'panel' : settings.panel,
				'target' : lists.names.get_element()
			});
			
			
			//Specialties: List and Printer
			lists.specialties = SpecialtiesList({
				'data' : json.specialties,
				'id' : '.specialties',
				'ul' : $('.specialties').find('ul')
			});
			
			printers.specialties = SpecialtiesPrinter({
				'panel' : settings.panel,
				'target' : lists.specialties.get_element()
			});
			
			
			//Services: List and Printer
			lists.services = ServicesList({
				'data' : json.services,
				'id' : '.services',
				'ul' : $('.services').find('ul')
			});	
			
			printers.services = ServicesPrinter({
				'panel' : settings.panel,
				'target' : lists.services.get_element()
			});
			
			if (term.length > 0) {
				self.list_handler(term, regex);
			} else {
				initial_state();
			}

			settings.control.addClass('active');
			settings.panel.fadeIn();
			
		}
		
		
		return self;
	}
	
	var NamesView = function(settings) {
		self = View(settings);
		
		var list, printer, term, regex;
		
		var initial_state = function() {
			printer.init_feedback();
		}
		
		var list_handler = function(term, regex) {
			// Tell List to process term, does not return
			list.filter(term, regex);
			
			//Paginate or not
			printer.set_paginate_option(true, 15);
			
			//Set Feedback
			printer.set_feedback( term, list.get_length() );
			
			//Print 
			printer.print_list_multi_column( list.get_filtered(), 3 );
			
			//Init Card Manager
			card_manager( get_term() );
			
		}
		self.list_handler = list_handler;

		var activate = function() {
			term = get_term();
			regex = get_regex();
			
			settings.control.addClass('active');
			settings.panel.fadeIn();
			
			
			//Names: List and Printer
			list = NamesList({
				'data' : json.names,
				'id' : '.last-name',
				'ul' : $('.last-name').find('ul')
			});
			
			printer = NamesPrinter({
				'panel' : settings.panel,
				'target' : list.get_element()
			});
			
			if (term.length > 0) {
				list_handler(term, regex);
			} else {
				initial_state();
			}
		}
		self.activate = activate;
		
		
		return self;
	}
	
	var SpecialtiesView = function(settings) {
		self = View(settings);
		
		var list, printer,
			term = get_term(),
			regex = get_regex();
		
		var initial_state = function() {
			printer.init_feedback();
		}
		
		var list_handler = function(term, regex) {
			// Tell List to process term, does not return
			list.filter(term, regex);
			
			//Paginate or not
			printer.set_paginate_option(true, 30);
			
			//Set Feedback
			printer.set_feedback( term, list.get_length() );
			
			//Print 
			printer.print_list_multi_column( list.get_filtered(), 3 );
		}
		self.list_handler = list_handler;

		var activate = function() {
			term = get_term();
			regex = get_regex();
			
			settings.control.addClass('active');
			settings.panel.fadeIn();
			
			//Specialties: List and Printer
			list = SpecialtiesList({
				'data' : json.specialties,
				'id' : '.specialties',
				'ul' : $('.specialties').find('ul')
			});
			
			printer = SpecialtiesPrinter({
				'panel' : settings.panel,
				'target' : list.get_element()
			});
			
			if (term.length > 0) {
				self.list_handler(term, regex);
			} else {
				initial_state();
			}
		}
		self.activate = activate;
		
		return self;
	}
	
	var ServicesView = function(settings) {
		self = View(settings);
		
		var list, printer,
			term = get_term(),
			regex = get_regex();
		
		var initial_state = function() {
			printer.init_feedback();
		}
		
		var list_handler = function(term, regex) {
			// Tell List to process term, does not return
			list.filter(term, regex);
								
			//Set limits
			// TODO paginatoin for these types of views
			
			//Set Feedback, at this time Services has no feedback, feel free to change
			//printer.set_feedback( term, list.get_length() );
			
			//Print 
			printer.print_list_multi_column( list.get_filtered(), 3 );
		}
		self.list_handler = list_handler;

		var activate = function() {
			//Services: List and Printer
			list = ServicesList({
				'data' : json.services,
				'id' : '.services',
				'ul' : $('.services').find('ul')
			});	
			
			printer = ServicesPrinter({
				'panel' : settings.panel,
				'target' : list.get_element()
			});
			
			if (get_term().length > 0) {
				self.list_handler(term, regex);
			} else {
				initial_state();
			}

			settings.control.addClass('active');
			settings.panel.fadeIn();
			
		}
		self.activate = activate;
		
		return self;
	}
	
	
	
	
	
	view_manager.initialize_views = function() {
		view_manager.activate_nav_listener();
		
		//Everything View is the initial state
		this.activate_view(views.everything);
	}
	
	//View Manager - how the app interfaces with View(s)
	view_manager.activate_nav_listener = function() {
		
		// only creating a view if it's called for. 
		// here we're checking that the view isn't active before creating it
		// bind click event to each specific control
		$('#control0').click(function(){
			if( view_manager.get_active() !== views.everything ) {
				views.everything = EverythingView({
					'control' : $('#control0'),
					'panel' : $('#view0')
				});
				view_manager.activate_view(views.everything);
			}
		});
		
		$('#control1').click(function(){
			if( view_manager.get_active() !== views.names ) {
				views.names = NamesView({
					'control' : $('#control1'),
					'panel' : $('#view1')
				});
				view_manager.activate_view(views.names);
			}
		});
		
		$('#control2').click(function(){
			if( view_manager.get_active() !== views.specialties ) {
				views.specialties = SpecialtiesView({
					'control' : $('#control2'),
					'panel' : $('#view2')
				});
				view_manager.activate_view(views.specialties);
			}
		});
		
		$('#control3').click(function(){
			if( view_manager.get_active() !== views.services ) {
				views.services = ServicesView({
					'control' : $('#control3'),
					'panel' : $('#view3')
				});
				view_manager.activate_view(views.services);
			}
		});
		
		/* 
		//this only works if views are instantiated in main()
		//this is more flexible than above, you can have varrying num of views
		$.each(views, function(i, item){
			item.get_control().click(function(){
				view_manager.activate_tab(item);
			});
		});
		*/	
	}
	
	//call this method whenever you want to show a new view
	view_manager.activate_view = function(view) {
		view.prepare();
		
		if (this.get_active()) {
			view_manager.active.deactivate(function(){
				view.activate();
				view_manager.on_input_event(get_term());
			});
		} else {
			view.activate();
		}
		view_manager.register_active(view);
		
		focus_input();
		
		card_manager( get_term() ); //TODO: is there a better place for this?
	}
	
	view_manager.register_active = function(view) {
		view_manager.active = view;
	}
	
	view_manager.get_active = function() {
		return view_manager.active;
	}
		
	view_manager.on_input_event = function(term) {
		view_manager.active.list_handler(get_term(), get_regex());
	}
	
	//fires setup when all 3 lists have loaded, solves non-sequential firing problem
	view_manager.json_has_loaded = function() {
		num_json_loaded++;
		if (num_json_loaded === 3) {
			this.initialize_views();
		}
	}
	
	
	
	
	card_manager = function(term) {
		if (card) {
			card.close_card();
			card = false;
		} else {
			$('.last-name').find('.name_item').each(function(){
				$(this).click(function(){
					//establish new Card
					card = Card({
						'name' : $(this).find('.name').text(),
						'el' : $(context.settings.card),
						'close_el' : $(context.settings.card_close),
						'data' : get_json_node($(this).find('.name').text(), json.names, 'full_name')
					});
					card.show();
				});
			});
		}
	}
	
	
	var object_to_array = function(object) {
		var a = [];
		$(object).each(function(i, item){
			a.push(item);
		});
		return a;
	}
	
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
	
	//private methods
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

	var get_term = function() {
		return $(context.settings.inputId).val();
	}

	var set_regex = function(term) {
		regex = new RegExp('\\b' + term, "i");
	}
	
	var get_regex = function() {
		if (typeof regex === 'Object') {
			return regex;
		} else {
			regex = new RegExp('\\b' + get_term(), "i");
			return regex;
		}
	}

	var clear_input = function(focus) {
		$(context.settings.inputId).val("");
		if (focus !== "undefined" && focus) {
			$(context.settings.inputId).focus();
		}
	}
	
	var focus_input = function() {
		$(context.settings.inputId).focus();
	}
	
	
	
	var main = function() {
		//initialize to empty text field
		clear_input(true);
		
		
		//Establish Views
		views.everything = EverythingView({
			'control' : $('#control0'),
			'panel' : $('#view0')
		});
		/*
		views.names = NamesView({
			'control' : $('#control1'),
			'panel' : $('#view1')
		});
		
		views.specialties = SpecialtiesView({
			'control' : $('#control2'),
			'panel' : $('#view2')
		});
		
		views.services = ServicesView({
			'control' : $('#control3'),
			'panel' : $('#view3')
		});
		*/
		
		//Establish Data
		$.getJSON(context.settings.services, function(data){
			json.services = data.services;
			view_manager.json_has_loaded();
		});
		
		$.getJSON(context.settings.data, function(data){
			json.names = data.physicians;
			view_manager.json_has_loaded();
			
			json.specialties = data.specialties;
			view_manager.json_has_loaded();
        });

		
		//bind the keyup event, publish value
		$(context.settings.inputId).keyup(function(){
			view_manager.on_input_event( $(this).val() );
		});
	}
	
	
	context.init = function(options) {
		context.settings = {
			data : 'js/data.json',
			services : 'js/services.json',
			inputId : '#input',
			results : '#results',
			card : '#card',
			card_close : '#card-close',
			base_url : "http://new.weill.cornell.edu/testspace/fas/"
		};
		
		
		main();
		
		
	}
	
})(SRCH);



$(document).ready(function() {
	SRCH.init();
	//PROFILE.show();
});