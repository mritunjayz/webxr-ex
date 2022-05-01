/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 */

import React, { useEffect, memo } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createStructuredSelector } from 'reselect';
import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';

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
import { loadRepos } from '../App/actions';
import { changeUsername } from './actions';
import { makeSelectUsername } from './selectors';
import reducer from './reducer';
import saga from './saga';

import './index.css';
const Persian = require('./school.glb');

const key = 'home';

export function HomePage({ location }) {
  let renderer = null;
  let scene = null;
  let camera = null;
  let light = null;
  let model = null;
  let hitTestPosition = null;
  let mixer = null;
  const action = null;
  let reticle = null;
  let lastFrame = Date.now();

  const [isXRSupportedText, setIsXRSupportedText] = React.useState('');
  const [isWebXRStarted, setIsWebXRStarted] = React.useState(false);
  const [isSurfaceTracked, setIsSurfaceTracked] = React.useState(false);
  const [isObjPlaced, setIsObjPlaced] = React.useState(false);

  const search = location.search;
  const admin = new URLSearchParams(search).get('dev-space');

  const initScene = (gl, session) => {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );

    // load our gltf model
    const loader = new GLTFLoader();
    loader.load(
      Persian,
      gltf => {
        model = gltf.scene;
        model.scale.set(1.4, 1.4, 1.4);
        model.castShadow = true;
        model.receiveShadow = true;
        mixer = new THREE.AnimationMixer(model);
      },
      () => {},
      error => console.error(error),
    );

    light = new THREE.PointLight(0xffffff, 4, 100); // soft white light
    light.position.set(camera.position.x, camera.position.y, camera.position.z);
    // light.position.z = 1;
    // light.position.y = -1;
    scene.add(light);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 6);
    directionalLight.position.set(0, 1, 0);
    scene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 6);
    directionalLight2.position.set(1, 0, 0);
    scene.add(directionalLight2);

    const directionalLight3 = new THREE.DirectionalLight(0xffffff, 6);
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
    const canvas = document.createElement('canvas');
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
      const cameraPostion = new THREE.Vector3();
      // var cameraDirection = new THREE.Vector3();
      // camera.getWorldPosition(cameraPostion);
      const pos = reticle.getWorldPosition(cameraPostion);
      hitTestPosition = pos;
      scene.remove(reticle);
      model.position.set(pos.x, pos.y - 4, pos.z);
      // model.scale.set(2,2,2);
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
      document
        .getElementById('overlay')
        .addEventListener('touchmove', toggleAnimation);
    }
  }

  const hasParentWithMatchingSelector = (target, selector) =>
    [...document.querySelectorAll(selector)].some(el => el.contains(target));

  function toggleAnimation(event) {
    if (event)
      if (hasParentWithMatchingSelector(event.target, '#test-slider')) {
        const slide = document.getElementById('test-slider').lastChild
          .firstChild.value;
        model.scale.set(slide, slide, slide);
      } else if (
        hasParentWithMatchingSelector(event.target, '#test-slider-x')
      ) {
        const positionX = document.getElementById('test-slider-x').lastChild
          .firstChild.value;
        model.position.set(positionX, model.position.y, model.position.z);
      } else if (
        hasParentWithMatchingSelector(event.target, '#test-slider-y')
      ) {
        const positionY = document.getElementById('test-slider-y').lastChild
          .firstChild.value;
        model.position.set(model.position.x, positionY, model.position.z);
      } else if (
        hasParentWithMatchingSelector(event.target, '#test-slider-z')
      ) {
        const positionZ = document.getElementById('test-slider-z').lastChild
          .firstChild.value;
        model.position.set(model.position.x, model.position.y, positionZ);
      }
  }

  // Utility function to update animated objects
  function updateAnimation() {
    const dt = (Date.now() - lastFrame) / 1000;
    lastFrame = Date.now();
    if (mixer) {
      mixer.update(dt);
    }
  }

  function onXRFrame(t, frame) {
    const { session } = frame;
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

  useInjectReducer({ key, reducer });
  useInjectSaga({ key, saga });

  function ARHtmlContent() {
    return isWebXRStarted ? (
      <div className="ARContent">
        {isObjPlaced && (
          <Stack sx={{ height: 200 }} spacing={1} direction="row">
            <Slider
              size="small"
              defaultValue={1}
              aria-label="Small"
              valueLabelDisplay="auto"
              id="test-slider"
              orientation="vertical"
              step={0.2}
              min={0}
              max={6}
              track={false}
            />
            {admin && (
              <span id="test-slider-xr">
                <Slider
                  size="small"
                  defaultValue={0}
                  aria-label="Small"
                  valueLabelDisplay="auto"
                  id="test-slider-x"
                  orientation="vertical"
                  step={1}
                  min={-120}
                  max={120}
                  track={false}
                />
                <Slider
                  size="small"
                  defaultValue={0}
                  aria-label="Small"
                  valueLabelDisplay="auto"
                  id="test-slider-y"
                  orientation="vertical"
                  step={1}
                  min={-120}
                  max={120}
                  track={false}
                />
                <Slider
                  size="small"
                  defaultValue={0}
                  aria-label="Small"
                  valueLabelDisplay="auto"
                  id="test-slider-z"
                  orientation="vertical"
                  step={1}
                  min={-120}
                  max={120}
                  track={false}
                />
              </span>
            )}
          </Stack>
        )}
      </div>
    ) : (
      ''
    );
  }

  return (
    <article>
      <Helmet>
        <title>AAP School Model</title>
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
