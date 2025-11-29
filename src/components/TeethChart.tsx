import React, { useState } from 'react';
import { Tooth, Language } from '../types';
import { Baby, User } from 'lucide-react';

interface TeethChartProps {
  teeth: Record<number, Tooth>;
  onToothClick: (id: number, action: Tooth['status']) => void;
  readOnly?: boolean;
  language: Language;
}

// ISO 3950 Notation
// Ordered so that the visual center of the component acts as the midline of the mouth.
// Viewer Left = Patient Right (Q1, Q4) -> Order Distal to Mesial (18->11)
// Viewer Right = Patient Left (Q2, Q3) -> Order Mesial to Distal (21->28)

// Upper Right (Viewer Left)
const ADULT_Q1 = [18, 17, 16, 15, 14, 13, 12, 11]; 
// Upper Left (Viewer Right)
const ADULT_Q2 = [21, 22, 23, 24, 25, 26, 27, 28]; 
// Lower Left (Viewer Right)
const ADULT_Q3 = [31, 32, 33, 34, 35, 36, 37, 38]; 
// Lower Right (Viewer Left)
const ADULT_Q4 = [48, 47, 46, 45, 44, 43, 42, 41]; 

// Child (Deciduous)
const CHILD_Q1 = [55, 54, 53, 52, 51]; 
const CHILD_Q2 = [61, 62, 63, 64, 65]; 
const CHILD_Q3 = [71, 72, 73, 74, 75]; 
const CHILD_Q4 = [85, 84, 83, 82, 81]; 

const getDisplayNumber = (iso: number, isChild: boolean) => {
  const str = iso.toString();
  const index = parseInt(str[1]);
  if (isChild) {
    return String.fromCharCode(64 + index); // 1->A, 2->B...
  }
  return index.toString();
};

interface ToothIconProps {
  id: number;
  display: string;
  status?: Tooth['status'];
  onClick: () => void;
}

const ToothIcon: React.FC<ToothIconProps> = ({ id, display, status, onClick }) => {
  let fillColor = "fill-white dark:fill-gray-800";
  let strokeColor = "stroke-gray-300 dark:stroke-gray-600";
  let symbol = "";

  switch (status) {
    case 'decay': 
      fillColor = "fill-red-100 dark:fill-red-900"; 
      strokeColor = "stroke-red-500"; 
      symbol = "D";
      break;
    case 'filled': 
      fillColor = "fill-blue-100 dark:fill-blue-900"; 
      strokeColor = "stroke-blue-500"; 
      symbol = "F";
      break;
    case 'missing': 
      fillColor = "fill-gray-100 dark:fill-gray-800"; 
      strokeColor = "stroke-gray-300 border-dashed"; 
      symbol = "";
      break;
    case 'crown': 
      fillColor = "fill-yellow-100 dark:fill-yellow-900"; 
      strokeColor = "stroke-yellow-500"; 
      symbol = "C";
      break;
    case 'rct': 
      fillColor = "fill-green-100 dark:fill-green-900"; 
      strokeColor = "stroke-green-500"; 
      symbol = "RCT";
      break;
    case 'extraction':
      fillColor = "fill-red-50 dark:fill-red-900/20";
      strokeColor = "stroke-red-600"; 
      symbol = "X";
      break;
    default: 
      break;
  }

  const toothPath = "M16,2 C9,2 4,8 4,14 C4,20 8,26 8,32 C8,38 10,44 14,44 L18,44 C22,44 24,38 24,32 C24,26 28,20 28,14 C28,8 23,2 16,2 Z";

  return (
    <div className="flex flex-col items-center gap-1 group shrink-0">
      <div 
        onClick={onClick}
        className="relative w-10 h-12 md:w-12 md:h-14 cursor-pointer transition-transform transform hover:-translate-y-1 hover:scale-105"
      >
        {status === 'missing' ? (
           <div className="w-full h-full border-2 border-dashed border-gray-300 rounded-lg opacity-50"></div>
        ) : (
          <svg viewBox="0 0 32 46" className={`w-full h-full drop-shadow-sm ${strokeColor} stroke-2 transition-colors duration-300`}>
             <path d={toothPath} className={`${fillColor} transition-colors duration-300`} />
          </svg>
        )}
        
        {symbol && (
           <div className="absolute inset-0 flex items-center justify-center font-bold text-xs md:text-sm pointer-events-none opacity-80">
              {symbol === 'X' ? <span className="text-red-600 text-2xl">✕</span> : symbol}
           </div>
        )}
      </div>
      
      <span className="text-xs font-bold text-gray-400 dark:text-gray-500 font-mono">
        {display}
      </span>
    </div>
  );
};

