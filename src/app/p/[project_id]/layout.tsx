'use client'

import '@/app/globals.css'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '../../ui/AppSidebar'
import { GraduationCap } from 'lucide-react';
import { useSearchParams } from "next/navigation";
import { getCookie } from '@/utils';

interface LayoutProps {
  children: React.ReactNode;
  params: {
    project_id: string;
  };
}

export default function Layout({ children, params }: LayoutProps) {
    const user_id = getCookie("userId");
    const { project_id } = params 


     return (
        // <div className="bg-gradient-to-br from-blue-300 to-emerald-100 min-h-screen w-full">
        <div className="bg-gradient-to-br from-blue-300 to-emerald-100 min-h-screen w-full">

            <div className="flex min-h-screen">
                <SidebarProvider
                    style={{
                        "--sidebar-width": "20rem",
                        "--sidebar-width-mobile": "16rem",
                    }}
                >
                <AppSidebar userId={user_id} projectId={project_id} />
                    {/* <main className="flex-1 flex justify-center items-center">
                        {/* <div className="w-full h-full bg-white/95 flex flex-col justify-between"> */}
                        {/* <div className="flex flex-col h-full w-full bg-gradient-to-br from-blue-900 to-emerald-600"> */}
                        {/* <div className="bg-gradient-to-br from-blue-950 to-green-700 min-h-screen w-full"> */}
                        {/* <div className="bg-gradient-to-br from-blue-900 to-emerald-600 min-h-screen w-full"> */}
                        {/* <div className="bg-gradient-to-br from-blue-900 via-black to-emerald-600 min-h-screen w-full">
                            {children}
                        </div>
                    </main> */} 
                    <main className="flex-1 flex flex-col">
                    <div className="bg-gradient-to-br from-blue-900 via-black to-emerald-600 min-h-screen w-full">
                        {children}
                    </div>
                    </main>

                </SidebarProvider>
            </div>
        </div>
    )

}
  