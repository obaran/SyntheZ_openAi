import { jsPDF } from 'jspdf';

interface Section {
  id: string;
  type: 'text' | 'image';
  title: string;
  content: string;
  selected: boolean;
}

function sanitizeFileName(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

export async function generateFinalDocument(sections: Section[], documentTitle: string): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: false
  });

  const margin = 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - (2 * margin);
  let y = margin;

  const titleSize = 14;
  const bodySize = 10;
  const lineHeight = 1.3;

  // Fonction pour calculer les dimensions optimales de l'image
  const calculateImageDimensions = (imageData: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        const maxWidth = pageWidth - (2 * margin);
        const maxHeight = pageHeight - (2 * margin);
        
        let width, height;
        
        if (aspectRatio > 1) {
          width = Math.min(maxWidth, img.width);
          height = width / aspectRatio;
          if (height > maxHeight) {
            height = maxHeight;
            width = height * aspectRatio;
          }
        } else {
          height = Math.min(maxHeight, img.height);
          width = height * aspectRatio;
          if (width > maxWidth) {
            width = maxWidth;
            height = width / aspectRatio;
          }
        }
        
        resolve({ width, height });
      };
      img.src = imageData;
    });
  };

  const calculateTextHeight = (text: string, fontSize: number, maxWidth: number) => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    return (lines.length * fontSize * 0.3528) * lineHeight;
  };

  const addText = (text: string, fontSize: number, options: {
    isTitle?: boolean;
    marginTop?: number;
    marginBottom?: number;
    align?: 'left' | 'center';
    newPage?: boolean;
  } = {}) => {
    const { isTitle = false, marginTop = 0, marginBottom = 3, align = 'left', newPage = false } = options;
    
    if (newPage) {
      doc.addPage();
      y = margin;
    } else {
      y += marginTop;
    }

    // Vérifier si le texte tiendra sur la page actuelle
    const textHeight = calculateTextHeight(text, fontSize, contentWidth - (isTitle ? 0 : 10));
    if (y + textHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }

    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isTitle ? 'bold' : 'normal');
    doc.setTextColor(50, 50, 50);

    const lines = doc.splitTextToSize(text, contentWidth - (isTitle ? 0 : 10));

    if (align === 'center') {
      lines.forEach((line: string, index: number) => {
        const xOffset = (pageWidth - doc.getTextWidth(line)) / 2;
        doc.text(line, xOffset, y + (index * fontSize * 0.3528 * lineHeight));
      });
    } else {
      doc.text(lines, margin + (isTitle ? 0 : 5), y);
    }

    y += textHeight + marginBottom;
    return y;
  };

  const addHighQualityImage = async (imageData: string) => {
    const { width, height } = await calculateImageDimensions(imageData);
    const x = (pageWidth - width) / 2;
    const y = (pageHeight - height) / 2;

    doc.addImage({
      imageData,
      format: 'JPEG',
      x,
      y,
      width,
      height,
      compression: 'MEDIUM',
      rotation: 0,
      quality: 0.95
    });
  };

  let isFirstSection = true;
  let lastSectionWasImage = false;

  // Traitement des sections
  for (const section of sections) {
    if (section.type === 'image') {
      // Nouvelle page pour les images
      if (!isFirstSection) {
        doc.addPage();
      }
      await addHighQualityImage(section.content);
      lastSectionWasImage = true;
    } else {
      // Pour les sections de texte
      const needsNewPage = isFirstSection ? false : lastSectionWasImage;
      
      // Titre de section
      addText(section.title, titleSize, { 
        isTitle: true, 
        marginTop: 5, 
        marginBottom: 8,
        align: 'center',
        newPage: needsNewPage
      });

      // Contenu de la section
      if (section.content.trim()) {
        const textWidth = contentWidth - 10;
        const textHeight = calculateTextHeight(section.content, bodySize, textWidth);
        const boxPadding = 6;

        // Vérifier si le contenu tiendra sur la page actuelle
        if (y + textHeight + (boxPadding * 2) > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }

        doc.setFillColor(252, 252, 252);
        doc.setDrawColor(235, 235, 235);
        doc.roundedRect(margin, y, contentWidth, textHeight + (boxPadding * 2), 2, 2, 'FD');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(bodySize);
        doc.setTextColor(60, 60, 60);
        const lines = doc.splitTextToSize(section.content, textWidth);
        doc.text(lines, margin + 5, y + boxPadding + (bodySize * 0.3528));

        y += textHeight + (boxPadding * 2) + 8;
      }
      lastSectionWasImage = false;
    }
    
    isFirstSection = false;
  }

  const fileName = `${sanitizeFileName(documentTitle)}.pdf`;
  doc.save(fileName);
}