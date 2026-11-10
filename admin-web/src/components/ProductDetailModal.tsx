import React, { useState } from 'react';
import {
  X,
  Award,
  ShieldCheck,
  Check,
  Truck,
  Plus,
  Minus,
  ShoppingCart,
  MapPin,
  Maximize2,
  Droplets,
  Calendar,
  ArrowLeft,
  Package,
} from 'lucide-react';

interface ProductDetailModalProps {
  product: any;
  isOpen?: boolean;
  onClose: () => void;
  onAddToCart?: (item: any, quantity: number, packaging: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen = true,
  onClose,
  onAddToCart,
}) => {
  const [packagingType, setPackagingType] = useState<'bags' | 'crates'>('bags');
  const [quantity, setQuantity] = useState(10);
  const [addedToast, setAddedToast] = useState(false);

  if (!isOpen || !product) return null;

  const pricePerUnit = packagingType === 'bags' ? 1600 : 700;
  const ratePerKg = packagingType === 'bags' ? '32.00' : '35.00';

  const handleAdd = () => {
    if (onAddToCart) {
      onAddToCart(product, quantity, packagingType);
    }
    setAddedToast(true);
    setTimeout(() => {
      setAddedToast(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 100 }}>
      <div
        className="modal-content fade-in"
        style={{
          maxWidth: '560px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8E5',
          borderRadius: '16px',
          overflow: 'hidden',
          padding: '0',
          maxHeight: '92vh',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        }}
      >
        {/* Top Header with Back / Close */}
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E2E8E5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#172B24',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
              }}
            >
              <ArrowLeft size={18} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#047857' }}>FreshSupply</span>
              <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Wholesale Spec Sheet</span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#F1F5F3',
              border: '1px solid #E2E8E5',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748B',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div style={{ overflowY: 'auto', maxHeight: 'calc(92vh - 140px)', padding: '20px' }}>
          
          {/* Macro Image Showcase */}
          <div
            style={{
              position: 'relative',
              height: '230px',
              borderRadius: '12px',
              overflow: 'hidden',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8E5',
            }}
          >
            <img
              src={product.imageUrl || product.image_url || 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80'}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Gold Seal Quality Badge */}
            <div
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.92)',
                backdropFilter: 'blur(6px)',
                border: '1px solid #F59E0B',
                borderRadius: '50%',
                width: '52px',
                height: '52px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#D97706',
                textAlign: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              }}
            >
              <Award size={18} color="#D97706" />
              <span style={{ fontSize: '0.62rem', fontWeight: 800 }}>Grade A</span>
            </div>
          </div>

          {/* Title & Tag */}
          <div style={{ marginTop: '16px' }}>
            <span
              style={{
                backgroundColor: '#ECFDF5',
                color: '#047857',
                border: '1px solid #A7F3D0',
                padding: '3px 10px',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              {product.category || 'Produce'} &gt; {product.name?.split(' ')[0] || 'SKU'}
            </span>

            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#172B24', marginTop: '8px' }}>
              {product.name}
            </h2>
            <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>
              Farm Direct &nbsp;•&nbsp; Uniform Sort &nbsp;•&nbsp; Quality Lab Tested
            </div>
          </div>

          {/* 4 Commodity Spec Chips */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px',
              marginTop: '16px',
            }}
          >
            <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8E5', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
              <MapPin size={16} color="#047857" style={{ margin: '0 auto 4px auto' }} />
              <div style={{ fontSize: '0.65rem', color: '#64748B' }}>Origin</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#172B24' }}>Maharashtra</div>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8E5', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
              <Maximize2 size={16} color="#047857" style={{ margin: '0 auto 4px auto' }} />
              <div style={{ fontSize: '0.65rem', color: '#64748B' }}>Avg. Size</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#172B24' }}>55 – 75 mm</div>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8E5', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
              <Droplets size={16} color="#047857" style={{ margin: '0 auto 4px auto' }} />
              <div style={{ fontSize: '0.65rem', color: '#64748B' }}>Moisture</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#172B24' }}>&le; 12%</div>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8E5', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
              <Calendar size={16} color="#047857" style={{ margin: '0 auto 4px auto' }} />
              <div style={{ fontSize: '0.65rem', color: '#64748B' }}>Shelf Life</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#172B24' }}>30 – 45 days</div>
            </div>
          </div>

          {/* 2-Column QA & Highlights */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
            {/* QA Badges */}
            <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8E5', borderRadius: '12px', padding: '12px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#047857', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <ShieldCheck size={14} />
                <span>Quality Assurance</span>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '6px', padding: '3px 8px', fontSize: '0.7rem', color: '#047857', fontWeight: 700 }}>FSSAI Certified</span>
                <span style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '6px', padding: '3px 8px', fontSize: '0.7rem', color: '#047857', fontWeight: 700 }}>APEDA Tested</span>
                <span style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '6px', padding: '3px 8px', fontSize: '0.7rem', color: '#047857', fontWeight: 700 }}>GAP Compliant</span>
              </div>
            </div>

            {/* Highlights */}
            <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8E5', borderRadius: '12px', padding: '12px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#047857', marginBottom: '8px' }}>
                Product Highlights
              </div>
              <div style={{ fontSize: '0.72rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div>✓ Strict Grade-A optical sorting</div>
                <div>✓ Firm &amp; clean uniform packaging</div>
                <div>✓ Commercial kitchen ready</div>
              </div>
            </div>
          </div>

          {/* Packaging Type Toggle (Bags 50kg vs Crates 20kg) */}
          <div style={{ marginTop: '16px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', marginBottom: '8px' }}>
              Packaging Type Selection
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setPackagingType('bags')}
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: packagingType === 'bags' ? '1px solid #047857' : '1px solid #E2E8E5',
                  backgroundColor: packagingType === 'bags' ? '#ECFDF5' : '#FFFFFF',
                  color: packagingType === 'bags' ? '#047857' : '#475569',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Package size={16} color={packagingType === 'bags' ? '#047857' : '#64748B'} />
                <span>Bags (50 kg)</span>
              </button>
              <button
                type="button"
                onClick={() => setPackagingType('crates')}
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: packagingType === 'crates' ? '1px solid #047857' : '1px solid #E2E8E5',
                  backgroundColor: packagingType === 'crates' ? '#ECFDF5' : '#FFFFFF',
                  color: packagingType === 'crates' ? '#047857' : '#475569',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Package size={16} color={packagingType === 'crates' ? '#047857' : '#64748B'} />
                <span>Crates (20 kg)</span>
              </button>
            </div>
          </div>

          {/* Wholesale Pricing Tier Table */}
          <div style={{ marginTop: '16px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8E5', borderRadius: '12px', padding: '14px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#172B24', marginBottom: '10px' }}>
              Wholesale Slabs <span style={{ color: '#64748B', fontWeight: 500 }}>({packagingType === 'bags' ? 'Bags – 50 kg each' : 'Crates – 20 kg each'})</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8E5', borderRadius: '8px' }}>
                <span style={{ color: '#64748B', fontWeight: 600 }}>1 – 9 {packagingType}</span>
                <span style={{ color: '#172B24', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>₹{pricePerUnit.toLocaleString()}</span>
                <span style={{ color: '#64748B', fontFamily: 'var(--font-mono)' }}>₹{ratePerKg} / kg</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8E5', borderRadius: '8px' }}>
                <span style={{ color: '#64748B', fontWeight: 600 }}>
                  10 – 49 {packagingType} <span style={{ backgroundColor: '#ECFDF5', color: '#047857', fontSize: '0.65rem', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>3% Off</span>
                </span>
                <span style={{ color: '#047857', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>₹{(pricePerUnit * 0.97).toFixed(0)}</span>
                <span style={{ color: '#64748B', fontFamily: 'var(--font-mono)' }}>₹{(Number(ratePerKg) * 0.97).toFixed(2)} / kg</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', backgroundColor: '#ECFDF5', border: '1px solid #047857', borderRadius: '8px' }}>
                <span style={{ color: '#047857', fontWeight: 800 }}>
                  &ge; 50 {packagingType} <span style={{ backgroundColor: '#047857', color: '#FFFFFF', fontSize: '0.65rem', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>6% Off</span>
                </span>
                <span style={{ color: '#047857', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>₹{(pricePerUnit * 0.94).toFixed(0)}</span>
                <span style={{ color: '#047857', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>₹{(Number(ratePerKg) * 0.94).toFixed(2)} / kg</span>
              </div>
            </div>
          </div>

          {/* Stock & Dispatch Indicator */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16A34A', fontWeight: 700 }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#16A34A' }} />
              <span>In Stock ({product.stockQuantity || product.stock_quantity || 1250} {packagingType} available)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B' }}>
              <Truck size={14} color="#047857" />
              <span>Next Day Cold Chain Dispatch*</span>
            </div>
          </div>

        </div>

        {/* Bottom Stepper & CTA Strip */}
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: '#F8FAFC',
            borderTop: '1px solid #E2E8E5',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          {/* Stepper */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8E5',
              borderRadius: '10px',
              padding: '4px',
            }}
          >
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#F1F5F3',
                border: 'none',
                borderRadius: '6px',
                color: '#172B24',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Minus size={14} />
            </button>
            <span
              style={{
                width: '44px',
                textAlign: 'center',
                fontWeight: 800,
                color: '#172B24',
                fontSize: '1rem',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#F1F5F3',
                border: 'none',
                borderRadius: '6px',
                color: '#172B24',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Primary CTA */}
          <button
            onClick={handleAdd}
            style={{
              flex: 1,
              backgroundColor: '#047857',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              padding: '12px 18px',
              fontWeight: 800,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(4, 120, 87, 0.25)',
              transition: 'all 0.15s ease',
            }}
          >
            <ShoppingCart size={18} />
            <span>{addedToast ? '✓ Added to Cart!' : `Add ${quantity} ${packagingType} to Wholesale Cart`}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
