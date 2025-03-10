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
import texta from 'assets/texta.png';
import textb from 'assets/textb.png';
import textc from 'assets/textc.png';
import textd from 'assets/textd.png';
import texte from 'assets/texte.png';
import textf from 'assets/textf.png';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { compose } from 'redux';
import axios from 'axios';
import { createStructuredSelector } from 'reselect';

import StartExperience from 'components/StartExperience';
import { SliderComp } from './componentUtils';
import { handelOverlayClick, loadAllModel } from './utils';

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import {TextGeometry} from 'three/examples/jsm/geometries/TextGeometry.js';
//import {CubeGeometry} from 'three/examples/jsm/geometries/CubeGeometry.js';



import { makeSelectLoading } from 'containers/App/selectors';
import { loadRepos } from '../App/actions';

import './index.css';

export function HomePage({ location }) {
  let renderer = null;
  let scene = null;
  let mesh = null;
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
  let cube = null;

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
  const [lang, setLang] = React.useState('hi');
  const [currentText, setCurrentText] = React.useState('Trasnlation goes ...');



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


//     const loaderFont = new FontLoader();

// loaderFont.load( 'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function ( font ) {

// 	const geometry = new TextGeometry( 'Hello three.js!', {
// 		font: font,
// 		size: 80,
// 		height: 5,
// 		curveSegments: 12,
// 		bevelEnabled: true,
// 		bevelThickness: 10,
// 		bevelSize: 8,
// 		bevelOffset: 0,
// 		bevelSegments: 5
// 	} );
// } );

const texLoader = new THREE.TextureLoader();

const texURL1 = texta;
const texURL2 = textb;
const texURL3 = textc;
const texURL4 = textd;
const texURL5 = texte;
const texURL6 = textf;

const mat1 = new THREE.MeshBasicMaterial({color: 0xffffff, map: texLoader.load(texURL1)});
const mat2 = new THREE.MeshBasicMaterial({color: 0xffffff, map: texLoader.load(texURL2)});
const mat3 = new THREE.MeshBasicMaterial({color: 0xffffff, map: texLoader.load(texURL3)});
const mat4 = new THREE.MeshBasicMaterial({color: 0xffffff, map: texLoader.load(texURL4)});
const mat5 = new THREE.MeshBasicMaterial({color: 0xffffff, map: texLoader.load(texURL5)});
const mat6 = new THREE.MeshBasicMaterial({color: 0xffffff, map: texLoader.load(texURL6)});

var material = [
    mat1,
    mat2,
    mat3,
    mat4,
    mat5,
    mat6,
];

cube = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), material);
cube.position.set( -0.5, 0.9, -1.8 );

  scene.add(cube);

