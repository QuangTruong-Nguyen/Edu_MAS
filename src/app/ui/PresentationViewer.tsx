// import React from 'react'

// type Props = {
//     presentation_url: string
// }

// const PresentationViewer = ({presentation_url}: Props) => {
//     // Chuẩn hóa URL để đảm bảo hiển thị tối ưu
//     const getEmbedUrl = (url: string) => {
//         console.log('Original URL:', url); // Debug log
        
//         // Nếu đã là URL đầy đủ
//         if (url.startsWith('http')) {
//             // Xử lý các loại URL khác nhau
//             let embedUrl = url;
            
//             // Chuyển đổi /edit hoặc /view thành /embed
//             if (url.includes('/edit') || url.includes('/view')) {
//                 embedUrl = url.replace(/\/(edit|view).*$/, '/embed');
//             }
            
//             // Thêm parameters cho embed
//             const separator = embedUrl.includes('?') ? '&' : '?';
//             embedUrl += `${separator}start=false&loop=false&delayms=3000&rm=minimal&usp=embed_facebook`;
            
//             console.log('Processed URL:', embedUrl); // Debug log
//             return embedUrl;
//         }
        
//         // Nếu chỉ là ID
//         const finalUrl = `https://docs.google.com/presentation/d/${url}/embed?start=false&loop=false&delayms=3000&rm=minimal&usp=embed_facebook`;
//         console.log('ID-based URL:', finalUrl); // Debug log
//         return finalUrl;
//     };

//     return (
//         <div className="w-full h-full bg-black relative overflow-hidden">
//             <iframe 
//                 src={getEmbedUrl(presentation_url)}
//                 frameBorder="0" 
//                 className="absolute inset-0 w-full h-full border-0"
//                 style={{ 
//                     width: '100%', 
//                     height: '100%',
//                     minWidth: '100%',
//                     minHeight: '100%'
//                 }}
//                 allowFullScreen
//                 allow="autoplay; encrypted-media"
//                 sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
//                 loading="eager"
//             >
//                 <div className="flex items-center justify-center h-full text-white">
//                     <p>Unable to load presentation. Please check the URL and sharing permissions.</p>
//                 </div>
//             </iframe>
//         </div>
//     )
// }

// export default PresentationViewer;


import React from 'react';

type Props = {
    presentation_url: string;
};

const PresentationViewer = ({ presentation_url }: Props) => {
    const getEmbedUrl = (url: string) => {
        if (url.startsWith('http')) {
            let embedUrl = url;
            if (url.includes('/edit') || url.includes('/view')) {
                embedUrl = url.replace(/\/(edit|view).*$/, '/embed');
            }
            const separator = embedUrl.includes('?') ? '&' : '?';
            embedUrl += `${separator}start=false&loop=false&delayms=3000&rm=minimal&usp=embed_facebook`;
            return embedUrl;
        }
        const finalUrl = `https://docs.google.com/presentation/d/${url}/embed?start=false&loop=false&delayms=3000&rm=minimal&usp=embed_facebook`;
        return finalUrl;
    };

    return (
        <div className="flex flex-col w-full h-full">
            <iframe
                src={getEmbedUrl(presentation_url)}
                frameBorder="0" 
                className="w-full flex-1 border-none rounded"
                allowFullScreen
                allow="autoplay; encrypted-media"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                loading="eager"
            >
                <div className="flex items-center justify-center h-full text-white">
                    <p>Unable to load presentation. Please check the URL and sharing permissions.</p>
                </div>
            </iframe>
        </div>
    );
};

export default PresentationViewer;
