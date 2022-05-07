/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 */

import React, { useEffect, memo } from 'react';
const Persian = require('./Beagle.glb');
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createStructuredSelector } from 'reselect';
import { BsFillPlayCircleFill, BsFillPauseCircleFill } from 'react-icons/bs';

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import StartExperience from 'components/StartExperience';

import { useInjectReducer } from 'utils/injectReducer';
import { useInjectSaga } from 'utils/injectSaga';
import {
  makeSelectRepos,
  makeSelectLoading,
  makeSelectError,
} from 'containers/App/selectors';
import H2 from 'components/H2';
import { loadRepos } from '../App/actions';
import { changeUsername } from './actions';
import { makeSelectUsername } from './selectors';
import reducer from './reducer';
import saga from './saga';

import './index.css';

const key = 'home';

export function HomePage() {
  let renderer = null;
  let scene = null;
  let camera = null;
  let light = null;
  let model = null;
  let mixer = null;
  let action = null;
  let reticle = null;
  let lastFrame = Date.now();
  var spot_light;



const MOVE_UP = 1;
const MOVE_DOWN = 0;

// Scene properties
var scene_color = 0x000000;
var scene_color_alpha = 1;

// Camera Properties
var camera_angle = 0;
var camera_range = -12;
var camera_speed = 0.05 * Math.PI/180;
var camera_target = new THREE.Vector3(0, 0, -5);
var camera_focal = 70;
var camera_near = 0.1;
var camera_far = 50;

// Lights
var light_am_color = 0xAAAAAA;
var light_spot_color = 0xDDDDDD;
var light_spot_intensity = 0.7;
var light_spot_position = {x: 5, y: 5, z: 20,}
var light_spot_camera_near = 0.5;
var light_spot_shadow_darkness = 0.35;

// Sphere properties
var sphere_upper = 0;
var sphere_lower = -4.0;
var sphere_direction = MOVE_DOWN;
var sphere_move = 0.02;
var sphere_rotation_speed = 0.05;
var sphere_size = 0.3;
var sphere_width_seg = 12;
var sphere_height_seg = 8;
var sphere_color = 0xff0000;
var sphere_position = {x: 1, y: 1, z: -9};

// Plane Properties
var plane_width = 10;
var plane_height = 10;
var plane_width_segs = 1;
var plane_height_segs = 1;
var plane_color = 0xFFFFFF;
var plane_position = {x: 0, y: -6, z: -9};

// Box properties
var box_width = 0.5;
var box_height = 0.5;
var box_depth = 1;
var box_rotation_speed = 0.01;
var box_color = 0x005500;
var box_position = {x: -1, y: -1, z: -4};


  const [isXRSupportedText, setIsXRSupportedText] = React.useState('');
  const [isWebXRStarted, setIsWebXRStarted] = React.useState(false);
  const [isSurfaceTracked, setIsSurfaceTracked] = React.useState(false);
  const [isObjPlaced, setIsObjPlaced] = React.useState(false);
  const [isMotion, setIsMotion] = React.useState(false);

  const initScene = (gl, session) => {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );

//camera.position.set(0, camera_range, 0);
//camera.useQuaternion = true;
//camera.lookAt(camera_target);

    // load our gltf model
    var loader = new GLTFLoader();
    loader.load(
      Persian,
      gltf => {
        model = gltf.scene;
        //model.scale.set(1.8, 1.8, 1.8);
        model.castShadow = true;
        model.receiveShadow = true;
        mixer = new THREE.AnimationMixer(model);

        action = mixer.clipAction(gltf.animations[0]);
        // let walkAction = mixer.clipAction( gltf.animations[ 1 ] );
        // let runAction = mixer.clipAction( gltf.animations[ 2 ] );

        //action = [ idleAction/*, walkAction, runAction*/ ];
        action.setLoop(THREE.LoopRepeat, 5);
        // action[1].setLoop(THREE.LoopRepeat,2);
        // action[2].setLoop(THREE.LoopRepeat,2);
        // action[3].setLoop(THREE.LoopRepeat,2);
      },
      () => {},
      error => console.error(error),
    );

// Add abbient light
var am_light = new THREE.AmbientLight(light_am_color); 
// soft white light
scene.add(am_light);

// Add directional light
 spot_light = new THREE.SpotLight(light_spot_color, light_spot_intensity);
//spot_light.position.set(light_spot_position.x, light_spot_position.y + 22, light_spot_position.z + 5);
spot_light.position.set(sphere_position.x, sphere_position.y + 4, sphere_position.z);
spot_light.target = scene;
spot_light.castShadow = true;
spot_light.receiveShadow = true;
//spot_light.shadowDarkness = light_spot_shadow_darkness;
spot_light.shadow.camera.near	= light_spot_camera_near;		
scene.add(spot_light);

// Add the ground plane
// var plane_geometry = new THREE.PlaneGeometry(plane_width, plane_height, plane_width_segs, plane_height_segs).rotateX(-Math.PI / 2);
// var plane_material = new THREE.MeshLambertMaterial({color: plane_color});
// //plane_material.opacity = 0.4;
// plane_material.transparent = true;
// var plane_mesh = new THREE.Mesh(plane_geometry, plane_material);
// plane_mesh.position.set(plane_position.x, plane_position.y, plane_position.z);
// plane_mesh.receiveShadow = true;
// scene.add(plane_mesh);

// // Add the box
// var box_geometry = new THREE.BoxGeometry(box_width, box_height, box_depth);
// var box_material = new THREE.MeshLambertMaterial({color: box_color});
// var box_mesh = new THREE.Mesh(box_geometry, box_material);
// box_mesh.castShadow = true;
// box_mesh.receiveShadow = true;
// box_mesh.position.set(box_position.x, box_position.y, box_position.z);
// scene.add(box_mesh);

// Add the sphere
// var sphere_geometry = new THREE.SphereGeometry(sphere_size, sphere_width_seg, sphere_height_seg);
// var sphere_material = new THREE.MeshPhongMaterial({color: sphere_color});
// var sphere_mesh = new THREE.Mesh(sphere_geometry, sphere_material);
// sphere_mesh.castShadow = true;
// sphere_mesh.receiveShadow = true;
// sphere_mesh.position.set(sphere_position.x, sphere_position.y, sphere_position.z);
// scene.add(sphere_mesh);


    // create and configure three.js renderer with XR support
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      autoClear: true,
      context: gl,
    });
    renderer.shadowMap.enabled = true;
    //renderer.setClearColor(scene_color, scene_color_alpha);
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    renderer.xr.setReferenceSpaceType('local');
    renderer.xr.setSession(session);

    // simple sprite to indicate detected surfaces
    reticle = new THREE.Mesh(
      new THREE.RingBufferGeometry(0.12, 0.15, 20).rotateX(-Math.PI / 2),
      new THREE.MeshPhongMaterial({ color: 0x0fff00 }),
    );
    // we will update it's matrix later using WebXR hit test pose matrix
    reticle.matrixAutoUpdate = false;
    reticle.visible = false;
    scene.add(reticle);
  };

  // button to start XR experience
  let xrButton = null;
  // to display debug information
  let info = null;

  React.useEffect(() => {
    if (document.getElementById('xr-button')) {
      xrButton = document.getElementById('xr-button'); // @ts-ignore
    }
    if (document.getElementById('info')) {
      info = document.getElementById('info');
    }
    checkXR();
  }, []);

  // to control the xr session
  let xrSession = null;
  // reference space used within an application https://developer.mozilla.org/en-US/docs/Web/API/XRSession/requestReferenceSpace
  let xrRefSpace = null;
  // for hit testing with detected surfaces
  let xrHitTestSource = null;

  // Canvas OpenGL context used for rendering
  let gl = null;

  function checkXR() {
    if (!window.isSecureContext) {
      setIsXRSupportedText('WebXR unavailable. Please use secure context');
    }
    if (navigator.xr) {
      navigator.xr.addEventListener('devicechange', checkSupportedState);
      setIsXRSupportedText();
      checkSupportedState();
    } else {
      setIsXRSupportedText(`XR is not supported in your browser or device.
    Try switching to Chrome if not.`);
    }
  }

  function checkSupportedState() {
    navigator.xr.isSessionSupported('immersive-ar').then(supported => {
      if (supported) {
        xrButton.innerHTML = 'Start Experience';
        xrButton.addEventListener('click', onButtonClicked);
      } else {
        xrButton.innerHTML = 'Not supported';
        setIsXRSupportedText(`XR is not supported in your browser or device.
    Try switching to Chrome if not.`);
      }
      xrButton.disabled = !supported;
    });
  }

  function onButtonClicked() {
    if (!xrSession) {
      navigator.xr
        .requestSession('immersive-ar', {
          optionalFeatures: ['dom-overlay'],
          requiredFeatures: ['local', 'hit-test'],
          domOverlay: { root: document.getElementById('overlay') },
        })
        .then(onSessionStarted, onRequestSessionError);
    } else {
      xrSession.end();
    }
  }

  function onSessionStarted(session) {
    setIsWebXRStarted(true);
    xrSession = session;
    xrButton.innerHTML = 'Exit AR';

    // Show which type of DOM Overlay got enabled (if any)
    // if (session.domOverlayState) {
    //   info.innerHTML = 'DOM Overlay type: ' + session.domOverlayState.type;
    // }

    // create a canvas element and WebGL context for rendering
    session.addEventListener('end', onSessionEnded);
    let canvas = document.createElement('canvas');
    gl = canvas.getContext('webgl', { xrCompatible: true });
    session.updateRenderState({ baseLayer: new XRWebGLLayer(session, gl) });

    // here we ask for viewer reference space, since we will be casting a ray
    // from a viewer towards a detected surface. The results of ray and surface intersection
    // will be obtained via xrHitTestSource variable
    session.requestReferenceSpace('viewer').then(refSpace => {
      session.requestHitTestSource({ space: refSpace }).then(hitTestSource => {
        xrHitTestSource = hitTestSource;
      });
    });

    session.requestReferenceSpace('local').then(refSpace => {
      xrRefSpace = refSpace;
      session.requestAnimationFrame(onXRFrame);
    });

    document.getElementById('overlay').addEventListener('click', placeObject);

    // initialize three.js scene
    initScene(gl, session);
  }

  function onRequestSessionError(ex) {
    info.innerHTML = 'Failed to start AR session.';
    console.error(ex.message);
  }

  function onSessionEnded(event) {
    setIsWebXRStarted(false);
    xrSession = null;
    xrButton.innerHTML = 'Start Experience';
    //info.innerHTML = '';
    //document.getElementById('audio').pause();
    gl = null;
    if (xrHitTestSource) xrHitTestSource.cancel();
    xrHitTestSource = null;
  }

  function placeObject() {
    if (reticle.visible && model) {
      reticle.visible = false;
      xrHitTestSource.cancel();
      xrHitTestSource = null;
      // we'll be placing our object right where the reticle was
      var cameraPostion = new THREE.Vector3();
      // var cameraDirection = new THREE.Vector3();
      // camera.getWorldPosition(cameraPostion);
      const pos = reticle.getWorldPosition(cameraPostion);
      scene.remove(reticle);
      model.position.set(pos.x, pos.y, pos.z);
      scene.add(model);
      setIsObjPlaced(true);

      // start object animation right away
      toggleAnimation();
      // instead of placing an object we will just toggle animation state
      document
        .getElementById('overlay')
        .removeEventListener('click', placeObject);
      document
        .getElementById('overlay')
        .addEventListener('click', toggleAnimation);
      setIsMotion(true);
      //document.getElementById('audio').loop = true;
      // setTimeout(() => {
      //   //document.getElementById('audio').play();
      // }, 3000);
    }
  }

  function toggleAnimation() {
    if (action.isRunning()) {
      //action.forEach(element => {
      action.stop();
      action.reset();
      // });
    } else {
      //action.forEach(element => {
      action.play();
      // });
    }
  }

  // Utility function to update animated objects
  function updateAnimation() {
    let dt = (Date.now() - lastFrame) / 1000;
    lastFrame = Date.now();
    if (mixer) {
      mixer.update(dt);
    }
  }

  function onXRFrame(t, frame) {
    let session = frame.session;
    session.requestAnimationFrame(onXRFrame);
    //light.position.set(camera.position.x, camera.position.y, camera.position.z);
    if (xrHitTestSource) {
      // obtain hit test results by casting a ray from the center of device screen
      // into AR view. Results indicate that ray intersected with one or more detected surfaces
      const hitTestResults = frame.getHitTestResults(xrHitTestSource);
      if (hitTestResults.length) {
        // obtain a local pose at the intersection point
        const pose = hitTestResults[0].getPose(xrRefSpace);
        // place a reticle at the intersection point
        reticle.matrix.fromArray(pose.transform.matrix);
        reticle.visible = true;
        setIsSurfaceTracked(true);
      } else {
        setIsSurfaceTracked(false);
      }
    } else {
      // do not show a reticle if no surfaces are intersected
      reticle.visible = false;
    }

    // update object animation
    updateAnimation();
    // bind our gl context that was created with WebXR to threejs renderer
    gl.bindFramebuffer(
      gl.FRAMEBUFFER,
      session.renderState.baseLayer.framebuffer,
    );
    // render the scene
    renderer.render(scene, camera);
  }

  function stopMotion() {
    //let audioCon = document.getElementById('audio');
    // if (isMotion) {
    //   audioCon.pause();
    // } else {
    //   audioCon.play();
    // }
    // //toggleAnimation();
    // setIsMotion(!isMotion);
  }

  useInjectReducer({ key, reducer });
  useInjectSaga({ key, saga });

  function ARHtmlContent() {
    return isWebXRStarted ? (
      <div className="ARContent">
        {false &&
          (isMotion ? (
            <BsFillPauseCircleFill
              onClick={stopMotion}
              className="play-pause-button"
            />
          ) : (
            <BsFillPlayCircleFill
              onClick={stopMotion}
              className="play-pause-button"
            />
          ))}
      </div>
    ) : (
      ''
    );
  }

  return (
    <article>
      <Helmet>
        <title>Animated Dog</title>
        <meta name="description" content="Verse Labs Project Persian Cat AR" />
      </Helmet>
      <div>
        <StartExperience
          isWebXRStarted={isWebXRStarted}
          isXRSupportedText={isXRSupportedText}
          isSurfaceTracked={isSurfaceTracked}
          isObjPlaced={isObjPlaced}
          ARHtmlContent={ARHtmlContent}
        />
        <ARHtmlContent />
      </div>

      {/* <CenteredSection>
          <H2>
            <FormattedMessage {...messages.startProjectHeader} />
          </H2>
          <p>
            <FormattedMessage {...messages.startProjectMessage} />
          </p>
        </CenteredSection> */}
    </article>
  );
}

HomePage.propTypes = {
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  repos: PropTypes.oneOfType([PropTypes.array, PropTypes.bool]),
  onSubmitForm: PropTypes.func,
  username: PropTypes.string,
  onChangeUsername: PropTypes.func,
};

const mapStateToProps = createStructuredSelector({
  repos: makeSelectRepos(),
  username: makeSelectUsername(),
  loading: makeSelectLoading(),
  error: makeSelectError(),
});

export function mapDispatchToProps(dispatch) {
  return {
    onChangeUsername: evt => dispatch(changeUsername(evt.target.value)),
    onSubmitForm: evt => {
      if (evt !== undefined && evt.preventDefault) evt.preventDefault();
      dispatch(loadRepos());
    },
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(
  withConnect,
  memo,
)(HomePage);
