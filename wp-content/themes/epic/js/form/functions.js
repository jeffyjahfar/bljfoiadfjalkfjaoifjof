var model = null;
var polygon_width = null;

$(document).ready(function() {
	
	whichVersion();
	
	$(window).resize(function() {
	
		whichVersion();
		
	});
	
});

function whichVersion() {
	
	if (isCanvasSupported()) {

		var window_w = $(window).width();
	
		$('#canvas-introduction, #canvas-implode, #canvas-points, #canvas-polygon, #canvas-points-back').attr('width', window_w);
		
		if ($(window).width() > 960 ) {
	
			$('#frontpage-canvas-wrapper').show();
			$('.projectlist, #temporary-filler').hide();
					
			if (!App.active) {
			
				model = null;
				initPolygon();
	
				App.init();
				
				// Introduction.init();
				
			} else {
			
				model = null;
				initPolygon();
	
				App.data.canvas.width = $(window).width();				
				App.reset();					
				App.play();
				
				// Introduction.reset();
				// Introduction.hideCanvas();
			
			}			
			
		} else {
		
			if (App.active) {
				App.stop();	
				// Introduction.stop();
			}
			
			$('#frontpage-canvas-wrapper, #temporary-filler').hide();
			$('.projectlist').show();
			
		}
		
	} else {
		
		$('#frontpage-canvas-wrapper, #temporary-filler').hide();
		$('.projectlist').show();
		
	}
	
}

function initPolygon() {

	var window_w = $(window).width();
	
	$('#canvas-polygon').attr('width', window_w);
	
	model = new viewer_3d("canvas-polygon", window_w, 730);
	// model.s = 2500;
	polygon_width = (window_w * 2) - 300;
	model.s = polygon_width;
	App.data.circle_radius = (polygon_width / 4) + 50;
	model.insert_model("/wp-content/themes/epic/js/form/poly/pentakis-dodecahedron.xml");
	// model.attach_to_keyboard();
	// model.attach_to_mouse();
	
}

function isCanvasSupported(){
	var elem = document.createElement('canvas');
	return !!(elem.getContext && elem.getContext('2d'));
}

function getRandomInteger(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomArbitary(min, max) {
    return Math.random() * (max - min) + min;
}

function getLengthBetweenPoints(x, y, x0, y0) {
    return Math.sqrt((x -= x0) * x + (y -= y0) * y);
};


function isDefined(data) {
	if (typeof data !== "undefined") {
		return true;
	}
	return false;
}

function compareDepth(a, b) {
	if (a.depth < b.depth) {
		return -1;
	}
	if (a.depth > b.depth) {
		return 1;
	}
	return 0;
}

function objectLength( object ) {
    var length = 0;
    for( var key in object ) {
        if( object.hasOwnProperty(key) ) {
            ++length;
        }
    }
    return length;
};