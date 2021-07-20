const DEFAULT_OBJ_DEPTH = 200,
	  DIE_OFFSET = 60;

var renderer = new THREE.WebGLRenderer({ antialias:true }),
	clock = new THREE.Clock( true ),
	scene = new Physijs.Scene(),
	camera = new THREE.PerspectiveCamera( 90, 1, 1, 1000 ),
	motion_control,
	point_light = new THREE.PointLight( 'white', 0.65, 0 ),
	ambient_light = new THREE.AmbientLight( 'white', 0.35 ),
	animate,
	elapsed_time = clock.getElapsedTime();

var center,
	base_wall,
	top_wall,
	left_wall,
	left_wall_support1,
	left_wall_support2,
	right_wall,
	right_wall_support1,
	right_wall_support2,
	back_wall,
	back_wall_support1,
	back_wall_support2,
	front_wall,
	front_wall_support1,
	front_wall_support2,
	die1,
	die2;

var lowest_border,
	highest_border,
	leftmost_border,
	rightmost_border,
	furthest_border,
	closest_border;

var	accel_x,
	accel_y,
	accel_z;

const visibleHeight = ( ovr_depth, camera ) => {
	const CAMERA_DEPTH = camera.position.z;

	if( ovr_depth < CAMERA_DEPTH ) {
		ovr_depth -= CAMERA_DEPTH;
	} else {
		ovr_depth += CAMERA_DEPTH;
	}

	const V_FOV = THREE.Math.degToRad( camera.fov );
	return 2*Math.tan( V_FOV/2 ) * Math.abs( ovr_depth );
};

const visibleWidth = ( ovr_depth, camera ) => {
	const VISIBLE_HEIGHT = visibleHeight( ovr_depth, camera );
	return VISIBLE_HEIGHT * camera.aspect;
};

function onWindowResize( event ) {
	camera.aspect = window.innerWidth/window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight, true );
}

function frame() {
	if( animate ) {
		animate();
	}
	
	renderer.render( scene, camera );
}

function sceneInit() {
	if( !THREE.WEBGL.isWebGLAvailable() ) {
		alert( THREE.WEBGL.getWebGLErrorMessage() );
	}
	
	document.body.appendChild( renderer.domElement );
	document.body.style.margin = 0;
	document.body.style.overflow = 'hidden';
	renderer.setAnimationLoop( frame );
	renderer.shadowMap.enabled = true;
	renderer.shadowMapSoft = true;

	scene.setGravity( new THREE.Vector3( 0, -55, 0 ) );
	
	point_light.castShadow = true;
	point_light.shadow.mapSize = new THREE.Vector2( 1024*2, 1024*2 );
	scene.add( point_light );

	scene.add( ambient_light );
	
	window.addEventListener( 'resize', onWindowResize, false );
	onWindowResize();
}

function collision( other_obj ) {
	if( other_obj instanceof Physijs.BoxMesh || other_obj instanceof Physijs.SphereMesh || other_obj instanceof Physijs.CylinderMesh ) {
		if( this.position != center.position ) {
			if( other_obj.position.x <= leftmost_border && other_obj.position.y <= lowest_border && other_obj.position.z <= furthest_border ) {
				other_obj.applyCentralForce( other_obj.position.lerp( center.position ).multiply( new THREE.Vector3( 10, 10, 10 ) ) );
			} else if( other_obj.position.x >= rightmost_border && other_obj.position.y <= lowest_border && other_obj.position.z <= furthest_border ) {
				other_obj.applyCentralForce( other_obj.position.lerp( center.position ).multiply( new THREE.Vector3( -10, 10, 10 ) ) );
			} else if( other_obj.position.x >= rightmost_border && other_obj.position.y >= highest_border && other_obj.position.z <= furthest_border ) {
				other_obj.applyCentralForce( other_obj.position.lerp( center.position ).multiply( new THREE.Vector3( -10, -10, 10 ) ) );
			} else if( other_obj.position.x >= rightmost_border && other_obj.position.y <= lowest_border && other_obj.position.z >= closest_border ) {
				other_obj.applyCentralForce( other_obj.position.lerp( center.position ).multiply( new THREE.Vector3( -10, 10, -10 ) ) );
			} else if( other_obj.position.x <= leftmost_border && other_obj.position.y >= highest_border && other_obj.position.z >= closest_border ) {
				other_obj.applyCentralForce( other_obj.position.lerp( center.position ).multiply( new THREE.Vector3( 10, -10, -10 ) ) );
			} else if( other_obj.position.x <= leftmost_border && other_obj.position.y <= lowest_border && other_obj.position.z >= closest_border ) {
				other_obj.applyCentralForce( other_obj.position.lerp( center.position ).multiply( new THREE.Vector3( 10, 10, -10 ) ) );
			} else if( other_obj.position.x <= leftmost_border && other_obj.position.y >= highest_border && other_obj.position.z <= furthest_border ) {
				other_obj.applyCentralForce( other_obj.position.lerp( center.position ).multiply( new THREE.Vector3( 10, -10, 10 ) ) );
			} else if( other_obj.position.x >= rightmost_border && other_obj.position.y >= highest_border && other_obj.position.z >= closest_border ) {
				other_obj.applyCentralForce( other_obj.position.lerp( center.position ).multiply( new THREE.Vector3( -10, -10, -10 ) ) );
			} else if( other_obj.position.x <= leftmost_border && other_obj.position.y <= lowest_border ) {
				other_obj.applyCentralForce( other_obj.position.lerp( center.position ).multiply( new THREE.Vector3( 10, 10, 0 ) ) );
			} else if( other_obj.position.x <= leftmost_border && other_obj.position.z <= furthest_border ) {
				other_obj.applyCentralForce( other_obj.position.lerp( center.position ).multiply( new THREE.Vector3( 10, 0, 10 ) ) );
			} else if( other_obj.position.y <= lowest_border && other_obj.position.z <= furthest_border ) {
				other_obj.applyCentralForce( other_obj.position.lerp( center.position ).multiply( new THREE.Vector3( 0, 10, 10 ) ) );
			} else if( other_obj.position.x >= rightmost_border && other_obj.position.y <= lowest_border ) {
				other_obj.applyCentralForce( other_obj.position.lerp( center.position ).multiply( new THREE.Vector3( -10, 10, 0 ) ) );
			} else if( other_obj.position.x >= rightmost_border && other_obj.position.z <= furthest_border ) {
				other_obj.applyCentralForce( other_obj.position.lerp( center.position ).multiply( new THREE.Vector3( -10, 0, 10 ) ) );
			} else if( other_obj.position.y >= highest_border && other_obj.position.z <= furthest_border ) {
				other_obj.applyCentralForce( other_obj.position.lerp( center.position ).multiply( new THREE.Vector3( 0, -10, 10 ) ) );
			} else if( other_obj.position.x <= leftmost_border && other_obj.position.y >= highest_border ) {
				other_obj.applyCentralForce( other_obj.position.lerp( center.position ).multiply( new THREE.Vector3( 10, -10, 0 ) ) );
			} else if( other_obj.position.x <= leftmost_border && other_obj.position.z >= closest_border ) {
				other_obj.applyCentralForce( other_obj.position.lerp( center.position ).multiply( new THREE.Vector3( 10, 0, -10 ) ) );
			} else if( other_obj.position.y <= lowest_border && other_obj.position.z >= closest_border ) {
				other_obj.applyCentralForce( other_obj.position.lerp( center.position ).multiply( new THREE.Vector3( 0, 10, -10 ) ) );
			} else if( other_obj.position.x >= rightmost_border && other_obj.position.y >= highest_border ) {
				other_obj.applyCentralForce( other_obj.position.lerp( center.position ).multiply( new THREE.Vector3( -10, -10, 0 ) ) );
			} else if( other_obj.position.x >= rightmost_border && other_obj.position.z >= closest_border ) {
				other_obj.applyCentralForce( other_obj.position.lerp( center.position ).multiply( new THREE.Vector3( -10, 0, -10 ) ) );
			} else if( other_obj.position.y >= highest_border && other_obj.position.z >= closest_border ) {
				other_obj.applyCentralForce( other_obj.position.lerp( center.position ).multiply( new THREE.Vector3( 0, -10, -10 ) ) );
			} else if( other_obj.position.y <= lowest_border ) {
				other_obj.applyCentralForce( other_obj.position.lerp( center.position ).multiply( new THREE.Vector3( 0, 10, 0 ) ) );
			} else if( other_obj.position.y  >= highest_border ) {
				other_obj.applyCentralForce( other_obj.position.lerp( center.position ).multiply( new THREE.Vector3( 0, -10, 0 ) ) );
			} else if( other_obj.position.x <= leftmost_border ) {
				other_obj.applyCentralForce( other_obj.position.lerp( center.position ).multiply( new THREE.Vector3( 10, 0, 0 ) ) );
			} else if( other_obj.position.x >= rightmost_border ) {
				other_obj.applyCentralForce( other_obj.position.lerp( center.position ).multiply( new THREE.Vector3( -10, 0, 0 ) ) );
			} else if( other_obj.position.z <= furthest_border ) {
				other_obj.applyCentralForce( other_obj.position.lerp( center.position ).multiply( new THREE.Vector3( 0, 0, 10 ) ) );
			} else if( other_obj.position.z >= closest_border ) {
				other_obj.applyCentralForce( other_obj.position.lerp( center.position ).multiply( new THREE.Vector3( 0, 0, -10 ) ) );
			}
		}

		other_obj.setAngularVelocity(
			new THREE.Vector3(
				THREE.Math.randFloat( -1.5, 1.5 ),
				THREE.Math.randFloat( -1.5, 1.5 ),
				THREE.Math.randFloat( -1.5, 1.5 )
			)
		);
	}
}