var loaderFont = new FontLoader();
loaderFont.load( 'https://threejs.org/examples/fonts/gentilis_regular.typeface.json', function ( font ) {

  var textGeometry = new TextGeometry( currentText, {

    font: font,

    size: 0.1,
    height: 0.05,
    // curveSegments: 0.05,

    // bevelThickness: 0.05,
    // bevelSize: 0.05,
    // bevelEnabled: true

  });

  var textMaterial = new THREE.MeshPhongMaterial( 
    { color: 0xff0000, specular: 0xffffff }
  );

  mesh = new THREE.Mesh( textGeometry, textMaterial );
  mesh.position.set( -0.7, -0.7, -2.4 );
  

  scene.add( mesh );

  // let sprite = new THREE.TextSprite({
  //   text: 'Hello World!',
  //   fontFamily: 'Arial, Helvetica, sans-serif',
  //   fontSize: 12,
  //   color: '#ffbbff',
  // });
  // sprite.position.set(0, 0, -3.5);
  //scene.add(sprite);

}); 

    // load our gltf model
    var loader = new GLTFLoader();
    loader.load(
      Chevy_truck,
      gltf => {
        model = gltf.scene;
        //model.scale.set(1.8, 1.8, 1.8);
        model.castShadow = true;
        model.receiveShadow = true;
        // currentModel = model;
        mixer = new THREE.AnimationMixer(model);
      },
      () => {},
      error => console.error(error),
    );

    loadAllModel(carsConstant, wheel, truck, mercedes, jaguar).then(res => {
      mercedes = res.mercedes;
      truck = res.truck;
      wheel = res.wheel;
      jaguar = res.jaguar;
      setModelAdded([{ name: 'hindi', data: 'hi' },{ name: 'japanese', data: 'ja' }, { name: 'french', data: 'fr' }, { name: 'arabic', data: 'ar' }, { name: 'chinese', data: 'zh' }]);
    });

    light = new THREE.PointLight(0xffffff, 0.8, 100); // soft white light
    light.position.set(camera.position.x, camera.position.y, camera.position.z);
    // light.position.z = 1;
    // light.position.y = -1;
    //scene.add(light);

    var directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 1, 0);
    scene.add(directionalLight);

    // var directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
    // directionalLight2.position.set(1, 0, 0);
    // scene.add(directionalLight2);

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
    testSpeech();
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
    // info.innerHTML = '';
    // document.getElementById('audio').pause();
    gl = null;
    if (xrHitTestSource) xrHitTestSource.cancel();
    xrHitTestSource = null;

    // set all state to default
    setIsXRSupportedText('');
    setIsWebXRStarted(false);
    setIsSurfaceTracked(false);
    setIsObjPlaced(false);
    window.localStorage.setItem('lang', '-');
  }

  const test = () => {
    console.log('test', currentText);
  }


  function placeObject() {
    document
      .getElementsByClassName('dropdown-content')[0]
      .classList.toggle('show');
    console.log('placeObject');
    if (reticle.visible && model) {
      reticle.visible = false;
      xrHitTestSource.cancel();
      xrHitTestSource = null;
      // we'll be placing our object right where the reticle was
      const cameraPostion = new THREE.Vector3();
      // var cameraDirection = new THREE.Vector3();
      // camera.getWorldPosition(cameraPostion);
      const pos = reticle.getWorldPosition(cameraPostion);
      scene.remove(reticle);
      model.position.set(pos.x, pos.y, pos.z);
      mesh.position.set(pos.x, pos.y, pos.z);
      scene.add(mesh);
      // model.scale.set(2,2,2);
      //scene.add(model);
      setIsObjPlaced(true);

      // start object animation right away
      // instead of placing an object we will just toggle animation state
      const overlayDom = document.getElementById('overlay');
      overlayDom.removeEventListener('click', placeObject);
      //overlayDom.addEventListener('click', handelOverlayClick);
      // overlayDom.addEventListener('touchmove', handelOverlayClick);
      // overlayDom.myParams = {
      //   scene,
      //   model,
      //   wheel,
      //   truck,
      //   mercedes,
      //   jaguar,
      // };
      overlayDom.addEventListener('click', handelOverlayClickLang);
      // setInterval(() => {
      //   //console.log('interval', currentText, scene);
      //   test();
      // }, 1000 / 60);
    }
      const overlayDom = document.getElementById('overlay');
      overlayDom.removeEventListener('click', placeObject);
      overlayDom.addEventListener('click', handelOverlayClickLang);
      
  }

  const hasParentWithMatchingSelector = (target, selector) => {
    return [...document.querySelectorAll(selector)].some(el =>
      el.contains(target),
    );
  };

  function handelOverlayClickLang(event) {
    document
      .getElementsByClassName('dropdown-content')[0]
      .classList.toggle('show');
    console.log('handelOverlayClickLang', event);
    if (event)
    if (hasParentWithMatchingSelector(event.target, '.dropdown')) {
      console.log(hasParentWithMatchingSelector(event.target, '.hindi'));
      if (hasParentWithMatchingSelector(event.target, '.hindi')) {
        setLang('hi');
        console.log('hindii--------------');
        window.localStorage.setItem('lang', 'hi');
      }
      if (hasParentWithMatchingSelector(event.target, '.french')) {
        console.log('french--------------');
        window.localStorage.setItem('lang', 'fr');
        setLang('fr');
      }
      if (hasParentWithMatchingSelector(event.target, '.japanese')) {
        setLang('ja');
        console.log('hindii--------------');
        window.localStorage.setItem('lang', 'ja');
      }
      if (hasParentWithMatchingSelector(event.target, '.arabic')) {
        setLang('ar');
        console.log('hindii--------------');
        window.localStorage.setItem('lang', 'ar');
      }
      if (hasParentWithMatchingSelector(event.target, '.chinese')) {
        setLang('zh');
        console.log('hindii--------------');
        window.localStorage.setItem('lang', 'zh');
      }
    }
  }

  // const openDropdown = () =>
  //   document
  //     .getElementsByClassName('dropdown-content')[0]
  //     .classList.toggle('show');

  // Utility function to update animated objects
  function updateAnimation() {
    const dt = (Date.now() - lastFrame) / 1000;
    lastFrame = Date.now();
    if (mixer) {
      mixer.update(dt);
    }
  }

  function onXRFrame(t, frame) {
    var SPEED = 0.01;


    cube.rotation.x -= SPEED * 2;
    cube.rotation.y -= SPEED;
    cube.rotation.z -= SPEED * 3;


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
        //reticle.visible = true;
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

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const SpeechGrammarList =
    window.SpeechGrammarList || window.webkitSpeechGrammarList;
  // const SpeechRecognitionEvent =
  //   window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;

  // var phrases = [
  //   "I love to sing because it's fun",
  //   'where are you going',
  //   'can I call you tomorrow',
  //   'why did you talk while I was talking',
  //   'she enjoys reading books and playing games',
  //   'where are you going',
  //   'have a great day',
  //   'she sells seashells on the seashore',
  // ];

  // var phrasePara = document.querySelector('.phrase');
  // var resultPara = document.querySelector('.result');
  // var diagnosticPara = document.querySelector('.output');

  // var testBtn = document.querySelector('button');

  // function randomPhrase() {
  //   var number = Math.floor(Math.random() * phrases.length);
  //   return number;
  // }

  const onSpeechResult = async event => {
    // The SpeechRecognitionEvent results property returns a SpeechRecognitionResultList object
    // The SpeechRecognitionResultList object contains SpeechRecognitionResult objects.
    // It has a getter so it can be accessed like an array
    // The first [0] returns the SpeechRecognitionResult at position 0.
    // Each SpeechRecognitionResult object contains SpeechRecognitionAlternative objects that contain individual results.
    // These also have getters so they can be accessed like arrays.
    // The second [0] returns the SpeechRecognitionAlternative at position 0.
    // We then return the transcript property of the SpeechRecognitionAlternative object
    const speechResult = event.results[0][0].transcript.toLowerCase();
    setCurrentText(speechResult);
    console.log('speechResult', speechResult);


    const re = await axios.post('https://arsubs.herokuapp.com/', {
    text: speechResult,
  });
  console.log(re);
  // .then(res => {
  //   console.log(res);
  // }).catch(err => {})


    var loaderFont = new FontLoader();
loaderFont.load( 'https://threejs.org/examples/fonts/gentilis_regular.typeface.json', function ( font ) {

  var textGeometry = new TextGeometry( re.data, {

    font: font,

    size: 0.06,
    height: 0.02,
    // curveSegments: 0.05,

    // bevelThickness: 0.05,
    // bevelSize: 0.05,
    // bevelEnabled: true

  });

  var textMaterial = new THREE.MeshPhongMaterial( 
    { color: 0xff0000, specular: 0xffffff }
  );

  let meshr = new THREE.Mesh( textGeometry, textMaterial );
  meshr.position.set( -0.7, -0.7, -2.4 );
  console.log(scene);

  scene.remove( mesh );
  scene.remove( meshr );
  scene.remove(scene.children[scene.children.length - 1]);
  //scene.remove.apply(scene, scene.children);
  scene.add( meshr );
});
    //console.log(speechResult, scene, model);
    // diagnosticPara.textContent = 'Speech received: ' + speechResult + '.';
    // if (speechResult === phrase) {
    //   resultPara.textContent = 'I heard the correct phrase!';
    //   resultPara.style.background = 'lime';
    // } else {
    //   resultPara.textContent = "That didn't sound right.";
    //   resultPara.style.background = 'red';
    // }

    // console.log('Confidence: ' + event.results[0][0].confidence);
  };

  function testSpeech() {
    console.log('test calleddddddd');
    // testBtn.disabled = true;
    // testBtn.textContent = 'Test in progress';

    // var phrase = phrases[randomPhrase()];
    // To ensure case consistency while checking with the returned output text
    // phrase = phrase.toLowerCase();
    // phrasePara.textContent = phrase;
    // resultPara.textContent = 'Right or wrong?';
    // resultPara.style.background = 'rgba(0,0,0,0.2)';
    // diagnosticPara.textContent = '...diagnostic messages';

    const grammar =
      '#JSGF V1.0; grammar phrase; public <phrase> = where are you going;';
    const recognition = new SpeechRecognition();
    const speechRecognitionList = new SpeechGrammarList();
    speechRecognitionList.addFromString(grammar, 1);
    recognition.grammars = speechRecognitionList;
    recognition.lang = lang;
    //recognition.continuous = true;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    //setInterval(() => {
      //console.log('test calleddddddd', recognition);
      recognition.start();
      recognition.onresult = onSpeechResult;
    //}, 1000);

    // recognition.onresult = onSpeechResult;

    // recognition.onspeechend = function() {
    //   recognition.stop();
    //   testBtn.disabled = false;
    //   testBtn.textContent = 'Start new test';
    // };

    // recognition.onerror = function(event) {
    //   testBtn.disabled = false;
    //   testBtn.textContent = 'Start new test';
    //   diagnosticPara.textContent =
    //     'Error occurred in recognition: ' + event.error;
    // };

    // recognition.onaudiostart = function(event) {
    //   //Fired when the user agent has started to capture audio.
    //   console.log('SpeechRecognition.onaudiostart');
    // };

    // recognition.onaudioend = function(event) {
    //   //Fired when the user agent has finished capturing audio.
    //   console.log('SpeechRecognition.onaudioend');
    // };

    //window.localStorage.seItem('langff', 'fr')

    recognition.onend = function(event) {
      //Fired when the speech recognition service has disconnected.
      //console.log(window.localStorage)
     // window.localStorage.seItem('lang', 'fr')
      console.log(window.localStorage.getItem('lang'), 'looooocc');
      if(window.localStorage.getItem('lang') === '-'){
        recognition.lang = 'hi';
        window.localStorage.setItem('lang', 'hi')
        console.log('inside nulll')
      }
      else{
        recognition.lang = window.localStorage.getItem('lang');
      }
      //recognition.lang = window.localStorage.getItem('lang')||'hi';
      console.log('SpeechRecognition.onend', lang);
      recognition.start();
      //console.log('SpeechRecognition.onend');
    };

    // recognition.onnomatch = function(event) {
    //   //Fired when the speech recognition service returns a final result with no significant recognition. This may involve some degree of recognition, which doesn't meet or exceed the confidence threshold.
    //   console.log('SpeechRecognition.onnomatch');
    // };

    // recognition.onsoundstart = function(event) {
    //   //Fired when any sound — recognisable speech or not — has been detected.
    //   console.log('SpeechRecognition.onsoundstart');
    // };

    // recognition.onsoundend = function(event) {
    //   //Fired when any sound — recognisable speech or not — has stopped being detected.
    //   console.log('SpeechRecognition.onsoundend');
    // };

    // recognition.onspeechstart = function(event) {
    //   //Fired when sound that is recognised by the speech recognition service as speech has been detected.
    //   console.log('SpeechRecognition.onspeechstart');
    // };
    // recognition.onstart = function(event) {
    //   //Fired when the speech recognition service has begun listening to incoming audio with intent to recognize grammars associated with the current SpeechRecognition.
    //   console.log('SpeechRecognition.onstart');
    // };
  }

  // testBtn.addEventListener('click', testSpeech);

  function ARHtmlContent() {
    return isWebXRStarted ? (
      <div className="ARContent">
        {true && (
          <div className="dropdown">
            <div id="myDropdown" className="dropdown-content">
              {modelAdded.map(element => {
                return (
                  <div key={element.name} className={element.name}>
                    <button style={ { width: "100%"} } >{element.name}</button>
                  </div>
                );
              })}
            </div>
            <button className="dropbtn" >
             Speaker Lang
            </button>
          </div>
        )}
        <SliderComp isObjPlaced={isObjPlaced} admin={admin} />
      </div>
    ) : (
      ''
    );
  }

  return (
    <article>
      <Helmet>
        <title>AR translated Subs</title>
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
};

const mapStateToProps = createStructuredSelector({
  loading: makeSelectLoading(),
});

export function mapDispatchToProps(dispatch) {
  return {
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
