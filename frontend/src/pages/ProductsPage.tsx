import { PageHeader } from '../components/common/PageHeader';

export function ProductsPage() {
  return (
    <div>
      <PageHeader title="Products" subtitle="CRUD, image upload, recipes/BOM, variants, modifiers" />
      <div className="bg-white rounded-xl p-4 shadow-md">
        <p className="text-sm text-slate-600">Bulk upload CSV and barcode search supported.</p>
      </div>
    </div>
  );
}
