import React, { useEffect, useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Download,
  Filter,
  Check,
  X,
  Edit2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { api } from '../api/client';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filterActive, setFilterActive] = useState('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    categoryId: '',
    imageUrl: '',
    unit: 'Bag (25 kg)',
    packSize: '25 kg Bag',
    minOrderQty: 1,
    price: '',
    costPrice: '',
    stockQuantity: 50,
    isFeatured: false,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        api.getProducts({
          search,
          category: selectedCategory,
          activeOnly: filterActive === 'active' ? 'true' : 'false',
        }),
        api.getCategories(true),
      ]);

      if (prodRes.success) setProducts(prodRes.data);
      if (catRes.success) setCategories(catRes.data);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, filterActive]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      name: '',
      description: '',
      categoryId: categories[0]?.id?.toString() || '1',
      imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600',
      unit: 'Bag (25 kg)',
      packSize: '25 kg Bag',
      minOrderQty: 1,
      price: '',
      costPrice: '',
      stockQuantity: 50,
      isFeatured: false,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (p: any) => {
    setEditingProduct(p);
    setFormData({
      sku: p.sku,
      name: p.name,
      description: p.description || '',
      categoryId: p.category_id.toString(),
      imageUrl: p.image_url || '',
      unit: p.unit,
      packSize: p.pack_size,
      minOrderQty: p.min_order_qty,
      price: p.price.toString(),
      costPrice: p.cost_price ? p.cost_price.toString() : '0',
      stockQuantity: p.stock_quantity,
      isFeatured: p.is_featured,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const payload = {
        sku: formData.sku.trim().toUpperCase(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        categoryId: parseInt(formData.categoryId, 10),
        imageUrl: formData.imageUrl.trim(),
        unit: formData.unit.trim(),
        packSize: formData.packSize.trim(),
        minOrderQty: parseInt(formData.minOrderQty.toString(), 10),
        price: parseFloat(formData.price),
        costPrice: parseFloat(formData.costPrice || '0'),
        stockQuantity: parseInt(formData.stockQuantity.toString(), 10),
        isFeatured: formData.isFeatured,
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
      } else {
        await api.createProduct(payload);
      }

      setModalOpen(false);
      loadData();
    } catch (err: any) {
      setFormError(err.message || 'Error saving product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      await api.toggleProductActive(id);
      loadData();
    } catch (err) {
      console.error('Failed to toggle product status:', err);
    }
  };

  const handleExportCsv = () => {
    window.open('/api/products/export/csv', '_blank');
  };

  return (
    <div>
      {/* Title & Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
            Product Catalogue Management
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            Manage commercial restaurant SKUs, MOQ rules, units and pricing
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleExportCsv} className="btn btn-secondary btn-sm">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={openCreateModal} className="btn btn-primary btn-sm">
            <Plus size={16} /> Add Wholesale Product
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div
        className="card"
        style={{
          marginBottom: '20px',
          padding: '16px',
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', flex: '1', minWidth: '240px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              className="input"
              placeholder="Search by product name, SKU or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '34px' }}
            />
            <Search
              size={16}
              style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }}
            />
          </div>
          <button type="submit" className="btn btn-secondary btn-sm">
            Search
          </button>
        </form>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            className="select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ width: '180px' }}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            className="select"
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            style={{ width: '140px' }}
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Product & SKU</th>
              <th>Category</th>
              <th>Wholesale Unit</th>
              <th>MOQ</th>
              <th>Selling Price</th>
              <th>Cost Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-secondary)' }}>
                  Loading product catalogue...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-secondary)' }}>
                  No products found matching your filters.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={p.image_url || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=120'}
                        alt={p.name}
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '8px',
                          objectFit: 'cover',
                          backgroundColor: '#f0f0f0',
                        }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--color-text-main)' }}>{p.name}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                          {p.sku} {p.is_featured && <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>★ Featured</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--color-soft-mint)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--color-primary-dark)',
                      }}
                    >
                      {p.category_name}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{p.unit}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>{p.pack_size}</div>
                  </td>
                  <td style={{ fontWeight: 700, textAlign: 'center' }}>{p.min_order_qty}</td>
                  <td style={{ fontWeight: 800, color: 'var(--color-primary-dark)' }}>
                    ₹{parseFloat(p.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                    ₹{parseFloat(p.cost_price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td>
                    <div
                      style={{
                        fontWeight: 800,
                        color: p.stock_quantity <= 30 ? 'var(--color-warning)' : 'var(--color-text-main)',
                      }}
                    >
                      {p.stock_quantity}
                    </div>
                    {p.stock_quantity <= 30 && (
                      <span style={{ fontSize: '0.65rem', color: 'var(--color-warning)', fontWeight: 700 }}>
                        Low Stock
                      </span>
                    )}
                  </td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        backgroundColor: p.is_active ? 'var(--color-primary-light)' : '#FEE2E2',
                        color: p.is_active ? 'var(--color-primary-dark)' : 'var(--color-error)',
                        border: `1px solid ${p.is_active ? '#A7F3D0' : '#FECACA'}`,
                      }}
                    >
                      {p.is_active ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => openEditModal(p)}
                        className="btn btn-secondary btn-sm"
                        title="Edit product details"
                        style={{ padding: '6px 8px' }}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleToggleActive(p.id)}
                        className={`btn btn-sm ${p.is_active ? 'btn-secondary' : 'btn-soft'}`}
                        title={p.is_active ? 'Deactivate product' : 'Activate product'}
                        style={{ padding: '6px 8px' }}
                      >
                        {p.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content fade-in" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
                {editingProduct ? 'Edit Product SKU' : 'Add New Wholesale Product'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#FEE2E2',
                  border: '1px solid #FECACA',
                  color: 'var(--color-error)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  marginBottom: '16px',
                }}
              >
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                <div>
                  <label className="label">SKU Code *</label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                    placeholder="e.g. VEG-ONI-050"
                  />
                </div>
                <div>
                  <label className="label">Product Name *</label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Nashik Red Onions (Medium-Large Grade)"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="label">Category *</label>
                  <select
                    className="select"
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Product Image URL</label>
                  <input
                    type="url"
                    className="input"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <label className="label">Description & Commercial Grade</label>
                <textarea
                  className="textarea"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Specify grading, origin, curing and suitability for restaurant preparation..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="label">Wholesale Unit *</label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="e.g. Bag (50 kg)"
                  />
                </div>
                <div>
                  <label className="label">Pack Size Details *</label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={formData.packSize}
                    onChange={(e) => setFormData({ ...formData, packSize: e.target.value })}
                    placeholder="e.g. 50 kg Jute Bag"
                  />
                </div>
                <div>
                  <label className="label">Min Order Qty (MOQ) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="input"
                    value={formData.minOrderQty}
                    onChange={(e) => setFormData({ ...formData, minOrderQty: parseInt(e.target.value, 10) || 1 })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="label">Selling Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    className="input"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="1650.00"
                  />
                </div>
                <div>
                  <label className="label">Cost Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="input"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    placeholder="1350.00"
                  />
                </div>
                <div>
                  <label className="label">Stock Units</label>
                  <input
                    type="number"
                    min="0"
                    disabled={!!editingProduct}
                    className="input"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value, 10) || 0 })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
                />
                <label htmlFor="isFeatured" style={{ fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                  Feature on Customer App Home Dashboard
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                >
                  {submitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
