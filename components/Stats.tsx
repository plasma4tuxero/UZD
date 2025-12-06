import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { SavedItem, Category, Language } from '../types';
import { translations } from '../utils/translations';

interface Props {
  items: SavedItem[];
  lang: Language;
}

const COLORS = {
  [Category.TRICKS]: '#a855f7',
  [Category.SHOPPING]: '#3b82f6',
  [Category.MOVIES]: '#ef4444',
  [Category.FOODIE]: '#f97316',
  [Category.UNCATEGORIZED]: '#737373', // Neutral-500
};

const Stats: React.FC<Props> = ({ items, lang }) => {
  const t = translations[lang];

  const data = Object.values(Category).map(cat => ({
    name: t.badges[cat],
    value: items.filter(i => i.userCategory === cat).length,
    color: COLORS[cat],
  })).filter(d => d.value > 0);

  const confidenceData = items
    .filter(i => i.analysis)
    .map((i, idx) => ({
      name: `Item ${idx + 1}`,
      score: (i.analysis?.confidenceScores[i.userCategory] || 0) * 100
    }))
    .slice(0, 10); // Show last 10 items

  if (items.length === 0) {
    return (
      <div className="p-6 text-center text-slate-500 dark:text-neutral-500 bg-slate-100 dark:bg-neutral-900 rounded-xl border border-slate-200 dark:border-neutral-800">
        {t.stats.noData}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-slate-200 dark:border-neutral-800 backdrop-blur-sm shadow-sm dark:shadow-none">
        <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-neutral-200">{t.stats.distribution}</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: '#171717', color: '#fff' }}
                itemStyle={{ fontWeight: 500 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-2 justify-center mt-2">
            {data.map(d => (
                <div key={d.name} className="flex items-center gap-1 text-xs text-slate-600 dark:text-neutral-400">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></span>
                    {d.name}
                </div>
            ))}
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-slate-200 dark:border-neutral-800 backdrop-blur-sm shadow-sm dark:shadow-none">
        <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-neutral-200">{t.stats.confidence}</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={confidenceData}>
              <XAxis dataKey="name" hide />
              <YAxis domain={[0, 100]} stroke="#737373" fontSize={12} />
              <Tooltip 
                 cursor={{fill: '#404040', opacity: 0.1}}
                 contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: '#171717', color: '#fff' }}
              />
              <Bar dataKey="score" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Stats;