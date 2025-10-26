import { Html } from "@react-three/drei"
import type { ProjectData } from "src/lib/types"

const DesktopAsteroidInteractive = ({ projects, activeIndex, point }: { projects: ProjectData[], activeIndex: number, point: [number, number, number]}) => {
    const profile = projects[activeIndex]
    
    return (
        <group>
            <Html
            position={[
                point[0] + 0.5,
                point[1],
                point[2]
            ]}
            style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
            <a 
                href={`${profile.id}`}
                style={{
                background: 'rgba(0, 0, 0, 0.95)',
                border: '1px solid rgba(255, 255, 255, 1)',
                padding: '12px',
                color: 'white',
                fontSize: '11px',
                fontFamily: 'monospace',
                width: '240px',
                backdropFilter: 'blur(15px)',
                boxShadow: '0 8px 32px rgba(233, 53, 158, .1)',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start'
            }}>
                <div style={{
                width: '60px',
                height: '60px',
                flexShrink: 0,
                position: 'relative'
                }}>
                    {profile.image && (
                        <img src={profile.image.src} />

                    )}
                </div>
                
                <div style={{ 
                flex: 1,
                minWidth: 0,
                overflow: 'hidden'
                }}>
                <div style={{
                    fontSize: '13px',
                    fontWeight: 'bold',
                    color: '#ffffff',
                    marginBottom: '4px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}>
                    {profile.title}
                </div>
                
                <div style={{
                    fontSize: '9px',
                    color: 'rgba(233, 53, 158, 1)',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                }}>
                    {profile.category}
                </div>

                <div style={{
                    fontSize: '10px',
                    color: '#cccccc',
                    lineHeight: '1.4',
                    display: '-webkit-box',
                    WebkitLineClamp: 6,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}>
                {
                    profile.description ? (
                        <div dangerouslySetInnerHTML={{__html: profile.description}} /> 
                    ) : (
                        'No bio available'
                    )
                }
                </div>
                </div>
            </a>
            </Html>
        </group>
    )
}

export default DesktopAsteroidInteractive