function containerInit() {
	const DEFAULT_OBJ_LENGTH = VISIBLE_HEIGHT + 100;

	center = new Physijs.BoxMesh(
		new THREE.BoxGeometry( 0.1, 0.1, 0.1 ),
		Physijs.createMaterial(
			new THREE.MeshBasicMaterial({
				side: THREE.FrontSide,
				visible: false
			})
		),				
		0
	);

	base_wall = new Physijs.BoxMesh(
		new THREE.BoxGeometry( DEFAULT_OBJ_LENGTH, 1, DEFAULT_OBJ_DEPTH ),
		Physijs.createMaterial(
			new THREE.MeshLambertMaterial({
				color: 'navy',
				reflectivity: 0.5,
				side: THREE.FrontSide
			}),
			0.3,
			0.5
		),				
		0
	);
	base_wall.position.set( 0, -VISIBLE_HEIGHT/2 + 25, 0 );
	base_wall.receiveShadow = true;
	center.add( base_wall );
	
	top_wall = base_wall.clone();
	top_wall.position.set( 0, VISIBLE_HEIGHT/2 - 25, 0 );
	top_wall.rotation.set( 0, 0, Math.PI );
	top_wall.receiveShadow = true;
	center.add( top_wall );
	
	left_wall = new Physijs.BoxMesh(
		new THREE.BoxGeometry( DEFAULT_OBJ_LENGTH, 1, DEFAULT_OBJ_DEPTH ),
		Physijs.createMaterial(
			new THREE.MeshLambertMaterial({
				color: 'navy',
				reflectivity: 0.5,
				side: THREE.FrontSide
			}),
			0.3,
			0.5
		),				
		0
	);
	left_wall.position.set( -VISIBLE_WIDTH/2 + 25, 0, 0 );
	left_wall.rotation.set( 0, 0, Math.PI/2 );
	left_wall.receiveShadow = true;
	center.add( left_wall );

	left_wall_support1 = left_wall.clone();
	left_wall_support1.position.set( -VISIBLE_WIDTH/2 + 24, -50, 0 );
	left_wall_support1.rotation.set( 0, 0, Math.PI/2 );
	left_wall_support1.receiveShadow = true;
	center.add( left_wall_support1 );

	left_wall_support2 = left_wall.clone();
	left_wall_support2.position.set( -VISIBLE_WIDTH/2 + 24, 50, 0 );
	left_wall_support2.rotation.set( 0, 0, Math.PI/2 );
	left_wall_support2.receiveShadow = true;
	center.add( left_wall_support2 );
	
	right_wall = left_wall.clone();
	right_wall.position.set( VISIBLE_WIDTH/2 - 25, 0, 0 );
	right_wall.rotation.set( 0, 0, -Math.PI/2 );
	right_wall.receiveShadow = true;
	center.add( right_wall );

	right_wall_support1 = left_wall.clone();
	right_wall_support1.position.set( VISIBLE_WIDTH/2 - 24, -50, 0 );
	right_wall_support1.rotation.set( 0, 0, -Math.PI/2 );
	right_wall_support1.receiveShadow = true;
	center.add( right_wall_support1 );

	right_wall_support2 = left_wall.clone();
	right_wall_support2.position.set( VISIBLE_WIDTH/2 - 24, 50, 0 );
	right_wall_support2.rotation.set( 0, 0, -Math.PI/2 );
	right_wall_support2.receiveShadow = true;
	center.add( right_wall_support2 );
	
	back_wall = new Physijs.BoxMesh(
		new THREE.BoxGeometry( DEFAULT_OBJ_LENGTH, DEFAULT_OBJ_LENGTH, 1 ),
		Physijs.createMaterial(
			new THREE.MeshLambertMaterial({
				color: 'navy',
				reflectivity: 0.5,
				side: THREE.FrontSide
			}),
			0.3,
			0.5
		),				
		0
	);
	back_wall.position.set( 0, 0, -DEFAULT_OBJ_DEPTH/2 + 25 );
	back_wall.rotation.set( 0, Math.PI, 0 );
	back_wall.receiveShadow = true;
	center.add( back_wall );

	back_wall_support1 = back_wall.clone();
	back_wall_support1.position.set( 0, -50, -DEFAULT_OBJ_DEPTH/2 + 24 );
	back_wall_support1.rotation.set( 0, Math.PI, 0 );
	back_wall_support1.receiveShadow = true;
	center.add( back_wall_support1 );

	back_wall_support2 = back_wall.clone();
	back_wall_support2.position.set( 0, 50, -DEFAULT_OBJ_DEPTH/2 + 24 );
	back_wall_support2.rotation.set( 0, Math.PI, 0 );
	back_wall_support2.receiveShadow = true;
	center.add( back_wall_support2 );
	
	front_wall = back_wall.clone();
	front_wall.position.set( 0, 0, DEFAULT_OBJ_DEPTH/2 - 25 );
	front_wall.visible = false;
	center.add( front_wall );

	front_wall_support1 = back_wall.clone();
	front_wall_support1.position.set( 0, -50, DEFAULT_OBJ_DEPTH/2 - 24 );
	front_wall_support1.visible = false;
	center.add( front_wall_support1 );

	front_wall_support2 = back_wall.clone();
	front_wall_support2.position.set( 0, 50, DEFAULT_OBJ_DEPTH/2 - 24 );
	front_wall_support2.visible = false;
	center.add( front_wall_support2 );

	center.add( camera );
	center.add( point_light );
	scene.add( center );

	center.setCcdMotionThreshold( VISIBLE_HEIGHT );
	center.setCcdSweptSphereRadius( VISIBLE_HEIGHT/2 );

	base_wall.setCcdMotionThreshold( VISIBLE_WIDTH );
	base_wall.setCcdSweptSphereRadius( VISIBLE_WIDTH/2 );

	top_wall.setCcdMotionThreshold( VISIBLE_WIDTH );
	top_wall.setCcdSweptSphereRadius( VISIBLE_WIDTH/2 );

	left_wall.setCcdMotionThreshold( VISIBLE_HEIGHT );
	left_wall.setCcdSweptSphereRadius( VISIBLE_HEIGHT/2 );

	left_wall_support1.setCcdMotionThreshold( VISIBLE_HEIGHT );
	left_wall_support1.setCcdSweptSphereRadius( VISIBLE_HEIGHT/2 );

	left_wall_support2.setCcdMotionThreshold( VISIBLE_HEIGHT );
	left_wall_support2.setCcdSweptSphereRadius( VISIBLE_HEIGHT/2 );

	right_wall.setCcdMotionThreshold( VISIBLE_HEIGHT );
	right_wall.setCcdSweptSphereRadius( VISIBLE_HEIGHT/2 );

	right_wall_support1.setCcdMotionThreshold( VISIBLE_HEIGHT );
	right_wall_support1.setCcdSweptSphereRadius( VISIBLE_HEIGHT/2 );

	right_wall_support2.setCcdMotionThreshold( VISIBLE_HEIGHT );
	right_wall_support2.setCcdSweptSphereRadius( VISIBLE_HEIGHT/2 );

	back_wall.setCcdMotionThreshold( VISIBLE_HEIGHT );
	back_wall.setCcdSweptSphereRadius( VISIBLE_HEIGHT/2 );

	back_wall_support1.setCcdMotionThreshold( VISIBLE_HEIGHT );
	back_wall_support1.setCcdSweptSphereRadius( VISIBLE_HEIGHT/2 );

	back_wall_support2.setCcdMotionThreshold( VISIBLE_HEIGHT );
	back_wall_support2.setCcdSweptSphereRadius( VISIBLE_HEIGHT/2 );

	front_wall.setCcdMotionThreshold( VISIBLE_HEIGHT );
	front_wall.setCcdSweptSphereRadius( VISIBLE_HEIGHT/2 );

	front_wall_support1.setCcdMotionThreshold( VISIBLE_HEIGHT );
	front_wall_support1.setCcdSweptSphereRadius( VISIBLE_HEIGHT/2 );

	front_wall_support2.setCcdMotionThreshold( VISIBLE_HEIGHT );
	front_wall_support2.setCcdSweptSphereRadius( VISIBLE_HEIGHT/2 );

	lowest_border = base_wall.position.y + DIE_OFFSET;
	highest_border = top_wall.position.y - DIE_OFFSET;
	leftmost_border = left_wall.position.x + DIE_OFFSET;
	rightmost_border = right_wall.position.x - DIE_OFFSET;
	furthest_border = back_wall.position.z + DIE_OFFSET;
	closest_border = front_wall.position.z - DIE_OFFSET;

	center.addEventListener( 'collision', collision );

	base_wall.addEventListener( 'collision', collision );

	top_wall.addEventListener( 'collision', collision );

	left_wall.addEventListener( 'collision', collision );
	left_wall_support1.addEventListener( 'collision', collision );
	left_wall_support2.addEventListener( 'collision', collision );

	right_wall.addEventListener( 'collision', collision );
	right_wall_support1.addEventListener( 'collision', collision );
	right_wall_support2.addEventListener( 'collision', collision );

	back_wall.addEventListener( 'collision', collision );
	back_wall_support1.addEventListener( 'collision', collision );
	back_wall_support2.addEventListener( 'collision', collision );

	front_wall.addEventListener( 'collision', collision );
	front_wall_support1.addEventListener( 'collision', collision );
	front_wall_support2.addEventListener( 'collision', collision );
}

