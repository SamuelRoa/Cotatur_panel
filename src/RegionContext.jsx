import { createContext, useContext, useEffect, useState } from 'react'
import api from './services/api'

const nationalOption = { id: null, name: 'Visión Nacional' }

const RegionContext = createContext()

export function RegionProvider({ children, initialRole = 'superadmin' }) {
  const [regions, setRegions] = useState([nationalOption])
  const [regionId, setRegionId] = useState(null)
  const [role, setRole] = useState(initialRole)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/geo/regiones')
      .then((res) => {
        const data = res.data || res
        const apiRegions = data.map((r) => ({
          id: r.REGI_COD,
          name: r.REGI_NOM,
        }))
        setRegions([nationalOption, ...apiRegions])
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  const region = regions.find((r) => r.id === regionId) || regions[0]

  const value = {
    regions,
    regionId,
    regionName: region?.name || 'Visión Nacional',
    setRegionId,
    role,
    setRole,
    loading,
  }

  return <RegionContext.Provider value={value}>{children}</RegionContext.Provider>
}

export function useRegion() {
  const ctx = useContext(RegionContext)
  if (!ctx) throw new Error('useRegion must be used within RegionProvider')
  return ctx
}

export default RegionContext
