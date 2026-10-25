import React, { useEffect, useState } from 'react';
import { Layers, Plus, Edit2, CheckCircle, XCircle, X } from 'lucide-react';
import { api } from '../api/client';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
    sortOrder: 1,
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await api.getCategories(true);
      if (res.success) setCategories(res.data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600',
      sortOrder: categories.length + 1,
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (cat: any) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      imageUrl: cat.image_url || '',
      sortOrder: cat.sort_order,
      isActive: cat.is_active,
    });
    setModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: editingCategory ? prev.slug : slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, formData);
      } else {
        await api.createCategory(formData);
      }
      setModalOpen(false);
      loadCategories();
    } catch (err) {
      console.error('Failed to save category:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
            Wholesale Categories
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            Synchronized hierarchy for customer Android app navigation and web admin
          </p>
        </div>

        <button onClick={openCreateModal} className="btn btn-primary btn-sm">
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {categories.map((c) => (
          <div key={c.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <img
                  src={c.image_url || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=120'}
                  alt={c.name}
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '10px',
                    objectFit: 'cover',
                  }}
                />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-text-main)' }}>
                    {c.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>
                    slug: {c.slug}
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '14px', lineHeight: 1.4 }}>
                {c.description || 'No description provided'}
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '12px',
                borderTop: '1px solid #edf1ee',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: 'var(--color-soft-mint)',
                    color: 'var(--color-primary-dark)',
                    padding: '2px 8px',
                    borderRadius: '6px',
                  }}
                >
                  {c.product_count} SKUs
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  Order: #{c.sort_order}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => openEditModal(c)} className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }}>
                  <Edit2 size={13} /> Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content fade-in" style={{ padding: '24px', maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h2>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="label">Category Name *</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Vegetables"
                />
              </div>

              <div>
                <label className="label">Slug Identifier *</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="vegetables"
                />
              </div>

              <div>
                <label className="label">Image URL</label>
                <input
                  type="url"
                  className="input"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  className="textarea"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="label">Sort Order</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value, 10) || 1 })}
                  />
                </div>
                <div>
                  <label className="label">Status</label>
                  <select
                    className="select"
                    value={formData.isActive ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
