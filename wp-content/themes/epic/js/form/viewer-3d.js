// performance informaton:
// original: 1358 ms to to draw #140 ten times
// 26 ms to z-sort
// 773 ms w/ canvas tags removed
// 1268 w/ inlined rotation in
// 1210 w/ var-ified x,y,  and z.
// 780 ms w/ transform_vertices refactored
// 760 ms w/ r00,r11,r22

Function.prototype.closure = function(obj)
{
  // Init object storage.
  if (!window.__objs)
  {
    window.__objs = [];
    window.__funs = [];
  }

  // For symmetry and clarity.
  var fun = this;

  // Make sure the object has an id and is stored in the object store.
  var objId = obj.__objId;
  if (!objId)
    __objs[objId = obj.__objId = __objs.length] = obj;

  // Make sure the function has an id and is stored in the function store.
  var funId = fun.__funId;
  if (!funId)
    __funs[funId = fun.__funId = __funs.length] = fun;

  // Init closure storage.
  if (!obj.__closures)
    obj.__closures = [];

  // See if we previously created a closure for this object/function pair.
  var closure = obj.__closures[funId];
  if (closure)
    return closure;

  // Clear references to keep them out of the closure scope.
  obj = null;
  fun = null;

  // Create the closure, store in cache and return result.
  return __objs[objId].__closures[funId] = function ()
  {
    return __funs[funId].apply(__objs[objId], arguments);
  };
};

function transparent_shader_fill(index) {
   return this.fill_style;
}

function transparent_shader_alpha(index) {
   return 0.8;
}

function transparent_shader_stroke(index) {
   return this.stroke_style;
}

function transparent_shader(viewer) {
   this.viewer=viewer;
   this.fill=transparent_shader_fill;
   this.stroke=transparent_shader_stroke;
   this.alpha=transparent_shader_alpha;
   this.fill_style="white";
   this.stroke_style="red";
}


function flat_shader_fill(index) {
   var r=this.ambient_r;
   var g=this.ambient_g;
   var b=this.ambient_b;

   for(var i=0;i<this.light.length;i++) {
      var cos_theta=
         this.viewer.v_normal_x[index]*this.light[i].x
         +this.viewer.v_normal_y[index]*this.light[i].y
         +this.viewer.v_normal_z[index]*this.light[i].z;
      if(cos_theta>0) {
         r=r+cos_theta*this.light[i].r;
         g=g+cos_theta*this.light[i].g;
         b=b+cos_theta*this.light[i].b;
      }

   }
   
   var color_r = this.clamp_color(r);
   var color_g = this.clamp_color(g);
   var color_b = this.clamp_color(b);
   
   var value="rgb("+color_r+","
                 +color_g+","
                 +color_b
             +")";
   return value;
}

function flat_shader_clamp_color(value) {
   if (value<0) {
      return 0
   }

   if (value>255) {
      return 255;
   }

   return Math.floor(value);
}

function flat_shader_alpha(index) {
   return 1.0;
}

function flat_shader_stroke(index) {
   return null;
}

function flat_shader(viewer) {
   this.viewer=viewer;
   this.fill=flat_shader_fill;
   this.stroke=flat_shader_stroke;
   this.alpha=flat_shader_alpha;
   this.clamp_color=flat_shader_clamp_color;
   this.fill_style="white";
   this.stroke_style="red";
   this.ambient_r=255;
   this.ambient_g=200;
   this.ambient_b=200;
   this.light=[];
   this.light[0]=new point_light(-10,-10,10, 60, 60, 60);
   // this.light[1]=new point_light(0,0,10, 50, 50, 50);
}

// constructor for lights that work with the flat shader
//
// the flat shader assumes that all lights are at infinity,  so the x,y,z
// vector is just a direction vector;  the distance has no significance

function point_light(x,y,z,r,g,b) {
   var length=Math.sqrt(x*x+y*y+z*z);
   this.x=x/length;
   this.y=y/length;
   this.z=z/length;
   this.r=r;
   this.g=g;
   this.b=b;
}