window.addEventListener( "devicemotion", deviceMotion, true );
function deviceMotion( event ) {
	accel_x = event.acceleration.x.toFixed( 1 );
	accel_y = event.acceleration.y.toFixed( 1 );
	accel_z = event.acceleration.z.toFixed( 1 );

	if( accel_x != 0 ) {
		if( die1.position.y <= lowest_border ) {
			die1.applyCentralForce( new THREE.Vector3( 0, 0, 3000*accel_x ) );
		}	
		if( die1.position.y  >= highest_border ) {
			die1.applyCentralForce( new THREE.Vector3( -3000*accel_x, 0, 0 ) );
		}	
		if( ( die1.position.x <= leftmost_border && die1.position.y >= lowest_border && die1.position.y <= highest_border ) ||
			( die1.position.z <= furthest_border && die1.position.y >= lowest_border && die1.position.y <= highest_border && die1.position.x >= leftmost_border && die1.position.x <= center.position.x ) ||
			( die1.position.z >= closest_border && die1.position.y >= lowest_border && die1.position.y <= highest_border && die1.position.x >= leftmost_border && die1.position.x <= center.position.x ) ) {
			die1.applyCentralForce( new THREE.Vector3( 0, Math.abs( 3000*accel_x ), 0 ) );
		}	
		if( ( die1.position.x >= rightmost_border && die1.position.y >= lowest_border && die1.position.y <= highest_border ) ||
			( die1.position.z <= furthest_border && die1.position.y >= lowest_border && die1.position.y <= highest_border && die1.position.x <= rightmost_border && die1.position.x >= center.position.x ) ||
			( die1.position.z >= closest_border && die1.position.y >= lowest_border && die1.position.y <= highest_border && die1.position.x <= rightmost_border && die1.position.x >= center.position.x ) ) {
			die1.applyCentralForce( new THREE.Vector3( 0, Math.abs( 3000*accel_x ), 0 ) );
		}

		if( die2.position.y <= lowest_border ) {
			die2.applyCentralForce( new THREE.Vector3( 0, 0, 3000*accel_x ) );
		}	
		if( die2.position.y  >= highest_border ) {
			die2.applyCentralForce( new THREE.Vector3( -3000*accel_x, 0, 0 ) );
		}	
		if( ( die2.position.x <= leftmost_border && die2.position.y >= lowest_border && die2.position.y <= highest_border ) ||
			( die2.position.z <= furthest_border && die2.position.y >= lowest_border && die2.position.y <= highest_border && die2.position.x >= leftmost_border && die2.position.x <= center.position.x ) ||
			( die2.position.z >= closest_border && die2.position.y >= lowest_border && die2.position.y <= highest_border && die2.position.x >= leftmost_border && die2.position.x <= center.position.x ) ) {
			die2.applyCentralForce( new THREE.Vector3( 0, Math.abs( 3000*accel_x ), 0 ) );
		}	
		if( ( die2.position.x >= rightmost_border && die2.position.y >= lowest_border && die2.position.y <= highest_border ) ||
			( die2.position.z <= furthest_border && die2.position.y >= lowest_border && die2.position.y <= highest_border && die2.position.x <= rightmost_border && die2.position.x >= center.position.x ) ||
			( die2.position.z >= closest_border && die2.position.y >= lowest_border && die2.position.y <= highest_border && die2.position.x <= rightmost_border && die2.position.x >= center.position.x ) ) {
			die2.applyCentralForce( new THREE.Vector3( 0, Math.abs( 3000*accel_x ), 0 ) );
		}
	}

	if( accel_y != 0 ) {
		if( die1.position.y <= lowest_border ) {
			die1.applyCentralForce( new THREE.Vector3( 0, 3000*accel_y, 0 ) );
		}	
		if( die1.position.y  >= highest_border ) {
			die1.applyCentralForce( new THREE.Vector3( 0, -3000*accel_y, 0 ) );
		}	
		if( ( die1.position.x <= leftmost_border && die1.position.y >= lowest_border && die1.position.y <= highest_border ) ||
			( die1.position.z <= furthest_border && die1.position.y >= lowest_border && die1.position.y <= highest_border && die1.position.x >= leftmost_border && die1.position.x <= center.position.x ) ||
			( die1.position.z >= closest_border && die1.position.y >= lowest_border && die1.position.y <= highest_border && die1.position.x >= leftmost_border && die1.position.x <= center.position.x ) ) {
			die1.applyCentralForce( new THREE.Vector3( 0, 0, 3000*accel_y ) );
		}	
		if( ( die1.position.x >= rightmost_border && die1.position.y >= lowest_border && die1.position.y <= highest_border ) ||
			( die1.position.z <= furthest_border && die1.position.y >= lowest_border && die1.position.y <= highest_border && die1.position.x <= rightmost_border && die1.position.x >= center.position.x ) ||
			( die1.position.z >= closest_border && die1.position.y >= lowest_border && die1.position.y <= highest_border && die1.position.x <= rightmost_border && die1.position.x >= center.position.x ) ) {
			die1.applyCentralForce( new THREE.Vector3( 0, 0, 3000*accel_y ) );
		}

		if( die2.position.y <= lowest_border ) {
			die2.applyCentralForce( new THREE.Vector3( 0, 3000*accel_y, 0 ) );
		}	
		if( die2.position.y  >= highest_border ) {
			die2.applyCentralForce( new THREE.Vector3( 0, -3000*accel_y, 0 ) );
		}	
		if( ( die2.position.x <= leftmost_border && die2.position.y >= lowest_border && die2.position.y <= highest_border ) ||
			( die2.position.z <= furthest_border && die2.position.y >= lowest_border && die2.position.y <= highest_border && die2.position.x >= leftmost_border && die2.position.x <= center.position.x ) ||
			( die2.position.z >= closest_border && die2.position.y >= lowest_border && die2.position.y <= highest_border && die2.position.x >= leftmost_border && die2.position.x <= center.position.x ) ) {
			die2.applyCentralForce( new THREE.Vector3( 0, 0, 3000*accel_y ) );
		}	
		if( ( die2.position.x >= rightmost_border && die2.position.y >= lowest_border && die2.position.y <= highest_border ) ||
			( die2.position.z <= furthest_border && die2.position.y >= lowest_border && die2.position.y <= highest_border && die2.position.x <= rightmost_border && die2.position.x >= center.position.x ) ||
			( die2.position.z >= closest_border && die2.position.y >= lowest_border && die2.position.y <= highest_border && die2.position.x <= rightmost_border && die2.position.x >= center.position.x ) ) {
			die2.applyCentralForce( new THREE.Vector3( 0, 0, 3000*accel_y ) );
		}
	}

	if( accel_z != 0 ) {
		if( die1.position.y <= lowest_border ) {
			die1.applyCentralForce( new THREE.Vector3( 3000*accel_z, 0, 0 ) );
		}	
		if( die1.position.y  >= highest_border ) {
			die1.applyCentralForce( new THREE.Vector3( 0, 0, -3000*accel_z ) );
		}	
		if( ( die1.position.x <= leftmost_border && die1.position.y >= lowest_border && die1.position.y <= highest_border ) ||
			( die1.position.z <= furthest_border && die1.position.y >= lowest_border && die1.position.y <= highest_border && die1.position.x >= leftmost_border && die1.position.x <= center.position.x ) ||
			( die1.position.z >= closest_border && die1.position.y >= lowest_border && die1.position.y <= highest_border && die1.position.x >= leftmost_border && die1.position.x <= center.position.x ) ) {
			die1.applyCentralForce( new THREE.Vector3( 3000*accel_z, 0, 0 ) );
		}	
		if( ( die1.position.x >= rightmost_border && die1.position.y >= lowest_border && die1.position.y <= highest_border ) ||
			( die1.position.z <= furthest_border && die1.position.y >= lowest_border && die1.position.y <= highest_border && die1.position.x <= rightmost_border && die1.position.x >= center.position.x ) ||
			( die1.position.z >= closest_border && die1.position.y >= lowest_border && die1.position.y <= highest_border && die1.position.x <= rightmost_border && die1.position.x >= center.position.x ) ) {
			die1.applyCentralForce( new THREE.Vector3( 3000*accel_z, 0, 0 ) );
		}

		if( die2.position.y <= lowest_border ) {
			die2.applyCentralForce( new THREE.Vector3( 3000*accel_z, 0, 0 ) );
		}	
		if( die2.position.y  >= highest_border ) {
			die2.applyCentralForce( new THREE.Vector3( 0, 0, -3000*accel_z ) );
		}	
		if( ( die2.position.x <= leftmost_border && die2.position.y >= lowest_border && die2.position.y <= highest_border ) ||
			( die2.position.z <= furthest_border && die2.position.y >= lowest_border && die2.position.y <= highest_border && die2.position.x >= leftmost_border && die2.position.x <= center.position.x ) ||
			( die2.position.z >= closest_border && die2.position.y >= lowest_border && die2.position.y <= highest_border && die2.position.x >= leftmost_border && die2.position.x <= center.position.x ) ) {
			die2.applyCentralForce( new THREE.Vector3( 3000*accel_z, 0, 0 ) );
		}	
		if( ( die2.position.x >= rightmost_border && die2.position.y >= lowest_border && die2.position.y <= highest_border ) ||
			( die2.position.z <= furthest_border && die2.position.y >= lowest_border && die2.position.y <= highest_border && die2.position.x <= rightmost_border && die2.position.x >= center.position.x ) ||
			( die2.position.z >= closest_border && die2.position.y >= lowest_border && die2.position.y <= highest_border && die2.position.x <= rightmost_border && die2.position.x >= center.position.x ) ) {
			die2.applyCentralForce( new THREE.Vector3( 3000*accel_z, 0, 0 ) );
		}
	}
}

