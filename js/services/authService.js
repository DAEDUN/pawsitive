/**
 * AuthService - 사용자 인증 서비스
 * StorageService를 사용하여 사용자 등록, 로그인, 프로필 관리 기능 제공
 */

const AuthService = (() => {
  const USERS_KEY = 'users';
  const AUTH_TOKEN_KEY = 'authToken';
  const CURRENT_USER_KEY = 'currentUser';

  /**
   * 간이 비밀번호 해싱 (프론트엔드 전용)
   * @param {string} password
   * @returns {string}
   */
  function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32bit 정수 변환
    }
    return 'hash_' + Math.abs(hash).toString(36);
  }

  /**
   * 모든 사용자 목록 조회
   * @returns {User[]}
   */
  function getUsers() {
    return StorageService.get(USERS_KEY, []);
  }

  /**
   * 사용자 목록 저장
   * @param {User[]} users
   */
  function saveUsers(users) {
    StorageService.set(USERS_KEY, users);
  }

  /**
   * 회원가입
   * @param {{ name: string, email: string, password: string }} data
   * @returns {{ success: boolean, user?: User, error?: string }}
   */
  function register(data) {
    const { name, email, password } = data;

    if (!name || !name.trim()) {
      return { success: false, error: '이름을 입력하세요.' };
    }
    if (!email || !email.trim()) {
      return { success: false, error: '이메일을 입력하세요.' };
    }
    if (!password || password.length < 4) {
      return { success: false, error: '비밀번호는 4자 이상이어야 합니다.' };
    }

    const users = getUsers();
    const exists = users.find(u => u.email === email.trim().toLowerCase());
    if (exists) {
      return { success: false, error: '이미 사용 중인 이메일입니다.' };
    }

    const newUser = {
      id: StorageService.generateId(),
      email: email.trim().toLowerCase(),
      name: name.trim(),
      passwordHash: hashPassword(password),
      dogs: [],
      pawCoins: 0,
      createdAt: StorageService.now()
    };

    users.push(newUser);
    saveUsers(users);

    // 자동 로그인
    const token = createAuthToken(newUser.id);
    setCurrentUser(newUser);

    return { success: true, user: newUser };
  }

  /**
   * 로그인
   * @param {string} email
   * @param {string} password
   * @returns {{ success: boolean, token?: AuthToken, error?: string }}
   */
  function login(email, password) {
    if (!email || !password) {
      return { success: false, error: '이메일과 비밀번호를 입력하세요.' };
    }

    const users = getUsers();
    const user = users.find(u => u.email === email.trim().toLowerCase());
    if (!user) {
      return { success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' };
    }

    if (user.passwordHash !== hashPassword(password)) {
      return { success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' };
    }

    const token = createAuthToken(user.id);
    setCurrentUser(user);

    return { success: true, token: token };
  }

  /**
   * AuthToken 생성
   * @param {string} userId
   * @returns {AuthToken}
   */
  function createAuthToken(userId) {
    const token = {
      token: StorageService.generateId(),
      userId: userId,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
    StorageService.set(AUTH_TOKEN_KEY, token);
    return token;
  }

  /**
   * 현재 사용자 설정
   * @param {User} user
   */
  function setCurrentUser(user) {
    // passwordHash 제외하고 저장
    const safeUser = { ...user };
    delete safeUser.passwordHash;
    StorageService.set(CURRENT_USER_KEY, safeUser);
  }

  /**
   * 현재 로그인된 사용자 조회
   * @returns {User|null}
   */
  function getCurrentUser() {
    const token = StorageService.get(AUTH_TOKEN_KEY);
    if (!token) return null;

    // 토큰 만료 확인
    if (new Date(token.expiresAt) < new Date()) {
      logout();
      return null;
    }

    return StorageService.get(CURRENT_USER_KEY, null);
  }

  /**
   * 사용자 프로필 업데이트
   * @param {string} userId
   * @param {{ name?: string }} data
   * @returns {{ success: boolean, user?: User, error?: string }}
   */
  function updateProfile(userId, data) {
    const users = getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) {
      return { success: false, error: '사용자를 찾을 수 없습니다.' };
    }

    if (data.name) {
      users[index].name = data.name.trim();
    }

    saveUsers(users);
    setCurrentUser(users[index]);

    return { success: true, user: users[index] };
  }

  /**
   * 반려견 등록
   * @param {string} userId
   * @param {{ name: string, breed: string, age: number, size: string }} dogData
   * @returns {{ success: boolean, dog?: Dog, error?: string }}
   */
  function registerDog(userId, dogData) {
    if (!dogData.name || !dogData.name.trim()) {
      return { success: false, error: '반려견 이름을 입력하세요.' };
    }
    if (!dogData.breed) {
      return { success: false, error: '품종을 선택하세요.' };
    }
    if (!dogData.age || dogData.age < 0) {
      return { success: false, error: '올바른 나이를 입력하세요.' };
    }
    if (!dogData.size) {
      return { success: false, error: '크기를 선택하세요.' };
    }

    const users = getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) {
      return { success: false, error: '사용자를 찾을 수 없습니다.' };
    }

    const newDog = {
      id: StorageService.generateId(),
      name: dogData.name.trim(),
      breed: dogData.breed,
      age: Number(dogData.age),
      size: dogData.size
    };

    if (!users[index].dogs) {
      users[index].dogs = [];
    }
    users[index].dogs.push(newDog);

    saveUsers(users);
    setCurrentUser(users[index]);

    return { success: true, dog: newDog };
  }

  /**
   * 로그아웃
   */
  function logout() {
    StorageService.remove(AUTH_TOKEN_KEY);
    StorageService.remove(CURRENT_USER_KEY);
  }

  /**
   * 회원탈퇴
   * @param {string} userId
   * @returns {{ success: boolean, error?: string }}
   */
  function deleteAccount(userId) {
    const users = getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) {
      return { success: false, error: '사용자를 찾을 수 없습니다.' };
    }

    users.splice(index, 1);
    saveUsers(users);
    logout();

    return { success: true };
  }

  return {
    register,
    login,
    getCurrentUser,
    updateProfile,
    registerDog,
    logout,
    deleteAccount,
    hashPassword
  };
})();
