import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  MapPin, 
  Home, 
  CreditCard, 
  StickyNote,
  ChevronDown,
  Hash,
  Activity,
  Layers
} from 'lucide-react';

const InputGroup = ({ label, children, fullWidth = true }) => (
  <div className={`input-group ${!fullWidth ? 'is-half' : ''}`}>
    <label className="form-label-premium compact">{label}</label>
    {children}
  </div>
);

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
  const handleChange = (field, value) => onUpdate(props.fid, { [field]: value });

  return (
    <div className="property-form-container compact">
      {/* Ultra Compact ID Bar */}
      <div className="compact-id-bar">
        <div className="badge badge-primary">#{props.fid}</div>
        <div className="compact-owner-info">{props.owner_name || 'Anonymous Owner'}</div>
      </div>

      <div className="form-body custom-scrollbar compact">
        <div className="compact-grid">
          <InputGroup label="Owner Name">
            <input 
              type="text" 
              className="form-input-premium"
              value={props.owner_name || ''} 
              onChange={(e) => handleChange('owner_name', e.target.value)}
              placeholder="Full Name"
            />
          </InputGroup>

          <div className="flex-row gap-3">
            <InputGroup label="Reg Doc / Year" fullWidth={false}>
              <input 
                type="text" 
                className="form-input-premium"
                value={props.reg_doc_no || ''} 
                onChange={(e) => handleChange('reg_doc_no', e.target.value)}
                placeholder="123 / 2024"
              />
            </InputGroup>
            <InputGroup label="Electricity #" fullWidth={false}>
              <input 
                type="text" 
                className="form-input-premium"
                value={props.electricity_no || ''} 
                onChange={(e) => handleChange('electricity_no', e.target.value)}
                placeholder="SC-..."
              />
            </InputGroup>
          </div>

          <div className="flex-row gap-3">
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
          </div>

          <div className="flex-row gap-3">
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
            <InputGroup label="Floors" fullWidth={false}>
              <select 
                className="form-select-premium"
                value={props.number_of_floors || 0} 
                onChange={(e) => handleChange('number_of_floors', Number(e.target.value))}
              >
                {[0, 1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </InputGroup>
          </div>

          <div className={`mortgage-toggle-card compact ${props.is_mortgaged ? 'is-active' : ''}`}>
            <span className="toggle-text">Mortgaged?</span>
            <label className="switch compact">
              <input 
                type="checkbox" 
                checked={props.is_mortgaged || false}
                onChange={(e) => handleChange('is_mortgaged', e.target.checked)}
              />
              <span className="slider round"></span>
            </label>
          </div>

          <AnimatePresence>
            {props.is_mortgaged && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mortgage-details compact"
              >
                <div className="flex-row gap-3">
                  <InputGroup label="Bank Name" fullWidth={false}>
                    <input 
                      type="text" 
                      className="form-input-premium is-white" 
                      value={props.mortgage_bank || ''} 
                      onChange={(e) => handleChange('mortgage_bank', e.target.value)} 
                      placeholder="SBI, etc."
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
              </motion.div>
            )}
          </AnimatePresence>

          <InputGroup label="Notes">
            <textarea 
              className="form-textarea-premium is-muted compact"
              value={props.surveyor_notes || ''} 
              onChange={(e) => handleChange('surveyor_notes', e.target.value)}
              placeholder="Internal notes..."
            />
          </InputGroup>
        </div>
      </div>
    </div>
  );
};

export default PropertyForm;
