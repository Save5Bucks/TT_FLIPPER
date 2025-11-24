// Coin 3D model and animation
class CoinFlip {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 2000);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: true });
        this.coin = null;
        this.isFlipping = false;
        this.lastResult = null;
        
        this.init();
    }

    init() {
        // Set up renderer with high pixel ratio for better quality
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(0x0a0a0a, 1); // Dark gray background
        
        // Set up camera - zoomed out very far for full view
        this.camera.position.set(0, 150, 800);
        this.camera.lookAt(0, 0, 0);
        
        // Add balanced lights - adjusted for metallic silver/gold appearance
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        this.scene.add(ambientLight);
        
        const frontLight = new THREE.DirectionalLight(0xffffff, 0.6);
        frontLight.position.set(3, 5, 10);
        frontLight.castShadow = true;
        frontLight.shadow.mapSize.width = 1024;
        frontLight.shadow.mapSize.height = 1024;
        this.scene.add(frontLight);
        
        const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
        backLight.position.set(0, 0, -10);
        this.scene.add(backLight);
        
        const topLight = new THREE.DirectionalLight(0xffffcc, 0.3);
        topLight.position.set(0, 10, 0);
        this.scene.add(topLight);
        
        const bottomLight = new THREE.DirectionalLight(0x8888ff, 0.2);
        bottomLight.position.set(0, -10, 0);
        this.scene.add(bottomLight);
        
        // Create coin
        this.createCoin();
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Start render loop
        this.animate();
    }

    createCoin() {
        // Load FBX model
        const loader = new THREE.FBXLoader();
        
        loader.load('assets/pound-coin-fbx/source/coin.fbx', (object) => {
            console.log('FBX loaded successfully:', object);
            this.coin = object;
            
            // Use 1:1 scale - actual size from FBX
            this.coin.scale.set(1, 1, 1);
            this.coin.position.set(0, 50, 0); // Raise coin up
            
            // Rotate 90 degrees on X axis to face camera
            this.coin.rotation.x = Math.PI / 2;
            this.coin.rotation.y = 0;
            this.coin.rotation.z = 0;
            
            // Preserve FBX materials and textures (including normal maps)
            this.coin.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    
                    // Keep original materials from FBX which include normal maps
                    // Change white/bright colors to silver and enhance metallic properties
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(mat => {
                                if (mat.isMeshStandardMaterial || mat.isMeshPhongMaterial) {
                                    // If material is white/bright, make it silver
                                    if (mat.color && (mat.color.r > 0.8 && mat.color.g > 0.8 && mat.color.b > 0.8)) {
                                        mat.color.setHex(0xc0c0c0); // Silver color
                                    }
                                    mat.metalness = Math.max(mat.metalness || 0, 0.8);
                                    mat.roughness = Math.min(mat.roughness || 1, 0.3);
                                }
                            });
                        } else {
                            if (child.material.isMeshStandardMaterial || child.material.isMeshPhongMaterial) {
                                // If material is white/bright, make it silver
                                if (child.material.color && (child.material.color.r > 0.8 && child.material.color.g > 0.8 && child.material.color.b > 0.8)) {
                                    child.material.color.setHex(0xc0c0c0); // Silver color
                                }
                                child.material.metalness = Math.max(child.material.metalness || 0, 0.8);
                                child.material.roughness = Math.min(child.material.roughness || 1, 0.3);
                            }
                        }
                    }
                }
            });
            
            this.scene.add(this.coin);
            
            // Add floor with streamer logo - scaled for 1:1 coin
            const textureLoader = new THREE.TextureLoader();
            const logoTexture = textureLoader.load('assets/streamer-logo.png');
            
            const floorGeometry = new THREE.PlaneGeometry(2400, 2400);
            const floorMaterial = new THREE.MeshStandardMaterial({
                color: 0x000000, // Pure black
                roughness: 0.8,
                metalness: 0.2
            });
            const floor = new THREE.Mesh(floorGeometry, floorMaterial);
            floor.rotation.x = -Math.PI / 2;
            floor.position.y = -250;
            floor.receiveShadow = true;
            this.scene.add(floor);
            
            // Add logo in center of floor
            const logoGeometry = new THREE.PlaneGeometry(500, 500);
            const logoMaterial = new THREE.MeshBasicMaterial({
                map: logoTexture,
                transparent: true,
                opacity: 0.7
            });
            const logo = new THREE.Mesh(logoGeometry, logoMaterial);
            logo.rotation.x = -Math.PI / 2;
            logo.position.y = -249; // Slightly above floor to avoid z-fighting
            this.scene.add(logo);
            
            // Enable shadows
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }, 
        // Progress callback
        (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        // Error callback
        (error) => {
            console.error('Error loading FBX:', error);
            // Fallback to procedural coin if FBX fails
            this.createProceduralCoin();
        });
    }
    
    createProceduralCoin() {
        // Fallback: Create procedural coin if FBX fails to load
        const geometry = new THREE.CylinderGeometry(1, 1, 0.1, 32);
        
        const wTexture = this.createTextTexture('W');
        const lTexture = this.createTextTexture('L');
        
        const sideMaterial = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            metalness: 0.8,
            roughness: 0.2,
            emissive: 0x886600,
            emissiveIntensity: 0.2
        });
        
        const wMaterial = new THREE.MeshStandardMaterial({
            map: wTexture,
            metalness: 0.8,
            roughness: 0.3,
            color: 0xffd700
        });
        
        const lMaterial = new THREE.MeshStandardMaterial({
            map: lTexture,
            metalness: 0.8,
            roughness: 0.3,
            color: 0xffd700
        });
        
        const materials = [sideMaterial, wMaterial, lMaterial];
        
        this.coin = new THREE.Mesh(geometry, materials);
        this.coin.rotation.x = Math.PI / 2;
        this.coin.rotation.z = Math.PI / 6;
        this.scene.add(this.coin);
        
        const shadowGeometry = new THREE.PlaneGeometry(3, 3);
        const shadowMaterial = new THREE.ShadowMaterial({ opacity: 0.5 });
        const shadowPlane = new THREE.Mesh(shadowGeometry, shadowMaterial);
        shadowPlane.rotation.x = -Math.PI / 2;
        shadowPlane.position.y = -1.5;
        shadowPlane.receiveShadow = true;
        this.scene.add(shadowPlane);
        
        this.coin.castShadow = true;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    createTextTexture(text) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Gold gradient background
        const gradient = ctx.createRadialGradient(256, 256, 100, 256, 256, 256);
        gradient.addColorStop(0, '#ffd700');
        gradient.addColorStop(0.5, '#ffed4e');
        gradient.addColorStop(1, '#d4af37');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);
        
        // Embossed text effect with offset shadows - more pronounced
        ctx.font = 'bold 320px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Deep shadow offset down-right for depth
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillText(text, 280, 280);
        
        // Medium shadow
        ctx.fillStyle = 'rgba(102, 68, 0, 0.9)';
        ctx.fillText(text, 270, 270);
        
        // Highlight offset up-left
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillText(text, 240, 240);
        
        // Main text - strong contrast
        ctx.fillStyle = '#996600';
        ctx.fillText(text, 256, 256);
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    flip(result) {
        if (this.isFlipping) return;
        
        this.isFlipping = true;
        this.lastResult = result;
        
        // Reset to base position first
        const baseRotation = Math.PI / 2; // Heads facing camera
        this.coin.rotation.x = baseRotation;
        
        const startRotationX = baseRotation;
        const startY = this.coin.position.y;
        const isWin = result === 'W';
        
        // We flip on X axis to rotate the coin vertically (traditional coin flip)
        // Random number of flips between 4-8
        const numFlips = Math.floor(Math.random() * 5) + 4;
        
        // Even rotations = return to heads (starting position)
        // Odd rotations = show tails (180 degrees from start)
        // If we want heads (W), use even number of half-rotations
        // If we want tails (L), use odd number of half-rotations
        let finalHalfRotations = numFlips * 2; // Convert to half rotations
        
        if (isWin) {
            // Want heads - make sure even number of half-rotations
            if (finalHalfRotations % 2 !== 0) finalHalfRotations += 1;
        } else {
            // Want tails - make sure odd number of half-rotations
            if (finalHalfRotations % 2 === 0) finalHalfRotations += 1;
        }
        
        const targetRotation = startRotationX + (Math.PI * finalHalfRotations);
        
        const duration = 3000; // 3 seconds
        const startTime = Date.now();
        const maxHeight = 100; // How high the coin goes
        
        const animateFlip = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            if (progress < 1) {
                // Smooth easing
                const easeProgress = 1 - Math.pow(1 - progress, 3);
                
                // Rotate on X axis (vertical flip)
                this.coin.rotation.x = startRotationX + (targetRotation - startRotationX) * easeProgress;
                
                // Arc motion in Y position
                const heightProgress = Math.sin(progress * Math.PI);
                this.coin.position.y = startY + heightProgress * maxHeight;
                
                requestAnimationFrame(animateFlip);
            } else {
                // Ensure exact final position
                this.coin.rotation.x = targetRotation;
                this.coin.position.y = startY;
                
                // Reset flipping state
                this.isFlipping = false;
            }
        };
        
        animateFlip();
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        // No idle rotation - coin stays still when not flipping
        
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
