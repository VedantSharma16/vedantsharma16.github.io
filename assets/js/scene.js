// ── THREE.JS ENHANCED SCENE (Cyberpunk/Grid Vibe) ───────────────
function initThreeScene() {
    try {
        var c = document.getElementById('acanvas');
        if (!c) return;

        // Setup Renderer
        var renderer = new THREE.WebGLRenderer({ canvas: c, alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Setup Scene & Camera
        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
        camera.position.z = 4.5;
        camera.position.y = 1;
        camera.lookAt(0, 0, 0);

        function rsz2() {
            var w = c.parentElement.clientWidth, h = c.parentElement.clientHeight;
            renderer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        }
        rsz2(); window.addEventListener('resize', rsz2);

        // ── CREATE IMMERSIVE ENVIRONMENT ──

        // 1. Core Polyhedron (Holo-Crystal)
        var coreGeo = new THREE.IcosahedronGeometry(1.2, 1);
        var coreMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff, wireframe: true, transparent: true, opacity: 0.15 });
        var core = new THREE.Mesh(coreGeo, coreMat);
        scene.add(core); // add core

        var coreSolidMat = new THREE.MeshBasicMaterial({ color: 0x020810, transparent: true, opacity: 0.8 });
        var coreSolid = new THREE.Mesh(coreGeo, coreSolidMat);
        coreSolid.scale.set(0.98, 0.98, 0.98);
        scene.add(coreSolid);

        // 2. Data Rings
        var ringGroup = new THREE.Group();
        for (let i = 0; i < 3; i++) {
            var ringGeo = new THREE.TorusGeometry(1.8 + (i * 0.3), 0.005, 16, 100);
            var color = i % 2 === 0 ? 0x00ff88 : 0x00f5ff;
            var ringMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.3 - (i * 0.05) });
            var ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI / 2;
            ring.rotation.y = (Math.PI / 6) * i;
            ringGroup.add(ring);
        }
        scene.add(ringGroup);

        // 3. Cyber Particles (Instanced Geometry for Performance)
        var particleCount = 800; // Increased for immersive feel but low impact via Points
        var pts = [];
        var colors = [];
        for (var i = 0; i < particleCount; i++) {
            // Spherical distribution with a hole in the middle
            var t = Math.random() * Math.PI * 2;
            var ph = Math.acos((Math.random() * 2) - 1);
            var r = 2.5 + Math.random() * 3.5;

            pts.push(r * Math.sin(ph) * Math.cos(t), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(t));

            // Alternate colors
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
            size: 0.03,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        var particles = new THREE.Points(pg, pm);
        scene.add(particles);

        // 4. Cyberspace Ground Grid
        var gridGeo = new THREE.PlaneGeometry(20, 20, 30, 30);
        var gridMat = new THREE.MeshBasicMaterial({
            color: 0x00f5ff,
            wireframe: true,
            transparent: true,
            opacity: 0.08
        });
        var grid = new THREE.Mesh(gridGeo, gridMat);
        grid.rotation.x = -Math.PI / 2;
        grid.position.y = -2;
        scene.add(grid);

        // ── ANIMATION & INTERACTION ──
        var clock = new THREE.Clock();
        var targetCamX = 0;
        var targetCamY = 1;

        (function render() {
            requestAnimationFrame(render);
            var delta = Math.min(clock.getDelta(), 0.1); // cap delta for stability
            var time = clock.getElapsedTime();

            // Rotate Elements
            core.rotation.y += 0.2 * delta;
            core.rotation.x += 0.1 * delta;
            coreSolid.rotation.copy(core.rotation);

            ringGroup.rotation.z -= 0.15 * delta;
            ringGroup.rotation.x = Math.sin(time * 0.5) * 0.2;

            particles.rotation.y += 0.05 * delta;

            // Ground grid undulating effect 
            grid.position.z = (time * 0.5) % (20 / 30);

            // Mouse interaction for Camera
            if (window.mx !== undefined && window.my !== undefined) {
                var normX = (window.mx / window.innerWidth) * 2 - 1;
                var normY = -(window.my / window.innerHeight) * 2 + 1;

                targetCamX = normX * 1.5;
                targetCamY = 1 + normY * 0.8;

                particles.rotation.x += normY * 0.001;
                particles.rotation.y += normX * 0.001;
            }

            // Smooth camera dampening
            camera.position.x += (targetCamX - camera.position.x) * (delta * 2);
            camera.position.y += (targetCamY - camera.position.y) * (delta * 2);
            camera.lookAt(0, 0, 0);

            renderer.render(scene, camera);
        })();

    } catch (e) { console.warn('Three.js initialization failed:', e); }
}

// Load Three.js dynamically and init
var s3 = document.createElement('script');
s3.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
s3.onload = initThreeScene;
s3.onerror = function () { console.warn('Three.js CDN failed - 3D scene disabled'); };
document.head.appendChild(s3);
