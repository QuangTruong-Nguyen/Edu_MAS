'use client'
import React from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
} from "@/components/ui/card"

import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { MoreVertical, Trash, Pencil } from "lucide-react"
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
// type Props = {
//     userId: string | null;
//     projectId: string;
//     title: string;
//     createAt: string
// }

type Props = {
    userId: string | null;
    projectId: string;
    title: string;
    createAt: string;
    onDelete?: (id: string) => void;
    onRename?: (id: string, name: string) => void;
}


const ProjectCard = ({userId, projectId, title, createAt, onDelete, onRename}: Props) => {
    const router = useRouter();
    return (
        // bg-gradient-to-r from-indigo-300 from-10% via-sky-300 via-30% to-emerald-300 to-90%

        // <Card className="w-80 h-48 bg-white relative rounded-xl shadow-lg cursor-pointer transition-transform duration-200 hover:scale-105 hover:shadow-2xl"
        //     onClick={() => {
        //         // document.cookie = `projectId=${projectId}`
        //         router.push(`/p/${projectId}`);
        //     }}

        //     ///${projectId}
        // >
        //     <div className="absolute top-2 right-2 z-10" 
        //         onClick={e => e.stopPropagation()}>
        //         <DropdownMenu>
        //             <DropdownMenuTrigger asChild>
        //                 <button className="hover:bg-slate-200 rounded-full p-1">
        //                     <MoreVertical size={18} />
        //                 </button>
        //             </DropdownMenuTrigger>
        //             <DropdownMenuContent>
        //                 <DropdownMenuItem
        //                     onClick={() => { if (onRename) onRename(projectId, title) }}
        //                 >
        //                     <Pencil className="mr-2 w-4 h-4" />
        //                     Đổi tên
        //                 </DropdownMenuItem>
        //                 <DropdownMenuItem
        //                     onClick={() => { if (onDelete) onDelete(projectId) }}
        //                     className="text-red-600"
        //                 >
        //                     <Trash className="mr-2 w-4 h-4" />
        //                     Xóa
        //                 </DropdownMenuItem>
        //             </DropdownMenuContent>
        //         </DropdownMenu>
        //     </div>

        //     <CardContent>
        //         <div className="grid grid-cols-2">
        //             <div className="justify-start">
        //                 <Image src="/images/images.jpg" alt="Artificial Intelligence" width={100} height={100} />
        //             </div>

        //             <div className="flex p-5 justify-center items-center">
        //                 <Label className="text-2xl font-semibold text-slate-600">{title}</Label>
        //                 <Label>{createAt}</Label>
        //             </div>
        //         </div>
        //     </CardContent>
        // </Card>


        // <Card className="w-60 h-80 bg-slate-950/40 relative cursor-pointer" onClick={() => router.push(`/p/${projectId}`)}>
        // {/* Dấu 3 chấm ở góc phải trên */}
        // <div className="absolute top-2 right-2 z-10" onClick={e => e.stopPropagation()}>
        //     <DropdownMenu>
        //     <DropdownMenuTrigger asChild>
        //         <button className="hover:bg-slate-200 rounded-full p-1">
        //         <MoreVertical size={18} />
        //         </button>
        //     </DropdownMenuTrigger>
        //     <DropdownMenuContent>
        //         <DropdownMenuItem onClick={() => onRename?.(projectId, title)}>
        //         <Pencil className="mr-2 w-4 h-4" />
        //         Đổi tên
        //         </DropdownMenuItem>
        //         <DropdownMenuItem onClick={() => onDelete?.(projectId)} className="text-red-600">
        //         <Trash className="mr-2 w-4 h-4" />
        //         Xóa
        //         </DropdownMenuItem>
        //     </DropdownMenuContent>
        //     </DropdownMenu>
        // </div>

        // {/* Nội dung thẻ */}
        // <CardContent className="flex flex-col items-center justify-between h-full pt-6 pb-4">
        //     {/* Ảnh ở giữa trên */}
        //     <Image
        //     src="/images/images.jpg"
        //     alt="Artificial Intelligence"
        //     width={120}
        //     height={120}
        //     className="mx-auto rounded-lg object-cover"
        //     />
        //     {/* Chữ bên dưới, căn giữa */}
        //     <div className="w-full flex flex-col items-center mt-6">
        //     {/* <Label className="text-xl font-semibold text-slate-200 text-center">{title}</Label> */}
        //     {/* <Label
        //             className="text-xl font-semibold text-slate-200 text-center truncate w-48 cursor-pointer"
        //             title={title} // Tooltip khi hover
        //         >
        //             {title}
        //         </Label> */}
        //         <TooltipProvider>
        //             <Tooltip>
        //                 <TooltipTrigger asChild>
        //                 <Label
        //                     className="text-xl font-semibold text-slate-200 text-center truncate w-48 cursor-pointer"
        //                 >
        //                     {title}
        //                 </Label>
        //                 </TooltipTrigger>
        //                 <TooltipContent>
        //                 <span>{title}</span>
        //                 </TooltipContent>
        //             </Tooltip>
        //             </TooltipProvider>
        //     <Label className="text-sm text-slate-400 text-center">{createAt}</Label>
        //     </div>
        // </CardContent>
        // </Card>

    //         <Card
    //   className="
    //     w-80 h-48 bg-slate-950/40 relative cursor-pointer rounded-2xl
    //     transition-all duration-200
    //     hover:shadow-2xl hover:bg-slate-900/70 hover:scale-105
    //     group border-none
    //     flex flex-col
    //     items-center
    //     "
    //   onClick={() => router.push(`/p/${projectId}`)}
    // >
    //   {/* Dấu 3 chấm ở góc phải trên */}
    //   <div className="absolute top-2 right-2 z-10" onClick={e => e.stopPropagation()}>
    //     <DropdownMenu>
    //       <DropdownMenuTrigger asChild>
    //         <button className="hover:bg-slate-200 rounded-full p-1">
    //           <MoreVertical size={18} />
    //         </button>
    //       </DropdownMenuTrigger>
    //       <DropdownMenuContent>
    //         <DropdownMenuItem onClick={() => onRename?.(projectId, title)}>
    //           <Pencil className="mr-2 w-4 h-4" />
    //           Đổi tên
    //         </DropdownMenuItem>
    //         <DropdownMenuItem onClick={() => onDelete?.(projectId)} className="text-red-600">
    //           <Trash className="mr-2 w-4 h-4" />
    //           Xóa
    //         </DropdownMenuItem>
    //       </DropdownMenuContent>
    //     </DropdownMenu>
    //   </div>

    //   {/* Nội dung thẻ */}
    //   <CardContent className="flex flex-col items-center justify-between h-full pt-7 pb-4">
    //     {/* Ảnh ở giữa trên, hiệu ứng nổi khi hover card */}
    //     <Image
    //       src="/images/images.jpg"
    //       alt="Artificial Intelligence"
    //       width={120}
    //       height={120}
    //       className="mx-auto rounded-lg object-cover shadow-md transition-all duration-200 group-hover:scale-105 group-hover:shadow-xl"
    //     />
    //     {/* Chữ bên dưới, căn giữa, cắt khi dài, có tooltip */}
    //     <div className="w-full flex flex-col items-center mt-7">
    //       <TooltipProvider>
    //         <Tooltip>
    //           <TooltipTrigger asChild>
    //             <Label
    //               className="text-xl font-semibold text-slate-200 text-center truncate w-48 cursor-pointer"
    //             >
    //               {title}
    //             </Label>
    //           </TooltipTrigger>
    //           <TooltipContent>
    //             <span>{title}</span>
    //           </TooltipContent>
    //         </Tooltip>
    //       </TooltipProvider>
    //       <Label className="text-sm text-slate-400 text-center">{createAt}</Label>
    //     </div>
    //   </CardContent>
    // </Card>
//         <Card
//   className="
//     w-60 h-80 bg-slate-950/40 relative cursor-pointer rounded-2xl
//     flex flex-col p-0
//     transition-all duration-200 hover:shadow-2xl hover:bg-slate-900/70 hover:scale-105 group border-none
//   "
//   onClick={() => router.push(`/p/${projectId}`)}
// >
//   {/* Dấu 3 chấm ở góc phải trên */}
//   <div className="absolute top-2 right-2 z-10" onClick={e => e.stopPropagation()}>
//     {/* DropdownMenu ở đây */}
//   </div>

//   {/* Phần trên: Ảnh */}
//   <div className="w-full h-[65%] relative overflow-hidden rounded-t-2xl">
//     <Image
//       src="/images/images.jpg"
//       alt={title}
//       fill
//       className="object-cover"
//       style={{ objectFit: "cover" }}
//     />
//   </div>

//   {/* Đường kẻ ngang */}
//   <div className="w-full h-[1.5px] bg-slate-400/30" />

//   {/* Phần dưới: text */}
//   <div className="flex-1 w-full flex flex-col items-center justify-center px-2">
//     <TooltipProvider>
//       <Tooltip>
//         <TooltipTrigger asChild>
//           <Label
//             className="text-base font-semibold text-slate-200 text-center truncate w-full cursor-pointer mt-2"
//           >
//             {title}
//           </Label>
//         </TooltipTrigger>
//         <TooltipContent>
//           <span>{title}</span>
//         </TooltipContent>
//       </Tooltip>
//     </TooltipProvider>
//     <Label className="text-xs text-slate-400 text-center">{createAt}</Label>
//   </div>
// </Card>

//     <Card
//       className="w-80 h-56 p-0 relative rounded-xl shadow-lg cursor-pointer overflow-hidden relative transition-transform duration-200 hover:scale-105 hover:shadow-2xl bg-white flex flex-col"
//       onClick={() => router.push(`/p/${projectId}`)}
// >
//   <div className="absolute top-2 right-2 z-20" onClick={e => e.stopPropagation()}>
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <button className="hover:bg-slate-200 rounded-full p-1">
//           <MoreVertical size={20} />
//         </button>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent>
//         <DropdownMenuItem onClick={() => onRename?.(projectId, title)}>
//           <Pencil className="mr-2 w-4 h-4" />
//           Đổi tên
//         </DropdownMenuItem>
//         <DropdownMenuItem onClick={() => onDelete?.(projectId)} className="text-red-600">
//           <Trash className="mr-2 w-4 h-4" />
//           Xóa
//         </DropdownMenuItem>
//       </DropdownMenuContent>
//     </DropdownMenu>
//   </div>
  
//       <div className='w-full h-full'>
//       <div className="w-full h-3/4 relative overflow-hidden rounded-t-xl justify-center items-center">
//         <div className="w-full h-full flex justify-center items-center bg-blue-100">
//           <Image
//             src="/images/images.jpg"
//             alt="Artificial Intelligence"
//             width={200}
//             height={200}
//             style={{ objectFit: 'cover' }}
//             className="object-cover"
//           />
          
//         </div>
//       </div>

//       <div className="w-full h-1/4 flex items-center justify-center text-center">
//         <Label className="text-lg font-bold text-slate-800">
//           {title}
//         </Label>
//       </div>
//       </div>
//     </Card>

<Card
  className="w-80 h-56 p-0 relative rounded-xl shadow-lg cursor-pointer overflow-hidden transition-transform duration-200 hover:scale-105 hover:shadow-2xl bg-white flex flex-col"
  onClick={() => router.push(`/p/${projectId}`)}
>
  <div className="absolute top-2 right-2 z-20" onClick={e => e.stopPropagation()}>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="hover:bg-slate-200 rounded-full p-1">
          <MoreVertical size={20} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => onRename?.(projectId, title)}>
          <Pencil className="mr-2 w-4 h-4" />
          Đổi tên
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDelete?.(projectId)} className="text-red-600">
          <Trash className="mr-2 w-4 h-4" />
          Xóa
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
  
  <div className='w-full h-full'>
    <div className="w-full h-3/4 relative overflow-hidden rounded-t-xl flex justify-center items-center bg-blue-100">
      <Image
        src="/images/images.jpg"
        alt="Artificial Intelligence"
        width={200}
        height={200}
        style={{ objectFit: 'cover' }}
        className="object-cover"
      />
    </div>

    <div className=" w-full h-1/4 flex items-center justify-center text-center">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Label
              className="text-lg font-bold text-slate-800"
            //   style={{ width: '90%' }}
            >
              {title}
            </Label>
          </TooltipTrigger>
          <TooltipContent>
            <span>{title}</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  </div>
</Card>






  )
}

export default ProjectCard;
