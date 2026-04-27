import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

const MagicOrbWebGL = () => {
    const mountRef = useRef(null);

    useEffect(() => {
        const width = 80;
        const height = 80;

        // 1. Scene Setup
        const scene = new THREE.Scene();

        // 2. Camera Setup
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.set(0, 0, 6);

        // 3. Renderer Setup
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setClearColor(0x000000, 0); // Прозрачный 
        
        // Settings strictly defined by user tuning
        const params = {
            primaryEnergy: '#00b3ff', 
            secondaryEnergy: '#2e9aff', 
            atmosphereGlow: 0.0, 
            atmosphereLevel: 1.0, 
            atmosphereScale: 1.093,
            speed: 0.5, 
            orbRotation: 0.89,
            density: 3.0, 
            chromaticAberration: 0.035,
            dpr: 2.0,
            internalAnim: 0.43, 
            smoothness: 0.088, 
            asymmetry: 0.55, 
            fractalIters: 5, 
            fractalScale: 0.78, 
            fractalDecay: -16.7
        };

        renderer.setPixelRatio(params.dpr);

        if (mountRef.current) {
            mountRef.current.appendChild(renderer.domElement);
        }

        const vertexShader = `
            varying vec3 vLocalPosition;
            varying vec3 vNormal;
            varying vec3 vViewPosition;

            void main() {
                vLocalPosition = position;
                vNormal = normalize(normalMatrix * normal);
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                vViewPosition = -mvPosition.xyz;
                gl_Position = projectionMatrix * mvPosition;
            }
        `;

        const fragmentShader = `
            uniform float uTime;
            uniform vec3 uLocalCamPos;
            uniform vec3 uPrimaryColor;
            uniform vec3 uSecondaryColor;
            uniform float uDensity;
            uniform float uFractalIters;
            uniform float uFractalScale;
            uniform float uFractalDecay;
            uniform float uInternalAnim;
            uniform float uSmoothness;
            uniform float uAsymmetry;
            
            varying vec3 vLocalPosition;
            varying vec3 vNormal;
            varying vec3 vViewPosition;

            float evaluateStructure(vec3 pos) {
                float densityAcc = 0.0;
                vec3 anchor = pos;
                
                float animTime = uTime * uInternalAnim;
                float s = sin(animTime);
                float c = cos(animTime);
                mat2 rotAnim = mat2(c, s, -s, c);

                float a = 0.5 * uAsymmetry;
                mat2 rotAsym1 = mat2(cos(a), sin(a), -sin(a), cos(a));
                float b = 0.3 * uAsymmetry;
                mat2 rotAsym2 = mat2(cos(b), sin(b), -sin(b), cos(b));
                
                for (int step = 0; step < 12; ++step) {
                    if (float(step) >= uFractalIters) break;
                    
                    pos.xy *= rotAnim;
                    pos.yz *= rotAnim;
                    pos.xz *= rotAsym1;
                    pos.yz *= rotAsym2;
                    pos += vec3(0.05, -0.02, 0.03) * uAsymmetry;
                    
                    vec3 foldedPos = sqrt(pos * pos + uSmoothness);
                    float magnitudeSq = dot(foldedPos, foldedPos);
                    magnitudeSq = max(magnitudeSq, 0.00001); 
                    pos = (uFractalScale * foldedPos / magnitudeSq) - uFractalScale;
                    
                    float ySq = pos.y * pos.y;
                    float zSq = pos.z * pos.z;
                    float yz2 = 2.0 * pos.y * pos.z;
                    pos.yz = vec2(ySq - zSq, yz2);
                    
                    pos = vec3(pos.z, pos.x, pos.y);
                    densityAcc += exp(uFractalDecay * abs(dot(pos, anchor)));
                }
                
                return densityAcc * 0.5;
            }

            vec2 getVolumeBounds(vec3 origin, vec3 dir, float radius) {
                float b = dot(origin, dir);
                float c = dot(origin, origin) - radius * radius;
                float discriminant = b * b - c;
                if (discriminant < 0.0) return vec2(-1.0);
                float root = sqrt(discriminant);
                return vec2(-b - root, -b + root);
            }

            vec3 traceEnergy(vec3 origin, vec3 dir, vec2 limits) {
                float currentDepth = limits.x;
                float marchStep = 0.02;
                vec3 finalEnergy = vec3(0.0);
                float fieldVal = 0.0;
                
                for(int i = 0; i < 64; i++) {
                    currentDepth += marchStep * exp(-2.0 * fieldVal);
                    if(currentDepth > limits.y) break;
                    
                    vec3 samplePoint = origin + currentDepth * dir;
                    fieldVal = evaluateStructure(samplePoint);
                    
                    float vSq = fieldVal * fieldVal;
                    float gradientBlend = smoothstep(0.0, 0.4, fieldVal);
                    vec3 currentGradient = mix(uSecondaryColor, uPrimaryColor, gradientBlend);
                    vec3 emission = currentGradient * (fieldVal * 1.8 + vSq * 1.0);
                    
                    finalEnergy = 0.99 * finalEnergy + (0.08 * uDensity) * emission;
                }
                return finalEnergy;
            }

            void main() {
                vec3 rayOrig = uLocalCamPos;
                vec3 rayDir = normalize(vLocalPosition - uLocalCamPos);
                
                float t = uTime * 0.1;
                float s = sin(t);
                float c = cos(t);
                mat2 rotXZ = mat2(c, s, -s, c);
                rayOrig.xz *= rotXZ;
                rayDir.xz *= rotXZ;

                vec2 limits = getVolumeBounds(rayOrig, rayDir, 2.0);
                if (limits.x < 0.0) discard;
                
                vec3 volumeColor = traceEnergy(rayOrig, rayDir, limits);
                
                vec3 normal = normalize(vNormal);
                vec3 viewDir = normalize(vViewPosition);
                float facingRatio = max(dot(normal, viewDir), 0.0);
                float edgeAA = smoothstep(0.0, 0.05, facingRatio);
                
                vec3 finalColor = 0.5 * log(1.0 + volumeColor);
                finalColor = clamp(finalColor, 0.0, 1.0) * edgeAA;
                
                float maxLuma = max(finalColor.r, max(finalColor.g, finalColor.b));
                float alpha = clamp(maxLuma * 1.5, 0.0, 1.0) * edgeAA;
                
                gl_FragColor = vec4(finalColor, alpha);
            }
        `;

        const uniforms = {
            uTime: { value: 0 },
            uLocalCamPos: { value: new THREE.Vector3() },
            uPrimaryColor: { value: new THREE.Color(params.primaryEnergy) },
            uSecondaryColor: { value: new THREE.Color(params.secondaryEnergy) },
            uDensity: { value: params.density },
            uFractalIters: { value: params.fractalIters },
            uFractalScale: { value: params.fractalScale },
            uFractalDecay: { value: params.fractalDecay },
            uInternalAnim: { value: params.internalAnim },
            uSmoothness: { value: params.smoothness },
            uAsymmetry: { value: params.asymmetry }
        };

        const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        const atmosphereVertexShader = `
            varying vec3 vNormal;
            varying vec3 vViewPosition;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                vViewPosition = -mvPosition.xyz;
                gl_Position = projectionMatrix * mvPosition;
            }
        `;

        const atmosphereFragmentShader = `
            uniform vec3 uColor;
            uniform float uGlow;
            uniform float uLevel;
            varying vec3 vNormal;
            varying vec3 vViewPosition;
            void main() {
                vec3 normal = normalize(vNormal);
                vec3 viewDir = normalize(vViewPosition);
                float vdn = max(dot(normal, viewDir), 0.0);
                float edgeFade = smoothstep(0.0, 0.15, vdn);
                float innerFadePoint = clamp(1.0 - uLevel, 0.0, 0.99);
                float centerFade = smoothstep(1.0, innerFadePoint, vdn);
                float alpha = edgeFade * centerFade * uGlow;
                gl_FragColor = vec4(uColor, alpha);
            }
        `;

        const atmosphereUniforms = {
            uColor: { value: new THREE.Color(params.primaryEnergy) },
            uGlow: { value: params.atmosphereGlow },
            uLevel: { value: params.atmosphereLevel }
        };

        const atmosphereMaterial = new THREE.ShaderMaterial({
            vertexShader: atmosphereVertexShader,
            fragmentShader: atmosphereFragmentShader,
            uniforms: atmosphereUniforms,
            transparent: true,
            side: THREE.FrontSide,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        const geometry = new THREE.SphereGeometry(2.0, 128, 128);
        const orb = new THREE.Mesh(geometry, material);
        scene.add(orb);

        const atmosphereMesh = new THREE.Mesh(geometry, atmosphereMaterial);
        atmosphereMesh.scale.set(params.atmosphereScale, params.atmosphereScale, params.atmosphereScale);
        orb.add(atmosphereMesh);

        // Composer & Postprocessing
        const composer = new EffectComposer(renderer);
        composer.setPixelRatio(params.dpr);
        const renderPass = new RenderPass(scene, camera);
        renderPass.clearColor = new THREE.Color(0,0,0);
        renderPass.clearAlpha = 0;
        composer.addPass(renderPass);
        
        const ChromaticAberrationShader = {
            uniforms: {
                "tDiffuse": { value: null },
                "uAmount": { value: params.chromaticAberration }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D tDiffuse;
                uniform float uAmount;
                varying vec2 vUv;
                void main() {
                    vec4 baseColor = texture2D(tDiffuse, vUv);
                    float luma = max(baseColor.r, max(baseColor.g, baseColor.b));
                    float mask = smoothstep(0.01, 0.1, luma);
                    vec2 offset = (vUv - 0.5) * uAmount;
                    float r = texture2D(tDiffuse, vUv + offset).r;
                    float g = texture2D(tDiffuse, vUv).g;
                    float b = texture2D(tDiffuse, vUv - offset).b;
                    vec3 aberratedColor = vec3(r, g, b);
                    // Retain alpha channel
                    gl_FragColor = vec4(mix(baseColor.rgb, aberratedColor, mask), baseColor.a);
                }
            `
        };
        const caPass = new ShaderPass(ChromaticAberrationShader);
        composer.addPass(caPass);


        const clock = new THREE.Clock();
        let animationFrameId;

        function animate() {
            animationFrameId = requestAnimationFrame(animate);
            const delta = clock.getDelta();
            uniforms.uTime.value += delta * params.speed;
            orb.rotation.y += delta * params.orbRotation;
            orb.rotation.x += delta * (params.orbRotation * 0.5);
            orb.updateMatrixWorld();
            
            const localCam = new THREE.Vector3().copy(camera.position);
            orb.worldToLocal(localCam);
            uniforms.uLocalCamPos.value.copy(localCam);

            composer.render();
        }
        animate();

        return () => {
            cancelAnimationFrame(animationFrameId);
            if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
                mountRef.current.removeChild(renderer.domElement);
            }
            geometry.dispose();
            material.dispose();
            atmosphereMaterial.dispose();
            renderer.dispose();
        };
    }, []);

    return (
        <div 
            ref={mountRef} 
            style={{ 
                width: '100%', 
                height: '100%', 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                zIndex: -1,
                borderRadius: '50%',
                overflow: 'hidden',
                backgroundColor: 'transparent'
            }} 
        />
    );
};

export default MagicOrbWebGL;
