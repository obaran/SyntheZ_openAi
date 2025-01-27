import React from 'react';
import { Button } from './ui/button';

interface TextSummaryProps {
  text: string;
  onGenerateSummary: () => void;
  processing: boolean;
  summary: any;
}

export function TextSummary({ text, onGenerateSummary, processing, summary }: TextSummaryProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Texte extrait</h3>
        <div className="max-h-[400px] overflow-y-auto p-4 bg-gray-50 rounded-md">
          <pre className="whitespace-pre-wrap text-sm text-gray-700">{text}</pre>
        </div>
      </div>

      {!summary ? (
        <Button
          onClick={onGenerateSummary}
          disabled={processing}
          className="w-full"
        >
          Générer le résumé
        </Button>
      ) : (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Résumé généré</h3>
          <div className="p-4 bg-gray-50 rounded-md">
            <h4 className="font-bold mb-2">{summary.title}</h4>
            <p className="mb-4">{summary.introduction}</p>
            
            <h5 className="font-semibold mb-2">Concepts principaux</h5>
            {summary.mainConcepts.map((concept: any, index: number) => (
              <div key={index} className="mb-3">
                <h6 className="font-medium">{concept.title}</h6>
                <p className="text-sm mb-1">{concept.content}</p>
                <ul className="list-disc list-inside text-sm">
                  {concept.keyPoints.map((point: string, i: number) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}