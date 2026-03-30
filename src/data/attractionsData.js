// src/data/attractionsData.js — HOTELS & RESTAURANTS DATA

export const hotelsData = [
  {
    id: 1, name: "Rixos Turkistan", type: "Resort", city: "Туркестан", stars: 5, priceTag: "$$$$",
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1200",
    location: "ул. Б. Саттарханова, 25",
    description: "Жемчужина современного Туркестана. Отель сочетает в себе османское великолепие и передовые технологии комфорта. Идеальное место для тех, кто ищет уединение в центре священного города.",
    amenities: ['Wi-Fi', 'Бассейн', 'SPA', 'Ресторан', 'Парковка', 'Бизнес-центр'],
    rooms: [
      { name: 'Deluxe Room', price: '85 000 ₸', icon: 'Bed' },
      { name: 'Junior Suite', price: '120 000 ₸', icon: 'Couch' },
      { name: 'Presidential Suite', price: '450 000 ₸', icon: 'Crown' }
    ],
    gallery: [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800",
      "https://images.unsplash.com/photo-1560662105-57f8ad685a18?q=80&w=800",
      "https://images.unsplash.com/photo-1590490359683-658d3d23f972?q=80&w=800"
    ],
    websiteUrl: "https://www.rixos.com",
    coordinates: { lat: 43.301, lng: 68.272 },
    nearbyAttractions: ['c1', 's1'],
    nearbyRestaurants: [1, 2],
    distance: "500м от Мавзолея Ясави"
  },
  {
    id: 2, name: "Karavan Boutique", type: "Boutique", city: "Туркестан", stars: 4, priceTag: "$$$",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000",
    location: "Этноаул, сектор А",
    description: "Аутентичный бутик-отель, стилизованный под древний караван-сарай. Каждый номер украшен ручной вышивкой и антикварными элементами быта кочевников.",
    amenities: ['Wi-Fi', 'Завтрак', 'Вид на мавзолей', 'Терраса'],
    rooms: [
      { name: 'Nomad Classic', price: '45 000 ₸', icon: 'Tent' },
      { name: 'Silk Road Suite', price: '75 000 ₸', icon: 'Leaf' }
    ],
    gallery: [
      "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=800",
      "https://images.unsplash.com/photo-1551882547-ff43c63fedfe?q=80&w=800"
    ],
    websiteUrl: "https://karavansaray.com",
    coordinates: { lat: 43.298, lng: 68.275 },
    nearbyAttractions: ['c1'],
    nearbyRestaurants: [1],
    distance: "В шаговой доступности от Керуен-Сарая"
  },
  {
    id: 3, name: "Hampton Inn", type: "Hotel", city: "Туркестан", stars: 4, priceTag: "$$",
    image: "https://images.unsplash.com/photo-1551882547-ff43c63fedfe?q=80&w=1000",
    location: "пр. Тауке Хана, 110",
    description: "Современный стандарт гостеприимства. Чистые линии, надежный сервис и лучшие завтраки в городе для энергичных путешественников.",
    amenities: ['Wi-Fi', 'Завтрак', 'Фитнес', 'Кондиционер'],
    rooms: [
      { name: 'Standard Twin', price: '32 000 ₸', icon: 'Users' },
      { name: 'King Room', price: '38 000 ₸', icon: 'Bed' }
    ],
    distance: "1.2км от центра"
  },
  {
    id: 4, name: "Silk Way Host", type: "Hostel", city: "Туркестан", stars: 3, priceTag: "$",
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=1000",
    location: "ул. Сейфуллина, 45",
    description: "Стильный и бюджетный вариант для бэкпэкеров. Общие зоны в стиле лофт с элементами казахского поп-арта.",
    amenities: ['Wi-Fi', 'Кофе', 'Лаунж', 'Сейф'],
    rooms: [
      { name: 'Shared 6-bed', price: '5 500 ₸', icon: 'Bed' },
      { name: 'Private Room', price: '12 000 ₸', icon: 'Key' }
    ],
    distance: "800м от вокзала"
  },
  {
    id: 5, name: "Sultan Palace", type: "Hotel", city: "Отрар", stars: 4, priceTag: "$$$",
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1000",
    location: "Въезд в город, с. Шаульдер",
    description: "Оазис комфорта вблизи древнего Отрара. Интерьеры выполнены в классическом стиле с восточными акцентами.",
    amenities: ['Wi-Fi', 'Ресторан', 'Парковка', 'Бассейн'],
    rooms: [
      { name: 'Sultan Suite', price: '55 000 ₸', icon: 'Crown' },
      { name: 'Family Room', price: '65 000 ₸', icon: 'Users' }
    ],
    distance: "3км от раскопок Отрара"
  },
  {
    id: 6, name: "Yurt Camp Sultan", type: "Eco", city: "Сауран", stars: 5, priceTag: "$$",
    image: "https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?q=80&w=1000",
    location: "Степная зона Саурана",
    description: "Уникальный этно-лагерь. Ночуйте под открытым небом в роскошных юртах, ощущая дыхание великой степи.",
    amenities: ['Ужин у костра', 'Конные прогулки', 'Звезды', 'Традиции'],
    rooms: [
      { name: 'Eco Yurt', price: '25 000 ₸', icon: 'Tent' },
      { name: 'VIP Royal Yurt', price: '55 000 ₸', icon: 'Crown' }
    ],
    distance: "В сердце древнего городища"
  },
  {
    id: 7, name: "Grand Oasis", type: "Hotel", city: "Туркестан", stars: 5, priceTag: "$$$$",
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1000",
    location: "ул. Кожанова, 12",
    description: "Отель-курорт с каскадными фонтанами и садами. Место, где вода и зелень создают прохладу даже в самый жаркий полдень.",
    amenities: ['SPA', 'Фонтаны', 'Сад', 'Бассейн'],
    rooms: [
      { name: 'Garden View', price: '70 000 ₸', icon: '🌳' },
      { name: 'Pool Access', price: '95 000 ₸', icon: '💧' }
    ],
    distance: "2км от Мавзолея"
  },
  {
    id: 8, name: "Nomad Hostel", type: "Hostel", city: "Сауран", stars: 2, priceTag: "$",
    image: "https://images.unsplash.com/photo-1596272875729-ed2ff7d6d9c5?q=80&w=1000",
    location: "пос. Старый Сауран",
    description: "Простой приют для истинных исследователей. Минимум пафоса — максимум истории вокруг.",
    amenities: ['Wi-Fi', 'Чай', 'Карты', 'Гайд'],
    rooms: [
      { name: 'Dorm Bed', price: '4 000 ₸', icon: '⛺' }
    ],
    distance: "500м от крепостной стены"
  }
];

