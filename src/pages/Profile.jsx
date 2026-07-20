import { useEffect, useState } from 'react';
import { profileService } from '../services/profileService';

export default function Profile() {
  const [profile,  setProfile]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [msg,      setMsg]      = useState('');
  const [pwMsg,    setPwMsg]    = useState('');

  const [form, setForm] = useState({ fullName: '', phone: '' });
  const [pw,   setPw]   = useState({ currentPassword: '', newPassword: '', confirm: '' });

  useEffect(() => {
    profileService.getProfile()
      .then(p => { setProfile(p); setForm({ fullName: p.fullName, phone: p.phone ?? '' }); })
      .catch(() => setMsg('Error cargando perfil'))
      .finally(() => setLoading(false));
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg('');
    try {
      const updated = await profileService.updateProfile(form);
      setProfile(updated);
      setMsg('Perfil actualizado.');
    } catch (err) {
      setMsg(err?.message ?? 'Error actualizando perfil');
    } finally { setSaving(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pw.newPassword !== pw.confirm) { setPwMsg('Las contraseñas no coinciden'); return; }
    setPwSaving(true); setPwMsg('');
    try {
      await profileService.changePassword({ currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      setPwMsg('Contraseña cambiada correctamente.');
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setPwMsg(err?.message ?? 'Error cambiando contraseña');
    } finally { setPwSaving(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-xl">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">Mi Perfil</h1>

        {/* Info general */}
        <div className="bg-white rounded-2xl shadow-md p-8 mb-6">
          <h2 className="text-lg font-semibold mb-4">Datos personales</h2>

          {msg && <p className={`text-sm mb-3 ${msg.includes('Error') ? 'text-red-600' : 'text-green-700'}`}>{msg}</p>}

          <form onSubmit={saveProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
              <input
                type="text"
                value={form.fullName}
                onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Opcional"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={profile?.email ?? ''} disabled className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-500" />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-primary text-white py-2.5 rounded-lg font-semibold hover:bg-primary-600 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </form>
        </div>

        {/* Cambiar contraseña — solo para cuentas LOCAL */}
        {profile?.authProvider === 'LOCAL' && (
          <div className="bg-white rounded-2xl shadow-md p-8">
            <h2 className="text-lg font-semibold mb-4">Cambiar contraseña</h2>

            {pwMsg && <p className={`text-sm mb-3 ${pwMsg.includes('Error') || pwMsg.includes('no coinciden') ? 'text-red-600' : 'text-green-700'}`}>{pwMsg}</p>}

            <form onSubmit={changePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña actual</label>
                <input type="password" value={pw.currentPassword}
                  onChange={e => setPw(p => ({ ...p, currentPassword: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
                <input type="password" value={pw.newPassword} minLength={8}
                  onChange={e => setPw(p => ({ ...p, newPassword: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
                <input type="password" value={pw.confirm}
                  onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30" required />
              </div>
              <button type="submit" disabled={pwSaving}
                className="w-full bg-gray-800 text-white py-2.5 rounded-lg font-semibold hover:bg-gray-700 disabled:opacity-50 transition-colors">
                {pwSaving ? 'Cambiando...' : 'Cambiar contraseña'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
