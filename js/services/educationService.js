/**
 * EducationService - 교육 콘텐츠 서비스
 * EDUCATION_DATA를 사용하여 교육 콘텐츠 조회, 완료 표시, 진행률 추적 기능 제공
 */

const EducationService = (() => {
  /**
   * 카테고리별 교육 콘텐츠 필터링
   * @param {string} category - 카테고리 ('all', 'posture', 'leash', 'safety' 또는 빈 문자열)
   * @returns {EducationContent[]} 필터링된 콘텐츠 목록
   */
  function getByCategory(category) {
    if (!category || category === 'all') {
      return EDUCATION_DATA;
    }
    return EDUCATION_DATA.filter(item => item.category === category);
  }

  /**
   * ID로 교육 콘텐츠 상세 조회
   * @param {string} id - 콘텐츠 ID
   * @returns {EducationContent|null} 콘텐츠 객체 또는 null
   */
  function getById(id) {
    const content = EDUCATION_DATA.find(item => item.id === id);
    return content || null;
  }

  /**
   * 교육 콘텐츠 완료 표시
   * @param {string} userId - 사용자 ID
   * @param {string} contentId - 콘텐츠 ID
   */
  function markComplete(userId, contentId) {
    const key = 'education_progress_' + userId;
    const completedIds = StorageService.get(key, []);
    if (!completedIds.includes(contentId)) {
      completedIds.push(contentId);
      StorageService.set(key, completedIds);
    }
  }

  /**
   * 사용자의 교육 진행률 조회
   * @param {string} userId - 사용자 ID
   * @returns {ProgressInfo} 진행률 정보 { total, completed, ratio, completedIds }
   */
  function getProgress(userId) {
    const key = 'education_progress_' + userId;
    const completedIds = StorageService.get(key, []);
    const total = EDUCATION_DATA.length;
    const completed = completedIds.length;
    const ratio = total > 0 ? completed / total : 0;
    return {
      total,
      completed,
      ratio,
      completedIds
    };
  }

  return {
    getByCategory,
    getById,
    markComplete,
    getProgress
  };
})();
