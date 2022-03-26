/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 */

import React, { useEffect, memo } from 'react';

// import styled from 'styled-components/macro';
// import { Logos } from './Logos';
// import { Title } from './components/Title';
//import { Lead } from './components/Lead';

// import { WebXRButton } from './js/util/webxr-button.js';
// import { Scene } from './js/render/scenes/scene.js';
// import { Renderer, createWebGLContext } from './js/render/core/renderer.js';
// import { Node } from './js/render/core/node.js';
// import { Gltf2Node } from './js/render/nodes/gltf2.js';
// import { DropShadowNode } from './js/render/nodes/drop-shadow.js';
// import { vec3 } from './js/render/math/gl-matrix.js';
//import DRACOLoader from './DRACOloader';
// const aud = require('./guitar.ogg');
const Persian = require('./Persian.glb');
// const rectile_gltf = require('./reticle.glb');

import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createStructuredSelector } from 'reselect';

// const THREE = require("https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js");
//  const GLTF = require("https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/GLTFLoader.js");
//  const { GLTFLoader } = GLTF;

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { useInjectReducer } from 'utils/injectReducer';
import { useInjectSaga } from 'utils/injectSaga';
import {
  makeSelectRepos,
  makeSelectLoading,
  makeSelectError,
} from 'containers/App/selectors';
import H2 from 'components/H2';
import ReposList from 'components/ReposList';
import AtPrefix from './AtPrefix';
import CenteredSection from './CenteredSection';
import Form from './Form';
import Input from './Input';
import Section from './Section';
import messages from './messages';
import { loadRepos } from '../App/actions';
import { changeUsername } from './actions';
import { makeSelectUsername } from './selectors';
import reducer from './reducer';
import saga from './saga';

const key = 'home';

export function HomePage({
  username,
  loading,
  error,
  repos,
  onSubmitForm,
  onChangeUsername,
}) {
  let renderer = null;
  let scene = null;
  let camera = null;
  let light = null;
  let model = null;
  let mixer = null;
  let action = null;
  let reticle = null;
  let lastFrame = Date.now();

  const [isWebXRLoading, setIsWebXRLoading] = React.useState(false);
  const [isTapToPlace, setIsTapToPlace] = React.useState(false);

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
    console.log(loader);
    loader.load(
      Persian,
      gltf => {
        console.log(gltf, 'tttestttiinf');
        model = gltf.scene;
        model.scale.set(1.8, 1.8, 1.8);
        model.castShadow = true;
        model.receiveShadow = true;
        mixer = new THREE.AnimationMixer(model);

        console.log(gltf, 'animationn');

        action = mixer.clipAction(gltf.animations[0]);
        console.log(action, 'action', model);
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

    light = new THREE.PointLight(0xffffff, 1, 100); // soft white light
    light.position.set(camera.position.x, camera.position.y, camera.position.z);
    // light.position.z = 1;
    // light.position.y = -1;
    scene.add(light);

    var directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 1, 0);
    scene.add(directionalLight);

    var directionalLight2 = new THREE.DirectionalLight(0xffffff, 1.4);
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
    console.log(reticle, 'reticle');
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

    // navigator.permissions.query({name: 'camera'})
    // .then((permissionObj) => {
    //  console.log(permissionObj.state, 'permissionObj.state');
    //  onButtonClicked();
    // })
    // .catch((error) => {
    //  console.log('Got error :', error);
    // })

    // navigator.mediaDevices.getUserMedia({audio: false, video: true}).then( data => {
    //   console.log(data, 'data');
    //   onButtonClicked()
    // }).catch(console.log)

    //onButtonClicked();
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
      document.getElementById('warning').innerText =
        'WebXR unavailable. Please use secure context';
    }
    if (navigator.xr) {
      navigator.xr.addEventListener('devicechange', checkSupportedState);
      checkSupportedState();
    } else {
      document.getElementById('warning').innerText =
        'WebXR unavailable for this browser';
    }
  }

  function checkSupportedState() {
    navigator.xr.isSessionSupported('immersive-ar').then(supported => {
      if (supported) {
        xrButton.innerHTML = 'Enter AR';
        xrButton.addEventListener('click', onButtonClicked);
      } else {
        xrButton.innerHTML = 'AR not found';
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
    setIsTapToPlace(true);
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
    setIsTapToPlace(false);
    xrSession = null;
    xrButton.innerHTML = 'Enter AR';
    info.innerHTML = '';
    document.getElementById('audio').stop();
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
      //model.scale.set(2,2,2);
      console.log(model, ' -mmodeelllllll');
      scene.add(model);

      // start object animation right away
      toggleAnimation();
      // instead of placing an object we will just toggle animation state
      document
        .getElementById('overlay')
        .removeEventListener('click', placeObject);
      document
        .getElementById('overlay')
        .addEventListener('click', toggleAnimation);

        setInterval(() => {
          document
        .getElementById('audio').play();
        },500)
        
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
    //setIsWebXRLoading(true)
    let session = frame.session;
    session.requestAnimationFrame(onXRFrame);
    light.position.set(camera.position.x, camera.position.y, camera.position.z);
    //console.log(camera.position,' -camera.position');
    console.log(isWebXRLoading, ' -isWebXRLoading');
    //console.log(t, session, 'froommeeeee', reticle.visible);
    if (xrHitTestSource) {
      // obtain hit test results by casting a ray from the center of device screen
      // into AR view. Results indicate that ray intersected with one or more detected surfaces
      const hitTestResults = frame.getHitTestResults(xrHitTestSource);
      if (hitTestResults.length) {
        //console.log(hitTestResults, ' -hitTestResults');
        // obtain a local pose at the intersection point
        const pose = hitTestResults[0].getPose(xrRefSpace);
        // place a reticle at the intersection point
        reticle.matrix.fromArray(pose.transform.matrix);
        reticle.visible = true;
        setIsWebXRLoading(false)
        console.log(isWebXRLoading, ' -isWebXRLoading');

      }
      else{
        setIsWebXRLoading(true)
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

  useEffect(() => {
    // When initial state username is not null, submit the form to load repos
    if (username && username.trim().length > 0) onSubmitForm();
  }, []);

  const reposListProps = {
    loading,
    error,
    repos,
  };

  return (
    <article>
      <Helmet>
        <title>Persian Cat AR</title>
        <meta
          name="description"
          content="Verse Labs Project Persian Cat AR"
        />
      </Helmet>
      <div>
        <div id="overlay">
          <div className="info-area">
            <div id="info" />
            {/* {(isLoading && isImmersiveSession) && <p>Loading...</p>} */}
            <button id="xr-button" disabled>
              XR is not supported in your browser
            </button>
            {isWebXRLoading && <p>Loading...</p>}
            {(!isWebXRLoading && isTapToPlace) && <p>Place cursor and tap</p>}
            <audio id="audio" src={require('./meow.wav')} />
          </div>
        </div>

        {/* <CenteredSection>
          <H2>
            <FormattedMessage {...messages.startProjectHeader} />
          </H2>
          <p>
            <FormattedMessage {...messages.startProjectMessage} />
          </p>
        </CenteredSection> */}
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
