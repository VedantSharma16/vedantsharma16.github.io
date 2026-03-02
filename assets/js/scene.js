// ── THREE.JS ENHANCED SCENE (Advanced PBR, Bloom & MagnoField Particles) ───────────────
function initThreeScene() {
    try {
        var c = document.getElementById('bgc');
        if (!c) {
            console.warn('Canvas #bgc not found');
            return;
        }

        // Setup Renderer
        var renderer = new THREE.WebGLRenderer({ canvas: c, alpha: true, antialias: true, powerPreference: "high-performance" });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ReinhardToneMapping;

        // Setup Scene & Camera
        var scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x020810, 0.04);

        var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);

        // Initial core camera position for Hero section
        camera.position.z = 6;
        camera.position.y = 0;
        camera.position.x = 0;
        camera.lookAt(0, 0, 0);

        // ── POST-PROCESSING (Unreal Bloom - "InfernoCore Reactor / Neon Glow") ──
        var composer = new THREE.EffectComposer(renderer);
        var renderPass = new THREE.RenderPass(scene, camera);
        renderPass.clearColor = new THREE.Color(0, 0, 0);
        renderPass.clearAlpha = 0;
        composer.addPass(renderPass);

        var bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
        bloomPass.threshold = 0.2;
        bloomPass.strength = 1.8;
        bloomPass.radius = 0.5;
        composer.addPass(bloomPass);

        function rsz2() {
            var w = window.innerWidth, h = window.innerHeight;
            renderer.setSize(w, h);
            composer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        }
        rsz2(); window.addEventListener('resize', rsz2);

        // ── LIGHTING ──
        var ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        scene.add(ambientLight);

        // Core dynamic light (Plasma Sheath Flow)
        var coreLight = new THREE.PointLight(0x00f5ff, 2, 20);
        scene.add(coreLight);

        var secondaryLight = new THREE.PointLight(0x00ff88, 1.5, 20);
        secondaryLight.position.set(3, 3, 3);
        scene.add(secondaryLight);

        // ── CREATE IMMERSIVE ENVIRONMENT ──
        var sceneGroup = new THREE.Group();
        scene.add(sceneGroup);

        // 1. Core Polyhedron (Holo-Crystal - Physical Material)
        var coreGeo = new THREE.IcosahedronGeometry(1.5, 1);
        var coreMat = new THREE.MeshPhysicalMaterial({
            color: 0x002233,
            emissive: 0x00f5ff,
            emissiveIntensity: 0.1,
            wireframe: true,
            transparent: true,
            opacity: 0.35,
            metalness: 0.9,
            roughness: 0.1
        });
        var coreWire = new THREE.Mesh(coreGeo, coreMat);
        sceneGroup.add(coreWire);

        var coreSolidMat = new THREE.MeshPhysicalMaterial({
            color: 0x01050a,
            metalness: 0.8,
            roughness: 0.2,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
            transparent: true,
            opacity: 0.95
        });
        var coreSolid = new THREE.Mesh(coreGeo, coreSolidMat);
        coreSolid.scale.set(0.98, 0.98, 0.98);
        sceneGroup.add(coreSolid);

        // 2. Inner Energy Core (InfernoCore Reactor)
        var innerGeo = new THREE.OctahedronGeometry(0.7, 1);
        var innerMat = new THREE.MeshStandardMaterial({
            color: 0x00ff88,
            emissive: 0x00ff88,
            emissiveIntensity: 2.5, // High emissive triggers bloom
            wireframe: true
        });
        var innerCore = new THREE.Mesh(innerGeo, innerMat);
        sceneGroup.add(innerCore);

        // 3. Data Rings (Plasma Sheath Flow)
        var ringGroup = new THREE.Group();
        var rings = [];
        for (let i = 0; i < 4; i++) {
            var ringGeo = new THREE.TorusGeometry(2.2 + (i * 0.4), 0.015, 16, 100);
            var color = i % 2 === 0 ? 0x00ff88 : 0x00f5ff;
            var ringMat = new THREE.MeshStandardMaterial({
                color: color,
                emissive: color,
                emissiveIntensity: 1.0 - (i * 0.15),
                transparent: true,
                opacity: 0.6 - (i * 0.1)
            });
            var ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI / 2;
            ring.rotation.y = (Math.PI / 4) * i;
            ringGroup.add(ring);
            rings.push(ring);
        }
        sceneGroup.add(ringGroup);

        // 4. Cyber Particles (MagnoField Particle Matrix & Fluid Dynamics)
        var particleCount = 2000;
        var pg = new THREE.BufferGeometry();
        var pts = new Float32Array(particleCount * 3);
        var basePts = new Float32Array(particleCount * 3);
        var colors = new Float32Array(particleCount * 3);
        var sizes = new Float32Array(particleCount);

        for (var i = 0; i < particleCount; i++) {
            var t = Math.random() * Math.PI * 2;
            var ph = Math.acos((Math.random() * 2) - 1);
            var r = 3 + Math.random() * 8;

            var x = r * Math.sin(ph) * Math.cos(t);
            var y = r * Math.cos(ph);
            var z = r * Math.sin(ph) * Math.sin(t);

            pts[i * 3] = x; pts[i * 3 + 1] = y; pts[i * 3 + 2] = z;
            basePts[i * 3] = x; basePts[i * 3 + 1] = y; basePts[i * 3 + 2] = z;

            var cType = Math.random();
            if (cType > 0.6) {
                colors[i * 3] = 0; colors[i * 3 + 1] = 0.96; colors[i * 3 + 2] = 1.0;
            } else if (cType > 0.2) {
                colors[i * 3] = 0; colors[i * 3 + 1] = 1.0; colors[i * 3 + 2] = 0.53;
            } else {
                colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.0; colors[i * 3 + 2] = 0.23;
            }
            sizes[i] = Math.random() * 2.5;
        }

        pg.setAttribute('position', new THREE.BufferAttribute(pts, 3));
        pg.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        pg.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        var pm = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                pixelRatio: { value: renderer.getPixelRatio() }
            },
            vertexShader: `
                uniform float time;
                uniform float pixelRatio;
                attribute float size;
                attribute vec3 color;
                varying vec3 vColor;
                void main() {
                    vColor = color;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * pixelRatio * (300.0 / -mvPosition.z) * (1.0 + 0.5 * sin(time * 2.0 + position.x));
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                void main() {
                    vec2 xy = gl_PointCoord.xy - vec2(0.5);
                    float ll = length(xy);
                    if (ll > 0.5) discard;
                    float strength = exp(-ll * 5.0);
                    gl_FragColor = vec4(vColor * strength * 1.5, strength);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        var particles = new THREE.Points(pg, pm);
        scene.add(particles);

        // 5. Cyberspace Ground Grid (ElectroPulse Grid)
        var gridGeo = new THREE.PlaneGeometry(50, 50, 40, 40);
        var gridMat = new THREE.MeshStandardMaterial({
            color: 0x00f5ff,
            emissive: 0x00aaff,
            emissiveIntensity: 0.5,
            wireframe: true,
            transparent: true,
            opacity: 0.1
        });
        var grid = new THREE.Mesh(gridGeo, gridMat);
        grid.rotation.x = -Math.PI / 2;
        grid.position.y = -3.5;
        scene.add(grid);

        // ── GSAP SCROLLTRIGGER ANIMATIONS ──
        gsap.registerPlugin(ScrollTrigger);

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: "body",
                start: "top top",
                end: "bottom bottom",
                scrub: 1.5
            }
        });

        tl.to(sceneGroup.position, { x: 2, y: -0.5, z: -1, ease: "power1.inOut" }, 0)
            .to(sceneGroup.scale, { x: 0.6, y: 0.6, z: 0.6, ease: "power1.inOut" }, 0)
            .to(camera.position, { y: 1 }, 0);

        tl.to(sceneGroup.position, { x: 0, z: -2, ease: "power2.inOut" }, 0.25)
            .to(sceneGroup.scale, { x: 0.8, y: 0.8, z: 0.8, ease: "power2.inOut" }, 0.25)
            .to(ringGroup.scale, { x: 3.5, y: 3.5, z: 3.5, ease: "power2.out" }, 0.25)
            .to(innerCore.scale, { x: 1.8, y: 1.8, z: 1.8, ease: "power2.out" }, 0.25)
            .to(coreSolidMat, { opacity: 0.1 }, 0.25)
            .to(bloomPass, { strength: 2.5, ease: "power1.in" }, 0.25);

        tl.to(sceneGroup.position, { z: -8, y: 3, ease: "power1.inOut" }, 0.5)
            .to(grid.position, { y: -1.5, ease: "power1.inOut" }, 0.5)
            .to(gridMat, { opacity: 0.3, emissiveIntensity: 1.5, ease: "power1.inOut" }, 0.5)
            .to(particles.scale, { x: 2.5, y: 2.5, z: 2.5, ease: "power1.inOut" }, 0.5)
            .to(bloomPass, { strength: 1.5, ease: "power1.out" }, 0.5);

        tl.to(sceneGroup.position, { x: 0, y: 0, z: 0, ease: "power3.inOut" }, 0.75)
            .to(sceneGroup.scale, { x: 1, y: 1, z: 1, ease: "power3.inOut" }, 0.75)
            .to(ringGroup.scale, { x: 1, y: 1, z: 1, ease: "power3.inOut" }, 0.75)
            .to(innerCore.scale, { x: 1, y: 1, z: 1, ease: "power3.inOut" }, 0.75)
            .to(coreSolidMat, { opacity: 0.95 }, 0.75)
            .to(grid.position, { y: -3.5 }, 0.75)
            .to(gridMat, { opacity: 0.1, emissiveIntensity: 0.5 }, 0.75)
            .to(particles.scale, { x: 1, y: 1, z: 1, ease: "power1.inOut" }, 0.75)
            .to(camera.position, { y: 0 }, 0.75)
            .to(bloomPass, { strength: 1.8 }, 0.75);

        // ── CONTINUOUS ANIMATION & PHYSICS LOOP ──
        var clock = new THREE.Clock();
        var targetCamX = 0;
        var targetCamY = camera.position.y;
        var raycaster = new THREE.Raycaster();
        var mouseProj = new THREE.Vector2();
        var planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

        function render() {
            requestAnimationFrame(render);
            var delta = Math.min(clock.getDelta(), 0.05);
            var time = clock.getElapsedTime();

            pm.uniforms.time.value = time;

            coreWire.rotation.y += 0.3 * delta;
            coreWire.rotation.x += 0.15 * delta;
            coreSolid.rotation.copy(coreWire.rotation);

            innerCore.rotation.y -= 1.5 * delta;
            innerCore.rotation.x -= 0.8 * delta;

            ringGroup.rotation.z -= 0.2 * delta;
            rings.forEach((r, idx) => {
                r.rotation.y = (Math.PI / 4) * idx + Math.sin(time * 0.5 + idx) * 0.3;
            });

            coreLight.position.x = Math.sin(time * 2) * 1.5;
            coreLight.position.z = Math.cos(time * 2) * 1.5;
            coreLight.intensity = 2 + Math.sin(time * 5) * 0.5;

            grid.position.z = (time * 1.2) % (50 / 40);

            var mX = 0, mY = 0;
            if (window.mx !== undefined && window.my !== undefined) {
                mX = (window.mx / window.innerWidth) * 2 - 1;
                mY = -(window.my / window.innerHeight) * 2 + 1;

                targetCamX = mX * 0.5;
                targetCamY = mY * 0.3;
                mouseProj.set(mX, mY);
            } else {
                targetCamY = 0;
            }

            raycaster.setFromCamera(mouseProj, camera);
            var mouse3D = new THREE.Vector3();
            raycaster.ray.intersectPlane(planeZ, mouse3D);

            var positions = pg.attributes.position.array;
            particles.rotation.y += 0.05 * delta;
            particles.rotation.x = Math.sin(time * 0.2) * 0.1;

            for (let i = 0; i < particleCount; i++) {
                let driftX = Math.sin(time * 0.5 + basePts[i * 3 + 1]) * 0.5;
                let driftY = Math.cos(time * 0.6 + basePts[i * 3]) * 0.5;
                let driftZ = Math.sin(time * 0.7 + basePts[i * 3 + 2]) * 0.5;

                let targetX = basePts[i * 3] + driftX;
                let targetY = basePts[i * 3 + 1] + driftY;
                let targetZ = basePts[i * 3 + 2] + driftZ;

                if (mouse3D) {
                    let pWorld = new THREE.Vector3(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
                    pWorld.applyMatrix4(particles.matrixWorld);

                    let dist = pWorld.distanceTo(mouse3D);
                    let influenceRadius = 3.0;

                    if (dist < influenceRadius) {
                        let pushStr = (influenceRadius - dist) / influenceRadius;
                        let pushDir = pWorld.clone().sub(mouse3D).normalize();
                        targetX += pushDir.x * pushStr * 2.0;
                        targetY += pushDir.y * pushStr * 2.0;
                        targetZ += pushDir.z * pushStr * 2.0;
                    }
                }

                positions[i * 3] += (targetX - positions[i * 3]) * delta * 5.0;
                positions[i * 3 + 1] += (targetY - positions[i * 3 + 1]) * delta * 5.0;
                positions[i * 3 + 2] += (targetZ - positions[i * 3 + 2]) * delta * 5.0;
            }
            pg.attributes.position.needsUpdate = true;

            camera.position.x += (targetCamX - camera.position.x) * (delta * 3);
            camera.position.y += (targetCamY - camera.position.y) * (delta * 3);
            camera.lookAt(0, 0, 0);

            composer.render(delta);
        }

        render();

    } catch (e) { console.warn('Three.js initialization failed:', e); }
}

window.addEventListener('load', initThreeScene);
