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
  const [touchStartTime, setTouchStartTime] = useState(0)
  const [lastTouchX, setLastTouchX] = useState(0)
  const [velocity, setVelocity] = useState(0)
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
    setLastTouchX(e.touches[0].clientX)
    setTouchStartTime(Date.now())
    setVelocity(0)
    setIsDragging(true)
    
    if (!hasSwipedOnce) {
      setHasSwipedOnce(true)
      setCurrentProfileIndex(0)
    }
  }, [isMobile, hasSwipedOnce])

  const handleTouchMove = useCallback((e) => {
    if (!isMobile || !isDragging) return
    
    const currentX = e.touches[0].clientX
    const currentTime = Date.now()
    
    // Calculate rotation based on drag distance - FREE FLOWING
    const dragDelta = currentX - touchStartX
    const rotationDelta = (dragDelta / window.innerWidth) * Math.PI * 1.5
    const newRotation = lastRotationRef.current + rotationDelta
    
    // Calculate velocity for momentum
    const timeDelta = currentTime - touchStartTime
    const moveDelta = currentX - lastTouchX
    if (timeDelta > 0) {
      setVelocity((moveDelta / timeDelta) * 16) // Scale for smoother momentum
    }
    
    setLastTouchX(currentX)
    
    // Apply rotation to the orbital system
    if (window.__orbitalGroupRef) {
      window.__orbitalGroupRef.rotation.y = newRotation
      setOrbitalRotation(newRotation)
    }
    
    // LIVE UPDATE: Calculate which profile is currently closest
    if (asteroidData.length > 0) {
      const segmentSize = (Math.PI * 2) / asteroidData.length
      const normalizedRotation = ((newRotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
      const liveProfileIndex = Math.round(normalizedRotation / segmentSize) % asteroidData.length
      setCurrentProfileIndex(liveProfileIndex)
    }
  }, [isMobile, isDragging, touchStartX, touchStartTime, lastTouchX, asteroidData.length])

  const handleTouchEnd = useCallback(() => {
    if (!isMobile || !isDragging || asteroidData.length === 0) return
    
    setIsDragging(false)
    
    // ROULETTE-STYLE MOMENTUM SPIN
    const friction = 0.95 // How quickly the spin slows down
    const minVelocity = 0.001 // Minimum velocity before stopping
    let currentVelocity = velocity * 0.01 // Convert to rotation velocity
    let currentRotation = orbitalRotation
    
    const momentumSpin = () => {
      currentVelocity *= friction
      currentRotation += currentVelocity
      
      if (window.__orbitalGroupRef) {
        window.__orbitalGroupRef.rotation.y = currentRotation
        setOrbitalRotation(currentRotation)
      }
      
      // LIVE UPDATE during momentum: Update profile index continuously
      if (asteroidData.length > 0) {
        const segmentSize = (Math.PI * 2) / asteroidData.length
        const normalizedRotation = ((currentRotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
        const liveProfileIndex = Math.round(normalizedRotation / segmentSize) % asteroidData.length
        setCurrentProfileIndex(liveProfileIndex)
      }
      
      // Continue spinning if velocity is significant
      if (Math.abs(currentVelocity) > minVelocity) {
        requestAnimationFrame(momentumSpin)
      } else {
        // SNAP TO NEAREST PROFILE when momentum stops
        const segmentSize = (Math.PI * 2) / asteroidData.length
        const normalizedRotation = ((currentRotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
        const profileIndex = Math.round(normalizedRotation / segmentSize) % asteroidData.length
        
        // Find the shortest path to snap (don't reset, just snap to nearest)
        // Calculate target rotation that's closest to current rotation
        const rawTargetRotation = profileIndex * segmentSize
        
        // Find all possible rotations for this profile (current rotation could be multiple spins around)
        const rotationOffset = Math.floor(currentRotation / (Math.PI * 2)) * (Math.PI * 2)
        const possibleTargets = [
          rotationOffset + rawTargetRotation,
          rotationOffset + rawTargetRotation - (Math.PI * 2),
          rotationOffset + rawTargetRotation + (Math.PI * 2)
        ]
        
        // Choose the target rotation closest to current rotation
        const snappedRotation = possibleTargets.reduce((closest, target) => {
          return Math.abs(target - currentRotation) < Math.abs(closest - currentRotation) 
            ? target 
            : closest
        })
        
        // Smooth snap animation
        const startRotation = currentRotation
        const targetRotation = snappedRotation
        const duration = 500
        const startTime = Date.now()
        
        const snapAnimate = () => {
          const elapsed = Date.now() - startTime
          const progress = Math.min(elapsed / duration, 1)
          const easeProgress = 1 - Math.pow(1 - progress, 3)
          
          const snapRotation = startRotation + (targetRotation - startRotation) * easeProgress
          
          if (window.__orbitalGroupRef) {
            window.__orbitalGroupRef.rotation.y = snapRotation
            setOrbitalRotation(snapRotation)
          }
          
          if (progress < 1) {
            requestAnimationFrame(snapAnimate)
          } else {
            lastRotationRef.current = targetRotation
            setCurrentProfileIndex(profileIndex)
          }
        }
        
        snapAnimate()
      }
    }
    
    momentumSpin()
  }, [isMobile, isDragging, asteroidData.length, orbitalRotation, velocity])

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
                    pointerEvents: 'auto',
                    userSelect: 'none'
                  }}
                >
                  <div style={{
                    animation: 'fadeIn 0.3s ease-out',
                    width: '60vw',
                    maxWidth: '320px',
                    transform: 'translate(0, 0)',
                    pointerEvents: 'auto'
                  }}>
                    <div style={{
                      background: 'rgba(0, 0, 0, 0.95)',
                      border: '2px solid rgba(233, 53, 158, 1)',
                      borderRadius: '0px',
                      padding: '16px',
                      backdropFilter: 'blur(20px)',
                      pointerEvents: 'auto',
                      position: 'relative'
                    }}>
                      {/* Close Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setHasSwipedOnce(false)
                          setCurrentProfileIndex(-1)
                          setOrbitalRotation(0)
                          lastRotationRef.current = 0
                          if (window.__orbitalGroupRef) {
                            window.__orbitalGroupRef.rotation.y = 0
                          }
                        }}
                        onTouchStart={(e) => e.stopPropagation()}
                        onTouchEnd={(e) => e.stopPropagation()}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: 'none',
                          border: 'none',
                          color: '#e9359e',
                          fontSize: '20px',
                          cursor: 'pointer',
                          padding: '0',
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0.6,
                          transition: 'opacity 0.2s',
                          outline: 'none',
                          lineHeight: 1,
                          fontFamily: 'monospace'
                        }}
                        onMouseEnter={(e) => e.target.style.opacity = '1'}
                        onMouseLeave={(e) => e.target.style.opacity = '0.6'}
                      >
                        ×
                      </button>

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
                        fontSize: '13.5px',
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
                          fontSize: '8px',
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
                          fontSize: '11px',
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
                        justifyContent: 'center',
                        WebkitOverflowScrolling: 'touch',
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'rgba(233, 53, 158, 0.5) transparent'
                      }}
                      onTouchStart={(e) => e.stopPropagation()}
                      onTouchMove={(e) => e.stopPropagation()}
                      onTouchEnd={(e) => e.stopPropagation()}
                      >
                        <div style={{ width: '100%' }}>
                          {currentProfile.bio || '\u00A0'}
                        </div>
                      </div>
                    </div>

                    {/* Swipe Indicators */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginTop: '10px',
                      padding: '0 16px',
                      color: '#e9359e',
                      fontSize: '20px',
                      opacity: 0.6,
                      pointerEvents: 'auto'
                    }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          const prevIndex = (currentProfileIndex - 1 + asteroidData.length) % asteroidData.length
                          const targetRotation = prevIndex * ((Math.PI * 2) / asteroidData.length)
                          
                          // Animate rotation
                          const startRotation = orbitalRotation
                          const duration = 400
                          const startTime = Date.now()
                          
                          const animate = () => {
                            const elapsed = Date.now() - startTime
                            const progress = Math.min(elapsed / duration, 1)
                            const easeProgress = 1 - Math.pow(1 - progress, 3)
                            const currentRot = startRotation + (targetRotation - startRotation) * easeProgress
                            
                            if (window.__orbitalGroupRef) {
                              window.__orbitalGroupRef.rotation.y = currentRot
                              setOrbitalRotation(currentRot)
                            }
                            
                            if (progress < 1) {
                              requestAnimationFrame(animate)
                            } else {
                              lastRotationRef.current = targetRotation
                              setCurrentProfileIndex(prevIndex)
                            }
                          }
                          
                          animate()
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#e9359e',
                          fontSize: '20px',
                          cursor: 'pointer',
                          padding: '0',
                          opacity: 0.6,
                          transition: 'opacity 0.2s',
                          outline: 'none'
                        }}
                        onMouseDown={(e) => e.target.style.opacity = '1'}
                        onMouseUp={(e) => e.target.style.opacity = '0.6'}
                        onMouseLeave={(e) => e.target.style.opacity = '0.6'}
                        onTouchStart={(e) => {
                          e.stopPropagation()
                          e.target.style.opacity = '1'
                        }}
                        onTouchEnd={(e) => {
                          e.stopPropagation()
                          e.target.style.opacity = '0.6'
                        }}
                      >
                        ‹
                      </button>
                      <span style={{ fontSize: '10px', alignSelf: 'center', fontFamily: 'monospace', pointerEvents: 'none' }}>
                        Swipe to browse
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          const nextIndex = (currentProfileIndex + 1) % asteroidData.length
                          const targetRotation = nextIndex * ((Math.PI * 2) / asteroidData.length)
                          
                          // Animate rotation
                          const startRotation = orbitalRotation
                          const duration = 400
                          const startTime = Date.now()
                          
                          const animate = () => {
                            const elapsed = Date.now() - startTime
                            const progress = Math.min(elapsed / duration, 1)
                            const easeProgress = 1 - Math.pow(1 - progress, 3)
                            const currentRot = startRotation + (targetRotation - startRotation) * easeProgress
                            
                            if (window.__orbitalGroupRef) {
                              window.__orbitalGroupRef.rotation.y = currentRot
                              setOrbitalRotation(currentRot)
                            }
                            
                            if (progress < 1) {
                              requestAnimationFrame(animate)
                            } else {
                              lastRotationRef.current = targetRotation
                              setCurrentProfileIndex(nextIndex)
                            }
                          }
                          
                          animate()
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#e9359e',
                          fontSize: '20px',
                          cursor: 'pointer',
                          padding: '0',
                          opacity: 0.6,
                          transition: 'opacity 0.2s',
                          outline: 'none'
                        }}
                        onMouseDown={(e) => e.target.style.opacity = '1'}
                        onMouseUp={(e) => e.target.style.opacity = '0.6'}
                        onMouseLeave={(e) => e.target.style.opacity = '0.6'}
                        onTouchStart={(e) => {
                          e.stopPropagation()
                          e.target.style.opacity = '1'
                        }}
                        onTouchEnd={(e) => {
                          e.stopPropagation()
                          e.target.style.opacity = '0.6'
                        }}
                      >
                        ›
                      </button>
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