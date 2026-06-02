import { create } from 'zustand'

export type NotificationType = 'xp' | 'levelup' | 'achievement' | 'info' | 'error'

export interface Notification {
  id: string
  type: NotificationType
  message: string
  amount?: number
}

interface UIState {
  activeModal: string | null
  notifications: Notification[]
  isLoadingCampaign: boolean
  openModal: (id: string) => void
  closeModal: () => void
  pushNotification: (n: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  setLoadingCampaign: (v: boolean) => void
}

export const useUIStore = create<UIState>()((set) => ({
  activeModal: null,
  notifications: [],
  isLoadingCampaign: false,

  openModal: (id) => set({ activeModal: id }),
  closeModal: () => set({ activeModal: null }),

  pushNotification: (n) => {
    const id = Math.random().toString(36).slice(2)
    set((s) => ({ notifications: [...s.notifications, { ...n, id }] }))
    setTimeout(() => set((s) => ({ notifications: s.notifications.filter((x) => x.id !== id) })), 3500)
  },

  removeNotification: (id) =>
    set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),

  setLoadingCampaign: (v) => set({ isLoadingCampaign: v }),
}))
