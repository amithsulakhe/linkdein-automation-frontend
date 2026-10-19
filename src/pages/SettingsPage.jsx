import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';

export default function SettingsPage() {
  const [params] = useSearchParams();
  const [linkedin, setLinkedin] = useState(null);
  const [gmail, setGmail] = useState(null);
  const [settings, setSettings] = useState(null);
  const [scheduleTimes, setScheduleTimes] = useState([]);
  const [message, setMessage] = useState('');
  const [errorBanner, setErrorBanner] = useState('');
  const [resetConfirm, setResetConfirm] = useState('');
  const [resetting, setResetting] = useState(false);

  const load = async () => {
    const [li, gm, st] = await Promise.all([
      api.get('/integrations/linkedin/status'),
      api.get('/integrations/gmail/status'),
      api.get('/settings'),
    ]);
    setLinkedin(li.data.data);
    setGmail(gm.data.data);
    setSettings(st.data.data);
    setScheduleTimes(st.data.data.scheduledPostTimes || []);
  };

  useEffect(() => {
    load().catch(() => {});
    if (params.get('linkedin') === 'connected') setMessage('LinkedIn connected.');
    if (params.get('linkedin') === 'error') {
      const reason = params.get('reason');
      setErrorBanner(reason ? decodeURIComponent(reason) : 'LinkedIn connection failed.');
    }
    if (params.get('gmail') === 'connected') setMessage('Gmail connected.');
  }, [params]);

  const togglePref = async (key, value) => {
    const preferences = { ...settings.preferences, [key]: value };
    await api.patch('/settings', { preferences });
    setSettings({ ...settings, preferences });
  };

  const saveSchedule = async () => {
    const preferences = {
      ...settings.preferences,
      scheduledPostTimes: scheduleTimes.map(({ hour, minute }) => ({
        hour: Number(hour),
        minute: Number(minute),
      })),
    };
    await api.patch('/settings', { preferences });
    setMessage('Schedule saved.');
    load();
  };

  const addSlot = () => {
    setScheduleTimes([...scheduleTimes, { hour: 9, minute: 0 }]);
  };

  const removeSlot = (idx) => {
    setScheduleTimes(scheduleTimes.filter((_, i) => i !== idx));
  };

  const updateSlot = (idx, field, value) => {
    setScheduleTimes(scheduleTimes.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Integrations, schedule, and notifications</p>
      </div>

      {message && <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-900 dark:text-emerald-100">{message}</div>}
      {errorBanner && <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-800 dark:text-rose-200">{errorBanner}</div>}

      <section className="card space-y-3 p-5">
        <h2 className="font-semibold">Content type</h2>
        <p className="text-sm text-muted-foreground">
          Scheduled posts and Generate with AI follow this for your account only.
        </p>
        <select
          className="input max-w-md"
          value={settings?.preferences?.contentType || 'javascript'}
          onChange={(e) => {
            const contentType = e.target.value;
            setSettings({
              ...settings,
              preferences: { ...settings.preferences, contentType },
            });
          }}
        >
          <option value="javascript">JavaScript & web engineering</option>
          <option value="career">Developer career</option>
          <option value="ai">AI for engineers</option>
          <option value="leadership">Engineering leadership</option>
          <option value="custom">Custom</option>
        </select>
        <textarea
          className="input min-h-24"
          placeholder="Describe the posts you want. Used as-is when type is Custom, and as extra direction for the presets."
          value={settings?.preferences?.contentBrief || ''}
          onChange={(e) =>
            setSettings({
              ...settings,
              preferences: { ...settings.preferences, contentBrief: e.target.value },
            })
          }
        />
        <button
          type="button"
          className="btn-primary"
          onClick={async () => {
            await api.patch('/settings', {
              preferences: {
                contentType: settings.preferences.contentType || 'javascript',
                contentBrief: settings.preferences.contentBrief || '',
              },
            });
            setMessage('Content type saved. New scheduled posts will use it.');
          }}
        >
          Save content type
        </button>
      </section>

      <section className="card p-5 space-y-3">
        <h2 className="font-semibold">AI post schedule</h2>
        <p className="text-sm text-muted-foreground">
          Add as many daily times as you want ({settings?.timezone || settings?.appTimezone || 'Asia/Kolkata'}). Each slot
          generates a post and sends an <strong>approve / reject</strong> email — nothing posts until you confirm.
        </p>
        <div className="space-y-2">
          {scheduleTimes.map((slot, idx) => (
            <div key={idx} className="flex flex-wrap items-center gap-2">
              <input
                type="number"
                min={0}
                max={23}
                className="input w-20"
                value={slot.hour}
                onChange={(e) => updateSlot(idx, 'hour', e.target.value)}
              />
              <span className="text-muted-foreground">:</span>
              <input
                type="number"
                min={0}
                max={59}
                className="input w-20"
                value={slot.minute}
                onChange={(e) => updateSlot(idx, 'minute', e.target.value)}
              />
              <span className="text-xs text-muted-foreground">{slot.label || ''}</span>
              <button type="button" className="btn-secondary text-xs" onClick={() => removeSlot(idx)} disabled={scheduleTimes.length <= 1}>
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn-secondary" onClick={addSlot}>
            Add time
          </button>
          <button type="button" className="btn-primary" onClick={saveSchedule}>
            Save schedule
          </button>
        </div>
        {settings?.nextScheduledRun && (
          <p className="text-xs text-muted-foreground">Next run (approx): {new Date(settings.nextScheduledRun).toLocaleString()}</p>
        )}
      </section>

      <section className="card p-5 space-y-3">
        <h2 className="font-semibold">Preferences</h2>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings?.preferences?.dailyGenerationEnabled ?? true}
            onChange={(e) => togglePref('dailyGenerationEnabled', e.target.checked)}
          />
          Enable scheduled AI generation
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings?.preferences?.emailNotifications ?? true}
            onChange={(e) => togglePref('emailNotifications', e.target.checked)}
          />
          Email notifications
        </label>
      </section>

      <section className="card p-5 space-y-3">
        <h2 className="font-semibold">LinkedIn</h2>
        <p className="text-sm text-muted-foreground">{linkedin?.connected ? 'Connected' : 'Not connected'}</p>
        {linkedin?.redirectUri && <p className="text-xs break-all text-muted-foreground">Redirect: {linkedin.redirectUri}</p>}
        <button type="button" className="btn-primary" disabled={!linkedin?.configured} onClick={async () => {
          const res = await api.get('/integrations/linkedin/connect');
          window.location.href = res.data.data.url;
        }}>
          Connect LinkedIn
        </button>
      </section>

      <section className="card p-5 space-y-3">
        <h2 className="font-semibold">Gmail</h2>
        <p className="text-sm text-muted-foreground">{gmail?.connected ? `Connected (${gmail.email})` : 'Not connected'}</p>
        <button type="button" className="btn-primary" disabled={!gmail?.configured} onClick={async () => {
          const res = await api.get('/integrations/gmail/connect');
          window.location.href = res.data.data.url;
        }}>
          Connect Gmail
        </button>
      </section>

      <section className="card border-destructive/30 p-5 space-y-3">
        <h2 className="font-semibold text-destructive">Start fresh</h2>
        <p className="text-sm text-muted-foreground">
          Deletes all posts, approvals, analytics, knowledge base, chat history, scheduled jobs, and disconnects LinkedIn/Gmail.
          Your login account stays — reconnect integrations after.
        </p>
        <input
          className="input max-w-xs"
          placeholder='Type DELETE_ALL to confirm'
          value={resetConfirm}
          onChange={(e) => setResetConfirm(e.target.value)}
        />
        <button
          type="button"
          className="btn-danger"
          disabled={resetConfirm !== 'DELETE_ALL' || resetting}
          onClick={async () => {
            setResetting(true);
            try {
              await api.post('/settings/reset-data', { confirm: 'DELETE_ALL' });
              setResetConfirm('');
              setMessage('All data cleared. Reconnect LinkedIn and Gmail when ready.');
              load();
            } catch (err) {
              setErrorBanner(err.response?.data?.message || err.message);
            } finally {
              setResetting(false);
            }
          }}
        >
          {resetting ? 'Clearing…' : 'Erase all my data'}
        </button>
      </section>
    </div>
  );
}
