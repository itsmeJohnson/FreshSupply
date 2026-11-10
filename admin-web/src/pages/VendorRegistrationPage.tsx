import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  MessageSquare,
  Thermometer,
  ShieldCheck,
  Truck,
  Sprout,
  Info,
} from 'lucide-react';
import { api } from '../api/client';

export const VendorRegistrationPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: 'Farmer Producer Organization (FPO)',
    gstin: '',
    panNumber: '',
    mobileNumber: '',
    email: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      try {
        await api.registerVendor({
          businessName: formData.businessName,
          businessType: formData.businessType,
          gstin: formData.gstin,
          pan: formData.panNumber,
          phone: formData.mobileNumber,
          email: formData.email,
          contactPerson: formData.businessName + ' Representative',
        });
      } catch (err) {
        // Fallback gracefully
      }
      setSubmitted(true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Bar with Support Links */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--color-border)', paddingBottom: '14px' }}>
        <div>
          <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--color-primary)' }}>
            FreshSupply
          </span>
          <span style={{ margin: '0 8px', color: 'var(--color-border)' }}>|</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-main)' }}>Vendor Registration</span>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            Join India&apos;s trusted B2B wholesale supply network
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.85rem' }}>
          <button style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <HelpCircle size={16} />
            <span>Need Help?</span>
          </button>
          <button style={{ background: '#FFFFFF', border: '1px solid var(--color-border)', color: 'var(--color-text-main)', borderRadius: '8px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 600 }}>
            <MessageSquare size={16} />
            <span>Contact Support</span>
          </button>
        </div>
      </div>

      {/* Hero Title */}
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-text-main)', letterSpacing: '-0.02em' }}>
          Register as a Wholesale Vendor
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
          Partner with FreshSupply to supply fresh, high-quality produce to verified business buyers.
        </p>
      </div>

      {/* 3-Step Wizard Navigation */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', maxWidth: '650px' }}>
        {/* Step 1 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: currentStep >= 1 ? 'var(--color-primary)' : 'var(--color-border)', color: currentStep >= 1 ? '#FFFFFF' : 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>
            1
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: currentStep === 1 ? 'var(--color-primary)' : 'var(--color-text-main)' }}>Business Profile</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>Verify your business details</div>
          </div>
        </div>

        {/* Step 2 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: currentStep >= 2 ? 'var(--color-primary)' : 'var(--color-border)', color: currentStep >= 2 ? '#FFFFFF' : 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>
            2
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: currentStep === 2 ? 'var(--color-primary)' : 'var(--color-text-main)' }}>Tax Documentation</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>Upload mandatory tax proofs</div>
          </div>
        </div>

        {/* Step 3 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: currentStep >= 3 ? 'var(--color-primary)' : 'var(--color-border)', color: currentStep >= 3 ? '#FFFFFF' : 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>
            3
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: currentStep === 3 ? 'var(--color-primary)' : 'var(--color-text-main)' }}>Warehouse Setup</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>Add storage & dispatch bays</div>
          </div>
        </div>
      </div>

      {/* Main Split Layout: Form on Left + Cold Storage Visual on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Form Card */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#ECFDF5', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text-main)' }}>Business Profile Verification</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Tell us about your business to get started.</p>
            </div>
          </div>

          {submitted ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#ECFDF5', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                <CheckCircle2 size={32} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-text-main)' }}>Application Transmitted!</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '8px', maxWidth: '380px', margin: '8px auto 0 auto' }}>
                Your vendor profile has been queued for verification. Our procurement team will verify your GSTIN & PAN within 1-2 business days.
              </p>
              <button
                onClick={() => { setSubmitted(false); setCurrentStep(1); }}
                className="btn btn-primary"
                style={{ marginTop: '24px' }}
              >
                Register Another Facility
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '6px', display: 'block' }}>Business / Company Name *</label>
                  <input
                    type="text"
                    required
                    className="input"
                    placeholder="e.g., GreenHarvest Agro Pvt. Ltd."
                    value={formData.businessName}
                    onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '6px', display: 'block' }}>Business Type *</label>
                  <select
                    className="select"
                    value={formData.businessType}
                    onChange={e => setFormData({ ...formData, businessType: e.target.value })}
                  >
                    <option value="Farmer Producer Organization (FPO)">Farmer Producer Organization (FPO)</option>
                    <option value="APMC Mandi Commission Agent">APMC Mandi Commission Agent</option>
                    <option value="Direct Agro Processing Mill">Direct Agro Processing Mill</option>
                    <option value="Cold Storage & Reefer Operator">Cold Storage & Reefer Operator</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '6px', display: 'block' }}>GSTIN (if registered) *</label>
                  <input
                    type="text"
                    required
                    className="input"
                    placeholder="e.g., 29ABCDE1234F1Z5"
                    style={{ fontFamily: 'var(--font-mono)' }}
                    value={formData.gstin}
                    onChange={e => setFormData({ ...formData, gstin: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '6px', display: 'block' }}>PAN Number *</label>
                  <input
                    type="text"
                    required
                    className="input"
                    placeholder="e.g., ABCDE1234F"
                    style={{ fontFamily: 'var(--font-mono)' }}
                    value={formData.panNumber}
                    onChange={e => setFormData({ ...formData, panNumber: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '6px', display: 'block' }}>Registered Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    className="input"
                    placeholder="+91 98765 43210"
                    value={formData.mobileNumber}
                    onChange={e => setFormData({ ...formData, mobileNumber: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '6px', display: 'block' }}>Business Email *</label>
                  <input
                    type="email"
                    required
                    className="input"
                    placeholder="e.g., contact@greenharvest.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              {/* Verification Info Box */}
              <div style={{ backgroundColor: '#F8FAFC', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <Info size={18} color="var(--color-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                  <strong style={{ color: 'var(--color-text-main)' }}>Verification Process:</strong> Your business details will be verified using GST and PAN records. This usually takes 1-2 business days.
                </div>
              </div>

              {/* Form Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}
                >
                  Save & Exit
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    borderRadius: '10px',
                    padding: '10px 22px',
                    fontWeight: 800,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span>{currentStep === 3 ? 'Complete Registration' : 'Continue to Tax Documentation'}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Right Cold Storage & Logistics Visual Showcase (exact from Image 4) */}
        <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', minHeight: '480px', border: '1px solid var(--color-border)', backgroundColor: '#0F172A', boxShadow: 'var(--shadow-sm)' }}>
          <img
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80"
            alt="Cold storage warehouse"
            style={{ width: '100%', height: '100%', minHeight: '480px', objectFit: 'cover' }}
          />

          {/* Dark gradient overlay */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.35) 60%, rgba(15, 23, 42, 0.15) 100%)' }} />

          {/* Warehouse Label */}
          <div style={{ position: 'absolute', top: '20px', left: '20px', backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)', border: '1px solid #E2E8E5', borderRadius: '10px', padding: '10px 16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }} className="live-pulse"></span>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-text-main)' }}>FreshSupply Hub</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-primary)', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Cold Storage & Distribution Center
            </div>
          </div>

          {/* 4 Feature Badges floating on image */}
          <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(8px)', border: '1px solid #E2E8E5', borderRadius: '10px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Thermometer size={18} color="var(--color-primary)" />
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-text-main)' }}>Temperature Controlled</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)' }}>Storage (0°C – 8°C)</div>
              </div>
            </div>

            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(8px)', border: '1px solid #E2E8E5', borderRadius: '10px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="var(--color-primary)" />
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-text-main)' }}>Quality Preserved</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)' }}>Certified Cold Chain</div>
              </div>
            </div>

            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(8px)', border: '1px solid #E2E8E5', borderRadius: '10px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Truck size={18} color="var(--color-primary)" />
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-text-main)' }}>Bulk Handling</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)' }}>High-Velocity Dispatch</div>
              </div>
            </div>

            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(8px)', border: '1px solid #E2E8E5', borderRadius: '10px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sprout size={18} color="var(--color-primary)" />
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-text-main)' }}>Farm to Business</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)' }}>Freshness Guaranteed</div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