function viewer_3d_to_screen_x(x,z) {
    return this.sx_center+this.s*x/(this.d-z);
}

function viewer_3d_to_screen_y(y,z) {
    return this.sy_center+this.s*y/(this.d-z);
}

function viewer_3d_rotate_x(x,y,z) {
   return x*this.r[0][0]+y*this.r[0][1]+z*this.r[0][2];
}

function viewer_3d_rotate_y(x,y,z) {
   return x*this.r[1][0]+y*this.r[1][1]+z*this.r[1][2];
}

function viewer_3d_rotate_z(x,y,z) {
   return x*this.r[2][0]+y*this.r[2][1]+z*this.r[2][2];
}

function viewer_3d_matrix_multiply(a,b) {
    var c=[ [0,0,0], [0,0,0], [0,0,0] ];
    for(var i=0;i<3;i++) {
       for(var j=0;j<3;j++) {
          for(var k=0;k<3;k++) {
             c[i][j] += a[i][k]*b[k][j];
          }
       }
    }
    return c;
}

function viewer_3d_transform_vertices() {
   var vertex_count=this.vertex.length;

   var r00=this.r[0][0];
   var r01=this.r[0][1];
   var r02=this.r[0][2];
   var r10=this.r[1][0];
   var r11=this.r[1][1];
   var r12=this.r[1][2];
   var r20=this.r[2][0];
   var r21=this.r[2][1];
   var r22=this.r[2][2];

   for(var vertex_id=0;vertex_id<vertex_count;vertex_id++) {
     var x=this.vertex[vertex_id][0];
     var y=this.vertex[vertex_id][1];
     var z=this.vertex[vertex_id][2];

     var xp=x*r00+y*r01+z*r02;
     var yp=x*r10+y*r11+z*r12;
     var zp=x*r20+y*r21+z*r22;

     this.screenx[vertex_id]=this.sx_center+this.s*xp/(this.d-zp);
     this.screeny[vertex_id]=this.sy_center+this.s*yp/(this.d-zp);
   }
}


function viewer_3d_draw_face(face_id) {
   var this_face=this.face[face_id];
   var canvas=this.canvas;
   var vertex_id=this_face[0];
     canvas.moveTo(this.screenx[vertex_id],this.screeny[vertex_id]);
   for(var i=1;i<this_face.length;i++) {
     var vertex_id=this_face[i];
     canvas.lineTo(this.screenx[vertex_id],this.screeny[vertex_id]);
   }
   canvas.closePath();
}

// diagnostic version that outputs timing information

function _viewer_3d_draw_poly() {
   var time1=(new Date()).getTime();
   for(var i=0;i<10;i++) {
      this._draw_poly(); 
   }
   var time2=(new Date()).getTime();  
   var duration=time2-time1;
   alert(duration);
   this.crap();
}

function viewer_3d_draw_poly() {
   this.transform_vertices();
   this.rotate_vectors();
   var sorted_list=this.z_sort();

   for(var face_id=0;face_id<sorted_list.length;face_id++) {
      this.canvas.fillStyle=this.shader.fill(sorted_list[face_id]);
      this.canvas.beginPath();
      this.draw_face(sorted_list[face_id]);
      this.canvas.globalAlpha=this.shader.alpha(sorted_list[face_id]);
      this.canvas.fill();
      this.canvas.globalAlpha=1;
      var strokeStyle=this.shader.stroke(sorted_list[face_id]);
      
      // Added to include white borders around faces
      strokeStyle = 'white';
      
      if (strokeStyle) {
         this.canvas.strokeStyle=strokeStyle;
         this.canvas.beginPath();
         this.draw_face(sorted_list[face_id]);
         this.canvas.stroke();
      }
   }
}

function viewer_3d_draw_all() {
   this.canvas.clearRect(0,0,this.width,this.height);
   this.draw_poly();
}