function diceInit() {
	die1 = new Physijs.BoxMesh(
		new THREE.BoxGeometry( 20, 22, 20 ),
		Physijs.createMaterial(
			new THREE.MeshPhongMaterial({
				color: 'beige',
				shininess: 200,
				reflectivity: 0.2,
				side: THREE.FrontSide
			}),
			0.2,
			0.5
		),
		200
	);
	die1.castShadow = true;

	var face21 = die1.clone();
	face21.rotation.set( Math.PI/2, 0, 0 );
	face21.castShadow = true;
	die1.add( face21 );

	var face31 = die1.clone();
	face31.rotation.set( 0, 0, Math.PI/2 );
	face31.castShadow = true;
	die1.add( face31 );

	var vertex11 = new Physijs.SphereMesh(
		new THREE.SphereGeometry( 1, 60, 30 ),
		Physijs.createMaterial(
			new THREE.MeshPhongMaterial({
				color: 'beige',
				shininess: 200,
				reflectivity: 0.2,
				side: THREE.FrontSide
			}),
			0.2,
			0.5
		),
		10
	);
	vertex11.position.set( -10, -10, -10 );
	vertex11.castShadow = true;
	die1.add( vertex11 );

	var vertex21 = vertex11.clone();
	vertex21.position.set( -10, -10, 10 );
	vertex21.castShadow = true;
	die1.add( vertex21 );

	var vertex31 = vertex11.clone();
	vertex31.position.set( -10, 10, -10 );
	vertex31.castShadow = true;
	die1.add( vertex31 );

	var vertex41 = vertex11.clone();
	vertex41.position.set( 10, -10, -10 );
	vertex41.castShadow = true;
	die1.add( vertex41 );

	var vertex51 = vertex11.clone();
	vertex51.position.set( 10, 10, 10 );
	vertex51.castShadow = true;
	die1.add( vertex51 );

	var vertex61 = vertex11.clone();
	vertex61.position.set( 10, 10, -10 );
	vertex61.castShadow = true;
	die1.add( vertex61 );

	var vertex71 = vertex11.clone();
	vertex71.position.set( 10, -10, 10 );
	vertex71.castShadow = true;
	die1.add( vertex71 );

	var vertex81 = vertex11.clone();
	vertex81.position.set( -10, 10, 10 );
	vertex81.castShadow = true;
	die1.add( vertex81 );

	var vertices1 = [vertex11, vertex21, vertex31, vertex41, vertex51, vertex61, vertex71, vertex81];

	var edge11 = new Physijs.CylinderMesh(
		new THREE.CylinderGeometry( 1, 1, 20, 30 ),
		Physijs.createMaterial(
			new THREE.MeshPhongMaterial({
				color: 'beige',
				shininess: 200,
				reflectivity: 0.2,
				side: THREE.FrontSide
			}),
			0.2,
			0.5
		),
		50
	);
	edge11.position.set( -10, 0, -10 );
	edge11.castShadow = true;
	die1.add( edge11 );

	var edge21 = edge11.clone();
	edge21.position.set( -10, 0, 10 );
	edge21.castShadow = true;
	die1.add( edge21 );

	var edge31 = edge11.clone();
	edge31.position.set( 10, 0, -10 );
	edge31.castShadow = true;
	die1.add( edge31 );

	var edge41 = edge11.clone();
	edge41.position.set( 10, 0, 10 );
	edge41.castShadow = true;
	die1.add( edge41 );

	var edge51 = edge11.clone();
	edge51.position.set( -10, -10, 0 );
	edge51.rotation.set( Math.PI/2, 0, 0 );
	edge51.castShadow = true;
	die1.add( edge51 );

	var edge61 = edge11.clone();
	edge61.position.set( 10, -10, 0 );
	edge61.rotation.set( Math.PI/2, 0, 0 );
	edge61.castShadow = true;
	die1.add( edge61 );

	var edge71 = edge11.clone();
	edge71.position.set( -10, 10, 0 );
	edge71.rotation.set( Math.PI/2, 0, 0 );
	edge71.castShadow = true;
	die1.add( edge71 );

	var edge81 = edge11.clone();
	edge81.position.set( 10, 10, 0 );
	edge81.rotation.set( Math.PI/2, 0, 0 );
	edge81.castShadow = true;
	die1.add( edge81 );

	var edge91 = edge11.clone();
	edge91.position.set( 0, -10, -10 );
	edge91.rotation.set( 0, 0, Math.PI/2 );
	edge91.castShadow = true;
	die1.add( edge91 );

	var edge101 = edge11.clone();
	edge101.position.set( 0, 10, -10 );
	edge101.rotation.set( 0, 0, Math.PI/2 );
	edge101.castShadow = true;
	die1.add( edge101 );

	var edge111 = edge11.clone();
	edge111.position.set( 0, -10, 10 );
	edge111.rotation.set( 0, 0, Math.PI/2 );
	edge111.castShadow = true;
	die1.add( edge111 );

	var edge121 = edge11.clone();
	edge121.position.set( 0, 10, 10 );
	edge121.rotation.set( 0, 0, Math.PI/2 );
	edge121.castShadow = true;
	die1.add( edge121 );

	var edges1 = [edge11, edge21, edge31, edge41, edge51, edge61, edge71, edge81, edge91, edge101, edge111, edge121];

	var dot11 = new Physijs.BoxMesh(
		new THREE.CircleGeometry( 1, 32 ),
		Physijs.createMaterial(
			new THREE.MeshPhongMaterial({
				color: 'black',
				shininess: 200,
				reflectivity: 0.2,
				polygonOffset: true,
				polygonOffsetFactor: -2,
				polygonOffsetUnits: 1
			})
		),
		5
	);
	dot11.rotation.set( -Math.PI/2, 0, 0 );
	dot11.position.set( 0, 11, 0 );
	die1.add( dot11 );

	var dot21 = dot11.clone();
	dot21.rotation.set( Math.PI/2, 0, 0 );
	dot21.position.set( -5, -11, -5 );
	die1.add( dot21 );

	var dot31 = dot11.clone();
	dot31.rotation.set( Math.PI/2, 0, 0 );
	dot31.position.set( -5, -11, 0 );
	die1.add( dot31 );

	var dot41 = dot11.clone();
	dot41.rotation.set( Math.PI/2, 0, 0 );
	dot41.position.set( -5, -11, 5 );
	die1.add( dot41 );

	var dot51 = dot11.clone();
	dot51.rotation.set( Math.PI/2, 0, 0 );
	dot51.position.set( 5, -11, -5 );
	die1.add( dot51 );

	var dot61 = dot11.clone();
	dot61.rotation.set( Math.PI/2, 0, 0 );
	dot61.position.set( 5, -11, 0 );
	die1.add( dot61 );

	var dot71 = dot11.clone();
	dot71.rotation.set( Math.PI/2, 0, 0 );
	dot71.position.set( 5, -11, 5 );
	die1.add( dot71 );

	var dot81 = dot11.clone();
	dot81.rotation.set( 2*Math.PI, 0, 0 );
	dot81.position.set( -5, 5, 11 );
	die1.add( dot81 );

	var dot91 = dot81.clone();
	dot91.position.set( 5, -5, 11 );
	die1.add( dot91 );

	var dot101 = dot91.clone();
	dot101.rotation.set( Math.PI, 0, 0 );
	dot101.position.set( -5, 5, -11 );
	die1.add( dot101 );

	var dot111 = dot101.clone();
	dot111.position.set( 5, 5, -11 );
	die1.add( dot111 );

	var dot121 = dot111.clone();
	dot121.position.set( 5, -5, -11 );
	die1.add( dot121 );

	var dot131 = dot111.clone();
	dot131.position.set( -5, -5, -11 );
	die1.add( dot131 );

	var dot141 = dot111.clone();
	dot141.position.set( 0, 0, -11 );
	die1.add( dot141 );

	var dot151 = dot141.clone();
	dot151.rotation.set( 0, Math.PI/2, 0 );
	dot151.position.set( 11, 0, 0 );
	die1.add( dot151 );

	var dot161 = dot151.clone();
	dot161.position.set( 11, 5, 5 );
	die1.add( dot161 );

	var dot171 = dot151.clone();
	dot171.position.set( 11, -5, -5 );
	die1.add( dot171 );

	var dot181 = dot171.clone();
	dot181.rotation.set( 0, -Math.PI/2, 0 );
	dot181.position.set( -11, -5, -5 );
	die1.add( dot181 );

	var dot191 = dot181.clone();
	dot191.position.set( -11, -5, 5 );
	die1.add( dot191 );

	var dot201 = dot181.clone();
	dot201.position.set( -11, 5, -5 );
	die1.add( dot201 );

	var dot211 = dot181.clone();
	dot211.position.set( -11, 5, 5 );
	die1.add( dot211 );

	die1.position.set(
		THREE.Math.randInt( leftmost_border, center.position.x - DIE_OFFSET ),
		THREE.Math.randInt( center.position.y, center.position.y + DIE_OFFSET ),
		THREE.Math.randInt( center.position.z - DIE_OFFSET, center.position.z + DIE_OFFSET )
	);
	die1.rotation.set(
		THREE.Math.randFloat( 0, 2*Math.PI ), 
		THREE.Math.randFloat( 0, 2*Math.PI ),
		THREE.Math.randFloat( 0, 2*Math.PI )
	);
	die1.scale.set( 2, 2, 2 );
	scene.add( die1 );

	die1.setCcdMotionThreshold( 40 );
	die1.setCcdSweptSphereRadius( 8 );
	die1.setDamping( 0.2, 0.2 );

	face21.setCcdMotionThreshold( 40 );
	face21.setCcdSweptSphereRadius( 8 );
	face21.setDamping( 0.2, 0.2 );

	face31.setCcdMotionThreshold( 40 );
	face31.setCcdSweptSphereRadius( 8 );
	face31.setDamping( 0.2, 0.2 );

	for( var i = 0; i < vertices1.length; i++ ) {
		vertices1[i].setCcdMotionThreshold( 2 );
		vertices1[i].setCcdSweptSphereRadius( 0.4 );
		vertices1[i].setDamping( 0.1, 0.1 );
	}

	for( var i = 0; i < edges1.length; i++ ) {
		edges1[i].setCcdMotionThreshold( 40 );
		edges1[i].setCcdSweptSphereRadius( 8 );
		edges1[i].setDamping( 0.2, 0.2 );
	}

	die2 = new Physijs.BoxMesh(
		new THREE.BoxGeometry( 20, 22, 20 ),
		Physijs.createMaterial(
			new THREE.MeshPhongMaterial({
				color: 'beige',
				shininess: 200,
				reflectivity: 0.2,
				side: THREE.FrontSide
			}),
			0.2,
			0.5
		),
		200
	);
	die2.castShadow = true;

	var face22 = die2.clone();
	face22.rotation.set( Math.PI/2, 0, 0 );
	face22.castShadow = true;
	die2.add( face22 );

	var face32 = die2.clone();
	face32.rotation.set( 0, 0, Math.PI/2 );
	face32.castShadow = true;
	die2.add( face32 );

	var vertex12 = new Physijs.SphereMesh(
		new THREE.SphereGeometry( 1, 60, 30 ),
		Physijs.createMaterial(
			new THREE.MeshPhongMaterial({
				color: 'beige',
				shininess: 200,
				reflectivity: 0.2,
				side: THREE.FrontSide
			}),
			0.2,
			0.5
		),
		10
	);
	vertex12.position.set( -10, -10, -10 );
	vertex12.castShadow = true;
	die2.add( vertex12 );

	var vertex22 = vertex12.clone();
	vertex22.position.set( -10, -10, 10 );
	vertex22.castShadow = true;
	die2.add( vertex22 );

	var vertex32 = vertex12.clone();
	vertex32.position.set( -10, 10, -10 );
	vertex32.castShadow = true;
	die2.add( vertex32 );

	var vertex42 = vertex12.clone();
	vertex42.position.set( 10, -10, -10 );
	vertex42.castShadow = true;
	die2.add( vertex42 );

	var vertex52 = vertex12.clone();
	vertex52.position.set( 10, 10, 10 );
	vertex52.castShadow = true;
	die2.add( vertex52 );

	var vertex62 = vertex12.clone();
	vertex62.position.set( 10, 10, -10 );
	vertex62.castShadow = true;
	die2.add( vertex62 );

	var vertex72 = vertex12.clone();
	vertex72.position.set( 10, -10, 10 );
	vertex72.castShadow = true;
	die2.add( vertex72 );

	var vertex82 = vertex12.clone();
	vertex82.position.set( -10, 10, 10 );
	vertex82.castShadow = true;
	die2.add( vertex82 );

	var vertices2 = [vertex12, vertex22, vertex32, vertex42, vertex52, vertex62, vertex72, vertex82];

	var edge12 = new Physijs.CylinderMesh(
		new THREE.CylinderGeometry( 1, 1, 20, 30 ),
		Physijs.createMaterial(
			new THREE.MeshPhongMaterial({
				color: 'beige',
				shininess: 200,
				reflectivity: 0.2,
				side: THREE.FrontSide
			}),
			0.2,
			0.5
		),
		50
	);
	edge12.position.set( -10, 0, -10 );
	edge12.castShadow = true;
	die2.add( edge12 );

	var edge22 = edge12.clone();
	edge22.position.set( -10, 0, 10 );
	edge22.castShadow = true;
	die2.add( edge22 );

	var edge32 = edge12.clone();
	edge32.position.set( 10, 0, -10 );
	edge32.castShadow = true;
	die2.add( edge32 );

	var edge42 = edge12.clone();
	edge42.position.set( 10, 0, 10 );
	edge42.castShadow = true;
	die2.add( edge42 );

	var edge52 = edge12.clone();
	edge52.position.set( -10, -10, 0 );
	edge52.rotation.set( Math.PI/2, 0, 0 );
	edge52.castShadow = true;
	die2.add( edge52 );

	var edge62 = edge12.clone();
	edge62.position.set( 10, -10, 0 );
	edge62.rotation.set( Math.PI/2, 0, 0 );
	edge62.castShadow = true;
	die2.add( edge62 );

	var edge72 = edge12.clone();
	edge72.position.set( -10, 10, 0 );
	edge72.rotation.set( Math.PI/2, 0, 0 );
	edge72.castShadow = true;
	die2.add( edge72 );

	var edge82 = edge11.clone();
	edge82.position.set( 10, 10, 0 );
	edge82.rotation.set( Math.PI/2, 0, 0 );
	edge82.castShadow = true;
	die2.add( edge82 );

	var edge92 = edge12.clone();
	edge92.position.set( 0, -10, -10 );
	edge92.rotation.set( 0, 0, Math.PI/2 );
	edge92.castShadow = true;
	die2.add( edge92 );

	var edge102 = edge12.clone();
	edge102.position.set( 0, 10, -10 );
	edge102.rotation.set( 0, 0, Math.PI/2 );
	edge102.castShadow = true;
	die2.add( edge102 );

	var edge112 = edge12.clone();
	edge112.position.set( 0, -10, 10 );
	edge112.rotation.set( 0, 0, Math.PI/2 );
	edge112.castShadow = true;
	die2.add( edge112 );

	var edge122 = edge12.clone();
	edge122.position.set( 0, 10, 10 );
	edge122.rotation.set( 0, 0, Math.PI/2 );
	edge122.castShadow = true;
	die2.add( edge122 );

	var edges2 = [edge12, edge22, edge32, edge42, edge52, edge62, edge72, edge82, edge92, edge102, edge112, edge122];

	var dot12 = new Physijs.BoxMesh(
		new THREE.CircleGeometry( 1, 32 ),
		Physijs.createMaterial(
			new THREE.MeshPhongMaterial({
				color: 'black',
				shininess: 200,
				reflectivity: 0.2,
				polygonOffset: true,
				polygonOffsetFactor: -2,
				polygonOffsetUnits: 1
			})
		),
		5
	);
	dot12.rotation.set( -Math.PI/2, 0, 0 );
	dot12.position.set( 0, 11, 0 );
	die2.add( dot12 );

	var dot22 = dot12.clone();
	dot22.rotation.set( Math.PI/2, 0, 0 );
	dot22.position.set( -5, -11, -5 );
	die2.add( dot22 );

	var dot32 = dot12.clone();
	dot32.rotation.set( Math.PI/2, 0, 0 );
	dot32.position.set( -5, -11, 0 );
	die2.add( dot32 );

	var dot42 = dot12.clone();
	dot42.rotation.set( Math.PI/2, 0, 0 );
	dot42.position.set( -5, -11, 5 );
	die2.add( dot42 );

	var dot52 = dot12.clone();
	dot52.rotation.set( Math.PI/2, 0, 0 );
	dot52.position.set( 5, -11, -5 );
	die2.add( dot52 );

	var dot62 = dot12.clone();
	dot62.rotation.set( Math.PI/2, 0, 0 );
	dot62.position.set( 5, -11, 0 );
	die2.add( dot62 );

	var dot72 = dot12.clone();
	dot72.rotation.set( Math.PI/2, 0, 0 );
	dot72.position.set( 5, -11, 5 );
	die2.add( dot72 );

	var dot82 = dot12.clone();
	dot82.rotation.set( 2*Math.PI, 0, 0 );
	dot82.position.set( -5, 5, 11 );
	die2.add( dot82 );

	var dot92 = dot82.clone();
	dot92.position.set( 5, -5, 11 );
	die2.add( dot92 );

	var dot102 = dot92.clone();
	dot102.rotation.set( Math.PI, 0, 0 );
	dot102.position.set( -5, 5, -11 );
	die2.add( dot102 );

	var dot112 = dot102.clone();
	dot112.position.set( 5, 5, -11 );
	die2.add( dot112 );

	var dot122 = dot112.clone();
	dot122.position.set( 5, -5, -11 );
	die2.add( dot122 );

	var dot132 = dot112.clone();
	dot132.position.set( -5, -5, -11 );
	die2.add( dot132 );

	var dot142 = dot112.clone();
	dot142.position.set( 0, 0, -11 );
	die2.add( dot142 );

	var dot152 = dot142.clone();
	dot152.rotation.set( 0, Math.PI/2, 0 );
	dot152.position.set( 11, 0, 0 );
	die2.add( dot152 );

	var dot162 = dot152.clone();
	dot162.position.set( 11, 5, 5 );
	die2.add( dot162 );

	var dot172 = dot152.clone();
	dot172.position.set( 11, -5, -5 );
	die2.add( dot172 );

	var dot182 = dot172.clone();
	dot182.rotation.set( 0, -Math.PI/2, 0 );
	dot182.position.set( -11, -5, -5 );
	die2.add( dot182 );

	var dot192 = dot182.clone();
	dot192.position.set( -11, -5, 5 );
	die2.add( dot192 );

	var dot202 = dot182.clone();
	dot202.position.set( -11, 5, -5 );
	die2.add( dot202 );

	var dot212 = dot182.clone();
	dot212.position.set( -11, 5, 5 );
	die2.add( dot212 );

	die2.position.set(
		THREE.Math.randInt( center.position.x + DIE_OFFSET, rightmost_border ),
		THREE.Math.randInt( center.position.y, center.position.y + DIE_OFFSET ),
		THREE.Math.randInt( center.position.z - DIE_OFFSET, center.position.z + DIE_OFFSET )
	);
	die2.rotation.set(2*
		THREE.Math.randFloat( 0, 2*Math.PI ), 
		THREE.Math.randFloat( 0, 2*Math.PI ),
		THREE.Math.randFloat( 0, 2*Math.PI )
	);
	die2.scale.set( 2, 2, 2 );
	scene.add( die2 );

	die2.setCcdMotionThreshold( 40 );
	die2.setCcdSweptSphereRadius( 8 );
	die2.setDamping( 0.2, 0.2 );

	face22.setCcdMotionThreshold( 40 );
	face22.setCcdSweptSphereRadius( 8 );
	face22.setDamping( 0.2, 0.2 );

	face32.setCcdMotionThreshold( 40 );
	face32.setCcdSweptSphereRadius( 8 );
	face32.setDamping( 0.2, 0.2 );

	for( var i = 0; i < vertices2.length; i++ ) {
		vertices2[i].setCcdMotionThreshold( 2 );
		vertices2[i].setCcdSweptSphereRadius( 0.4 );
		vertices2[i].setDamping( 0.1, 0.1 );
	}

	for( var i = 0; i < edges2.length; i++ ) {
		edges2[i].setCcdMotionThreshold( 40 );
		edges2[i].setCcdSweptSphereRadius( 8 );
		edges2[i].setDamping( 0.2, 0.2 );
	}
}

