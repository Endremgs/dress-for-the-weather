import type { RecommendationResult, LayerRecommendation, ZoneRecommendation } from '@kledningsapp/recommendation-engine';

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

export function OutfitDisplay({ result }: { result: RecommendationResult }) {
  const { garments, notes, summary } = result;

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 px-4 py-3">
        <p className="font-semibold text-blue-900 dark:text-blue-100">{summary}</p>
      </div>

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