function viewer_3d_animate() {
   if (this.key_left || this.key_right 
          || this.key_up || this.key_down) {
          
       if (this.key_left) {
           this.r=this.matrix_multiply(this.rhm,this.r);
       }

       if (this.key_right) {
           this.r=this.matrix_multiply(this.rhp,this.r);
       }

       if (this.key_up) {
           this.r=this.matrix_multiply(this.rvm,this.r);
       }

       if (this.key_down) {
           this.r=this.matrix_multiply(this.rvp,this.r);
       }
   }
   
   if (this.mouse_left || this.mouse_right 
          || this.mouse_up || this.mouse_down) {
          
       if (this.mouse_left) {
           this.r=this.matrix_multiply(this.rhm,this.r);
       }

       if (this.mouse_right) {
           this.r=this.matrix_multiply(this.rhp,this.r);
       }

       if (this.mouse_up) {
           this.r=this.matrix_multiply(this.rvm,this.r);
       }

       if (this.mouse_down) {
           this.r=this.matrix_multiply(this.rvp,this.r);
       }
   }
           
   this.draw_all();

   var viewer=this;
   setTimeout(function() {viewer.animate();},50);
}

function viewer_3d_fetchxml(url) {
   this.req=get_xml_request_object();
   var viewer=this;
   this.req.onreadystatechange=function() { viewer.load_geometry()};
   this.req.open("GET",url,true);
   this.req.send("");
}

function viewer_3d_load_geometry() {
   if (this.req.readyState==4) {
      if (this.req.status==200) {
         var xml=this.req.responseXML;
         var p=xml.getElementsByTagName('p');
         this.vertex=new Array(p.length);
         for (var i=0;i<p.length;i++) {
            this.vertex[i]=new Array(3);
            this.vertex[i][0]=1.0*p[i].getAttribute("x");
            this.vertex[i][1]=1.0*p[i].getAttribute("y");
            this.vertex[i][2]=1.0*p[i].getAttribute("z");
         }
         var f=xml.getElementsByTagName('f');
         this.face=new Array(f.length);
         for (var i=0;i<f.length;i++) {
            this.face[i]=new Array(f[i].childNodes.length);
            for(j=0;j<f[i].childNodes.length;j++) {
               this.face[i][j]=f[i].childNodes[j].firstChild.nodeValue;
            }
         }

         this.screenx=new Array(this.vertex[length]);
         this.screeny=new Array(this.vertex[length]);

         this.compute_centroids();
         this.compute_normals();

         this.draw_all();
         this.animate();
      } else {
         alert("xml request error: " +req.statusText);
      }
   }
}

function viewer_3d_compute_centroid(this_face) {
   var sum=[0,0,0]
   for(var i=0;i<this_face.length;i++) {
      var this_vertex=this.vertex[this_face[i]];
      for(var j=0;j<3;j++) {
         sum[j] += this_vertex[j];
      }
   }

   var centroid=[0,0,0]
   for(var j=0;j<3;j++) {
      centroid[j]=sum[j]/this_face.length;
   }

   return centroid;
}

function viewer_3d_compute_centroids() {
   this.centroid=new Array(3);
   for(var i=0;i<this.face.length;i++) {
      this.centroid[i]=this.compute_centroid(this.face[i]);
   }
}

function viewer_3d_compute_normal(this_face) {
   var vertex_0=this.vertex[this_face[0]];
   var vertex_1=this.vertex[this_face[1]];
   var vertex_2=this.vertex[this_face[2]];

   var A=new Array(3);
   var B=new Array(3);
   for(var i=0;i<3;i++) {
      A[i]=vertex_1[i]-vertex_0[i];
      B[i]=vertex_2[i]-vertex_0[i];
   }

   // C will be the cross product: C= A x B

   var C=new Array(3);

   C[0]=A[1]*B[2]-A[2]*B[1];
   C[1]=A[2]*B[0]-A[0]*B[2];
   C[2]=A[0]*B[1]-A[1]*B[0];

   var magnitude=Math.sqrt(C[0]*C[0]+C[1]*C[1]+C[2]*C[2]);

   for(var i=0;i<3;i++) {
     C[i]=C[i]/magnitude;
   } 

   return C;
}

