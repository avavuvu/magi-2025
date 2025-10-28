import { useEffect, useRef, useState, type RefObject } from "react";
import type { ProjectData, StudentData } from "src/lib/types";
import { useScrollAnimation } from "src/lib/useScrollAnimation";


const MobileProfiles = ({ students, scroll, ref }: { students: StudentData[], scroll: number, ref: RefObject<HTMLDivElement>}) => {
    const posterListRef = useRef<HTMLUListElement>(null!);

    const translateX = -scroll * (students.length - 1) * 100;
    if(posterListRef.current) {
        posterListRef.current.style.transform = `translateX(${translateX}vw)`;
    }

    return (
        <section
            ref={ref}
            style={{ height: `${students.length * 100}vh` }}
            className="relative overflow-x-clip"
        >
            <ul ref={posterListRef} className="flex sticky top-0">
                {students.map(({ image }, index) => (
                    <li
                        key={index}
                        className="h-screen w-screen flex-shrink-0 overflow-hidden flex items-center justify-center flex-col"
                    >
                        {image && (
                            <img
                                className="w-[400px] h-[400px] object-cover"
                                loading="lazy"
                                src={image.src}
                                alt="a"
                            />
                        )}
                    </li>
                ))}
            </ul>

            <div className="absolute inset-0">
                {students.map(({ name, image }, index) => (
                    <div
                        key={index}
                        className="h-screen w-screen flex items-end gap-10"
                    >
                        <div className="w-full">
                            <span className="ml-2 text-5xl">#{index + 1}</span>
                            <span>{name}</span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default MobileProfiles;
