import { useEffect, useRef } from "react";

const ThreeBackground = ({ className = "" }) => {
  const containerRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    let renderer;
    let scene;
    let camera;
    let particles;
    let raycaster;
    let pointer;
    let intersects;
    let INTERSECTED = null;

    const PARTICLE_SIZE = 20;

    const cleanupState = () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }

      if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss?.();
        renderer.domElement?.remove();
        renderer = null;
      }

      if (scene) {
        scene.traverse((object) => {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((material) => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
        scene = null;
      }
    };

    const getDimensions = (container) => {
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;

      return { width, height };
    };

    const createCircleTexture = (THREE) => {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;

      const context = canvas.getContext("2d");
      const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, "rgba(255,255,255,1)");
      gradient.addColorStop(0.2, "rgba(255,255,255,1)");
      gradient.addColorStop(0.4, "rgba(255,255,255,0.8)");
      gradient.addColorStop(1, "rgba(255,255,255,0)");

      context.fillStyle = gradient;
      context.fillRect(0, 0, 64, 64);

      const texture = new THREE.Texture(canvas);
      texture.needsUpdate = true;
      return texture;
    };

    const init = async () => {
      if (!containerRef.current) return;

      try {
        const THREE = await import("three");
        const container = containerRef.current;
        const { width, height } = getDimensions(container);

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
        camera.position.z = 250;

        const boxGeometry = new THREE.BoxGeometry(200, 200, 200, 16, 16, 16);
        boxGeometry.deleteAttribute("normal");
        boxGeometry.deleteAttribute("uv");

        const positionAttribute = boxGeometry.getAttribute("position");
        const colors = [];
        const sizes = [];
        const color = new THREE.Color();

        for (let i = 0, l = positionAttribute.count; i < l; i += 1) {
          const hue = 0.63 + (0.07 * i) / l;
          color.setHSL(hue, 0.9, 0.6);
          color.toArray(colors, i * 3);
          sizes[i] = PARTICLE_SIZE * 0.55;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", positionAttribute);
        geometry.setAttribute("customColor", new THREE.Float32BufferAttribute(colors, 3));
        geometry.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1));

        const material = new THREE.ShaderMaterial({
          uniforms: {
            color: { value: new THREE.Color(0xffffff) },
            pointTexture: { value: createCircleTexture(THREE) },
            alphaTest: { value: 0.9 },
          },
          vertexShader: `
            attribute float size;
            attribute vec3 customColor;
            varying vec3 vColor;

            void main() {
              vColor = customColor;
              vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
              gl_PointSize = size * (300.0 / -mvPosition.z);
              gl_Position = projectionMatrix * mvPosition;
            }
          `,
          fragmentShader: `
            uniform vec3 color;
            uniform sampler2D pointTexture;
            uniform float alphaTest;
            varying vec3 vColor;

            void main() {
              gl_FragColor = vec4(color * vColor, 1.0);
              gl_FragColor = gl_FragColor * texture2D(pointTexture, gl_PointCoord);
              if (gl_FragColor.a < alphaTest) discard;
            }
          `,
          transparent: true,
          depthWrite: false,
        });

        particles = new THREE.Points(geometry, material);
        scene.add(particles);

        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(width, height);
        renderer.setClearColor(0x000000, 0);

        const canvas = renderer.domElement;
        canvas.style.pointerEvents = "none";
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.display = "block";

        container.appendChild(canvas);

        raycaster = new THREE.Raycaster();
        pointer = new THREE.Vector2();

        const onPointerMove = (event) => {
          if (!container) return;
          const rect = container.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return;

          pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
          pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        };

        const onWindowResize = () => {
          if (!camera || !renderer || !container) return;
          const { width: newWidth, height: newHeight } = getDimensions(container);

          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);
        };

        container.addEventListener("pointermove", onPointerMove, { passive: true });
        window.addEventListener("resize", onWindowResize);

        const animate = () => {
          if (!particles || !renderer || !scene || !camera) return;

          animationRef.current = requestAnimationFrame(animate);

          particles.rotation.x += 0.0005;
          particles.rotation.y += 0.001;

          const geometryAttributes = particles.geometry.attributes;

          if (pointer && raycaster) {
            raycaster.setFromCamera(pointer, camera);
            intersects = raycaster.intersectObject(particles);

            if (intersects.length > 0) {
              if (INTERSECTED !== intersects[0].index) {
                if (INTERSECTED !== null) {
                  geometryAttributes.size.array[INTERSECTED] = PARTICLE_SIZE * 0.55;
                }
                INTERSECTED = intersects[0].index;
                geometryAttributes.size.array[INTERSECTED] = PARTICLE_SIZE * 1.25;
                geometryAttributes.size.needsUpdate = true;
              }
            } else if (INTERSECTED !== null) {
              geometryAttributes.size.array[INTERSECTED] = PARTICLE_SIZE * 0.55;
              geometryAttributes.size.needsUpdate = true;
              INTERSECTED = null;
            }
          }

          renderer.render(scene, camera);
        };

        animate();

        return () => {
          container.removeEventListener("pointermove", onPointerMove);
          window.removeEventListener("resize", onWindowResize);
        };
      } catch (error) {
        console.error("Failed to initialize Three.js background:", error);
        cleanupState();
      }
    };

    let removeListeners = () => {};

    init().then((cleanupListeners) => {
      if (typeof cleanupListeners === "function") {
        removeListeners = cleanupListeners;
      }
    });

    return () => {
      removeListeners();
      cleanupState();
    };
  }, []);

  return <div ref={containerRef} className={`threejs-background ${className}`.trim()} />;
};

export default ThreeBackground;