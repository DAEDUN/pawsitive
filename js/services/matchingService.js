/**
 * MatchingService - 산책 매칭 서비스
 * 역할 기반 매칭: 산책 도우미(walker) / 산책 요청자(requester)
 */

const MatchingService = (() => {
  const MATCH_PROFILES_KEY = 'matchProfiles';
  const MATCH_REQUESTS_KEY = 'matchRequests';
  const WALK_SCHEDULES_KEY = 'walkSchedules';
  const REVIEWS_KEY = 'reviews';

  // --- 프로필(역할) 관리 ---

  /**
   * 모든 매칭 프로필 조회
   * @returns {Object[]}
   */
  function getAllProfiles() {
    return StorageService.get(MATCH_PROFILES_KEY, []);
  }

  /**
   * 매칭 프로필 저장
   * @param {Object[]} profiles
   */
  function saveProfiles(profiles) {
    StorageService.set(MATCH_PROFILES_KEY, profiles);
  }

  /**
   * 내 매칭 프로필 조회
   * @param {string} userId
   * @returns {Object|null}
   */
  function getMyProfile(userId) {
    return getAllProfiles().find(p => p.userId === userId) || null;
  }

  /**
   * 매칭 프로필 등록/수정
   * @param {string} userId
   * @param {{ role: 'walker'|'requester', location: string, preferredTime: string, message: string }} data
   * @returns {Object}
   */
  function registerProfile(userId, data) {
    const profiles = getAllProfiles();
    const index = profiles.findIndex(p => p.userId === userId);

    const users = StorageService.get('users', []);
    const user = users.find(u => u.id === userId);
    const userName = user ? user.name : '알 수 없음';
    const dogSize = (user && user.dogs && user.dogs.length > 0) ? user.dogs[0].size : 'medium';

    const profile = {
      userId,
      userName,
      role: data.role,
      location: data.location,
      dogSize,
      preferredTime: data.preferredTime,
      message: data.message || '',
      rating: 5.0,
      createdAt: StorageService.now()
    };

    if (index !== -1) {
      profiles[index] = { ...profiles[index], ...profile };
    } else {
      profiles.push(profile);
    }

    saveProfiles(profiles);
    return profile;
  }

  /**
   * 매칭 프로필 삭제
   * @param {string} userId
   */
  function removeProfile(userId) {
    const profiles = getAllProfiles().filter(p => p.userId !== userId);
    saveProfiles(profiles);
  }

  /**
   * 추천 프로필 조회 (반대 역할만 표시)
   * @param {string} userId
   * @returns {Object[]}
   */
  function getRecommendations(userId) {
    const myProfile = getMyProfile(userId);
    if (!myProfile) return [];

    const oppositeRole = myProfile.role === 'walker' ? 'requester' : 'walker';
    return getAllProfiles().filter(p => p.userId !== userId && p.role === oppositeRole);
  }

  // --- 요청/일정/리뷰 관리 (기존 유지) ---

  function getAllRequests() {
    return StorageService.get(MATCH_REQUESTS_KEY, []);
  }

  function saveRequests(requests) {
    StorageService.set(MATCH_REQUESTS_KEY, requests);
  }

  function getAllSchedules() {
    return StorageService.get(WALK_SCHEDULES_KEY, []);
  }

  function saveSchedules(schedules) {
    StorageService.set(WALK_SCHEDULES_KEY, schedules);
  }

  function getAllReviews() {
    return StorageService.get(REVIEWS_KEY, []);
  }

  function saveReviews(reviews) {
    StorageService.set(REVIEWS_KEY, reviews);
  }

  /**
   * 매칭 요청 보내기
   */
  function sendRequest(fromId, toId) {
    const requests = getAllRequests();
    const existing = requests.find(
      r => r.fromUserId === fromId && r.toUserId === toId && r.status === 'pending'
    );
    if (existing) return existing;

    const request = {
      id: StorageService.generateId(),
      fromUserId: fromId,
      toUserId: toId,
      status: 'pending',
      createdAt: StorageService.now()
    };

    requests.push(request);
    saveRequests(requests);
    return request;
  }

  /**
   * 매칭 요청 수락 → WalkSchedule 생성
   */
  function acceptRequest(requestId) {
    const requests = getAllRequests();
    const index = requests.findIndex(r => r.id === requestId);
    if (index === -1) return null;

    requests[index].status = 'accepted';
    saveRequests(requests);

    const req = requests[index];
    const schedule = {
      id: StorageService.generateId(),
      matchRequestId: req.id,
      participants: [req.fromUserId, req.toUserId],
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      status: 'scheduled'
    };

    const schedules = getAllSchedules();
    schedules.push(schedule);
    saveSchedules(schedules);
    return schedule;
  }

  function rejectRequest(requestId) {
    const requests = getAllRequests();
    const index = requests.findIndex(r => r.id === requestId);
    if (index === -1) return;
    requests[index].status = 'rejected';
    saveRequests(requests);
  }

  function completeWalk(scheduleId) {
    const schedules = getAllSchedules();
    const index = schedules.findIndex(s => s.id === scheduleId);
    if (index === -1) return;

    schedules[index].status = 'completed';
    saveSchedules(schedules);

    const participants = schedules[index].participants;
    if (typeof WalletService !== 'undefined' && WalletService.earnCoins) {
      participants.forEach(userId => {
        WalletService.earnCoins(userId, 10, '산책 완료 보상');
      });
    }
  }

  function addReview(scheduleId, reviewData) {
    const schedules = getAllSchedules();
    const schedule = schedules.find(s => s.id === scheduleId);
    if (!schedule || schedule.status !== 'completed') return null;

    const review = {
      id: StorageService.generateId(),
      scheduleId,
      reviewerId: reviewData.reviewerId,
      targetId: reviewData.targetId,
      rating: reviewData.rating,
      text: reviewData.text,
      createdAt: StorageService.now()
    };

    const reviews = getAllReviews();
    reviews.push(review);
    saveReviews(reviews);
    recalculateRating(reviewData.targetId);
    return review;
  }

  function recalculateRating(targetId) {
    const reviews = getAllReviews();
    const targetReviews = reviews.filter(r => r.targetId === targetId);
    if (targetReviews.length === 0) return;

    const avgRating = targetReviews.reduce((sum, r) => sum + r.rating, 0) / targetReviews.length;
    const profiles = getAllProfiles();
    const profile = profiles.find(p => p.userId === targetId);
    if (profile) {
      profile.rating = Math.round(avgRating * 10) / 10;
      saveProfiles(profiles);
    }
  }

  function getReceivedRequests(userId) {
    return getAllRequests().filter(r => r.toUserId === userId && r.status === 'pending');
  }

  function getSentRequests(userId) {
    return getAllRequests().filter(r => r.fromUserId === userId);
  }

  function getScheduledWalks(userId) {
    return getAllSchedules().filter(s => s.participants.includes(userId) && s.status === 'scheduled');
  }

  function getCompletedWalks(userId) {
    return getAllSchedules().filter(s => s.participants.includes(userId) && s.status === 'completed');
  }

  function getReviewsForSchedule(scheduleId) {
    return getAllReviews().filter(r => r.scheduleId === scheduleId);
  }

  function getUserName(userId) {
    const profile = getAllProfiles().find(p => p.userId === userId);
    if (profile) return profile.userName;

    const users = StorageService.get('users', []);
    const user = users.find(u => u.id === userId);
    return user ? user.name : '알 수 없음';
  }

  return {
    getMyProfile,
    registerProfile,
    removeProfile,
    getRecommendations,
    sendRequest,
    acceptRequest,
    rejectRequest,
    completeWalk,
    addReview,
    getReceivedRequests,
    getSentRequests,
    getScheduledWalks,
    getCompletedWalks,
    getReviewsForSchedule,
    getUserName
  };
})();
