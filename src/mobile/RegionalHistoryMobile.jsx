/* src/mobile/RegionalHistoryMobile.jsx */
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, Float, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';
import './RegionalHistoryMobile.css';

import petro1 from '../assets/petroglyph-1.png';
import petro2 from '../assets/petroglyph-2.png';
import petro3 from '../assets/petroglyph-3.png';
import petro4 from '../assets/petroglyph-4.png';
import ozrusAudio from '../assets/ozrus.mp3';

// ------------------------------------------------------------------
// КОНТЕНТ ПРЕЗЕНТАЦИИ (ТЕ ЖЕ ДАННЫЕ)
// ------------------------------------------------------------------
const SCENE_TIMELINE = [
    { id: 1, z: -20, title: 'Истоки Великой Степи', subtitle: 'Зарождение', description: 'Туркестанская область — колыбель древних цивилизаций. Здесь, среди петроглифов Боралдая, застыла история первых кочевников и могущественного государства Кангюй.', image: petro1, color: '#d4af37', align: 'right', pauseDuration: 10, transitionSpeed: 0.1 },
    { id: 2, z: -80, title: 'Отрар: Маяк Мудрости', subtitle: 'Центр Науки', description: 'Древний город, ставший центром мировой науки. Родина великого мыслителя Аль-Фараби и место, где хранилась вторая по величине библиотека древнего мира.', image: petro2, color: '#ffaa00', align: 'left', pauseDuration: 10, transitionSpeed: 0.25 },
    { id: 3, z: -140, title: 'Путь Паломника', subtitle: 'Духовное Сердце', description: 'Священная преемственность от учителя Арыстан-Баба до Ходжи Ахмеда Ясави. Духовное сердце тюркского мира, притягивающее миллионы сердец на протяжении веков.', image: petro3, color: '#ff8800', align: 'right', pauseDuration: 10, transitionSpeed: 0.15 },
    { id: 4, z: -200, title: 'Непокоренный Дух', subtitle: 'Стойкость', description: 'Стены, видевшие нашествие Чингисхана и героическую оборону. История стойкости народа, который возрождался из пепла, как степной пожар.', image: petro4, color: '#d4af37', align: 'left', pauseDuration: 10, transitionSpeed: 0.08 },
    { id: 5, z: -260, title: 'Столица Казахского Ханства', subtitle: 'Величие', description: 'Политический центр Великой степи. Здесь принимались судьбоносные решения и обрели вечный покой великие ханы, бии и батыры нашего народа.', image: petro1, color: '#c2a679', align: 'right', pauseDuration: 10, transitionSpeed: 0.12 },
    { id: 6, z: -320, title: 'Возрождение Легенды', subtitle: 'Мост в Будущее', description: 'Древний Туркестан сегодня — это мост между прошлым и будущим. Город, который сохранил свою душу, становясь современным центром мирового туризма.', image: petro2, color: '#d2b48c', align: 'left', pauseDuration: 10, transitionSpeed: 0.15 },
];

const START_Z = 10;

// ------------------------------------------------------------------
// 1. АТМОСФЕРА — ЗОНИРОВАНИЕ ДЛЯ ОПТИМИЗАЦИИ (МОБИЛЬНАЯ ВЕРСИЯ)
// ------------------------------------------------------------------
import { Clouds, Cloud } from '@react-three/drei';

