import { afterEach, beforeAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock IndexedDB
class MockIDBDatabase {
  objectStoreNames = { contains: () => false };
  createObjectStore() {
    return {
      createIndex: vi.fn()
    };
  }
  transaction() {
    return {
      objectStore: () => ({
        get: () => ({ onsuccess: null, onerror: null }),
        put: () => ({ onsuccess: null, onerror: null }),
        delete: () => ({ onsuccess: null, onerror: null }),
        openCursor: () => ({ onsuccess: null, onerror: null })
      })
    };
  }
  close() {}
}

class MockIDBOpenDBRequest {
  onsuccess: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;
  onupgradeneeded: ((event: any) => void) | null = null;
  result: any = new MockIDBDatabase();

  constructor() {
    setTimeout(() => {
      if (this.onsuccess) {
        this.onsuccess({ target: { result: this.result } });
      }
    }, 0);
  }
}

beforeAll(() => {
  // Mock IndexedDB
  (global as any).indexedDB = {
    open: () => new MockIDBOpenDBRequest(),
    deleteDatabase: () => new MockIDBOpenDBRequest()
  };

  // Mock Canvas API
  HTMLCanvasElement.prototype.getContext = function(contextId: string) {
    if (contextId === '2d') {
      return {
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 1,
        globalAlpha: 1,
        font: '',
        textAlign: 'start',
        textBaseline: 'alphabetic',
        clearRect: () => {},
        fillRect: () => {},
        strokeRect: () => {},
        beginPath: () => {},
        closePath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        arc: () => {},
        fill: () => {},
        stroke: () => {},
        save: () => {},
        restore: () => {},
        fillText: () => {},
        strokeText: () => {},
        measureText: () => ({ width: 0 }),
      } as any;
    }
    return null;
  };
});

// 每个测试后清理
afterEach(() => {
  cleanup();
});
