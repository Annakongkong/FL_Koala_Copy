import { create } from 'zustand'

interface PersonState {
  firstName: string
  lastName: string
}

interface Action {
  updateFirstName: (firstName: PersonState['firstName']) => void
  updateLastName: (lastName: PersonState['lastName']) => void
}

// Create your store, which includes both state and (optionally) actions
const usePersonStore = create<PersonState & Action>((set) => ({
  firstName: '',
  lastName: '',
  updateFirstName: (firstName) => set(() => ({ firstName: firstName })),
  updateLastName: (lastName) => set(() => ({ lastName: lastName })),
}))

export default usePersonStore