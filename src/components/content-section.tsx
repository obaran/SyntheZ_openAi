import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, Maximize2, Edit2, Save, XCircle, CheckCircle2, Crop } from 'lucide-react';
import { Button } from './ui/button';
import { ImageCropper } from './image-cropper';

interface Section {
  id: string;
  type: 'text' | 'image';
  title: string;
  content: string;
  selected: boolean;
}

interface ContentSectionProps {
  section: Section;
  onToggle: () => void;
  onRemove: () => void;
  onUpdate: (updatedSection: Section) => void;
}

export function ContentSection({ section, onToggle, onRemove, onUpdate }: ContentSectionProps) {
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(section.title);
  const [editedContent, setEditedContent] = useState(section.content);
  const [isCropping, setIsCropping] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSave = () => {
    onUpdate({
      ...section,
      title: editedTitle,
      content: editedContent
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTitle(section.title);
    setEditedContent(section.content);
    setIsEditing(false);
  };

  const handleCrop = (croppedImage: string) => {
    onUpdate({
      ...section,
      content: croppedImage
    });
    setIsCropping(false);
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`course-section ${
          section.selected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
        }`}
      >
        <div className="flex items-start gap-4 p-5">
          <button
            className="mt-1 cursor-grab hover:text-blue-600 focus:outline-none"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-5 w-5" />
          </button>

          <div className="flex items-center mt-1">
            <input
              type="checkbox"
              checked={section.selected}
              onChange={onToggle}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              {isEditing ? (
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Titre de la section"
                />
              ) : (
                <h3 className="section-title">{section.title}</h3>
              )}
              <div className="flex items-center gap-3">
                {section.type === 'image' && (
                  <>
                    <button
                      onClick={() => setIsCropping(true)}
                      className="edit-button"
                      title="Rogner l'image"
                    >
                      <Crop className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setIsImageExpanded(true)}
                      className="edit-button"
                      title="Agrandir l'image"
                    >
                      <Maximize2 className="h-5 w-5" />
                    </button>
                  </>
                )}
                {section.type !== 'image' && !isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="edit-button"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                )}
                {!isEditing && (
                  <button
                    onClick={onRemove}
                    className="remove-button"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>

            {section.type === 'image' ? (
              <div className="relative group">
                <img
                  src={section.content}
                  alt={section.title}
                  className="w-full rounded-lg shadow-sm transition-transform hover:scale-[1.02]"
                  onClick={() => setIsImageExpanded(true)}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-lg" />
              </div>
            ) : (
              <div className="prose max-w-none">
                {isEditing ? (
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full h-64 p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Contenu de la section"
                  />
                ) : (
                  <div className="content-text">
                    {section.content}
                  </div>
                )}
              </div>
            )}

            {isEditing && (
              <div className="flex justify-end gap-3 mt-4">
                <Button
                  onClick={handleCancel}
                  variant="secondary"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Annuler
                </Button>
                <Button
                  onClick={handleSave}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Enregistrer
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isImageExpanded && section.type === 'image' && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm"
          onClick={() => setIsImageExpanded(false)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <img
              src={section.content}
              alt={section.title}
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-xl"
            />
            <button
              onClick={() => setIsImageExpanded(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}

      {isCropping && section.type === 'image' && (
        <ImageCropper
          imageUrl={section.content}
          onCrop={handleCrop}
          onClose={() => setIsCropping(false)}
        />
      )}
    </>
  );
}