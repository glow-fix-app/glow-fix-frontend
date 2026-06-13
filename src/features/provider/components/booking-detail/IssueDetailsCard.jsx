import React from "react";
import { Card } from "@heroui/react";
import { ChatBubbleBottomCenterTextIcon, PhotoIcon, EyeIcon } from "@heroicons/react/24/outline";
import { getApiOrigin } from "@/services/apiBase";

export default function IssueDetailsCard({ note, images, onImageClick }) {
  return (
    <Card className="p-6 border border-gray-100 bg-white rounded-2xl">
      <h2 className="text-gray-800 font-semibold text-sm mb-5 flex items-center gap-2 tracking-tight border-b border-gray-50 pb-2">
        <ChatBubbleBottomCenterTextIcon className="w-5 h-5 text-indigo-500" /> Issue Details & Media
      </h2>
      
      <div className="mb-5">
        <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2.5">Client Note / Description</h3>
        {note ? (
          <div className="bg-slate-50/50 rounded-xl p-4 border-l-4 border-indigo-400 border-y border-r border-gray-100/80">
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap font-normal">
              {note}
            </p>
          </div>
        ) : (
          <p className="text-gray-400 italic text-sm font-normal">No specific notes provided by the client.</p>
        )}
      </div>

      {images && images.length > 0 && (
        <div className="pt-4 border-t border-gray-50">
          <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <PhotoIcon className="w-4 h-4 text-gray-400" /> Attached Photos ({images.length})
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200">
            {images.map((img, idx) => {
              const imgSrc = img.startsWith('http') ? img : `${getApiOrigin()}${img.startsWith('/') ? '' : '/'}${img}`;
              return (
                <div 
                  key={idx} 
                  className="relative aspect-square w-24 flex-shrink-0 group rounded-xl overflow-hidden border border-gray-200 cursor-pointer shadow-sm hover:shadow-md transition-all bg-gray-50"
                  onClick={() => onImageClick(imgSrc)}
                >
                  <img 
                    src={imgSrc} 
                    alt={`Problem ${idx}`} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <EyeIcon className="w-5 h-5 text-white" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
