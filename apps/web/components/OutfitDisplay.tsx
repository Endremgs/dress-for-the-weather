import type { RecommendationResult, LayerRecommendation, ZoneRecommendation, ForecastAlert } from '@kledningsapp/recommendation-engine';

function LayerItem({ layer, label }: { layer: LayerRecommendation | ZoneRecommendation | null; label: string }) {
  if (!layer) return null;
  const required = layer.required;
  return (
    <div className={`flex items-start gap-2 py-2 border-b border-slate-100 dark:border-slate-800 last:border-0 ${!required ? 'opacity-60' : ''}`}>
      <span className="text-slate-400 text-xs w-20 shrink-0 pt-0.5">{label}</span>
      <div className="flex-1">
        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{layer.item}</span>
        {'material' in layer && layer.material && (
          <span className="text-xs text-slate-400 ml-2">({layer.material})</span>
        )}
        {'reason' in layer && layer.reason && (
          <p className="text-xs text-slate-400 mt-0.5">{layer.reason}</p>
        )}
        {'clo' in layer && layer.clo && (
          <span className="text-xs text-slate-400 ml-2">{layer.clo} CLO</span>
        )}
      </div>
      {!required && <span className="text-xs text-slate-400 shrink-0">valgfri</span>}
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
        <span>{icon}</span>
        <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">{title}</h3>
      </div>
      <div className="px-4 py-1">{children}</div>
    </div>
  );
}

const ALERT_STYLES: Record<ForecastAlert['type'], { bg: string; border: string; text: string; icon: string }> = {
  regn:          { bg: 'bg-blue-50 dark:bg-blue-950',   border: 'border-blue-200 dark:border-blue-800',   text: 'text-blue-800 dark:text-blue-200',   icon: '🌧️' },
  temperaturfall: { bg: 'bg-orange-50 dark:bg-orange-950', border: 'border-orange-200 dark:border-orange-800', text: 'text-orange-800 dark:text-orange-200', icon: '🌡️' },
  vindøkning:    { bg: 'bg-slate-50 dark:bg-slate-800',  border: 'border-slate-200 dark:border-slate-700',  text: 'text-slate-700 dark:text-slate-300',  icon: '💨' },
};

export function OutfitDisplay({ result }: { result: RecommendationResult }) {
  const { garments, notes, summary, forecastAlerts = [] } = result;

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 px-4 py-3">
        <p className="font-semibold text-blue-900 dark:text-blue-100">{summary}</p>
      </div>

      {forecastAlerts.length > 0 && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-800 overflow-hidden">
          <div className="px-4 py-3 bg-amber-50 dark:bg-amber-900/40 border-b border-amber-200 dark:border-amber-800 flex items-center gap-2">
            <span>⚠️</span>
            <h3 className="font-semibold text-amber-800 dark:text-amber-200 text-sm">Varsler for turen</h3>
          </div>
          <div className="px-4 py-2 space-y-2 bg-white dark:bg-slate-800">
            {forecastAlerts.map((alert, i) => {
              const s = ALERT_STYLES[alert.type];
              return (
                <div key={i} className={`flex items-start gap-2 rounded-lg px-3 py-2 border ${s.bg} ${s.border}`}>
                  <span className="text-base leading-none mt-0.5">{s.icon}</span>
                  <div>
                    <p className={`text-sm font-medium ${s.text}`}>{alert.message}</p>
                    {alert.severity === 'advarsel' && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Ta med ekstra lag</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Section title="Hode og hals" icon="🧢">
        <LayerItem layer={garments.head} label="Hode" />
        <LayerItem layer={garments.neck} label="Hals" />
      </Section>

      <Section title="Overkropp" icon="👕">
        <LayerItem layer={garments.upperBody.baseLayer} label="Grunnlag" />
        <LayerItem layer={garments.upperBody.midLayer} label="Mellomlag" />
        <LayerItem layer={garments.upperBody.outerLayer} label="Ytterlag" />
      </Section>

      <Section title="Underkropp" icon="👖">
        <LayerItem layer={garments.lowerBody.baseLayer} label="Grunnlag" />
        <LayerItem layer={garments.lowerBody.outerLayer} label="Ytterlag" />
      </Section>

      <Section title="Hender og føtter" icon="🧤">
        <LayerItem layer={garments.hands} label="Hender" />
        <LayerItem layer={garments.feet} label="Føtter" />
      </Section>

      {garments.backpackExtras.length > 0 && (
        <Section title="I sekken / vesken" icon="🎒">
          {garments.backpackExtras.map((extra, i) => (
            <div key={i} className="py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
              <span className="text-sm text-slate-700 dark:text-slate-300">{extra}</span>
            </div>
          ))}
        </Section>
      )}

      {notes.length > 0 && (
        <Section title="Merknader" icon="📝">
          {notes.map((note, i) => (
            <div key={i} className="py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
              <p className="text-sm text-slate-600 dark:text-slate-400">{note}</p>
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}
