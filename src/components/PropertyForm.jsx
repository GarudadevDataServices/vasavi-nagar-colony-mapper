import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Trash2 } from 'lucide-react';

const InputGroup = ({ label, children, fullWidth = true }) => (
  <div className={`input-group ${!fullWidth ? 'is-half' : ''}`}>
    <label className="form-label-premium compact">{label}</label>
    {children}
  </div>
);

export function parseRegDocs(raw) {
  if (!raw || typeof raw !== 'string' || !raw.trim()) {
    return [{ docYear: '', sro: '803' }];
  }
  const parts = raw.split(',').map(s => s.trim()).filter(Boolean);
  if (parts.length === 0) {
    return [{ docYear: '', sro: '803' }];
  }
  return parts.map(part => {
    const lastDash = part.lastIndexOf('-');
    if (lastDash !== -1) {
      const docYear = part.slice(0, lastDash).trim();
      const sro = part.slice(lastDash + 1).trim() || '803';
      return { docYear, sro };
    }
    return { docYear: part, sro: '803' };
  });
}

export function serializeRegDocs(docs) {
  if (!docs || docs.length === 0) return null;
  const valid = docs
    .map(d => {
      const docYear = (d.docYear || '').trim();
      const sro = (d.sro || '803').trim();
      if (!docYear) return null;
      return sro ? `${docYear}-${sro}` : docYear;
    })
    .filter(Boolean);
  return valid.length > 0 ? valid.join(',') : null;
}

