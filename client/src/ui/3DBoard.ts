
import { TileType, Board, EntityObserver, Position } from '../../../common/Board'

import { MeshStandardMaterial, Object3D, WireframeGeometry } from 'three';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import playerModel from '../../3d/player.gltf';

/*
const floorGeometry = new THREE.PlaneGeometry(20, 20);
const floorMat = new THREE.MeshStandardMaterial({ color: 0, side: THREE.DoubleSide });
const floor = new THREE.Mesh(floorGeometry, floorMat);
floor.receiveShadow = true;
floor.rotation.x = 0.5 * Math.PI;
scene.add(floor);
*/





export class BoardDisplay {
  private board: Board;
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.Camera;
  private mixer: THREE.AnimationMixer;

  constructor(board: Board) {
    this.board = board;
    this.createDisplay();
    this.createBoard();
    for (const player of this.board.createPlayerObservers())
      this.createPlayer(player)
    this.animate();
  }

  createDisplay() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.shadowMap.enabled = true;
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.renderer.setClearColor(0x000000, 1);
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.camera.position.z = 15;
    this.camera.position.y = 10;
    this.camera.position.x = 0;
    this.camera.rotation.x = -0.25 * Math.PI;

    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.castShadow = true;
    light.position.y = 10;
    light.target.position.x = 1;
    light.target.position.z = 1;

    const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
    this.scene.add(ambientLight);
    this.scene.add(light);
    this.scene.add(light.target)

  }

  createPlayer(player: { observer: EntityObserver, position: Position }) {
    console.log(player)
    const loader = new GLTFLoader();
    this.mixer = new THREE.AnimationMixer(this.scene);

    loader.load(playerModel, function (gltf) {
      console.log(gltf);
      gltf.scene.traverse(o => o.castShadow = true);
      this.mixer = new THREE.AnimationMixer(gltf.scene);
      const action = this.mixer.clipAction(gltf.animations[0]);
      action.play();
      this.scene.add(gltf.scene);
    }.bind(this), undefined, function (error) {
      console.error(error);
    });
  }

  createBoard() {
    this.board.forAllTiles(({ x, y }, type) => {
      this.createTile(x, y, type)
    })

  }

  createTile(x: number, y: number, type: TileType) {
    const s = 1;
    const geometry = new THREE.BoxGeometry(s, s, s);
    const material = new THREE.MeshStandardMaterial({ color: 0x222222 });
    let cube = new THREE.Mesh(geometry, material);
    cube.castShadow = true;
    cube.receiveShadow = true;
    cube.position.x = s * x - 10;
    cube.position.y = -s / 2;
    cube.position.z = s * y - 10;
    const wireframe = new WireframeGeometry(geometry);
    let lines = new THREE.LineSegments(wireframe);
    lines.translateX(cube.position.x);
    lines.translateY(cube.position.y);
    lines.translateZ(cube.position.z);
    this.scene.add(lines);
    this.scene.add(cube);
  }

  animate() {
    this.mixer.update(0.02);
    requestAnimationFrame(this.animate.bind(this));
    this.renderer.render(this.scene, this.camera);
  }

}