export const TeethChart: React.FC<TeethChartProps> = ({ teeth, onToothClick, readOnly, language }) => {
  const [isChild, setIsChild] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Tooth['status']>('healthy');

  const tools: { id: Tooth['status']; label: string; color: string; en: string, ar: string, ku: string }[] = [
    { id: 'healthy', label: 'Healthy', color: 'bg-white border-gray-300 text-gray-700', en: 'Healthy', ar: 'سليم', ku: 'ساغ' },
    { id: 'decay', label: 'Decay', color: 'bg-red-500 text-white', en: 'Decay', ar: 'تسوس', ku: 'كلۆبوون' },
    { id: 'filled', label: 'Filled', color: 'bg-blue-500 text-white', en: 'Filled', ar: 'حشوة', ku: 'پڕكردنەوە' },
    { id: 'rct', label: 'RCT', color: 'bg-green-500 text-white', en: 'RCT', ar: 'عصب', ku: 'دەمار' },
    { id: 'crown', label: 'Crown', color: 'bg-yellow-500 text-white', en: 'Crown', ar: 'تغليف', ku: 'رووپۆش' },
    { id: 'extraction', label: 'Extract', color: 'bg-red-700 text-white', en: 'Extraction', ar: 'قلع', ku: 'كێشان' },
    { id: 'missing', label: 'Missing', color: 'bg-gray-400 text-white', en: 'Missing', ar: 'مفقود', ku: 'لێبۆوە' },
  ];

  const handleToothClick = (id: number) => {
    if (readOnly) return;
    onToothClick(id, selectedTool);
  };

  const renderQuadrant = (ids: number[]) => {
    return (
      <div className="flex gap-2 md:gap-3 flex-nowrap">
        {ids.map(id => (
          <ToothIcon 
            key={id} 
            id={id} 
            display={getDisplayNumber(id, isChild)}
            status={teeth[id]?.status} 
            onClick={() => handleToothClick(id)} 
          />
        ))}
      </div>
    );
  };

  const getToolLabel = (tool: any) => {
      if (language === 'ar') return tool.ar;
      if (language === 'ku') return tool.ku;
      return tool.en;
  };

  const labelPermanent = language === 'ar' ? "الدائمية" : language === 'ku' ? "هەمیشەیی" : "Permanent";
  const labelDeciduous = language === 'ar' ? "اللبنية" : language === 'ku' ? "شیری" : "Deciduous";

  // Swapped Labels (User Request)
  const labelLeft = language === 'ar' ? "يسار" : language === 'ku' ? "چەپ" : "Left";
  const labelRight = language === 'ar' ? "يمين" : language === 'ku' ? "ڕاست" : "Right";

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 select-none w-full overflow-hidden">
      
      {!readOnly && (
        <div className="mb-8 space-y-6">
          <div className="flex justify-center">
            <div className="flex bg-gray-100 dark:bg-gray-700 p-1.5 rounded-2xl">
              <button 
                onClick={() => setIsChild(false)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition ${!isChild ? 'bg-white dark:bg-gray-600 shadow-md text-primary-600 dark:text-white' : 'text-gray-500'}`}
              >
                <User size={18} /> {labelPermanent}
              </button>
              <button 
                onClick={() => setIsChild(true)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition ${isChild ? 'bg-white dark:bg-gray-600 shadow-md text-primary-600 dark:text-white' : 'text-gray-500'}`}
              >
                <Baby size={18} /> {labelDeciduous}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {tools.map(tool => (
              <button
                key={tool.id}
                onClick={() => setSelectedTool(tool.id)}
                className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold border transition transform active:scale-95 ${
                  selectedTool === tool.id 
                    ? `${tool.color} shadow-lg ring-2 ring-offset-2 ring-primary-500` 
                    : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100'
                }`}
              >
                {getToolLabel(tool)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Container tweaked to allow scrolling without clipping */}
      <div className="flex flex-col items-start md:items-center gap-6 md:gap-10 overflow-x-auto pb-4 custom-scrollbar w-full px-2">
        
        {/* Upper Arch */}
        <div className="flex gap-4 md:gap-16 pb-6 border-b border-gray-100 dark:border-gray-700 min-w-max mx-auto">
          {/* Viewer's Left (Patient Right) -> SWAPPED LABEL to LEFT */}
          <div className="flex flex-col items-end gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{labelLeft}</span>
            {renderQuadrant(isChild ? CHILD_Q1 : ADULT_Q1)}
          </div>
          
          {/* Viewer's Right (Patient Left) -> SWAPPED LABEL to RIGHT */}
          <div className="flex flex-col items-start gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{labelRight}</span>
            {renderQuadrant(isChild ? CHILD_Q2 : ADULT_Q2)}
          </div>
        </div>

        {/* Lower Arch */}
        <div className="flex gap-4 md:gap-16 min-w-max mx-auto">
          {/* Viewer's Left (Patient Right) -> SWAPPED LABEL to LEFT */}
          <div className="flex flex-col items-end gap-2">
             {renderQuadrant(isChild ? CHILD_Q4 : ADULT_Q4)}
             <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">{labelLeft}</span>
          </div>
          
          {/* Viewer's Right (Patient Left) -> SWAPPED LABEL to RIGHT */}
          <div className="flex flex-col items-start gap-2">
             {renderQuadrant(isChild ? CHILD_Q3 : ADULT_Q3)}
             <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">{labelRight}</span>
          </div>
        </div>
      </div>

    </div>
  );
};