const PropertyForm = ({ feature, onUpdate }) => {
  if (!feature) return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <MapPin size={24} />
      </div>
      <p className="empty-state-title">No Plot Selected</p>
    </div>
  );

  const props = feature.properties;
  const handleChange = (field, value) => {
    onUpdate(props.fid, { [field]: value });
  };

  // Multiple registration documents state
  const [regDocs, setRegDocs] = useState(() => parseRegDocs(props.reg_doc_no));

  useEffect(() => {
    setRegDocs(parseRegDocs(props.reg_doc_no));
  }, [props.fid, props.reg_doc_no]);

  const handleAddRegDoc = () => {
    const updated = [...regDocs, { docYear: '', sro: '803' }];
    setRegDocs(updated);
  };

  const handleRemoveRegDoc = (index) => {
    const updated = regDocs.filter((_, i) => i !== index);
    const finalDocs = updated.length > 0 ? updated : [{ docYear: '', sro: '803' }];
    setRegDocs(finalDocs);
    handleChange('reg_doc_no', serializeRegDocs(finalDocs));
  };

  const handleDocYearChange = (index, value) => {
    const updated = regDocs.map((item, i) => {
      if (i !== index) return item;
      if (value.includes('-')) {
        const parts = value.split('-');
        return { 
          docYear: parts[0].trim(), 
          sro: parts[1] && parts[1].trim() ? parts[1].trim() : (item.sro || '803') 
        };
      }
      return { ...item, docYear: value };
    });
    setRegDocs(updated);
    handleChange('reg_doc_no', serializeRegDocs(updated));
  };

  const handleSroChange = (index, value) => {
    const updated = regDocs.map((item, i) => {
      if (i !== index) return item;
      return { ...item, sro: value };
    });
    setRegDocs(updated);
    handleChange('reg_doc_no', serializeRegDocs(updated));
  };

  return (
    <div className="property-form-container compact">
      {/* Clean, Simple Top ID Bar without extra tags */}
      <div className="compact-id-bar">
        <div className="badge badge-primary">#{props.fid}</div>
        <div className="compact-owner-info" title={props.owner_name || 'Anonymous Owner'}>
          {props.owner_name || 'Anonymous Owner'}
        </div>
      </div>

      <div className="form-body custom-scrollbar compact">
        <div className="compact-grid">
          {/* Owner Name */}
          <InputGroup label="Owner Name">
            <input 
              type="text" 
              className="form-input-premium"
              value={props.owner_name || ''} 
              onChange={(e) => handleChange('owner_name', e.target.value)}
              placeholder="Full Name"
            />
          </InputGroup>

          {/* Registration Documents: clean input without outer card shell */}
          <InputGroup label="Registration Doc / Year & SRO">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {regDocs.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input 
                    type="text" 
                    className="form-input-premium" 
                    style={{ flex: 1, minWidth: 0 }}
                    value={item.docYear || ''} 
                    onChange={(e) => handleDocYearChange(idx, e.target.value)} 
                    placeholder="Doc / Year (e.g. 146/1974)"
                  />
                  <span style={{ color: '#94a3b8', fontWeight: 'bold' }}>-</span>
                  <input 
                    type="text" 
                    className="form-input-premium" 
                    style={{ width: '70px', textAlign: 'center', fontWeight: 'bold' }}
                    value={item.sro ?? '803'} 
                    onChange={(e) => handleSroChange(idx, e.target.value)} 
                    placeholder="803"
                    title="SRO Code (default: 803)"
                  />
                  {regDocs.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => handleRemoveRegDoc(idx)}
                      style={{
                        background: '#fee2e2',
                        color: '#ef4444',
                        border: 'none',
                        borderRadius: '8px',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                      title="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleAddRegDoc}
                      style={{
                        background: '#eff6ff',
                        color: '#2563eb',
                        border: '1px solid #bfdbfe',
                        borderRadius: '8px',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                      title="Add another registration document"
                    >
                      <Plus size={18} />
                    </button>
                  )}
                </div>
              ))}

              {regDocs.length > 1 && (
                <button
                  type="button"
                  onClick={handleAddRegDoc}
                  style={{
                    background: 'none',
                    border: '1px dashed #cbd5e1',
                    borderRadius: '8px',
                    padding: '6px',
                    color: '#2563eb',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <Plus size={14} /> Add Another Registration Doc
                </button>
              )}
            </div>
          </InputGroup>

          {/* Electricity # & Land Nature */}
          <div className="flex-row gap-3">
            <InputGroup label="Electricity #" fullWidth={false}>
              <input 
                type="text" 
                className="form-input-premium"
                value={props.electricity_no || ''} 
                onChange={(e) => handleChange('electricity_no', e.target.value)}
                placeholder="SC-..."
              />
            </InputGroup>
            <InputGroup label="Land Nature" fullWidth={false}>
              <select 
                className="form-select-premium"
                value={props.nature_of_land || ''} 
                onChange={(e) => handleChange('nature_of_land', e.target.value)}
              >
                <option value="">Select...</option>
                <option value="Registered">Registered</option>
                <option value="Public">Public</option>
                <option value="Unregistered">Unreg</option>
                <option value="Disputed">Disputed</option>
              </select>
            </InputGroup>
          </div>

          {/* Status & Condition */}
          <div className="flex-row gap-3">
            <InputGroup label="Status" fullWidth={false}>
              <select 
                className="form-select-premium"
                value={props.land_status || ''} 
                onChange={(e) => handleChange('land_status', e.target.value)}
              >
                <option value="">Select...</option>
                <option value="Empty Plot">Empty</option>
                <option value="House">House</option>
                <option value="Commercial">Comm</option>
              </select>
            </InputGroup>
            <InputGroup label="Condition" fullWidth={false}>
              <select 
                className="form-select-premium"
                value={props.house_condition || 'N/A'} 
                onChange={(e) => handleChange('house_condition', e.target.value)}
              >
                <option value="N/A">N/A</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Dilapidated">Poor</option>
              </select>
            </InputGroup>
          </div>

          {/* Floors */}
          <InputGroup label="Floors">
            <select 
              className="form-select-premium"
              value={props.number_of_floors ?? 0} 
              onChange={(e) => handleChange('number_of_floors', Number(e.target.value))}
            >
              {[0, 1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </InputGroup>

          {/* Mortgage Toggle */}
          <div className={`mortgage-toggle-card compact ${props.is_mortgaged ? 'is-active' : ''}`}>
            <span className="toggle-text">Mortgaged Property?</span>
            <label className="switch compact">
              <input 
                type="checkbox" 
                checked={props.is_mortgaged || false}
                onChange={(e) => handleChange('is_mortgaged', e.target.checked)}
              />
              <span className="slider round"></span>
            </label>
          </div>

          {/* Mortgage Details */}
          <AnimatePresence>
            {props.is_mortgaged && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mortgage-details compact"
                style={{ overflow: 'hidden' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div className="flex-row gap-3">
                    <InputGroup label="Mortgage Bank" fullWidth={false}>
                      <input 
                        type="text" 
                        className="form-input-premium is-white" 
                        value={props.mortgage_bank || ''} 
                        onChange={(e) => handleChange('mortgage_bank', e.target.value)} 
                        placeholder="SBI, Piramal, etc."
                      />
                    </InputGroup>
                    <InputGroup label="Mort Doc / Year" fullWidth={false}>
                      <input 
                        type="text" 
                        className="form-input-premium is-white" 
                        value={props.mortgage_doc_no || ''} 
                        onChange={(e) => handleChange('mortgage_doc_no', e.target.value)} 
                        placeholder="456 / 2024"
                      />
                    </InputGroup>
                  </div>

                  <InputGroup label="Mortgage Amount (₹)">
                    <input 
                      type="number" 
                      className="form-input-premium is-white" 
                      value={props.mortgage_amount ?? ''} 
                      onChange={(e) => {
                        const val = e.target.value.trim();
                        handleChange('mortgage_amount', val === '' ? null : Number(val));
                      }} 
                      placeholder="e.g. 526877"
                    />
                  </InputGroup>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* EC Notes & History: Normal Multiline Text Input */}
          <InputGroup label="EC Notes & History">
            <textarea 
              className="form-textarea-premium compact"
              style={{ minHeight: '110px' }}
              value={props.ec_timeline || props.ec_notes || ''} 
              onChange={(e) => handleChange('ec_timeline', e.target.value)}
              placeholder="1. 10-11-2002 : Seller → Buyer (Sale Deed - 123/2002)..."
            />
          </InputGroup>

          {/* Surveyor Notes */}
          <InputGroup label="Surveyor Notes">
            <textarea 
              className="form-textarea-premium is-muted compact"
              value={props.surveyor_notes || ''} 
              onChange={(e) => handleChange('surveyor_notes', e.target.value)}
              placeholder="Ground remarks, observations..."
            />
          </InputGroup>
        </div>
      </div>
    </div>
  );
};

export default PropertyForm;
