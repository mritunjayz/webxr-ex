import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createStructuredSelector } from 'reselect';
import { BsFillPlayCircleFill, BsFillPauseCircleFill } from 'react-icons/bs';

import * as THREE from 'three';

import { REVISION } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

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

const Persian = require('./tower.glb');
const shadowPic = require('./shadow.png');
const key = 'home';

export function HomePage() {
  let renderer = null;
  let scene = null;
  let camera = null;
  let model = null;
  let mixer = null;
  let action = null;
  let reticle = null;
  let lastFrame = Date.now();
  let spot_light;
  let shadowMesh;

  // Lights
  let light_am_color = 0xaaaaaa;
  let light_spot_color = 0xdddddd;
  let light_spot_intensity = 0.7;
  let light_spot_camera_near = 0.5;

  let sphere_position = { x: 1, y: 1, z: -9 };

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

    const textureLoader = new THREE.TextureLoader();
    const shadowTexture = textureLoader.load(shadowPic);

    // load our gltf model
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

    const THREE_PATH = `https://unpkg.com/three@0.${REVISION}.x`;

    const manager = new THREE.LoadingManager();

    const dracoLoader = new DRACOLoader(manager).setDecoderPath(
      `${THREE_PATH}/examples/js/libs/draco/gltf/`,
    );

    const ktx2Loader = new KTX2Loader(manager)
      .setTranscoderPath(`${THREE_PATH}/examples/js/libs/basis/`)
      .detectSupport(renderer);

    const loader = new GLTFLoader(manager)
      .setCrossOrigin('anonymous')
      .setDRACOLoader(dracoLoader)
      .setKTX2Loader(ktx2Loader)
      .setMeshoptDecoder(MeshoptDecoder);

    loader.load(
      Persian,
      gltf => {
        model = gltf.scene;
        model.visible = false;

        // add shadow to base
        const sphereRadius = 0.5;
        const planeSize = 1.5;
        const shadowGeo = new THREE.PlaneBufferGeometry(planeSize, planeSize);
        const shadowMat = new THREE.MeshBasicMaterial({
          map: shadowTexture,
          transparent: true, // so we can see the ground
          depthWrite: false, // so we don't have to sort
        });
        shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
        shadowMesh.position.y = -1; // so we're above the ground slightly
        shadowMesh.rotation.x = Math.PI * -0.5;
        const shadowSize = sphereRadius * 3;
        shadowMesh.scale.set(shadowSize, shadowSize, shadowSize);
        shadowMesh.visible = false;
        scene.add(shadowMesh);
      },
      () => {},
      error => console.error(error),
    );

    // Add abbient light
    let am_light = new THREE.AmbientLight(light_am_color);
    // soft white light
    scene.add(am_light);
    // Add directional light
    spot_light = new THREE.SpotLight(light_spot_color, light_spot_intensity);
    spot_light.position.set(
      sphere_position.x,
      sphere_position.y + 4,
      sphere_position.z,
    );
    spot_light.target = scene;
    spot_light.castShadow = true;
    spot_light.receiveShadow = true;
    spot_light.shadow.camera.near = light_spot_camera_near;
    scene.add(spot_light);

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
      model.visible = true;
      shadowMesh.visible = true;
      shadowMesh.position.set(pos.x, pos.y, pos.z);
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
    }
  }

  function toggleAnimation() {
  }

  // Utility function to update animated objects
  function updateAnimation() {
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
        <title>Effile Tower</title>
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
    </article>
  );
}

export default compose(
  memo,
)(HomePage);
