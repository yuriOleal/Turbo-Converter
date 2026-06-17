import React, { useState, useMemo } from 'react';
import { TOOLS } from '../config/tools';
import ToolCard from '../components/ToolCard';
import { ToolCategory } from '../config/types';
import { Search, Zap, ShieldCheck, Heart } from 'lucide-react';
import { useLanguage } from '../language';

const CATEGORY_ORDER: ToolCategory[] = [
  ToolCategory.POPULAR,
  ToolCategory.PDF_OPTIMIZE,
  ToolCategory.PDF_CONVERT_TO,
  ToolCategory.PDF_CONVERT_FROM,
  ToolCategory.PDF_SECURITY,
  ToolCategory.IMAGE,
];

const Home: React.FC = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...CATEGORY_ORDER];

  const filteredTools = useMemo(() => {
    return TOOLS.filter(tool => {
      const name = (t(`tool_${tool.id}_name`) || tool.name).toLowerCase();
      const desc = (t(`tool_${tool.id}_desc`) || tool.description).toLowerCase();
      const search = searchTerm.toLowerCase();

      const matchesSearch = name.includes(search) || desc.includes(search);
      const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, t]);

  const toolsByCategory = useMemo(() => {
    const grouped = new Map<ToolCategory, typeof filteredTools>();
    for (const category of CATEGORY_ORDER) {
      const toolsInCategory = filteredTools.filter(tool => tool.category === category);
      if (toolsInCategory.length > 0) {
        grouped.set(category, toolsInCategory);
      }
    }
    return grouped;
  }, [filteredTools]);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-20 pb-16 lg:pt-32 lg:pb-24">
        {/* Background Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-100 dark:bg-blue-600/20 rounded-full blur-[120px] -z-10 opacity-60 dark:opacity-50" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-8">
            <img
              src="/logo.png"
              alt="TurboConverter"
              className="h-16 w-auto"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20 text-green-700 dark:text-green-300 text-sm font-medium mb-8 animate-fade-in-up">
            <Heart className="w-4 h-4 fill-current" />
            <span>{t('home.new_badge')}</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-b dark:from-white dark:to-slate-400 tracking-tight mb-6 animate-fade-in-up delay-100">
            {t('home.hero_title')}<br />
            <span className="text-blue-600 dark:text-blue-500">{t('home.hero_highlight')}</span>
          </h1>

          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 animate-fade-in-up delay-200">
            {t('home.hero_subtitle')}
          </p>

          {/* Search Input */}
          <div className="max-w-2xl mx-auto relative animate-fade-in-up delay-300 group">
            <div className="absolute inset-0 bg-blue-200 dark:bg-blue-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center bg-white dark:bg-dark-800/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-full p-2 shadow-2xl">
              <Search className="w-5 h-5 text-slate-400 ml-4" />
              <input
                type="text"
                placeholder={t('home.search_placeholder')}
                className="w-full bg-transparent border-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-0 px-4 py-3"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search tools"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Why Us Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('home.why_us_title')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-white/5 p-6 rounded-2xl flex flex-col items-center text-center shadow-sm dark:shadow-none transition-transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400"><Zap /></div>
            <h3 className="text-slate-900 dark:text-white font-bold mb-2">{t('home.why_speed_title')}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{t('home.why_speed_desc')}</p>
          </div>
          <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-white/5 p-6 rounded-2xl flex flex-col items-center text-center shadow-sm dark:shadow-none transition-transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-500/10 rounded-full flex items-center justify-center mb-4 text-purple-600 dark:text-purple-400"><Heart /></div>
            <h3 className="text-slate-900 dark:text-white font-bold mb-2">{t('home.why_free_title')}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{t('home.why_free_desc')}</p>
          </div>
          <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-white/5 p-6 rounded-2xl flex flex-col items-center text-center shadow-sm dark:shadow-none transition-transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center mb-4 text-green-600 dark:text-green-400"><ShieldCheck /></div>
            <h3 className="text-slate-900 dark:text-white font-bold mb-2">{t('home.why_secure_title')}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{t('home.why_secure_desc')}</p>
          </div>
        </div>
      </div>

      {/* Tools Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-200 dark:border-white/5">
        {/* Category Filter */}
        <div className="flex overflow-x-auto pb-4 mb-8 gap-2 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-white dark:bg-dark-800 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white border border-slate-200 dark:border-white/5'
              }`}
            >
              {t(`cat.${cat}`) || cat}
            </button>
          ))}
        </div>

        {/* Tools grouped by category */}
        {selectedCategory === 'All' ? (
          // Show tools grouped by category with section headers
          Array.from(toolsByCategory.entries()).map(([category, tools]) => (
            <div key={category} className="mb-12">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                {t(`cat.${category}`) || category}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {tools.map(tool => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </div>
          ))
        ) : (
          // Flat grid when a specific category is selected
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTools.map(tool => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        )}

        {filteredTools.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-500">{t('home.no_tools')}</p>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-slate-100 dark:bg-gradient-to-r dark:from-blue-900/40 dark:to-dark-900 border-y border-slate-200 dark:border-white/5 py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">{t('home.cta_title')}</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-8 text-lg">
            {t('home.cta_subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-600/30 dark:shadow-blue-900/40 hover:scale-105"
            >
              {t('home.cta_btn')} <Zap className="w-5 h-5 fill-current" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
