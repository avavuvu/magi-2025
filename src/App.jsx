import { useState, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Html, Clouds, Cloud } from '@react-three/drei'
import { EffectComposer, DepthOfField, Bloom, Noise, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import { OrbitalSystem } from './OrbitalSystem' // Import the extracted component

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
          opacity={0.05}
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
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
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
         
          <div className="nav-section center">
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
          </div>
         
          <div className="nav-section right">
            <button className="ui-button">
              2024 ARCHIVE
            </button>
          </div>
        </div>
        {/* Side navigation */}
        <div className="side-nav">
          <button className="ui-button vertical">
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
        <div className="bottom-nav">
          <div className="info-section">
            <span className="info-text">Masters of Animation, Games & Interactivity</span>
          </div>
          <div className="info-section right">
            <button className="ui-button small">
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
       
        {/* Complete orbital system with central sphere and orbiting planets */}
        <OrbitalSystem />
       
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
       
        {/* Post-processing effects */}
        <EffectComposer>
          <DepthOfField
            focusDistance={0.2}
            focalLength={0.1}
            bokehScale={2}
            height={400}
          />
          <Bloom
            intensity={0.001}
            luminanceThreshold={0.9}
            luminanceSmoothing={0.9}
          />
          <Noise opacity={0.02} />
          <Vignette eskil={false} offset={0.5} darkness={0.6} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}