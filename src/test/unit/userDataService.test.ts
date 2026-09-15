import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getDocMock, setDocMock, docMock, getFirestoreMock } = vi.hoisted(() => ({
  getDocMock: vi.fn(),
  setDocMock: vi.fn(),
  docMock: vi.fn((...parts: string[]) => parts.join('/')),
  getFirestoreMock: vi.fn(() => ({ name: 'database' })),
}))

vi.mock('firebase/firestore', () => ({ doc: docMock, getDoc: getDocMock, getFirestore: getFirestoreMock, setDoc: setDocMock }))
vi.mock('../../lib/firebase', () => ({ firebaseApp: { name: 'app' }, isFirebaseConfigured: true }))

import { getCloudCart, getCloudFavorites, saveCloudCart, saveCloudFavorites } from '../../services/userDataService'

describe('userDataService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('reads cart items from the user document', async () => {
    getDocMock.mockResolvedValue({ data: () => ({ items: [{ productId: 'p1', quantity: 2 }] }) })

    await expect(getCloudCart('user-1')).resolves.toEqual([{ productId: 'p1', quantity: 2 }])
    expect(docMock).toHaveBeenCalledWith(expect.anything(), 'carts', 'user-1')
  })

  it('returns null when cloud cart has no items', async () => {
    getDocMock.mockResolvedValue({ data: () => ({}) })
    await expect(getCloudCart('user-1')).resolves.toBeNull()
  })

  it('filters favorite ids and saves user data with merge', async () => {
    getDocMock.mockResolvedValue({ data: () => ({ productIds: ['p1', 4, 'p2'] }) })
    await expect(getCloudFavorites('user-1')).resolves.toEqual(['p1', 'p2'])

    await saveCloudCart('user-1', [])
    await saveCloudFavorites('user-1', ['p1'])
    expect(setDocMock).toHaveBeenCalledTimes(2)
    expect(setDocMock).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ userId: 'user-1' }), { merge: true })
  })
})
