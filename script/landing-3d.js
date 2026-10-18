/**
 * Payoo 3D Cinematic Visual Engine
 * Powered by Three.js (WebGL)
 * Features:
 * - Interactive 3D Holographic Debit Card with dynamic canvas-embossed textures
 * - Flowing cyber energy particle wave (digital currency flow)
 * - Holographic orbital rings and floating 3D Taka (৳) tokens
 * - Autonomous cinematic camera paths (Orbit, Focus, Wave) with mouse parallax
 */

(() => {
  // Only execute on landing page
  const canvas = document.querySelector("#cinematic-canvas");
  if (!canvas) return;

  // Check WebGL availability
  const hasWebGL = (() => {
    try {
      const glCanvas = document.createElement("canvas");
      return !!(window.WebGLRenderingContext && (glCanvas.getContext("webgl") || glCanvas.getContext("experimental-webgl")));
    } catch {
      return false;
    }
  })();

  if (!hasWebGL || typeof THREE === "undefined") {
    console.warn("WebGL or Three.js not available; rendering CSS 3D fallback.");
    const container = document.querySelector("#cinematic-canvas-container");
    if (container) container.classList.add("has-fallback");
    return;
  }

  // Scene setup
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0e0c22, 0.045);

  const container = document.querySelector("#cinematic-canvas-container") || document.body;
  let width = window.innerWidth;
  let height = window.innerHeight;

  const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 100);
  camera.position.set(0, 0.5, 7.5);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  // Lighting
  const ambientLight = new THREE.AmbientLight(0x2c2459, 1.5);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0x9d8eff, 2.2);
  keyLight.position.set(6, 8, 6);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0x27e5b5, 1.8);
  rimLight.position.set(-6, -5, -4);
  scene.add(rimLight);

  const accentLight = new THREE.PointLight(0xff7766, 1.2, 25);
  accentLight.position.set(2, -2, 4);
  scene.add(accentLight);

  // Group for all floating card elements
  const cardGroup = new THREE.Group();
  scene.add(cardGroup);

  // Canvas-generated high-res card textures
  function createCardTexture(isBack = false) {
    const texCanvas = document.createElement("canvas");
    texCanvas.width = 1024;
    texCanvas.height = 640;
    const ctx = texCanvas.getContext("2d");

    // Rounded card background
    const gradient = ctx.createLinearGradient(0, 0, 1024, 640);
    if (!isBack) {
      gradient.addColorStop(0, "#2a1c72");
      gradient.addColorStop(0.5, "#432cb3");
      gradient.addColorStop(1, "#181438");
    } else {
      gradient.addColorStop(0, "#19153a");
      gradient.addColorStop(0.6, "#2e206b");
      gradient.addColorStop(1, "#15112e");
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 640);

    // Subtle holographic grid overlay
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    for (let x = 0; x < 1024; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 640);
      ctx.stroke();
    }
    for (let y = 0; y < 640; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }

    // Glowing curved wave accents
    const waveGrad = ctx.createLinearGradient(0, 0, 1024, 640);
    waveGrad.addColorStop(0, "rgba(105, 85, 246, 0.45)");
    waveGrad.addColorStop(0.5, "rgba(41, 223, 178, 0.35)");
    waveGrad.addColorStop(1, "transparent");
    ctx.fillStyle = waveGrad;
    ctx.beginPath();
    ctx.arc(880, 160, 420, 0, Math.PI * 2);
    ctx.fill();

    if (!isBack) {
      // Front of Card
      // Brand logo
      ctx.fillStyle = "#ffffff";
      ctx.font = "800 52px Manrope, sans-serif";
      ctx.fillText("pay", 70, 100);
      ctx.fillStyle = "#8d7eff";
      ctx.fillText("oo", 155, 100);

      // Card Type Badge
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      ctx.font = "700 22px 'DM Sans', sans-serif";
      ctx.fillText("PLATINUM DIGITAL", 70, 138);

      // Contactless wave icon
      ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(920, 95, 14, -Math.PI / 3, Math.PI / 3);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(920, 95, 24, -Math.PI / 3, Math.PI / 3);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(920, 95, 34, -Math.PI / 3, Math.PI / 3);
      ctx.stroke();

      // Metallic EMV Chip
      const chipGrad = ctx.createLinearGradient(70, 200, 170, 280);
      chipGrad.addColorStop(0, "#ffe082");
      chipGrad.addColorStop(0.5, "#ffd54f");
      chipGrad.addColorStop(1, "#ffb300");
      ctx.fillStyle = chipGrad;
      ctx.roundRect ? ctx.roundRect(70, 200, 105, 82, 12) : ctx.fillRect(70, 200, 105, 82);
      ctx.fill();

      // Chip internal circuit lines
      ctx.strokeStyle = "rgba(100, 60, 0, 0.35)";
      ctx.lineWidth = 2;
      ctx.strokeRect(82, 215, 81, 52);
      ctx.beginPath();
      ctx.moveTo(122, 200);
      ctx.lineTo(122, 282);
      ctx.moveTo(70, 241);
      ctx.lineTo(175, 241);
      ctx.stroke();

      // Holographic Taka (৳) emblem
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.font = "800 68px Manrope, sans-serif";
      ctx.fillText("৳", 900, 275);

      // Card Number
      ctx.fillStyle = "#ffffff";
      ctx.font = "600 38px 'DM Sans', monospace";
      ctx.letterSpacing = "6px";
      ctx.fillText("••••  ••••  ••••  9184", 70, 420);

      // Cardholder Details
      ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
      ctx.font = "700 18px 'DM Sans', sans-serif";
      ctx.fillText("CARDHOLDER", 70, 520);
      ctx.fillText("EXPIRES", 480, 520);

      ctx.fillStyle = "#ffffff";
      ctx.font = "700 28px 'DM Sans', sans-serif";
      ctx.fillText("SHIHAB ATAHAR", 70, 565);
      ctx.fillText("10 / 30", 480, 565);

      // Verified shield emblem
      ctx.fillStyle = "#29dfb2";
      ctx.font = "700 24px 'DM Sans', sans-serif";
      ctx.fillText("✓ VERIFIED WALLET", 730, 565);
    } else {
      // Back of Card
      // Magnetic stripe
      ctx.fillStyle = "#0c0a1a";
      ctx.fillRect(0, 70, 1024, 110);

      // Signature & CVV Panel
      ctx.fillStyle = "#eceaf8";
      ctx.fillRect(70, 240, 660, 75);

      ctx.fillStyle = "#1b1a33";
      ctx.font = "italic 700 26px 'DM Sans', cursive";
      ctx.fillText("Shihab Atahar", 90, 290);

      // CVV white box
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(740, 240, 120, 75);
      ctx.fillStyle = "#1b1a33";
      ctx.font = "700 30px 'DM Sans', monospace";
      ctx.fillText("742", 770, 290);

      // Support text
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.font = "500 18px 'DM Sans', sans-serif";
      ctx.fillText("For customer support, open the Payoo App or call +880 9600 000 000.", 70, 410);
      ctx.fillText("This card is secured with 256-bit client-side state encryption.", 70, 445);
      ctx.fillText("Issued for demonstration & portfolio testing purposes.", 70, 480);
    }

    const texture = new THREE.CanvasTexture(texCanvas);
    texture.anisotropy = 16;
    return texture;
  }

  // Create 3D Card Mesh
  const cardGeometry = new THREE.BoxGeometry(4.3, 2.7, 0.06);

  const frontTexture = createCardTexture(false);
  const backTexture = createCardTexture(true);

  const edgeMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x5643cf,
    metalness: 0.85,
    roughness: 0.2,
    clearcoat: 0.8
  });

  const frontMaterial = new THREE.MeshPhysicalMaterial({
    map: frontTexture,
    metalness: 0.55,
    roughness: 0.22,
    clearcoat: 0.85,
    clearcoatRoughness: 0.15,
    reflectivity: 0.85
  });

  const backMaterial = new THREE.MeshPhysicalMaterial({
    map: backTexture,
    metalness: 0.55,
    roughness: 0.25,
    clearcoat: 0.85,
    clearcoatRoughness: 0.15
  });

  // Box materials order: right, left, top, bottom, front, back
  const cardMaterials = [
    edgeMaterial,
    edgeMaterial,
    edgeMaterial,
    edgeMaterial,
    frontMaterial,
    backMaterial
  ];

  const cardMesh = new THREE.Mesh(cardGeometry, cardMaterials);
  cardGroup.add(cardMesh);

  // Holographic Orbital Rings
  const ring1Geom = new THREE.TorusGeometry(3.6, 0.02, 16, 120);
  const ring1Mat = new THREE.MeshBasicMaterial({
    color: 0x6955f6,
    transparent: true,
    opacity: 0.65
  });
  const ring1 = new THREE.Mesh(ring1Geom, ring1Mat);
  ring1.rotation.x = Math.PI / 2.8;
  cardGroup.add(ring1);

  const ring2Geom = new THREE.TorusGeometry(4.2, 0.015, 16, 120);
  const ring2Mat = new THREE.MeshBasicMaterial({
    color: 0x29dfb2,
    transparent: true,
    opacity: 0.5
  });
  const ring2 = new THREE.Mesh(ring2Geom, ring2Mat);
  ring2.rotation.x = Math.PI / 1.7;
  ring2.rotation.y = Math.PI / 4;
  cardGroup.add(ring2);

  // Floating Currency Coin Tokens
  function createToken(symbol = "৳", color = 0x8d7eff) {
    const tokenCanvas = document.createElement("canvas");
    tokenCanvas.width = 256;
    tokenCanvas.height = 256;
    const tCtx = tokenCanvas.getContext("2d");

    tCtx.fillStyle = "#251b5c";
    tCtx.beginPath();
    tCtx.arc(128, 128, 124, 0, Math.PI * 2);
    tCtx.fill();

    tCtx.strokeStyle = "#4cd5ae";
    tCtx.lineWidth = 10;
    tCtx.stroke();

    tCtx.fillStyle = "#ffffff";
    tCtx.font = "800 130px Manrope, sans-serif";
    tCtx.textAlign = "center";
    tCtx.textBaseline = "middle";
    tCtx.fillText(symbol, 128, 135);

    const texture = new THREE.CanvasTexture(tokenCanvas);
    const geom = new THREE.CylinderGeometry(0.5, 0.5, 0.08, 32);
    const mat = new THREE.MeshPhysicalMaterial({
      map: texture,
      color: 0xffffff,
      metalness: 0.7,
      roughness: 0.25,
      clearcoat: 0.6
    });
    return new THREE.Mesh(geom, mat);
  }

  const token1 = createToken("৳");
  token1.position.set(-3.2, 1.8, -1);
  scene.add(token1);

  const token2 = createToken("✦", 0x29dfb2);
  token2.position.set(3.4, -1.6, -0.5);
  token2.scale.set(0.75, 0.75, 0.75);
  scene.add(token2);

  // Undulating Cyber Particle Wave
  const waveColumns = 45;
  const waveRows = 35;
  const particleCount = waveColumns * waveRows;

  const particleGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  const color1 = new THREE.Color(0x6955f6); // Violet
  const color2 = new THREE.Color(0x29dfb2); // Mint

  let pIndex = 0;
  for (let ix = 0; ix < waveColumns; ix++) {
    for (let iy = 0; iy < waveRows; iy++) {
      const u = ix / waveColumns;
      const v = iy / waveRows;
      const x = (u - 0.5) * 26;
      const z = (v - 0.5) * 20 - 2;
      const y = -3.2;

      positions[pIndex * 3] = x;
      positions[pIndex * 3 + 1] = y;
      positions[pIndex * 3 + 2] = z;

      const lerpedColor = color1.clone().lerp(color2, u);
      colors[pIndex * 3] = lerpedColor.r;
      colors[pIndex * 3 + 1] = lerpedColor.g;
      colors[pIndex * 3 + 2] = lerpedColor.b;

      pIndex++;
    }
  }

  particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const particleMaterial = new THREE.PointsMaterial({
    size: 0.11,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending
  });

  const particleField = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particleField);

  // Mouse & Cinematic Camera State
  let mouseX = 0;
  let mouseY = 0;
  let targetRotationX = 0;
  let targetRotationY = 0;
  let isDragging = false;
  let prevMouseX = 0;
  let prevMouseY = 0;

  // Camera presets
  let cameraMode = "orbit"; // "orbit" | "focus" | "wave"
  const cameraTargets = {
    orbit: { x: 0, y: 0.3, z: 7.2, lookX: 0, lookY: 0, lookZ: 0 },
    focus: { x: 0, y: 0.1, z: 5.1, lookX: 0, lookY: 0, lookZ: 0 },
    wave: { x: 0, y: -1.6, z: 6.8, lookX: 0, lookY: -0.8, lookZ: 0 }
  };

  // Mouse move handler
  window.addEventListener("mousemove", (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;

    if (isDragging) {
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      cardGroup.rotation.y += deltaX * 0.008;
      cardGroup.rotation.x += deltaY * 0.008;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    }
  });

  // Drag interaction to spin card
  window.addEventListener("mousedown", (e) => {
    // Only drag when clicking canvas background, not forms/buttons
    if (e.target.closest("button, a, input, form, select, label, .auth-card")) return;
    isDragging = true;
    prevMouseX = e.clientX;
    prevMouseY = e.clientY;
  });

  window.addEventListener("mouseup", () => {
    isDragging = false;
  });

  // Mobile Device Orientation / Gyroscope tilt support
  window.addEventListener("deviceorientation", (e) => {
    if (e.gamma !== null && e.beta !== null) {
      mouseX = Math.max(-1, Math.min(1, e.gamma / 30));
      mouseY = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
    }
  });

  // Camera mode buttons on landing page
  document.querySelectorAll("[data-cam]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-cam]").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      cameraMode = btn.dataset.cam || "orbit";
    });
  });

  // Resize handler
  window.addEventListener("resize", () => {
    width = window.innerWidth;
    height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });

  // Main Cinematic Render Loop
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // 1. Floating card animation
    if (!isDragging) {
      // Gentle levitation oscillation
      cardGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.18;

      // Parallax mouse tilt
      targetRotationY = mouseX * 0.45;
      targetRotationX = -mouseY * 0.35;

      cardGroup.rotation.y += (targetRotationY - cardGroup.rotation.y) * 0.06;
      cardGroup.rotation.x += (targetRotationX - cardGroup.rotation.x) * 0.06;
      cardGroup.rotation.z = Math.sin(elapsedTime * 0.8) * 0.04;
    }

    // 2. Orbital rings rotation
    ring1.rotation.z += 0.007;
    ring2.rotation.z -= 0.009;

    // 3. Tumbling token coins
    token1.rotation.y += 0.015;
    token1.rotation.x = Math.sin(elapsedTime * 1.2) * 0.3;
    token1.position.y = 1.8 + Math.sin(elapsedTime * 1.3) * 0.2;

    token2.rotation.y -= 0.018;
    token2.rotation.z = Math.cos(elapsedTime * 1.4) * 0.25;
    token2.position.y = -1.6 + Math.cos(elapsedTime * 1.5) * 0.15;

    // 4. Undulating Cyber Wave
    const posAttr = particleGeometry.attributes.position;
    let idx = 0;
    for (let ix = 0; ix < waveColumns; ix++) {
      for (let iy = 0; iy < waveRows; iy++) {
        const u = ix / waveColumns;
        const v = iy / waveRows;
        const waveHeight =
          Math.sin(u * 7 + elapsedTime * 1.8) * 0.4 +
          Math.cos(v * 6 + elapsedTime * 1.4) * 0.35 +
          Math.sin((u + v) * 5 + elapsedTime) * 0.25;

        posAttr.setY(idx, -3.2 + waveHeight);
        idx++;
      }
    }
    posAttr.needsUpdate = true;

    // 5. Cinematic Autonomous Camera Moves
    const preset = cameraTargets[cameraMode] || cameraTargets.orbit;

    let targetCamX = preset.x;
    let targetCamY = preset.y;
    let targetCamZ = preset.z;

    if (cameraMode === "orbit") {
      // Cinematic slow breathing dolly
      targetCamX = preset.x + Math.sin(elapsedTime * 0.3) * 1.2 + mouseX * 0.8;
      targetCamY = preset.y + Math.cos(elapsedTime * 0.25) * 0.4 + mouseY * 0.5;
      targetCamZ = preset.z + Math.sin(elapsedTime * 0.2) * 0.6;
    } else if (cameraMode === "focus") {
      targetCamX = mouseX * 0.6;
      targetCamY = mouseY * 0.4;
    } else if (cameraMode === "wave") {
      targetCamX = Math.sin(elapsedTime * 0.4) * 1.8;
      targetCamY = preset.y + Math.cos(elapsedTime * 0.3) * 0.2;
    }

    // Smooth camera lerp
    camera.position.x += (targetCamX - camera.position.x) * 0.04;
    camera.position.y += (targetCamY - camera.position.y) * 0.04;
    camera.position.z += (targetCamZ - camera.position.z) * 0.04;
    camera.lookAt(preset.lookX, preset.lookY, preset.lookZ);

    // Accent light pulse
    accentLight.intensity = 1.0 + Math.sin(elapsedTime * 2.2) * 0.4;

    renderer.render(scene, camera);
  }

  animate();
})();
