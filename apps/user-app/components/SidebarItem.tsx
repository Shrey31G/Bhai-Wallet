"use client"

import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export const SidebarItem = ({ href, title, icon }: { href: string; title: string; icon: React.ReactNode }) => {
    const router = useRouter();
    const pathname = usePathname();
    const selected = pathname === href;
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(false);
    }, [pathname]);

    const handleNavigation = () => {
        if (pathname === href) return;
        setIsLoading(true);
        router.push(href);
    };

    return (
        <div
            className={`flex ${selected ? "text-[#6a51a6]" : "text-slate-500"} cursor-pointer p-2 relative`}
            onClick={handleNavigation}
            aria-current={selected ? "page" : undefined}
        >
            <div className="pr-2 relative">
                {isLoading ? (
                    <svg className="animate-spin h-7 w-7 md:h-6 md:w-6 text-[#6a51a6]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                    icon
                )}
            </div>
            <div className={`hidden md:block font-bold ${selected ? "text-[#6a51a6]" : "text-slate-500"}`}>
                {title}
                {isLoading && <span className="ml-2 inline-block animate-pulse">...</span>}
            </div>
        </div>
    );
};