const CinematicAtmosphereMobile = React.memo(() => {
    const zoneARef = useRef();
    const zoneBRef = useRef();
    const zoneCRef = useRef();

    const generateZone = (zStart, zEnd, seedOffset) => {
        const arr = [];
        let idCount = 0;
        const addCloud = (x, y, z) => {
            const depthFactor = Math.abs(z) / 800;
            const sandColors = ['#ebd9c3', '#e0c8a8', '#d1b38f', '#bfa07a'];
            const baseColor = new THREE.Color(sandColors[Math.floor(Math.random() * sandColors.length)]);
            baseColor.multiplyScalar(0.5 + Math.random() * 0.6);
            baseColor.multiplyScalar(1 - depthFactor * 0.3);

            arr.push(
                <Cloud
                    key={`c_${seedOffset}_${idCount++}`}
                    seed={seedOffset + idCount}
                    segments={10}
                    bounds={[65 + Math.random() * 15, 65 + Math.random() * 15, 65 + Math.random() * 15]}
                    volume={70 + Math.random() * 20}
                    color={baseColor}
                    position={[x + (Math.random() - 0.5) * 8, y + (Math.random() - 0.5) * 8, z]}
                    speed={0.002}
                    opacity={(0.45 + Math.random() * 0.15) * (1 - depthFactor)}
                />
            );
        };

        for (let z = zStart; z >= zEnd; z -= 20) {
            const distToNearestSlide = Math.min(...SCENE_TIMELINE.map(s => Math.abs(z - s.z)));
            
            // Расчистка пространства вокруг слайда
            const spreadX = distToNearestSlide < 30 ? 55 : 35;
            const spreadY = distToNearestSlide < 30 ? 45 : 30;

            addCloud(-spreadX, (Math.random() - 0.5) * 40, z); // Слева
            addCloud(spreadX, (Math.random() - 0.5) * 40, z);  // Справа
            addCloud((Math.random() - 0.5) * 40, spreadY, z);  // Сверху
            addCloud((Math.random() - 0.5) * 40, -spreadY, z); // Снизу
            
            if (z % 30 === 0 && distToNearestSlide > 25 && z < 20) {
                addCloud((Math.random() - 0.5) * 35, (Math.random() - 0.5) * 35, z);
            }
        }
        return arr;
    };

    const zoneAClouds = useMemo(() => generateZone(50, -150, 1000), []);
    const zoneBClouds = useMemo(() => generateZone(-170, -350, 2000), []);
    const zoneCClouds = useMemo(() => generateZone(-370, -550, 3000), []);

    useFrame((state) => {
        const cz = state.camera.position.z;
        if (zoneARef.current) zoneARef.current.visible = (cz > -200);
        if (zoneBRef.current) zoneBRef.current.visible = (cz < 0 && cz > -400);
        if (zoneCRef.current) zoneCRef.current.visible = (cz < -200);
    });

    return (
        <group>
            <group ref={zoneARef}>
                <Clouds material={THREE.MeshBasicMaterial} limit={7500} frustumCulled={false}>
                    {zoneAClouds}
                </Clouds>
            </group>
            <group ref={zoneBRef}>
                <Clouds material={THREE.MeshBasicMaterial} limit={7500} frustumCulled={false}>
                    {zoneBClouds}
                </Clouds>
            </group>
            <group ref={zoneCRef}>
                <Clouds material={THREE.MeshBasicMaterial} limit={7500} frustumCulled={false}>
                    {zoneCClouds}
                    <group position={[0, 0, -550]}>
                        <Cloud seed={999} segments={50} bounds={[500, 500, 100]} volume={500} color="#4a3b2a" opacity={1} />
                    </group>
                </Clouds>
            </group>
        </group>
    );
});

const SlideMarkerMobile = ({ data }) => {
    const { size } = useThree();
    const texture = useTexture(data.image);
    const groupRef = useRef();
    
    const isImageTop = data.align === 'right'; 
    
    const vh = 20.7846; 
    const aspect = size.width / size.height;
    const vw = vh * aspect; 
    
    const widthScale = (vw * 0.9) / 12; 
    const heightScale = (vh * 0.55) / 20; // Вмещаем блок высотой в 20 юнитов
    const contentScale = Math.min(widthScale, heightScale);
    
    // Раздвигаем сильнее. Так как Заголовок (Title) выравнивается anchorY="bottom" 
    // и растет ВВЕРХ, мы даем ему зазор почти в 4 юнита до нижнего края картинки!
    const imgY = isImageTop ? 5.5 : -8.5; 
    const txtY = isImageTop ? -2.5 : 4.5;

    useFrame((state) => {
        if (!groupRef.current) return;
        const dist = Math.abs(state.camera.position.z - data.z);
        groupRef.current.visible = dist < 75;
    });

    return (
        <group ref={groupRef} position={[0, 0, data.z]} scale={contentScale}>
            <pointLight position={[0, 2, 5]} intensity={8} color={data.color} distance={40} decay={1.5} />
            <pointLight position={[0, -2, 5]} intensity={2} color="#ffffff" distance={40} decay={2} />

            <group position={[0, imgY, -2]}>
                <mesh>
                    <planeGeometry args={[8, 8]} />
                    <meshBasicMaterial map={texture} transparent side={THREE.DoubleSide} alphaTest={0.05} fog={false} />
                </mesh>
            </group>

            <group position={[0, txtY, 0]}>
                <Text fontSize={1.4} color="#d4af37" anchorX="center" anchorY="bottom" outlineWidth={0.04} outlineColor="#000" depthTest={false} renderOrder={1} fog={false} maxWidth={12} textAlign="center" lineHeight={1.1}>
                    {data.title}
                </Text>
                <Text position={[0, -0.8, 0]} fontSize={0.85} color="#ffffff" anchorX="center" anchorY="top" maxWidth={12} textAlign="center" depthTest={false} renderOrder={1} fog={false}>
                    {data.subtitle}
                </Text>
                <Text position={[0, -2.4, 0]} fontSize={0.7} color="#cccccc" anchorX="center" anchorY="top" maxWidth={14} textAlign="center" opacity={0.8} lineHeight={1.2} depthTest={false} renderOrder={1} fog={false}>
                    {data.description}
                </Text>
            </group>
        </group>
    );
};

