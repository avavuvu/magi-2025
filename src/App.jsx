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
    
    // CRITICAL: Cleanup on unmount to prevent memory leak
    return () => {
      if (window.__orbitalGroupRef) {
        delete window.__orbitalGroupRef
      }
    }
  }, [])

  return <group ref={groupRef}>{children}</group>
}

// NEW: Mobile Search Component - Desktop styled
function MobileSearchBar({ asteroidData, onProfileSelect, currentProfileIndex, onSearchActiveChange }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredProfiles, setFilteredProfiles] = useState([])
  const [showResults, setShowResults] = useState(false)
  
  // Notify parent when search results are shown/hidden
  useEffect(() => {
    if (onSearchActiveChange) {
      onSearchActiveChange(showResults && (filteredProfiles.length > 0 || searchTerm.trim() !== ''))
    }
  }, [showResults, filteredProfiles.length, searchTerm, onSearchActiveChange])
  
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProfiles([])
      setShowResults(false)
      return
    }
    
    const term = searchTerm.toLowerCase()
    const filtered = asteroidData
      .map((profile, index) => ({ ...profile, originalIndex: index }))
      .filter(profile => 
        profile.name?.toLowerCase().includes(term) ||
        profile.major?.toLowerCase().includes(term) ||
        profile.bio?.toLowerCase().includes(term) ||
        profile.workTitle?.toLowerCase().includes(term)
      )
      .slice(0, 5) // Limit to 5 results for mobile
    
    setFilteredProfiles(filtered)
    setShowResults(true)
  }, [searchTerm, asteroidData])
  
  const handleProfileClick = (index) => {
    onProfileSelect(index)
    setSearchTerm('')
    setFilteredProfiles([])
    setShowResults(false)
  }
  
  return (
    <div style={{
      position: 'relative',
      width: '100%'
    }}>
      {/* Search Input - Desktop Style */}
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search students"
        style={{
          width: '100%',
          padding: '10px 15px',
          background: 'rgba(0, 0, 0, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '4px',
          color: '#ffffff',
          fontFamily: 'monospace',
          fontSize: '16px', // 16px prevents iOS zoom
          outline: 'none',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          touchAction: 'manipulation' // Prevent zoom gestures
        }}
        onFocus={() => {
          if (searchTerm.trim() !== '') {
            setShowResults(true)
          }
        }}
      />
      
      {/* Search Results Dropdown */}
      {showResults && filteredProfiles.length > 0 && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 5px)',
          left: 0,
          right: 0,
          background: 'rgba(0, 0, 0, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '4px',
          maxHeight: '300px',
          overflowY: 'auto',
          zIndex: 10003,
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
        }}>
          {filteredProfiles.map((profile, idx) => (
            <button
              key={idx}
              onClick={() => handleProfileClick(profile.originalIndex)}
              style={{
                width: '100%',
                padding: '10px 15px',
                background: profile.originalIndex === currentProfileIndex 
                  ? 'rgba(233, 53, 158, 0.2)' 
                  : 'transparent',
                border: 'none',
                borderBottom: idx < filteredProfiles.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                color: '#ffffff',
                fontFamily: 'monospace',
                fontSize: '13px', // Increased from 11px
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => {
                if (profile.originalIndex !== currentProfileIndex) {
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                }
              }}
              onMouseLeave={(e) => {
                if (profile.originalIndex !== currentProfileIndex) {
                  e.target.style.background = 'transparent'
                }
              }}
            >
              <div style={{ 
                fontWeight: 'bold', 
                color: '#e9359e',
                marginBottom: '4px',
                fontSize: '13px' // Added explicit size for name
              }}>
                {profile.name}
              </div>
              {profile.major && (
                <div style={{ 
                  color: '#aaaaaa',
                  fontSize: '11px' // Increased from 10px
                }}>
                  {profile.major}
                </div>
              )}
              {profile.workTitle && (
                <div style={{ 
                  color: '#cccccc',
                  fontSize: '10px', // Increased from 9px
                  fontStyle: 'italic',
                  marginTop: '2px'
                }}>
                  "{profile.workTitle}"
                </div>
              )}
            </button>
          ))}
        </div>
      )}
      
      {/* No Results Message */}
      {showResults && searchTerm.trim() !== '' && filteredProfiles.length === 0 && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 5px)',
          left: 0,
          right: 0,
          background: 'rgba(0, 0, 0, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '4px',
          padding: '20px',
          zIndex: 10003,
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          textAlign: 'center',
          color: '#aaaaaa',
          fontFamily: 'monospace',
          fontSize: '13px' // Increased from 11px
        }}>
          No students found matching "{searchTerm}"
        </div>
      )}
    </div>
  )
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
  const [displayProfileIndex, setDisplayProfileIndex] = useState(-1) // NEW: Debounced display index
  const [searchActive, setSearchActive] = useState(false) // Track if search results are shown
  const [touchStartX, setTouchStartX] = useState(0)
  const [touchStartTime, setTouchStartTime] = useState(0)
  const [lastTouchX, setLastTouchX] = useState(0)
  const [velocity, setVelocity] = useState(0)
  const [hasSwipedOnce, setHasSwipedOnce] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [selectedWorkIndex, setSelectedWorkIndex] = useState(0)
  const [isTitleExpanded, setIsTitleExpanded] = useState(false)
  const [workSwipeStartX, setWorkSwipeStartX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [orbitalRotation, setOrbitalRotation] = useState(0)
  const lastRotationRef = useRef(0)
  const animationFrameRef = useRef(null) // NEW: Track animation frame
  const lastUpdateTimeRef = useRef(0) // NEW: Track last update time for throttling
  const profileUpdateTimeoutRef = useRef(null) // NEW: For debouncing profile display updates
  
  const canvasRef = useRef()
  
  // Get asteroid data for mobile profiles
  const { asteroidData: rawAsteroidData, isLoading } = useAsteroidData()
  
  const asteroidData = useMemo(() => {
    return rawAsteroidData.filter(profile => 
      profile && 
      profile.name && 
      profile.name.trim() !== '' &&
      profile.studentNumber &&
      profile.studentNumber.trim() !== ''
    )
  }, [rawAsteroidData])
  
  // Reset work selection when displayed profile changes
  useEffect(() => {
    setSelectedWorkIndex(0)
    setIsTitleExpanded(false)
  }, [displayProfileIndex])
  
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value)
  }, [])

  // NEW: Handle closing with animation
  const handleClose = useCallback(() => {
    setIsClosing(true)
    setSelectedWorkIndex(0) // Reset work selection
    setTimeout(() => {
      setHasSwipedOnce(false)
      setCurrentProfileIndex(-1)
      setDisplayProfileIndex(-1) // Reset display index
      setOrbitalRotation(0)
      lastRotationRef.current = 0
      if (window.__orbitalGroupRef) {
        window.__orbitalGroupRef.rotation.y = 0
      }
      setIsClosing(false)
    }, 300) // Match fadeOut animation duration
  }, [])

  // NEW: Jump to specific profile from search
  const handleProfileSelect = useCallback((targetIndex) => {
    if (!isMobile || asteroidData.length === 0) return
    
    // Cancel any ongoing animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    
    const segmentSize = (Math.PI * 2) / asteroidData.length
    const targetRotation = targetIndex * segmentSize
    const startRotation = orbitalRotation
    const duration = 600
    const startTime = Date.now()
    
    // Enable profile view if not already
    if (!hasSwipedOnce) {
      setHasSwipedOnce(true)
    }
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      
      // Calculate shortest rotation path
      let delta = targetRotation - startRotation
      const twoPi = Math.PI * 2
      
      // Normalize delta to be between -PI and PI
      while (delta > Math.PI) delta -= twoPi
      while (delta < -Math.PI) delta += twoPi
      
      const currentRot = startRotation + delta * easeProgress
      
      if (window.__orbitalGroupRef) {
        window.__orbitalGroupRef.rotation.y = currentRot
        setOrbitalRotation(currentRot)
      }
      
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate)
      } else {
        lastRotationRef.current = targetRotation
        setCurrentProfileIndex(targetIndex)
        setDisplayProfileIndex(targetIndex) // Update display immediately
        animationFrameRef.current = null
      }
    }
    
    animate()
  }, [isMobile, asteroidData.length, orbitalRotation, hasSwipedOnce])

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
        // NEW: Cancel animation on desktop switch
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
          animationFrameRef.current = null
        }
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    // Cleanup animation on unmount and add visibility change handler to pause when hidden
    const handleVisibilityChange = () => {
      if (document.hidden && animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
return () => {
      window.removeEventListener('resize', checkMobile)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      // CRITICAL: Clean up window reference to prevent memory leak
      if (window.__orbitalGroupRef) {
        delete window.__orbitalGroupRef
      }
    }
  }, [])

  // Mobile touch handlers for orbital rotation
  const handleTouchStart = useCallback((e) => {
    if (!isMobile) return
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    
    const currentRotation = window.__orbitalGroupRef?.rotation.y || 0
    lastRotationRef.current = currentRotation
    
    setTouchStartX(e.touches[0].clientX)
    setLastTouchX(e.touches[0].clientX)
    setTouchStartTime(Date.now())
    setVelocity(0)
    setIsDragging(true)
    
    if (!hasSwipedOnce) {
      setHasSwipedOnce(true)
      setCurrentProfileIndex(0)
      setDisplayProfileIndex(0)
    }
  }, [isMobile, hasSwipedOnce])

  const handleTouchMove = useCallback((e) => {
    if (!isMobile || !isDragging) return
    
    const currentTime = Date.now()
    
    // Throttle updates to every 32ms (~30fps) - more aggressive to prevent crashes
    if (currentTime - lastUpdateTimeRef.current < 32) {
      return
    }
    lastUpdateTimeRef.current = currentTime
    
    const currentX = e.touches[0].clientX
    
    // Calculate rotation based on drag distance - Heavy weight, requires 3-4 cycles for all entries
    const dragDelta = currentX - touchStartX
    const rotationDelta = (dragDelta / window.innerWidth) * Math.PI * 0.25 // Reduced from 0.8 to 0.25 (70% reduction)
    const newRotation = lastRotationRef.current + rotationDelta
    
    // Calculate velocity for momentum (but don't update state every frame)
    const timeDelta = currentTime - touchStartTime
    const moveDelta = currentX - lastTouchX
    if (timeDelta > 0) {
      // Much lower velocity cap for heavy, weighty feel (reduced from 25 to 12)
      const newVelocity = Math.min(Math.max((moveDelta / timeDelta) * 16, -12), 12)
      setVelocity(newVelocity)
    }
    
    setLastTouchX(currentX)
    
    // Apply rotation ONLY to the visual - skip React state during drag
    if (window.__orbitalGroupRef) {
      window.__orbitalGroupRef.rotation.y = newRotation
      // Don't update React state during drag - only update visual
    }
    
    // REMOVED: No live profile updates during drag - reduces state updates and flickering
  }, [isMobile, isDragging, touchStartX, touchStartTime, lastTouchX])

  const handleTouchEnd = useCallback(() => {
    if (!isMobile || !isDragging || asteroidData.length === 0) return
    
    setIsDragging(false)
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    
    if (profileUpdateTimeoutRef.current) {
      clearTimeout(profileUpdateTimeoutRef.current)
      profileUpdateTimeoutRef.current = null
    }
    
    const actualCurrentRotation = window.__orbitalGroupRef?.rotation.y || 0
    const segmentSize = (Math.PI * 2) / asteroidData.length
    
    const normalizedRotation = ((actualCurrentRotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
    const immediateIndex = Math.round(normalizedRotation / segmentSize) % asteroidData.length
    setCurrentProfileIndex(immediateIndex)
    setDisplayProfileIndex(immediateIndex)
    
    // ROULETTE-STYLE MOMENTUM SPIN with heavy, weighty feel
    const friction = 0.985
    const minVelocity = 0.008
    const maxVelocity = 0.05
    
    // Very low velocity multiplier for heavy, deliberate movement
    let currentVelocity = Math.min(Math.max(velocity * 0.003, -maxVelocity), maxVelocity) // Reduced from 0.006 to 0.003
    let currentRotation = actualCurrentRotation // Use actual rotation, not stale state
    
    let frameCount = 0
    const maxFrames = 60
    let consecutiveSlowFrames = 0
    let lastFrameTime = performance.now()
    
    const momentumSpin = () => {
      const currentFrameTime = performance.now()
      const frameDelta = currentFrameTime - lastFrameTime
      lastFrameTime = currentFrameTime
      
      // Emergency stop if frames are too slow (more than 50ms = less than 20fps)
      if (frameDelta > 50) {
        consecutiveSlowFrames++
        if (consecutiveSlowFrames > 3) {
          lastRotationRef.current = currentRotation
          const finalIndex = Math.round(((currentRotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) / segmentSize) % asteroidData.length
          setCurrentProfileIndex(finalIndex)
          setDisplayProfileIndex(finalIndex)
          animationFrameRef.current = null
          return
        }
      } else {
        consecutiveSlowFrames = 0
      }
      
      frameCount++ // Increment frame counter
      
      // Safety check: stop after max frames
      if (frameCount > maxFrames) {
        lastRotationRef.current = currentRotation // Keep actual rotation
        const finalIndex = Math.round(((currentRotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) / segmentSize) % asteroidData.length
        setCurrentProfileIndex(finalIndex)
        animationFrameRef.current = null
        return
      }
      
      currentVelocity *= friction
      
      if (Math.abs(currentVelocity) > minVelocity) {
        currentRotation += currentVelocity
        
        if (window.__orbitalGroupRef) {
          window.__orbitalGroupRef.rotation.y = currentRotation
        }
        
        if (frameCount % 80 === 0) {
          const normalizedRotation = ((currentRotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
          const currentIndex = Math.round(normalizedRotation / segmentSize) % asteroidData.length
          if (currentIndex !== currentProfileIndex) {
            setCurrentProfileIndex(currentIndex)
            setDisplayProfileIndex(currentIndex)
          }
        }
        
        animationFrameRef.current = requestAnimationFrame(momentumSpin)
      } else {
        // SNAP TO NEAREST PROFILE when momentum stops
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
            animationFrameRef.current = requestAnimationFrame(snapAnimate)
          } else {
            lastRotationRef.current = targetRotation
            setCurrentProfileIndex(profileIndex)
            animationFrameRef.current = null
          }
        }
        
        snapAnimate()
      }
    }
    
    if (Math.abs(currentVelocity) > minVelocity) {
      animationFrameRef.current = requestAnimationFrame(momentumSpin)
    } else {
      const normalizedRotation = ((currentRotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
      const nearestIndex = Math.round(normalizedRotation / segmentSize) % asteroidData.length
      lastRotationRef.current = nearestIndex * segmentSize
      setCurrentProfileIndex(nearestIndex)
      setDisplayProfileIndex(nearestIndex)
    }
  }, [isMobile, isDragging, asteroidData.length, velocity, currentProfileIndex])

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

  const currentProfile = displayProfileIndex >= 0 ? asteroidData[displayProfileIndex] : null
  
  // Get current work info for profiles with multiple works
  const hasMultipleWorks = currentProfile?.works && currentProfile.works.length > 1
  const currentWork = currentProfile?.works?.[selectedWorkIndex] || {
    title: currentProfile?.workTitle || 'Untitled Work',
    type: currentProfile?.workType || 'Creative Work'
  }

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      position: 'relative', 
      overflow: 'hidden',
      touchAction: 'pan-x pan-y' // Allow panning but prevent pinch-zoom
    }}>
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
            
          {/* NEW: Mobile Search Bar - Centered between logo and button */}
          {isMobile && asteroidData.length > 0 && (
            <div style={{
              position: 'absolute',
              left: '46%',
              transform: 'translateX(-50%) scale(0.75)', // Scale down visually
              transformOrigin: 'center',
              width: 'calc((100% - 380px) / 0.75)', // Compensate for scale
              maxWidth: '600px', // Adjusted for scale
              minWidth: '226px', // Adjusted for scale
              display: 'flex',
              justifyContent: 'center'
            }}>
              <MobileSearchBar 
                asteroidData={asteroidData}
                onProfileSelect={handleProfileSelect}
                currentProfileIndex={currentProfileIndex}
                onSearchActiveChange={setSearchActive}
              />
            </div>
          )}
         
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
      {isMobile && hasSwipedOnce && currentProfile && !searchActive && (
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
          {displayProfileIndex + 1} / {asteroidData.length}
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
          dpr={isMobile ? [0.75, 1] : [1, 1]}
          performance={{ min: 0.3, max: 0.8, debounce: 200 }}
          gl={{
            ...glSettings,
            toneMapping: THREE.NoToneMapping,
            powerPreference: "high-performance",
            antialias: false,
            alpha: false,
            stencil: false
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
                hideBanner={hasSwipedOnce && !searchActive}
                isMobile={isMobile}
              />
              
              {/* Mobile Profile Card - Inside Canvas */}
              {hasSwipedOnce && currentProfile && !searchActive && (
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
                    animation: isClosing ? 'fadeOut 0.3s ease-out' : 'fadeIn 0.3s ease-out',
                    width: '60vw',
                    maxWidth: '320px',
                    transform: 'translate(0, 0)',
                    pointerEvents: 'auto'
                  }}>
                    <div 
                      onTouchStart={(e) => {
                        if (hasMultipleWorks) {
                          setWorkSwipeStartX(e.touches[0].clientX)
                        }
                      }}
                      onTouchEnd={(e) => {
                        if (hasMultipleWorks && workSwipeStartX) {
                          const swipeDelta = e.changedTouches[0].clientX - workSwipeStartX
                          if (Math.abs(swipeDelta) > 50) {
                            if (swipeDelta > 0) {
                              setSelectedWorkIndex((prev) => 
                                (prev - 1 + currentProfile.works.length) % currentProfile.works.length
                              )
                            } else {
                              setSelectedWorkIndex((prev) => 
                                (prev + 1) % currentProfile.works.length
                              )
                            }
                          }
                          setWorkSwipeStartX(0)
                        }
                      }}
                      style={{
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
                          handleClose()
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
                          loading="lazy"
                          decoding="async"
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

                      {/* Work Type Badge with Inline Work Navigation */}
                      <div style={{
                        textAlign: 'center',
                        marginBottom: '12px',
                        height: '22px', // Fixed height matching original badge height
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}>
                        {/* Previous work arrow */}
                        {hasMultipleWorks && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedWorkIndex((prev) => 
                                prev === 0 ? currentProfile.works.length - 1 : prev - 1
                              )
                            }}
                            onTouchStart={(e) => e.stopPropagation()}
                            onTouchEnd={(e) => {
                              e.stopPropagation()
                              setSelectedWorkIndex((prev) => 
                                prev === 0 ? currentProfile.works.length - 1 : prev - 1
                              )
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#e9359e',
                              fontSize: '16px', // Increased from 12px for larger arrow
                              cursor: 'pointer',
                              padding: '8px', // Added padding for larger hit area
                              margin: '-8px', // Negative margin to maintain visual position
                              opacity: 0.6,
                              transition: 'opacity 0.2s',
                              outline: 'none',
                              minWidth: '32px', // Minimum touch target size
                              minHeight: '32px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            ‹
                          </button>
                        )}
                        
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
                          {currentWork.type}
                          {hasMultipleWorks && (
                            <span style={{ 
                              marginLeft: '6px',
                              fontSize: '7px',
                              opacity: 0.7
                            }}>
                              {selectedWorkIndex + 1}/{currentProfile.works.length}
                            </span>
                          )}
                        </span>
                        
                        {/* Next work arrow */}
                        {hasMultipleWorks && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedWorkIndex((prev) => 
                                (prev + 1) % currentProfile.works.length
                              )
                            }}
                            onTouchStart={(e) => e.stopPropagation()}
                            onTouchEnd={(e) => {
                              e.stopPropagation()
                              setSelectedWorkIndex((prev) => 
                                (prev + 1) % currentProfile.works.length
                              )
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#e9359e',
                              fontSize: '16px', // Increased from 12px for larger arrow
                              cursor: 'pointer',
                              padding: '8px', // Added padding for larger hit area
                              margin: '-8px', // Negative margin to maintain visual position
                              opacity: 0.6,
                              transition: 'opacity 0.2s',
                              outline: 'none',
                              minWidth: '32px', // Minimum touch target size
                              minHeight: '32px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            ›
                          </button>
                        )}
                      </div>

                      {/* Project Title - Always shown */}
                      {(() => {
                        const isLongTitle = currentWork.title && currentWork.title.length > 50
                        
                        return (
                          <div 
                            style={{
                              color: '#cccccc',
                              fontSize: '10px',
                              fontFamily: 'monospace',
                              textAlign: 'center',
                              marginBottom: '10px',
                              fontStyle: 'italic',
                              minHeight: '20px',
                              maxHeight: isTitleExpanded ? '60px' : '20px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '0 12px',
                              overflow: 'hidden',
                              position: 'relative',
                              transition: 'max-height 0.3s ease'
                            }}
                          >
                            <div style={{
                              whiteSpace: isTitleExpanded ? 'normal' : 'nowrap',
                              overflow: 'hidden',
                              textOverflow: isTitleExpanded ? 'clip' : 'ellipsis',
                              lineHeight: '1.4',
                              wordBreak: 'break-word',
                              textAlign: 'center',
                              paddingRight: isLongTitle ? '20px' : '0'
                            }}>
                              {currentWork.title ? `"${currentWork.title}"` : '\u00A0'}
                            </div>
                            {isLongTitle && (
                              <button
                                onTouchEnd={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  setIsTitleExpanded(!isTitleExpanded)
                                }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#e9359e',
                                  fontSize: '8px',
                                  cursor: 'pointer',
                                  padding: '2px 4px',
                                  opacity: 0.7,
                                  outline: 'none',
                                  position: 'absolute',
                                  right: '4px'
                                }}
                              >
                                {isTitleExpanded ? '▲' : '▼'}
                              </button>
                            )}
                          </div>
                        )
                      })()}

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

                    {/* Swipe Indicators - MODIFIED: Using handleProfileSelect */}
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
                          handleProfileSelect(prevIndex)
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
                          handleProfileSelect(nextIndex)
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
                      @keyframes fadeOut {
                        from { opacity: 1; transform: scale(1); }
                        to { opacity: 0; transform: scale(0.95); }
                      }
                    `}</style>
                  </div>
                </Html>
              )}
            </MobileOrbitalRotator>
          ) : (
            <OrbitalSystem 
              searchTerm={searchTerm}
              isMobile={isMobile}
            />
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