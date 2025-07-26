'use client'
import Image from "next/image";

import { Separator } from "@/components/ui/separator";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ProjectCard from "../../ui/ProjectCard";
import NewProject from "../../ui/NewProject";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { SignedIn, SignedOut, SignInButton, UserButton, ClerkProvider } from '@clerk/nextjs';
import { Roboto_Flex, Playfair_Display, Pirata_One, Spicy_Rice, Molle } from '@next/font/google';

const roboto = Roboto_Flex({
    subsets: ["latin"], 
    weight: '1000',
})

const roboto_light = Roboto_Flex({
    subsets: ["latin"], 
    weight: '700',
})

interface Props {
  params: {user_id: string}
}

type Project = {
  id: string;
  name: string;
  createAt: string;
};
function getCookie(name: string): string | null {
  const value = document.cookie
    .split('; ')
    .find((row) => row.startsWith(name + '='));
  return value ? value.split('=')[1] : null;
}

export default function Home( { params } : Props) {
  const { user_id } = params
  // const [projects, setProjects] = useState([]);
  const [projects, setProjects] = useState<Project[]>([]);

  
  const { isLoaded, isSignedIn, user } = useUser();
  // const params = useSearchParams();
  // const userId = params.get("userId");

  let nameOrId = user?.firstName
    ? user.firstName + " " + user.lastName
    : user_id
    ? user_id
    : "User";

  useEffect(() => {
    fetch(`http://localhost:8000/projects?userId=${user_id}`)
      .then(res => res.json())
      .then(data => setProjects(data))
      .catch(err => console.error(err))
  }, [])

  console.log(getCookie("userId"))

  //
  const handleDeleteProject = async (projectId: string) => {
      if (!confirm("Bạn có chắc muốn xóa project này không?")) return;
      await fetch(`http://localhost:8000/project/${projectId}`, { method: "DELETE" });
      setProjects(prev => prev.filter((p) => p.id !== projectId));
    };

    const handleRenameProject = async (projectId: string, currentName: string) => {
      const newName = prompt("Nhập tên mới cho project:", currentName);
      if (!newName || newName.trim() === currentName) return;
      await fetch(`http://localhost:8000/project/${projectId}/rename`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName })
      });
      setProjects(prev => prev.map((p) => p.id === projectId ? { ...p, name: newName } : p));
    };
  return (
    <div className="w-full h-full">
              
      {/* <div className="flex sticky top-0 items-center justify-between p-3 bg-slate-200">
       */}
      <div className="flex sticky top-0 z-50 items-center justify-between p-3 bg-slate-200 shadow-md">
                <div className="flex items-center gap-2">
                  <div className="size-24 rounded-full bg-conic/decreasing from-violet-700 via-lime-300 to-violet-700 rounded-full w-12 h-12 flex items-center justify-center">
                    <GraduationCap className="w-8 h-8 text-white" />
                  </div>
                  <span className={`${roboto.className} text-lg font-semibold`}>EduGen • MAS</span>
                </div>
                  <header className="flex items-center gap-4">
                    <SignedIn>
                      <UserButton />
                    </SignedIn>
                  </header>
      </div>

       
      
      <div className="flex items-center justify-center pt-10  pb-20">
        <h1 className={`${roboto_light.className} text-5xl font-bold font-sans`}>Xin chào, {nameOrId}</h1>
      </div>

      {/* <div className="pt-10 grid mx-auto w-250 items-start justify-start">
        <h2 className="text-2xl font-semibold">All Projects</h2>
        <Separator className="my-4" />
      </div> */}


      <div className="mx-auto w-250 pt-10 pb-20 grid grid-cols-3 gap-10 justify-center items-center">
        {projects.map((project) => (
            <ProjectCard userId={user_id} 
                  projectId={project.id} 
                  title={project.name} 
                  createAt={project.createAt} 
                  onDelete={handleDeleteProject}    
                  onRename={handleRenameProject}/>
        ))}
        <NewProject creator_id={user_id}/>
      </div>
{/* 
      <div className="w-full flex justify-center pt-10 pb-20">
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 justify-items-center w-full max-w-6xl">
    {projects.map((project) => (
      <ProjectCard
        userId={user_id}
        projectId={project.id}
        title={project.name}
        createAt={project.createAt}
        onDelete={handleDeleteProject}
        onRename={handleRenameProject}
      />
    ))}
    <NewProject creator_id={user_id}/>
    </div>
      </div> */}

      </div>
  );
}
