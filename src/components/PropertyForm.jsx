import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  MapPin, 
  Home, 
  FileText, 
  CreditCard, 
  StickyNote,
  ChevronDown,
  Zap
} from 'lucide-react';

const PropertyForm = ({ feature, onUpdate }) => {
  if (!feature) return <div className="p-8 text-center text-gray-500">Select a plot</div>;

  const props = feature.properties;
  const handleChange = (field, value) => onUpdate(props.fid, { [field]: value });

  const Section = ({ title, icon: Icon, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);
    return (
      <div className="border-b border-gray-100 last:border-0">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-lg ${isOpen ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'}`}>
              <Icon size={16} />
            </div>
            <span className="font-bold text-sm tracking-tight">{title}</span>
          </div>
          <ChevronDown size={18} className={`text-gray-300 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 pt-1 space-y-4">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const InputField = ({ label, children }) => (
    <div>
      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</label>
      {children}
    </div>
  );

  return (
    <div className="bg-white">
      {/* Clean Header */}
      <div className="p-5 bg-gray-900 text-white">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="px-1.5 py-0.5 bg-primary rounded text-[9px] font-black uppercase">ID</span>
          <h2 className="text-xl font-black">{props.fid}</h2>
        </div>
        <p className="text-gray-400 text-xs truncate">
          {props.owner_name || 'No Owner Listed'}
        </p>
      </div>

      <div className="flex flex-col">
        <Section title="Basic Info" icon={User}>
          <InputField label="Owner Name">
            <input 
              type="text" 
              className="form-input-premium"
              value={props.owner_name || ''} 
              onChange={(e) => handleChange('owner_name', e.target.value)}
              placeholder="Full Name"
            />
          </InputField>
          <InputField label="Electricity #">
            <input 
              type="text" 
              className="form-input-premium"
              value={props.electricity_no || ''} 
              onChange={(e) => handleChange('electricity_no', e.target.value)}
              placeholder="Service #"
            />
          </InputField>
        </Section>

        <Section title="Land Details" icon={MapPin}>
          <div className="flex gap-3">
            <div className="flex-1">
              <InputField label="Nature">
                <select 
                  className="form-select-premium"
                  value={props.nature_of_land || ''} 
                  onChange={(e) => handleChange('nature_of_land', e.target.value)}
                >
                  <option value="">Select...</option>
                  <option value="Registered">Reg</option>
                  <option value="Public">Pub</option>
                  <option value="Unregistered">Unreg</option>
                  <option value="Disputed">Disp</option>
                </select>
              </InputField>
            </div>
            <div className="flex-1">
              <InputField label="Status">
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
              </InputField>
            </div>
          </div>
        </Section>

        <Section title="Infrastructure" icon={Home}>
          <InputField label="Condition">
            <select 
              className="form-select-premium"
              value={props.house_condition || ''} 
              onChange={(e) => handleChange('house_condition', e.target.value)}
            >
              <option value="N/A">N/A</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Dilapidated">Dilapidated</option>
            </select>
          </InputField>
          <InputField label="Floors">
            <select 
              className="form-select-premium"
              value={props.number_of_floors || 0} 
              onChange={(e) => handleChange('number_of_floors', Number(e.target.value))}
            >
              {[0, 1, 2, 3, '4+'].map(val => (
                <option key={val} value={val}>{val}</option>
              ))}
            </select>
          </InputField>
        </Section>

        <Section title="Mortgage" icon={CreditCard}>
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg mb-2">
            <span className="text-xs font-bold text-gray-700">Active Mortgage?</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={props.is_mortgaged || false}
                onChange={(e) => handleChange('is_mortgaged', e.target.checked)}
              />
              <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
            </label>
          </div>

          <AnimatePresence>
            {props.is_mortgaged && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-3 pt-1"
              >
                <InputField label="Bank Name">
                  <input type="text" className="form-input-premium" value={props.mortgage_bank || ''} onChange={(e) => handleChange('mortgage_bank', e.target.value)} />
                </InputField>
              </motion.div>
            )}
          </AnimatePresence>
        </Section>

        <Section title="Internal Notes" icon={StickyNote} defaultOpen={false}>
          <textarea 
            className="form-textarea-premium min-h-[100px]"
            value={props.surveyor_notes || ''} 
            onChange={(e) => handleChange('surveyor_notes', e.target.value)}
            placeholder="Field notes..."
          />
        </Section>
      </div>
    </div>
  );
};

export default PropertyForm;
