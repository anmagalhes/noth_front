// src/app/components/novatarefa_producao/Tabs.tsx
import React from 'react';

interface TabProps {
  id: string;
  label: string;
  active: boolean;
  onClick: (id: string) => void;
}

export const Tab: React.FC<TabProps> = ({ id, label, active, onClick }) => (
  <button
    type="button"
    className={`px-4 py-2 rounded-md text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-green-500 transition-all ${
      active
        ? 'bg-green-600 text-white shadow-md'
        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
    }`}
    onClick={() => onClick(id)}
    aria-selected={active}
    role="tab"
    id={`tab-${id}`}
    aria-controls={`tabpanel-${id}`}
  >
    {label}
  </button>
);

interface TabsContainerProps {
  activeTab: string;
  children: React.ReactNode;
}

export const TabsContainer: React.FC<TabsContainerProps> = ({ activeTab, children }) => (
  <div role="tabpanel" aria-labelledby={`tab-${activeTab}`} className="mt-4">
    {children}
  </div>
);

interface TabsProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange }) => (
  <nav aria-label="Navegação de abas" className="flex space-x-2">
    {tabs.map((tab) => (
      <Tab
        key={tab.id}
        id={tab.id}
        label={tab.label}
        active={activeTab === tab.id}
        onClick={onTabChange}
      />
    ))}
  </nav>
);
