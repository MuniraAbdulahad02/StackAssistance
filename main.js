import './style.css'

// import packages
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

async function main() {
  // creating scene 
  const scene = new THREE.Scene();

  // creating camera that mimics the eye
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

  // rendering canvas showing scene
  const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#background'),
  });

  // making renderer full size 
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  // sets the camera z position to 4 and y position to 0.6
  camera.position.setZ(4);
  camera.position.setY(0.6);

  // load in 3D object
  const loader = new GLTFLoader();

  // load in 3D object (returns a promise -> internally loads the models, if succesfull returns the model, if failed returns null)
  function loadModel(path) {
    return new Promise((resolve, reject) => {
      loader.load(path, function (gltf) {
        resolve(gltf.scene);
      }, undefined, function (error) {
        console.error(error);
        reject(null);
      });
    });
  }

  /*Bone components names:
  Main
  Arm_01
  Arm_02
  Arm_03
  Hand
  Finger_top_02
  Finger_top_01
  Finger_down_02
  Finger_down_01
  IK
  */

  // wait till promise is resolved or rejected
  // robot 
  const robot = await loadModel('robotarm.glb');
  if (robot) {
    // resize
    robot.scale.set(0.4, 0.4, 0.4);
    // move y position (up-down)
    robot.position.setY(1.5);
    
    // rotate and change position robot arm joints
    // math.PI = 180 degrees 
    robot.getObjectByName('Arm_01').rotation.x = (Math.PI / 180) * 80; // 80 degrees
    robot.getObjectByName('Arm_02').rotation.x = (Math.PI / 180) * 170; // 170 degrees
    robot.getObjectByName('Arm_03').rotation.x = (Math.PI / 180) * 95; // 95 degrees
    robot.getObjectByName('Hand').rotation.y = (Math.PI / 180) * 90; // 90 degrees
    scene.add(robot);
  }

  // pallet with boxes 
  const pallet = await loadModel('pallet-box.glb');
  if (pallet) {
    scene.add(pallet);
  }

  // tablet stand
  const tablet = await loadModel('tablet-stand.glb');
  if (tablet) {
    //resize
    tablet.scale.set(0.4, 0.4, 0.4);
    //move x position (left-right)
    tablet.position.setX(-1);
    //move z position (back-forth)
    tablet.position.setZ(0.8);
    scene.add(tablet);
  }

  // light up room with ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff);
  // add grid view
  const gridHelper = new THREE.GridHelper(10, 10, 0x000000, 0x000000);
  scene.add(ambientLight, gridHelper);

  // camera move with mouse click
  const controls = new OrbitControls(camera, renderer.domElement);


  // 0: idle (not moving)
  // 1: moving left
  // 2: moving right
  let robotState = 0;

  // Adds a eventlistener that listens to the key presses (keydown) 
  window.addEventListener('keydown', function (event) {
    // if the robot is idle (not moving) then move left or right
    if (robotState === 0) {
      if (event.key === 'ArrowLeft') {
        robotState = 1; // set state to moving left
      } else if (event.key === 'ArrowRight') {
        robotState = 2; // set state to moving right
      }
    }
  });

  // buttons on screen 
  document.getElementById('leftButton').addEventListener('click', function () {
    if (robotState === 0) {
      robotState = 1;
    }
  });
  document.getElementById('rightButton').addEventListener('click', function () {
    if (robotState === 0) {
      robotState = 2;
    }
  });

  // initialise variable
  let ammountRotated = 0;

  // calling render automatically to update UI
  function animate() {
    requestAnimationFrame(animate); // loop

    // update mouse click view 
    controls.update();

    if (robot) {
      const robotMain = robot.getObjectByName('Main'); // main joint component of the 3D model
      // 1. if robot state is moving left
      if (robotState === 1) {
        ammountRotated += Math.PI / 200;
        // 3. till the robot has rotated 90 degrees (aka ammountRotated is bigger than 90 degrees)
        if (ammountRotated <= Math.PI / 2) {
          // 2. subtract (PI / 200) from the rotation of the robotMain
          robotMain.rotation.y -= Math.PI / 200;
        } else {
          // when rotated 90 degrees (aka ammountRotated is bigger than 90 degrees) set the robot state to 0 (idle) and set ammountRotated to 0
          robotState = 0; 
          ammountRotated = 0; // bring back to value 0 and proceed
        }
      // 1. if robot state is moving right 
      } else if (robotState === 2) {
        ammountRotated += Math.PI / 200;
        // 3. till the robot has rotated 90 degrees (aka ammountRotated is bigger than 90 degrees)
        if (ammountRotated <= Math.PI / 2) {
          //2. add (PI / 200) to the rotation of the robotMain
          robotMain.rotation.y += Math.PI / 200;
        } else {
          // when rotated 90 degrees (aka ammountRotated is bigger than 90 degrees) set the robot state to 0 (idle) and set ammountRotated to 0
          robotState = 0;
          ammountRotated = 0;
        }
      }
    }
    
    renderer.render(scene, camera);
  }

  // Set the background to grey
  renderer.setClearColor(0x808080); // Set to grey

  // calling funtion animate 
  animate();
}

main();