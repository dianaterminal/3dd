import * as THREE from "https://cdn.skypack.dev/three@0.136.0";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls";

const { sin, cos, random, PI } = Math;

console.clear();

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 1, 1000);
camera.position.set(0, 2, 10);
let renderer = new THREE.WebGLRenderer();
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);
window.addEventListener("resize", (event) => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

let controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;

scene.add(
  new THREE.Box3Helper(
    new THREE.Box3(
      new THREE.Vector3().setScalar(-5),
      new THREE.Vector3().setScalar(5)
    )
  )
);

let pts = new Array(5).fill().map((p) => {
  let v = new THREE.Vector3().random().subScalar(0.5).multiplyScalar(10);
  v.userData = {
    initPos: new THREE.Vector3().copy(v),
    initPhase: { x: random() * PI, y: random() * PI, z: random() * PI },
    speed: {
      x: (random() * 0.1 + 0.1) * Math.PI,
      y: (random() * 0.1 + 0.1) * Math.PI,
      z: (random() * 0.1 + 0.1) * Math.PI
    },
    radius: random() * 2 + 1
  };
  return v;
});
console.log(pts);

let curve = new THREE.CatmullRomCurve3(pts, true, "catmullrom", 0);
curve.getPoints = function (attribute) {
  let divisions = attribute.count - 1;
  let v3 = new THREE.Vector3();
  for (let d = 0; d <= divisions; d++) {
    this.getPoint(d / divisions, v3);
    attribute.setXYZ(d, v3.x, v3.y, v3.z);
  }
  attribute.needsUpdate = true;
};

let g = new THREE.BufferGeometry();
g.setAttribute(
  "position",
  new THREE.BufferAttribute(new Float32Array(100 * 3).fill(0), 3)
);
let pos = g.attributes.position;

let l = new THREE.Line(g, new THREE.LineBasicMaterial({ color: "red" }));
let p = new THREE.Points(
  g,
  new THREE.PointsMaterial({ color: "aqua", size: 0.1 })
);
l.add(p);
scene.add(l);

let clock = new THREE.Clock();

renderer.setAnimationLoop(() => {
  controls.update();

  let t = clock.getElapsedTime();

  pts.forEach((p) => {
    let ud = p.userData;
    let pi = ud.initPhase;
    let ps = ud.speed;
    p.copy(ud.initPos);
    let a = pi + ps * t;
    p.x += cos(pi.x + ps.x * t) * ud.radius;
    p.y += sin(pi.y + ps.y * t) * ud.radius;
    p.z += sin(pi.z + ps.z * t) * ud.radius;
  });

  curve.tension = sin(t) * 0.5 + 0.5;

  curve.getPoints(pos);

  renderer.render(scene, camera);
});
