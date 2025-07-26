
// "use client";
// import React, { useState } from "react";
// import {
//   Drawer,
//   DrawerClose,
//   DrawerContent,
//   DrawerDescription,
//   DrawerFooter,
//   DrawerHeader,
//   DrawerTitle,
//   DrawerTrigger,
// } from "@/components/ui/drawer";
// import { Button } from "@/components/ui/button";
// import FileUpload from "./FileUpload";
// import { uploadToS3, getS3Url } from "@/lib/s3";

// type UploadDrawerProps = {
//   userId: string  ;      // Thêm props userId
//   projectId: string;  
//   children: React.ReactNode;
//   onUploadSuccess?: (fileInfo: { file_key: string; file_name: string }) => void;
   
// };

// const UploadDrawer = ({ children, onUploadSuccess,  userId, projectId }: UploadDrawerProps) => {
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [isUploading, setIsUploading] = useState(false);
//   const [uploadResult, setUploadResult] = useState<{ file_key: string; file_name: string } | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [open, setOpen] = useState(false);
//   const handleSubmit = async () => {
//     if (!selectedFile) {
//       setError("No file selected");
//       return;
//     }

//     if (!userId || !projectId) {
//     setError("User ID and Project ID are required");
//     return;
//     }
//     setIsUploading(true);
//     setError(null);
//     setUploadResult(null);

//     try {
//       const result = await uploadToS3(selectedFile, userId, projectId);
//       setUploadResult(result);
//       setError(null);
//         /////////////////=======================
//       await fetch("http://localhost:8000/api/handle_uploaded_pdf", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             file_url: getS3Url(result.file_key),
//             file_name: result.file_name,
//           }),
//         });
        
//         // const data = await response.json();
//         // console.log("Response from FastAPI:", data);
//         //======================================
//       // }

//       const fileName = result.file_name;
//       const bookName = fileName.replace(/\.pdf$/i, "");
//       const linkBook = getS3Url(result.file_key);      

//       const res = await fetch("http://localhost:8000/add_new_book", {
//                       method: "POST",
//                       headers: { "Content-Type": "application/json" },
//                       body: JSON.stringify({  
//                         book_id: "",                  
//                         user_id: userId,
//                         project_id: projectId,
//                         link_book: linkBook,
//                         name_book:bookName
//                       }),
//                     });
//       if (onUploadSuccess) {
//         onUploadSuccess(result); 
//       }
//       setOpen(false);
                    
//     } catch (err) {
//       setError("Upload failed");
//     } finally {
//       setIsUploading(false);
//     }
    
//   };

//   return (
//     <Drawer>
//       {/* <DrawerTrigger onClick={() => setOpen(true)}>{children}</DrawerTrigger> */}
//       <DrawerTrigger asChild>
//         <span onClick={() => setOpen(true)}>{children}</span>
//       </DrawerTrigger>
//       <DrawerContent>
//         <DrawerHeader>
//           <DrawerTitle>Upload PDF to S3</DrawerTitle>
//           <DrawerDescription>Chỉ chấp nhận file PDF.</DrawerDescription>
//         </DrawerHeader>

//         <FileUpload onFileSelected={setSelectedFile} />

//         <div className="p-4">
//           {selectedFile && (
//             <p className="text-sm text-gray-700">Selected: {selectedFile.name}</p>
//           )}
//           {uploadResult && (
//             <p className="text-green-600 text-sm">
//               ✅ Uploaded:{" "}
//               <a
//                 href={getS3Url(uploadResult.file_key)}
//                 target="_blank"
//                 rel="noopener noreferrer"
//               >
//                 {uploadResult.file_name}
//               </a>
//             </p>
//           )}
//           {error && <p className="text-red-600 text-sm">⚠ {error}</p>}
//         </div>

//         <DrawerFooter>
//           <Button onClick={handleSubmit} disabled={isUploading || !selectedFile}>
//             {isUploading ? "Uploading..." : "Summit"}
//           </Button>
//           <DrawerClose>
//             <Button variant="outline">Cancel</Button>
//           </DrawerClose>
//         </DrawerFooter>
//       </DrawerContent>
//     </Drawer>
//   );
// };

// export default UploadDrawer;


