import { useEffect, useState, type RefObject } from "react";

export const useScrollAnimation = (
    targetRef: RefObject<HTMLElement>,
) => {
    const [ progress, setProgress ] = useState(0)

    useEffect(() => {
        const target = targetRef.current;
        if (!target) return;

        const handleScroll = () => {
            const { top, height } = target.getBoundingClientRect();

            const scrollStart = targetRef.current.clientTop;
            const scrollEnd = -height;
            const scrollDistance = scrollStart - scrollEnd;
            const scrolled = scrollStart - top;

            setProgress(Math.max(
                0,
                Math.min(1, scrolled / scrollDistance),
            ));
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [targetRef, progress]);

    return progress
};