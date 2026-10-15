import type {
  UserProfile,
  Quest,
  NatureObject,
  Group,
  GroupMember,
  Achievement,
} from '../types';

// ─── Users ────────────────────────────────────────────────────
export const MOCK_USERS: UserProfile[] = [
  {
    id: 'user-admin-1',
    role: 'admin',
    displayName: 'Администратор',
    email: 'admin@nature-explorer.app',
    avatarUrl: 'https://picsum.photos/seed/admin1/100/100',
  },
  {
    id: 'user-teacher-1',
    role: 'teacher',
    displayName: 'Учитель Иванова А.С.',
    email: 'teacher@school.ru',
    avatarUrl: 'https://picsum.photos/seed/teacher1/100/100',
  },
  {
    id: 'user-teacher-2',
    role: 'teacher',
    displayName: 'Учитель Петров Н.В.',
    email: 'teacher2@school.ru',
    avatarUrl: 'https://picsum.photos/seed/teacher2/100/100',
  },
  {
    id: 'user-student-1',
    role: 'student',
    displayName: 'Маша Смирнова',
    email: 'masha@student.ru',
    avatarUrl: 'https://picsum.photos/seed/student1/100/100',
  },
  {
    id: 'user-student-2',
    role: 'student',
    displayName: 'Петя Козлов',
    email: 'petya@student.ru',
    avatarUrl: 'https://picsum.photos/seed/student2/100/100',
  },
  {
    id: 'user-student-3',
    role: 'student',
    displayName: 'Аня Фролова',
    email: 'anya@student.ru',
    avatarUrl: 'https://picsum.photos/seed/student3/100/100',
  },
];

// ─── Quests ───────────────────────────────────────────────────
export const MOCK_QUESTS: Quest[] = [
  {
    id: 'quest-1',
    title: 'Деревья нашего парка',
    description:
      'Изучи разнообразие деревьев в городском парке. Найди дуб, берёзу, клён и другие виды.',
    createdBy: 'user-admin-1',
    objectCount: 4,
  },
  {
    id: 'quest-2',
    title: 'Птицы у реки',
    description:
      'Отправься на берег реки и обнаружь различные виды птиц: уток, цапель и зимородков.',
    createdBy: 'user-admin-1',
    objectCount: 2,
  },
];

