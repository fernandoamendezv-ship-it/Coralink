import React, { useState } from 'react';
import { X, Search, Check, ExternalLink, Sparkles, Upload } from 'lucide-react';
import { OFFICIAL_GALLERY_IMAGES, extractImageName, POSTIMAGES_GALLERY_URL } from '../utils/postimagesGallery';
import { openPostimagesUploader } from '../utils/cloudImageUploader';

interface OfficialGalleryPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (directUrl: string) => void;
  currentImage?: string;
}

export const OfficialGalleryPickerModal: React.FC<OfficialGalleryPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectImage,
  currentImage,
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredImages = OFFICIAL_GALLERY_IMAGES.filter((url) => {
    const name = extractImageName(url).toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const handleLaunchUploader = () => {
    openPostimagesUploader((directUrl) => {
      onSelectImage(directUrl);
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-3xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden text-slate-800 dark:text-slate-100">
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#0B2545] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1BA7D9] flex items-center justify-center text-white font-black shadow-xs">
              🖼️
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight leading-tight">
                Galería Oficial en la Nube (Postimages)
              </h3>
              <p className="text-[11px] text-[#1BA7D9] font-medium leading-tight">
                Fotos de la galería zJjp92t en formato directo (https://i.postimg.cc/...)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar & Search */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar foto (ej: llavero, cojín, roca)..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:border-[#1BA7D9]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
            <button
              type="button"
              onClick={handleLaunchUploader}
              className="px-3 py-1.5 rounded-xl bg-[#FF6B35] hover:bg-[#e85a26] text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              title="Abrir subidor oficial de Postimages para subir foto nueva a la galería"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Subir Foto Nueva a Postimages</span>
            </button>

            <a
              href={POSTIMAGES_GALLERY_URL}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-[#1BA7D9] flex items-center gap-1 transition-colors"
            >
              <span>Abrir Galería Web</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Grid of gallery photos */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {filteredImages.map((url, idx) => {
              const name = extractImageName(url);
              const isSelected = currentImage === url;

              return (
                <button
                  key={`${url}-${idx}`}
                  type="button"
                  onClick={() => {
                    onSelectImage(url);
                    onClose();
                  }}
                  className={`group relative flex flex-col p-2 rounded-2xl border transition-all text-left cursor-pointer ${
                    isSelected
                      ? 'border-[#1BA7D9] bg-sky-50 dark:bg-sky-950/40 shadow-sm ring-2 ring-[#1BA7D9]'
                      : 'border-slate-200 dark:border-slate-800 hover:border-[#1BA7D9] bg-white dark:bg-slate-900 hover:shadow-md'
                  }`}
                >
                  <div className="aspect-square w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative mb-1.5">
                    <img
                      src={url}
                      alt={name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#1BA7D9] text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 line-clamp-2 leading-tight">
                    {name}
                  </span>
                  <span className="text-[9px] text-[#1BA7D9] font-mono mt-0.5 truncate block">
                    i.postimg.cc
                  </span>
                </button>
              );
            })}
          </div>

          {filteredImages.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <p className="text-xs">No se encontraron fotos con el término «{search}»</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>{filteredImages.length} fotos disponibles en la galería oficial</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-300 cursor-pointer transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
