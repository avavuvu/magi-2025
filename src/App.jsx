import { useState, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Html, Clouds, Cloud } from '@react-three/drei'
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import { OrbitalSystem, SearchBar } from './OrbitalSystem' // Import both components
import ProfileDatabase from './ProfileDatabase'
import QuestTracker from './Quests' // Import your Quest Tracker


// Archive Dropdown Component
function ArchiveDropdown() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleMouseLeave = () => {
    setIsDropdownOpen(false);
  };

  return (
    <div 
      className="archive-dropdown-container" 
      onMouseLeave={handleMouseLeave}
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setIsDropdownOpen(true)}
    >
      {/* Main Archive Button */}
      <div 
        style={{ position: 'relative' }}
      >
        <button 
          className="ui-button vertical"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px'
          }}
        >
          <span>ARCHIVE</span>
          <span>▶</span>
        </button>
      </div>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 'calc(100% + 2px)',
            backgroundColor: 'inherit',
            border: '1px solid #ccc',
            borderLeft: 'none',
            zIndex: 1000,
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'row',
            gap: '0',
            height: '100%'
          }}
        >
          <a 
            href="https://magiexpo.squarespace.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ textDecoration: 'none', display: 'block', height: '100%' }}
          >
            <button 
              className="ui-button vertical"
              style={{
                height: '100%',
                minWidth: '60px',
                border: 'none',
                borderRight: '1px solid #ccc',
                borderRadius: 0,
                margin: 0,
                padding: '0 16px'
              }}
            >
              2024
            </button>
          </a>
          
          <a 
            href="https://magiexpo.squarespace.com/magiexpo-2023" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ textDecoration: 'none', display: 'block', height: '100%' }}
          >
            <button 
              className="ui-button vertical"
              style={{
                height: '100%',
                minWidth: '60px',
                border: 'none',
                borderRight: '1px solid #ccc',
                borderRadius: 0,
                margin: 0,
                padding: '0 16px'
              }}
            >
              2023
            </button>
          </a>
          
          <a 
            href="https://pasteleftdane.github.io/" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ textDecoration: 'none', display: 'block', height: '100%' }}
          >
            <button 
              className="ui-button vertical"
              style={{
                height: '100%',
                minWidth: '60px',
                border: 'none',
                borderRadius: 0,
                margin: 0,
                padding: '0 16px'
              }}
            >
              2022
            </button>
          </a>
        </div>
      )}
    </div>
  );
}

// Enhanced Sky component with atmospheric clouds
function AtmosphericSky() {
  const cloudsRef = useRef()
  const mainCloudRef = useRef()

  useFrame((state, delta) => {
    const elapsedTime = state.clock.elapsedTime;
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = Math.cos(elapsedTime / 4) / 4
      cloudsRef.current.rotation.x = Math.sin(elapsedTime / 6) / 6
    }
    if (mainCloudRef.current) {
      mainCloudRef.current.rotation.y -= delta * 0.1
    }
  })

  return (
    <group ref={cloudsRef}>
      <Clouds material={THREE.MeshLambertMaterial} limit={500} range={1}>
        {/* Main central cloud mass */}
        <Cloud
          ref={mainCloudRef}  
          seed={1}
          segments={1}
          volume={15}
          opacity={0.01}
          fade={50}
          growth={5}
          bounds={[0.1, 0.1, 0.1]}
          color="#e9359e"
          position={[0, 0, 0]}
        />
      </Clouds>
    </group>
  )
}

