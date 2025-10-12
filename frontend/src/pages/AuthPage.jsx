import "../styles/auth.css";
import { SignInButton } from "@clerk/clerk-react";
import { useEffect, useRef } from "react";

const AuthPage = () => {
  const containerRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    let renderer, scene, camera, particles;
    let raycaster, intersects;
    let pointer, INTERSECTED;
    const PARTICLE_SIZE = 20;

    const init = async () => {
      if (!containerRef.current) return;

      try {
        const THREE = await import("three");
        const container = containerRef.current;

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(
          45,
          container.clientWidth / container.clientHeight,
          1,
          10000
        );
        camera.position.z = 250;

        // Box geometry as points
        let boxGeometry = new THREE.BoxGeometry(200, 200, 200, 16, 16, 16);
        boxGeometry.deleteAttribute("normal");
        boxGeometry.deleteAttribute("uv");

        const positionAttribute = boxGeometry.getAttribute("position");
        const colors = [];
        const sizes = [];
        const color = new THREE.Color();

        for (let i = 0, l = positionAttribute.count; i < l; i++) {
          const hue = 0.63 + 0.07 * (i / l);
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
          depthTest: true,
        });

        particles = new THREE.Points(geometry, material);
        scene.add(particles);

        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setClearColor(0x000000, 1);

        // IMPORTANT: Let clicks pass through to Clerk modal
        renderer.domElement.style.pointerEvents = "none";
        container.appendChild(renderer.domElement);

        raycaster = new THREE.Raycaster();
        pointer = new THREE.Vector2();

        // Use window for pointer moves so we can keep pointerEvents:none on canvas
        const onPointerMove = (event) => {
          const rect = container.getBoundingClientRect();
          pointer.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
          pointer.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;
        };

        const onWindowResize = () => {
          if (!container) return;
          camera.aspect = container.clientWidth / container.clientHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(container.clientWidth, container.clientHeight);
        };

        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("resize", onWindowResize);

        const animate = () => {
          animationRef.current = requestAnimationFrame(animate);

          particles.rotation.x += 0.0005;
          particles.rotation.y += 0.001;

          const attributes = particles.geometry.attributes;
          raycaster.setFromCamera(pointer, camera);
          intersects = raycaster.intersectObject(particles);

          if (intersects.length > 0) {
            if (INTERSECTED !== intersects[0].index) {
              if (INTERSECTED !== null) {
                attributes.size.array[INTERSECTED] = PARTICLE_SIZE * 0.55;
              }
              INTERSECTED = intersects[0].index;
              attributes.size.array[INTERSECTED] = PARTICLE_SIZE * 1.25;
              attributes.size.needsUpdate = true;
            }
          } else if (INTERSECTED !== null) {
            attributes.size.array[INTERSECTED] = PARTICLE_SIZE * 0.55;
            attributes.size.needsUpdate = true;
            INTERSECTED = null;
          }

          renderer.render(scene, camera);
        };

        animate();

        // Cleanup
        return () => {
          window.removeEventListener("pointermove", onPointerMove);
          window.removeEventListener("resize", onWindowResize);
          if (animationRef.current) cancelAnimationFrame(animationRef.current);
          if (renderer && container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement);
            renderer.dispose();
          }
        };
      } catch (error) {
        console.error("Failed to load Three.js:", error);
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div style="
              width: 100%;
              height: 100%;
              background: radial-gradient(circle, #1a1a2e 0%, #000000 100%);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 1rem;
              color: #6366f1;
            ">
              Interactive 3D Animation
            </div>
          `;
        }
      }
    };

    // Simple circle texture
    const createCircleTexture = (THREE) => {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d");
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, "rgba(255,255,255,1)");
      gradient.addColorStop(0.2, "rgba(255,255,255,1)");
      gradient.addColorStop(0.4, "rgba(255,255,255,0.8)");
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
      const texture = new THREE.Texture(canvas);
      texture.needsUpdate = true;
      return texture;
    };

    const cleanupPromise = init();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (cleanupPromise && typeof cleanupPromise.then === "function") {
        cleanupPromise.then((cleanupFn) => {
          if (typeof cleanupFn === "function") cleanupFn();
        });
      }
    };
  }, []);

  return (
    <div className="auth-page">
      {/* Three.js Background Animation */}
      <div ref={containerRef} className="threejs-background" />

      {/* Content Overlay */}
      <div className="auth-container">
        <div className="auth-left">
          <div className="auth-hero">
            <div className="brand-container">
              <div className="brand-logo" />
              <span className="brand-name">Byte Syntax</span>
            </div>

            <h1 className="hero-title">Where Work Happens ✨</h1>

            <p className="hero-subtitle">
              Connect with your team instantly through secure, real-time messaging. Experience
              seamless collaboration with powerful features designed for modern teams.
            </p>

            <div className="features-list">
              <div className="feature-item">
                <span className="feature-icon">💬</span>
                <span>Real-time messaging</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🎥</span>
                <span>Video calls & meetings</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📌</span>
                <span>Assign tasks and roles</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🔒</span>
                <span>Secure & private</span>
              </div>
            </div>

            {/* TIP: You can also pass appearance variables if you want */}
            <SignInButton mode="modal">
              <button className="cta-button" type="button">
                Get Started with Byte Syntax <span className="button-arrow">→</span>
              </button>
            </SignInButton>
          </div>
        </div>

        <div className="auth-right">{/* intentionally empty to reveal bg */}</div>
      </div>
    </div>
  );
};

export default AuthPage;
