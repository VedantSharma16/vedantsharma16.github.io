// ── THREE.JS ELEGANT GLOBAL NODE NETWORK ───────────────
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
        renderer.toneMapping = THREE.ACESFilmicToneMapping; // Elegant tone mapping
        renderer.toneMappingExposure = 1.0;

        // Setup Scene & Camera
        var scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x0B1120, 0.03); // Match new --bg-base

        var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.z = 8;
        camera.position.y = 0;
        camera.position.x = 0;
        camera.lookAt(0, 0, 0);

        // ── POST-PROCESSING (More subtle bloom) ──
        var composer = new THREE.EffectComposer(renderer);
        var renderPass = new THREE.RenderPass(scene, camera);
        renderPass.clearColor = new THREE.Color(0, 0, 0);
        renderPass.clearAlpha = 0;
        composer.addPass(renderPass);

        var bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
        bloomPass.threshold = 0.5; // Higher threshold means only brightest elements bloom
        bloomPass.strength = 0.8; // Calmer glow
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

        // ── SCENE ELEMENTS: DATA SPHERE ──
        var sceneGroup = new THREE.Group();
        scene.add(sceneGroup);

        // 1. Particle Nodes
        var particleCount = 600;
        var nodeGeometry = new THREE.BufferGeometry();
        var nodePositions = new Float32Array(particleCount * 3);
        var basePositions = new Float32Array(particleCount * 3);
        
        var R = 4.5; // Radius of sphere
        for(let i=0; i<particleCount; i++) {
            // Distribute points evenly on sphere using Fibonacci sphere algorithm
            var phi = Math.acos(1 - 2 * (i + 0.5) / particleCount);
            var theta = Math.PI * (1 + Math.sqrt(5)) * i;
            
            nodePositions[i*3] = R * Math.cos(theta) * Math.sin(phi);
            nodePositions[i*3+1] = R * Math.cos(phi);
            nodePositions[i*3+2] = R * Math.sin(theta) * Math.sin(phi);
            
            basePositions[i*3] = nodePositions[i*3];
            basePositions[i*3+1] = nodePositions[i*3+1];
            basePositions[i*3+2] = nodePositions[i*3+2];
        }
        
        nodeGeometry.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
        
        // Use a glowing material for points
        var particleMaterial = new THREE.PointsMaterial({
            color: 0x0EA5E9, // cyan accent
            size: 0.08,
            transparent: true,
            opacity: 0.8,
            map: createCircleTexture(),
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        var nodes = new THREE.Points(nodeGeometry, particleMaterial);
        sceneGroup.add(nodes);

        // 2. Connecting Lines
        var lineMaterial = new THREE.LineBasicMaterial({
            color: 0x10B981, // emerald accent
            transparent: true,
            opacity: 0.15,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        var lineGeometry = new THREE.BufferGeometry();
        var MAX_LINES = 1500;
        var linePositions = new Float32Array(MAX_LINES * 6); // 2 points per line
        var lineColors = new Float32Array(MAX_LINES * 6);
        lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3).setUsage(THREE.DynamicDrawUsage));
        
        var lines = new THREE.LineSegments(lineGeometry, lineMaterial);
        sceneGroup.add(lines);

        // 3. Foreground 3D Entities (Threat Vectors)
        var fgGroup = new THREE.Group();
        scene.add(fgGroup);
        
        var shapeGeo = new THREE.OctahedronGeometry(0.15, 0);
        var shapeMat = new THREE.MeshBasicMaterial({ color: 0x0EA5E9, wireframe: true, transparent: true, opacity: 0.15 });
        var shards = [];
        for(let j=0; j<40; j++) {
            let mesh = new THREE.Mesh(shapeGeo, shapeMat);
            mesh.position.set(
              (Math.random() - 0.5) * 16,
              (Math.random() - 0.5) * 16,
              Math.random() * 4 + 3 // Very close to camera
            );
            mesh.rotation.set(Math.random(), Math.random(), Math.random());
            let speed = {
              x: (Math.random() - 0.5) * 0.01,
              y: (Math.random() - 0.5) * 0.01,
              rx: (Math.random() - 0.5) * 0.04,
              ry: (Math.random() - 0.5) * 0.04
            };
            fgGroup.add(mesh);
            shards.push({ mesh, speed });
        }

        // Helper to make points look like glowing circles
        function createCircleTexture() {
            var canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            var ctx = canvas.getContext('2d');
            ctx.beginPath();
            ctx.arc(32, 32, 28, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            var tex = new THREE.Texture(canvas);
            tex.needsUpdate = true;
            return tex;
        }

        // Move scene slightly to the right for Hero section balance
        sceneGroup.position.x = 2;

        // ── GSAP SCROLL ORCHESTRATION ──
        gsap.registerPlugin(ScrollTrigger);

        // Create a seamless scroll narrative for the 3D scene
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: "body",
                start: "top top",
                end: "bottom bottom",
                scrub: 1.5 // Smooth scrubbing
            }
        });

        // About: rotate and shift left
        tl.to(sceneGroup.position, { x: -3, y: -1, z: 2, ease: "power1.inOut" }, 0.1)
          .to(sceneGroup.rotation, { x: 0.5, y: -1.0, ease: "power1.inOut" }, 0.1);

        // Skills: bring center and scale down slightly
        tl.to(sceneGroup.position, { x: 0, y: 0, z: -2, ease: "power2.inOut" }, 0.3)
          .to(sceneGroup.rotation, { x: -0.2, y: 0.5, ease: "power2.inOut" }, 0.3);

        // Experience & Projects: shift right and deep
        tl.to(sceneGroup.position, { x: 3, y: 2, z: -6, ease: "power1.inOut" }, 0.6)
          .to(sceneGroup.rotation, { x: 0.8, y: 1.5, ease: "power1.inOut" }, 0.6);

        // Contact: Center and huge
        tl.to(sceneGroup.position, { x: 0, y: 0, z: 2, ease: "power3.inOut" }, 0.8)
          .to(sceneGroup.rotation, { x: 0, y: 3.14, ease: "power3.inOut" }, 0.8);

        // ── MOUSE PARALLAX ──
        var mouseX = 0;
        var mouseY = 0;
        var targetX = 0;
        var targetY = 0;
        
        var prevMouseX = 0, prevMouseY = 0;
        var impulse = 0;

        document.addEventListener('mousemove', function(e) {
            mouseX = (e.clientX - window.innerWidth / 2) * 0.001;
            mouseY = (e.clientY - window.innerHeight / 2) * 0.001;
            
            // Calculate velocity for interactivity
            let dx = mouseX - prevMouseX;
            let dy = mouseY - prevMouseY;
            impulse += Math.sqrt(dx*dx + dy*dy) * 3;
            if (impulse > 1.5) impulse = 1.5;
            
            prevMouseX = mouseX;
            prevMouseY = mouseY;
        });

        // Click to generate strong impulse
        document.addEventListener('mousedown', () => { impulse = 1.5; });

        // ── ANIMATION LOOP ──
        var clock = new THREE.Clock();

        function render() {
            requestAnimationFrame(render);
            var delta = clock.getDelta();
            var time = clock.getElapsedTime();

            impulse *= 0.96; // Smooth decay
            // Gentle continuous rotation + Reactivity
            sceneGroup.rotation.y += delta * (0.05 + impulse * 0.3);
            sceneGroup.rotation.x += delta * (0.02 + impulse * 0.2);

            // Mouse parallax application
            targetX = mouseX * 2;
            targetY = mouseY * 2;
            camera.position.x += (targetX - camera.position.x) * delta * 2;
            camera.position.y += (-targetY - camera.position.y) * delta * 2;
            camera.lookAt(scene.position);

            // Dynamic Node connections
            var pos = nodes.geometry.attributes.position.array;
            
            // Subtle "breathing" motion for base nodes
            var waveAmp = 0.1 + (impulse * 0.2);
            for(let i=0; i<particleCount; i++) {
                var wave = Math.sin(time * 0.5 + i) * 0.2;
                pos[i*3] = basePositions[i*3] + basePositions[i*3] * wave * waveAmp;
                pos[i*3+1] = basePositions[i*3+1] + basePositions[i*3+1] * wave * waveAmp;
                pos[i*3+2] = basePositions[i*3+2] + basePositions[i*3+2] * wave * waveAmp;
            }
            
            // Shard Animation
            shards.forEach(s => {
                s.mesh.position.x += s.speed.x + (mouseX * 0.05);
                s.mesh.position.y += s.speed.y + (-mouseY * 0.05);
                s.mesh.rotation.x += s.speed.rx;
                s.mesh.rotation.y += s.speed.ry;
                if (s.mesh.position.x > 8) s.mesh.position.x = -8;
                if (s.mesh.position.x < -8) s.mesh.position.x = 8;
                if (s.mesh.position.y > 8) s.mesh.position.y = -8;
                if (s.mesh.position.y < -8) s.mesh.position.y = 8;
            });
            nodes.geometry.attributes.position.needsUpdate = true;

            // Calculate close nodes to draw lines
            var lineIdx = 0;
            var maxDistance = 1.3;
            
            for (let i = 0; i < particleCount; i++) {
                for (let j = i + 1; j < particleCount; j++) {
                    var dx = pos[i*3] - pos[j*3];
                    var dy = pos[i*3+1] - pos[j*3+1];
                    var dz = pos[i*3+2] - pos[j*3+2];
                    var distSq = dx*dx + dy*dy + dz*dz;

                    if (distSq < maxDistance * maxDistance) {
                        if(lineIdx < MAX_LINES) {
                            linePositions[lineIdx*6] = pos[i*3];
                            linePositions[lineIdx*6+1] = pos[i*3+1];
                            linePositions[lineIdx*6+2] = pos[i*3+2];
                            
                            linePositions[lineIdx*6+3] = pos[j*3];
                            linePositions[lineIdx*6+4] = pos[j*3+1];
                            linePositions[lineIdx*6+5] = pos[j*3+2];
                            lineIdx++;
                        }
                    }
                }
            }
            lines.geometry.setDrawRange(0, lineIdx * 2);
            lines.geometry.attributes.position.needsUpdate = true;

            composer.render();
        }

        render();

    } catch (e) { console.warn('Three.js Data Sphere initialization failed:', e); }
}

window.addEventListener('load', initThreeScene);
