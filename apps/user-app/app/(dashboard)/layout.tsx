import { JSX } from "react";
import { SidebarItem } from "../../components/SidebarItem";

export default function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="grid grid-cols-1 md:grid md:grid-cols-8 min-h-full">
            <div className="md:relative md:h-full md:col-span-2 xl:col-span-1  fixed bottom-0 left-0 w-full flex md:flex-col flex-row justify-between md:items-left items-center md:items-start md:border-r border-t md:border-t-0 border-slate-400  bg-white md:overflow-y-auto p-4 z-10">
                <div className="flex md:flex-col md:gap-10 w-full justify-between md:items-left md:pt-20  ">
                    <SidebarItem href={"/dashboard"} icon={<HomeIcon />} title="Home"></SidebarItem>
                    <SidebarItem href={"/deposit"} icon={<TransferIcon />} title="Deposit" />
                    <SidebarItem href={"/transactions"} icon={<TransactionsIcon />} title="Transactions" />
                    <SidebarItem href={"/P2P"} icon={<P2pLine />}  title="P2P Transfer"/>
                </div>
            </div>
            <div className="md:col-span-6 xl:col-span-7 pb-16 md:pb-0 overflow-auto min-h-screen">
                {children}
            </div>
        </div>
    )
}


function HomeIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-7 h-7 md:w-6 md:h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
    );
}

function TransferIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-7 h-7 md:w-6 md:h-6">
            <path strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
        </svg>
    );
}

function TransactionsIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-7 h-7 md:w-6 md:h-6">
            <path strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
    );
}

function P2pLine(props: any) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 md:w-6 md:h-6" viewBox="0 0 24 24" {...props}>
            <path fill="currentColor" d="M17 6a1 1 0 1 1 0-2a1 1 0 0 1 0 2Zm0 2a3 3 0 1 0 0-6a3 3 0 0 0 0 6ZM7 3a4 4 0 0 0-4 4v2h2V7a2 2 0 0 1 2-2h3V3H7Zm10 18a4 4 0 0 0 4-4v-2h-2v2a2 2 0 0 1-2 2h-3v2h3Zm-9-8a1 1 0 1 0-2 0a1 1 0 0 0 2 0Zm2 0a3 3 0 1 1-6 0a3 3 0 0 1 6 0Zm7-2a2 2 0 0 0-2 2h-2a4 4 0 0 1 8 0h-2a2 2 0 0 0-2-2ZM5 21a2 2 0 1 1 4 0h2a4 4 0 0 0-8 0h2Z"></path>
        </svg>
    )
}


