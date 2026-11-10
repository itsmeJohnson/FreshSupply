import React, { useState } from 'react';
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  Layers,
  Edit3,
  Trash2,
  CheckCircle,
  X,
  TrendingDown,
  Building2,
  Package,
  Sparkles,
  Percent,
  Download,
  AlertCircle,
} from 'lucide-react';

interface PricingTier {
  minQty: number;
  maxQty: number | null; // null represents "+"
  pricePerUnit: number;
  discountPercent: number;
}

interface ProductPricing {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  packaging: string;
  basePrice: number;
  customerSegment: string;
  lastUpdated: string;
  tiers: PricingTier[];
}

export const PricingPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSegment, setSelectedSegment] = useState('All');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductPricing | null>(null);
  const [saveToast, setSaveToast] = useState(false);

  // Dynamic state for the wholesale products
  const [pricingList, setPricingList] = useState<ProductPricing[]>([
    {
      id: 'P-01',
      sku: 'VEG-ONI-050',
      name: 'Nashik Red Sautéing Onions',
      category: 'Fruits & Vegetables',
      unit: 'Kg',
      packaging: '50 kg Jute Bag',
      basePrice: 32,
      customerSegment: 'All B2B Buyers',
      lastUpdated: 'Today, 09:30 AM',
      tiers: [
        { minQty: 1, maxQty: 49, pricePerUnit: 32.0, discountPercent: 0 },
        { minQty: 50, maxQty: 249, pricePerUnit: 30.0, discountPercent: 6.25 },
        { minQty: 250, maxQty: 999, pricePerUnit: 28.0, discountPercent: 12.5 },
        { minQty: 1000, maxQty: null, pricePerUnit: 26.0, discountPercent: 18.75 },
      ],
    },
    {
      id: 'P-02',
      sku: 'VEG-TOM-025',
      name: 'Hybrid Salad Tomatoes (Crimson Grade)',
      category: 'Fruits & Vegetables',
      unit: 'Kg',
      packaging: '25 kg Uniform Crate',
      basePrice: 38,
      customerSegment: 'All B2B Buyers',
      lastUpdated: 'Oct 03, 2026',
      tiers: [
        { minQty: 1, maxQty: 99, pricePerUnit: 38.0, discountPercent: 0 },
        { minQty: 100, maxQty: 499, pricePerUnit: 35.0, discountPercent: 7.89 },
        { minQty: 500, maxQty: 1499, pricePerUnit: 32.5, discountPercent: 14.47 },
        { minQty: 1500, maxQty: null, pricePerUnit: 30.0, discountPercent: 21.05 },
      ],
    },
    {
      id: 'P-03',
      sku: 'GRP-RIC-050',
      name: 'Aged 1121 Royal Basmati Rice (XXL Grain)',
      category: 'Rice & Grains',
      unit: 'Kg',
      packaging: '50 kg Moisture-Proof Bag',
      basePrice: 78,
      customerSegment: 'Supermarket & HORECA',
      lastUpdated: 'Oct 02, 2026',
      tiers: [
        { minQty: 50, maxQty: 249, pricePerUnit: 78.0, discountPercent: 0 },
        { minQty: 250, maxQty: 999, pricePerUnit: 74.0, discountPercent: 5.13 },
        { minQty: 1000, maxQty: 2999, pricePerUnit: 70.0, discountPercent: 10.26 },
        { minQty: 3000, maxQty: null, pricePerUnit: 66.5, discountPercent: 14.74 },
      ],
    },
    {
      id: 'P-04',
      sku: 'OIL-SUN-015',
      name: 'Refined Sunflower Cooking Oil',
      category: 'Cooking Oils & Ghee',
      unit: 'Litre',
      packaging: '15 Litre Sealed Tin',
      basePrice: 112,
      customerSegment: 'Cloud Kitchens & Bulk Caterers',
      lastUpdated: 'Yesterday, 04:15 PM',
      tiers: [
        { minQty: 15, maxQty: 150, pricePerUnit: 112.0, discountPercent: 0 },
        { minQty: 151, maxQty: 600, pricePerUnit: 106.0, discountPercent: 5.36 },
        { minQty: 601, maxQty: 1500, pricePerUnit: 101.5, discountPercent: 9.38 },
        { minQty: 1501, maxQty: null, pricePerUnit: 97.0, discountPercent: 13.39 },
      ],
    },
    {
      id: 'P-05',
      sku: 'PUL-TOO-050',
      name: 'Premium Polished Toor Dal (Desi Fatka)',
      category: 'Pulses & Dals',
      unit: 'Kg',
      packaging: '50 kg Gunny Sack',
      basePrice: 138,
      customerSegment: 'All B2B Buyers',
      lastUpdated: 'Sep 30, 2026',
      tiers: [
        { minQty: 50, maxQty: 249, pricePerUnit: 138.0, discountPercent: 0 },
        { minQty: 250, maxQty: 999, pricePerUnit: 132.0, discountPercent: 4.35 },
        { minQty: 1000, maxQty: 2499, pricePerUnit: 126.0, discountPercent: 8.7 },
        { minQty: 2500, maxQty: null, pricePerUnit: 120.0, discountPercent: 13.04 },
      ],
    },
    {
      id: 'P-06',
      sku: 'SUG-M30-050',
      name: 'Refined Sparkling White Sugar (M-30 Grade)',
      category: 'Sugar, Salt & Sweeteners',
      unit: 'Kg',
      packaging: '50 kg Heavy Poly-Bag',
      basePrice: 42,
      customerSegment: 'Commercial Bakeries & Kiranas',
      lastUpdated: 'Oct 01, 2026',
      tiers: [
        { minQty: 50, maxQty: 499, pricePerUnit: 42.0, discountPercent: 0 },
        { minQty: 500, maxQty: 1999, pricePerUnit: 39.5, discountPercent: 5.95 },
        { minQty: 2000, maxQty: null, pricePerUnit: 37.0, discountPercent: 11.9 },
      ],
    },
  ]);

  // Modal Editing Form State
  const [formProduct, setFormProduct] = useState<ProductPricing | null>(null);

  const handleOpenEdit = (product: ProductPricing) => {
    setSelectedProduct(product);
    // clone deep
    setFormProduct(JSON.parse(JSON.stringify(product)));
    setEditModalOpen(true);
  };

  const handleTierChange = (index: number, field: keyof PricingTier, value: any) => {
    if (!formProduct) return;
    const updatedTiers = [...formProduct.tiers];
    updatedTiers[index] = { ...updatedTiers[index], [field]: value };

    // Auto-calculate discount if price changes
    if (field === 'pricePerUnit') {
      const price = parseFloat(value) || 0;
      const discount = formProduct.basePrice > 0 ? ((formProduct.basePrice - price) / formProduct.basePrice) * 100 : 0;
      updatedTiers[index].discountPercent = Math.max(0, parseFloat(discount.toFixed(2)));
    } else if (field === 'discountPercent') {
      const disc = parseFloat(value) || 0;
      const price = formProduct.basePrice * (1 - disc / 100);
      updatedTiers[index].pricePerUnit = parseFloat(price.toFixed(2));
    }

    setFormProduct({ ...formProduct, tiers: updatedTiers });
  };

  const handleAddTier = () => {
    if (!formProduct) return;
    const lastTier = formProduct.tiers[formProduct.tiers.length - 1];
    const newMin = lastTier ? (lastTier.maxQty ? lastTier.maxQty + 1 : lastTier.minQty + 500) : 1;
    const newTier: PricingTier = {
      minQty: newMin,
      maxQty: null,
      pricePerUnit: parseFloat((formProduct.basePrice * 0.85).toFixed(2)),
      discountPercent: 15.0,
    };
    setFormProduct({ ...formProduct, tiers: [...formProduct.tiers, newTier] });
  };

  const handleRemoveTier = (index: number) => {
    if (!formProduct || formProduct.tiers.length <= 1) return;
    const updated = formProduct.tiers.filter((_, i) => i !== index);
    setFormProduct({ ...formProduct, tiers: updated });
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProduct) return;

    setPricingList((prev) => prev.map((p) => (p.id === formProduct.id ? { ...formProduct, lastUpdated: 'Just now' } : p)));
    setEditModalOpen(false);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3500);
  };

  const filteredList = pricingList.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSegment = selectedSegment === 'All' || item.customerSegment.includes(selectedSegment);
    return matchesSearch && matchesCategory && matchesSegment;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '100%' }}>
      
      {/* Toast Notification */}
      {saveToast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#047857',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '10px',
            boxShadow: '0 10px 25px rgba(4, 120, 87, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 9999,
            fontWeight: 700,
            fontSize: '0.85rem',
          }}
        >
          <CheckCircle size={18} />
          <span>Wholesale pricing tiers updated and published successfully!</span>
        </div>
      )}

      {/* Header Strip */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#172B24', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <DollarSign size={24} color="#047857" />
            Wholesale Pricing & Volume Tiers
          </h1>
          <p style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '2px' }}>
            Configure dynamic quantity-based slabs, contract partner discounts, and packaging pricing across all SKUs
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              const newProd: ProductPricing = {
                id: `P-0${pricingList.length + 1}`,
                sku: 'NEW-SKU-001',
                name: 'New Grocery SKU Pricing',
                category: 'Fruits & Vegetables',
                unit: 'Kg',
                packaging: 'Standard Bag',
                basePrice: 50,
                customerSegment: 'All B2B Buyers',
                lastUpdated: 'Draft',
                tiers: [
                  { minQty: 1, maxQty: 49, pricePerUnit: 50, discountPercent: 0 },
                  { minQty: 50, maxQty: 249, pricePerUnit: 46, discountPercent: 8 },
                  { minQty: 250, maxQty: null, pricePerUnit: 42, discountPercent: 16 },
                ],
              };
              handleOpenEdit(newProd);
            }}
            className="btn btn-primary"
            style={{ fontSize: '0.82rem', padding: '8px 16px' }}
          >
            <Plus size={16} />
            <span>Add Pricing Slabs</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '14px',
        }}
      >
        <div className="card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>Active Volume Rules</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#172B24', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
            48 SKUs
          </div>
          <div style={{ fontSize: '0.7rem', color: '#16A34A', fontWeight: 700, marginTop: '4px' }}>
            ● 100% active on B2B portal
          </div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>Average Slab Discount</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#047857', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
            14.2%
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 500, marginTop: '4px' }}>
            Weighted across tier 3 & 4
          </div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>Customer Overrides</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#2563EB', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
            12 Contracts
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 500, marginTop: '4px' }}>
            HORECA & Supermarkets
          </div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>Highest Volume Slab</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#D97706', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
            ≥ 3,000 Kg
          </div>
          <div style={{ fontSize: '0.7rem', color: '#16A34A', fontWeight: 700, marginTop: '4px' }}>
            Max discount 21.05%
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '14px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <input
            type="text"
            className="input"
            placeholder="Search by SKU or item name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '34px', fontSize: '0.82rem' }}
          />
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8E5',
              borderRadius: '8px',
              padding: '7px 12px',
              fontSize: '0.8rem',
              color: '#172B24',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="All">All Categories</option>
            <option value="Fruits & Vegetables">Fruits & Vegetables</option>
            <option value="Rice & Grains">Rice & Grains</option>
            <option value="Pulses & Dals">Pulses & Dals</option>
            <option value="Cooking Oils & Ghee">Cooking Oils & Ghee</option>
            <option value="Sugar, Salt & Sweeteners">Sugar, Salt & Sweeteners</option>
          </select>

          <select
            value={selectedSegment}
            onChange={(e) => setSelectedSegment(e.target.value)}
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8E5',
              borderRadius: '8px',
              padding: '7px 12px',
              fontSize: '0.8rem',
              color: '#172B24',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="All">All Buyer Segments</option>
            <option value="Supermarket">Supermarkets</option>
            <option value="HORECA">HORECA & Restaurants</option>
            <option value="Cloud Kitchens">Cloud Kitchens</option>
            <option value="Commercial Bakeries">Bakeries & Processors</option>
          </select>
        </div>
      </div>

      {/* Pricing Matrix List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredList.map((prod) => (
          <div
            key={prod.id}
            className="card"
            style={{
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              transition: 'box-shadow 0.15s ease',
            }}
          >
            {/* Product Top Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#172B24' }}>{prod.name}</h3>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.72rem',
                      color: '#047857',
                      backgroundColor: '#ECFDF5',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontWeight: 700,
                      border: '1px solid #A7F3D0',
                    }}
                  >
                    {prod.sku}
                  </span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      color: '#64748B',
                      backgroundColor: '#F1F5F3',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: 600,
                    }}
                  >
                    {prod.category}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '6px', fontSize: '0.78rem', color: '#64748B', flexWrap: 'wrap' }}>
                  <span>Packaging: <strong style={{ color: '#172B24' }}>{prod.packaging}</strong></span>
                  <span>Target Segment: <strong style={{ color: '#047857' }}>{prod.customerSegment}</strong></span>
                  <span>Base Rate: <strong style={{ color: '#172B24', fontFamily: 'var(--font-mono)' }}>₹{prod.basePrice.toFixed(2)} / {prod.unit}</strong></span>
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Updated {prod.lastUpdated}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => handleOpenEdit(prod)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                >
                  <Edit3 size={14} color="#047857" />
                  <span>Configure Slabs</span>
                </button>
              </div>
            </div>

            {/* Dynamic Quantity Slab Table (Section 6 Example) */}
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem', minWidth: '480px' }}>
                <thead>
                  <tr style={{ color: '#64748B', borderBottom: '1px solid #E2E8E5', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '8px 10px', width: '30%' }}>Order Quantity Slab</th>
                    <th style={{ padding: '8px 10px', width: '25%' }}>Wholesale Price / {prod.unit}</th>
                    <th style={{ padding: '8px 10px', width: '20%' }}>Discount %</th>
                    <th style={{ padding: '8px 10px', width: '25%', textAlign: 'right' }}>Buyer Savings</th>
                  </tr>
                </thead>
                <tbody>
                  {prod.tiers.map((tier, tIdx) => {
                    const isMaxTier = tIdx === prod.tiers.length - 1;
                    const qtyLabel = tier.maxQty ? `${tier.minQty} – ${tier.maxQty} ${prod.unit}` : `≥ ${tier.minQty.toLocaleString()} ${prod.unit}`;
                    const savingsPerUnit = prod.basePrice - tier.pricePerUnit;
                    return (
                      <tr
                        key={tIdx}
                        style={{
                          borderBottom: tIdx < prod.tiers.length - 1 ? '1px solid #F1F5F3' : 'none',
                          backgroundColor: isMaxTier ? '#ECFDF5' : 'transparent',
                        }}
                      >
                        <td style={{ padding: '9px 10px', fontFamily: 'var(--font-mono)', fontWeight: isMaxTier ? 800 : 600, color: isMaxTier ? '#047857' : '#172B24' }}>
                          {qtyLabel}
                        </td>
                        <td style={{ padding: '9px 10px', fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.88rem', color: isMaxTier ? '#047857' : '#172B24' }}>
                          ₹{tier.pricePerUnit.toFixed(2)}
                        </td>
                        <td style={{ padding: '9px 10px' }}>
                          <span
                            style={{
                              backgroundColor: tier.discountPercent > 0 ? (isMaxTier ? '#047857' : '#EFF6FF') : '#F1F5F3',
                              color: tier.discountPercent > 0 ? (isMaxTier ? '#FFFFFF' : '#2563EB') : '#64748B',
                              borderRadius: '4px',
                              padding: '2px 8px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              fontFamily: 'var(--font-mono)',
                            }}
                          >
                            {tier.discountPercent > 0 ? `${tier.discountPercent.toFixed(1)}% OFF` : 'Base Tier'}
                          </span>
                        </td>
                        <td style={{ padding: '9px 10px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600, color: savingsPerUnit > 0 ? '#16A34A' : '#94A3B8' }}>
                          {savingsPerUnit > 0 ? `Save ₹${savingsPerUnit.toFixed(2)} / ${prod.unit}` : 'Standard'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Slabs Modal */}
      {editModalOpen && formProduct && (
        <div className="modal-overlay">
          <div className="modal-content fade-in" style={{ maxWidth: '640px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#172B24' }}>Configure Wholesale Pricing Tiers</h2>
                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                  {formProduct.name} ({formProduct.sku})
                </div>
              </div>
              <button onClick={() => setEditModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveModal} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Product Metadata Bar */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8E5' }}>
                <div>
                  <label className="label" style={{ fontSize: '0.7rem' }}>Base Price (₹ / {formProduct.unit})</label>
                  <input
                    type="number"
                    step="0.5"
                    className="input"
                    value={formProduct.basePrice}
                    onChange={(e) => setFormProduct({ ...formProduct, basePrice: parseFloat(e.target.value) || 0 })}
                    style={{ fontSize: '0.85rem', fontWeight: 700 }}
                  />
                </div>
                <div>
                  <label className="label" style={{ fontSize: '0.7rem' }}>Packaging Mode</label>
                  <input
                    type="text"
                    className="input"
                    value={formProduct.packaging}
                    onChange={(e) => setFormProduct({ ...formProduct, packaging: e.target.value })}
                    style={{ fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label className="label" style={{ fontSize: '0.7rem' }}>Target Customer Segment</label>
                  <input
                    type="text"
                    className="input"
                    value={formProduct.customerSegment}
                    onChange={(e) => setFormProduct({ ...formProduct, customerSegment: e.target.value })}
                    style={{ fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              {/* Tiers List in Modal */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="label" style={{ margin: 0, fontWeight: 800 }}>Quantity Slabs & Pricing Rules</label>
                  <button
                    type="button"
                    onClick={handleAddTier}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.72rem', padding: '4px 10px' }}
                  >
                    <Plus size={13} />
                    <span>Add Slab</span>
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {formProduct.tiers.map((tier, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1.2fr 1fr 1fr 32px',
                        gap: '8px',
                        alignItems: 'center',
                        padding: '10px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8E5',
                        borderRadius: '8px',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 600, marginBottom: '2px' }}>Quantity Range ({formProduct.unit})</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <input
                            type="number"
                            className="input"
                            value={tier.minQty}
                            onChange={(e) => handleTierChange(idx, 'minQty', parseInt(e.target.value) || 0)}
                            style={{ padding: '4px 8px', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}
                          />
                          <span>–</span>
                          <input
                            type="text"
                            placeholder="+"
                            className="input"
                            value={tier.maxQty !== null ? tier.maxQty : ''}
                            onChange={(e) => handleTierChange(idx, 'maxQty', e.target.value ? parseInt(e.target.value) : null)}
                            style={{ padding: '4px 8px', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}
                          />
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 600, marginBottom: '2px' }}>Price (₹ / {formProduct.unit})</div>
                        <input
                          type="number"
                          step="0.25"
                          className="input"
                          value={tier.pricePerUnit}
                          onChange={(e) => handleTierChange(idx, 'pricePerUnit', e.target.value)}
                          style={{ padding: '4px 8px', fontSize: '0.8rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}
                        />
                      </div>

                      <div>
                        <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 600, marginBottom: '2px' }}>Discount %</div>
                        <input
                          type="number"
                          step="0.1"
                          className="input"
                          value={tier.discountPercent}
                          onChange={(e) => handleTierChange(idx, 'discountPercent', e.target.value)}
                          style={{ padding: '4px 8px', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveTier(idx)}
                        disabled={formProduct.tiers.length <= 1}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: formProduct.tiers.length <= 1 ? '#CBD5E1' : '#DC2626',
                          cursor: formProduct.tiers.length <= 1 ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '4px',
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #E2E8E5' }}>
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.82rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ fontSize: '0.82rem' }}
                >
                  <CheckCircle size={15} />
                  <span>Save & Publish Tiers</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

