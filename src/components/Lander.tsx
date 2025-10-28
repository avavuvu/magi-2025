import { useEffect, useState } from "react"
import type { ProjectData, StudentData } from "src/lib/types"
import MobileLander from "./three/MobileLander"
import DesktopLander from "./three/DesktopLander"

const Lander = ({students}: {students: StudentData[]}) => {
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
        <MobileLander students={students}/>
    ) : (
        <DesktopLander students={students}/>
    )   
}

export default Lander