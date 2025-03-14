"use client"

import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

export const SidebarItem = ({ href, title, icon }: { href: string; title: string; icon: React.ReactNode }) => {
    const router = useRouter();
    const pathname = usePathname();
    const selected = pathname === href

    return (
        <div
            className={`flex ${selected ? "text-[#6a51a6]" : "text-slate-500"} cursor-pointer p-2 `}
            onClick={() => {
                router.push(href)
            }}>
            <div className="pr-2 ">
                {icon}
            </div>
            <div className={`hidden md:block font-bold ${selected ? "text-[#6a51a6]" : "text-slate-500"}`}>
                {title}
            </div>
        </div>
    )
}