export const restaurantsData = [
  {
    id: 1, name: "Sandyq", cuisine: "Казахская", city: "Туркестан", priceTag: "$$$$",
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1200", // Kazakh-inspired meat dish
    location: "Керуен-Сарай",
    description: "Этно-ресторан высокой кухни. Здесь оживают рецепты из поваренной книги ханских времен, поданные в интерьере музейного уровня.",
    signature: "Сырне в казане с горными травами",
    menu: [
      { item: 'Бешбармак из конины', price: '12 500 ₸' },
      { item: 'Куырдак по-туркестански', price: '8 900 ₸' },
      { item: 'Ассорти из казы и жая', price: '15 200 ₸' }
    ],
    gallery: [
      "https://images.unsplash.com/photo-1555396273-09b74301569a?q=80&w=800",
      "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800"
    ],
    nearbyAttractions: ['c1'],
    nearbyHotels: [1, 2],
    specialty: "Традиционные методы томления в печи"
  },
  {
    id: 2, name: "Navat Teahouse", cuisine: "Восточная", city: "Туркестан", priceTag: "$$$",
    image: "https://images.unsplash.com/photo-1590595906931-81f04f0ccebb?q=80&w=1200", // Traditional tea & sweets
    location: "пр. Тауке Хана, 45",
    description: "Чайхана с бесконечными подушками и ароматом свежеиспеченных лепешек. Место для долгих бесед под звон пиал.",
    signature: "Праздничный плов 'Нават'",
    menu: [
      { item: 'Лагман уйгурский', price: '3 800 ₸' },
      { item: 'Манты с рубленым мясом', price: '4 200 ₸' },
      { item: 'Чайная церемония', price: '2 500 ₸' }
    ],
    gallery: [
      "https://images.unsplash.com/photo-1590595906931-81f04f0ccebb?q=80&w=800",
      "https://images.unsplash.com/photo-1541614101331-1a5a3a194e90?q=80&w=800"
    ],
    nearbyAttractions: ['c1', 'c5'],
    nearbyHotels: [1, 3],
    specialty: "Более 50 видов восточных сладостей"
  },
  {
    id: 3, name: "Plov Center", cuisine: "Узбекская", city: "Туркестан", priceTag: "$$",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=1200", // Delicious plov
    location: "ул. Сейфуллина, 10",
    description: "Мекка для любителей плова. Огромные казаны, золотистый рис и нежнейшее мясо.",
    signature: "Ташкентский свадебный плов",
    menu: [
      { item: 'Порция плова 1кг', price: '5 600 ₸' },
      { item: 'Салат Ачик-чучук', price: '1 200 ₸' }
    ],
    gallery: [
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=800",
      "https://images.unsplash.com/photo-1543324529-f43033500cc7?q=80&w=800"
    ],
    nearbyAttractions: ['c4', 'ctest-1'],
    nearbyHotels: [4],
    specialty: "Приготовление на дровах саксаула"
  }
];