// ------------------------------------------------------------------
// 3. КАМЕРА
// ------------------------------------------------------------------
const DirectorCameraMobile = ({ onProgress, onSubtitleUpdate }) => {
    const director = useRef({ index: 0, phase: 'FLYING', timer: 0 });
    const lightRef = useRef();

    useFrame((state, delta) => {
        const dt = Math.min(delta, 0.1);
        const d = director.current;
        const slide = SCENE_TIMELINE[d.index];
        if (!slide) return;

        if (lightRef.current) {
            lightRef.current.position.copy(state.camera.position);
        }

        const targetZ = slide.z + 18;

        if (d.phase === 'FLYING') {
            onSubtitleUpdate('');
            const zDiff = state.camera.position.z - targetZ;
            state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, slide.transitionSpeed * dt * 12);
            state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, 0, dt * 2);
            state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, 0, dt * 2);
            if (Math.abs(zDiff) < 0.05) {
                state.camera.position.z = targetZ;
                d.phase = 'PAUSED';
                d.timer = 0;
            }
        } else {
            onSubtitleUpdate(`История: ${slide.title}...`);
            d.timer += dt;
            if (d.timer >= slide.pauseDuration) {
                d.index++;
                d.phase = 'FLYING';
                if (d.index >= SCENE_TIMELINE.length) {
                    d.index = 0;
                    state.camera.position.z = START_Z;
                }
            }
        }

        const totalDepth = Math.abs(START_Z) + Math.abs(SCENE_TIMELINE[SCENE_TIMELINE.length - 1].z);
        const currentDepth = START_Z - state.camera.position.z;
        onProgress(Math.max(0, Math.min(100, (currentDepth / totalDepth) * 100)));
    });

    return <pointLight ref={lightRef} intensity={200} distance={120} color="#ffffff" />;
};

// ------------------------------------------------------------------
// ГЛАВНЫЙ КОМПОНЕНТ
// ------------------------------------------------------------------
const RegionalHistoryMobile = () => {
    const [progress, setProgress] = useState(0);
    const [subtitleText, setSubtitleText] = useState('');
    const navigate = useNavigate();

    // Гарантированная озвучка (обходим блокировки Autoplay при F5)
    useEffect(() => {
        const audio = new Audio(ozrusAudio);
        audio.volume = 0.8;
        audio.loop = true;
        
        let isPlaying = false;
        const tryPlay = () => {
            if (isPlaying) return;
            audio.play().then(() => {
                isPlaying = true;
                window.removeEventListener('click', tryPlay);
                window.removeEventListener('touchstart', tryPlay);
                window.removeEventListener('wheel', tryPlay);
            }).catch(e => console.log('Autoplay prevented by browser, waiting for interaction...'));
        };

        tryPlay(); // Попытка сразу
        
        // Триггеры, если был нажат F5
        window.addEventListener('click', tryPlay);
        window.addEventListener('touchstart', tryPlay);
        window.addEventListener('wheel', tryPlay);
        
        return () => {
            window.removeEventListener('click', tryPlay);
            window.removeEventListener('touchstart', tryPlay);
            window.removeEventListener('wheel', tryPlay);
            audio.pause();
            audio.currentTime = 0;
        };
    }, []);

    return (
        <section className="reg-hist-root">
            <div className="reg-hist-overlay-vignette" />
            <div className="reg-hist-overlay-grain" />

            <div className="reg-hist-ui-safe-area">
                <header className="reg-hist-ui-header">
                    <button className="reg-hist-back-btn" onClick={() => navigate(-1)}>
                        &#8592; Назад
                    </button>
                    <p className="reg-hist-ui-subtitle">Туркестан</p>
                    <h2 className="reg-hist-ui-title">История</h2>
                </header>
                <div className="reg-hist-ui-footer">
                    <div className="reg-hist-playback-status">{subtitleText}</div>
                    <div className="reg-hist-progress-bar-container">
                        <div className="reg-hist-progress-bar" style={{ width: `${progress}%` }} />
                    </div>
                </div>
            </div>

            <div className="reg-hist-canvas-container">
                <Canvas
                    shadows={false}
                    camera={{ position: [0, 0, START_Z], fov: 60 }}
                    dpr={[1, 1]}
                    gl={{ antialias: false, alpha: false, stencil: false, powerPreference: 'default' }}
                >
                    <color attach="background" args={['#2a2015']} />
                    <fog attach="fog" args={['#2a2015', 20, 150]} />
                    <ambientLight intensity={0.5} />

                    <CinematicAtmosphereMobile />

                    {SCENE_TIMELINE.map((slide) => (
                        <SlideMarkerMobile key={slide.id} data={slide} />
                    ))}

                    <DirectorCameraMobile onProgress={setProgress} onSubtitleUpdate={setSubtitleText} />
                </Canvas>
            </div>
        </section>
    );
};

export default RegionalHistoryMobile;
