/**
 * CommunityService - SNS 커뮤니티 서비스
 * StorageService를 사용하여 게시물 CRUD, 좋아요, 댓글 기능 제공
 */

const CommunityService = (() => {
  const POSTS_KEY = 'posts';
  const PAGE_SIZE = 10;

  /**
   * 모든 게시물 조회
   * @returns {Post[]}
   */
  function getAllPosts() {
    return StorageService.get(POSTS_KEY, []);
  }

  /**
   * 게시물 목록 저장
   * @param {Post[]} posts
   */
  function savePosts(posts) {
    StorageService.set(POSTS_KEY, posts);
  }

  /**
   * 피드 조회 (최신순 정렬, 페이지네이션)
   * @param {number} page - 페이지 번호 (1부터 시작)
   * @returns {Post[]}
   */
  function getFeed(page) {
    const posts = getAllPosts();
    // createdAt 내림차순 정렬
    posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const pageNum = Math.max(1, page || 1);
    const start = (pageNum - 1) * PAGE_SIZE;
    return posts.slice(start, start + PAGE_SIZE);
  }

  /**
   * 게시물 생성
   * @param {{ authorId: string, authorName: string, text: string }} newPost
   * @returns {Post}
   * @throws {Error} 텍스트가 비어있거나 공백만 있는 경우
   */
  function createPost(newPost) {
    if (!newPost.text || !newPost.text.trim()) {
      throw new Error('게시물 내용을 입력하세요.');
    }

    const post = {
      id: StorageService.generateId(),
      authorId: newPost.authorId,
      authorName: newPost.authorName,
      text: newPost.text.trim(),
      imageUrls: newPost.imageUrls || [],
      likes: 0,
      likedBy: [],
      comments: [],
      createdAt: StorageService.now()
    };

    const posts = getAllPosts();
    posts.push(post);
    savePosts(posts);

    return post;
  }

  /**
   * 좋아요 토글
   * @param {string} postId
   * @param {string} userId
   * @returns {Post}
   * @throws {Error} 게시물을 찾을 수 없는 경우
   */
  function toggleLike(postId, userId) {
    const posts = getAllPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) {
      throw new Error('게시물을 찾을 수 없습니다.');
    }

    const likedIndex = post.likedBy.indexOf(userId);
    if (likedIndex === -1) {
      // 좋아요 추가
      post.likedBy.push(userId);
      post.likes = post.likedBy.length;
    } else {
      // 좋아요 취소
      post.likedBy.splice(likedIndex, 1);
      post.likes = post.likedBy.length;
    }

    savePosts(posts);
    return post;
  }

  /**
   * 댓글 추가
   * @param {string} postId
   * @param {{ authorId: string, authorName: string, text: string }} newComment
   * @returns {Comment}
   * @throws {Error} 게시물을 찾을 수 없거나 댓글이 비어있는 경우
   */
  function addComment(postId, newComment) {
    if (!newComment.text || !newComment.text.trim()) {
      throw new Error('댓글 내용을 입력하세요.');
    }

    const posts = getAllPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) {
      throw new Error('게시물을 찾을 수 없습니다.');
    }

    const comment = {
      id: StorageService.generateId(),
      authorId: newComment.authorId,
      authorName: newComment.authorName,
      text: newComment.text.trim(),
      createdAt: StorageService.now()
    };

    post.comments.push(comment);
    savePosts(posts);

    return comment;
  }

  return {
    getFeed,
    createPost,
    toggleLike,
    addComment
  };
})();
