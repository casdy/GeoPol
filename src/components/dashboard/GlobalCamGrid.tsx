import { useState, useEffect, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import { Camera, ChevronRight, LayoutGrid, X, Globe, MapPin, Zap, Search, Settings, Plus } from 'lucide-react';
import { useWebcams, Webcam } from '@/hooks/useWebcams';
import AdminCamModal from './AdminCamModal';
import WebcamModal from './WebcamModal';

function CameraFeed({ cam, onClick }: { cam: Webcam, onClick: () => void }) {
    const { ref, inView } = useInView({
        triggerOnce: true,
        rootMargin: '200px 0px',
    });

    return (
        <div 
            ref={ref} 
            onClick={onClick}
            className="relative aspect-video bg-neutral-900 border border-neutral-800 group overflow-hidden rounded-sm shadow-lg hover:border-orange-500/50 transition-colors cursor-crosshair"
        >
            {inView ? (
                <iframe
                    src={`${cam.youtubeUrl}&autoplay=1&mute=1&controls=0&modestbranding=1`}
                    className="w-full h-full grayscale-[0.2] opacity-80 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-700"
                    allow="autoplay; encrypted-media"
                    loading="lazy"
                />
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center animate-pulse bg-slate-800/20">
                    <Camera className="w-10 h-10 text-neutral-700 mb-2" />
                    <span className="text-[11px] font-mono text-neutral-600 uppercase tracking-[0.2em]">Linking Feed...</span>
                </div>
            )}
            
            {/* HUD Overlay */}
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none">
                <div className="flex items-end justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 bg-orange-600 text-[8px] font-black text-black uppercase tracking-tighter rounded-[2px]">{cam.region}</span>
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.5)]" />
                                <span className="text-xs font-black text-white font-sans tracking-wide uppercase">{cam.city}</span>
                            </div>
                        </div>
                        <span className="text-[10px] text-neutral-400 font-sans uppercase tracking-tight block opacity-90 line-clamp-1">{cam.title}</span>
                    </div>
                    <div className="text-right font-mono">
                        <span className="text-[10px] text-orange-500/70 block tracking-tighter">DATA_STREAM_OK</span>
                        <div className="flex gap-2 justify-end opacity-40">
                             <span className="text-[9px] text-neutral-500">{(Math.random() * 50).toFixed(1)} FPS</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.1)_2px,rgba(255,255,255,0.1)_4px)]" />
        </div>
    );
}

