import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { AllocationInput, ArtistChartRow, TrustSummary } from '@trust/shared';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';
const MOCK_TG_ID = 'fan_1';

function App() {
  const [chart, setChart] = useState<ArtistChartRow[]>([]);
  const [summary, setSummary] = useState<TrustSummary | null>(null);
  const [pending, setPending] = useState<Record<number, number>>({});

  const tauSum = useMemo(() => Object.values(pending).reduce((sum, v) => sum + v, 0), [pending]);

  useEffect(() => {
    axios.get(`${API_BASE}/artists/chart`).then((res) => setChart(res.data.chart));
    axios.get(`${API_BASE}/trust/summary/${MOCK_TG_ID}`).then((res) => {
      setSummary(res.data);
      const next: Record<number, number> = {};
      res.data.allocations.forEach((a: AllocationInput) => {
        next[a.artistId] = a.tau;
      });
      setPending(next);
    });
  }, []);

  const update = (artistId: number, value: number) => {
    setPending((prev) => ({ ...prev, [artistId]: value }));
  };

  const submit = async () => {
    const allocations = Object.entries(pending).map(([artistId, tau]) => ({ artistId: Number(artistId), tau }));
    await axios.post(`${API_BASE}/trust/allocate`, { tgId: MOCK_TG_ID, allocations });
    const res = await axios.get(`${API_BASE}/trust/summary/${MOCK_TG_ID}`);
    setSummary(res.data);
  };

  return (
    <div className="container">
      <header>
        <h1>TRUST CrEATER — Mini App MVP</h1>
        <p>Telegram Stars игра. 250 Stars = 250 TAU на распределение.</p>
      </header>

      <section>
        <h2>Чарт артистов</h2>
        <div className="cards">
          {chart.map((row) => (
            <div key={row.id} className="card">
              <div className="card-header">
                <span className="artist-name">{row.name}</span>
                <span className="rank">#{row.trustRank}</span>
              </div>
              <div className="metrics">
                <div>Trust Score: {row.trustScore}</div>
                <div>Velocity: {row.trustVelocity >= 0 ? '↑' : '↓'} {row.trustVelocity}</div>
              </div>
              <div className="slider-row">
                <input
                  type="range"
                  min={0}
                  max={250}
                  value={pending[row.id] ?? 0}
                  onChange={(e) => update(row.id, Number(e.target.value))}
                />
                <span>{pending[row.id] ?? 0} TAU</span>
              </div>
            </div>
          ))}
        </div>
        <div className="summary-row">
          <span>Всего распределено: {tauSum} / 250 TAU</span>
          <button disabled={tauSum !== 250} onClick={submit}>
            Сохранить распределение
          </button>
        </div>
      </section>

      {summary && (
        <section className="status">
          <h2>Мой TRUST</h2>
          <p>Доступ активен до: {new Date(summary.expiresAt).toLocaleString()}</p>
          <p>Остаток TAU: {summary.tauRemaining}</p>
        </section>
      )}
    </div>
  );
}

export default App;
