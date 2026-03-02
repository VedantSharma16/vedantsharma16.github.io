// ── THREE.JS ENHANCED SCENE (Cyberpunk/Grid Vibe with GSAP) ───────────────
function initThreeScene() {
    try {
        var c = document.getElementById('bgc');
        if (!c) {
            console.warn('Canvas #bgc not found');
            return;
        }

        // Setup Renderer
        var renderer = new THREE.WebGLRenderer({ canvas: c, alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Setup Scene & Camera
        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);

        // Initial core camera position for Hero section
        camera.position.z = 5;
        camera.position.y = 0;
        camera.position.x = 0;
        camera.lookAt(0, 0, 0);

        function rsz2() {
            var w = window.innerWidth, h = window.innerHeight;
            renderer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        }
        rsz2(); window.addEventListener('resize', rsz2);

        // ── CREATE IMMERSIVE ENVIRONMENT ──

        var sceneGroup = new THREE.Group();
        scene.add(sceneGroup);

        // 1. Core Polyhedron (Holo-Crystal)
        var coreGeo = new THREE.IcosahedronGeometry(1.5, 1);
        var coreMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff, wireframe: true, transparent: true, opacity: 0.25 });
        var coreWire = new THREE.Mesh(coreGeo, coreMat);
        sceneGroup.add(coreWire);

        var coreSolidMat = new THREE.MeshBasicMaterial({ color: 0x020810, transparent: true, opacity: 0.95 });
        var coreSolid = new THREE.Mesh(coreGeo, coreSolidMat);
        coreSolid.scale.set(0.98, 0.98, 0.98);
        sceneGroup.add(coreSolid);

        // 2. Inner Energy Core
        var innerGeo = new THREE.OctahedronGeometry(0.8, 0);
        var innerMat = new THREE.MeshBasicMaterial({ color: 0x00ff88, wireframe: true });
        var innerCore = new THREE.Mesh(innerGeo, innerMat);
        sceneGroup.add(innerCore);

        // 3. Data Rings (Protection layer)
        var ringGroup = new THREE.Group();
        var rings = [];
        for (let i = 0; i < 4; i++) {
            var ringGeo = new THREE.TorusGeometry(2.2 + (i * 0.4), 0.01, 16, 100);
            var color = i % 2 === 0 ? 0x00ff88 : 0x00f5ff;
            var ringMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.4 - (i * 0.08) });
            var ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI / 2;
            ring.rotation.y = (Math.PI / 4) * i;
            ringGroup.add(ring);
            rings.push(ring);
        }
        sceneGroup.add(ringGroup);

        // 4. Cyber Particles (Environment Data)
        var particleCount = 1200;
        var pts = [];
        var colors = [];
        for (var i = 0; i < particleCount; i++) {
            var t = Math.random() * Math.PI * 2;
            var ph = Math.acos((Math.random() * 2) - 1);
            var r = 3 + Math.random() * 6;

            pts.push(r * Math.sin(ph) * Math.cos(t), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(t));

            if (Math.random() > 0.5) {
                colors.push(0, 0.96, 1); // 00f5ff
            } else {
                colors.push(0, 1, 0.53); // 00ff88
            }
        }
        var pg = new THREE.BufferGeometry();
        pg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
        pg.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        var pm = new THREE.PointsMaterial({
            size: 0.035,
            vertexColors: true,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending
        });
        var particles = new THREE.Points(pg, pm);
        scene.add(particles); // Global, outside of sceneGroup

        // 5. Cyberspace Ground Grid (Deep Architecture)
        var gridGeo = new THREE.PlaneGeometry(40, 40, 40, 40);
        var gridMat = new THREE.MeshBasicMaterial({
            color: 0x00f5ff,
            wireframe: true,
            transparent: true,
            opacity: 0.05
        });
        var grid = new THREE.Mesh(gridGeo, gridMat);
        grid.rotation.x = -Math.PI / 2;
        grid.position.y = -3.5;
        scene.add(grid);

        // ── GSAP SCROLLTRIGGER ANIMATIONS ──
        gsap.registerPlugin(ScrollTrigger);

        // Setup timeline linked to scroll
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: "body",
                start: "top top",
                end: "bottom bottom",
                scrub: 1.5 // Smooth scrubbing effect
            }
        });

        // Add section-based animations to the timeline
        // 1. Hero -> About
        tl.to(sceneGroup.position, { x: 2, y: -0.5, z: -1, ease: "power1.inOut" }, 0)
            .to(sceneGroup.scale, { x: 0.6, y: 0.6, z: 0.6, ease: "power1.inOut" }, 0)
            .to(camera.position, { y: 1 }, 0);

        // 2. About -> Skills (Explode/Spread layers)
        tl.to(sceneGroup.position, { x: 0, z: -2, ease: "power2.inOut" }, 0.25)
            .to(sceneGroup.scale, { x: 0.8, y: 0.8, z: 0.8, ease: "power2.inOut" }, 0.25)
            .to(ringGroup.scale, { x: 2.5, y: 2.5, z: 2.5, ease: "power2.out" }, 0.25)
            .to(innerCore.scale, { x: 1.5, y: 1.5, z: 1.5, ease: "power2.out" }, 0.25)
            .to(coreSolidMat, { opacity: 0.2 }, 0.25);

        // 3. Skills -> Experience/Projects (Deep Architecture)
        tl.to(sceneGroup.position, { z: -8, y: 3, ease: "power1.inOut" }, 0.5)
            .to(grid.position, { y: -1.5, ease: "power1.inOut" }, 0.5)
            .to(gridMat, { opacity: 0.15, ease: "power1.inOut" }, 0.5)
            .to(particles.scale, { x: 2, y: 2, z: 2, ease: "power1.inOut" }, 0.5);

        // 4. Projects -> Contact (Reassemble)
        tl.to(sceneGroup.position, { x: 0, y: 0, z: 0, ease: "power3.inOut" }, 0.75)
            .to(sceneGroup.scale, { x: 1, y: 1, z: 1, ease: "power3.inOut" }, 0.75)
            .to(ringGroup.scale, { x: 1, y: 1, z: 1, ease: "power3.inOut" }, 0.75)
            .to(innerCore.scale, { x: 1, y: 1, z: 1, ease: "power3.inOut" }, 0.75)
            .to(coreSolidMat, { opacity: 0.95 }, 0.75)
            .to(grid.position, { y: -3.5 }, 0.75)
            .to(gridMat, { opacity: 0.05 }, 0.75)
            .to(particles.scale, { x: 1, y: 1, z: 1, ease: "power1.inOut" }, 0.75)
            .to(camera.position, { y: 0 }, 0.75);


        // ── CONTINUOUS ANIMATION LOOP ──
        var clock = new THREE.Clock();
        var targetCamX = 0;
        var targetCamY = camera.position.y; // Base Y driven by GSAP

        (function render() {
            requestAnimationFrame(render);
            var delta = Math.min(clock.getDelta(), 0.1);
            var time = clock.getElapsedTime();

            // Rotate Elements (Continuous independent of scroll)
            coreWire.rotation.y += 0.2 * delta;
            coreWire.rotation.x += 0.1 * delta;
            coreSolid.rotation.copy(coreWire.rotation);

            innerCore.rotation.y -= 0.5 * delta;
            innerCore.rotation.x -= 0.3 * delta;

            ringGroup.rotation.z -= 0.15 * delta;
            rings.forEach((r, i) => {
                r.rotation.y = (Math.PI / 4) * i + Math.sin(time * 0.5 + i) * 0.2;
            });

            particles.rotation.y += 0.05 * delta;

            // Ground grid undulating effect 
            grid.position.z = (time * 0.8) % (40 / 40);

            // Mouse interaction for Camera (Parallax)
            if (window.mx !== undefined && window.my !== undefined) {
                var normX = (window.mx / window.innerWidth) * 2 - 1;
                var normY = -(window.my / window.innerHeight) * 2 + 1;

                targetCamX = normX * 0.5;
                // Add mouse Y to base camera Y (which might be animated by GSAP)
                targetCamY = GSAPCameraBaseY() + normY * 0.3;

                particles.rotation.x += normY * 0.001;
                particles.rotation.y += normX * 0.001;
            } else {
                targetCamY = GSAPCameraBaseY();
            }

            // Smooth camera dampening
            camera.position.x += (targetCamX - camera.position.x) * (delta * 3);
            camera.position.y += (targetCamY - camera.position.y) * (delta * 3);
            camera.lookAt(0, 0, 0);

            renderer.render(scene, camera);
        })();

        // Helper to grab base Y animated position securely
        function GSAPCameraBaseY() {
            // Because GSAP might be animating camera.position.y, we only add a small offset
            // We use the raw .y but heavily dampen it back to center if mouse is inactive
            // To prevent conflicts, we let GSAP control camera.position.y and apply parallax to a group,
            // or just use a small offset like this:
            let computedY = 0;
            // In a more complex setup, we'd add camera to a group and parallax the group. 
            // For here, we'll let lookAt(0,0,0) handle the centering.
            return computedY;
        }

    } catch (e) { console.warn('Three.js initialization failed:', e); }
}

// Load Three.js dynamically and init
var s3 = document.createElement('script');
s3.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
s3.onload = initThreeScene;
s3.onerror = function () { console.warn('Three.js CDN failed - 3D scene disabled'); };
document.head.appendChild(s3);
