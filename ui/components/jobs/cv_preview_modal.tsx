"use client";

import { useState, useEffect, useCallback } from "react";
import { getCVDownloadUrl } from "@/lib/actions/postulant";

interface CVPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  cvId: number | null;
  cvMimeType?: string;
}

export default function CVPreviewModal({ isOpen, onClose, cvId, cvMimeType }: CVPreviewModalProps) {
  const [cvUrl, setCvUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCVUrl = useCallback(async () => {
    if (!cvId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getCVDownloadUrl(cvId);
      if (result.error) {
        setError(result.error);
      } else if (result.url) {
        setCvUrl(result.url);
      }
    } catch (err) {
      console.error('Error loading CV:', err);
      setError('Error al cargar el CV');
    } finally {
      setLoading(false);
    }
  }, [cvId]);

  useEffect(() => {
    if (isOpen && cvId) {
      loadCVUrl();
    } else {
      setCvUrl(null);
      setError(null);
    }
  }, [isOpen, cvId, loadCVUrl]);

  const handleOpenInNewTab = () => {
    if (cvUrl) {
      window.open(cvUrl, '_blank');
    }
  };

  const isPDF = cvMimeType === 'application/pdf';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-5xl h-[90vh] mx-4 flex flex-col rounded-3xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-100 bg-brand-50/50">
          <h3 className="text-lg font-semibold text-brand-900">Vista previa del CV</h3>
          <div className="flex items-center gap-3">
            {cvUrl && (
              <button
                onClick={handleOpenInNewTab}
                className="flex items-center gap-2 rounded-xl bg-brand-100 px-4 py-2 text-sm font-medium text-brand-800 hover:bg-brand-200 transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Abrir en nueva pestaña
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-xl bg-brand-200/60 p-2 text-brand-700 hover:bg-brand-300/60 transition"
              aria-label="Cerrar"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden bg-gray-100">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
                <p className="text-sm text-brand-600">Cargando CV...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3 text-center px-4">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-red-600 font-medium">{error}</p>
                <button
                  onClick={loadCVUrl}
                  className="mt-2 rounded-xl bg-brand-400 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500 transition"
                >
                  Reintentar
                </button>
              </div>
            </div>
          )}

          {cvUrl && !loading && !error && (
            <>
              {isPDF ? (
                <iframe
                  src={cvUrl}
                  className="w-full h-full border-0"
                  title="Vista previa del CV"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-4 text-center px-4">
                    <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center">
                      <svg className="w-10 h-10 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-brand-900 font-medium">Este formato no se puede previsualizar</p>
                      <p className="text-sm text-brand-600 mt-1">Los archivos DOC/DOCX deben abrirse en otra aplicación</p>
                    </div>
                    <button
                      onClick={handleOpenInNewTab}
                      className="mt-2 flex items-center gap-2 rounded-xl bg-brand-400 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 transition"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Descargar archivo
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
