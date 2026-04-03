/**
 * WalletService - Paw 코인 지갑 서비스
 * StorageService를 사용하여 코인 잔액 조회, 적립, 사용, 거래 내역 관리
 */

const WalletService = (() => {
  const TRANSACTIONS_KEY = 'transactions';

  /**
   * 모든 거래 내역 조회
   * @returns {Transaction[]}
   */
  function getAllTransactions() {
    return StorageService.get(TRANSACTIONS_KEY, []);
  }

  /**
   * 거래 내역 저장
   * @param {Transaction[]} transactions
   */
  function saveTransactions(transactions) {
    StorageService.set(TRANSACTIONS_KEY, transactions);
  }

  /**
   * 사용자 잔액 조회
   * @param {string} userId
   * @returns {number}
   */
  function getBalance(userId) {
    const user = findUser(userId);
    return user ? (user.pawCoins || 0) : 0;
  }

  /**
   * 사용자 거래 내역 조회 (최신순 정렬)
   * @param {string} userId
   * @returns {Transaction[]}
   */
  function getTransactions(userId) {
    const all = getAllTransactions();
    return all
      .filter(tx => tx.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  /**
   * 코인 적립
   * @param {string} userId
   * @param {number} amount - 적립 금액 (양수)
   * @param {string} reason - 적립 사유
   * @returns {Transaction}
   */
  function earnCoins(userId, amount, reason) {
    const currentBalance = getBalance(userId);
    const newBalance = currentBalance + amount;

    // 사용자 잔액 업데이트
    updateUserBalance(userId, newBalance);

    // 거래 기록 생성
    const transaction = {
      id: StorageService.generateId(),
      userId: userId,
      type: 'earn',
      amount: amount,
      reason: reason,
      createdAt: StorageService.now(),
      balanceAfter: newBalance
    };

    const transactions = getAllTransactions();
    transactions.push(transaction);
    saveTransactions(transactions);

    return transaction;
  }

  /**
   * 코인 사용
   * @param {string} userId
   * @param {number} amount - 사용 금액 (양수)
   * @param {string} reason - 사용 사유
   * @returns {Transaction|null} 잔액 부족 시 null 반환
   */
  function spendCoins(userId, amount, reason) {
    const currentBalance = getBalance(userId);

    if (currentBalance < amount) {
      return null;
    }

    const newBalance = currentBalance - amount;

    // 사용자 잔액 업데이트
    updateUserBalance(userId, newBalance);

    // 거래 기록 생성
    const transaction = {
      id: StorageService.generateId(),
      userId: userId,
      type: 'spend',
      amount: amount,
      reason: reason,
      createdAt: StorageService.now(),
      balanceAfter: newBalance
    };

    const transactions = getAllTransactions();
    transactions.push(transaction);
    saveTransactions(transactions);

    return transaction;
  }

  /**
   * 사용자 잔액 업데이트 (users 목록 + currentUser 모두 갱신)
   * @param {string} userId
   * @param {number} newBalance
   */
  function updateUserBalance(userId, newBalance) {
    // users 목록에서 업데이트
    const users = StorageService.get('users', []);
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index].pawCoins = newBalance;
      StorageService.set('users', users);
    }

    // currentUser도 업데이트
    const currentUser = StorageService.get('currentUser', null);
    if (currentUser && currentUser.id === userId) {
      currentUser.pawCoins = newBalance;
      StorageService.set('currentUser', currentUser);
    }
  }

  /**
   * users 목록에서 사용자 찾기
   * @param {string} userId
   * @returns {User|null}
   */
  function findUser(userId) {
    const users = StorageService.get('users', []);
    return users.find(u => u.id === userId) || null;
  }

  return {
    getBalance,
    getTransactions,
    earnCoins,
    spendCoins
  };
})();
