/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 */

import React, { useEffect, memo } from 'react';
const Chevy_truck = require('./model/chevy_truck.glb');
const Mercedes = require('./model/mercedes.glb');
const Truck = require('./model/truck.glb');
const Jaguar = require('./model/jaguar.glb');
const Wheel = require('./model/wheel.glb');
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createStructuredSelector } from 'reselect';

import StartExperience from 'components/StartExperience';

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import {
  makeSelectRepos,
  makeSelectLoading,
  makeSelectError,
} from 'containers/App/selectors';
import { loadRepos } from '../App/actions';

import './index.css';

export function HomePage() {
  let renderer = null;
  let scene = null;
  let camera = null;
  let light = null;
  let model = null;
  let mixer = null;
  let reticle = null;
  let lastFrame = Date.now();
  let mercedes = null;
  let truck = null;
  let jaguar = null;
  let wheel = null;
  let currentModel = null;

  const carsConstant = [
    { path: Chevy_truck, name: 'Chevy_truck' },
    { path: Mercedes, name: 'Mercedes' },
    { path: Wheel, name: 'Wheel' },
    { path: Truck, name: 'Truck' },
    { path: Jaguar, name: 'Jaguar' },
  ];

  const [isXRSupportedText, setIsXRSupportedText] = React.useState('');
  const [isWebXRStarted, setIsWebXRStarted] = React.useState(false);
  const [isSurfaceTracked, setIsSurfaceTracked] = React.useState(false);
  const [isObjPlaced, setIsObjPlaced] = React.useState(false);
  const [modelAdded, setModelAdded] = React.useState([]);

  const initScene = (gl, session) => {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );

    // load our gltf model
    var loader = new GLTFLoader();
    //setModelAdded('dddffdfds')
    loader.load(
      Chevy_truck,
      gltf => {
        model = gltf.scene;
        //model.scale.set(1.8, 1.8, 1.8);
        model.castShadow = true;
        model.receiveShadow = true;
        currentModel = model;
        setModelAdded([...modelAdded, 'chevy_truck']);
        loadAllModel();
        mixer = new THREE.AnimationMixer(model);
      },
      () => {},
      error => console.error(error),
    );

    const loadAllModel = () => {
      carsConstant.forEach(async car => {
        var loader = new GLTFLoader();
        loader.load(
          car.path,
          gltf => {
            console.log(car);
            if (car.name === 'Mercedes') {
              window.mercedes = gltf.scene;
              mercedes = gltf.scene;
              mercedes.castShadow = true;
              mercedes.receiveShadow = true;
            } else if (car.name === 'Truck') {
              truck = gltf.scene;
              truck.castShadow = true;
              truck.receiveShadow = true;
            } else if (car.name === 'Jaguar') {
              jaguar = gltf.scene;
              jaguar.castShadow = true;
              jaguar.receiveShadow = true;
            } else if (car.name === 'Wheel') {
              wheel = gltf.scene;
              //wheel.scale.set(1.8, 1.8, 1.8);
              wheel.castShadow = true;
              wheel.receiveShadow = true;
            }
          },
          () => {},
          error => console.error(error),
        );
        setModelAdded(['Chevy_truck', 'Mercedes', 'Truck', 'Jaguar', 'Wheel']);
      });
    };

    light = new THREE.PointLight(0xffffff, 0.8, 100); // soft white light
    light.position.set(camera.position.x, camera.position.y, camera.position.z);
    // light.position.z = 1;
    // light.position.y = -1;
    scene.add(light);

    var directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 1, 0);
    scene.add(directionalLight);

    var directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight2.position.set(1, 0, 0);
    scene.add(directionalLight2);

    var directionalLight3 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight3.position.set(0, 0, 1);
    scene.add(directionalLight3);

    // create and configure three.js renderer with XR support
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      autoClear: true,
      context: gl,
    });
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

  useEffect(() => {
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

    //set all state to default
    setIsXRSupportedText('');
    setIsWebXRStarted(false);
    setIsSurfaceTracked(false);
    setIsObjPlaced(false);
  }

  const hasParentWithMatchingSelector = (target, selector) => {
    return [...document.querySelectorAll(selector)].some(el =>
      el.contains(target),
    );
  };

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
      //model.scale.set(2,2,2);
      scene.add(model);
      setIsObjPlaced(true);

      // start object animation right away
      // instead of placing an object we will just toggle animation state
      document
        .getElementById('overlay')
        .removeEventListener('click', placeObject);
      document
        .getElementById('overlay')
        .addEventListener('click', handelOverlayClick);
    }
  }

  function handelOverlayClick(event) {
    console.log(modelAdded);

    if (hasParentWithMatchingSelector(event.target, '.dropdown')) {
      console.log(hasParentWithMatchingSelector(event.target, '.Wheel'));
      if (hasParentWithMatchingSelector(event.target, '.Wheel')) {
        scene.remove(currentModel);
        scene.add(wheel);
        currentModel = wheel;
      }
      if (hasParentWithMatchingSelector(event.target, '.Truck')) {
        scene.remove(currentModel);
        scene.add(truck);
        currentModel = truck;
      }
      if (hasParentWithMatchingSelector(event.target, '.Mercedes')) {
        scene.remove(currentModel);
        scene.add(mercedes);
        currentModel = mercedes;
      }
      if (hasParentWithMatchingSelector(event.target, '.Jaguar')) {
        scene.remove(currentModel);
        scene.add(jaguar);
        currentModel = jaguar;
      }
      if (hasParentWithMatchingSelector(event.target, '.Chevy_truck')) {
        scene.remove(currentModel);
        scene.add(model);
        currentModel = model;
      }
    }
  }

  const openDropdown = () =>
    document
      .getElementsByClassName('dropdown-content')[0]
      .classList.toggle('show');

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
    light.position.set(camera.position.x, camera.position.y, camera.position.z);
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

  function ARHtmlContent() {
    return isWebXRStarted ? (
      <div className="ARContent">
        {isObjPlaced && (
          <div className="dropdown">
            <div id="myDropdown" className="dropdown-content">
              {modelAdded.map(element => {
                return (
                  <div key={element} className={element}>
                    <button>{element}</button>
                  </div>
                );
              })}
            </div>
            <button className="dropbtn" onClick={openDropdown}>
              Dropdown
            </button>
          </div>
        )}
      </div>
    ) : (
      ''
    );
  }

  return (
    <article>
      <Helmet>
        <title>Cars Demo</title>
        <meta name="description" content="Verse Labs Project car options AR" />
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
