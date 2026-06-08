import React, { createContext, useContext, useState } from 'react'

export const regionsList = [
  { id: 'national', name: 'Visión Nacional' },
  { id: 'los_andes', name: 'Región Los Andes' },
  { id: 'llanos', name: 'Región Llanos' },
  { id: 'eje', name: 'Eje: Zulia-Lara-Falcón' },
  { id: 'central', name: 'Región Central' },
  { id: 'amazonica', name: 'Región Amazónica' },
  { id: 'insular', name: 'Región Insular' },
  { id: 'oriental', name: 'Región Oriental' },
]

const RegionContext = createContext()

export function RegionProvider({ children, initialRegion = 'national', initialRole = 'superadmin', assignedRegion = 'los_andes' }) {
  const [regionId, setRegionId] = useState(initialRegion === 'regional' ? assignedRegion : initialRegion)
  const [role, setRole] = useState(initialRole) // 'superadmin' | 'regional'

  const region = regionsList.find(r => r.id === regionId) || regionsList[0]

  const value = {
    regions: regionsList,
    regionId,
    regionName: region.name,
    setRegionId,
    role,
    setRole,
  }

  return <RegionContext.Provider value={value}>{children}</RegionContext.Provider>
}

export function useRegion() {
  const ctx = useContext(RegionContext)
  if (!ctx) throw new Error('useRegion must be used within RegionProvider')
  return ctx
}

export default RegionContext
