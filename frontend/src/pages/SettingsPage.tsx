import { PageHeader } from '../components/common/PageHeader';

export function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" subtitle="Outlets, VAT, printers, payments, RBAC, and security policy" />
      <div className="bg-white rounded-xl p-4 shadow-md text-sm text-slate-700">Configure tax rate, printers, and role permissions per outlet.</div>
    </div>
  );
}
