import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAsteroidData } from './ProfileSystem'
import './student-profile.css'

export default function StudentProfilePage() {
  const { studentNumber } = useParams()
  const navigate = useNavigate()
  const { asteroidData } = useAsteroidData()
  const [currentWorkIndex, setCurrentWorkIndex] = useState(0)
  const [imageErrors, setImageErrors] = useState({})
  const [emailCopied, setEmailCopied] = useState(false)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [isVideoHovered, setIsVideoHovered] = useState(false)
  const [videoProgress, setVideoProgress] = useState(0)
  const [videoDuration, setVideoDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageZoomLevel, setImageZoomLevel] = useState(1)
  const [imageZoomOrigin, setImageZoomOrigin] = useState({ x: 50, y: 50 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const videoRef = useRef(null)
  
  // Find the specific student
  const student = asteroidData.find(profile => profile.studentNumber === studentNumber)
  

// If student not found, show loading state
  if (!student) {
    return (
      <div className="profile-not-found">
        <div className="error-container" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px'
        }}>
          <h1>LOADING PROFILE</h1>
          <p>Please wait while we load the student profile...</p>
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
      </div>
    )
  }

  const currentWork = student.works?.[currentWorkIndex] || null
  const hasMultipleWorks = student.works && student.works.length > 1
  const hasImageSlideshow = currentWork?.images && currentWork.images.length > 0
  const hasMultipleImages = hasImageSlideshow && currentWork.images.length > 1

  const nextWork = () => {
    if (hasMultipleWorks) {
      setIsVideoPlaying(false)
      setCurrentImageIndex(0)
      setImageZoomLevel(1)
      setImageZoomOrigin({ x: 50, y: 50 })
      setPanOffset({ x: 0, y: 0 })
      if (videoRef.current) {
        videoRef.current.pause()
        videoRef.current.currentTime = 0
      }
      setCurrentWorkIndex((prev) => (prev + 1) % student.works.length)
    }
  }

  const prevWork = () => {
    if (hasMultipleWorks) {
      setIsVideoPlaying(false)
      setCurrentImageIndex(0)
      setImageZoomLevel(1)
      setImageZoomOrigin({ x: 50, y: 50 })
      setPanOffset({ x: 0, y: 0 })
      if (videoRef.current) {
        videoRef.current.pause()
        videoRef.current.currentTime = 0
      }
      setCurrentWorkIndex((prev) => (prev - 1 + student.works.length) % student.works.length)
    }
  }

  const nextImage = (e) => {
    e.stopPropagation()
    if (hasMultipleImages) {
      setImageZoomLevel(1)
      setImageZoomOrigin({ x: 50, y: 50 })
      setPanOffset({ x: 0, y: 0 })
      setCurrentImageIndex((prev) => (prev + 1) % currentWork.images.length)
    }
  }

  const prevImage = (e) => {
    e.stopPropagation()
    if (hasMultipleImages) {
      setImageZoomLevel(1)
      setImageZoomOrigin({ x: 50, y: 50 })
      setPanOffset({ x: 0, y: 0 })
      setCurrentImageIndex((prev) => (prev - 1 + currentWork.images.length) % currentWork.images.length)
    }
  }

  const handleImageWheel = (e) => {
    if (!hasImageSlideshow) return
    
    // Only zoom IN with scroll wheel (scroll up)
    // This prevents page scroll conflict when zooming out
    if (e.deltaY < 0) {
      e.preventDefault()
      e.stopPropagation()
      
      const delta = 0.1
      const newZoom = Math.min(3, imageZoomLevel + delta)
      
      // Calculate zoom origin based on mouse position
      const rect = e.currentTarget.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      setImageZoomOrigin({ x, y })
      
      setImageZoomLevel(newZoom)
    }
    // Scroll down does nothing - page scrolls normally
  }
  
  const handleZoomSliderChange = (e) => {
    const newZoom = parseFloat(e.target.value)
    setImageZoomLevel(newZoom)
    
    if (newZoom === 1) {
      // Reset pan when fully zoomed out
      setPanOffset({ x: 0, y: 0 })
    }
  }

  const handleMouseDown = (e) => {
    if (!hasImageSlideshow || imageZoomLevel <= 1) return
    
    // Don't start pan if clicking on navigation buttons or zoom controls
    if (e.target.closest('.image-nav-arrow') || 
        e.target.closest('.zoom-reset-button') ||
        e.target.closest('.zoom-controls')) {
      return
    }
    
    setIsPanning(true)
    setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y })
    e.preventDefault()
  }

  const handleMouseMove = (e) => {
    if (!isPanning || !hasImageSlideshow || imageZoomLevel <= 1) return
    
    setPanOffset({
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y
    })
  }

  const handleMouseUp = () => {
    setIsPanning(false)
  }

  const resetZoom = () => {
    setImageZoomLevel(1)
    setImageZoomOrigin({ x: 50, y: 50 })
    setPanOffset({ x: 0, y: 0 })
  }

  const handleImageError = (workIndex) => {
    setImageErrors(prev => ({ ...prev, [workIndex]: true }))
  }

  const copyEmailToClipboard = async () => {
    if (student.email) {
      try {
        await navigator.clipboard.writeText(student.email)
        setEmailCopied(true)
        setTimeout(() => setEmailCopied(false), 2000)
      } catch (err) {
        console.error('Failed to copy email:', err)
      }
    }
  }

  const handleVideoClick = () => {
    // For YouTube embeds, just toggle the display
    if (currentWork?.videoUrl) {
      setIsVideoPlaying(!isVideoPlaying)
      return
    }
    
    // For local videos, control playback
    if (!videoRef.current) return
    
    if (isVideoPlaying) {
      videoRef.current.pause()
      setIsVideoPlaying(false)
    } else {
      videoRef.current.play()
      setIsVideoPlaying(true)
    }
  }

  const handleVideoEnd = () => {
    setIsVideoPlaying(false)
    setVideoProgress(0)
    setCurrentTime(0)
    if (videoRef.current) {
      videoRef.current.currentTime = 0
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100
      setVideoProgress(progress)
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration)
    }
  }

  const handleScrubberClick = (e) => {
    e.stopPropagation() // Prevent video pause when clicking scrubber
    if (!videoRef.current) return
    const scrubber = e.currentTarget
    const rect = scrubber.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    const newTime = percentage * videoRef.current.duration
    videoRef.current.currentTime = newTime
    setCurrentTime(newTime)
    setVideoProgress(percentage * 100)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const extractYouTubeId = (url) => {
    if (!url) return null
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  const extractGoogleDriveId = (url) => {
    if (!url) return null
    const match = url.match(/\/file\/d\/([^/]+)/)
    return match ? match[1] : null
  }

  const getVideoEmbedUrl = (url) => {
    if (!url) return null
    
    // Check for YouTube
    const youtubeId = extractYouTubeId(url)
    if (youtubeId) {
      return `https://www.youtube.com/embed/${youtubeId}?autoplay=${isVideoPlaying ? 1 : 0}&controls=1&modestbranding=1&rel=0`
    }
    
    // Check for Google Drive
    const driveId = extractGoogleDriveId(url)
    if (driveId) {
      return `https://drive.google.com/file/d/${driveId}/preview`
    }
    
    return null
  }

  // Check if current work has a video (YouTube URL, Google Drive, or local video) or image slideshow
  const hasVideo = !hasImageSlideshow && (currentWork?.videoUrl || currentWork?.showcaseImage)

  return (
    <div className="student-profile-page">
      {/* Fixed Header */}
      <div className="student-header">
        <img 
          src="/MAGI_Logo.png" 
          alt="MAGI Logo"
          className="header-logo"
          onClick={() => navigate('/')}
        />
        <div className="header-student-name">{student.name}</div>
        <button 
          onClick={() => navigate('/profiles')}
          className="header-back-button"
        >
          BACK TO PROFILES
        </button>
      </div>

      {/* Hero Showcase Section */}
      <div className="showcase-hero">
        <div className="showcase-container">
          {/* Showcase Image/Video */}
          <div 
            className="showcase-image-wrapper"
            onMouseEnter={() => setIsVideoHovered(true)}
            onMouseLeave={() => {
              setIsVideoHovered(false)
              handleMouseUp()
            }}
            onClick={hasVideo ? handleVideoClick : undefined}
            onWheel={handleImageWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{ 
              cursor: hasImageSlideshow 
                ? (imageZoomLevel > 1 ? (isPanning ? 'grabbing' : 'grab') : 'default')
                : (hasVideo ? 'pointer' : 'default')
            }}
          >
            {/* Navigation Arrows for Multiple Works */}
            {hasMultipleWorks && (
              <>
                <button className="carousel-arrow carousel-arrow-left" onClick={prevWork}>
                  ‹
                </button>
                <button className="carousel-arrow carousel-arrow-right" onClick={nextWork}>
                  ›
                </button>
              </>
            )}

            {/* Image Slideshow (for specific works with images array) */}
            {hasImageSlideshow && (
              <>
                {currentWork.images.map((imageName, idx) => (
                  <img 
                    key={`slideshow-${currentWorkIndex}-${idx}`}
                    src={`/showcase/${imageName}.webp`}
                    alt={`${currentWork.title} - Image ${idx + 1}`}
                    className={`showcase-image ${idx === currentImageIndex ? 'active' : ''}`}
                    style={{ 
                      opacity: idx === currentImageIndex ? 1 : 0,
                      pointerEvents: idx === currentImageIndex ? 'auto' : 'none',
                      transform: `scale(${imageZoomLevel}) translate(${panOffset.x / imageZoomLevel}px, ${panOffset.y / imageZoomLevel}px)`,
                      transformOrigin: `${imageZoomOrigin.x}% ${imageZoomOrigin.y}%`,
                      transition: isPanning ? 'opacity 0.5s ease' : 'opacity 0.5s ease, transform 0.3s ease'
                    }}
                    onError={() => handleImageError(`${currentWorkIndex}-${idx}`)}
                  />
                ))}
                
                {/* Image Navigation Arrows */}
                {hasMultipleImages && (
                  <>
                    <button className="image-nav-arrow image-nav-left" onClick={prevImage}>
                      ‹
                    </button>
                    <button className="image-nav-arrow image-nav-right" onClick={nextImage}>
                      ›
                    </button>
                    {/* Image Counter */}
                    <div className="image-counter">
                      {currentImageIndex + 1} / {currentWork.images.length}
                    </div>
                  </>
                )}

                {/* Zoom Controls - Minimal Slider Interface */}
                <div className="zoom-controls">
                  {imageZoomLevel > 1 && (
                    <button 
                      className="zoom-reset-button-inline" 
                      onClick={(e) => {
                        e.stopPropagation()
                        resetZoom()
                      }}
                    >
                      ⟲
                    </button>
                  )}
                  
                  <button 
                    className="zoom-control-button zoom-out-btn" 
                    onClick={(e) => {
                      e.stopPropagation()
                      setImageZoomLevel(Math.max(1, imageZoomLevel - 0.1))
                      if (imageZoomLevel - 0.1 <= 1) setPanOffset({ x: 0, y: 0 })
                    }}
                    disabled={imageZoomLevel <= 1}
                  >
                    −
                  </button>
                  
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.05"
                    value={imageZoomLevel}
                    onChange={handleZoomSliderChange}
                    className="zoom-slider"
                    onClick={(e) => e.stopPropagation()}
                  />
                  
                  <button 
                    className="zoom-control-button zoom-in-btn" 
                    onClick={(e) => {
                      e.stopPropagation()
                      setImageZoomLevel(Math.min(3, imageZoomLevel + 0.1))
                    }}
                    disabled={imageZoomLevel >= 3}
                  >
                    +
                  </button>
                </div>
              </>
            )}

            {/* Video Player - YouTube/Google Drive Embed */}
            {hasVideo && currentWork.videoUrl && (
              <div className={`showcase-video-container ${isVideoPlaying ? 'playing' : ''}`}>
                <iframe
                  key={`video-${currentWorkIndex}`}
                  className="showcase-video-iframe"
                  src={getVideoEmbedUrl(currentWork.videoUrl)}
                  title={currentWork.title || 'Video'}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {/* Fallback: Local Video (if no YouTube URL) */}
            {hasVideo && !currentWork.videoUrl && (
              <video
                ref={videoRef}
                key={`video-${currentWorkIndex}`}
                className={`showcase-video ${isVideoPlaying ? 'playing' : ''}`}
                onEnded={handleVideoEnd}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                loop={false}
                playsInline
              >
                <source src={`/videos/${currentWork.showcaseImage}.webm`} type="video/webm" />
                <source src={`/videos/${currentWork.showcaseImage}.mp4`} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}

            {/* Thumbnail Image (shows when video not playing) */}
            {currentWork?.showcaseImage && !imageErrors[currentWorkIndex] && !isVideoPlaying && !hasImageSlideshow ? (
              <img 
                key={`showcase-${currentWorkIndex}`}
                src={`/showcase/${currentWork.showcaseImage}.webp`}
                alt={currentWork.title || student.name}
                className="showcase-image"
                onError={() => handleImageError(currentWorkIndex)}
              />
            ) : null}

            {/* Play Button Overlay */}
            {hasVideo && !isVideoPlaying && (isVideoHovered || !isVideoPlaying) && (
              <div className="video-play-overlay">
                <div className="play-button-circle">
                  <svg className="play-icon" viewBox="0 0 24 24" fill="none">
                    <path d="M8 5v14l11-7z" fill="currentColor"/>
                  </svg>
                </div>
                <div className="play-text">CLICK TO PLAY</div>
              </div>
            )}

            {/* Video Controls Overlay (when playing local video only) */}
            {isVideoPlaying && !currentWork?.videoUrl && (
              <div className="video-controls-overlay">
                {/* Pause Button */}
                <button className="video-control-btn pause-btn" onClick={(e) => {
                  e.stopPropagation()
                  handleVideoClick()
                }}>
                  <svg viewBox="0 0 24 24" fill="none">
                    <rect x="6" y="4" width="4" height="16" fill="currentColor"/>
                    <rect x="14" y="4" width="4" height="16" fill="currentColor"/>
                  </svg>
                </button>

                {/* Scrubber Bar */}
                <div className="video-scrubber-container">
                  <div className="video-scrubber" onClick={handleScrubberClick}>
                    <div className="scrubber-track">
                      <div 
                        className="scrubber-progress" 
                        style={{ width: `${videoProgress}%` }}
                      />
                      <div 
                        className="scrubber-thumb" 
                        style={{ left: `${videoProgress}%` }}
                      />
                    </div>
                  </div>
                  <div className="video-time-display">
                    {formatTime(currentTime)} / {formatTime(videoDuration)}
                  </div>
                </div>
              </div>
            )}

            {/* Placeholder */}
            <div 
              className="showcase-placeholder" 
              style={{
                display: (!hasImageSlideshow && (!currentWork?.showcaseImage || imageErrors[currentWorkIndex])) ? 'flex' : 'none'
              }}
            >
              <div className="placeholder-text-main">SHOWCASE</div>
              <div className="placeholder-text-sub">16:9</div>
            </div>
          </div>

          {/* Carousel Indicators */}
          {hasMultipleWorks && (
            <div className="carousel-indicators">
              {student.works.map((_, idx) => (
                <button
                  key={idx}
                  className={`indicator-dot ${idx === currentWorkIndex ? 'active' : ''}`}
                  onClick={() => setCurrentWorkIndex(idx)}
                />
              ))}
            </div>
          )}

          {/* Work Title - Below video/image */}
          {currentWork && (
            <div className="showcase-title-overlay">
              <h2 className="showcase-work-title">{currentWork.title || 'Untitled'}</h2>
              <span className="showcase-work-type">{currentWork.type || student.workType}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="content-container">
        {/* Student Info Card */}
        <div className="student-info-card">
          <div className="info-card-header">
            <img 
              src={`/profiles/${student.studentNumber}.webp`}
              alt={student.name}
              onError={(e) => {
                e.target.src = '/profiles/placeholder.webp'
              }}
              className="student-avatar-large"
            />
            <div className="student-name-section">
              <h1 className="student-name-large">{student.name}</h1>
              <div className="student-specialty-badge">{student.workType}</div>
            </div>
          </div>

          {/* Contact Bar */}
          <div className="contact-section">
            {student.email && (
              <button
                onClick={copyEmailToClipboard}
                className="contact-button"
                style={{ 
                  background: emailCopied ? 'rgba(74, 255, 158, 0.3)' : undefined,
                  transition: 'all 0.3s'
                }}
                title={emailCopied ? 'Email copied!' : 'Copy email to clipboard'}
              >
                <span className="contact-icon">{emailCopied ? '✓' : '✉'}</span>
                {emailCopied ? 'Copied!' : 'Email'}
              </button>
            )}
            {student.linkedin && (
              <a href={student.linkedin} target="_blank" rel="noopener noreferrer" className="contact-button">
                <span className="contact-icon">in</span>
                LinkedIn
              </a>
            )}
            {student.portfolio && (
              <a href={student.portfolio} target="_blank" rel="noopener noreferrer" className="contact-button">
                <span className="contact-icon">🌐</span>
                Portfolio
              </a>
            )}
            {student.resume && (
              <a href={student.resume} download className="contact-button">
                <span className="contact-icon">📄</span>
                Resume
              </a>
            )}
          </div>
        </div>

        {/* Current Work Details */}
        {currentWork && (
          <section className="work-details-section">
            <h2 className="section-title">ABOUT THIS WORK</h2>
            
            {currentWork.description && (
              <p className="work-description-detailed">{currentWork.description}</p>
            )}
            
            {currentWork.tools && currentWork.tools.length > 0 && (
              <div className="work-tools-section">
                <span className="tools-label">TOOLS & TECHNOLOGIES:</span>
                <div className="tools-grid">
                  {currentWork.tools.map((tool, toolIdx) => (
                    <span key={toolIdx} className="tool-tag">{tool}</span>
                  ))}
                </div>
              </div>
            )}
            
            {(currentWork.link || currentWork.demo || currentWork.github) && (
              <div className="work-links-section">
                {currentWork.link && (
                  <a href={currentWork.link} target="_blank" rel="noopener noreferrer" className="work-link-button">
                    VIEW PROJECT →
                  </a>
                )}
                {currentWork.demo && (
                  <a href={currentWork.demo} target="_blank" rel="noopener noreferrer" className="work-link-button">
                    LIVE DEMO →
                  </a>
                )}
                {currentWork.github && (
                  <a href={currentWork.github} target="_blank" rel="noopener noreferrer" className="work-link-button">
                    GITHUB →
                  </a>
                )}
              </div>
            )}
          </section>
        )}

        {/* About Student Section */}
        <section className="about-section">
          <h2 className="section-title">ABOUT THE ARTIST</h2>
          <p className="about-bio">{student.bio || 'No bio available'}</p>
          
          {student.favoriteGame && (
            <div className="favorite-game-container">
              <h3 className="subsection-title">CURRENTLY VIBING WITH</h3>
              <div className="favorite-game-text">{student.favoriteGame}</div>
            </div>
          )}
          
          {student.skills && student.skills.length > 0 && (
            <div className="skills-container">
              <h3 className="subsection-title">SKILLS & EXPERTISE</h3>
              <div className="skills-grid">
                {student.skills.map((skill, idx) => (
                  <span key={idx} className="skill-badge">{skill}</span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* All Works List (if multiple) */}
        {hasMultipleWorks && (
          <section className="all-works-section">
            <h2 className="section-title">ALL WORKS ({student.works.length})</h2>
            <div className="works-grid-compact">
              {student.works.map((work, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentWorkIndex(idx)
                    setCurrentImageIndex(0)
                    setImageZoomLevel(1)
                    setImageZoomOrigin({ x: 50, y: 50 })
                    setPanOffset({ x: 0, y: 0 })
                  }}
                  className={`work-grid-item ${idx === currentWorkIndex ? 'active' : ''}`}
                >
                  {work.showcaseImage && !imageErrors[idx] && (
                    <img 
                      src={`/showcase/${work.showcaseImage}.webp`}
                      alt={work.title}
                      className="work-grid-thumbnail"
                      onError={() => handleImageError(idx)}
                    />
                  )}
                  {work.images && work.images.length > 0 && (
                    <img 
                      src={`/showcase/${work.images[0]}.webp`}
                      alt={work.title}
                      className="work-grid-thumbnail"
                      onError={() => handleImageError(idx)}
                    />
                  )}
                  <div className="work-grid-info">
                    <div className="work-grid-title">{work.title || 'Untitled'}</div>
                    <div className="work-grid-type">{work.type || student.workType}</div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="profile-footer">
        <p>© 2025 MAGI EXPO - Masters of Animation, Games & Interactivity</p>
        <button 
          onClick={() => navigate('/profiles')}
          className="footer-back-button"
        >
          ← BACK TO ALL PROFILES
        </button>
      </footer>
    </div>
  )
}