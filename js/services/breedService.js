/**
 * BreedService - 품종 정보 서비스
 * BREEDS_DATA를 사용하여 품종 조회 및 검색 기능 제공
 */

const BreedService = (() => {
  /**
   * 전체 품종 목록 반환
   * @returns {Breed[]}
   */
  function getAll() {
    return BREEDS_DATA;
  }

  /**
   * ID로 품종 상세 조회
   * @param {string} id - 품종 ID
   * @returns {Breed|null} 품종 객체 또는 null
   */
  function getById(id) {
    const breed = BREEDS_DATA.find(b => b.id === id);
    return breed || null;
  }

  /**
   * 키워드로 품종 이름 검색 (대소문자 무시)
   * @param {string} keyword - 검색 키워드
   * @returns {Breed[]} 검색 결과
   */
  function search(keyword) {
    if (!keyword || keyword.trim() === '') {
      return BREEDS_DATA;
    }
    const lowerKeyword = keyword.toLowerCase();
    return BREEDS_DATA.filter(b => b.name.toLowerCase().includes(lowerKeyword));
  }

  return {
    getAll,
    getById,
    search
  };
})();