export default function GlobalCamGrid({ onOverrideClick }: { onOverrideClick?: () => void }) {
    const { ALL_CAMS, isLoaded, addCam } = useWebcams();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [selectedCam, setSelectedCam] = useState<Webcam | null>(null);
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Default selection and recovery from stale IDs
    useEffect(() => {
        if (isLoaded) {
            const validSelected = selectedIds.filter(id => ALL_CAMS.some(c => c.id === id));
            
            // If no valid IDs are selected (e.g. after a list update) or it's the first load
            if (validSelected.length === 0 && ALL_CAMS.length > 0) {
                setSelectedIds(ALL_CAMS.slice(0, 6).map(c => c.id));
            } else if (validSelected.length !== selectedIds.length) {
                // If some were invalid, just prune them
                setSelectedIds(validSelected);
            }
        }
    }, [isLoaded, ALL_CAMS]);

    const selectedCams = useMemo(() => 
        ALL_CAMS.filter(c => selectedIds.includes(c.id)),
    [selectedIds, ALL_CAMS]);

    const groupedCams = useMemo(() => {
        const groups: Record<string, Webcam[]> = {};
        ALL_CAMS.forEach(cam => {
            if (!groups[cam.region]) groups[cam.region] = [];
            groups[cam.region].push(cam);
        });
        return groups;
    }, [ALL_CAMS]);

    const toggleCam = (id: string) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    if (!isLoaded) return <div className="h-full bg-neutral-950 animate-pulse" />;

    return (
        <div className="relative h-full flex flex-col bg-neutral-950">

            {/* Grid Header */}
            <div className="flex-none px-6 py-4 border-b border-neutral-800 bg-black/40 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Camera className="w-5 h-5 text-orange-500" />
                        <h2 className="text-sm font-black italic tracking-tighter text-white uppercase">
                            Global Surveillance <span className="text-orange-500">Grid</span>
                        </h2>
                    </div>
                    <div className="h-4 w-px bg-neutral-800" />
                    <span className="text-[10px] font-sans text-neutral-500 uppercase tracking-widest">
                        Active Feeds: <span className="text-white">{selectedIds.length}</span> / {ALL_CAMS.length}
                    </span>
                </div>
                
                <div className="flex items-center gap-2">
                    <button 
                        onClick={onOverrideClick}
                        className="p-1.5 bg-cyan-900/10 border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-950/20 text-cyan-500 transition-all rounded-sm flex items-center gap-2 px-3"
                        title="Tactical Override"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Override</span>
                    </button>
                    <button 
                        onClick={() => setIsSelectorOpen(true)}
                        className="flex items-center gap-2 px-4 py-1.5 bg-neutral-900 border border-neutral-800 hover:border-orange-500/50 hover:bg-neutral-800 transition-all rounded-sm text-[10px] font-bold uppercase tracking-widest text-neutral-300"
                    >
                        <LayoutGrid className="w-3.5 h-3.5" />
                        Cam Selection
                    </button>
                </div>
            </div>

            {/* Scrollable Grid Container */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-min">
                    {selectedCams.map((cam) => (
                        <CameraFeed key={cam.id} cam={cam} onClick={() => setSelectedCam(cam)} />
                    ))}
                    {selectedCams.length === 0 && (
                        <div className="col-span-full h-96 flex flex-col items-center justify-center text-neutral-600 font-sans text-sm uppercase">
                            <Camera className="w-12 h-12 mb-4 opacity-20" />
                            No feeds selected for monitoring.
                        </div>
                    )}
                </div>
            </div>

            {/* Selection Sidebar Overlay */}
            {isSelectorOpen && (
                <div className="absolute inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSelectorOpen(false)} />
                    <div className="relative w-full max-w-md bg-neutral-950 border-l border-neutral-800 h-full flex flex-col shadow-2xl">
                        <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-black">
                            <div className="flex flex-col">
                                <h3 className="text-lg font-black italic tracking-tighter text-white uppercase">FEED <span className="text-orange-500">SELECTOR</span></h3>
                                <span className="text-[9px] font-sans text-neutral-500 tracking-[0.2em] uppercase">Tactical Deployment Control</span>
                            </div>
                            <button onClick={() => setIsSelectorOpen(false)} className="p-2 hover:bg-neutral-800 rounded-sm text-neutral-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 bg-neutral-900/50 border-b border-neutral-800">
                             <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-orange-500" />
                                <input 
                                    type="text" 
                                    placeholder="Search by city or region..."
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-sm py-2 pl-10 pr-4 text-xs font-sans text-white focus:outline-none focus:border-orange-600 transition-all placeholder:text-neutral-700"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                             </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                            {Object.entries(groupedCams).map(([region, cams]) => {
                                const filteredCams = cams.filter(c => 
                                    c.city.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                    c.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    c.title.toLowerCase().includes(searchQuery.toLowerCase())
                                );

                                if (filteredCams.length === 0) return null;

                                return (
                                    <div key={region} className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Globe className="w-3.5 h-3.5 text-orange-500/50" />
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 border-b border-neutral-800 pb-1 flex-1">{region}</h4>
                                        </div>
                                        <div className="grid grid-cols-1 gap-2">
                                            {filteredCams.map(cam => (
                                                <button
                                                    key={cam.id}
                                                    onClick={() => toggleCam(cam.id)}
                                                    className={`flex items-center justify-between p-3 border transition-all rounded-sm text-left group ${
                                                        selectedIds.includes(cam.id) 
                                                            ? 'bg-orange-600/10 border-orange-600 text-white' 
                                                            : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:bg-neutral-800'
                                                    }`}
                                                >
                                                    <div className="flex flex-col">
                                                        <span className="text-[11px] font-bold tracking-wider">{cam.city.toUpperCase()}</span>
                                                        <span className="text-[9px] font-sans opacity-60 line-clamp-1">{cam.title}</span>
                                                    </div>
                                                    <div className={`w-4 h-4 border flex items-center justify-center transition-all ${
                                                        selectedIds.includes(cam.id) ? 'bg-orange-600 border-orange-600' : 'border-neutral-700'
                                                    }`}>
                                                        {selectedIds.includes(cam.id) && <Zap className="w-2.5 h-2.5 text-black" />}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="p-6 bg-black border-t border-neutral-800 flex items-center justify-between">
                             <div className="text-[10px] font-sans text-neutral-500">
                                     DEPLOYED: <span className="text-white">{selectedIds.length}</span>
                             </div>
                             <div className="flex gap-2">
                                <button 
                                    onClick={onOverrideClick}
                                    className="px-4 py-2 bg-cyan-900/20 border border-cyan-500 text-cyan-400 text-[10px] font-black uppercase tracking-widest hover:bg-cyan-800 transition-all rounded-sm flex items-center gap-2"
                                >
                                    <Plus className="w-3 h-3" />
                                    Override
                                </button>
                                <button 
                                    onClick={() => setIsSelectorOpen(false)}
                                    className="px-6 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all rounded-sm"
                                >
                                    Confirm Loadout
                                </button>
                             </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for detail view */}
            {selectedCam && (
                <WebcamModal 
                    cam={selectedCam} 
                    onClose={() => setSelectedCam(null)} 
                />
            )}
        </div>
    );
}
