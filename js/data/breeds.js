/**
 * 품종 목 데이터
 * @type {Breed[]}
 */
const BREEDS_DATA = [
  {
    id: 'breed-001',
    name: '골든 리트리버',
    size: 'large',
    personality: '온순하고 사교적이며 가족 친화적인 성격입니다. 사람을 좋아하고 다른 동물과도 잘 어울립니다.',
    exerciseLevel: 'high',
    cautions: ['고관절 이형성증 주의', '비만 관리 필요', '더운 날씨에 주의'],
    imageUrl: 'https://placedog.net/500/300?id=1'
  },
  {
    id: 'breed-002',
    name: '포메라니안',
    size: 'small',
    personality: '활발하고 호기심이 많으며 주인에게 충성스럽습니다. 경계심이 강해 좋은 경비견이 됩니다.',
    exerciseLevel: 'low',
    cautions: ['슬개골 탈구 주의', '치아 관리 필요', '추위에 강하지만 더위에 약함'],
    imageUrl: 'https://placedog.net/500/300?id=2'
  },
  {
    id: 'breed-003',
    name: '시바 이누',
    size: 'medium',
    personality: '독립적이고 충성스러우며 깔끔한 성격입니다. 낯선 사람에게는 경계심을 보입니다.',
    exerciseLevel: 'medium',
    cautions: ['알레르기 주의', '탈출 본능이 강함', '사회화 훈련 필수'],
    imageUrl: 'https://placedog.net/500/300?id=3'
  },
  {
    id: 'breed-004',
    name: '비숑 프리제',
    size: 'small',
    personality: '쾌활하고 애교가 많으며 사람을 좋아합니다. 알레르기가 적은 저자극성 견종입니다.',
    exerciseLevel: 'medium',
    cautions: ['눈물 자국 관리', '정기적 미용 필요', '분리불안 주의'],
    imageUrl: 'https://placedog.net/500/300?id=4'
  },
  {
    id: 'breed-005',
    name: '래브라도 리트리버',
    size: 'large',
    personality: '친절하고 활동적이며 훈련에 잘 반응합니다. 가족과 함께하는 것을 좋아합니다.',
    exerciseLevel: 'high',
    cautions: ['비만 관리 필수', '관절 건강 주의', '물을 좋아해 수영 시 안전 주의'],
    imageUrl: 'https://placedog.net/500/300?id=5'
  },
  {
    id: 'breed-006',
    name: '말티즈',
    size: 'small',
    personality: '애교가 많고 활발하며 주인에게 매우 충성스럽습니다. 실내 생활에 적합합니다.',
    exerciseLevel: 'low',
    cautions: ['눈물 자국 관리', '치아 건강 주의', '저혈당 주의'],
    imageUrl: 'https://placedog.net/500/300?id=6'
  },
  {
    id: 'breed-007',
    name: '웰시 코기',
    size: 'medium',
    personality: '영리하고 활발하며 목축 본능이 있습니다. 가족에게 충성스럽고 장난기가 많습니다.',
    exerciseLevel: 'high',
    cautions: ['허리 건강 주의 (디스크)', '비만 관리 필요', '과도한 계단 사용 자제'],
    imageUrl: 'https://placedog.net/500/300?id=7'
  },
  {
    id: 'breed-008',
    name: '푸들',
    size: 'medium',
    personality: '매우 영리하고 훈련에 잘 반응합니다. 활동적이며 사교적인 성격입니다.',
    exerciseLevel: 'medium',
    cautions: ['정기적 미용 필수', '귀 감염 주의', '눈 건강 관리'],
    imageUrl: 'https://placedog.net/500/300?id=8'
  },
  {
    id: 'breed-009',
    name: '진돗개',
    size: 'large',
    personality: '충성스럽고 용감하며 주인에게 깊은 유대감을 형성합니다. 독립적인 성격입니다.',
    exerciseLevel: 'high',
    cautions: ['사회화 훈련 필수', '탈출 방지 필요', '낯선 사람에 대한 경계심'],
    imageUrl: 'https://placedog.net/500/300?id=9'
  },
  {
    id: 'breed-010',
    name: '치와와',
    size: 'small',
    personality: '용감하고 자신감이 넘치며 주인에게 매우 충성스럽습니다. 작지만 성격이 강합니다.',
    exerciseLevel: 'low',
    cautions: ['추위에 매우 약함', '슬개골 탈구 주의', '치아 관리 필요'],
    imageUrl: 'https://placedog.net/500/300?id=10'
  }
];
