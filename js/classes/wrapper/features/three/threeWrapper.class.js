;
(function(name, context, factory) {
	// Supports UMD. AMD, CommonJS/Node.js and browser context
	if (typeof module !== "undefined" && module.exports) {
		module.exports = factory();
	} else if (typeof define === "function" && define.amd) {
		define(factory);
	} else {
		context[name] = factory();
	}
})("threeWrapper", this, function() {
	'use strict';
	var inited = false;
	var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
	var scene = new THREE.Scene();
	var renderer = new THREE.WebGLRenderer();
	var mouseStartPoint = {
		x: -1,
		y: -1
	};
	var yOffset = 0;
	var objectMatrix = null;

	var activedGradientRange = null;

	var geometry = null;

	camera.position.z = 1000;

	return {
		_getRender: function(width, height) {
			camera.position.x = width / 2;
			camera.position.y = height / 2;
			renderer.setSize(width, height);
			inited = true;
			return renderer.domElement;
		},
		_render: function(matrix, calibrationMatrix, radius) {
			if (!inited) return;
			if (!matrix || !matrix.length || !matrix[0].length) return;
			yOffset = matrix.length * matrix[0].length / 10;
			if (activedGradientRange !== heatmapWrapper._getActivedGradientRange())
				activedGradientRange = heatmapWrapper._getActivedGradientRange();
			if (!geometry) geometry = new THREE.SphereGeometry(radius / 2);
			var min = 1;
			for (var ele in activedGradientRange) min = Math.min(min, commonFunc._toFloat(ele));
			/*
			for (var i = scene.children.length - 1; i >= 0; i--) {
				scene.remove(scene.children[i]);
			}
			*/
			camera.lookAt(scene.position);

			if (!objectMatrix || !objectMatrix.length) {
				objectMatrix = [];
				for (var i = 0; i < matrix.length; i++) {
					var objMatrixX = [];
					for (var j = 0; j < matrix[i].length; j++) {
						var sphere = new THREE.Mesh(geometry,
							new THREE.MeshBasicMaterial({
								color: 0x0000ff,
								//vertexColors: THREE.VertexColors,
								wireframe: true
							}));
						sphere.position.x = i * radius * 1.5 - matrix.length * radius / 2;
						sphere.position.y = yOffset;
						sphere.position.z = -j * radius * 1.5 + matrix[i].length * radius / 2;
						scene.add(sphere);
						objMatrixX.push(sphere);
					}
					objectMatrix.push(objMatrixX);
				}
			} else {
				for (var i = 0; i < objectMatrix.length; i++) {
					if (i >= matrix.length) continue;
					for (var j = 0; j < objectMatrix[i].length; j++) {
						if (j >= matrix[i].length) continue;
						var y = 0;
						if (calibrationMatrix && calibrationMatrix.length <= objectMatrix.length &&
							calibrationMatrix[i].length <= objectMatrix[i].length)
							y = Math.abs(matrix[i][j] - calibrationMatrix[i][j]) / (4096 - calibrationMatrix[i][j]);
						else
							y = matrix[i][j] / 4096;
						objectMatrix[i][j].material.setValues({
							color: 0x0000ff
						});
						objectMatrix[i][j].position.y = -y * radius * 10 + yOffset;
						if (min >= y) continue;
						for (var ele in activedGradientRange) {
							if (commonFunc._toFloat(ele) > y) {
								objectMatrix[i][j].material.setValues({
									color: activedGradientRange[ele]
								});
								break;
							}
						}
					}
				}
			}
			renderer.render(scene, camera);
		},
		_startMove: function(event) {
			mouseStartPoint.x = event.clientX;
			mouseStartPoint.y = event.clientY;
		},
		_endMove: function(event) {
			if (mouseStartPoint.x === -1 || mouseStartPoint.y === -1) return;
			camera.position.x += mouseStartPoint.x - event.clientX;
			camera.position.y += mouseStartPoint.y - event.clientY;
			//if (event.clientX > mouseStartPoint.x && event.clientY > mouseStartPoint.y && camera.position.z < 3000)
			//	camera.position.z += 30;
			//if (event.clientX < mouseStartPoint.x && event.clientY < mouseStartPoint.y && camera.position.z > 200)
			//	camera.position.z -= 30;
			mouseStartPoint.x = -1;
			mouseStartPoint.y = -1;
		},
		_moveCamera: function(event) {
			if (mouseStartPoint.x === -1 || mouseStartPoint.y === -1) return;
			camera.position.x += mouseStartPoint.x - event.clientX;
			camera.position.y += mouseStartPoint.y - event.clientY;
			camera.lookAt(scene.position);
			renderer.render(scene, camera);
			mouseStartPoint.x = event.clientX;
			mouseStartPoint.y = event.clientY;
		}
	};
});