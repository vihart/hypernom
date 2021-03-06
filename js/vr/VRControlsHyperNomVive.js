/**
/**
 * @author dmarcos / https://github.com/dmarcos
 with additions by https://github.com/hawksley
 and https://github.com/vihart
 and https://github.com/henryseg
 */


THREE.VRControls = function ( camera, done ) {
	this.phoneVR = new PhoneVR();

    this.lastQuaternion = null;
	this.deviceQuaternion = new THREE.Quaternion();

	//---game controller stuff---
	this.haveEvents = 'ongamepadconnected' in window;
	this.controllers = {};

	this._camera = camera;

	this._init = function () {
		var self = this;

		function connecthandler(e) {
			addgamepad(e.gamepad);
		}

		function addgamepad(gamepad) {
			self.controllers[gamepad.index] = gamepad;
		}

		function disconnecthandler(e) {
			removegamepad(e.gamepad);
		}

		function removegamepad(gamepad) {
			delete self.controllers[gamepad.index];
		}

		function scangamepads() {
			var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
			for (var i = 0; i < gamepads.length; i++) {
				if (gamepads[i]) {
					if (gamepads[i].index in self.controllers) {
						self.controllers[gamepads[i].index] = gamepads[i];
					} else {
						addgamepad(gamepads[i]);
					}
				}
			}
		}

		window.addEventListener("gamepadconnected", connecthandler);
		window.addEventListener("gamepaddisconnected", disconnecthandler);
		if (!self.haveEvents) {
			setInterval(scangamepads, 500);
		}

		if ( !navigator.mozGetVRDevices && !navigator.getVRDevices ) {
			if ( done ) {
				done("Your browser is not VR Ready");
			}
			return;
		}

		if ( navigator.getVRDevices ) {
			navigator.getVRDevices().then( gotVRDevices );
		} else {
			navigator.mozGetVRDevices( gotVRDevices );
		}

		function gotVRDevices( devices ) {
			var vrInput;
			var error;
			for ( var i = 0; i < devices.length; ++i ) {
				if ( devices[i] instanceof PositionSensorVRDevice ) {
					vrInput = devices[i]
					self._vrInput = vrInput;
					break; // We keep the first we encounter
				}
			}
			if ( done ) {
				if ( !vrInput ) {
				 error = 'HMD not available';
				}
				done( error );
			}
		}
	};

	this._init();

	this.manualRotation = quat.create();
	this.manualQuat = quat.create();

	this.manualControls = {
      65 : {index: 1, sign: 1, active: 0},  // a
      68 : {index: 1, sign: -1, active: 0}, // d
      87 : {index: 0, sign: 1, active: 0},  // w
      83 : {index: 0, sign: -1, active: 0}, // s
      81 : {index: 2, sign: -1, active: 0}, // q
      69 : {index: 2, sign: 1, active: 0},  // e

      38 : {index: 3, sign: -1, active: 0},  // up
      40 : {index: 3, sign: 1, active: 0}, // down
      37 : {index: 4, sign: 1, active: 0}, // left
      39 : {index: 4, sign: -1, active: 0},   // right
      191 : {index: 5, sign: 1, active: 0}, // fwd slash
      222 : {index: 5, sign: -1, active: 0},   // single quote

      74 : {index: 7, sign: 1, active: 0}, //j
      76 : {index: 7, sign: -1, active: 0}, //l
      73 : {index: 6, sign: 1, active: 0}, //i
      75 : {index: 6, sign: -1, active: 0}, //k
      85 : {index: 8, sign: -1, active: 0}, //u
      79 : {index: 8, sign: 1, active: 0}, //o
    };

	this.manualRotateRate = new Float32Array([0, 0, 0]);
	this.manualMoveRate = new Float32Array([0, 0, 0]);
	this.manualQuatRate = new Float32Array([0, 0, 0]);
	this.updateTime = 0;

	this.update = function() {
		var camera = this._camera;
		var vrState = this.getVRState();
		var manualRotation = this.manualRotation;
		var manualQuat = this.manualQuat;
		var oldTime = this.updateTime;
		var newTime = Date.now();
		this.updateTime = newTime;

	  var interval = (newTime - oldTime) * 0.0005;

		/*
		Get controller button info
		*/
		var j, i;

		for (j in this.controllers) {
			var controller = this.controllers[j];

			this.manualMoveRate[1] = -1 * Math.round(controller.axes[0]);
			this.manualMoveRate[0] = Math.round(controller.axes[1]);
			this.manualRotateRate[1] = -1 * Math.round(controller.axes[2]);
			this.manualRotateRate[0] = -1 * Math.round(controller.axes[3]);
		}

	  ///do translation
		var offset = new THREE.Vector3();
		if (this.manualMoveRate[0] != 0 || this.manualMoveRate[1] != 0 || this.manualMoveRate[2] != 0){
		    offset = getFwdVector().multiplyScalar( interval * this.manualMoveRate[0])
						.add(getRightVector().multiplyScalar( interval * this.manualMoveRate[1]))
						.add(getUpVector().multiplyScalar( interval * this.manualMoveRate[2]));
		 }

		camera.position = camera.position.add(offset);

		///do quat movement
		// var offsetQuatTemp = new THREE.Vector3();
		// if (this.manualQuatRate[0] != 0 || this.manualQuatRate[1] != 0 || this.manualQuatRate[2] != 0){
		//     offsetQuatTemp = getFwdVector().multiplyScalar( interval * this.manualQuatRate[0]).add(
		//       		   getRightVector().multiplyScalar( interval * this.manualQuatRate[1])).add(
		//       		   getUpVector().multiplyScalar( interval * this.manualQuatRate[2]));
		//     }
		// var offsetQuatVelocity = new THREE.Vector4(offsetQuatTemp.x, offsetQuatTemp.y, offsetQuatTemp.z, 0.0);
		// var quatAmount = offsetQuatVelocity.length();
		// offsetQuatVelocity.normalize();
		// var offsetQuat = pointOnS3Geod( new THREE.Vector4(0.0,0.0,0.0,1.0), offsetQuatVelocity, quatAmount );
		// controlsQuat = quatMult( offsetQuat, controlsQuat );
		// controlsQuat = quatMult( controlsQuat, offsetQuat );
		// manualRotation = quat.fromValues(controlsQuat.x, controlsQuat.y, controlsQuat.z, controlsQuat.w);

		// new do quat movement, also does rotation
	  var updateQ = quat.fromValues(this.manualQuatRate[0] * interval,
	                                this.manualQuatRate[1] * interval,
	                                this.manualQuatRate[2] * interval, 1.0);
	  quat.normalize(updateQ, updateQ);
	  quat.multiply(manualQuat, manualQuat, updateQ);
	  quat.normalize(manualQuat, manualQuat);

	  controlsQuat.x = manualQuat[0];
	  controlsQuat.y = manualQuat[1];
	  controlsQuat.z = manualQuat[2];
	  controlsQuat.w = manualQuat[3];

		// do camera rotation
	  var update = quat.fromValues(this.manualRotateRate[0] * interval,
	                               this.manualRotateRate[1] * interval,
	                               this.manualRotateRate[2] * interval, 1.0);
	  quat.normalize(update, update);
	  quat.multiply(manualRotation, manualRotation, update);
	  quat.normalize(manualRotation, manualRotation);

	  var totalRotation = quat.create();
	  quat.multiply(totalRotation, manualQuat, manualRotation);  //both manual quat and manual rot applied...

		if ( camera ) {
			if ( !vrState ) {
				camera.quaternion.fromArray(totalRotation);
				return;
			}

				// Applies head rotation from sensors data.
		    this.deviceQuaternion.copy(vrState.hmd.rotation);
		    return false;


	      if (this.deviceQuaternion[0] !== 0 ||
						this.deviceQuaternion[1] !== 0 ||
						this.deviceQuaternion[2] !== 0 ||
						this.deviceQuaternion[3] !== 0) {

	      	
		     console.log(this.deviceQuaternion);
		 	console.log(this.lastQuaternion);
	      	// Implement lift from SO(3) to S^3
		    if(this.lastQuaternion !== null){
		        var difference = [];
		        var deviceQuaternionInverse = [];
		        quat.invert(deviceQuaternionInverse, this.deviceQuaternion);
		        quat.multiply(difference, this.lastQuaternion, deviceQuaternionInverse);
		        console.log(difference);
		        if(difference[3] < 0.0){
		            quat.scale(this.deviceQuaternion, this.deviceQuaternion, -1);

		        }
		    }
		    this.lastQuaternion.copy(this.deviceQuaternion);

			quat.multiply(totalRotation, this.deviceQuaternion, totalRotation);
	      }

			camera.quaternion.fromArray( totalRotation );
	
		}

	};

	this.zeroSensor = function() {
		var vrInput = this._vrInput;
		if ( !vrInput ) {
			return null;
		}
		vrInput.zeroSensor();
	};

	this.getVRState = function() {
		var vrInput = this._vrInput;
		var orientation;
		var vrState;
		if ( vrInput ) {
			orientation	= vrInput.getState().orientation;
		} else if (this.phoneVR.rotationQuat()) {
			orientation = this.phoneVR.rotationQuat();
		} else {
			return null;
		}

		if (orientation == null) {
			return null;
		}
		vrState = {
			hmd : {
				rotation : [
					orientation.x,
					orientation.y,
					orientation.z,
					orientation.w
				]
			}
		};
		return vrState;
	};

};


function getFwdVector() {
  return new THREE.Vector3(0,0,1).applyQuaternion(camera.quaternion);
}
function getRightVector() {
  return new THREE.Vector3(-1,0,0).applyQuaternion(camera.quaternion);
}
function getUpVector() {
  return new THREE.Vector3(0,-1,0).applyQuaternion(camera.quaternion);
}

//hold down keys to do rotations and stuff
function key(event, sign) {
  var control = controls.manualControls[event.keyCode];

  if (typeof control === 'undefined' || sign === 1 && control.active || sign === -1 && !control.active) {
    return;
  }

  control.active = (sign === 1);
  if (control.index <= 2){
    controls.manualRotateRate[control.index] += sign * control.sign;
  }
  else if (control.index <= 5) {
    controls.manualMoveRate[control.index - 3] += sign * control.sign;
  }
  else if (control.index <= 8) {
    controls.manualQuatRate[control.index - 6] += sign * control.sign;
  }
}

document.addEventListener('keydown', function(event) { key(event, 1); }, false);
document.addEventListener('keyup', function(event) { key(event, -1); }, false);