function viewer_3d_compute_normals() {
   this.normal=new Array(3);
   for(var i=0;i<this.face.length;i++) {
      var C=this.compute_normal(this.face[i]);
      var dot=C[0]*this.centroid[i][0]+
         C[1]*this.centroid[i][1]+
         C[2]*this.centroid[i][2];

      if(dot<0) {
         C[0]=-C[0];
         C[1]=-C[1];
         C[2]=-C[2];
      }
     
      this.normal[i]=C;
   }
}

function viewer_3d_insert_model(url) {
   /*document.write("<canvas width=\""+this.width
      +"\" height=\""+this.height
      +"\" id=\""+this.name+"\"></canvas>");*/
   var viewer=this;
   this.last_onload=window.onload;
   window.onload=function() {
   
   		/* CUSTOM SCRIPT TO REMOVE MASK */
   		$('#canvas-mask').delay(500).fadeOut(1000);
   
       viewer.onload_document(url);
       if (viewer.last_onload) {
          viewer.last_onload();
       }
   }
}

function viewer_3d_onload_document(url) {
   this.canvas=document.getElementById(this.name).getContext("2d");
   
   this.canvas.width = this.width;
   this.canvas.height = this.height;
   
   this.fetchxml(url);
}

function viewer_3d_attach_to_keyboard() {
   var viewer=this;
   document.onkeydown=function(event) { return viewer.keydown(event) };
   document.onkeyup=function(event) { return viewer.keyup(event) };
}

function viewer_3d_attach_to_mouse() {

	var viewer=this;
	
	document.getElementById(this.name).onmousemove = function(event) { 
	
		offset = document.getElementById(viewer.name).getBoundingClientRect();
		
		var mouse_x = event.pageX - offset.left;
		var mouse_y = event.pageY - offset.top;
		
		viewer.mousecoords(mouse_x, mouse_y);
		
	};
	
}

function viewer_3d_mousecoords(mouse_x, mouse_y) {
	
	var modifier = 0.01;
	
	this.theta_x = 0;
	this.theta_y = 0;
	
	var width = document.getElementById(this.name).offsetWidth;
	var height = document.getElementById(this.name).offsetHeight;
	
	if (mouse_x < (width / 2)) {
		this.mouse_left = 1;
		this.mouse_right = 0;
		this.theta_x = (1 - (mouse_x / (width / 2))) * modifier;
	} else {
		this.mouse_left = 0;
		this.mouse_right = 1;
		this.theta_x = ((mouse_x - (width / 2)) / (width / 2)) * modifier;
	}
	
	if (mouse_y < (height / 2)) {
		this.mouse_up = 1;
		this.mouse_down = 0;		
		this.theta_y = (1 - (mouse_y / (height / 2))) * modifier;
		
	} else {
		this.mouse_up = 0;
		this.mouse_down = 1;
		this.theta_y = ((mouse_y - (height / 2)) / (height / 2)) * modifier;
	}
	
	this.update_rotation_speed(this.theta_x, this.theta_y);
	
}

function viewer_3d_rotate_vectors() {
   this.v_normal_x=new Array(this.centroid.length);
   this.v_normal_y=new Array(this.centroid.length);
   this.v_normal_z=new Array(this.centroid.length);
   this.v_centroid_x=new Array(this.centroid.length);
   this.v_centroid_y=new Array(this.centroid.length);
   this.v_centroid_z=new Array(this.centroid.length);

   for(var i=0;i<this.centroid.length;i++) {
      this.v_normal_x[i]=this.rotate_x(this.normal[i][0],this.normal[i][1],this.normal[i][2]);
      this.v_normal_y[i]=this.rotate_y(this.normal[i][0],this.normal[i][1],this.normal[i][2]);
      this.v_normal_z[i]=this.rotate_z(this.normal[i][0],this.normal[i][1],this.normal[i][2]);
      this.v_centroid_x[i]=this.rotate_x(this.centroid[i][0],this.centroid[i][1],this.centroid[i][2]);
      this.v_centroid_y[i]=this.rotate_y(this.centroid[i][0],this.centroid[i][1],this.centroid[i][2]);
      this.v_centroid_z[i]=this.rotate_z(this.centroid[i][0],this.centroid[i][1],this.centroid[i][2]);
   }
}