export default function App() {
  // Add search state management
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState('home')
  
  // Handle different page states
  if (currentPage === 'profiles') {
    return <ProfileDatabase onNavigateHome={() => setCurrentPage('home')} />
  }
  
  if (currentPage === 'quest') {
    return <QuestTracker onNavigateHome={() => setCurrentPage('home')} />
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* Search bar - positioned outside Canvas to stay fixed */}
      <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      {/* Minimal UI Overlay */}
      <div className="ui-overlay">
        {/* Top navigation bar */}
        <div className="top-nav">
          <div className="nav-section">
            <img 
              src="/MAGI_Logo.png" 
              alt="MAGI Logo" 
              style={{
                height: '60px',
                width: 'auto',
                scale: '100%',
                cursor: 'pointer',
                filter: 'brightness(1.2)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.filter = 'brightness(1.5) drop-shadow(0 0 10px rgba(255,255,255,0.3))'
                e.target.style.transform = 'scale(1.05)'
              }}
              onMouseLeave={(e) => {
                e.target.style.filter = 'brightness(1.2)'
                e.target.style.transform = 'scale(1)'
              }}
            />
          </div>
         
          <div className="nav-section right">
            {/* Profiles button moved to top right */}
            <button 
              className="ui-button"
              onClick={() => setCurrentPage('profiles')}
            >
              PROFILES
            </button>
          </div>
        </div>
        
        {/* Side navigation */}
        <div className="side-nav" style={{ pointerEvents: 'auto' }}>
          {/* Archive dropdown moved to side nav */}
          <ArchiveDropdown />
          <button className="ui-button vertical">
            ABOUT
          </button>
          <button className="ui-button vertical">
            CONTACT
          </button>
        </div>
        
        {/* Bottom info bar */}
        <div className="bottom-nav" style={{ pointerEvents: 'auto' }}>
          <div className="info-section">
            <span className="info-text">Masters of Animation, Games & Interactivity</span>
          </div>
          <div className="info-section right" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div 
              style={{
                width: '160px',
                height: '30px',
                background: 'linear-gradient(90deg, #0074D9, #00ffcc)',
                border: '1px solid white',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const percentage = (x / rect.width) * 100;
                
                // Update gradient
                e.currentTarget.style.background = `
                  radial-gradient(circle at ${percentage}% 50%, 
                    rgba(255, 255, 255, 0.3) 0%, 
                    transparent 50%
                  ),
                 linear-gradient(90deg, #001f3f, #0074D9, #7FDBFF, #ffffff);'
                `;
                
                // Create sparkle
                const sparkle = document.createElement('div');
                sparkle.style.position = 'absolute';
                sparkle.style.left = `${x}px`;
                sparkle.style.top = `${y}px`;
                sparkle.style.width = '3px';
                sparkle.style.height = '3px';
                sparkle.style.backgroundColor = 'white';
                sparkle.style.borderRadius = '50%';
                sparkle.style.pointerEvents = 'none';
                sparkle.style.animation = 'sparkleAnimation 0.6s ease-out forwards';
                sparkle.style.transform = 'translate(-50%, -50%)';
                sparkle.style.zIndex = '10';
                
                e.currentTarget.appendChild(sparkle);
                
                // Remove sparkle after animation
                setTimeout(() => {
                  if (sparkle.parentNode) {
                    sparkle.parentNode.removeChild(sparkle);
                  }
                }, 600);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(90deg, #001f3f, #0074D9, #7FDBFF, #ffffff)';
              }}
            >
              {/* Marquee text overlay */}
              <div
                style={{
                  position: 'absolute',
                  whiteSpace: 'nowrap',
                  color: 'white',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  fontWeight: 'heavy',
                  letterSpacing: '1px',
                  animation: 'marquee 10s linear infinite',
                  zIndex: '5'
                }}
              >
                ORBITS MAGI EXPO 2025
              </div>
              
              <style>{`
                @keyframes marquee {
                  0% { transform: translateX(160px); }
                  100% { transform: translateX(-100%); }
                }
                @keyframes sparkleAnimation {
                  0% { 
                    opacity: 1; 
                    transform: translate(-50%, -50%) scale(0); 
                  }
                  50% { 
                    opacity: 1; 
                    transform: translate(-50%, -50%) scale(1.5); 
                  }
                  100% { 
                    opacity: 0; 
                    transform: translate(-50%, -50%) scale(0); 
                  }
                }
              `}</style>
            </div>
            {/* Modified HELP button to open Quest Tracker */}
            <button 
              className="ui-button small"
              onClick={() => setCurrentPage('quest')}
            >
              HELP
            </button>
            <button className="ui-button small">
              FULL SCREEN
            </button>
          </div>
        </div>
      </div>
      
      <Canvas 
        camera={{ position: [8, 8, 8], fov: 35 }}
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
        gl={{ 
          antialias: true,
          powerPreference: "high-performance"
        }}
      >
        {/* Black background with atmospheric fog */}
        <color attach="background" args={['#000000']} />
        <fog attach="fog" args={['#000000', 8, 25]} />
       
        {/* Optimized lighting */}
        <ambientLight intensity={2.5} color="#e6f3ff" />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.4} color="#ffd700" />
        <pointLight position={[5, -5, 10]} intensity={0.25} color="#ff6b6b" />
       
        {/* Atmospheric cloud system */}
        <AtmosphericSky />
       
        {/* Complete orbital system with central sphere and orbiting planets */}
        <OrbitalSystem searchTerm={searchTerm} />
       
        <OrbitControls 
          enablePan={true} 
          enableZoom={true} 
          enableRotate={true}
          enableDamping={true}
          dampingFactor={0.05}
        />
       
        {/* Optimized post-processing effects */}
        <EffectComposer multisampling={0}>
          <Bloom
            intensity={0.08}
            luminanceThreshold={0.9}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
          <Noise 
            opacity={0.8}
            premultiply 
          />
          <Vignette eskil={false} offset={0.5} darkness={0.6} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}