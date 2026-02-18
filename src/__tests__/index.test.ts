import { describe, it, expect, vi, beforeEach } from 'vitest';
import createTinyThreeSite, { TinyThreeOptions } from '../index';

// Mock a minimal subset of three.js used by the module
vi.mock('three', () => {
  class Color {
    value: number;
    constructor(v: number) { this.value = v; }
  }
  class Scene {
    background: any = null;
    children: any[] = [];
    add(obj: any) { this.children.push(obj); }
  }
  class PerspectiveCamera {
    fov: number; aspect: number; near: number; far: number; position: any; updateProjectionMatrixCalled = false;
    constructor(fov: number, aspect: number) { this.fov = fov; this.aspect = aspect; this.near = 0.1; this.far = 1000; this.position = { z: 0 }; }
    updateProjectionMatrix() { this.updateProjectionMatrixCalled = true; }
  }
  class WebGLRenderer {
    domElement: any;
    lastSize: [number, number] | null = null;
    pixelRatio: number | null = null;
    rendered: {scene:any, camera:any}[] = [];
    disposed = false;
    constructor(_: any) { this.domElement = { parentElement: null }; }
    setSize(w: number, h: number) { this.lastSize = [w, h]; }
    setPixelRatio(r: number) { this.pixelRatio = r; }
    render(scene: any, camera: any) { this.rendered.push({ scene, camera }); }
    dispose() { this.disposed = true; }
  }
  class BoxGeometry{}
  class MeshStandardMaterial { color: number; constructor(opts: any) { this.color = opts?.color; } }
  class Mesh {
    geometry: any; material: any; rotation: { x: number; y: number } = { x: 0, y: 0 };
    constructor(geometry: any, material: any) { this.geometry = geometry; this.material = material; }
  }
  class DirectionalLight { position: any = { set: (_x:number,_y:number,_z:number)=>{} }; constructor(){} }
  class AmbientLight { constructor(){} }

  return {
    Color,
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    BoxGeometry,
    MeshStandardMaterial,
    Mesh,
    DirectionalLight,
    AmbientLight,
  };
});

// Helper to create a fake container element
function makeContainer(width = 800, height = 600) {
  const container: any = {
    clientWidth: width,
    clientHeight: height,
    children: [] as any[],
    appendChild(el: any) { this.children.push(el); el.parentElement = this; },
    removeChild(el: any) { const i = this.children.indexOf(el); if (i !== -1) this.children.splice(i, 1); el.parentElement = null; }
  };
  return container;
}

beforeEach(() => {
  // reset globals
  (globalThis as any).requestAnimationFrame = vi.fn().mockReturnValue(1);
  (globalThis as any).cancelAnimationFrame = vi.fn();
  (globalThis as any).window = { devicePixelRatio: 2 } as any;
});

describe('createTinyThreeSite', () => {
  it('appends renderer dom to container and sets defaults', () => {
    const container: any = makeContainer(400, 300);
    const api = createTinyThreeSite(container as HTMLElement);

    expect(api.scene).toBeDefined();
    expect(api.renderer.domElement.parentElement).toBe(container);
    // default background should be 0x202124
    expect(api.scene.background.value).toBe(0x202124);
    // camera positioned
    expect(api.camera.position.z).toBe(2);
    // pixel ratio set to Math.min(window.devicePixelRatio, 2) => 2
    expect((api.renderer as any).pixelRatio).toBe(2);

    api.stop();
  });

  it('respects width/height opts and animate:false calls render once', () => {
    const container: any = makeContainer(100, 80);
    const opts: TinyThreeOptions = { width: 200, height: 150, animate: false };
    const api = createTinyThreeSite(container as HTMLElement, opts);

    // renderer should have been sized to provided width/height
    expect((api.renderer as any).lastSize).toEqual([200, 150]);
    // animate is false so cube rotation stays at 0
    expect(api.cube.rotation.x).toBe(0);
    expect(api.cube.rotation.y).toBe(0);
    // a single render should have occurred
    expect((api.renderer as any).rendered.length).toBeGreaterThanOrEqual(1);

    api.stop();
  });

  it('animate increments cube rotation and schedules requestAnimationFrame', () => {
    const raf = vi.fn().mockReturnValue(42);
    (globalThis as any).requestAnimationFrame = raf;

    const container: any = makeContainer();
    const api = createTinyThreeSite(container as HTMLElement);

    // animate() runs once during startup and should increment rotation
    expect(api.cube.rotation.x).toBeCloseTo(0.01, 5);
    expect(api.cube.rotation.y).toBeCloseTo(0.01, 5);
    expect(raf).toHaveBeenCalled();

    api.stop();
  });

  it('stop cancels animation, disposes renderer and removes dom element', () => {
    const raf = vi.fn().mockReturnValue(99);
    const caf = vi.fn();
    (globalThis as any).requestAnimationFrame = raf;
    (globalThis as any).cancelAnimationFrame = caf;

    const container: any = makeContainer();
    const api = createTinyThreeSite(container as HTMLElement);

    // ensure dom present
    expect(api.renderer.domElement.parentElement).toBe(container);

    api.stop();

    expect(caf).toHaveBeenCalledWith(99);
    expect((api.renderer as any).disposed).toBe(true);
    expect(api.renderer.domElement.parentElement).toBeNull();
  });

  it('resize updates renderer size, camera aspect and calls render', () => {
    const container: any = makeContainer();
    const api = createTinyThreeSite(container as HTMLElement, { animate: false });

    (api.renderer as any).rendered = [];
    api.resize(640, 480);

    expect((api.renderer as any).lastSize).toEqual([640, 480]);
    expect(api.camera.aspect).toBeCloseTo(640 / 480);
    expect((api.camera as any).updateProjectionMatrixCalled).toBe(true);
    expect((api.renderer as any).rendered.length).toBeGreaterThanOrEqual(1);

    api.stop();
  });
});