//
// XXX: this function is broken because I've just moved the local
// centroid_{x,y,z} and normal_{x,y,z} variables to be object properties
//

function viewer_3d_z_sort_by_intersection() {
   var sorted_list=new Array(this.centroid.length);

   for(var i=0;i<this.centroid.length;i++) {
      sorted_list[i]=i;
   }

   var vp_z=this.d;

   function myorder(a,b) {
      // see formula at http://astronomy.swin.edu.au/~pbourke/geometry/planeline/
      // N= normal of B
      // P1= viewer (0,0,this.d)
      // P2= centroid of A
      // P3= centroid of B

      top_dot=normal_x[b]*centroid_x[b]
         +normal_y[b]*centroid_y[b]
         +normal_z[b]*(centroid_z[b]+vp_z);

      bottom_dot=normal_x[b]*centroid_x[a]
         +normal_y[b]*centroid_y[a]
         +normal_z[b]*(centroid_z[a]+vp_z);

      var u=top_dot/bottom_dot;

//      alert(top_dot);
//      alert(bottom_dot);

      if (u<1) {
         return 1;
      } else if(u>1) {
         return -1;
      }

      return 0;
   }

//   for(i=0;i<sorted_list.length;i++) {
//      for(j=0;j<i;j++) {
//         if(myorder(i,j)==0) {
//            alert("pair" +i+" and "+j+" have 0 intersection value");
//         }
//         if(myorder(i,j)==myorder(j,i)) {
//           alert("pair "+i+" and "+j+" have ambiguous sort order");
//         }
//     }
//   }

//   alert(myorder(0,10));
//   alert(myorder(0,11));
   sorted_list.sort(myorder);
   return sorted_list;
}

function viewer_3d_z_sort_by_centroid() {
   var centroid_z=new Array(this.centroid.length);
   var sorted_list=new Array(this.centroid);
   var j=0;

   for(var i=0;i<this.centroid.length;i++) {
      centroid_z[i]=this.rotate_z(this.centroid[i][0],this.centroid[i][1],this.centroid[i][2]);
      if(this.cull_backfaces) {
         var view_x=-this.v_centroid_x[i];
         var view_y=-this.v_centroid_y[i];
         var view_z=this.d-this.v_centroid_z[i];
         var dot=view_x*this.v_normal_x[i]
            +view_y*this.v_normal_y[i]
            +view_z*this.v_normal_z[i];

         if(dot<0) {
           continue;
         }
      }
      sorted_list[j++]=i;

   }

   function myorder(a,b) {
      var diff=centroid_z[b]-centroid_z[a];
      if (diff>0) {
         return -1;
      }

      if (diff<0) {
         return 1;
      }
      
      return 0;
   }

   sorted_list.sort(myorder);
   return sorted_list;
}

function viewer_3d_keydown(event) {
    event= (event) ? event : ((window.event) ? window.event : null);
    switch(event.keyCode) {
       case 37: this.key_left=1; break;
       case 38: this.key_up=1; break;
       case 39: this.key_right=1; break;
       case 40: this.key_down=1; break;
    }
}

function viewer_3d_keyup(event) {
    event= (event) ? event : ((window.event) ? window.event : null);
    switch(event.keyCode) {
       case 37: this.key_left=0; break;
       case 38: this.key_up=0; break;
       case 39: this.key_right=0; break;
       case 40: this.key_down=0; break;
    }
}


