import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

function handelOverlayClick(event) {
  const {
    scene,
    model,
    wheel,
    truck,
    mercedes,
    jaguar,
  } = event.currentTarget.myParams;
  let currentCar = scene.children[scene.children.length - 1];
  if (event)
    if (hasParentWithMatchingSelector(event.target, '.dropdown')) {
      console.log(hasParentWithMatchingSelector(event.target, '.Wheel'));
      if (hasParentWithMatchingSelector(event.target, '.Wheel')) {
        scene.remove(currentCar);
        scene.add(wheel);
      }
      if (hasParentWithMatchingSelector(event.target, '.Truck')) {
        scene.remove(currentCar);
        scene.add(truck);
      }
      if (hasParentWithMatchingSelector(event.target, '.Mercedes')) {
        scene.remove(currentCar);
        scene.add(mercedes);
      }
      if (hasParentWithMatchingSelector(event.target, '.Jaguar')) {
        scene.remove(currentCar);
        scene.add(jaguar);
      }
      if (hasParentWithMatchingSelector(event.target, '.Chevy_truck')) {
        scene.remove(currentCar);
        scene.add(model);
      }
    } else if (hasParentWithMatchingSelector(event.target, '#test-slider')) {
      const slide = document.getElementById('test-slider').lastChild.firstChild
        .value;
      currentCar.scale.set(slide, slide, slide);
    } else if (hasParentWithMatchingSelector(event.target, '#test-slider-x')) {
      const positionX = document.getElementById('test-slider-x').lastChild
        .firstChild.value;
      currentCar.position.set(positionX, model.position.y, model.position.z);
    } else if (hasParentWithMatchingSelector(event.target, '#test-slider-y')) {
      const positionY = document.getElementById('test-slider-y').lastChild
        .firstChild.value;
      currentCar.position.set(model.position.x, positionY, model.position.z);
    } else if (hasParentWithMatchingSelector(event.target, '#test-slider-z')) {
      const positionZ = document.getElementById('test-slider-z').lastChild
        .firstChild.value;
      currentCar.position.set(model.position.x, model.position.y, positionZ);
    }
}

const loadAllModel = (
  carsConstant,
  wheel,
  truck,
  mercedes,
  jaguar,
) => {
  return new Promise(async (resolve, reject) => {
    carsConstant.forEach(async car => {
      var loader = new GLTFLoader();
      loader.load(
        car.path,
        gltf => {
          if (car.name === 'Mercedes') {
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
            wheel.castShadow = true;
            wheel.receiveShadow = true;
          }
          if (wheel && truck && mercedes && jaguar) {
            resolve({ mercedes, truck, wheel, jaguar });
          }
        },
        () => {},
        error => console.error(error),
      );
    });
  });
};

const hasParentWithMatchingSelector = (target, selector) => {
  return [...document.querySelectorAll(selector)].some(el =>
    el.contains(target),
  );
};

export { handelOverlayClick, loadAllModel };