// ─── Nature Objects ───────────────────────────────────────────
// Coordinates around Moscow's Gorky Park area as an example
export const MOCK_OBJECTS: NatureObject[] = [
  {
    id: 'obj-1',
    questId: 'quest-1',
    title: 'Дуб черешчатый',
    category: 'Дерево',
    shortDescription:
      'Могучий дуб возрастом более 200 лет. Один из старейших деревьев парка.',
    richDescription: `<h3>Описание</h3>
<p><strong>Quercus robur</strong> — листопадное дерево семейства буковых. Достигает высоты 30–40 метров и диаметра ствола до 1,5 метров.</p>
<h3>Интересные факты</h3>
<ul>
  <li>Желуди дуба — любимое лакомство белок и кабанов</li>
  <li>Древесина дуба одна из самых прочных среди лиственных пород</li>
  <li>Дуб может прожить более 1000 лет</li>
</ul>`,
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    externalLinks: [
      { label: 'Дуб на Википедии', url: 'https://ru.wikipedia.org/wiki/Дуб_черешчатый' },
    ],
    lat: 55.7307,
    lng: 37.5997,
    radiusMeters: 15,
    photos: [
      { id: 'p1', objectId: 'obj-1', url: 'https://picsum.photos/seed/oak1/800/600', order: 0 },
      { id: 'p2', objectId: 'obj-1', url: 'https://picsum.photos/seed/oak2/800/600', order: 1 },
    ],
  },
  {
    id: 'obj-2',
    questId: 'quest-1',
    title: 'Берёза повислая',
    category: 'Дерево',
    shortDescription:
      'Стройная белоствольная берёза — символ России. Узнаваема по характерной белой коре.',
    richDescription: `<h3>Описание</h3>
<p><strong>Betula pendula</strong> — листопадное дерево высотой до 25 метров с характерной белой корой — берёстой.</p>
<h3>Применение</h3>
<p>Берёзовый сок, почки и листья используются в народной медицине. Древесина применяется для производства мебели и фанеры.</p>`,
    externalLinks: [
      { label: 'Берёза на Википедии', url: 'https://ru.wikipedia.org/wiki/Берёза_повислая' },
    ],
    lat: 55.7320,
    lng: 37.6010,
    radiusMeters: 10,
    photos: [
      { id: 'p3', objectId: 'obj-2', url: 'https://picsum.photos/seed/birch1/800/600', order: 0 },
      { id: 'p4', objectId: 'obj-2', url: 'https://picsum.photos/seed/birch2/800/600', order: 1 },
    ],
  },
  {
    id: 'obj-3',
    questId: 'quest-1',
    title: 'Клён остролистный',
    category: 'Дерево',
    shortDescription:
      'Клён с характерными пятилопастными листьями. Осенью окрашивается в огненно-красный цвет.',
    richDescription: `<h3>Описание</h3>
<p><strong>Acer platanoides</strong> — листопадное дерево высотой до 30 метров. Широко используется в озеленении городов.</p>
<h3>Осенняя окраска</h3>
<p>Листья клёна осенью приобретают жёлтые, оранжевые и красные оттенки, что делает его одним из самых красивых деревьев парка в осенний период.</p>`,
    lat: 55.7295,
    lng: 37.5980,
    radiusMeters: 10,
    photos: [
      { id: 'p5', objectId: 'obj-3', url: 'https://picsum.photos/seed/maple1/800/600', order: 0 },
    ],
  },
  {
    id: 'obj-4',
    questId: 'quest-1',
    title: 'Липа мелколистная',
    category: 'Дерево',
    shortDescription:
      'Липа знаменита своим ароматным цветением в июле. Главный источник нектара для пчёл.',
    richDescription: `<h3>Описание</h3>
<p><strong>Tilia cordata</strong> — листопадное дерево семейства мальвовых. Живёт до 1000 лет.</p>
<h3>Цветение</h3>
<p>В июле липа цветёт мелкими жёлто-белыми цветками с сильным медовым ароматом. Липовый мёд считается одним из лучших сортов.</p>`,
    lat: 55.7315,
    lng: 37.5965,
    radiusMeters: 10,
    photos: [
      { id: 'p6', objectId: 'obj-4', url: 'https://picsum.photos/seed/linden1/800/600', order: 0 },
      { id: 'p7', objectId: 'obj-4', url: 'https://picsum.photos/seed/linden2/800/600', order: 1 },
    ],
  },
  {
    id: 'obj-5',
    questId: 'quest-2',
    title: 'Кряква обыкновенная',
    category: 'Птица',
    shortDescription:
      'Самая распространённая речная утка. Самцов отличает зелёная голова и жёлтый клюв.',
    richDescription: `<h3>Описание</h3>
<p><strong>Anas platyrhynchos</strong> — крупная речная утка длиной 51–62 см. Обитает на водоёмах с медленным течением и богатой растительностью.</p>
<h3>Особенности</h3>
<p>Самец весной имеет красивое брачное оперение: зелёная с металлическим блеском голова, белый ошейник. Самка — бурая с тёмными пестринами.</p>`,
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    lat: 55.7290,
    lng: 37.5955,
    radiusMeters: 20,
    photos: [
      { id: 'p8', objectId: 'obj-5', url: 'https://picsum.photos/seed/duck1/800/600', order: 0 },
      { id: 'p9', objectId: 'obj-5', url: 'https://picsum.photos/seed/duck2/800/600', order: 1 },
    ],
  },
  {
    id: 'obj-6',
    questId: 'quest-2',
    title: 'Серая цапля',
    category: 'Птица',
    shortDescription:
      'Крупная хищная птица, застывающая в неподвижности у воды в ожидании рыбы.',
    richDescription: `<h3>Описание</h3>
<p><strong>Ardea cinerea</strong> — крупная птица высотой до 100 см с размахом крыльев до 175 см. Охотится на рыбу, лягушек, мышей.</p>
<h3>Образ жизни</h3>
<p>Цапли терпеливо стоят в воде часами, выжидая добычу. Гнездятся колониями на деревьях вблизи водоёмов.</p>`,
    externalLinks: [
      { label: 'Серая цапля на Википедии', url: 'https://ru.wikipedia.org/wiki/Серая_цапля' },
    ],
    lat: 55.7280,
    lng: 37.5940,
    radiusMeters: 20,
    photos: [
      { id: 'p10', objectId: 'obj-6', url: 'https://picsum.photos/seed/heron1/800/600', order: 0 },
    ],
  },
];

// ─── Groups ───────────────────────────────────────────────────
export const MOCK_GROUPS: Group[] = [
  {
    id: 'group-1',
    questId: 'quest-1',
    teacherId: 'user-teacher-1',
    name: '5А класс — Деревья парка',
    inviteCode: 'NATURE5A',
    activeUntil: '2025-12-31T00:00:00Z',
  },
  {
    id: 'group-2',
    questId: 'quest-2',
    teacherId: 'user-teacher-2',
    name: '6Б класс — Птицы у реки',
    inviteCode: 'BIRDS6B',
  },
];

// ─── Group Members ────────────────────────────────────────────
export const MOCK_GROUP_MEMBERS: GroupMember[] = [
  { groupId: 'group-1', userId: 'user-student-1' },
  { groupId: 'group-1', userId: 'user-student-2' },
  { groupId: 'group-1', userId: 'user-student-3' },
  { groupId: 'group-2', userId: 'user-student-1' },
];

// ─── Achievements ─────────────────────────────────────────────
export const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-1',
    userId: 'user-student-2',
    objectId: 'obj-1',
    groupId: 'group-1',
    achievedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'ach-2',
    userId: 'user-student-2',
    objectId: 'obj-2',
    groupId: 'group-1',
    achievedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
  {
    id: 'ach-3',
    userId: 'user-student-3',
    objectId: 'obj-1',
    groupId: 'group-1',
    achievedAt: new Date(Date.now() - 1800000).toISOString(),
  },
];
