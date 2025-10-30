import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import { OrbitalSystem, SearchBar } from './OrbitalSystem'
import { useAsteroidData } from './ProfileSystem'
import * as THREE from 'three'
import './responsive.css'

// Category Side Window Component - NEW DESKTOP FEATURE
function CategorySideWindow({ category, asteroidData, onClose }) {
  const [isVisible, setIsVisible] = useState(false)
  const [expandedStudents, setExpandedStudents] = useState(new Set())
  const [selectedProfile, setSelectedProfile] = useState(null)
  
  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  // Group students with multiple works in this category
 const studentsData = useMemo(() => {
    if (!category || !asteroidData) return []
    
    const studentMap = new Map()
    
    // Normalize work type helper
    const normalizeWorkType = (type) => {
      const lower = type.toLowerCase()
      return lower === 'video essay' ? 'research' : lower
    }
    
    asteroidData.forEach(profile => {
      const normalizedWorkType = normalizeWorkType(profile?.workType || '')
      const normalizedCategory = normalizeWorkType(category)
      
      if (normalizedWorkType === normalizedCategory) {
        const name = profile.name
        if (!studentMap.has(name)) {
          studentMap.set(name, [])
        }
        studentMap.get(name).push({
          title: profile.workTitle || 'Untitled',
          type: profile.workType.toLowerCase() === 'video essay' ? 'Research' : profile.workType,
          fullProfile: profile
        })
      }
    })
    
    return Array.from(studentMap.entries()).map(([name, works]) => ({
      name,
      works,
      hasMultiple: works.length > 1
    }))
  }, [category, asteroidData])

  const toggleStudent = (studentName) => {
    setExpandedStudents(prev => {
      const newSet = new Set(prev)
      if (newSet.has(studentName)) {
        newSet.delete(studentName)
      } else {
        newSet.add(studentName)
      }
      return newSet
    })
  }

  const handleStudentClick = (student) => {
    setSelectedProfile(student.works[0].fullProfile)
  }

  return (
    <>
      <div style={{
        position: 'fixed',
        top: '100px',
        right: '20px',
        width: '280px',
        maxHeight: '500px',
        background: 'rgba(0, 0, 0, 0.85)',
        border: '1px solid rgba(255, 255, 255, 1)',
        zIndex: 10000,
        transform: isVisible ? 'translateY(0)' : 'translateY(-20px)',
        opacity: isVisible ? 1 : 0,
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'monospace'
      }}>
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            background: '#e9359e',
            color: '#ffffff',
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            fontWeight: 'bold',
            padding: '8px 13px',
            fontFamily: 'monospace'
          }}>
            {category}
          </div>
          <div style={{
            color: 'rgba(255, 255, 255, 0.4)',
            fontSize: '11px',
            fontFamily: 'monospace',
            marginLeft: '12px'
          }}>
            {studentsData.length}
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.5)',
              cursor: 'pointer',
              fontSize: '18px',
              padding: 0,
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.2s',
              marginLeft: 'auto'
            }}
            onMouseEnter={(e) => e.target.style.color = '#ffffff'}
            onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.5)'}
          >
            ×
          </button>
        </div>

        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px'
        }}>
          {studentsData.length === 0 ? (
            <div style={{
              color: 'rgba(255, 255, 255, 0.3)',
              fontSize: '10px',
              textAlign: 'center',
              marginTop: '40px'
            }}>
              No students found
            </div>
          ) : (
            studentsData.map((student, index) => (
              <div key={index} style={{ marginBottom: '8px' }}>
                <div
                  onClick={() => {
                    if (student.hasMultiple) {
                      toggleStudent(student.name)
                    } else {
                      handleStudentClick(student)
                    }
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '10px 12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        marginBottom: student.hasMultiple && !expandedStudents.has(student.name) ? '2px' : 0
                      }}>
                        {student.name}
                      </div>
                      {!student.hasMultiple && student.works[0] && (
                        <div style={{
                          color: 'rgba(255, 255, 255, 0.5)',
                          fontSize: '10px',
                          marginTop: '3px',
                          lineHeight: '1.3'
                        }}>
                          {student.works[0].title}
                        </div>
                      )}
                    </div>
                    {student.hasMultiple && (
                      <span style={{ 
                        fontSize: '9px', 
                        color: 'rgba(255, 255, 255, 0.4)',
                        marginLeft: '12px',
                        flexShrink: 0
                      }}>
                        {expandedStudents.has(student.name) ? '−' : `+${student.works.length}`}
                      </span>
                    )}
                  </div>
                </div>
                
                {student.hasMultiple && expandedStudents.has(student.name) && (
                  <div style={{
                    padding: '8px 12px 8px 24px',
                    background: 'rgba(0, 0, 0, 0.2)',
                    borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                    marginLeft: '12px',
                    marginTop: '4px'
                  }}>
                    {student.works.map((work, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedProfile(work.fullProfile)}
                        style={{
                          color: 'rgba(255, 255, 255, 0.6)',
                          fontSize: '10px',
                          marginBottom: idx < student.works.length - 1 ? '6px' : 0,
                          lineHeight: '1.3',
                          cursor: 'pointer',
                          transition: 'color 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.9)'}
                        onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.6)'}
                      >
                        {work.title}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Profile Card */}
      {selectedProfile && (
        <div style={{
          position: 'fixed',
          top: '100px',
          left: '80px',
          width: '280px',
          maxHeight: '350px',
          background: 'rgba(0, 0, 0, 0.95)',
          border: '1px solid rgba(255, 255, 255, 1)',
          padding: '16px',
          zIndex: 10001,
          fontFamily: 'monospace',
          animation: 'fadeIn 0.3s ease-out',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <button
            onClick={() => setSelectedProfile(null)}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.5)',
              cursor: 'pointer',
              fontSize: '18px',
              padding: 0,
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.2s',
              zIndex: 1
            }}
            onMouseEnter={(e) => e.target.style.color = '#ffffff'}
            onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.5)'}
          >
            ×
          </button>

          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '12px'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              flexShrink: 0
            }}>
              <img 
                src={selectedProfile.studentNumber 
                  ? `/profiles/${selectedProfile.studentNumber}.webp`
                  : '/profiles/placeholder.webp'
                }
                alt={selectedProfile.name}
                loading="lazy"
                onError={(e) => {
                  e.target.src = '/profiles/placeholder.webp'
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '4px',
                  objectFit: 'cover',
                  border: '1px solid rgba(233, 53, 158, 0.5)'
                }}
              />
            </div>
            
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '13px',
                fontWeight: 'bold',
                color: '#ffffff',
                marginBottom: '4px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {selectedProfile.name}
              </div>
              
              <div style={{
                fontSize: '10px',
                color: 'rgba(233, 53, 158, 1)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {selectedProfile.workType}
              </div>
            </div>
          </div>

          {selectedProfile.works && selectedProfile.works.length > 0 && (
            <div style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              paddingTop: '12px',
              marginBottom: '12px'
            }}>
              <div style={{
                fontSize: '10px',
                color: 'rgba(255, 255, 255, 0.5)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '8px'
              }}>
                Works ({selectedProfile.works.length})
              </div>
              <div style={{
                maxHeight: '120px',
                overflowY: 'auto',
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(233, 53, 158, 0.5) transparent'
              }}>
                {selectedProfile.works.map((work, idx) => (
                  <div
                    key={idx}
                    style={{
                      fontSize: '11px',
                      color: '#e9359e',
                      marginBottom: idx < selectedProfile.works.length - 1 ? '6px' : 0,
                      paddingLeft: '8px',
                      borderLeft: '2px solid rgba(233, 53, 158, 0.3)',
                      lineHeight: '1.3'
                    }}
                  >
                    {work.title || 'Untitled'}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{
            fontSize: '11px',
            color: '#cccccc',
            lineHeight: '1.4',
            height: '80px',
            overflowY: 'auto',
            paddingRight: '4px',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(233, 53, 158, 0.5) transparent'
          }}>
            {selectedProfile.bio || 'No bio available'}
          </div>

          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateX(-20px); }
              to { opacity: 1; transform: translateX(0); }
            }
          `}</style>
        </div>
      )}
    </>
  )
}

// Mobile Orbital Rotator - ORIGINAL
function MobileOrbitalRotator({ children, onRotationChange, enabled }) {
  const groupRef = useRef()
  
  useEffect(() => {
    if (enabled && onRotationChange && groupRef.current) {
      onRotationChange(groupRef.current.rotation.y)
    }
  }, [enabled, onRotationChange])

  useEffect(() => {
    if (groupRef.current && window) {
      window.__orbitalGroupRef = groupRef.current
    }
    
    return () => {
      if (window.__orbitalGroupRef) {
        delete window.__orbitalGroupRef
      }
    }
  }, [])

  return <group ref={groupRef}>{children}</group>
}

// Mobile Search Component - ORIGINAL
function MobileSearchBar({ asteroidData, onProfileSelect, currentProfileIndex, onSearchActiveChange }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredProfiles, setFilteredProfiles] = useState([])
  const [showResults, setShowResults] = useState(false)
  
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
      .slice(0, 5)
    
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
    <div style={{ position: 'relative', width: '100%' }}>
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
          fontSize: '16px',
          outline: 'none',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          touchAction: 'manipulation'
        }}
        onFocus={() => {
          if (searchTerm.trim() !== '') {
            setShowResults(true)
          }
        }}
      />
      
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
                fontSize: '13px',
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
                fontSize: '13px'
              }}>
                {profile.name}
              </div>
              {profile.major && (
                <div style={{ color: '#aaaaaa', fontSize: '11px' }}>
                  {profile.major}
                </div>
              )}
              {profile.workTitle && (
                <div style={{ 
                  color: '#cccccc',
                  fontSize: '10px',
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
          fontSize: '13px'
        }}>
          No students found matching "{searchTerm}"
        </div>
      )}
    </div>
  )
}

// Archive Dropdown Component - NEW DESKTOP FEATURE
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
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  const [currentProfileIndex, setCurrentProfileIndex] = useState(-1)
  const [displayProfileIndex, setDisplayProfileIndex] = useState(-1)
  const [searchActive, setSearchActive] = useState(false)
  const [touchStartX, setTouchStartX] = useState(0)
  const [touchStartTime, setTouchStartTime] = useState(0)
  const [lastTouchX, setLastTouchX] = useState(0)
  const [velocity, setVelocity] = useState(0)
  const [hasSwipedOnce, setHasSwipedOnce] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [selectedWorkIndex, setSelectedWorkIndex] = useState(0)
  const [isTitleExpanded, setIsTitleExpanded] = useState(false)
  const [workSwipeStartX, setWorkSwipeStartX] = useState(0)
  const lastRotationRef = useRef(0)
  const animationFrameRef = useRef(null)
  const lastUpdateTimeRef = useRef(0)
  
  const canvasRef = useRef()
  
  const { asteroidData: rawAsteroidData } = useAsteroidData()
  
  const asteroidData = useMemo(() => {
    return rawAsteroidData.filter(profile => 
      profile && 
      profile.name && 
      profile.name.trim() !== '' &&
      profile.studentNumber &&
      profile.studentNumber.trim() !== ''
    )
  }, [rawAsteroidData])
  
  useEffect(() => {
    setSelectedWorkIndex(0)
    setIsTitleExpanded(false)
    setWorkSwipeStartX(0)
  }, [displayProfileIndex])
  
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value)
  }, [])

  const handleCategoryClick = useCallback((category) => {
    if (window.innerWidth > 768) {
      setSelectedCategory(category)
    }
  }, [])

  const handleCloseWindow = useCallback(() => {
    setSelectedCategory(null)
  }, [])

  const handleClose = useCallback(() => {
    setIsClosing(true)
    setSelectedWorkIndex(0)
    setTimeout(() => {
      setHasSwipedOnce(false)
      setCurrentProfileIndex(-1)
      setDisplayProfileIndex(-1)
      setIsClosing(false)
    }, 300)
  }, [])

  const handleProfileSelect = useCallback((index) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    
    setCurrentProfileIndex(index)
    setDisplayProfileIndex(index)
    setHasSwipedOnce(true)
    setVelocity(0)
    setIsDragging(false)
    
    const asteroid = asteroidData[index]
    if (asteroid && window.__orbitalGroupRef) {
      const angle = Math.atan2(asteroid.position[2], asteroid.position[0])
      const targetRotation = -angle + Math.PI / 2
      window.__orbitalGroupRef.rotation.y = targetRotation
      lastRotationRef.current = targetRotation
    }
  }, [asteroidData])

  // ORIGINAL MOBILE TOUCH HANDLERS
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
    
    if (currentTime - lastUpdateTimeRef.current < 32) {
      return
    }
    lastUpdateTimeRef.current = currentTime
    
    const currentX = e.touches[0].clientX
    
    const dragDelta = currentX - touchStartX
    const rotationDelta = (dragDelta / window.innerWidth) * Math.PI * 0.25
    const newRotation = lastRotationRef.current + rotationDelta
    
    const timeDelta = currentTime - touchStartTime
    const moveDelta = currentX - lastTouchX
    if (timeDelta > 0) {
      const newVelocity = Math.min(Math.max((moveDelta / timeDelta) * 16, -12), 12)
      setVelocity(newVelocity)
    }
    
    setLastTouchX(currentX)
    
    if (window.__orbitalGroupRef) {
      window.__orbitalGroupRef.rotation.y = newRotation
    }
  }, [isMobile, isDragging, touchStartX, touchStartTime, lastTouchX])

  const handleTouchEnd = useCallback(() => {
    if (!isMobile || !isDragging || asteroidData.length === 0) return
    
    setIsDragging(false)
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    
    const actualCurrentRotation = window.__orbitalGroupRef?.rotation.y || 0
    const segmentSize = (Math.PI * 2) / asteroidData.length
    
    const normalizedRotation = ((actualCurrentRotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
    const immediateIndex = Math.round(normalizedRotation / segmentSize) % asteroidData.length
    setCurrentProfileIndex(immediateIndex)
    setDisplayProfileIndex(immediateIndex)
    setHasSwipedOnce(true)
    
    const friction = 0.985
    const minVelocity = 0.008
    const maxVelocity = 0.05
    
    let currentVelocity = Math.min(Math.max(velocity * 0.003, -maxVelocity), maxVelocity)
    let currentRotation = actualCurrentRotation
    
    let frameCount = 0
    const maxFrames = 60
    let consecutiveSlowFrames = 0
    let lastFrameTime = performance.now()
    
    const momentumSpin = () => {
      const currentFrameTime = performance.now()
      const frameDelta = currentFrameTime - lastFrameTime
      lastFrameTime = currentFrameTime
      
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
      
      frameCount++
      
      if (frameCount > maxFrames) {
        lastRotationRef.current = currentRotation
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
        const normalizedRotation = ((currentRotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
        const profileIndex = Math.round(normalizedRotation / segmentSize) % asteroidData.length
        
        const rawTargetRotation = profileIndex * segmentSize
        const rotationOffset = Math.floor(currentRotation / (Math.PI * 2)) * (Math.PI * 2)
        const possibleTargets = [
          rotationOffset + rawTargetRotation,
          rotationOffset + rawTargetRotation - (Math.PI * 2),
          rotationOffset + rawTargetRotation + (Math.PI * 2)
        ]
        
        const snappedRotation = possibleTargets.reduce((closest, target) => {
          return Math.abs(target - currentRotation) < Math.abs(closest - currentRotation) 
            ? target 
            : closest
        })
        
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

  const cameraSettings = useMemo(() => ({
    position: isMobile ? [8, 6, 8] : [8, 8, 8],
    fov: 35,
    near: 0.1,
    far: 1000
  }), [isMobile])

  const glSettings = useMemo(() => ({
    antialias: false,
    powerPreference: "high-performance",
    alpha: false,
    stencil: false,
    depth: true,
    preserveDrawingBuffer: false
  }), [])

  const currentProfile = displayProfileIndex >= 0 ? asteroidData[displayProfileIndex] : null
  
  const hasMultipleWorks = currentProfile?.works && currentProfile.works.length > 1
  const currentWork = currentProfile?.works?.[selectedWorkIndex] || {
    title: currentProfile?.workTitle || 'Untitled Work',
    type: currentProfile?.workType || 'Creative Work'
  }

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      position: 'relative', 
      overflow: 'hidden',
      touchAction: 'pan-x pan-y'
    }}>
      {/* Category Side Window - Desktop Only */}
      {!isMobile && selectedCategory && (
        <CategorySideWindow 
          category={selectedCategory}
          asteroidData={asteroidData}
          onClose={handleCloseWindow}
        />
      )}

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
            
          {/* Mobile Search Bar */}
          {isMobile && asteroidData.length > 0 && (
            <div style={{
              position: 'absolute',
              left: '46%',
              transform: 'translateX(-50%) scale(0.75)',
              transformOrigin: 'center',
              width: 'calc((100% - 380px) / 0.75)',
              maxWidth: '600px',
              minWidth: '226px',
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

      {/* Profile Counter - Mobile */}
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

      {/* Canvas */}
      <div
        ref={canvasRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ 
          width: '100%', 
          height: '100%',
          touchAction: isMobile ? 'none' : 'auto'
        }}
      >
        <Canvas 
          camera={cameraSettings}
          dpr={isMobile ? [0.75, 1] : [1, 1]}
          gl={glSettings}
          frameloop="demand"
          performance={{ min: 0.5 }}
        >
          <color attach="background" args={['#000000']} />
          <fog attach="fog" args={['#000000', 10, 50]} />
          
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />

          {isMobile ? (
            <MobileOrbitalRotator enabled={hasSwipedOnce}>
              <OrbitalSystem 
                searchTerm={searchTerm}
                isMobile={isMobile}
                hideBanner={hasSwipedOnce && !searchActive}
                onCategoryClick={handleCategoryClick}
              />
              
              {/* Mobile Profile Card */}
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
                          e.stopPropagation()
                          setWorkSwipeStartX(e.touches[0].clientX)
                        }
                      }}
                      onTouchEnd={(e) => {
                        if (hasMultipleWorks && workSwipeStartX) {
                          e.stopPropagation()
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
                            setIsTitleExpanded(false)
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

                      <div style={{
                        textAlign: 'center',
                        marginBottom: '12px',
                        height: '22px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}>
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
                              fontSize: '16px',
                              cursor: 'pointer',
                              padding: '8px',
                              margin: '-8px',
                              opacity: 0.6,
                              transition: 'opacity 0.2s',
                              outline: 'none',
                              minWidth: '32px',
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
                              fontSize: '16px',
                              cursor: 'pointer',
                              padding: '8px',
                              margin: '-8px',
                              opacity: 0.6,
                              transition: 'opacity 0.2s',
                              outline: 'none',
                              minWidth: '32px',
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

                      {(() => {
                        const isLongTitle = currentWork.title && currentWork.title.length > 35
                        
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
              onCategoryClick={handleCategoryClick}
            />
          )}
         
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