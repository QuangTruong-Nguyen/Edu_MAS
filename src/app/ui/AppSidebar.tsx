'use client'
import { Calendar, Home, Workflow, Plus, Search, Settings, KeyRound,
    GraduationCap, LibraryBig, ScrollText,
    ChevronDown,
    NotebookPen,
    Presentation,
    FileQuestion,
    MessageCircle
} from 'lucide-react'
import React, { useState, useEffect } from "react";
import { Trash } from 'lucide-react'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupAction,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,   
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarTrigger
} from "@/components/ui/sidebar"
import { SignedIn, SignedOut, SignInButton, UserButton, ClerkProvider } from '@clerk/nextjs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
// import UploadDrawer from "@/ui/UploadDrawer"
import Image from 'next/image'
import { getCookie } from '@/utils';
import { usePathname } from "next/navigation";
import UploadDrawer from "../ui/UploadDrawer";
//////
import { MoreVertical, Pencil } from 'lucide-react'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useUser } from "@clerk/nextjs";




// Menu items
const items = [
    {
        title: "Home",
        url: "/",
        icon: Home,
    }
 
]

type Props = {
    userId: string ;
    projectId: string;
}

export function AppSidebar({ userId, projectId  } : Props) {
    const router = useRouter()
    const pathname = usePathname();

    // const [sessions, setSessions] = useState([])
    
    useEffect(() => {
      fetch(`http://localhost:8000/sessions?userId=${userId}&projectId=${projectId}`)
    //   fetch(`http://localhost:8000/p/projectId=${projectId}`)
      .then(res => res.json())
      .then(data => setSessions(data)            )
      .catch(err => console.error(err))
    }, [userId, projectId, pathname]);

    // console.log(sessions)

    const [uploadedFiles, setUploadedFiles] = useState<{ file_key: string; file_name: string }[]>([]);


    const handleUploadSuccess = () => {
            fetch(`http://localhost:8000/get_book?userId=${userId}&projectId=${projectId}`)
                .then(res => res.json())
                .then(data => setBooks(data));
            };
    

    //___________________________________
    async function handleAddNewSession() {
        if (!projectId) {
            alert("Cần có projectId để tạo session mới!");
            return;
        }
        try {
            const userId = getCookie("userId")

            const response = await fetch("http://localhost:8000/add_new_session", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: "",
                    user_id: userId,
                    project_id: projectId
                })
            });
            const data = await response.json();
            if (data.message === "Session created successfully") {
              
                if (data.session_id) {
                    router.push(`/p/${projectId}/${data.session_id}`);
                    //  setTimeout(() => {
                    //             window.location.reload();
                    //             }, 10); 
                } else {
                    const sessionsResponse = await fetch(`http://localhost:8000/p/${projectId}/${data.session_id}`);
                    const sessionsData = await sessionsResponse.json();
                    setSessions(sessionsData);
                }
            } else {
                alert("Tạo session không thành công!");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Có lỗi xảy ra khi tạo session mới.");
        }
    }

    interface SessionItem {
        session_id: string;
        name?: string;
        id?: string;
        }

        const [sessions, setSessions] = useState<SessionItem[]>([]);


    // const pathname = usePathname();
    // let currentSessionId = null;
    let currentSessionId: string | null = null;
    const pathParts = pathname.split('/');
    if (pathParts.length >= 4 && pathParts[1] === 'p') {
        currentSessionId = pathParts[3];
    }
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(currentSessionId || null);


    console.log("User ID:", userId);
    console.log("Project ID:", projectId);


    const [books, setBooks] = useState<{book_id: string; name_book: string; link_book: string;}[]>([]);
    useEffect(() => {
        if (!userId || !projectId) return;
            fetch(`http://localhost:8000/get_book?userId=${userId}&projectId=${projectId}`)
                .then(res => res.json())
                .then(data => {
                setBooks(data);
                })
                .catch(err => console.error(err));
            }, [userId, projectId]);



    async function handleDeleteSession(sid: string) {
        try {
            await fetch(`http://localhost:8000/session/${sid}`, { method: 'DELETE' })
            setSessions(sessions.filter(s => (s.session_id || s.id) !== sid))
            if (sid === currentSessionId) router.push(`/p/${projectId}`)
        } catch (err) {
            alert('Xoá session thất bại')
        }
        }

    function handleRenameSession(sid: string, currentName: string) {
    const newName = prompt('Nhập tên mới cho session:', currentName)
    if (!newName || newName.trim() === currentName) return

    // Gọi API đổi tên (bạn cần backend hỗ trợ đổi tên session)
    fetch(`http://localhost:8000/session/${sid}/rename`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ name: newName })
    }).then(() => {
        setSessions(sessions.map(s => (s.session_id || s.id) === sid ? { ...s, name: newName } : s))
    }).catch(() => alert('Đổi tên thất bại'))
    }
    const { isLoaded, isSignedIn, user } = useUser();
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <Sidebar 
        className="dark" 
        // className="bg-[#16181d]"
        collapsible="icon">
        
            <SidebarHeader>
                <div className="flex justify-end items-center">
                    <SidebarTrigger className="dark:text-white" onClick={() => setIsCollapsed(x => !x)} />
                </div>
            </SidebarHeader>

            <SidebarContent className="dark" >
                <SidebarGroup className="dark">
                    <SidebarGroupLabel className="text-md dark">
                        <LibraryBig className="dark:text-white" />
                        <span className="p-2 dark:text-white">Sources</span>
                    </SidebarGroupLabel>
                    <SidebarGroupAction title="Add new source">
                        <UploadDrawer  userId={userId || ""}
                                    projectId={projectId || ""} 
                                    onUploadSuccess={handleUploadSuccess}
                                     >
                            <Plus /> 
                        </UploadDrawer>
                        <span className="sr-only">Add new chat</span>
                    </SidebarGroupAction>                    
                    {!isCollapsed && books.length > 0 && (
                        <div className="pl-8 pt-2 space-y-1 overflow-y-auto max-h-64">
                            {books.map((book) => (
                            <div key={book.book_id} className="text-white text-xs truncate flex items-center gap-2">
                                <Image
                                src="/pdf.svg"
                                alt="PDF Icon"
                                width={20}
                                height={20}
                                />
                                 {!isCollapsed && (
                                <a
                                className="truncate underline"
                                href={book.link_book}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={book.name_book}
                                >
                                {book.name_book}
                                </a>
                                 )}
                            </div>
                            ))}
                        </div>
                        )}
                </SidebarGroup>
                    
                <SidebarGroup className="dark">
                    <SidebarGroupLabel className="text-md dark">
                        <MessageCircle className="dark:text-white"/>
                        <span className="p-2">Chat Sessions</span>
                    </SidebarGroupLabel>

                    <SidebarGroupAction title="New chat session" onClick={handleAddNewSession}>
                        <Plus className="w-10 h-10"/> 
                        <span className="sr-only">New chat session</span>
                    </SidebarGroupAction>
                    
                    {!isCollapsed && (
                    <SidebarGroupContent className="dark overflow-y-auto max-h-64">
                            <SidebarMenu className="dark">
                                {sessions.map((session) => {
                                const sid = session.session_id || session.id;
                                const isCurrent = sid === currentSessionId;
                                const menuItemClass = `dark py-1 ${isCurrent ? "bg-blue-600 text-white" : ""}`;
                                return (
                                    <SidebarMenuItem className={menuItemClass} key={sid}>
                                    <SidebarMenuButton asChild size="sm">
                                        <div className="flex items-center justify-between w-full">
                                        <Link href={`/p/${projectId}/${sid}`}>
                                        <span className={isCollapsed ? "hidden" : "text-md ml-2 dark:text-white"}>
                                            {session.name || 'Untitled Session'}
                                        </span>
                                        </Link>
                                        {/* <button
                                            onClick={async (e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            if (!confirm('Do you want to delete this session?')) return;
                                            try {
                                                await fetch(`http://localhost:8000/session/${sid}`, {
                                                method: 'DELETE'
                                                });
                                                // Cập nhật lại danh sách session sau khi xoá
                                                setSessions(sessions.filter(s => (s.session_id || s.id) !== sid));
                                                // Nếu đang ở session bị xoá thì chuyển về trang project
                                                if (sid === currentSessionId) {
                                                router.push(`/p/${projectId}`);
                                                }
                                            } catch (err) {
                                                alert('Xoá session thất bại');
                                            }
                                            }}
                                            className="ml-2 text-red-500 hover:text-red-700"
                                            title="Xóa session"
                                        >
                                            <Trash size={16} />
                                        </button> */}

                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                            <button className="ml-2 text-gray-400 hover:text-white" onClick={e => {e.preventDefault(); e.stopPropagation();}}>
                                                <MoreVertical size={16} />
                                            </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                            {/* Đổi tên */}
                                            <DropdownMenuItem
                                                onClick={() => handleRenameSession(sid as string, session.name || '')}
                                            >
                                                <Pencil className="mr-2 w-4 h-4" />
                                                Đổi tên
                                            </DropdownMenuItem>
                                            {/* Xóa */}
                                            <DropdownMenuItem
                                                onClick={async () => {
                                                if (!sid) return;
                                                if (!confirm('Bạn có chắc muốn xoá session này?')) return;
                                                await handleDeleteSession(sid);
                                                }}
                                                className="text-red-600"
                                            >
                                                <Trash className="mr-2 w-4 h-4" />
                                                Xóa
                                            </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>


                                    </div>

                                        

                                    </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                                })}
                            </SidebarMenu>
                            </SidebarGroupContent>
                    )}
                </SidebarGroup>
                    
                {/* <Collapsible defaultOpen className='group/collapsible'>
                    <SidebarGroup className="dark">
                        <SidebarGroupLabel asChild className="text-md dark">
                            <CollapsibleTrigger>
                                Results
                                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                            </CollapsibleTrigger>
                        </SidebarGroupLabel>   */}

                        {/* <CollapsibleContent>
                            <SidebarGroupContent className="dark"> */}
                                <SidebarMenu className="dark p-2">
                                    {items.map((item) => (
                                        <SidebarMenuItem className="dark py-1" key={item.title}>
                                            <SidebarMenuButton asChild size="sm">
                                                <Link href={item.url}>
                                                    <item.icon className='w-24 h-24 dark:text-white' />
                                                    <span className="text-md ml-2 dark:text-white">{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            {/* </SidebarGroupContent>
                        </CollapsibleContent> */}

                    {/* </SidebarGroup>
                </Collapsible> */}


                {/* <SidebarFooter>
                    <div className="flex items-center space-x-4">
                        <div className="shrink-0">
                            <SignedIn>
                                <UserButton />
                            </SignedIn>
                        </div>

                        <div className="flex flex-col">
                            <p className="font-semibold dark:text-white">Hải Huỳnh</p>
                            <p className="text-sm text-gray-500">whitehatsuzerain3578@gmail.com</p>
                        </div>
                    </div>
                </SidebarFooter> */}


                <SidebarFooter>
                    <div className="flex items-center sticky space-x-4">
                        <div className="shrink-0">
                        <SignedIn>
                            <UserButton />
                        </SignedIn>
                        </div>
                        <div className="flex flex-col">
                        <p className="font-semibold dark:text-white">
                            {user?.firstName || ""} {user?.lastName || ""}
                        </p>
                        <p className="text-sm text-gray-500">
                            {user?.primaryEmailAddress?.emailAddress || ""}
                        </p>
                        </div>
                    </div>
                    </SidebarFooter>
            </SidebarContent>
        </Sidebar>
    )
}