function outOfBoundsAnimationHandler() {
	if( Math.abs( die1.getLinearVelocity().x ) >= 200 ) {
		die1.applyCentralForce( new THREE.Vector3( 0, die1.getLinearVelocity().y, die1.getLinearVelocity().z ) );
	}

	if( Math.abs( die1.getLinearVelocity().y ) >= 200 ) {
		die1.applyCentralForce( new THREE.Vector3( die1.getLinearVelocity().x, 0, die1.getLinearVelocity().z ) );
	}

	if( Math.abs( die1.getLinearVelocity().z ) >= 200 ) {
		die1.applyCentralForce( new THREE.Vector3( die1.getLinearVelocity().x, die1.getLinearVelocity().y, 0 ) );
	}

	if( Math.abs( die2.getLinearVelocity().x ) >= 200 ) {
		die2.applyCentralForce( new THREE.Vector3( 0, die2.getLinearVelocity().y, die2.getLinearVelocity().z ) );
	}

	if( Math.abs( die2.getLinearVelocity().y ) >= 200 ) {
		die2.applyCentralForce( new THREE.Vector3( die2.getLinearVelocity().x, 0, die2.getLinearVelocity().z ) );
	}

	if( Math.abs( die2.getLinearVelocity().z ) >= 200 ) {
		die2.applyCentralForce( new THREE.Vector3( die2.getLinearVelocity().x, die2.getLinearVelocity().y, 0 ) );
	}

	if( die1.position.y > highest_border - 2*DIE_OFFSET/3 ) {
		die1.applyCentralForce( new THREE.Vector3( 0, -100, 0 ) );
	}

	if( die1.position.y < lowest_border + 2*DIE_OFFSET/3 ) {
		die1.applyCentralForce( new THREE.Vector3( 0, 100, 0 ) );
	}

	if( die1.position.x > rightmost_border - 2*DIE_OFFSET/3 ) {
		die1.applyCentralForce( new THREE.Vector3( -100, 0, 0 ) );
	}

	if( die1.position.x < leftmost_border + 2*DIE_OFFSET/3 ) {
		die1.applyCentralForce( new THREE.Vector3( 100, 0, 0 ) );
	}

	if( die1.position.z > closest_border - 2*DIE_OFFSET/3 ) {
		die1.applyCentralForce( new THREE.Vector3( 0, 0, -100 ) );
	}

	if( die1.position.z < furthest_border + 2*DIE_OFFSET/3 ) {
		die1.applyCentralForce( new THREE.Vector3( 0, 0, 100 ) );
	}

	if( die2.position.y > highest_border - 2*DIE_OFFSET/3 ) {
		die2.applyCentralForce( new THREE.Vector3( 0, -100, 0 ) );
	}

	if( die2.position.y < lowest_border + 2*DIE_OFFSET/3 ) {
		die2.applyCentralForce( new THREE.Vector3( 0, 100, 0 ) );
	}

	if( die2.position.x > rightmost_border - 2*DIE_OFFSET/3 ) {
		die2.applyCentralForce( new THREE.Vector3( -100, 0, 0 ) );
	}

	if( die2.position.x < leftmost_border + 2*DIE_OFFSET/3 ) {
		die2.applyCentralForce( new THREE.Vector3( 100, 0, 0 ) );
	}

	if( die2.position.z > closest_border - 2*DIE_OFFSET/3 ) {
		die2.applyCentralForce( new THREE.Vector3( 0, 0, -100 ) );
	}

	if( die2.position.z < furthest_border + 2*DIE_OFFSET/3 ) {
		die2.applyCentralForce( new THREE.Vector3( 0, 0, 100 ) );
	}
}