export const attractionsData = {
  city: [
    {
      id: 'c1', name: 'Керуен-Сарай', city: 'Туркестан',
      description: 'Уникальный туристический комплекс, "летающий театр" и шоу лодок.',
      image: 'https://images.unsplash.com/photo-1588055620986-77864f147983?q=80&w=800',
      category: 'город',
      gallery: [
        'https://images.unsplash.com/photo-1588055620986-77864f147983?q=80&w=800',
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800',
        'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?q=80&w=800'
      ],
      nearbyHotels: [1, 2, 7], // IDs from hotelsData
      nearbyRestaurants: [1, 2], // IDs from restaurantsData
      coordinates: { lat: 43.297, lng: 68.271 }
    },
    { id: 'c2', name: 'Визит-центр', city: 'Туркестан', description: 'Современный хаб с интерактивными технологиями.', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800', category: 'город', coordinates: { lat: 43.298, lng: 68.270 } },
    { id: 'c3', name: 'Амфитеатр', city: 'Туркестан', description: 'Центр культурной жизни под открытым небом.', image: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?q=80&w=800', category: 'город', coordinates: { lat: 43.296, lng: 68.272 } },
    { id: 'c4', name: 'Библиотека «Farab»', city: 'Туркестан', description: 'Крупнейшая библиотека региона.', image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=800', category: 'город' },
    { id: 'c5', name: 'Площадь Есим-хана', city: 'Туркестан', description: 'Главная площадь перед мавзолеем.', image: 'https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5a?q=80&w=800', category: 'город' },
    { id: 'c6', name: 'Старый город', city: 'Туркестан', description: 'Восстановленные улочки древнего Туркестана.', image: 'https://images.unsplash.com/photo-1544976766-31846ac10134?q=80&w=800', category: 'город' },
    { id: 'c7', name: 'Кентау Парк', city: 'Кентау', description: 'Уютный парк в шахтерском городе.', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800', category: 'город' },
    { id: 'c8', name: 'Шаульдер', city: 'Отрар', description: 'Центр археологических исследований.', image: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?q=80&w=800', category: 'город' },
    // Дубликаты для теста (40 штук)
    ...Array.from({ length: 32 }, (_, i) => ({
      id: `ctest-${i}`,
      name: `Тестовый объект ${i + 1}`,
      city: i % 2 === 0 ? 'Туркестан' : 'Кентау',
      description: 'Дополнительный тестовый объект для проверки сетки и скролла.',
      image: `https://images.unsplash.com/photo-${1510000000000 + i}?q=50&w=600`,
      category: 'город'
    }))
  ],
  spirit: [
    {
      id: 's1',
      name: 'Мавзолей Ясави',
      city: 'Туркестан',
      description: 'Шедевр ЮНЕСКО, главная святыня и символ города.',
      fullDescription: 'Мавзолей Ходжи Ахмеда Ясави — непревзойденный шедевр средневекового зодчества. Построенный по приказу Тамерлана в XIV веке, он является местом паломничества мусульман со всего мира. Величественный купол и уникальные изразцы делают его одним из красивейших зданий Востока.',
      image: 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?q=80&w=1200',
      gallery: [
        'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?q=80&w=800',
        'https://images.unsplash.com/photo-1564507004663-b6dfb3c824d5?q=80&w=800',
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=800'
      ],
      hours: '08:00 - 20:00',
      location: 'Туркестан, комплекс Азрет-Султан',
      category: 'духовные',
      nearbyHotels: [1, 2, 3],
      nearbyRestaurants: [1, 2, 3],
      coordinates: { lat: 43.297, lng: 68.271 }
    },
    {
      id: 's2',
      name: 'Арыстан-Баб',
      city: 'Отрарский р-н',
      description: 'Место захоронения духовного наставника Ясави.',
      fullDescription: 'Мавзолей над могилой учителя и духовного наставника Ахмеда Ясави. По легенде, Арыстан-баб был сподвижником пророка Мухаммеда. Считается, что сначала нужно почтить память учителя, а потом ученика.',
      image: 'https://images.unsplash.com/photo-1629814696041-36ba9792404b?q=80&w=1200',
      gallery: [
        'https://images.unsplash.com/photo-1629814696041-36ba9792404b?q=80&w=800'
      ],
      hours: '08:00 - 19:00',
      location: 'ЮКО, Отрарский район',
      category: 'духовные'
    },
    { id: 's3', name: 'Хильвет', city: 'Туркестан', description: 'Полуподземная мечеть для медитаций.', image: 'https://images.unsplash.com/photo-1564507004663-b6dfb3c824d5?q=80&w=800', category: 'духовные', hours: '09:00 - 18:00' },
    { id: 's4', name: 'Гаухар-ана', city: 'Туркестан', description: 'Святое место дочери Ахмеда Ясави.', image: 'https://images.unsplash.com/photo-1548013146-72479768bbaa?q=80&w=800', category: 'духовные' },
    { id: 's5', name: 'Колодец Укаш-ата', city: 'Карнак', description: 'Легендарный чудодейственный колодец.', image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800', category: 'духовные' }
  ],
  nature: [
    {
      id: 'n1',
      name: 'Аксу-Жабаглы',
      city: 'Тюлькубас',
      description: 'Старейший заповедник с каньонами и водопадами.',
      fullDescription: 'Первый и старейший заповедник Казахстана и всей Центральной Азии. Здесь обитают снежные барсы, тянь-шаньские медведи и цветут редкие тюльпаны Грейга. Реки Аксу и Жабаглы образуют величественные каньоны с изумрудной водой.',
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200',
      gallery: [
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800',
        'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800'
      ],
      hours: 'Круглосуточно (экскурсии до 18:00)',
      location: 'Тюлькубасский район',
      category: 'природа'
    },
    {
      id: 'n2',
      name: 'Пещера Акмечеть',
      city: 'Байдибек',
      description: 'Гигантский купол в земле с растущими внутри деревьями.',
      fullDescription: 'Уникальный природный объект — огромная пещера с собственным микроклиматом. Внутри нее растут тутовые деревья, а свет проникает через отверстие в "потолке", создавая мистическую атмосферу.',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200',
      gallery: [
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800'
      ],
      hours: '08:00 - 18:00',
      location: 'Байдибекский район',
      category: 'природа'
    },
    { id: 'n3', name: 'Река Сырдарья', city: 'Туркестан', description: 'Великая артерия, несущая жизнь.', image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800', category: 'природа' },
    { id: 'n4', name: 'Горы Каратау', city: 'Кентау', description: 'Древние горы с петроглифами.', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800', category: 'природа' },
    { id: 'n5', name: 'Степной путь', city: 'Свободное', description: 'Бесконечные горизонты легендарной степи.', image: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?q=80&w=800', category: 'природа' }
  ]
};

/* ─────────────────────────────────────────
   GUIDES & TOURS DATA
───────────────────────────────────────── */
export const guidesData = [
  {
    id: 1,
    name: 'Арасбек Джаксыбеков',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600',
    specialty: 'История',
    languages: ['Казахский', 'Русский', 'Английский'],
    experience: 14,
    rating: 4.9,
    reviewCount: 312,
    description: 'Доктор исторических наук. Провёл более 10 лет, изучая мавзолеи Туркестана. Каждая экскурсия — это живая лекция, превращающая камни в голоса предков.',
    tours: [
      {
        id: 't1', title: 'Сакральный Туркестан', duration: '6 часов', price: '15 000 ₸',
        image: 'https://images.unsplash.com/photo-1588055620986-77864f147983?q=80&w=600',
        category: 'история',
        highlights: ['Мавзолей Ясави', 'Подземная мечеть Шакпак-Ата', 'Городище Сауран', 'Теккировская мечеть'],
        description: 'Полное погружение в сакральную географию Туркестанского региона. Объекты ЮНЕСКО и скрытые жемчужины в одном маршруте.'
      },
      {
        id: 't2', title: 'Древний Отрар', duration: '8 часов', price: '20 000 ₸',
        image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=600',
        category: 'история',
        highlights: ['Городище Отрар', 'Мавзолей Арыстан-Баба', 'Музей Отрара', 'Раскопки X–XIII вв.'],
        description: 'Путешествие в один из крупнейших городов средневекового мира, погибший при нашествии Чингисхана.'
      }
    ]
  },
  {
    id: 2,
    name: 'Гульнара Сейткали',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600',
    specialty: 'Природа',
    languages: ['Казахский', 'Русский'],
    experience: 9,
    rating: 4.8,
    reviewCount: 218,
    description: 'Биолог-натуралист и опытный треккер. Знает каждую тропу в горах Каратау. Показывает степь такой, какой её видели кочевники сотни лет назад.',
    tours: [
      {
        id: 't3', title: 'Горы Каратау', duration: '2 дня', price: '35 000 ₸',
        category: 'природа',
        highlights: ['Трек к скалам Каратау', 'Ночевка в степи', 'Петроглифы эпохи бронзы', 'Звёздное небо'],
        description: 'Двухдневный трек по горному хребту с уникальными наскальными рисунками. Без туристической толпы, только дикая природа.'
      },
      {
        id: 't4', title: 'Долина Сырдарьи', duration: '5 часов', price: '12 000 ₸',
        category: 'природа',
        highlights: ['Пойма реки', 'Птицы мигранты', 'Рыбацкие угодья', 'Тугайные леса'],
        description: 'Экологическая прогулка вдоль великой центральноазиатской реки.'
      }
    ]
  },
  {
    id: 3,
    name: 'Ержан Мухамедиев',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=600',
    specialty: 'Кулинария',
    languages: ['Казахский', 'Русский', 'Турецкий'],
    experience: 7,
    rating: 4.7,
    reviewCount: 175,
    description: 'Шеф-повар и знаток казахской кухни. Водит гостей на базары, к местным мастерам и семьям, сохраняющим рецепты предков.',
    tours: [
      {
        id: 't5', title: 'Вкус Великой Степи', duration: '5 часов', price: '18 000 ₸',
        category: 'кулинария',
        highlights: ['Утренний базар', 'Мастер-класс по бауырсакам', 'Дегустация 12 блюд', 'Семейный обед у местных'],
        description: 'Кулинарный гастро-тур по рынкам и столам Туркестана. Вы узнаете, что такое настоящий бешбармак и откуда он родом.'
      }
    ]
  },
  {
    id: 4,
    name: 'Айгерим Токова',
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600',
    specialty: 'Архитектура',
    languages: ['Казахский', 'Русский', 'Английский', 'Немецкий'],
    experience: 11,
    rating: 4.9,
    reviewCount: 289,
    description: 'Архитектор-реставратор, специализирующийся на тимуридской архитектуре. Расскажет, почему купол мавзолея Ясави — это чудо инженерии средневековья.',
    tours: [
      {
        id: 't6', title: 'Архитектурный Ренессанс', duration: '4 часа', price: '14 000 ₸',
        category: 'архитектура',
        highlights: ['Мавзолей Ясави (изнутри)', 'Ханака', 'Реставрационные работы', 'Орнаменталистика'],
        description: 'Профессиональный взгляд архитектора на геометрию, орнамент и инженерию тимуридских построек XIV века.'
      },
      {
        id: 't7', title: 'Мечети Туркестана', duration: '6 часов', price: '16 000 ₸',
        category: 'архитектура',
        highlights: ['7 исторических мечетей', 'Медресе Ибрагим-бека', 'Восточный портал', 'Мозаика и кашин'],
        description: 'Маршрут, охватывающий все значимые сакральные постройки Туркестана от XII до XIX века.'
      }
    ]
  },
  {
    id: 5,
    name: 'Нурлан Бейсенов',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600',
    specialty: 'Приключения',
    languages: ['Казахский', 'Русский', 'Английский'],
    experience: 6,
    rating: 4.6,
    reviewCount: 143,
    description: 'Лицензированный гид по экстремальному туризму. Верховая езда, пешие марши и ночные биваки в степи — его стихия.',
    tours: [
      {
        id: 't8', title: 'Конный путь номадов', duration: '3 дня', price: '55 000 ₸',
        category: 'приключения',
        highlights: ['Верховая езда', 'Степной лагерь', 'Охота с беркутом', 'Традиционные игры'],
        description: 'Трёхдневное путешествие верхом по маршрутам древних кочевников. Ночи у костра, созвездия над юртой.'
      },
      {
        id: 't9', title: 'Рассвет над Саураном', duration: '1 день', price: '22 000 ₸',
        category: 'приключения',
        highlights: ['Ранний выезд (04:30)', 'Городище Сауран', 'Степной рассвет', 'Завтрак кочевников'],
        description: 'Ранний выезд, чтобы встретить рассвет над руинами средневекового Саурана. Незабываемые фотографии и тишина.'
      }
    ]
  },
  {
    id: 6,
    name: 'Дана Аскарова',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600',
    specialty: 'Культура',
    languages: ['Казахский', 'Русский', 'Французский'],
    experience: 8,
    rating: 4.8,
    reviewCount: 201,
    description: 'Этно-культуролог и мастер прикладного искусства. Знает всех лучших ремесленников Туркестана и откроет вам их мастерские.',
    tours: [
      {
        id: 't10', title: 'Ремёсла Шёлкового Пути', duration: '6 часов', price: '16 000 ₸',
        category: 'культура',
        highlights: ['Ткачество кілемов', 'Ювелирная мастерская', 'Роспись ганча', 'Мастер-класс'],
        description: 'Посещение действующих мастерских, где ремёсла Великого Шёлкового Пути живут до сих пор.'
      },
      {
        id: 't11', title: 'Душа Туркестана', duration: '4 часа', price: '11 000 ₸',
        category: 'культура',
        highlights: ['Базар Туркестана', 'Домбра живым звуком', 'Знакомство с семьёй', 'Чаепитие'],
        description: 'Неформальная встреча с настоящим Туркестаном через людей, звуки и вкусы повседневной жизни.'
      }
    ]
  }
];
