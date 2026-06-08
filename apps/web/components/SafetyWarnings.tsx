import type { SafetyWarning } from '@kledningsapp/recommendation-engine';

const LEVEL_STYLES: Record<string, string> = {
  critical: 'bg-red-100 border-red-400 text-red-900 dark:bg-red-950 dark:border-red-600 dark:text-red-100',
  high:     'bg-orange-100 border-orange-400 text-orange-900 dark:bg-orange-950 dark:border-orange-600 dark:text-orange-100',
  medium:   'bg-yellow-100 border-yellow-400 text-yellow-900 dark:bg-yellow-950 dark:border-yellow-600 dark:text-yellow-100',
  low:      'bg-blue-50 border-blue-300 text-blue-900 dark:bg-blue-950 dark:border-blue-600 dark:text-blue-100',
};

const LEVEL_ICONS: Record<string, string> = {
  critical: '🚨',
  high: '⚠️',
  medium: '⚡',
  low: 'ℹ️',
};

export function SafetyWarnings({ warnings }: { warnings: SafetyWarning[] }) {
  if (warnings.length === 0) return null;

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        Advarsler
      </h2>
      {warnings.map((w, i) => (
        <div key={i} className={`rounded-xl border-l-4 p-4 ${LEVEL_STYLES[w.level] ?? LEVEL_STYLES.low}`}>
          <p className="font-semibold flex items-center gap-2">
            <span>{LEVEL_ICONS[w.level]}</span>
            {w.message}
          </p>
          <p className="text-sm mt-1 opacity-80">{w.recommendation}</p>
        </div>
      ))}
    </div>
  );
}
