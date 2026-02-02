import React, { createContext, useContext, useState } from 'react'

import { ChoreCompletedType } from '@/types/chore/completed'
import { ChoreRepeatType } from '@/types/chore/repeat'
import { ChoreSpaceType } from '@/types/chore/space'

type FilterContextType = {
  completedFilter: ChoreCompletedType
  spaceFilter: ChoreSpaceType
  repeatFilter: ChoreRepeatType
  setCompletedFilter: (filter: ChoreCompletedType) => void
  setSpaceFilter: (filter: ChoreSpaceType) => void
  setRepeatFilter: (filter: ChoreRepeatType) => void
}

const FilterContext = createContext<FilterContextType | null>(null)

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [spaceFilter, setSpaceFilter] = useState<ChoreSpaceType>('ALL')
  const [repeatFilter, setRepeatFilter] = useState<ChoreRepeatType>('전체')
  const [completedFilter, setCompletedFilter] = useState<ChoreCompletedType>('ALL')

  return (
    <FilterContext.Provider
      value={{
        completedFilter,
        spaceFilter,
        repeatFilter,
        setCompletedFilter,
        setSpaceFilter,
        setRepeatFilter,
      }}
    >
      {children}
    </FilterContext.Provider>
  )
}

export function useFilter() {
  const context = useContext(FilterContext)
  if (!context) {
    throw new Error('useFilter must be used within FilterProvider')
  }
  return context
}
