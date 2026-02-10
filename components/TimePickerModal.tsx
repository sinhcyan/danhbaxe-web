import React, { useState, useRef, useEffect } from 'react';

interface TimePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (range: { start: string, end: string }) => void;
  initialRange?: { start: string, end: string };
  mode?: 'range' | 'single';
}

const ITEM_HEIGHT = 48;
const VISIBLE_COUNT = 5;
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_COUNT;
const CENTER_OFFSET = (CONTAINER_HEIGHT - ITEM_HEIGHT) / 2;

interface WheelColumnProps {
  items: number[];
  value: number;
  onChange: (val: number) => void;
}

const WheelColumn: React.FC<WheelColumnProps> = ({ items, value, onChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);
  const scrollTimeout = useRef<number | null>(null);

  useEffect(() => {
    if (containerRef.current && !isScrolling.current) {
        containerRef.current.scrollTop = value * ITEM_HEIGHT;
    }
  }, [value]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    isScrolling.current = true;
    if (scrollTimeout.current) window.clearTimeout(scrollTimeout.current);

    const scrollTop = containerRef.current.scrollTop;
    const index = Math.round(scrollTop / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
    const newValue = items[clampedIndex];
    
    if (newValue !== value) onChange(newValue);

    scrollTimeout.current = window.setTimeout(() => {
        isScrolling.current = false;
        if (containerRef.current) {
            const finalScrollTop = containerRef.current.scrollTop;
            const targetScrollTop = clampedIndex * ITEM_HEIGHT;
            if (Math.abs(finalScrollTop - targetScrollTop) > 2) {
                containerRef.current.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
            }
        }
    }, 150);
  };

  return (
    <div className="h-full flex-1 relative z-10 group">
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full w-full overflow-y-auto no-scrollbar snap-y snap-mandatory py-0"
        style={{ height: CONTAINER_HEIGHT }}
      >
        <div style={{ height: CENTER_OFFSET }} />
        {items.map((item) => (
          <div 
            key={item}
            className={`flex items-center justify-center snap-center transition-all duration-200 ${
                item === value 
                ? 'text-3xl font-black text-slate-800 scale-110 opacity-100' 
                : 'text-xl font-medium text-slate-400 scale-90 opacity-40 blur-[0.5px]'
            }`}
            style={{ height: ITEM_HEIGHT }}
          >
            {item.toString().padStart(2, '0')}
          </div>
        ))}
        <div style={{ height: CENTER_OFFSET }} />
      </div>
    </div>
  );
};

const TimePickerModal: React.FC<TimePickerModalProps> = ({ 
  isOpen, onClose, onConfirm, initialRange, mode = 'range' 
}) => {
  const [activeTab, setActiveTab] = useState<'start' | 'end'>('start');
  const [startHour, setStartHour] = useState(initialRange ? parseInt(initialRange.start.split(':')[0]) : 6);
  const [startMin, setStartMin] = useState(initialRange ? parseInt(initialRange.start.split(':')[1]) : 0);
  const [endHour, setEndHour] = useState(initialRange ? parseInt(initialRange.end.split(':')[0]) : 18);
  const [endMin, setEndMin] = useState(initialRange ? parseInt(initialRange.end.split(':')[1]) : 0);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  useEffect(() => {
    if (isOpen && initialRange) {
      const sh = parseInt(initialRange.start.split(':')[0]);
      const sm = parseInt(initialRange.start.split(':')[1]);
      const eh = parseInt(initialRange.end.split(':')[0]);
      const em = parseInt(initialRange.end.split(':')[1]);
      
      setStartHour(isNaN(sh) ? 6 : sh);
      setStartMin(isNaN(sm) ? 0 : sm);
      setEndHour(isNaN(eh) ? 18 : eh);
      setEndMin(isNaN(em) ? 0 : em);
    }
    setActiveTab('start');
  }, [isOpen]);

  const handleConfirm = () => {
    const startTime = `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`;
    if (mode === 'single') {
        onConfirm({ start: startTime, end: startTime });
    } else {
        const endTime = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;
        onConfirm({ start: startTime, end: endTime });
    }
    onClose();
  };

  if (!isOpen) return null;

  const currentHour = mode === 'single' ? startHour : (activeTab === 'start' ? startHour : endHour);
  const currentMin = mode === 'single' ? startMin : (activeTab === 'start' ? startMin : endMin);
  const setHour = mode === 'single' ? setStartHour : (activeTab === 'start' ? setStartHour : setEndHour);
  const setMin = mode === 'single' ? setStartMin : (activeTab === 'start' ? setStartMin : setEndMin);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-heavy w-full max-w-[360px] rounded-[2.5rem] overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl">
        <div className="p-6 text-center border-b border-white/30">
          <h3 className="text-lg font-black text-slate-700 tracking-tight uppercase mb-4">
            {mode === 'single' ? 'Chọn giờ' : 'Chọn khoảng giờ'}
          </h3>
          {mode === 'range' && (
            <div className="flex glass-input rounded-2xl p-1 gap-1">
                <button onClick={() => setActiveTab('start')} className={`flex-1 py-2 px-2 rounded-xl transition-all flex flex-col items-center justify-center ${activeTab === 'start' ? 'bg-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider mb-0.5 opacity-70">Từ</span>
                    <span className="text-lg font-black tracking-tight">{startHour.toString().padStart(2, '0')}:{startMin.toString().padStart(2, '0')}</span>
                </button>
                <button onClick={() => setActiveTab('end')} className={`flex-1 py-2 px-2 rounded-xl transition-all flex flex-col items-center justify-center ${activeTab === 'end' ? 'bg-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider mb-0.5 opacity-70">Đến</span>
                    <span className="text-lg font-black tracking-tight">{endHour.toString().padStart(2, '0')}:{endMin.toString().padStart(2, '0')}</span>
                </button>
            </div>
          )}
          {mode === 'single' && (
             <div className="text-4xl font-black text-slate-800 tracking-tighter">
                {startHour.toString().padStart(2, '0')}:{startMin.toString().padStart(2, '0')}
             </div>
          )}
        </div>
        <div className="relative" style={{ height: CONTAINER_HEIGHT }}>
            <div className="absolute left-6 right-6 z-0 pointer-events-none rounded-xl bg-white/40 border border-white/50 shadow-sm backdrop-blur-sm" style={{ top: CENTER_OFFSET, height: ITEM_HEIGHT }} />
            <div className="flex h-full px-10 relative z-10 gap-0">
                <WheelColumn key={`hour-${activeTab}-${mode}`} items={hours} value={currentHour} onChange={setHour} />
                <div className="flex items-center justify-center pt-1 z-10 w-8"><span className="text-2xl font-black text-slate-300 pb-1">:</span></div>
                <WheelColumn key={`min-${activeTab}-${mode}`} items={minutes} value={currentMin} onChange={setMin} />
            </div>
        </div>
        <div className="p-4 flex items-center justify-between gap-3 border-t border-white/30 bg-white/20">
          <button onClick={onClose} className="flex-1 py-3.5 text-slate-500 font-bold hover:bg-white/40 rounded-2xl transition-all uppercase text-xs tracking-widest">Hủy</button>
          <button onClick={handleConfirm} className="flex-1 py-3.5 bg-slate-900 text-white rounded-2xl font-black shadow-lg active:scale-95 transition-all uppercase text-xs tracking-widest">Xác nhận</button>
        </div>
      </div>
    </div>
  );
};
export default TimePickerModal;