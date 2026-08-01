import { useEffect, useRef } from "react";
import type * as ThreeNS from "three";

type Variant =
  | "paths"
  | "surface"
  | "accent"
  | "heatmap"
  | "frontier"
  | "topology"
  | "fractal"
  | "network"
  | "rubik";

interface QuantCanvasProps {
  variant?: Variant;
  className?: string;
  density?: number;
  interactive?: boolean;
}

/**
 * Quant-flavored Three.js scenes.
 *
 * variant = "paths"   -> Monte Carlo GBM path bundle (cone-of-uncertainty).
 *                        Faint stochastic price paths sweeping right, gently
 *                        parallaxing to the pointer.
 * variant = "surface" -> Animated wireframe volatility surface with a subtle
 *                        skew smile, slowly rotating, breathing on scroll.
 * variant = "accent"  -> Compact path bundle for small hero accents.
 *
 * Three is dynamically imported inside useEffect so SSR is safe.
 */
export function QuantCanvas({
  variant = "paths",
  className,
  density,
  interactive = true,
}: QuantCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let cleanup: (() => void) | null = null;

    (async () => {
      const THREE = await import("three");
      if (disposed || !mount) return;

      const palette =
        variant === "surface"
          ? { line: 0xdde4ec, glow: 0x1d3e29, axis: 0x2a3a48 }
          : { line: 0x1d3e29, glow: 0x1d3e29, axis: 0x1d3e29 };

      const width = mount.clientWidth || 1;
      const height = mount.clientHeight || 1;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height, false);
      renderer.setClearColor(0x000000, 0);
      mount.appendChild(renderer.domElement);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      renderer.domElement.style.display = "block";

      const disposables: Array<{ dispose: () => void }> = [];
      let tick: (dt: number) => void = () => {};

      if (variant === "fractal") {
        // ---- Animated Julia set (escape-time fractal) ----
        // c stays inside a stable arc of the |c| = 0.7885 circle so the set
        // never collapses into dust; smooth-iteration + orbit-trap colouring
        // in forest greens, with a short fade-in on mount.
        camera.position.set(0, 0, 1);
        const planeGeo = new THREE.PlaneGeometry(2, 2);
        const uniforms = {
          uTime: { value: 0 },
          uFade: { value: 0 },
          uAspect: { value: width / height },
          uPointer: { value: new THREE.Vector2(0, 0) },
          uInk: { value: new THREE.Color(0x0a0c0f) },
          uForest: { value: new THREE.Color(0x1d3e29) },
          uIce: { value: new THREE.Color(0x7fd39b) },
        };
        const fractalMat = new THREE.ShaderMaterial({
          uniforms,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          vertexShader: /* glsl */ `
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = vec4(position.xy, 0.0, 1.0);
            }
          `,
          fragmentShader: /* glsl */ `
            precision highp float;
            varying vec2 vUv;
            uniform float uTime;
            uniform float uFade;
            uniform float uAspect;
            uniform vec2 uPointer;
            uniform vec3 uInk;
            uniform vec3 uForest;
            uniform vec3 uIce;

            void main() {
              vec2 uv = (vUv - 0.5);
              uv.x *= uAspect;
              // Frame the set: fit to the short axis so it never stretches.
              float zoom = 2.30 + 0.10 * sin(uTime * 0.06);
              vec2 z = uv * zoom + vec2(-0.62, 0.02);
              // c sweeps a narrow, well-behaved arc -> always a connected set.
              float a = 2.02 + 0.30 * sin(uTime * 0.05);
              vec2 c = 0.7885 * vec2(cos(a), sin(a)) + uPointer * 0.02;
              const int MAX_ITER = 110;
              int iter = MAX_ITER;
              float smoothIter = 0.0;
              float trap = 1e9;
              for (int i = 0; i < MAX_ITER; i++) {
                float x = z.x * z.x - z.y * z.y + c.x;
                float y = 2.0 * z.x * z.y + c.y;
                z = vec2(x, y);
                trap = min(trap, abs(length(z) - 0.85));
                float m2 = dot(z, z);
                if (m2 > 64.0) {
                  smoothIter = float(i) - log2(log2(m2)) + 4.0;
                  iter = i;
                  break;
                }
              }
              float r = length((vUv - 0.5) * vec2(uAspect, 1.0));
              float vig = smoothstep(1.15, 0.25, r);

              if (iter == MAX_ITER) {
                // interior: quiet forest wash with the orbit-trap filigree
                float fil = exp(-trap * 7.0);
                vec3 inner = mix(uForest * 0.45, uIce, fil * 0.5);
                gl_FragColor = vec4(inner * vig * uFade, 1.0);
                return;
              }

              float t = clamp(smoothIter / 40.0, 0.0, 1.0);
              float k = pow(t, 0.7);
              // boundary glow: dark -> forest -> soft green highlight
              vec3 col = mix(uInk, uForest * 1.6, smoothstep(0.0, 0.45, k));
              col = mix(col, uIce, smoothstep(0.55, 1.0, k) * 0.75);
              // filigree bands hugging the boundary
              col += uIce * exp(-trap * 9.0) * 0.35;
              float intensity = (0.25 + 0.9 * k) * vig * uFade;
              gl_FragColor = vec4(col * intensity, 1.0);
            }
          `,
        });
        const quad = new THREE.Mesh(planeGeo, fractalMat);
        scene.add(quad);
        disposables.push(planeGeo, fractalMat);

        const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
        const onMove = (e: PointerEvent) => {
          const rct = mount.getBoundingClientRect();
          pointer.tx = ((e.clientX - rct.left) / rct.width) * 2 - 1;
          pointer.ty = -(((e.clientY - rct.top) / rct.height) * 2 - 1);
        };
        if (interactive) window.addEventListener("pointermove", onMove);

        tick = (dt) => {
          uniforms.uTime.value += dt;
          uniforms.uFade.value = Math.min(1, uniforms.uFade.value + dt * 1.6);
          pointer.x += (pointer.tx - pointer.x) * 0.04;
          pointer.y += (pointer.ty - pointer.y) * 0.04;
          uniforms.uPointer.value.set(pointer.x, pointer.y);
          uniforms.uAspect.value =
            (mount.clientWidth || 1) / (mount.clientHeight || 1);
        };

        cleanup = () => {
          if (interactive) window.removeEventListener("pointermove", onMove);
        };
      } else if (variant === "rubik") {
        // ---- Rubik's cube: scramble into chaos, then solve itself ----
        camera.position.set(5.4, 4.0, 6.6);
        camera.lookAt(0, 0, 0);

        scene.add(new THREE.AmbientLight(0xffffff, 1.15));
        const key = new THREE.DirectionalLight(0xffffff, 1.5);
        key.position.set(4, 6, 5);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x6bbf87, 0.8);
        rim.position.set(-5, -2, -4);
        scene.add(rim);

        const root = new THREE.Group();
        root.position.set(2.6, 0, 0);
        root.scale.setScalar(0.92);
        scene.add(root);

        const cubeGroup = new THREE.Group();
        root.add(cubeGroup);
        const pivot = new THREE.Group();
        root.add(pivot);

        // Brand-palette "stickers": forest -> ice ramp instead of primaries.
        const faceColors = [
          0x6bbf87, // +x
          0x1d3e29, // -x
          0xdde4ec, // +y
          0x0f2a1c, // -y
          0x2f6b45, // +z
          0x9fb8a8, // -z
        ];
        const faceMats = faceColors.map(
          (c) =>
            new THREE.MeshStandardMaterial({
              color: c,
              roughness: 0.42,
              metalness: 0.08,
            }),
        );
        faceMats.forEach((m) => disposables.push(m));

        const SP = 1.02; // spacing
        const geo = new THREE.BoxGeometry(0.96, 0.96, 0.96);
        disposables.push(geo);
        const edgeGeo = new THREE.EdgesGeometry(geo);
        disposables.push(edgeGeo);
        const edgeMat = new THREE.LineBasicMaterial({
          color: 0x0a0c0f,
          transparent: true,
          opacity: 0.85,
        });
        disposables.push(edgeMat);

        const cubelets: ThreeNS.Object3D[] = [];
        for (let x = -1; x <= 1; x++) {
          for (let y = -1; y <= 1; y++) {
            for (let z = -1; z <= 1; z++) {
              const mesh = new THREE.Mesh(geo, faceMats);
              mesh.position.set(x * SP, y * SP, z * SP);
              mesh.add(new THREE.LineSegments(edgeGeo, edgeMat));
              cubeGroup.add(mesh);
              cubelets.push(mesh);
            }
          }
        }

        type Move = { axis: "x" | "y" | "z"; layer: -1 | 0 | 1; dir: 1 | -1 };
        const AXES: Array<Move["axis"]> = ["x", "y", "z"];
        const LAYERS: Array<Move["layer"]> = [-1, 0, 1];
        const randomMove = (): Move => ({
          axis: AXES[Math.floor(Math.random() * 3)],
          layer: LAYERS[Math.floor(Math.random() * 3)],
          dir: Math.random() < 0.5 ? 1 : -1,
        });

        let queue: Move[] = [];
        let history: Move[] = [];
        let phase: "scramble" | "solve" | "pause" = "scramble";
        let pauseLeft = 0;
        let speed = 3.4; // radians / second

        const startScramble = () => {
          const n = 14 + Math.floor(Math.random() * 8);
          queue = Array.from({ length: n }, randomMove);
          history = [];
          phase = "scramble";
          speed = 5.2; // chaotic
        };
        const startSolve = () => {
          queue = history
            .slice()
            .reverse()
            .map((m) => ({ ...m, dir: (m.dir * -1) as 1 | -1 }));
          history = [];
          phase = "solve";
          speed = 3.0; // deliberate
        };
        startScramble();

        let active: Move | null = null;
        let turned = 0;
        const beginMove = (m: Move) => {
          active = m;
          turned = 0;
          pivot.rotation.set(0, 0, 0);
          for (const c of cubelets.slice()) {
            const v = c.position[m.axis];
            if (Math.abs(v - m.layer * SP) < 0.25) pivot.attach(c);
          }
        };
        const endMove = () => {
          for (const c of pivot.children.slice()) {
            cubeGroup.attach(c);
            c.position.set(
              Math.round(c.position.x / SP) * SP,
              Math.round(c.position.y / SP) * SP,
              Math.round(c.position.z / SP) * SP,
            );
          }
          pivot.rotation.set(0, 0, 0);
          active = null;
        };

        const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
        const onMove = (e: PointerEvent) => {
          const rct = mount.getBoundingClientRect();
          pointer.tx = ((e.clientX - rct.left) / rct.width) * 2 - 1;
          pointer.ty = -(((e.clientY - rct.top) / rct.height) * 2 - 1);
        };
        if (interactive) window.addEventListener("pointermove", onMove);

        let t = 0;
        tick = (dt) => {
          t += dt;
          pointer.x += (pointer.tx - pointer.x) * 0.05;
          pointer.y += (pointer.ty - pointer.y) * 0.05;
          root.rotation.y = t * 0.22 + pointer.x * 0.5;
          root.rotation.x = Math.sin(t * 0.17) * 0.14 + pointer.y * 0.3;

          if (phase === "pause") {
            pauseLeft -= dt;
            if (pauseLeft <= 0) startScramble();
            return;
          }

          if (!active) {
            const next = queue.shift();
            if (!next) {
              if (phase === "scramble") {
                startSolve();
              } else {
                phase = "pause";
                pauseLeft = 1.4;
              }
              return;
            }
            beginMove(next);
            if (phase === "scramble") history.push(next);
          }

          if (active) {
            const step = Math.min(speed * dt, Math.PI / 2 - turned);
            turned += step;
            pivot.rotation[active.axis] += step * active.dir;
            if (turned >= Math.PI / 2 - 1e-4) {
              pivot.rotation[active.axis] = (Math.PI / 2) * active.dir;
              endMove();
            }
          }
        };

        cleanup = () => {
          if (interactive) window.removeEventListener("pointermove", onMove);
        };
      } else if (variant === "network") {
        // ---- 3D graph network ----
        // Nodes scattered on a spherical shell, edges to nearest neighbours,
        // with signal pulses travelling along a subset of the edges.
        camera.position.set(0, 0, 6.2);
        camera.lookAt(0, 0, 0);

        const group = new THREE.Group();
        // Sit the graph off to the right so headline copy stays clear.
        group.position.x = 1.55;
        scene.add(group);

        const N = Math.max(40, Math.round(density ?? 110));
        const nodes: ThreeNS.Vector3[] = [];
        for (let i = 0; i < N; i++) {
          // Fibonacci-ish sphere with radial jitter -> organic but even.
          const y = 1 - (i / (N - 1)) * 2;
          const rad = Math.sqrt(Math.max(0, 1 - y * y));
          const theta = i * 2.399963;
          const r = 2.05 + (Math.random() - 0.5) * 0.75;
          nodes.push(
            new THREE.Vector3(
              Math.cos(theta) * rad * r,
              y * r,
              Math.sin(theta) * rad * r,
            ),
          );
        }

        // k-nearest-neighbour edge set (deduplicated).
        const K = 3;
        const edgeKeys = new Set<string>();
        const edges: Array<[number, number]> = [];
        for (let i = 0; i < N; i++) {
          const order = nodes
            .map((p, j) => ({ j, d: p.distanceToSquared(nodes[i]) }))
            .filter((o) => o.j !== i)
            .sort((a, b) => a.d - b.d)
            .slice(0, K);
          for (const o of order) {
            const a = Math.min(i, o.j);
            const b = Math.max(i, o.j);
            const key = `${a}-${b}`;
            if (edgeKeys.has(key)) continue;
            edgeKeys.add(key);
            edges.push([a, b]);
          }
        }

        const edgePos = new Float32Array(edges.length * 6);

        // Triangular faces (3-cliques) — translucent shaded membranes that
        // brighten and fade independently, giving the graph volume.
        const adj: Set<number>[] = Array.from({ length: N }, () => new Set<number>());
        for (const [a, b] of edges) {
          adj[a].add(b);
          adj[b].add(a);
        }
        const tris: Array<[number, number, number]> = [];
        for (const [a, b] of edges) {
          for (const c of adj[a]) {
            if (c > b && adj[b].has(c)) tris.push([a, b, c]);
          }
        }
        // If the graph is sparse, synthesise faces from nearest triples.
        if (tris.length < 24) {
          for (const [a, b] of edges) {
            const c = [...adj[a]].find((x) => x !== b);
            if (c !== undefined) tris.push([a, b, c]);
            if (tris.length > 60) break;
          }
        }
        const faceCount = Math.min(tris.length, 140);
        const facePos = new Float32Array(faceCount * 9);
        const faceCol = new Float32Array(faceCount * 9);
        const faceGeo = new THREE.BufferGeometry();
        faceGeo.setAttribute("position", new THREE.BufferAttribute(facePos, 3));
        faceGeo.setAttribute("color", new THREE.BufferAttribute(faceCol, 3));
        const faceMat = new THREE.MeshBasicMaterial({
          vertexColors: true,
          transparent: true,
          opacity: 0.5,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        group.add(new THREE.Mesh(faceGeo, faceMat));
        disposables.push(faceGeo, faceMat);
        const facePhase = new Float32Array(faceCount);
        for (let i = 0; i < faceCount; i++) facePhase[i] = Math.random() * Math.PI * 2;

        const edgeGeo = new THREE.BufferGeometry();
        edgeGeo.setAttribute("position", new THREE.BufferAttribute(edgePos, 3));
        const edgeMat = new THREE.LineBasicMaterial({
          color: 0x2f6b45,
          transparent: true,
          opacity: 0.55,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        group.add(new THREE.LineSegments(edgeGeo, edgeMat));
        disposables.push(edgeGeo, edgeMat);

        const nodePos = new Float32Array(N * 3);
        const nodeGeo = new THREE.BufferGeometry();
        nodeGeo.setAttribute("position", new THREE.BufferAttribute(nodePos, 3));
        const nodeMat = new THREE.PointsMaterial({
          color: 0x6bbf87,
          size: 3.2,
          sizeAttenuation: false,
          transparent: true,
          opacity: 0.9,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        group.add(new THREE.Points(nodeGeo, nodeMat));
        disposables.push(nodeGeo, nodeMat);

        // Signal pulses travelling along random edges.
        const PULSES = Math.min(48, edges.length);
        const pulseEdge = new Int32Array(PULSES);
        const pulseT = new Float32Array(PULSES);
        for (let i = 0; i < PULSES; i++) {
          pulseEdge[i] = Math.floor(Math.random() * edges.length);
          pulseT[i] = Math.random();
        }
        const pulsePos = new Float32Array(PULSES * 3);
        const pulseGeo = new THREE.BufferGeometry();
        pulseGeo.setAttribute("position", new THREE.BufferAttribute(pulsePos, 3));
        const pulseMat = new THREE.PointsMaterial({
          color: 0xa8e6bd,
          size: 5,
          sizeAttenuation: false,
          transparent: true,
          opacity: 0.95,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        group.add(new THREE.Points(pulseGeo, pulseMat));
        disposables.push(pulseGeo, pulseMat);

        const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
        const onMove = (e: PointerEvent) => {
          const rct = mount.getBoundingClientRect();
          pointer.tx = ((e.clientX - rct.left) / rct.width) * 2 - 1;
          pointer.ty = -(((e.clientY - rct.top) / rct.height) * 2 - 1);
        };
        if (interactive) window.addEventListener("pointermove", onMove);

        const base = nodes.map((v) => v.clone());
        const live = nodes.map((v) => v.clone());
        let t = 0;
        tick = (dt) => {
          t += dt;
          pointer.x += (pointer.tx - pointer.x) * 0.05;
          pointer.y += (pointer.ty - pointer.y) * 0.05;

          group.rotation.y = t * 0.11 + pointer.x * 0.4;
          group.rotation.x = Math.sin(t * 0.09) * 0.18 + pointer.y * 0.25;

          for (let i = 0; i < N; i++) {
            const b = base[i];
            const breathe = 1 + Math.sin(t * 0.7 + i * 0.6) * 0.03;
            live[i].set(b.x * breathe, b.y * breathe, b.z * breathe);
            nodePos[i * 3] = live[i].x;
            nodePos[i * 3 + 1] = live[i].y;
            nodePos[i * 3 + 2] = live[i].z;
          }
          nodeGeo.attributes.position.needsUpdate = true;

          for (let e = 0; e < edges.length; e++) {
            const a = live[edges[e][0]];
            const b = live[edges[e][1]];
            edgePos[e * 6] = a.x;
            edgePos[e * 6 + 1] = a.y;
            edgePos[e * 6 + 2] = a.z;
            edgePos[e * 6 + 3] = b.x;
            edgePos[e * 6 + 4] = b.y;
            edgePos[e * 6 + 5] = b.z;
          }
          edgeGeo.attributes.position.needsUpdate = true;

          // Shaded membranes: positions follow the nodes, colour pulses.
          for (let f = 0; f < faceCount; f++) {
            const [ia, ib, ic] = tris[f];
            const p = [live[ia], live[ib], live[ic]];
            for (let v = 0; v < 3; v++) {
              const o = f * 9 + v * 3;
              facePos[o] = p[v].x;
              facePos[o + 1] = p[v].y;
              facePos[o + 2] = p[v].z;
            }
            const w = 0.5 + 0.5 * Math.sin(t * 0.55 + facePhase[f]);
            const g = 0.06 + w * 0.34;
            for (let v = 0; v < 3; v++) {
              const o = f * 9 + v * 3;
              facePos[o + 0] = facePos[o + 0];
              faceCol[o] = g * 0.28;
              faceCol[o + 1] = g;
              faceCol[o + 2] = g * 0.55;
            }
          }
          faceGeo.attributes.position.needsUpdate = true;
          faceGeo.attributes.color.needsUpdate = true;

          for (let i = 0; i < PULSES; i++) {
            pulseT[i] += dt * 0.35;
            if (pulseT[i] > 1) {
              pulseT[i] = 0;
              pulseEdge[i] = Math.floor(Math.random() * edges.length);
            }
            const [ai, bi] = edges[pulseEdge[i]];
            const a = live[ai];
            const b = live[bi];
            const k = pulseT[i];
            pulsePos[i * 3] = a.x + (b.x - a.x) * k;
            pulsePos[i * 3 + 1] = a.y + (b.y - a.y) * k;
            pulsePos[i * 3 + 2] = a.z + (b.z - a.z) * k;
          }
          pulseGeo.attributes.position.needsUpdate = true;
        };

        cleanup = () => {
          if (interactive) window.removeEventListener("pointermove", onMove);
        };
      } else if (variant === "topology") {
        // ---- Topological manifold: rotating torus-knot wireframe ----
        // A (p,q)-torus knot is a classic object in low-dimensional
        // topology. We render it as an additive wireframe over ink, with
        // a faint companion torus for depth and a slow orbital rotation.
        camera.position.set(0, 0.4, 5.4);
        camera.lookAt(0, 0, 0);

        const knotGeo = new THREE.TorusKnotGeometry(1.35, 0.42, 340, 32, 2, 3);
        const wire = new THREE.WireframeGeometry(knotGeo);
        const knotMat = new THREE.LineBasicMaterial({
          color: palette.line,
          transparent: true,
          opacity: 0.55,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const knot = new THREE.LineSegments(wire, knotMat);
        scene.add(knot);
        disposables.push(knotGeo, wire, knotMat);

        // Companion base torus — the ambient manifold.
        const torusGeo = new THREE.TorusGeometry(2.15, 0.02, 8, 220);
        const torusMat = new THREE.LineBasicMaterial({
          color: palette.axis,
          transparent: true,
          opacity: 0.28,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const torus = new THREE.LineSegments(
          new THREE.WireframeGeometry(torusGeo),
          torusMat,
        );
        torus.rotation.x = Math.PI / 2.6;
        scene.add(torus);
        disposables.push(torusGeo, torusMat, torus.geometry);

        // A drifting cloud of points sampled on the knot — "flow on the manifold".
        const flowN = density ?? 260;
        const flowPos = new Float32Array(flowN * 3);
        const flowT = new Float32Array(flowN);
        for (let i = 0; i < flowN; i++) flowT[i] = Math.random();
        const flowGeo = new THREE.BufferGeometry();
        flowGeo.setAttribute("position", new THREE.BufferAttribute(flowPos, 3));
        const flowMat = new THREE.PointsMaterial({
          color: palette.line,
          size: 2.4,
          sizeAttenuation: false,
          transparent: true,
          opacity: 0.85,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const flow = new THREE.Points(flowGeo, flowMat);
        scene.add(flow);
        disposables.push(flowGeo, flowMat);

        // p,q knot parametrisation matching the geometry above.
        const P = 2, Q = 3, R = 1.35, r = 0.42;
        const knotAt = (u: number, out: ThreeNS.Vector3) => {
          const phi = u * Math.PI * 2;
          const cu = Math.cos(P * phi), su = Math.sin(P * phi);
          const cv = Math.cos(Q * phi), sv = Math.sin(Q * phi);
          const x = (R + r * cv) * cu;
          const y = (R + r * cv) * su;
          const z = r * sv;
          out.set(x, y, z);
        };

        const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
        const onMove = (e: PointerEvent) => {
          const rct = mount.getBoundingClientRect();
          pointer.tx = ((e.clientX - rct.left) / rct.width) * 2 - 1;
          pointer.ty = -(((e.clientY - rct.top) / rct.height) * 2 - 1);
        };
        if (interactive) window.addEventListener("pointermove", onMove);

        const tmp = new THREE.Vector3();
        let t = 0;
        tick = (dt) => {
          t += dt;
          pointer.x += (pointer.tx - pointer.x) * 0.05;
          pointer.y += (pointer.ty - pointer.y) * 0.05;

          knot.rotation.y = t * 0.18 + pointer.x * 0.35;
          knot.rotation.x = 0.35 + Math.sin(t * 0.13) * 0.15 + pointer.y * 0.2;
          torus.rotation.z = t * 0.06;

          const arr = flowGeo.attributes.position.array as Float32Array;
          for (let i = 0; i < flowN; i++) {
            flowT[i] = (flowT[i] + dt * 0.03) % 1;
            knotAt(flowT[i], tmp);
            arr[i * 3 + 0] = tmp.x;
            arr[i * 3 + 1] = tmp.y;
            arr[i * 3 + 2] = tmp.z;
          }
          flowGeo.attributes.position.needsUpdate = true;
          flow.rotation.copy(knot.rotation);
        };

        cleanup = () => {
          if (interactive) window.removeEventListener("pointermove", onMove);
        };
      } else if (variant === "heatmap") {
        // ---- Live correlation matrix ----
        // A quant desk staple: a square grid of correlations that slowly
        // "breathes" as regimes drift. Contained, chart-like, non-intrusive.
        camera.position.set(0, 0, 6);

        const N = 18; // 18x18 assets
        const cellSize = 0.28;
        const gap = 0.02;
        const total = N * (cellSize + gap) - gap;
        const origin = -total / 2 + cellSize / 2;

        // Latent factor loadings per "asset" — correlations = f_i · f_j.
        const F = 3;
        const loadings: number[][] = [];
        for (let i = 0; i < N; i++) {
          const row: number[] = [];
          for (let f = 0; f < F; f++) row.push((Math.random() - 0.5) * 1.4);
          loadings.push(row);
        }

        const geo = new THREE.PlaneGeometry(cellSize, cellSize);
        const count = N * N;
        const mat = new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          uniforms: {
            uColorPos: { value: new THREE.Color(0x1d3e29) }, // forest for +
            uColorNeg: { value: new THREE.Color(0x0a0c0f) }, // ink for -
            uColorZero: { value: new THREE.Color(0xdde4ec) }, // ice base
          },
          vertexShader: /* glsl */ `
            attribute float aCorr;
            attribute vec2 aOffset;
            varying float vCorr;
            varying vec2 vUv;
            void main() {
              vCorr = aCorr;
              vUv = uv;
              vec3 p = position + vec3(aOffset, 0.0);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
            }
          `,
          fragmentShader: /* glsl */ `
            precision mediump float;
            uniform vec3 uColorPos;
            uniform vec3 uColorNeg;
            uniform vec3 uColorZero;
            varying float vCorr;
            varying vec2 vUv;
            void main() {
              float mag = clamp(abs(vCorr), 0.0, 1.0);
              vec3 tint = vCorr >= 0.0 ? uColorPos : uColorNeg;
              vec3 col = mix(uColorZero, tint, mag);
              // subtle inner border for grid feel
              float edge = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
              float border = smoothstep(0.0, 0.04, edge);
              float a = (0.35 + 0.55 * mag) * border;
              gl_FragColor = vec4(col, a);
            }
          `,
        });

        const instanced = new THREE.InstancedMesh(geo, mat, count);
        const offsets = new Float32Array(count * 2);
        const corrs = new Float32Array(count);
        let idx = 0;
        for (let i = 0; i < N; i++) {
          for (let j = 0; j < N; j++) {
            offsets[idx * 2 + 0] = origin + j * (cellSize + gap);
            offsets[idx * 2 + 1] = origin + i * (cellSize + gap);
            corrs[idx] = i === j ? 1.0 : 0.0;
            idx++;
          }
        }
        geo.setAttribute(
          "aOffset",
          new THREE.InstancedBufferAttribute(offsets, 2),
        );
        const corrAttr = new THREE.InstancedBufferAttribute(corrs, 1);
        corrAttr.setUsage(THREE.DynamicDrawUsage);
        geo.setAttribute("aCorr", corrAttr);
        scene.add(instanced);
        disposables.push(geo, mat);

        let t = 0;
        tick = (dt) => {
          t += dt;
          // Drift loadings slowly; recompute correlations.
          for (let i = 0; i < N; i++) {
            for (let f = 0; f < F; f++) {
              loadings[i][f] +=
                Math.sin(t * (0.15 + f * 0.07) + i * 0.4 + f) * dt * 0.05;
            }
          }
          let k = 0;
          for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
              if (i === j) {
                corrs[k++] = 1.0;
                continue;
              }
              let dot = 0,
                ni = 0,
                nj = 0;
              for (let f = 0; f < F; f++) {
                dot += loadings[i][f] * loadings[j][f];
                ni += loadings[i][f] * loadings[i][f];
                nj += loadings[j][f] * loadings[j][f];
              }
              const c = dot / (Math.sqrt(ni * nj) + 1e-6);
              corrs[k++] = Math.max(-1, Math.min(1, c));
            }
          }
          corrAttr.needsUpdate = true;
          instanced.rotation.z = Math.sin(t * 0.05) * 0.01;
        };

        cleanup = () => {};
      } else if (variant === "frontier") {
        // ---- Efficient frontier + risk/return scatter cloud ----
        camera.position.set(0, 0, 6);

        const cloudN = density ?? 420;
        const cloudPos = new Float32Array(cloudN * 3);
        const cloudAlpha = new Float32Array(cloudN);
        const cloudSize = new Float32Array(cloudN);
        const spanX = 6.4;
        const spanY = 3.6;
        // frontier: y = a + b*sqrt(x - c) with x = risk, y = return
        const frontier = (x: number) => -1.2 + 1.35 * Math.sqrt(Math.max(0, x + 3.0));
        for (let i = 0; i < cloudN; i++) {
          const x = (Math.random() - 0.4) * spanX;
          const yMax = frontier(x);
          // most points below/at frontier; a few above (noise)
          const bias = Math.pow(Math.random(), 1.6);
          const y = yMax - bias * (2.2 + Math.random() * 0.8) + (Math.random() - 0.5) * 0.2;
          cloudPos[i * 3 + 0] = x;
          cloudPos[i * 3 + 1] = Math.max(-spanY / 2, Math.min(spanY / 2, y));
          cloudPos[i * 3 + 2] = (Math.random() - 0.5) * 0.6;
          cloudAlpha[i] = 0.15 + Math.random() * 0.55;
          cloudSize[i] = 2 + Math.random() * 5;
        }

        const cloudGeo = new THREE.BufferGeometry();
        cloudGeo.setAttribute("position", new THREE.BufferAttribute(cloudPos, 3));
        cloudGeo.setAttribute("aAlpha", new THREE.BufferAttribute(cloudAlpha, 1));
        cloudGeo.setAttribute("aSize", new THREE.BufferAttribute(cloudSize, 1));

        const uniforms = {
          uTime: { value: 0 },
          uColor: { value: new THREE.Color(palette.line) },
          uGlow: { value: new THREE.Color(palette.glow) },
          uPointer: { value: new THREE.Vector2(0, 0) },
          uPixelRatio: { value: renderer.getPixelRatio() },
        };

        const cloudMat = new THREE.ShaderMaterial({
          uniforms,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          vertexShader: /* glsl */ `
            attribute float aAlpha;
            attribute float aSize;
            uniform float uTime;
            uniform vec2 uPointer;
            uniform float uPixelRatio;
            varying float vAlpha;
            void main() {
              vec3 p = position;
              p.x += sin(uTime * 0.4 + p.y * 1.7) * 0.015;
              p.y += cos(uTime * 0.5 + p.x * 1.3) * 0.015;
              p.xy += uPointer * 0.12 * (0.5 + 0.5 * p.z);
              vAlpha = aAlpha;
              vec4 mv = modelViewMatrix * vec4(p, 1.0);
              gl_PointSize = aSize * uPixelRatio * (300.0 / -mv.z);
              gl_Position = projectionMatrix * mv;
            }
          `,
          fragmentShader: /* glsl */ `
            precision mediump float;
            uniform vec3 uColor;
            uniform vec3 uGlow;
            varying float vAlpha;
            void main() {
              vec2 c = gl_PointCoord - 0.5;
              float d = length(c);
              if (d > 0.5) discard;
              float ring = smoothstep(0.5, 0.35, d);
              vec3 col = mix(uColor, uGlow, 0.4);
              gl_FragColor = vec4(col, vAlpha * ring);
            }
          `,
        });

        const cloud = new THREE.Points(cloudGeo, cloudMat);
        scene.add(cloud);
        disposables.push(cloudGeo, cloudMat);

        // Frontier curve — the highlighted, "optimal" boundary.
        const curvePts: ThreeNS.Vector3[] = [];
        const steps = 140;
        for (let i = 0; i <= steps; i++) {
          const x = -spanX / 2 + (i / steps) * spanX;
          curvePts.push(new THREE.Vector3(x, frontier(x), 0));
        }
        const curveGeo = new THREE.BufferGeometry().setFromPoints(curvePts);
        const curveMat = new THREE.LineBasicMaterial({
          color: palette.line,
          transparent: true,
          opacity: 0.85,
        });
        const curve = new THREE.Line(curveGeo, curveMat);
        scene.add(curve);
        disposables.push(curveGeo, curveMat);

        // Axes
        const axisPts = [
          new THREE.Vector3(-spanX / 2, -spanY / 2, 0),
          new THREE.Vector3(spanX / 2, -spanY / 2, 0),
          new THREE.Vector3(-spanX / 2, -spanY / 2, 0),
          new THREE.Vector3(-spanX / 2, spanY / 2, 0),
        ];
        const axisGeo = new THREE.BufferGeometry().setFromPoints(axisPts);
        const axisMat = new THREE.LineBasicMaterial({
          color: palette.axis,
          transparent: true,
          opacity: 0.32,
        });
        scene.add(new THREE.LineSegments(axisGeo, axisMat));
        disposables.push(axisGeo, axisMat);

        // Moving "optimal portfolio" marker traversing the frontier.
        const markerGeo = new THREE.BufferGeometry();
        markerGeo.setAttribute(
          "position",
          new THREE.BufferAttribute(new Float32Array(3), 3),
        );
        const markerMat = new THREE.PointsMaterial({
          color: palette.line,
          size: 12,
          sizeAttenuation: false,
          transparent: true,
          opacity: 0.95,
        });
        const marker = new THREE.Points(markerGeo, markerMat);
        scene.add(marker);
        disposables.push(markerGeo, markerMat);

        const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
        const onMove = (e: PointerEvent) => {
          const r = mount.getBoundingClientRect();
          pointer.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
          pointer.ty = -(((e.clientY - r.top) / r.height) * 2 - 1);
        };
        if (interactive) window.addEventListener("pointermove", onMove);

        tick = (dt) => {
          uniforms.uTime.value += dt;
          pointer.x += (pointer.tx - pointer.x) * 0.08;
          pointer.y += (pointer.ty - pointer.y) * 0.08;
          uniforms.uPointer.value.set(pointer.x, pointer.y);
          const t = uniforms.uTime.value;
          const mx = -spanX / 2 + ((Math.sin(t * 0.25) * 0.5 + 0.5)) * spanX;
          const arr = markerGeo.attributes.position.array as Float32Array;
          arr[0] = mx;
          arr[1] = frontier(mx);
          arr[2] = 0;
          markerGeo.attributes.position.needsUpdate = true;
        };

        cleanup = () => {
          if (interactive) window.removeEventListener("pointermove", onMove);
        };
      } else if (variant === "surface") {
        camera.position.set(0, 2.4, 5.5);
        camera.lookAt(0, 0, 0);

        const segX = 90;
        const segY = 60;
        const geo = new THREE.PlaneGeometry(8, 5.2, segX, segY);
        geo.rotateX(-Math.PI / 2);

        const uniforms = {
          uTime: { value: 0 },
          uColor: { value: new THREE.Color(palette.line) },
          uGlow: { value: new THREE.Color(palette.glow) },
          uBreathe: { value: 0.0 },
        };

        const mat = new THREE.ShaderMaterial({
          uniforms,
          transparent: true,
          wireframe: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          vertexShader: /* glsl */ `
            uniform float uTime;
            uniform float uBreathe;
            varying float vH;
            varying vec2 vUv;
            // Volatility-surface-ish: skew on x (moneyness), term structure on z.
            float surf(vec2 p, float t) {
              float smile = 0.45 * p.x * p.x;                 // convex smile
              float skew  = -0.18 * p.x;                       // negative skew
              float term  = 0.22 * exp(-abs(p.y) * 0.55);      // short-dated bump
              float ripple = 0.06 * sin(p.x * 1.8 + t * 0.6)
                           * cos(p.y * 1.3 - t * 0.5);
              float breath = uBreathe * 0.08 * sin(t * 0.4 + p.x * 0.6);
              return smile + skew + term + ripple + breath;
            }
            void main() {
              vec3 p = position;
              vec2 g = vec2(p.x * 0.5, p.z * 0.7);
              float h = surf(g, uTime);
              p.y += h;
              vH = h;
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
            }
          `,
          fragmentShader: /* glsl */ `
            precision mediump float;
            uniform vec3 uColor;
            uniform vec3 uGlow;
            varying float vH;
            varying vec2 vUv;
            void main() {
              float edge = smoothstep(0.0, 0.5, min(vUv.x, 1.0 - vUv.x))
                         * smoothstep(0.0, 0.5, min(vUv.y, 1.0 - vUv.y));
              float lift = clamp(vH * 0.9 + 0.35, 0.0, 1.0);
              vec3 col = mix(uColor, uGlow, lift * 0.7);
              float a = edge * (0.18 + 0.55 * lift);
              gl_FragColor = vec4(col, a);
            }
          `,
        });

        const mesh = new THREE.Mesh(geo, mat);
        scene.add(mesh);
        disposables.push(geo, mat);

        // Baseline grid floor for depth.
        const floorGeo = new THREE.PlaneGeometry(8, 5.2, 16, 10);
        floorGeo.rotateX(-Math.PI / 2);
        floorGeo.translate(0, -0.35, 0);
        const floorMat = new THREE.LineBasicMaterial({
          color: palette.axis,
          transparent: true,
          opacity: 0.18,
        });
        const floor = new THREE.LineSegments(
          new THREE.WireframeGeometry(floorGeo),
          floorMat,
        );
        scene.add(floor);
        disposables.push(floorGeo, floorMat, floor.geometry);

        let scrollBreath = 0;
        const onScroll = () => {
          const rect = mount.getBoundingClientRect();
          const vh = window.innerHeight || 1;
          const c = rect.top + rect.height / 2;
          scrollBreath = 1 - Math.min(1, Math.abs(c - vh / 2) / vh);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();

        const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
        const onMove = (e: PointerEvent) => {
          const r = mount.getBoundingClientRect();
          pointer.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
          pointer.ty = -(((e.clientY - r.top) / r.height) * 2 - 1);
        };
        if (interactive) window.addEventListener("pointermove", onMove);

        tick = (dt) => {
          uniforms.uTime.value += dt;
          uniforms.uBreathe.value += (scrollBreath - uniforms.uBreathe.value) * 0.05;
          pointer.x += (pointer.tx - pointer.x) * 0.05;
          pointer.y += (pointer.ty - pointer.y) * 0.05;
          mesh.rotation.y = 0.35 * Math.sin(uniforms.uTime.value * 0.12) + pointer.x * 0.25;
          mesh.rotation.x = -0.05 + pointer.y * 0.12;
          floor.rotation.y = mesh.rotation.y;
          floor.rotation.x = mesh.rotation.x;
        };

        cleanup = () => {
          window.removeEventListener("scroll", onScroll);
          if (interactive) window.removeEventListener("pointermove", onMove);
        };
      } else {
        // ---- Monte Carlo GBM path bundle ----
        camera.position.set(0, 0, 6);

        const isAccent = variant === "accent";
        const N = density ?? (isAccent ? 90 : 180); // paths
        const S = 220; // steps per path
        const spanX = isAccent ? 5.2 : 6.4;
        const startX = -spanX / 2;
        const dx = spanX / (S - 1);

        // Precompute GBM increments per path with different vols.
        const paths: Float32Array[] = [];
        const vols: number[] = [];
        const phases: number[] = [];
        for (let n = 0; n < N; n++) {
          const vol = 0.15 + Math.random() * 0.85;
          vols.push(vol);
          phases.push(Math.random() * Math.PI * 2);
          const arr = new Float32Array(S);
          // Box–Muller for a light Gaussian; drift 0, cumulative sum.
          let y = 0;
          for (let i = 0; i < S; i++) {
            const u1 = Math.max(1e-6, Math.random());
            const u2 = Math.random();
            const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
            // Variance grows with time -> fan out to the right.
            const t = i / (S - 1);
            y += z * vol * 0.06 * (0.35 + t);
            arr[i] = y;
          }
          paths.push(arr);
        }

        // Build one big LineSegments buffer: (S-1) segments per path.
        const segCount = N * (S - 1);
        const positions = new Float32Array(segCount * 2 * 3);
        const alphas = new Float32Array(segCount * 2);
        const speeds = new Float32Array(segCount * 2);
        let p = 0;
        let a = 0;
        for (let n = 0; n < N; n++) {
          const path = paths[n];
          const baseAlpha = 0.08 + Math.random() * 0.35;
          const spd = 0.15 + Math.random() * 0.75;
          for (let i = 0; i < S - 1; i++) {
            const x0 = startX + i * dx;
            const x1 = startX + (i + 1) * dx;
            positions[p++] = x0;
            positions[p++] = path[i];
            positions[p++] = (Math.random() - 0.5) * 0.4;
            positions[p++] = x1;
            positions[p++] = path[i + 1];
            positions[p++] = (Math.random() - 0.5) * 0.4;
            const t0 = i / (S - 1);
            const t1 = (i + 1) / (S - 1);
            alphas[a] = baseAlpha * (0.2 + 0.9 * t0);
            speeds[a++] = spd;
            alphas[a] = baseAlpha * (0.2 + 0.9 * t1);
            speeds[a++] = spd;
          }
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geo.setAttribute("aAlpha", new THREE.BufferAttribute(alphas, 1));
        geo.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));

        const uniforms = {
          uTime: { value: 0 },
          uColor: { value: new THREE.Color(palette.line) },
          uGlow: { value: new THREE.Color(palette.glow) },
          uPointer: { value: new THREE.Vector2(0, 0) },
          uForm: { value: 0.5 },
        };

        const mat = new THREE.ShaderMaterial({
          uniforms,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          vertexShader: /* glsl */ `
            attribute float aAlpha;
            attribute float aSpeed;
            uniform float uTime;
            uniform vec2 uPointer;
            uniform float uForm;
            varying float vAlpha;
            void main() {
              vec3 pos = position;
              // Gentle vertical breathing so paths feel alive.
              pos.y += sin(uTime * aSpeed + pos.x * 1.2) * 0.02;
              // Parallax to pointer, stronger to the right (more uncertainty).
              float tx = (pos.x + 3.2) / 6.4;
              pos.x += uPointer.x * 0.25 * tx;
              pos.y += uPointer.y * 0.18 * tx;
              // Sweep highlight travelling left->right.
              float sweep = fract(uTime * 0.12);
              float d = abs(fract((pos.x + 3.2) / 6.4 - sweep + 1.0) - 0.0);
              d = min(d, 1.0 - d);
              float glow = smoothstep(0.14, 0.0, d);
              vAlpha = aAlpha * (0.6 + 1.6 * glow) * (0.4 + 0.6 * uForm);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
          `,
          fragmentShader: /* glsl */ `
            precision mediump float;
            uniform vec3 uColor;
            uniform vec3 uGlow;
            varying float vAlpha;
            void main() {
              vec3 col = mix(uColor, uGlow, 0.35);
              gl_FragColor = vec4(col, vAlpha);
            }
          `,
        });

        const lines = new THREE.LineSegments(geo, mat);
        scene.add(lines);
        disposables.push(geo, mat);

        // Faint horizontal axis + ticks — printed-chart feel.
        const axisPts = [
          new THREE.Vector3(-spanX / 2, 0, 0),
          new THREE.Vector3(spanX / 2, 0, 0),
        ];
        const axisGeo = new THREE.BufferGeometry().setFromPoints(axisPts);
        const axisMat = new THREE.LineBasicMaterial({
          color: palette.axis,
          transparent: true,
          opacity: 0.28,
        });
        scene.add(new THREE.Line(axisGeo, axisMat));
        disposables.push(axisGeo, axisMat);

        // Tick marks.
        const tickPts: ThreeNS.Vector3[] = [];
        for (let i = 0; i <= 8; i++) {
          const x = -spanX / 2 + (i / 8) * spanX;
          tickPts.push(new THREE.Vector3(x, -0.06, 0));
          tickPts.push(new THREE.Vector3(x, 0.06, 0));
        }
        const tickGeo = new THREE.BufferGeometry().setFromPoints(tickPts);
        const tickMat = new THREE.LineBasicMaterial({
          color: palette.axis,
          transparent: true,
          opacity: 0.22,
        });
        scene.add(new THREE.LineSegments(tickGeo, tickMat));
        disposables.push(tickGeo, tickMat);

        const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
        const onMove = (e: PointerEvent) => {
          const r = mount.getBoundingClientRect();
          pointer.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
          pointer.ty = -(((e.clientY - r.top) / r.height) * 2 - 1);
        };
        if (interactive) window.addEventListener("pointermove", onMove);

        let scrollForm = 0.5;
        const onScroll = () => {
          const rect = mount.getBoundingClientRect();
          const vh = window.innerHeight || 1;
          const c = rect.top + rect.height / 2;
          const t = 1 - Math.min(1, Math.abs(c - vh / 2) / vh);
          scrollForm = 0.3 + t * 0.7;
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();

        tick = (dt) => {
          uniforms.uTime.value += dt;
          pointer.x += (pointer.tx - pointer.x) * 0.08;
          pointer.y += (pointer.ty - pointer.y) * 0.08;
          uniforms.uPointer.value.set(pointer.x, pointer.y);
          uniforms.uForm.value += (scrollForm - uniforms.uForm.value) * 0.04;
        };

        cleanup = () => {
          if (interactive) window.removeEventListener("pointermove", onMove);
          window.removeEventListener("scroll", onScroll);
        };
      }

      const onResize = () => {
        const w = mount.clientWidth || 1;
        const h = mount.clientHeight || 1;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
      };
      const ro = new ResizeObserver(onResize);
      ro.observe(mount);

      const clock = new THREE.Clock();
      let raf = 0;
      const loop = () => {
        const dt = clock.getDelta();
        tick(dt);
        renderer.render(scene, camera);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);

      const prevCleanup = cleanup;
      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        prevCleanup?.();
        for (const d of disposables) d.dispose();
        renderer.dispose();
        if (renderer.domElement.parentNode === mount) {
          mount.removeChild(renderer.domElement);
        }
      };
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [variant, density, interactive]);

  return <div ref={mountRef} className={className} aria-hidden />;
}

export default QuantCanvas;