'use client'
import React from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import Image from 'next/image';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Props = {
    creator_id: string | null
}

const NewProject = ({ creator_id }: Props) => {
    const router = useRouter();
    const [projectName, setProjectName] = useState("");

    const handleSubmit = () => { 
        fetch("http://localhost:8000/add_new_project", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: projectName,
                creator_id: creator_id
            }),
        })
        .then(res => res.json())
        .then(data => {
            console.log(data);
            router.push(`/p/${data.projectId}/${data.sessionId}`);
        })
        .catch(error => {
            console.error("Lỗi gửi thông tin user:", error);
        });
    }

  return (
    // bg-gradient-to-r from-indigo-300 from-10% via-sky-300 via-30% to-emerald-300 to-90%
    <Dialog>
        <form>
            <DialogTrigger asChild>
                {/* <Card className="flex w-80 h-48 bg-black items-center justify-center">
                    <CardContent>
                        <div>
                            <Plus className='w-20 h-20 font-bold text-white'/>
                        </div>
                    </CardContent>
                </Card> */}

                <Card
                    className="
                        w-80 h-56 bg-gradient-to-br from-slate-900/50 to-slate-800/60 relative cursor-pointer rounded-2xl flex flex-col items-center
                        transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/20 hover:bg-gradient-to-br hover:from-slate-800/70 hover:to-slate-700/80 
                        hover:scale-[1.02] group border border-slate-700/50 hover:border-cyan-400/30
                        backdrop-blur-sm
                    "
                    tabIndex={0}
                    >
                    <CardContent className="flex flex-col items-center justify-between h-full pt-7 pb-4">
                        {/* Dấu cộng trong vòng tròn, ở giữa trên */}
                        <div
                        className="
                            flex items-center justify-center
                            rounded-xl bg-gradient-to-br from-slate-700/80 to-slate-800/90 w-[120px] h-[120px]
                            mb-6 mt-2
                            transition-all duration-300
                            group-hover:bg-gradient-to-br group-hover:from-cyan-500/20 group-hover:to-blue-500/20
                            shadow-lg group-hover:shadow-cyan-500/30
                            border border-slate-600/50 group-hover:border-cyan-400/50
                        "
                        >
                        <Plus size={56} className="text-slate-300 group-hover:text-cyan-400 transition-all duration-300 drop-shadow-lg" />
                        </div>
                        {/* Text giống như card project */}
                        <div className="w-full flex flex-col items-center mt-6">
                        <span className="text-xl font-semibold text-slate-200 group-hover:text-white text-center transition-all duration-300 drop-shadow-sm">
                            Tạo Project mới
                        </span>
                        </div>
                    </CardContent>
                </Card>





            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">

            <DialogHeader>
                <DialogTitle>New Project</DialogTitle>
                <DialogDescription>
                Tạo ra project mới chứa các tài liệu học tập
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
                <div className="grid gap-3">
                    <Label htmlFor="name-1">Project Name</Label>
                    <Input id="name-1" 
                           name="name" 
                           placeholder='Project Name' 
                           value={projectName}
                           onChange={(e) => setProjectName(e.target.value)}
                    />
                </div>

                {/* <div className="grid gap-3">
                <Label htmlFor="username-1">Username</Label>
                <Input id="username-1" name="username" defaultValue="@peduarte" />
                </div> */}
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                
                <DialogClose>
                    <Button type="submit" onClick={handleSubmit}>Save changes</Button>
                </DialogClose>
            </DialogFooter>
            </DialogContent>
        </form>
    </Dialog>
  )
}

export default NewProject;
