import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Filter, X, Calendar, Map, LayoutDashboard, TrendingUp, Navigation } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import TimeSlicer from './TimeSlicer';

const Sidebar = ({ isOpen, onClose, filters, onFiltersChange, showFilters = true }) => {
  const location = useLocation();
  const handleTimeChange = (timeRange) => {
    if (onFiltersChange) {
      onFiltersChange({
        ...filters,
        timeRange,
      });
    }
  };

  const handleMapChange = (mapType, value) => {
    if (onFiltersChange) {
      onFiltersChange({
        ...filters,
        [mapType]: value,
      });
    }
  };

  const mapOptions = [
    { value: 'couverture', label: 'Couverture vaccinale' },
    { value: 'hospitalisations', label: 'Hospitalisations' },
    { value: 'urgences', label: 'Urgences' },
    { value: 'pharmacies', label: 'Pharmacies' },
  ];

  const navigationItems = [
    {
      path: '/',
      label: 'Tableau de bord',
      icon: LayoutDashboard,
      gradient: 'from-blue-600 to-blue-700',
    },
    {
      path: '/prediction',
      label: 'Prédictions',
      icon: TrendingUp,
      gradient: 'from-blue-600 to-blue-700',
    },
  ];

  return (
    <>
      {/* Overlay pour mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 bottom-0 w-80 bg-gradient-to-b from-white via-blue-50/30 to-white border-r border-blue-200/50 shadow-xl backdrop-blur-sm z-10 transition-transform duration-300 ease-in-out overflow-y-auto",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-6">
          {/* En-tête */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-blue-200/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg">
                <Navigation className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-blue-800">
                Navigation
              </h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden hover:bg-blue-100 rounded-lg"
              onClick={onClose}
            >
              <X className="h-5 w-5 text-gray-600" />
            </Button>
          </div>

          {/* Menu de navigation */}
          <div className="mb-6 pb-6 border-b border-blue-200/50">
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => {
                      // Fermer la sidebar sur mobile après navigation
                      if (window.innerWidth < 768) {
                        onClose();
                      }
                    }}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                      isActive
                        ? "bg-blue-50 border border-blue-300/50 shadow-md"
                        : "hover:bg-blue-50/50 hover:shadow-sm"
                    )}
                  >
                    <div
                      className={cn(
                        "p-2 rounded-lg transition-all duration-200",
                        isActive
                          ? `bg-gradient-to-br ${item.gradient} shadow-md`
                          : "bg-gray-100 group-hover:bg-blue-100"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 transition-colors",
                          isActive ? "text-white" : "text-gray-600 group-hover:text-blue-600"
                        )}
                      />
                    </div>
                    <span
                      className={cn(
                        "font-medium transition-colors",
                        isActive
                          ? "text-blue-700 font-semibold"
                          : "text-gray-700 group-hover:text-blue-600"
                      )}
                    >
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Section Filtres - Conditionnelle */}
          {showFilters && (
            <>
              <div className="mb-6 pb-4 border-b border-blue-200/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg">
                    <Filter className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-blue-800">
                    Filtres
                  </h3>
                </div>
              </div>

              {/* Contenu de la sidebar */}
              <div className="space-y-6">
            {/* Time Slicer */}
            <div className="p-5 bg-white/80 backdrop-blur-sm rounded-xl border border-blue-200/50 shadow-md hover:shadow-lg transition-shadow">
              <TimeSlicer
                minYear={2016}
                maxYear={2024}
                value={filters?.timeRange || [2016, 2024]}
                onChange={handleTimeChange}
              />
            </div>

            {/* Sélection des cartes */}
            <div className="p-5 bg-white/80 backdrop-blur-sm rounded-xl border border-blue-200/50 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg">
                  <Map className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-blue-800">
                  Cartes
                </h3>
              </div>
              <div className="space-y-5">
                {/* Carte 1 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                    Carte 1
                  </label>
                  <select
                    value={filters?.selectedMap1 || 'couverture'}
                    onChange={(e) => handleMapChange('selectedMap1', e.target.value)}
                    className="w-full px-4 py-2.5 border border-blue-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition-all hover:border-blue-300"
                  >
                    {mapOptions.map((option) => (
                      <option 
                        key={option.value} 
                        value={option.value}
                        disabled={option.value === filters?.selectedMap2}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Carte 2 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                    Carte 2
                  </label>
                  <select
                    value={filters?.selectedMap2 || 'hospitalisations'}
                    onChange={(e) => handleMapChange('selectedMap2', e.target.value)}
                    className="w-full px-4 py-2.5 border border-blue-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition-all hover:border-blue-300"
                  >
                    {mapOptions.map((option) => (
                      <option 
                        key={option.value} 
                        value={option.value}
                        disabled={option.value === filters?.selectedMap1}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

