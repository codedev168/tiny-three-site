import * as THREE from 'three';

export interface TinyThreeOptions {
  /**
   * Canvas width in pixels
   */
  width?: number;
  /**
   * Canvas height in pixels
   */
  height?: number;
  /**
   * Background color as hex number
   */
  background?: number;
  /**
   * Enable animation loop
   */
  animate?: boolean;
}

/**
 * Creates a Three.js scene with basic lighting and animation
 * @param container DOM element to attach the renderer
 * @param opts Configuration options
 * @returns Scene components and control methods
 */
export function createTinyThreeSite(container: HTMLElement, opts: TinyThreeOptions = {}) {
  const width = opts.width ?? container.clientWidth ?? 800;
  const height = opts.height ?? container.clientHeight ?? 600;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(opts.background ?? 0x202124);

  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.z = 2;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  container.appendChild(renderer.domElement);

  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshStandardMaterial({ color: 0x0077ff });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(3, 3, 3);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0x404040));

  let animId: number | null = null;

  function render() {
    renderer.render(scene, camera);
  }

  function animate() {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    render();
    animId = requestAnimationFrame(animate);
  }

  if (opts.animate !== false) animate();
  else render();

  return {
    scene,
    camera,
    renderer,
    cube,
    stop() {
      if (animId !== null) {
        cancelAnimationFrame(animId);
      }

      try {
        renderer.dispose();
      } catch (e) {
        console.error('Error disposing renderer:', e);
      }

      try {
        // Only attempt removal if container is connected and contains the element
        if (container.isConnected && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      } catch (e) {
        console.error('Error removing renderer element:', e);
      }
    },
    resize(w: number, h: number) {
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      render();
    }
  };
}

export default createTinyThreeSite;