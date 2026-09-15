import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getDocsMock, addDocMock, updateDocMock, deleteDocMock, collectionMock, docMock, queryMock, orderByMock, serverTimestampMock, getFirestoreMock } = vi.hoisted(() => ({
  getDocsMock: vi.fn(),
  addDocMock: vi.fn(),
  updateDocMock: vi.fn(),
  deleteDocMock: vi.fn(),
  collectionMock: vi.fn((...parts: string[]) => parts.join('/')),
  docMock: vi.fn((...parts: string[]) => parts.join('/')),
  queryMock: vi.fn((...parts: unknown[]) => parts),
  orderByMock: vi.fn((field: string) => field),
  serverTimestampMock: vi.fn(() => 'timestamp'),
  getFirestoreMock: vi.fn(() => ({ name: 'database' })),
}))

vi.mock('firebase/firestore', () => ({ addDoc: addDocMock, collection: collectionMock, deleteDoc: deleteDocMock, doc: docMock, getDocs: getDocsMock, getFirestore: getFirestoreMock, orderBy: orderByMock, query: queryMock, serverTimestamp: serverTimestampMock, updateDoc: updateDocMock }))
vi.mock('../../lib/firebase', () => ({ firebaseApp: { name: 'app' }, isFirebaseConfigured: true }))

import { createCategory, deleteCategory, getCategories, updateCategory } from '../../services/categoryService'

describe('categoryService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('maps Firestore category documents', async () => {
    getDocsMock.mockResolvedValue({ docs: [{ id: 'audio', data: () => ({ name: 'Audio', active: true }) }] })
    await expect(getCategories()).resolves.toEqual([{ id: 'audio', name: 'Audio', active: true }])
  })

  it('creates and updates normalized category data', async () => {
    addDocMock.mockResolvedValue({ id: 'new-category' })
    await createCategory('  Audio  ')
    await updateCategory('audio', '  Audio Pro  ', false)
    expect(addDocMock).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ name: 'Audio', slug: 'audio' }))
    expect(updateDocMock).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ name: 'Audio Pro', slug: 'audio-pro', active: false }))
  })

  it('rejects empty names and deletes categories', async () => {
    await expect(createCategory(' ')).rejects.toThrow('Category name is required')
    await expect(updateCategory('id', ' ' , true)).rejects.toThrow('Category name is required')
    await deleteCategory('audio')
    expect(deleteDocMock).toHaveBeenCalled()
  })
})
