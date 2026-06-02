import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchDealersFromDB, addDealerToDB, updateDealerInDB, deleteDealerFromDB, db } from './firebase';
import { getDocs, addDoc, updateDoc, deleteDoc, doc, collection, writeBatch } from 'firebase/firestore';

// Mock Firebase functions
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
  getApps: vi.fn(() => []),
  getApp: vi.fn(),
}));

vi.mock('firebase/analytics', () => ({
  getAnalytics: vi.fn(),
}));

vi.mock('firebase/firestore', () => {
  const dummyDocRef = { id: 'mock-doc-id' };
  
  const mockBatch = {
    set: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    commit: vi.fn(),
  };
  mockBatch.set.mockReturnValue(mockBatch);
  mockBatch.update.mockReturnValue(mockBatch);
  mockBatch.delete.mockReturnValue(mockBatch);

  return {
    getFirestore: vi.fn(() => ({})), // Mock db object
    collection: vi.fn(),
    doc: vi.fn(() => dummyDocRef),
    getDocs: vi.fn(),
    addDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    writeBatch: vi.fn(() => mockBatch),
  };
});

describe('Firebase Services (Mocked)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchDealersFromDB should return array of dealers', async () => {
    // Setup mock return value for getDocs
    const mockSnapshot = {
      docs: [
        { id: '1', data: () => ({ name: 'Dealer A', status: 'Đã bán' }) },
        { id: '2', data: () => ({ name: 'Dealer B', status: 'Chưa bán' }) }
      ]
    };
    getDocs.mockResolvedValueOnce(mockSnapshot);

    const result = await fetchDealersFromDB();

    expect(collection).toHaveBeenCalledWith(db, "dealers");
    expect(getDocs).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ id: '1', name: 'Dealer A', status: 'Đã bán' });
    expect(result[1]).toEqual({ id: '2', name: 'Dealer B', status: 'Chưa bán' });
  });

  it('addDealerToDB should call writeBatch set and commit', async () => {
    const newDealerData = { name: 'New Dealer', status: 'Đã bán' };
    
    const result = await addDealerToDB(newDealerData);

    expect(collection).toHaveBeenCalledWith(db, "dealers");
    const batch = writeBatch();
    expect(batch.set).toHaveBeenCalled();
    expect(batch.commit).toHaveBeenCalled();
  });

  it('updateDealerInDB should call writeBatch update correctly', async () => {
    const dealerId = 'dealer-id-123';
    const updatedData = { name: 'Updated Name', status: 'Chưa bán' };

    await updateDealerInDB(dealerId, updatedData);

    expect(doc).toHaveBeenCalledWith(db, "dealers", dealerId);
    const batch = writeBatch();
    expect(batch.update).toHaveBeenCalledWith({ id: 'mock-doc-id' }, updatedData);
    expect(batch.commit).toHaveBeenCalled();
  });

  it('deleteDealerFromDB should call writeBatch delete correctly', async () => {
    const dealerId = 'dealer-id-123';
    
    await deleteDealerFromDB(dealerId);

    expect(doc).toHaveBeenCalledWith(db, "dealers", dealerId);
    const batch = writeBatch();
    expect(batch.delete).toHaveBeenCalledWith({ id: 'mock-doc-id' });
    expect(batch.commit).toHaveBeenCalled();
  });
});