function viewer_3d(name,width,height) {
	this.name=name;
	this.width=width;
	this.height=height;
	
	this.to_screen_x=viewer_3d_to_screen_x;
	this.to_screen_y=viewer_3d_to_screen_y;
	this.rotate_x=viewer_3d_rotate_x;
	this.rotate_y=viewer_3d_rotate_y;
	this.rotate_z=viewer_3d_rotate_z;
	this.draw_face=viewer_3d_draw_face;
	this.draw_poly=viewer_3d_draw_poly;
	this._draw_poly=_viewer_3d_draw_poly;
	this.draw_all=viewer_3d_draw_all;
	this.fetchxml=viewer_3d_fetchxml;
	this.load_geometry=viewer_3d_load_geometry;
	this.compute_centroid=viewer_3d_compute_centroid;
	this.compute_centroids=viewer_3d_compute_centroids;
	this.compute_normal=viewer_3d_compute_normal;
	this.compute_normals=viewer_3d_compute_normals;
	this.insert_model=viewer_3d_insert_model;
	this.onload_document=viewer_3d_onload_document;
	this.rotate_vectors=viewer_3d_rotate_vectors;
	this.z_sort_by_centroid=viewer_3d_z_sort_by_centroid;
	this.z_sort_by_intersection=viewer_3d_z_sort_by_intersection;
	this.attach_to_keyboard=viewer_3d_attach_to_keyboard;
	this.attach_to_mouse=viewer_3d_attach_to_mouse;
	this.mousecoords=viewer_3d_mousecoords;
	this.update_rotation_speed=viewer_3d_update_rotation_speed;
	this.keyup=viewer_3d_keyup;
	this.keydown=viewer_3d_keydown;
	this.animate=viewer_3d_animate;
	this.matrix_multiply=viewer_3d_matrix_multiply;
	this.transform_vertices=viewer_3d_transform_vertices;
	
	this.z_sort=this.z_sort_by_centroid;
	this.cull_backfaces=1;
	this.shader=new flat_shader(this);
	
	this.r=[
		[1.0 , 0.0 , 0.0],
		[0.0 , 1.0 , 0.0],
		[0.0 , 0.0 , 1.0], 
	];
	
	this.fill_style="white";
	this.stroke_style="white";
   
	this.theta_x = 0.05;
	this.theta_y = 0.05;
	
	this.update_rotation_speed(this.theta_x, this.theta_y);
	
	this.d=4;
	this.s=this.width*(4.0/3);
	this.sx_center=this.width/2;
	this.sy_center=this.height/2;
	
	this.key_left=0;
	this.key_right=0;
	this.key_up=0;
	this.key_down=0;
	
	this.mouse_left=0;
	this.mouse_right=0;
	this.mouse_up=0;
	this.mouse_down=0;
}

function viewer_3d_update_rotation_speed(theta_x, theta_y) {
   
   this.rhp=[
       [ Math.cos(this.theta_x), 0.0, Math.sin(this.theta_x)],
       [0                 , 1.0, 0.0              ],
       [-Math.sin(this.theta_x), 0.0, Math.cos(this.theta_x)],
   ];

   this.rhm=[
        [ Math.cos(this.theta_x), 0.0,-Math.sin(this.theta_x)],
        [0                 , 1.0, 0.0              ],
        [ Math.sin(this.theta_x), 0.0, Math.cos(this.theta_x)],
    ];

    this.rvp=[
        [ 1.0, 0.0              , 0.0              ],
        [ 0.0, Math.cos(this.theta_y), Math.sin(this.theta_y)],
        [ 0.0,-Math.sin(this.theta_y), Math.cos(this.theta_y)],
    ];

    this.rvm=[
       [ 1.0, 0.0              , 0.0              ],
       [ 0.0, Math.cos(this.theta_y),-Math.sin(this.theta_y)],
       [ 0.0, Math.sin(this.theta_y), Math.cos(this.theta_y)],
    ];
	
}

function get_xml_request_object() {
    if (window.XMLHttpRequest) {
        return new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        return new ActiveXObject("Microsoft.XMLHTTP");
    }   
    alert("Can't find XML Http Request object!");
}
