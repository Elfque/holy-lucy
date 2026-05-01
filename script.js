import * as three from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader.js";

let renderer, scene, camera;

let spotLight;
let control;

init();
function init() {
  renderer = new three.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(tick);
  document.body.appendChild(renderer.domElement);

  renderer.toneMapping = three.NeutralToneMapping;
  renderer.toneMappingExposure = 1;

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = three.PCFShadowMap;

  scene = new three.Scene();
  camera = new three.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    0.1,
    100,
  );
  camera.position.set(7, 4, 1);

  control = new OrbitControls(camera, renderer.domElement);
  control.minDistance = 2;
  control.maxDistance = 10;
  control.maxPolarAngle = Math.PI / 2;
  control.target.set(0, 1, 0);

  const loader = new three.TextureLoader().setPath("textures/");
  const fileNames = ["1.jpg", "2.jpg", "3.png"];
  const textures = {};
  fileNames.forEach((fileName) => {
    const texture = loader.load(fileName);
    texture.minFilter = three.LinearFilter;
    texture.magFilter = three.LinearFilter;
    texture.generateMipmaps = false;
    texture.colorSpace = three.SRGBColorSpace;
    textures[fileName] = texture;
  });

  //   LIGHTS
  const hemisphere = new three.HemisphereLight("#FFFFFF", "#8D8D8D", 0.25);
  scene.add(hemisphere);

  spotLight = new three.SpotLight("#FFFFFF", 100);
  spotLight.name = "spotLight";
  spotLight.map = textures["1.jpg"];
  spotLight.position.set(5, 2.5, 5);
  spotLight.angle = Math.PI / 6;
  spotLight.penumbra = 1;
  spotLight.decay = 2;
  spotLight.distance = 0;

  spotLight.castShadow = true;
  spotLight.shadow.mapSize.width = 1024;
  spotLight.shadow.mapSize.height = 1024;
  spotLight.shadow.camera.near = 2;
  spotLight.shadow.camera.far = 10;
  spotLight.shadow.focus = 1;
  spotLight.shadow.bias = -0.003;
  spotLight.shadow.intensity = 1;
  scene.add(spotLight);

  spotLight.lightHelper = new three.SpotLightHelper(spotLight);
  spotLight.lightHelper.visible = false;
  scene.add(spotLight.lightHelper);

  spotLight.shadowCameraHelper = new three.CameraHelper(
    spotLight.shadow.camera,
  );
  spotLight.shadowCameraHelper.visible = false;
  scene.add(spotLight.shadowCameraHelper);

  const geometry = new three.PlaneGeometry(10, 10);
  const material = new three.MeshLambertMaterial({ color: "#BCBCBC" });
  const mesh = new three.Mesh(geometry, material);
  scene.add(mesh);
  mesh.position.set(0, -1, 0);
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;

  new PLYLoader().load("model/Lucy100k.ply", (geometry) => {
    geometry.scale(0.0024, 0.0024, 0.0024);
    geometry.computeVertexNormals();

    const material = new three.MeshLambertMaterial({});
    const mesh = new three.Mesh(geometry, material);
    mesh.rotation.y = -Math.PI / 2;
    mesh.position.y = 0.8;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
  });

  window.addEventListener("resize", onWindowResize);

  //   GUI
  const gui = new GUI();

  const params = {
    map: textures["1.jpg"],
    color: spotLight.color.getHex(),
    intensity: spotLight.intensity,
    distance: spotLight.distance,
    angle: spotLight.angle,
    penumbra: spotLight.penumbra,
    decay: spotLight.decay,
    focus: spotLight.shadow.focus,
    shadowIntensity: spotLight.shadow.intensity,
    helpers: false,
  };

  gui.add(params, "map", textures).onChange((v) => {
    spotLight.map = v;
  });

  gui.addColor(params, "color").onChange((v) => {
    spotLight.color.setHex(v);
  });

  gui.add(params, "intensity", 50, 250).onChange((v) => {
    spotLight.intensity = v;
  });

  gui.add(params, "distance", 0, 20).onChange((v) => {
    spotLight.distance = v;
  });

  gui.add(params, "angle", 0, Math.PI / 3).onChange((v) => {
    spotLight.angle = v;
  });

  gui.add(params, "penumbra", 0, 1).onChange((v) => {
    spotLight.penumbra = v;
  });

  gui.add(params, "decay", 1, 2).onChange((v) => {
    spotLight.decay = v;
  });

  gui.add(params, "focus", 0, 1).onChange((v) => {
    spotLight.shadow.focus = v;
  });

  gui.add(params, "shadowIntensity", 0, 1).onChange((v) => {
    spotLight.shadow.shadowIntensity = v;
  });

  gui.add(params, "helpers").onChange((v) => {
    spotLight.lightHelper.visible = v;
    spotLight.shadowCameraHelper.visible = v;
  });

  gui.close();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function tick() {
  const time = performance.now() / 3000;

  spotLight.position.x = Math.cos(time) * 2.5;
  spotLight.position.z = Math.sin(time) * 2.5;

  spotLight.lightHelper.update();

  control.update();
  renderer.render(scene, camera);
}