"use client";
import React, { useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import FileUpload from "./FileUpload";
import { uploadToS3, getS3Url } from "@/lib/s3";

type UploadDrawerProps = {
  userId: string; 
  projectId: string;  
  children: React.ReactNode;
  onUploadSuccess?: (fileInfo: { file_key: string; file_name: string }) => void;
};

const UploadDrawer = ({ children, onUploadSuccess, userId, projectId }: UploadDrawerProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ file_key: string; file_name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [fileType, setFileType] = useState<'pdf' | 'text' | 'url'>('pdf');
  const [textContent, setTextContent] = useState<string>('');
  const [urlInput, setUrlInput] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // Thêm state cho thông báo thành công

  const handleSubmit = async () => {
    setIsUploading(true);
    setError(null);
    setUploadResult(null);
    setSuccessMessage(null); // Đặt lại thông báo thành công

    try {
      if (fileType === 'pdf' && selectedFile) {
        const result = await uploadToS3(selectedFile, userId, projectId);
        const linkBook = getS3Url(result.file_key);
        const bookName = result.file_name.replace(/\.pdf$/i, "");

        await fetch("http://localhost:8000/api/handle_uploaded_pdf", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            file_url: linkBook,
            file_name: result.file_name,
          }),
        });

        await fetch("http://localhost:8000/add_new_book", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({  
            book_id: "",                  
            user_id: userId,
            project_id: projectId,
            link_book: linkBook,
            name_book: bookName,
          }),
        });

        setUploadResult(result);
        if (onUploadSuccess) {
          onUploadSuccess(result); 
        }
        setSuccessMessage("PDF đã được tải lên thành công!");
      } else if (fileType === 'text') {
        if (textContent) {
          await fetch("http://localhost:8000/add_new_book", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({  
              book_id: "",                  
              user_id: userId,
              project_id: projectId,
              link_book: "", // Không có link cho nội dung text
              name_book: textContent,
            }),
          });
          setTextContent(''); // Đặt lại nội dung sau khi gửi
          setSuccessMessage("Nội dung văn bản đã được lưu thành công!");
        }
      } else if (fileType === 'url') {
        if (urlInput) {
          await fetch("http://localhost:8000/add_new_book", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({  
              book_id: "",                  
              user_id: userId,
              project_id: projectId,
              link_book: urlInput,
              name_book: urlInput.split('/').pop(),
            }),
          });
          setUrlInput(''); // Đặt lại URL sau khi gửi
          setSuccessMessage("Dữ liệu đã được lấy từ URL thành công!");
        }
      }

      setOpen(false);
    } catch (err) {
      setError("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <span onClick={() => setOpen(true)}>{children}</span>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Upload File</DrawerTitle>
          <DrawerDescription>Chọn loại tệp để tải lên.</DrawerDescription>
        </DrawerHeader>

        <div className="p-4">
          <div className="flex flex-col space-y-2">
            <label className="flex items-center">
              <input 
                type="radio" 
                value="pdf" 
                checked={fileType === 'pdf'} 
                onChange={() => setFileType('pdf')} 
                className="mr-2"
              /> PDF
            </label>
            <label className="flex items-center">
              <input 
                type="radio" 
                value="text" 
                checked={fileType === 'text'} 
                onChange={() => setFileType('text')} 
                className="mr-2"
              /> TEXT
            </label>
            <label className="flex items-center">
              <input 
                type="radio" 
                value="url" 
                checked={fileType === 'url'} 
                onChange={() => setFileType('url')} 
                className="mr-2"
              /> URL
            </label>
          </div>
        </div>

        {fileType === 'pdf' && (
          <FileUpload onFileSelected={setSelectedFile} />
        )}

        {fileType === 'text' && (
          <div className="p-4">
            <textarea 
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Nhập nội dung văn bản của bạn ở đây..."
              className="w-full h-32 p-2 border border-gray-300 rounded"
            />
          </div>
        )}

        {fileType === 'url' && (
          <div className="p-4">
            <input 
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Nhập URL của bạn ở đây..."
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        )}

        <div className="p-4">
          {selectedFile && fileType === 'pdf' && (
            <p className="text-sm text-gray-700">Selected: {selectedFile.name}</p>
          )}
          {uploadResult && (
            <p className="text-green-600 text-sm">
              ✅ Uploaded:{" "}
              <a
                href={getS3Url(uploadResult.file_key)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {uploadResult.file_name}
              </a>
            </p>
          )}
          {error && <p className="text-red-600 text-sm">⚠ {error}</p>}
          {successMessage && <p className="text-green-600 text-sm">{successMessage}</p>} {/* Thông báo thành công */}
        </div>

        <DrawerFooter>
          <Button onClick={handleSubmit} disabled={isUploading || (fileType === 'pdf' && !selectedFile) || (fileType === 'text' && !textContent) || (fileType === 'url' && !urlInput)}>
            {isUploading ? "Uploading..." : "Submit"}
          </Button>
          <DrawerClose>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default UploadDrawer;

