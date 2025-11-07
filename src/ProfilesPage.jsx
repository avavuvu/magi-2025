import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAsteroidData } from './ProfileSystem'
import './profiles.css'

// Helper function to slugify work titles (matching ProfileSystem.jsx)
const slugify = (text) => {
  if (!text) return ''
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/-+/g, '-')        // Replace multiple hyphens with single
    .trim()
}

export default function ProfilesPage() {
  const { asteroidData } = useAsteroidData()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [currentSpotlightIndex, setCurrentSpotlightIndex] = useState(0)
  const [spotlightWorks, setSpotlightWorks] = useState([])
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024)
  
  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  // Initialize random spotlight works when data loads
  useEffect(() => {
    if (asteroidData && asteroidData.length > 0) {
      // Collect all works with their student info
      const allWorks = []
      asteroidData.forEach(profile => {
        if (profile.works && profile.works.length > 0) {
          profile.works.forEach(work => {
            allWorks.push({
              ...work,
              studentName: profile.name,
              studentNumber: profile.studentNumber,
              workType: profile.workType
            })
          })
        }
      })
      
      // Shuffle and pick 5 random works
      const shuffled = allWorks.sort(() => Math.random() - 0.5)
      setSpotlightWorks(shuffled.slice(0, 5))
    }
  }, [asteroidData])
  
  // Auto-advance slideshow every 5 seconds
  useEffect(() => {
    if (spotlightWorks.length > 1) {
      const interval = setInterval(() => {
        setCurrentSpotlightIndex(prev => (prev + 1) % spotlightWorks.length)
      }, 8500)
      return () => clearInterval(interval)
    }
  }, [spotlightWorks.length])
  
  // Show loading state if no data yet
  if (!asteroidData || asteroidData.length === 0) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#000',
        color: '#fff',
        fontFamily: 'monospace',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        padding: '20px'
      }}>
        <h1 style={{
          fontSize: isMobile ? '32px' : '48px',
          color: '#e9359e',
          letterSpacing: '3px',
          fontWeight: 'bold',
          margin: 0,
          textAlign: 'center'
        }}>
          LOADING PROFILES
        </h1>
        <p style={{
          fontSize: '14px',
          color: 'rgba(255, 255, 255, 0.6)',
          letterSpacing: '1px',
          textAlign: 'center'
        }}>
          Please wait while we load the profile database...
        </p>
        <div style={{
          width: '60px',
          height: '60px',
          border: '3px solid rgba(233, 53, 158, 0.2)',
          borderTop: '3px solid #e9359e',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }
  
  // Normalize work types
  const normalizeWorkType = (type) => {
    if (!type) return type
    const lower = type.toLowerCase()
    if (lower === 'video essay') return 'Research'
    if (lower === 'poster') return 'Interactivity'
    return type
  }
  
  // Get unique categories with normalized names
  const categories = [
    'all', 
    ...new Set(
      asteroidData
        .map(p => normalizeWorkType(p.workType))
        .filter(Boolean)
        .sort()
    )
  ]
  
  // Filter and sort profiles
  const filteredAndSortedProfiles = asteroidData
    .filter(profile => {
      const normalizedType = normalizeWorkType(profile.workType)
      
      // Category filter
      if (selectedCategory !== 'all' && normalizedType !== selectedCategory) {
        return false
      }
      
      // Search filter
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase()
        return (
          profile.name?.toLowerCase().includes(term) ||
          profile.bio?.toLowerCase().includes(term) ||
          profile.workTitle?.toLowerCase().includes(term) ||
          profile.works?.some(work => work.title?.toLowerCase().includes(term))
        )
      }
      
      return true
    })
    .sort((a, b) => {
      const nameA = (a.name || '').toLowerCase()
      const nameB = (b.name || '').toLowerCase()
      return nameA.localeCompare(nameB)
    })
  
  return (
    <div style={{ 
      minHeight: '100vh',
      background: '#000',
      color: '#fff',
      fontFamily: 'monospace',
      paddingTop: isMobile ? '80px' : '120px'
    }}>
      {/* Header */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: isMobile ? '80px' : '120px',
        background: 'rgba(0, 0, 0, 0.95)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '10px 15px' : '20px 40px',
        zIndex: 1000,
        backdropFilter: 'blur(10px)'
      }}>
        {/* Left Logo - Banner on mobile, Logo on desktop */}
        <img 
          src={isMobile ? "/MAGI_Banner.webp" : "/MAGI_Logo.png"}
          alt="MAGI"
          style={{
            position: 'absolute',
            left: isMobile ? '15px' : '40px',
            top: '50%',
            transform: 'translateY(-50%)',
            height: isMobile ? '35px' : '60px',
            width: 'auto',
            cursor: 'pointer',
            filter: 'brightness(1.2)',
            transition: 'filter 0.3s ease, transform 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.filter = 'brightness(1.5) drop-shadow(0 0 10px rgba(255,255,255,0.3))'
            e.target.style.transform = 'translateY(-50%) scale(1.05)'
          }}
          onMouseLeave={(e) => {
            e.target.style.filter = 'brightness(1.2)'
            e.target.style.transform = 'translateY(-50%) scale(1)'
          }}
          onClick={() => window.location.href = '/'}
        />
        
        {/* Center Banner & Text */}
        {!isMobile && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img 
              src="/MAGI_Banner.webp" 
              alt="MAGI" 
              style={{ 
                height: '50px',
                width: 'auto',
                filter: 'brightness(1.2)',
                marginBottom: '8px'
              }}
            />
            <div style={{
              fontSize: '14px',
              fontWeight: 'bold',
              letterSpacing: '3px',
              color: '#e9359e',
              textTransform: 'uppercase',
              fontFamily: 'monospace'
            }}>
              Profile Database
            </div>
          </div>
        )}
        
        {/* Right Button */}
        <button 
          onClick={() => window.location.href = '/'}
          style={{
            position: 'absolute',
            right: isMobile ? '15px' : '40px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(233, 53, 158, 0.2)',
            border: '1px solid #e9359e',
            color: '#e9359e',
            padding: isMobile ? '8px 12px' : '12px 24px',
            fontSize: isMobile ? '10px' : '12px',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            letterSpacing: '1px',
            cursor: 'pointer',
            transition: 'all 0.3s',
            textTransform: 'uppercase'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(233, 53, 158, 0.4)'
            e.target.style.transform = 'translateY(-50%) scale(1.05)'
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(233, 53, 158, 0.2)'
            e.target.style.transform = 'translateY(-50%) scale(1)'
          }}
        >
          {isMobile ? 'BACK' : 'BACK TO ORBITS'}
        </button>
      </div>

      {/* Spotlight Slideshow Section */}
      {spotlightWorks.length > 0 && (
        <div style={{
          position: 'relative',
          width: '100%',
          height: isMobile ? '400px' : '500px',
          marginTop: 0,
          overflow: 'hidden',
          background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.95) 100%)',
          borderTop: '2px solid rgba(233, 53, 158, 0.5)',
          borderBottom: '2px solid rgba(233, 53, 158, 0.5)'
        }}>
          {/* Slideshow Content */}
          {spotlightWorks.map((work, idx) => (
            <div
              key={`spotlight-${idx}`}
              onClick={() => navigate(`/profile/${work.studentNumber}`)}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: idx === currentSpotlightIndex ? 1 : 0,
                transition: 'opacity 1s ease-in-out',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {/* Background Image with Overlay */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: `url(/showcase/${work.studentNumber}-${slugify(work.title)}.webp) center/cover`,
                filter: 'blur(8px) brightness(0.4)',
                transform: 'scale(1.1)'
              }} 
              onError={(e) => {
                console.warn('Spotlight background image failed to load:', {
                  studentNumber: work.studentNumber,
                  title: work.title,
                  slugified: slugify(work.title),
                  expectedPath: `/showcase/${work.studentNumber}-${slugify(work.title)}.webp`
                })
                e.target.style.background = 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 50%, #1a1a1a 100%)'
              }}
              />
              
              {/* Content Container - Mobile Vertical Layout */}
              <div style={{
                position: 'relative',
                zIndex: 1,
                maxWidth: isMobile ? '100%' : '1400px',
                width: isMobile ? '100%' : '90%',
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: 'center',
                gap: isMobile ? '20px' : '40px',
                padding: isMobile ? '20px' : '40px'
              }}>
                {/* Featured Image */}
                <div style={{
                  flex: isMobile ? '0 0 auto' : '0 0 600px',
                  width: isMobile ? '100%' : '600px',
                  height: isMobile ? '200px' : '340px',
                  position: 'relative',
                  overflow: 'hidden',
                  border: '2px solid rgba(233, 53, 158, 0.8)',
                  boxShadow: '0 10px 40px rgba(233, 53, 158, 0.4)',
                  borderRadius: '4px'
                }}>
                  <img 
                    src={`/showcase/${work.studentNumber}-${slugify(work.title)}.webp`}
                    alt={work.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      console.warn('Spotlight main image failed to load:', {
                        studentNumber: work.studentNumber,
                        title: work.title,
                        slugified: slugify(work.title),
                        expectedPath: `/showcase/${work.studentNumber}-${slugify(work.title)}.webp`
                      })
                      e.target.style.display = 'none'
                    }}
                  />
                  
                  {/* Spotlight Badge */}
                  <div style={{
                    position: 'absolute',
                    top: isMobile ? '10px' : '20px',
                    left: isMobile ? '10px' : '20px',
                    background: 'rgba(233, 53, 158, 0.95)',
                    color: '#fff',
                    padding: isMobile ? '6px 12px' : '8px 16px',
                    fontSize: isMobile ? '9px' : '10px',
                    fontWeight: 'bold',
                    letterSpacing: '2px',
                    borderRadius: '3px',
                    textTransform: 'uppercase'
                  }}>
                    ✦ SPOTLIGHT
                  </div>
                </div>
                
                {/* Info Panel */}
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: isMobile ? '12px' : '20px',
                  textAlign: isMobile ? 'center' : 'left',
                  maxHeight: isMobile ? '180px' : 'none',
                  overflowY: isMobile ? 'auto' : 'visible'
                }}>
                  <div>
                    <div style={{
                      fontSize: isMobile ? '10px' : '12px',
                      color: '#e9359e',
                      textTransform: 'uppercase',
                      letterSpacing: '2px',
                      marginBottom: isMobile ? '8px' : '12px',
                      fontWeight: 'bold'
                    }}>
                      {work.type || work.workType || 'FEATURED WORK'}
                    </div>
                    <h2 style={{
                      fontSize: isMobile ? '20px' : '48px',
                      color: '#fff',
                      margin: '0 0 12px 0',
                      fontWeight: 'bold',
                      letterSpacing: '1px',
                      lineHeight: '1.2',
                      textShadow: '0 2px 10px rgba(233, 53, 158, 0.3)',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      ...(work.title && work.title.length > 60 && !isMobile ? { fontSize: '36px' } : {}),
                      ...(work.title && work.title.length > 90 && !isMobile ? { fontSize: '28px' } : {}),
                      ...(work.title && work.title.length > 120 && !isMobile ? { fontSize: '24px' } : {}),
                      ...(work.title && work.title.length > 40 && isMobile ? { fontSize: '16px' } : {}),
                      ...(work.title && work.title.length > 70 && isMobile ? { fontSize: '14px' } : {})
                    }}>
                      {work.title || 'Untitled'}
                    </h2>
                    <div style={{
                      fontSize: isMobile ? '12px' : '18px',
                      color: 'rgba(255, 255, 255, 0.8)',
                      marginBottom: isMobile ? '12px' : '20px',
                      letterSpacing: '0.5px'
                    }}>
                      by <span style={{ color: '#e9359e', fontWeight: 'bold' }}>{work.studentName}</span>
                    </div>
                  </div>
                  
                  {work.description && !isMobile && (
                    <p style={{
                      fontSize: '14px',
                      color: 'rgba(255, 255, 255, 0.7)',
                      lineHeight: '1.6',
                      maxWidth: '600px',
                      margin: 0
                    }}>
                      {work.description.length > 200 
                        ? work.description.substring(0, 200) + '...' 
                        : work.description}
                    </p>
                  )}
                  
                  {/* Action Buttons Row - Desktop Only */}
                  {!isMobile && (
                    <div style={{
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      flexWrap: 'wrap'
                    }}>
                      {/* View Profile Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/profile/${work.studentNumber}`)
                        }}
                        style={{
                          background: '#e9359e',
                          border: '2px solid #e9359e',
                          color: '#fff',
                          padding: '14px 32px',
                          fontSize: '12px',
                          fontFamily: 'monospace',
                          fontWeight: 'bold',
                          letterSpacing: '1.5px',
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          textTransform: 'uppercase',
                          borderRadius: '4px',
                          boxShadow: '0 4px 12px rgba(233, 53, 158, 0.4)'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#ff4db8'
                          e.target.style.transform = 'scale(1.05)'
                          e.target.style.boxShadow = '0 6px 16px rgba(233, 53, 158, 0.6)'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = '#e9359e'
                          e.target.style.transform = 'scale(1)'
                          e.target.style.boxShadow = '0 4px 12px rgba(233, 53, 158, 0.4)'
                        }}
                      >
                        VIEW PROFILE
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* Navigation Dots */}
          <div style={{
            position: 'absolute',
            bottom: isMobile ? '12px' : '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: isMobile ? '3px' : '12px',
            zIndex: 2
          }}>
            {spotlightWorks.map((_, idx) => (
              <button
                key={`dot-${idx}`}
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentSpotlightIndex(idx)
                }}
                style={{
                  width: isMobile ? '4px' : (idx === currentSpotlightIndex ? '40px' : '12px'),
                  height: isMobile ? '4px' : '12px',
                  borderRadius: isMobile ? '50%' : '6px',
                  border: isMobile ? 'none' : '1px solid #e9359e',
                  background: idx === currentSpotlightIndex ? '#e9359e' : 'rgba(233, 53, 158, 0.4)',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  padding: 0
                }}
                onMouseEnter={(e) => {
                  if (idx !== currentSpotlightIndex) {
                    e.target.style.background = 'rgba(233, 53, 158, 0.6)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (idx !== currentSpotlightIndex) {
                    e.target.style.background = 'rgba(233, 53, 158, 0.4)'
                  }
                }}
              />
            ))}
          </div>
          
          {/* Mobile View Profile Button */}
          {isMobile && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/profile/${spotlightWorks[currentSpotlightIndex]?.studentNumber}`)
              }}
              style={{
                position: 'absolute',
                bottom: '12px',
                right: '12px',
                background: 'rgba(233, 53, 158, 0.9)',
                border: '1px solid #e9359e',
                color: '#fff',
                padding: '4px 10px',
                fontSize: '8px',
                fontFamily: 'monospace',
                fontWeight: 'bold',
                letterSpacing: '0.5px',
                cursor: 'pointer',
                transition: 'all 0.3s',
                textTransform: 'uppercase',
                borderRadius: '2px',
                zIndex: 2,
                boxShadow: '0 2px 6px rgba(233, 53, 158, 0.3)'
              }}
            >
              VIEW
            </button>
          )}
          
          {/* Manual Navigation Arrows */}
          {spotlightWorks.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentSpotlightIndex(prev => 
                    prev === 0 ? spotlightWorks.length - 1 : prev - 1
                  )
                }}
                style={{
                  position: 'absolute',
                  left: isMobile ? '10px' : '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: isMobile ? '40px' : '50px',
                  height: isMobile ? '40px' : '50px',
                  borderRadius: '50%',
                  border: '2px solid rgba(233, 53, 158, 0.8)',
                  background: 'rgba(0, 0, 0, 0.8)',
                  color: '#e9359e',
                  fontSize: isMobile ? '20px' : '24px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  zIndex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(233, 53, 158, 0.3)'
                  e.target.style.transform = 'translateY(-50%) scale(1.1)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(0, 0, 0, 0.8)'
                  e.target.style.transform = 'translateY(-50%) scale(1)'
                }}
              >
                ‹
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentSpotlightIndex(prev => (prev + 1) % spotlightWorks.length)
                }}
                style={{
                  position: 'absolute',
                  right: isMobile ? '10px' : '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: isMobile ? '40px' : '50px',
                  height: isMobile ? '40px' : '50px',
                  borderRadius: '50%',
                  border: '2px solid rgba(233, 53, 158, 0.8)',
                  background: 'rgba(0, 0, 0, 0.8)',
                  color: '#e9359e',
                  fontSize: isMobile ? '20px' : '24px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  zIndex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(233, 53, 158, 0.3)'
                  e.target.style.transform = 'translateY(-50%) scale(1.1)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(0, 0, 0, 0.8)'
                  e.target.style.transform = 'translateY(-50%) scale(1)'
                }}
              >
                ›
              </button>
            </>
          )}
        </div>
      )}

      {/* Filter Controls */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.9)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: isMobile ? '15px 15px' : '20px 40px',
        position: 'sticky',
        top: isMobile ? '80px' : '120px',
        zIndex: 999,
        backdropFilter: 'blur(10px)'
      }}>
        {/* Search Bar */}
        <div style={{
          maxWidth: '600px',
          margin: '0 auto 16px'
        }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isMobile ? "Search..." : "Search by name, work, or bio..."}
            style={{
              width: '100%',
              padding: isMobile ? '10px 15px' : '12px 20px',
              background: 'rgba(0, 0, 0, 0.6)',
              border: '1px solid rgba(233, 53, 158, 0.5)',
              borderRadius: '4px',
              color: '#fff',
              fontSize: isMobile ? '12px' : '14px',
              fontFamily: 'monospace',
              outline: 'none',
              transition: 'border-color 0.3s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#e9359e'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(233, 53, 158, 0.5)'}
          />
        </div>

        {/* Category Filters */}
        <div style={{
          display: 'flex',
          gap: isMobile ? '8px' : '12px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                background: selectedCategory === category 
                  ? 'rgba(233, 53, 158, 0.3)' 
                  : 'rgba(0, 0, 0, 0.6)',
                border: selectedCategory === category 
                  ? '1px solid #e9359e' 
                  : '1px solid rgba(233, 53, 158, 0.3)',
                color: selectedCategory === category ? '#e9359e' : '#aaa',
                padding: isMobile ? '6px 12px' : '8px 16px',
                fontSize: isMobile ? '9px' : '11px',
                fontFamily: 'monospace',
                fontWeight: 'bold',
                letterSpacing: '1px',
                cursor: 'pointer',
                transition: 'all 0.3s',
                textTransform: 'uppercase',
                borderRadius: '4px'
              }}
              onMouseEnter={(e) => {
                if (selectedCategory !== category) {
                  e.target.style.background = 'rgba(233, 53, 158, 0.15)'
                  e.target.style.color = '#e9359e'
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== category) {
                  e.target.style.background = 'rgba(0, 0, 0, 0.6)'
                  e.target.style.color = '#aaa'
                }
              }}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <div style={{
          textAlign: 'center',
          marginTop: '12px',
          color: 'rgba(255, 255, 255, 0.5)',
          fontSize: isMobile ? '10px' : '11px',
          fontFamily: 'monospace',
          letterSpacing: '1px'
        }}>
          {filteredAndSortedProfiles.length} PROFILE{filteredAndSortedProfiles.length !== 1 ? 'S' : ''}
        </div>
      </div>

      {/* Grid Container */}
      <div style={{
        padding: isMobile ? '20px 15px' : '40px',
        display: 'grid',
        gridTemplateColumns: isMobile 
          ? '1fr' 
          : 'repeat(auto-fill, minmax(380px, 1fr))',
        gap: isMobile ? '20px' : '30px',
        maxWidth: '1800px',
        margin: '0 auto',
        width: '100%'
      }}>
        {filteredAndSortedProfiles.map((profile, index) => (
          <div 
            key={`profile-${index}-${profile.studentNumber}`}
            onClick={() => navigate(`/profile/${profile.studentNumber}`)}
            style={{
              background: 'rgba(0, 0, 0, 0.85)',
              border: '1px solid rgba(233, 53, 158, 0.5)',
              borderRadius: '0px',
              overflow: 'hidden',
              transition: 'all 0.3s',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              height: isMobile ? 'auto' : '600px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#e9359e'
              e.currentTarget.style.transform = 'translateY(-5px)'
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(233, 53, 158, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(233, 53, 158, 0.5)'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            {/* Showcase Image - Always show with 16:9 ratio */}
            <div style={{
              width: '100%',
              paddingTop: '56.25%', // 16:9 aspect ratio
              position: 'relative',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 50%, #1a1a1a 100%)',
              borderBottom: '1px solid rgba(233, 53, 158, 0.3)',
              flexShrink: 0
            }}>
              {profile.studentNumber && profile.works?.[0] ? (
                <img 
                  src={`/showcase/${profile.studentNumber}-${slugify(profile.works[0].title)}.webp`}
                  alt={profile.name}
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.parentElement.querySelector('.placeholder-content').style.display = 'flex'
                  }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : null}
              <div 
                className="placeholder-content"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  display: profile.studentNumber && profile.works?.[0] ? 'none' : 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px'
                }}
              >
                <div style={{
                  color: 'rgba(233, 53, 158, 0.4)',
                  fontSize: isMobile ? '32px' : '48px',
                  fontWeight: 'bold',
                  letterSpacing: '3px',
                  fontFamily: 'monospace'
                }}>
                  SHOWCASE
                </div>
                <div style={{
                  color: 'rgba(255, 255, 255, 0.2)',
                  fontSize: isMobile ? '16px' : '24px',
                  fontWeight: 'bold',
                  fontFamily: 'monospace'
                }}>
                  16:9
                </div>
                {/* Corner decorations */}
                <svg 
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none'
                  }}
                  viewBox="0 0 1920 1080"
                  preserveAspectRatio="none"
                >
                  <path d="M 20,120 L 20,20 L 120,20" stroke="rgba(233, 53, 158, 0.5)" strokeWidth="3" fill="none"/>
                  <path d="M 1800,20 L 1900,20 L 1900,120" stroke="rgba(233, 53, 158, 0.5)" strokeWidth="3" fill="none"/>
                  <path d="M 20,960 L 20,1060 L 120,1060" stroke="rgba(233, 53, 158, 0.5)" strokeWidth="3" fill="none"/>
                  <path d="M 1800,1060 L 1900,1060 L 1900,960" stroke="rgba(233, 53, 158, 0.5)" strokeWidth="3" fill="none"/>
                </svg>
              </div>
            </div>

            {/* Content */}
            <div style={{ 
              padding: isMobile ? '15px' : '20px',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              {/* Header with Avatar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? '10px' : '12px',
                marginBottom: isMobile ? '12px' : '16px',
                flexShrink: 0
              }}>
                <img 
                  src={`/profiles/${profile.studentNumber}.webp`}
                  alt={profile.name}
                  onError={(e) => {
                    e.target.src = '/profiles/placeholder.webp'
                  }}
                  style={{
                    width: isMobile ? '50px' : '60px',
                    height: isMobile ? '50px' : '60px',
                    borderRadius: '4px',
                    objectFit: 'cover',
                    border: '2px solid rgba(233, 53, 158, 0.5)',
                    flexShrink: 0
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: isMobile ? '14px' : '16px',
                    fontWeight: 'bold',
                    color: '#fff',
                    marginBottom: '4px',
                    letterSpacing: '0.5px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {profile.name}
                  </div>
                  <div style={{
                    fontSize: isMobile ? '9px' : '10px',
                    color: '#e9359e',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    background: 'rgba(233, 53, 158, 0.15)',
                    padding: '3px 8px',
                    borderRadius: '3px',
                    display: 'inline-block'
                  }}>
                    {normalizeWorkType(profile.workType)}
                  </div>
                </div>
              </div>

              {/* Works List */}
              {profile.works && profile.works.length > 0 && (
                <div style={{
                  marginBottom: isMobile ? '10px' : '12px',
                  padding: isMobile ? '10px' : '12px',
                  background: 'rgba(233, 53, 158, 0.05)',
                  borderRadius: '4px',
                  border: '1px solid rgba(233, 53, 158, 0.2)',
                  flexShrink: 0
                }}>
                  <div style={{
                    fontSize: '9px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    textTransform: 'uppercase',
                    letterSpacing: '1.5px',
                    marginBottom: '8px',
                    fontWeight: 'bold'
                  }}>
                    WORKS ({profile.works.length})
                  </div>
                  <div style={{
                    maxHeight: '60px',
                    overflowY: 'auto'
                  }}>
                    {profile.works.map((work, idx) => (
                      <div 
                        key={idx}
                        style={{
                          fontSize: isMobile ? '10px' : '11px',
                          color: '#e9359e',
                          marginBottom: idx < profile.works.length - 1 ? '6px' : 0,
                          paddingLeft: '10px',
                          borderLeft: '2px solid rgba(233, 53, 158, 0.4)',
                          lineHeight: '1.3'
                        }}
                      >
                        {work.title || 'Untitled'}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bio */}
              <div style={{
                fontSize: isMobile ? '10px' : '11px',
                color: '#aaa',
                lineHeight: '1.5',
                flex: 1,
                overflowY: 'auto',
                paddingRight: '8px',
                minHeight: 0
              }}>
                {profile.bio || 'No bio available'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}