import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import { OrbitalSystem, SearchBar } from './OrbitalSystem'
import { useAsteroidData } from './ProfileSystem'
import * as THREE from 'three'
import './responsive.css'

// Mobile Orbital Rotator - rotates the scene based on touch
function MobileOrbitalRotator({ children, onRotationChange, enabled }) {
  const groupRef = useRef()
  
  useEffect(() => {
    if (enabled && onRotationChange && groupRef.current) {
      // Send current rotation to parent
      onRotationChange(groupRef.current.rotation.y)
    }
  }, [enabled, onRotationChange])

  // Expose the group ref for external rotation control
  useEffect(() => {
    if (groupRef.current && window) {
      window.__orbitalGroupRef = groupRef.current
    }
  }, [])

  return <group ref={groupRef}>{children}</group>
}

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
  const [isMobile, setIsMobile] = useState(false)
  const [currentProfileIndex, setCurrentProfileIndex] = useState(-1)
  const [touchStartX, setTouchStartX] = useState(0)
  const [hasSwipedOnce, setHasSwipedOnce] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [orbitalRotation, setOrbitalRotation] = useState(0)
  const lastRotationRef = useRef(0)
  
  const canvasRef = useRef()
  
  // Get asteroid data for mobile profiles
  const { asteroidData, isLoading } = useAsteroidData()
  
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value)
  }, [])

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
      if (!mobile) {
        setCurrentProfileIndex(-1)
        setHasSwipedOnce(false)
        setOrbitalRotation(0)
        lastRotationRef.current = 0
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Mobile touch handlers for orbital rotation
  const handleTouchStart = useCallback((e) => {
    if (!isMobile) return
    setTouchStartX(e.touches[0].clientX)
    setIsDragging(true)
    
    if (!hasSwipedOnce) {
      setHasSwipedOnce(true)
      setCurrentProfileIndex(0)
    }
  }, [isMobile, hasSwipedOnce])

  const handleTouchMove = useCallback((e) => {
    if (!isMobile || !isDragging) return
    
    const currentX = e.touches[0].clientX
    
    // Calculate rotation based on drag distance (REDUCED sensitivity to 33% of original)
    const dragDelta = currentX - touchStartX
    const rotationDelta = (dragDelta / window.innerWidth) * Math.PI * 0.66 // Changed from 1 to 0.66
    const newRotation = lastRotationRef.current + rotationDelta
    
    // Apply rotation to the orbital system
    if (window.__orbitalGroupRef) {
      window.__orbitalGroupRef.rotation.y = newRotation
      setOrbitalRotation(newRotation)
    }
  }, [isMobile, isDragging, touchStartX])

  const handleTouchEnd = useCallback(() => {
    if (!isMobile || !isDragging || asteroidData.length === 0) return
    
    setIsDragging(false)
    
    // Calculate which profile to show based on rotation
    const normalizedRotation = ((orbitalRotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
    const segmentSize = (Math.PI * 2) / asteroidData.length
    const rawIndex = normalizedRotation / segmentSize
    
    // Add threshold to prevent accidental profile changes (must rotate at least 30% of a segment)
    const indexDiff = Math.abs(rawIndex - currentProfileIndex)
    let profileIndex
    
    if (indexDiff < 0.3) {
      // Too small movement, snap back to current profile
      profileIndex = currentProfileIndex
    } else {
      // Significant movement, snap to nearest
      profileIndex = Math.round(rawIndex) % asteroidData.length
    }
    
    // Snap to the profile with smooth animation
    const snappedRotation = profileIndex * segmentSize
    
    // Animate to snapped position
    if (window.__orbitalGroupRef) {
      const startRotation = orbitalRotation
      const targetRotation = snappedRotation
      const duration = 400 // Increased from 300ms to 400ms for smoother feel
      const startTime = Date.now()
      
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // Easing function for smooth snap (cubic ease-out)
        const easeProgress = 1 - Math.pow(1 - progress, 3)
        
        const currentRotation = startRotation + (targetRotation - startRotation) * easeProgress
        window.__orbitalGroupRef.rotation.y = currentRotation
        setOrbitalRotation(currentRotation)
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          lastRotationRef.current = targetRotation
        }
      }
      
      animate()
    }
    
    setCurrentProfileIndex(profileIndex)
  }, [isMobile, isDragging, asteroidData.length, orbitalRotation, currentProfileIndex])

  // Memoize camera settings - adjusted for mobile
  const cameraSettings = useMemo(() => ({
    position: isMobile ? [8, 6, 8] : [8, 8, 8], // Lower Y position on mobile to show more of top
    fov: 35,
    near: 0.1,
    far: 1000
  }), [isMobile])

  // Memoize GL settings
  const glSettings = useMemo(() => ({
    antialias: false,
    powerPreference: "high-performance",
    alpha: false,
    stencil: false,
    depth: true,
    preserveDrawingBuffer: false
  }), [])

  // Current profile for mobile overlay
  const currentProfile = currentProfileIndex >= 0 ? asteroidData[currentProfileIndex] : null

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Search Bar - Hide on mobile */}
      {!isMobile && (
        <div className="search-bar-container">
          <SearchBar searchTerm={searchTerm} onSearchChange={handleSearchChange} />
        </div>
      )}

      {/* UI Overlay */}
      <div className="ui-overlay">
        <div className="top-nav">
          <div className="nav-section">
            <img 
              src="/MAGI_Logo.png" 
              alt="MAGI Logo"
              className="logo-left"
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
            <img 
              src="/MAGI_Logo.png" 
              alt="MAGI Logo"
              className="logo-right"
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

      {/* Profile Counter - Mobile only, shows when browsing */}
      {isMobile && hasSwipedOnce && currentProfile && (
        <div style={{
          position: 'absolute',
          bottom: '120px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10001,
          background: 'rgba(233, 53, 158, 0.9)',
          border: '1px solid rgba(233, 53, 158, 1)',
          padding: '6px 16px',
          borderRadius: '20px',
          color: 'white',
          fontSize: '11px',
          fontFamily: 'monospace',
          fontWeight: 'bold',
          pointerEvents: 'none'
        }}>
          {currentProfileIndex + 1} / {asteroidData.length}
        </div>
      )}

      {/* Loading state for mobile */}
      {isMobile && isLoading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#e9359e',
          fontFamily: 'monospace',
          fontSize: '14px',
          textAlign: 'center',
          zIndex: 1000
        }}>
          Loading profiles...
        </div>
      )}
      
      {/* Canvas with touch handlers on mobile */}
      <div
        ref={canvasRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ 
          width: '100%', 
          height: '100%',
          touchAction: isMobile ? 'none' : 'auto' // Disable all default touch on mobile
        }}
      >
        <Canvas 
          camera={cameraSettings}
          dpr={[1, Math.min(window.devicePixelRatio, 2)]}
          performance={{ min: 0.5 }}
          gl={{
            ...glSettings,
            toneMapping: THREE.NoToneMapping
          }}
          frameloop="always"
          flat
          linear
        >
          <color attach="background" args={['#000000']} />
          <fog attach="fog" args={['#000000', 8, 40]} />
         
          <ambientLight intensity={2.5} color="#e6f3ff" />
          <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
          <pointLight position={[-10, -10, -10]} intensity={0.4} color="#ffd700" />
          <pointLight position={[5, -5, 10]} intensity={0.25} color="#ff6b6b" />
         
          {/* Wrap orbital system in rotator on mobile */}
          {isMobile ? (
            <MobileOrbitalRotator 
              enabled={isMobile}
              onRotationChange={setOrbitalRotation}
            >
              <OrbitalSystem 
                searchTerm={searchTerm} 
                hideBanner={hasSwipedOnce}
              />
              
              {/* Mobile Profile Card - Inside Canvas */}
              {hasSwipedOnce && currentProfile && (
                <Html
                  center
                  position={[0, 0, 0]}
                  distanceFactor={10}
                  zIndexRange={[16777271, 16777272]}
                  occlude={false}
                  style={{
                    pointerEvents: 'none',
                    userSelect: 'none'
                  }}
                >
                  <div style={{
                    animation: 'fadeIn 0.3s ease-out',
                    width: '65vw',
                    maxWidth: '320px',
                    transform: 'translate(0, 0)'
                  }}>
                    <div style={{
                      background: 'rgba(0, 0, 0, 0.95)',
                      border: '2px solid rgba(233, 53, 158, 1)',
                      borderRadius: '0px',
                      padding: '16px',
                      backdropFilter: 'blur(20px)'
                    }}>
                      {/* Profile Picture */}
                      <div style={{
                        width: '80px',
                        height: '80px',
                        margin: '0 auto 10px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: '2px solid rgba(233, 53, 158, 0.5)',
                        background: 'rgba(255, 255, 255, 0.05)'
                      }}>
                        <img 
                          src={currentProfile.studentNumber 
                            ? `/profiles/${currentProfile.studentNumber}.webp`
                            : '/profiles/placeholder.webp'
                          }
                          alt={currentProfile.name}
                          loading="eager"
                          onError={(e) => {
                            e.target.src = '/profiles/placeholder.webp'
                          }}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      </div>

                      {/* Name - FIXED HEIGHT FOR 2 LINES */}
                      <h2 style={{
                        color: '#ffffff',
                        fontSize: '15px',
                        fontFamily: 'monospace',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        marginBottom: '6px',
                        letterSpacing: '0.5px',
                        height: '42px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        lineHeight: '1.3'
                      }}>
                        {currentProfile.name}
                      </h2>

                      {/* Work Type Badge */}
                      <div style={{
                        textAlign: 'center',
                        marginBottom: '12px'
                      }}>
                        <span style={{
                          display: 'inline-block',
                          background: 'rgba(233, 53, 158, 0.2)',
                          border: '1px solid rgba(233, 53, 158, 1)',
                          color: '#e9359e',
                          padding: '4px 12px',
                          fontSize: '9px',
                          fontFamily: 'monospace',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          borderRadius: '4px'
                        }}>
                          {currentProfile.workType}
                        </span>
                      </div>

                      {/* Project Title */}
                      {currentProfile.workTitle ? (
                        <div style={{
                          color: '#cccccc',
                          fontSize: '11`px',
                          fontFamily: 'monospace',
                          textAlign: 'center',
                          marginBottom: '10px',
                          fontStyle: 'italic',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          "{currentProfile.workTitle}"
                        </div>
                      ) : (
                        <div style={{ height: '20px', marginBottom: '10px' }}></div>
                      )}

                      {/* Bio */}
                      <div style={{
                        color: '#aaaaaa',
                        fontSize: '9px',
                        fontFamily: 'monospace',
                        lineHeight: '1.4',
                        textAlign: 'center',
                        height: '90px',
                        overflowY: 'auto',
                        padding: '0 6px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'center'
                      }}>
                        <div style={{ width: '100%' }}>
                          {currentProfile.bio || '\u00A0'}
                        </div>
                      </div>
                    </div>

                    {/* Swipe Indicators */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginTop: '9px',
                      padding: '0 16px',
                      color: '#e9359e',
                      fontSize: '20px',
                      opacity: 0.6
                    }}>
                      <span>‹</span>
                      <span style={{ fontSize: '10px', alignSelf: 'center', fontFamily: 'monospace' }}>
                        Swipe to browse
                      </span>
                      <span>›</span>
                    </div>

                    <style>{`
                      @keyframes fadeIn {
                        from { opacity: 0; transform: scale(0.95); }
                        to { opacity: 1; transform: scale(1); }
                      }
                    `}</style>
                  </div>
                </Html>
              )}
            </MobileOrbitalRotator>
          ) : (
            <OrbitalSystem searchTerm={searchTerm} />
          )}
         
          {/* OrbitControls - Disabled on mobile */}
          {!isMobile && (
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
          )}
        </Canvas>
      </div>
    </div>
  )
}