/*** App *****************************************************************/ 

var App = {
	
	active: false,
	frame_events: null,
	
	data: {
		canvas_id: 'canvas-points',
		canvas_id_back: 'canvas-points-back',
		canvas_width: $(window).width(),
		canvas_height: 573,
		canvas: null,
		context: null,
		canvas_back: null,
		context_back: null,
		frame_speed: 24,
		mouse_x: 0,
		mouse_y: 0,
		click_radius: 10, // Used for determining if a point was clicked
		circle_radius: 700, // Radius of 'circle' which points are positioned
		
		categories: { 20: { active: true, name: 'ABORIGINAL CULTURE AND HERITAGE', color: 'rgba(236, 0, 140, 1)', count: 0, index: 0, slug: 'aboriginal-culture-heritage' },29: { active: true, name: 'ADVOCACY', color: 'rgba(28, 187, 180, 1)', count: 0, index: 1, slug: 'research-advocacy' },19: { active: true, name: 'CREATIVE RESIDENCIES', color: 'rgba(1, 182, 239, 1)', count: 0, index: 2, slug: 'creative-residencies' },21: { active: true, name: 'REGIONAL COMMUNITIES', color: 'rgba(162, 48, 159, 1)', count: 0, index: 3, slug: 'regional-communities' } },
		
		points: { 1: { active: true, id: '1', index: '217', name: 'PUBLIC', url: 'http://form/project/public/', summary: 'PUBLIC is a celebration of urban art and creativity that will bring leading artists from around the world to Perth and the Pilbara.', category: '19' }, 2: { active: false, id: '2', index: '', name: '', url: '', summary: '', category: '' }, 3: { active: true, id: '3', index: '448', name: 'SPINIFEX HILL STUDIOS', url: 'http://form/project/spinifex-hill-studios/', summary: 'The Spinifex Hill Studios is home to the Spinifex Hill Artists and also offers creative professional development programs to the broader Pilbara community, including FORM&#039;s Land.Mark.Art program.', category: '29' }, 4: { active: false, id: '4', index: '', name: '', url: '', summary: '', category: '' }, 5: { active: true, id: '5', index: '299', name: 'MIRA: CANNING STOCK ROUTE PROJECT ARCHIVE', url: 'http://form/project/mira/', summary: 'Mira: Canning Stock Route Archive represents the culmination of FORM’s award-winning Canning Stock Route Project and by completion it will contain a vast quantity of materials, including nearly 40,000 unique cultural heritage items.', category: '20' }, 6: { active: false, id: '6', index: '', name: '', url: '', summary: '', category: '' } },
		
		edges: [ { a: 6, b: 3, depth: 'back' }, { a: 6, b: 2, depth: 'back' }, { a: 4, b: 2, depth: 'front' }, { a: 4, b: 4, depth: 'front' }, { a: 2, b: 2, depth: 'back' }, { a: 1, b: 5, depth: 'front' }, { a: 1, b: 6, depth: 'front' }, { a: 1, b: 2, depth: 'back' }, { a: 2, b: 3, depth: 'front' }, { a: 1, b: 4, depth: 'back' }, { a: 3, b: 4, depth: 'front' }, { a: 4, b: 5, depth: 'back' }, { a: 5, b: 6, depth: 'back' } ]
	},
	
	categories: [],
	points: [],
	edges: [],
	
	init: function() {
		
		App.active = true;
		
		// Build objects for TOP canvas
		App.data.canvas = document.getElementById(App.data.canvas_id);		
		App.data.canvas.width = this.data.canvas_width;
		App.data.canvas.height = this.data.canvas_height;		
		if (App.data.canvas.getContext) {
			App.data.context = App.data.canvas.getContext('2d');
		} else {
			// TODO: Stop entire script from running
			return;
		}
		
		// Build objects for BOTTOM canvas
		App.data.canvas_back = document.getElementById(App.data.canvas_id_back);		
		App.data.canvas_back.width = this.data.canvas_width;
		App.data.canvas_back.height = this.data.canvas_height;		
		if (App.data.canvas_back.getContext) {
			App.data.context_back = App.data.canvas_back.getContext('2d');
		} else {
			// TODO: Stop entire script from running
			return;
		}
	
		App.reset();
		
		App.createElements();
		
		App.eventListeners();
		
		App.play();
		
	},
	
	clearCanvas: function() {
		
		App.data.canvas.width = App.data.canvas.width;
		App.data.canvas_back.width = App.data.canvas_back.width;
		
	},
	
	// Run each frame of the animation
	frame: function() {
		
		App.clearCanvas();
		
		App.updateElements();
		
		App.drawElements();
		
		App.play();
		
	},
	
	// Start the animation
	play: function() {
		
		// Uses setTimeout (setInterval unreliable due to browser issues, referencing issues)
		App.frame_events = setTimeout(function(){
			App.frame();
		}, App.data.frame_speed);
		
	},
	
	// Stop the animation
	stop: function() {
	
		clearTimeout(App.frame_events);
		
	},
	
	// Stop animation and clear out the canvas
	reset: function() {
	
		App.stop();
		
		App.clearCanvas();	
		
	},
	
	// Wipe the canvas of all objects (
	clearCanvas: function() {
		
		// Setting width to itself is fastest method to clear (better than create rect)
		//App.data.canvas.width = App.data.canvas.width; 
		//App.data.canvas_back.width = App.data.canvas_back.width;
		
		App.data.context.clearRect(0, 0, App.data.canvas.width, App.data.canvas.height);
		App.data.context_back.clearRect(0, 0, App.data.canvas_back.width, App.data.canvas_back.height);
		
	},
	
	// Load the initial objects
	createElements: function() {
	
		App.loadPoints();
		App.loadEdges();
		
	},
	
	// Calculations for elements per frame
	updateElements: function() {
	
		// This needs to be reset each time (will be set to 'pointer' later if mouse over points)
		$(App.data.canvas).css({'cursor': 'default'});
	
		for (x in this.points) {
			this.points[x].update();
		}
		
		for (x in this.edges) {
			this.edges[x].update();
		}
		
	},
	
	// Draw the elements
	drawElements: function() {
		
		for (x in this.edges) {
			this.edges[x].draw();
		}
		
		for (x in this.points) {
			// this.points[x].draw();
		}
		
	},
	
	// Load points into collection
	loadPoints: function() {
		
		// Find angle to evenly space points around circle
		angle_increment = 360 / objectLength(App.data.points);
		
		for (p in App.data.points) {
		
			point = new Point( App.data.points[p] );
		
			// Get current angle (given p is increments of 1) modified to start at 0 deg)
			theta = ((p - 1) * angle_increment);
			
			// Add a random modifier so the points aren't uniformly placed
			x_modifier = getRandomInteger(0, 150);
			y_modifier = getRandomInteger(0, 50);
	
			// Calculate x,y coordinates of point
			x = (App.data.canvas_width / 2) + App.data.circle_radius * Math.cos(theta * Math.PI / 180);
			y = (App.data.canvas_height / 2) + App.data.circle_radius * Math.sin(theta * Math.PI / 180);
		
			// Apply x modifier
			if (x < (App.data.canvas_width / 2)) {
				x -= x_modifier;
			} else {
				x += x_modifier;
			}
			
			// Apply y modifier
			if (y < (App.data.canvas_height / 2)) {
				y -= y_modifier;
			} else {
				y += y_modifier;
			}
		
			// Apply x,y to Point object 
			point.getStartingCoordinates(x, y);
			
			// Add to Point collection
			App.points[p] = point;
			
		}
		
	},
	
	// Load edges into collection
	loadEdges: function() {
		
		for (x in App.data.edges) {
		
			edge = new Edge( App.data.edges[x] );
			
			App.edges[x] = edge;
			
		}
		
	},
	
	eventListeners: function() {
	
		document.getElementById('banner').addEventListener('mousemove', function(evt) {
			
			var rect = App.data.canvas.getBoundingClientRect();
			
			App.data.mouse_x = evt.clientX - rect.left;
			App.data.mouse_y = evt.clientY - rect.top;
			
			model.mousecoords(App.data.mouse_x, App.data.mouse_y);
			
		}, false);
		
	}
	
}