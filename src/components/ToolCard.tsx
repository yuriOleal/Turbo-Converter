import React from 'react';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { Tool } from '../config/types';
import { useLanguage } from '../language';

interface ToolCardProps {
  tool: Tool;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  const { t } = useLanguage();
  // Dynamic Icon rendering
  const IconComponent = (Icons as any)[tool.iconName] || Icons.File;

  return (
    <Link 
      to={`/tool/${tool.id}`}
      className="group relative flex flex-col p-6 bg-white dark:bg-dark-800/50 hover:bg-slate-50 dark:hover:bg-dark-800 border border-slate-200 dark:border-white/5 hover:border-blue-500/30 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl shadow-sm dark:shadow-none hover:shadow-blue-500/10"
    >
      
      <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 transition-colors">
        <IconComponent className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:text-blue-500 dark:group-hover:text-blue-300 transition-colors" />
      </div>
      
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-200 transition-colors">
        {t(`tool_${tool.id}_name`) || tool.name}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
        {t(`tool_${tool.id}_desc`) || tool.description}
      </p>
    </Link>
  );
};

export default ToolCard;
