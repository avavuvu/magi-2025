import { useState, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Html, Clouds, Cloud } from '@react-three/drei'
import { EffectComposer, DepthOfField, Bloom, Noise, Vignette } from '@react-three/postprocessing'
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
    >
      {/* Main 2024 Archive Button */}
      <div 
        style={{ position: 'relative' }}
        onMouseEnter={() => setIsDropdownOpen(true)}
      >
        <a href="https://magiexpo.squarespace.com/" target="_blank" rel="noopener noreferrer">
          <button className="ui-button">
            2024 ARCHIVE ▼
          </button>
        </a>
        
        {/* Dropdown Arrow Indicator */}
        <div 
          style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: 'inherit',
            fontSize: '12px'
          }}
        >
          ▼
        </div>
      </div>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div 
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'inherit',
            border: '1px solid #ccc',
            borderTop: 'none',
            zIndex: 1000,
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
          }}
        >
          <a 
            href="https://magiexpo.squarespace.com/magiexpo-2023" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ textDecoration: 'none', display: 'block' }}
          >
            <button 
              className="ui-button"
              style={{
                width: '100%',
                border: 'none',
                borderBottom: '1px solid #eee',
                borderRadius: 0
              }}
            >
              2023 ARCHIVE
            </button>
          </a>
          
          <a 
            href="https://pasteleftdane.github.io/" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ textDecoration: 'none', display: 'block' }}
          >
            <button 
              className="ui-button"
              style={{
                width: '100%',
                border: 'none',
                borderRadius: 0
              }}
            >
              2022 ARCHIVE
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
          color="#e9359eff"
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
         
          {/* Commented out original search - now using separate SearchBar component */}
          {/* <div className="nav-section center">
            <div className={`search-container ${isSearchFocused ? 'focused' : ''}`}>
              <input
                type="text"
                placeholder="Search projects, students, disciplines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="search-input"
              />
            </div>
          </div>     */}
         
          <div className="nav-section right">
            {/* Replace the old button with the new dropdown */}
            <ArchiveDropdown />
          </div>
        </div>
        
        {/* Side navigation */}
        <div className="side-nav" style={{ pointerEvents: 'auto' }}>
          <button 
            className="ui-button vertical"
            onClick={() => setCurrentPage('profiles')}
          >
            PROFILES
          </button>
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
                background: 'linear-gradient(90deg, #001f3f, #0074D9, #7FDBFF, #ffffff)',
              //  borderRadius: '3px',
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
                 linear-gradient(90deg, #001f3f, #0074D9, #7FDBFF, #ffffff)'
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
              
              <style jsx>{`
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
      
      <Canvas camera={{ position: [8, 6, 8], fov: 35 }}>
        {/* Enhanced fog for atmospheric depth */}
        <fog attach="fog" args={['#1a1a2e', 8, 25]} />
       
        {/* Enhanced ambient lighting */}
        <ambientLight intensity={3} color="#e6f3ff" />
        <directionalLight position={[10, 10, 5]} intensity={1.2} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ffd700" />
        <pointLight position={[5, -5, 10]} intensity={0.3} color="#ff6b6b" />
       
        {/* Atmospheric cloud system */}
        <AtmosphericSky />
       
        {/* Complete orbital system with central sphere and orbiting planets - now passes searchTerm */}
        <OrbitalSystem searchTerm={searchTerm} />
       
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
       
        {/* Post-processing effects */}
        <EffectComposer>
          <DepthOfField
            focusDistance={0.2}
            focalLength={0.1}
            bokehScale={2}
            //height={500}
          />
          <Bloom
            intensity={0.1}
            luminanceThreshold={0.9}
            luminanceSmoothing={0.9}
          />
          <Noise 
            opacity={1}
            premultiply />
          <Vignette eskil={false} offset={0.5} darkness={0.6} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}