import React from 'react';
import { FileText, CheckCircle2 } from 'lucide-react';

interface Section {
  id: string;
  type: 'text' | 'image';
  title: string;
  content: string;
  selected: boolean;
}

interface PDFPreviewProps {
  sections: Section[];
}

export function PDFPreview({ sections }: PDFPreviewProps) {
  if (sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-sm border border-gray-100">
        <FileText className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500">Aucune section sélectionnée</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <div className="text-center">
        <h2 className="course-title mb-6">{sections[0].title}</h2>
      </div>

      {sections.map((section, index) => (
        <div key={section.id} className="space-y-4">
          {index > 0 && (
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <CheckCircle2 className="h-5 w-5 text-blue-500" />
              <h4 className="section-title">{section.title}</h4>
            </div>
          )}
          
          {section.type === 'text' ? (
            <div className="prose max-w-none pl-7">
              <div className="content-text">
                {section.content}
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-center p-4 bg-gray-50 rounded-lg">
              <img
                src={section.content}
                alt={section.title}
                className="max-w-full object-contain rounded-lg shadow-md"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}