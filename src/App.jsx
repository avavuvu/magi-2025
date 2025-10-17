import { useState, useCallback, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { OrbitalSystem, SearchBar } from './OrbitalSystem'
import * as THREE from 'three'

// Archive Dropdown Component
function ArchiveDropdown() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  return (
    <div 
      className="archive-dropdown-container" 
      onMouseLeave={() => setIsDropdownOpen(false)}
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setIsDropdownOpen(true)}
    >
      <div style={{ position: 'relative' }}>
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
          {[
            { year: '2024', url: 'https://magiexpo.squarespace.com/' },
            { year: '2023', url: 'https://magiexpo.squarespace.com/magiexpo-2023' },
            { year: '2022', url: 'https://pasteleftdane.github.io/' }
          ].map(({ year, url }) => (
            <a 
              key={year}
              href={url}
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
                {year}
              </button>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [searchTerm, setSearchTerm] = useState('')
  
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value)
  }, [])

  // Memoize camera settings
  const cameraSettings = useMemo(() => ({
    position: [8, 8, 8],
    fov: 35,
    near: 0.1,
    far: 1000
  }), [])

  // Memoize GL settings
  const glSettings = useMemo(() => ({
    antialias: false, // TURN OFF for performance
    powerPreference: "high-performance",
    alpha: false,
    stencil: false,
    depth: true,
    preserveDrawingBuffer: false
  }), [])

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <SearchBar searchTerm={searchTerm} onSearchChange={handleSearchChange} />

      <div className="ui-overlay">
        <div className="top-nav">
          <div className="nav-section">
            <img 
              src="/MAGI_Logo.png" 
              alt="MAGI Logo" 
              style={{
                height: '60px',
                width: 'auto',
                cursor: 'pointer',
                filter: 'brightness(1.2)',
                transition: 'filter 0.3s ease, transform 0.3s ease',
                willChange: 'transform'
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
            <button className="ui-button">
              PROFILES
            </button>
          </div>
        </div>
        
        <div className="side-nav" style={{ pointerEvents: 'auto' }}>
          <ArchiveDropdown />
          <button className="ui-button vertical">ABOUT</button>
          <button className="ui-button vertical">CONTACT</button>
        </div>
        
        <div className="bottom-nav" style={{ pointerEvents: 'auto' }}>
          <div className="info-section">
            <span className="info-text">Masters of Animation, Games & Interactivity</span>
          </div>
          <div className="info-section right" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div 
              style={{
                width: '160px',
                height: '30px',
                background: 'linear-gradient(90deg, #0074D9, #00CED1, #7FFFD4)',
                border: '1px solid white',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  whiteSpace: 'nowrap',
                  color: 'white',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                  letterSpacing: '1px',
                  animation: 'marquee 10s linear infinite',
                  zIndex: 5
                }}
              >
                ORBITS MAGI EXPO 2025
              </div>
              
              <style>{`
                @keyframes marquee {
                  0% { transform: translateX(160px); }
                  100% { transform: translateX(-100%); }
                }
              `}</style>
            </div>
            <img 
              src="/magilogo.svg" 
              alt="MAGI" 
              style={{
                height: '28px',
                width: 'auto',
                filter: 'brightness(0) invert(1)',
                opacity: 0.9,
                transition: 'opacity 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.opacity = '1'}
              onMouseLeave={(e) => e.target.style.opacity = '0.9'}
            />
          </div>
        </div>
      </div>
      
      <Canvas 
        camera={cameraSettings}
        dpr={[1, Math.min(window.devicePixelRatio, 2)]}
        performance={{ min: 0.5 }}
        gl={{
    ...glSettings,
    toneMapping: THREE.NoToneMapping // ✅ Added for better performance
  }}
        frameloop="always"
        flat
        linear
      >
        <color attach="background" args={['#000000']} />
        <fog attach="fog" args={['#000000', 8, 25]} />
       
        {/* Simplified lighting - no shadows */}
        <ambientLight intensity={2.5} color="#e6f3ff" />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.4} color="#ffd700" />
        <pointLight position={[5, -5, 10]} intensity={0.25} color="#ff6b6b" />
       
        <OrbitalSystem searchTerm={searchTerm} />
       
        <OrbitControls 
          enablePan={true} 
          enableZoom={true} 
          enableRotate={true}
          enableDamping={true}
          dampingFactor={0.05}
          maxDistance={20}
          minDistance={3}
          makeDefault
        />
      </Canvas>
    </div>
  )
}