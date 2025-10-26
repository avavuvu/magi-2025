import { useEffect, useState } from "react"
import type { ProjectData } from "src/lib/types"
import MobileLander from "./three/MobileLander"
import DesktopLander from "./three/DesktopLander"

const Lander = ({projects}: {projects: ProjectData[]}) => {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth <= 768
            setIsMobile(mobile)
        }
        
        checkMobile()
        window.addEventListener('resize', checkMobile)
        
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    return isMobile ? (
        <MobileLander projects={projects}/>
    ) : (
        <DesktopLander projects={projects}/>
    )   
}

export default Lander