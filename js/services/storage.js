/**
 * LocalStorage 유틸리티 서비스
 * LocalStorage 접근 불가 시 인메모리 폴백 처리 포함
 */

const StorageService = (() => {
  // 인메모리 폴백 저장소
  const memoryStore = {};
  let useMemory = false;

  // LocalStorage 사용 가능 여부 확인
  function isLocalStorageAvailable() {
    try {
      const testKey = '__pawsitive_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  // 초기화 시 LocalStorage 가용성 확인
  if (!isLocalStorageAvailable()) {
    useMemory = true;
    console.warn('[Pawsitive] LocalStorage를 사용할 수 없습니다. 인메모리 저장소를 사용합니다.');
  }

  /**
   * 데이터 저장
   * @param {string} key - 저장 키
   * @param {*} value - 저장할 값 (자동 JSON 직렬화)
   * @returns {boolean} 저장 성공 여부
   */
  function set(key, value) {
    const prefixedKey = 'pawsitive_' + key;
    try {
      const serialized = JSON.stringify(value);
      if (useMemory) {
        memoryStore[prefixedKey] = serialized;
      } else {
        localStorage.setItem(prefixedKey, serialized);
      }
      return true;
    } catch (e) {
      console.error('[Pawsitive] 데이터 저장 실패:', e);
      return false;
    }
  }

  /**
   * 데이터 조회
   * @param {string} key - 조회 키
   * @param {*} defaultValue - 기본값 (키가 없을 때)
   * @returns {*} 저장된 값 또는 기본값
   */
  function get(key, defaultValue = null) {
    const prefixedKey = 'pawsitive_' + key;
    try {
      const raw = useMemory
        ? memoryStore[prefixedKey]
        : localStorage.getItem(prefixedKey);
      if (raw === null || raw === undefined) {
        return defaultValue;
      }
      return JSON.parse(raw);
    } catch (e) {
      console.error('[Pawsitive] 데이터 파싱 오류:', e);
      return defaultValue;
    }
  }

  /**
   * 데이터 삭제
   * @param {string} key - 삭제할 키
   * @returns {boolean} 삭제 성공 여부
   */
  function remove(key) {
    const prefixedKey = 'pawsitive_' + key;
    try {
      if (useMemory) {
        delete memoryStore[prefixedKey];
      } else {
        localStorage.removeItem(prefixedKey);
      }
      return true;
    } catch (e) {
      console.error('[Pawsitive] 데이터 삭제 실패:', e);
      return false;
    }
  }

  /**
   * Pawsitive 관련 모든 데이터 삭제
   * @returns {boolean} 성공 여부
   */
  function clear() {
    try {
      if (useMemory) {
        Object.keys(memoryStore).forEach(key => {
          if (key.startsWith('pawsitive_')) {
            delete memoryStore[key];
          }
        });
      } else {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('pawsitive_')) {
            keys.push(key);
          }
        }
        keys.forEach(key => localStorage.removeItem(key));
      }
      return true;
    } catch (e) {
      console.error('[Pawsitive] 데이터 초기화 실패:', e);
      return false;
    }
  }

  /**
   * 인메모리 모드 여부 확인
   * @returns {boolean}
   */
  function isUsingMemory() {
    return useMemory;
  }

  /**
   * UUID 생성 유틸리티
   * @returns {string}
   */
  function generateId() {
    return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9);
  }

  /**
   * 현재 ISO 타임스탬프 반환
   * @returns {string}
   */
  function now() {
    return new Date().toISOString();
  }

  return {
    set,
    get,
    remove,
    clear,
    isUsingMemory,
    generateId,
    now
  };
})();
