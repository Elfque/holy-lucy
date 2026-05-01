import * as three from "three";
import { OrbitControls, PLYLoader } from "three/examples/jsm/Addons.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

// SIZES
const sizes = { width: window.innerWidth, height: window.innerHeight };

// CANVAS
const canvas = document.querySelector(".renderer");

// SCENE
const scene = new three.Scene();

// GUI
const gui = new GUI();

// CAMERA
const camera = new three.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.001,
  1000,
);
camera.position.set(0, 0, 5);
scene.add(camera);

// CONTROLS
const control = new OrbitControls(camera, canvas);
control.enableDamping = true;

// LOADER
const plyLoader = new PLYLoader();
plyLoader.load("model/Lucy100k.ply", (geometry) => {
  geometry.scale(0.0024, 0.0024, 0.0024);
  geometry.computeVertexNormals();
  const material = new three.MeshLambertMaterial({ color: "#b2b2b2" });
  const mesh = new three.Mesh(geometry, material);
  mesh.rotation.y = -Math.PI;
  mesh.position.y = 0.8;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
});

const textureLoader = new three.TextureLoader().setPath("textures/");
const texturePaths = ["1.jpg", "2.jpg", "3.png"];
const textures = { none: null };
for (let i = 0; i < texturePaths.length; i++) {
  const filename = texturePaths[i];
  const texture = textureLoader.load(filename);
  texture.minFilter = three.LinearFilter;
  texture.magFilter = three.LinearFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = three.SRGBColorSpace;
  textures[filename] = texture;
}

// LIGHTS
const ambientLight = new three.HemisphereLight(0xffffff, 0x8d8d8d, 0.25);
scene.add(ambientLight);

const spotLight = new three.SpotLight(0xffffff, 100, 0, Math.PI / 6, 1, 2);
scene.add(spotLight);
spotLight.position.set(5, 2.5, 5);
spotLight.map = textures["1.jpg"];
spotLight.angle = Math.PI / 6;
spotLight.penumbra = 0.1;
spotLight.decay = 2;
spotLight.distance = 10;
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
spotLight.shadow.camera.near = 2;
spotLight.shadow.camera.far = 10;
spotLight.shadow.focus = 1;
spotLight.shadow.bias = -0.003;
spotLight.shadow.intensity = 1;

const params = {
  map: textures["1.jpg"],
  color: "#FFFFFF",
  intensity: 100,
  distance: 10,
  angle: Math.PI / 6,
  penumbra: 0.1,
  decay: 2,
  focus: 1,
  shadowIntensity: 1,
};

gui.add(params, "map", textures).onChange(function (val) {
  spotLight.map = val;
});
gui.addColor(params, "color").onChange(function (val) {
  spotLight.color.setHex(val);
});
gui.add(params, "intensity", 0, 500).onChange(function (val) {
  spotLight.intensity = val;
});
gui.add(params, "distance", 0, 20).onChange(function (val) {
  spotLight.distance = val;
});
gui.add(params, "angle", 0, Math.PI / 2).onChange(function (val) {
  spotLight.angle = val;
});
gui.add(params, "penumbra", 0, 1).onChange(function (val) {
  spotLight.penumbra = val;
});

gui.add(params, "decay", 1, 2).onChange(function (val) {
  spotLight.decay = val;
});

gui.add(params, "focus", 0, 1).onChange(function (val) {
  spotLight.shadow.focus = val;
});

gui.add(params, "shadowIntensity", 0, 1).onChange(function (val) {
  spotLight.shadow.intensity = val;
});

// FLOOR
const floorGeometry = new three.PlaneGeometry(8, 8);
const floorMaterial = new three.MeshLambertMaterial({ color: "#BCBCBC" });
const floor = new three.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -1.1;
floor.receiveShadow = true;
scene.add(floor);

// RENDERER
const renderer = new three.WebGLRenderer({
  canvas,
  antialiasing: true,
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(sizes.width, sizes.height);
renderer.toneMapping = three.NeutralToneMapping;
renderer.toneMappingExposure = 1;

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = three.PCFShadowMap;

// ANIMATION LOOP
function animate() {
  const time = performance.now() / 3000;
  requestAnimationFrame(animate);

  spotLight.position.x = Math.cos(time) * 4.5;
  spotLight.position.z = Math.sin(time) * 4.5;

  control.update();
  renderer.render(scene, camera);
}
animate();

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(window.devicePixelRatio);
});
