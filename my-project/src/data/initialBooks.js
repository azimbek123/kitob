// 20 Real Books in Uzbekistan with accurate descriptions, covers, genres, and reader reviews
export const initialBooks = [
  {
    id: 1,
    title: "O'tkan kunlar",
    author: "Abdulla Qodiriy",
    category: "Badiiy",
    price: 48000,
    old_price: 60000,
    cover_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
    description: "O'zbek adabiyotining birinchi romani bo'lib, XIX asr o'rtalaridagi Qo'qon xonligi davridagi ijtimoiy-siyosiy voqealar, xalq hayoti va Otabek bilan Kumushbibining fojeali sevgisi haqida hikoya qiladi. Kitob orqali o'tmishimiz, milliy qadriyatlarimiz va insoniy fazilatlar teran ochib berilgan.",
    pages: 416,
    year: 1926,
    language: "O'zbekcha",
    rating: 4.9,
    reviews_count: 142,
    stock: 24,
    is_featured: true,
    reviews: [
      { id: 101, user: "Nodirbek Aliyev", rating: 5, date: "2024-03-12", comment: "Har bir o'zbek o'qishi shart bo'lgan durdona asar. Otabek va Kumushning sevgisi ko'zlarga yosh keltiradi." },
      { id: 102, user: "Madina Karimova", rating: 5, date: "2024-03-10", comment: "Qodiriyning tili nihoyatda boy va jozibador. Qayta-qayta o'qigim keladi." }
    ]
  },
  {
    id: 2,
    title: "Atom odatlar (Atomic Habits)",
    author: "James Clear",
    category: "Shaxsiy rivojlanish",
    price: 65000,
    old_price: 80000,
    cover_url: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=600&q=80",
    description: "Kichik o'zgarishlar qanday qilib ulkan natijalarga olib kelishini ilmiy va amaliy jihatdan isbotlab beruvchi jahon bestselleri. Kitob yomon odatlardan qutulish va foydali odatlarni osonlik bilan shakllantirishning aniq 4 bosqichli tizimini taqdim etadi.",
    pages: 320,
    year: 2018,
    language: "O'zbekcha",
    rating: 5.0,
    reviews_count: 289,
    stock: 35,
    is_featured: true,
    reviews: [
      { id: 201, user: "Sardor Rustamov", rating: 5, date: "2024-03-01", comment: "Hayotimni 180 darajaga o'zgartirgan kitob. Har kuni 1% yaxshiroq bo'lish tamoyili haqiqatda ishlaydi!" },
      { id: 202, user: "Ziyoda Shokirova", rating: 5, date: "2024-02-18", comment: "Barcha tavsiyalar juda tushunarli va amaliyotga tatbiq etish oson. Hamma do'stlarimga ulashdim." }
    ]
  },
  {
    id: 3,
    title: "Boy ota, kambag'al ota",
    author: "Robert Kiyosaki",
    category: "Biznes",
    price: 55000,
    old_price: 70000,
    cover_url: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=600&q=80",
    description: "Moliyaviy savodxonlik bo'yicha dunyodagi birinchi raqamli kitob. Muallif ikki ota – o'zining ziyoli ammo moliyaviy qiynalgan otasi va do'stining boy otasi saboqlari orqali aktivlar, passivlar va pulning siz uchun ishlash sirini tushuntiradi.",
    pages: 288,
    year: 1997,
    language: "O'zbekcha",
    rating: 4.8,
    reviews_count: 198,
    stock: 18,
    is_featured: true,
    reviews: [
      { id: 301, user: "Bobur Mirzayev", rating: 5, date: "2024-03-05", comment: "Pulga bo'lgan qarashimni butunlay yangiladi. Moliyaviy mustaqillik sari dastlabki qadam." },
      { id: 302, user: "Ulug'bek", rating: 4, date: "2024-02-25", comment: "Har bir yosh inson maktab davridayoq o'qishi kerak bo'lgan kitob." }
    ]
  },
  {
    id: 4,
    title: "Alkimyogar",
    author: "Paulo Coelho",
    category: "Badiiy",
    price: 45000,
    old_price: 55000,
    cover_url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80",
    description: "Andalusiyalik yosh cho'pon Santyagoning o'z orzusi va xazinasini izlab Misr piramidalari tomon qilgan sirli va falsafiy sayohati. Asar inson o'z taqdiriga ergashishi va koinotning yashirin belgilarini tinglashi lozimligini uqtiradi.",
    pages: 224,
    year: 1988,
    language: "O'zbekcha",
    rating: 4.7,
    reviews_count: 165,
    stock: 20,
    is_featured: false,
    reviews: [
      { id: 401, user: "Gulnoza", rating: 5, date: "2024-01-14", comment: "Falsafasi chuqur va qalbga taskin beruvchi asar. Orzular ortidan borishga ilhom beradi." }
    ]
  },
  {
    id: 5,
    title: "Diqqat: Chalg'ituvchi dunyoda muvaffaqiyat sirlari (Deep Work)",
    author: "Cal Newport",
    category: "Psixologiya",
    price: 60000,
    old_price: 75000,
    cover_url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80",
    description: "Zamonaviy shovqin-suron va ijtimoiy tarmoqlar davrida chuqur diqqatni jamlash (Deep Work) o'ta kamyob va yuqori baholanadigan mahoratga aylandi. Kitob samaradorlikni 10 barobarga oshirish va aqliy charchoqsiz ishlash ko'nikmalarini o'rgatadi.",
    pages: 304,
    year: 2016,
    language: "O'zbekcha",
    rating: 4.9,
    reviews_count: 110,
    stock: 15,
    is_featured: true,
    reviews: [
      { id: 501, user: "Jasur Programmer", rating: 5, date: "2024-02-28", comment: "Dasturchilar va aqliy mehnat egalari uchun bebaho qo'llanma. Fokusni saqlashga katta yordam berdi." }
    ]
  },
  {
    id: 6,
    title: "Grokking Algorithms (Algoritmlarni tushunish)",
    author: "Aditya Bhargava",
    category: "IT & Dasturlash",
    price: 75000,
    old_price: 95000,
    cover_url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80",
    description: "Murakkab kompyuter algoritmlarini oddiy rasmlar, illyustratsiyalar va hayotiy misollar orqali tushuntirib beruvchi eng mashhur qo'llanma. Binary search, saralash, graf algoritmlari va dinamik dasturlashni tez o'rganishni istaganlar uchun ayni muddao.",
    pages: 280,
    year: 2016,
    language: "O'zbekcha",
    rating: 4.9,
    reviews_count: 215,
    stock: 40,
    is_featured: true,
    reviews: [
      { id: 601, user: "Bekzod IT", rating: 5, date: "2024-03-15", comment: "Algoritmlardan qo'rqadiganlar uchun eng zo'r boshlang'ich kitob. Rasmlari bilan juda tushunarli qilingan!" }
    ]
  },
  {
    id: 7,
    title: "Clean Code (Toza kod)",
    author: "Robert C. Martin (Bob amaki)",
    category: "IT & Dasturlash",
    price: 85000,
    old_price: 110000,
    cover_url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80",
    description: "Professional dasturchilarning bibliyasi. Kitob kodni qanday qilib o'qilishi oson, sinovdan o'tuvchi, xatosiz va arxitekturaviy jihatdan mukammal yozish kerakligini real kod misollarida ko'rsatadi.",
    pages: 464,
    year: 2008,
    language: "Ruscha / Inglizcha",
    rating: 4.8,
    reviews_count: 178,
    stock: 22,
    is_featured: false,
    reviews: [
      { id: 701, user: "Diyor Senior Dev", rating: 5, date: "2024-02-10", comment: "Junior darajadan Middle/Senior darajaga o'tishni istagan har bir dasturchi o'qishi lozim." }
    ]
  },
  {
    id: 8,
    title: "Saodat asri qissalari",
    author: "Ahmad Lutfiy Qozonchi",
    category: "Tarix & Falsafa",
    price: 160000,
    old_price: 190000,
    cover_url: "https://images.unsplash.com/photo-1532012164546-f432f2e3ddb5?auto=format&fit=crop&w=600&q=80",
    description: "Payg'ambarimiz Muhammad (s.a.v.) va ularning muborak sahobalari hayotini o'zida mujassam etgan 4 jildlik tarixiy-badiiy asar. Asar yuksak axloq, sabr, mehr-oqibat va adolat tamoyillarini go'zal badiiy tilda aks ettiradi.",
    pages: 1120,
    year: 2020,
    language: "O'zbekcha",
    rating: 5.0,
    reviews_count: 520,
    stock: 30,
    is_featured: true,
    reviews: [
      { id: 801, user: "Muhammadali", rating: 5, date: "2024-03-08", comment: "Qalbni poklovchi, iymonni mustahkamlovchi eng sevimli asarim. 4 jildini ham bir nafasda o'qidim." }
    ]
  },
  {
    id: 9,
    title: "Stiv Jobs",
    author: "Walter Isaacson",
    category: "Biznes",
    price: 89000,
    old_price: 115000,
    cover_url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80",
    description: "Apple asoschisi Stiv Jobsning yagona rasmiy biografiyasi. Jobsning qattiqqo'lligi, mukammallikka intilishi, dunyo texnologiya bozorini inqilobiy o'zgartirishi va hayotiy qiyinchiliklari ro'y-rost bayon etilgan.",
    pages: 656,
    year: 2011,
    language: "O'zbekcha",
    rating: 4.9,
    reviews_count: 140,
    stock: 12,
    is_featured: false,
    reviews: [
      { id: 901, user: "Shoxrux", rating: 5, date: "2024-01-29", comment: "Innovatsiya va liderlik nima ekanligini anglatuvchi fantastik biografiya!" }
    ]
  },
  {
    id: 10,
    title: "Sapiens: Insoniyatning qisqacha tarixi",
    author: "Yuval Noah Harari",
    category: "Tarix & Falsafa",
    price: 78000,
    old_price: 95000,
    cover_url: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=600&q=80",
    description: "70 ming yil oldin yashagan oddiy maymunsimon maxluqot qanday qilib yer yuzining mutlaq hukmdoriga aylandi? Kognitiv inqilob, qishloq xo'jaligi va fan-texnika taraqqiyotini birlashtirgan hayratlanarli ilmiy asar.",
    pages: 512,
    year: 2014,
    language: "O'zbekcha",
    rating: 4.8,
    reviews_count: 230,
    stock: 19,
    is_featured: true,
    reviews: [
      { id: 1001, user: "Anvar", rating: 5, date: "2024-02-14", comment: "Insoniyat tarixiga butunlay boshqacha rakursdan qarash imkonini berdi." }
    ]
  },
  {
    id: 11,
    title: "1984",
    author: "George Orwell",
    category: "Badiiy",
    price: 42000,
    old_price: 52000,
    cover_url: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80",
    description: "Totalitar boshqaruv, so'z erkinligini bo'g'ish va inson ongini manipulyatsiya qilish haqidagi eng dahshatli va ogohlantiruvchi antiutopik roman. 'Katta Og'a seni kuzatmoqda' jumlasi butun dunyoga tanilgan.",
    pages: 328,
    year: 1949,
    language: "O'zbekcha",
    rating: 4.8,
    reviews_count: 310,
    stock: 25,
    is_featured: false,
    reviews: [
      { id: 1101, user: "Kozim", rating: 5, date: "2024-03-02", comment: "Haqiqatdan ham kishini larzaga soluvchi ogohlantirish. Juda chuqur yozilgan." }
    ]
  },
  {
    id: 12,
    title: "Psixologiya 101",
    author: "Paul Kleinman",
    category: "Psixologiya",
    price: 58000,
    old_price: 72000,
    cover_url: "https://images.unsplash.com/photo-1507842229451-7f01be7ff612?auto=format&fit=crop&w=600&q=80",
    description: "Inson miyasi, xulq-atvori, his-tuyg'ulari va taniqli psixologlar (Freyd, Yung, Pavlov, Skinner) tajribalari haqida sodda va ommabop qo'llanma. Psixologiyaga qiziquvchilar uchun eng yaxshi qo'llanma.",
    pages: 288,
    year: 2012,
    language: "O'zbekcha",
    rating: 4.7,
    reviews_count: 87,
    stock: 14,
    is_featured: false,
    reviews: [
      { id: 1201, user: "Laylo", rating: 5, date: "2024-01-20", comment: "Miya qanday ishlashi va odamlar xatti-harakatlari sababini tushunish osonlashdi." }
    ]
  },
  {
    id: 13,
    title: "Zero to One: Noldan birga",
    author: "Peter Thiel, Blake Masters",
    category: "Biznes",
    price: 62000,
    old_price: 78000,
    cover_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
    description: "PayPal asoschisi va Facebookning birinchi investori Peter Thielning yangi dunyo yaratuvchi startaplar haqidagi falsafasi. Mavjud narsani nusxalash 1 dan n ga olib boradi, ammo noldan bir yaratish yangilik kashf qilish demakdir.",
    pages: 224,
    year: 2014,
    language: "O'zbekcha",
    rating: 4.8,
    reviews_count: 134,
    stock: 16,
    is_featured: false,
    reviews: [
      { id: 1301, user: "Farrux Startaper", rating: 5, date: "2024-02-12", comment: "Biznes boshlamoqchi bo'lgan har qanday inson uchun qoidalar majmuasi." }
    ]
  },
  {
    id: 14,
    title: "Shaytanat (Besh jildlik)",
    author: "Tohir Malik",
    category: "Badiiy",
    price: 180000,
    old_price: 220000,
    cover_url: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80",
    description: "O'zbek detektiv adabiyotining cho'qqisi. Jinoyat olami, uning qora qonunlari, Asadbek va uning atrofidagi insonlarning fojiasi, nafs va vijdon o'rtasidagi kurash yuksak mahorat bilan qalamga olingan.",
    pages: 1450,
    year: 1994,
    language: "O'zbekcha",
    rating: 5.0,
    reviews_count: 420,
    stock: 15,
    is_featured: true,
    reviews: [
      { id: 1401, user: "Rustam", rating: 5, date: "2024-03-11", comment: "Tohir Malikning qalami tengsiz. Voqealar rivoji shu qadar tez va hayajonliki, kitobdan ko'z uzib bo'lmaydi." }
    ]
  },
  {
    id: 15,
    title: "Vaqtni boshqarish san'ati",
    author: "Brian Tracy",
    category: "Shaxsiy rivojlanish",
    price: 49000,
    old_price: 60000,
    cover_url: "https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&w=600&q=80",
    description: "Kuniga qo'shimcha 2 soat bo'sh vaqt topish, rejalashtirish, muhim vazifalarni saralash (Pareto tamoyili) va orqaga surish odatini yengish bo'yicha 21 ta sinalgan strategiya.",
    pages: 192,
    year: 2013,
    language: "O'zbekcha",
    rating: 4.7,
    reviews_count: 95,
    stock: 28,
    is_featured: false,
    reviews: [
      { id: 1501, user: "Malika", rating: 5, date: "2024-02-05", comment: "Vaqtim doim yetmasdi, bu kitob tartib-intizom o'rnatishimga sabab bo'ldi." }
    ]
  },
  {
    id: 16,
    title: "Men (O'zingni kashf et)",
    author: "Fotih Duman",
    category: "Badiiy",
    price: 52000,
    old_price: 65000,
    cover_url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80",
    description: "Insonning o'zligini anglashi, nafsi bilan kurashi, qalb xotirjamligi va ilohiy ishq yo'lidagi izlanishlariga bag'ishlangan falsafiy-ruhiy asar. Asar o'quvchini chuqur o'yga toldiradi.",
    pages: 256,
    year: 2021,
    language: "O'zbekcha",
    rating: 4.9,
    reviews_count: 180,
    stock: 22,
    is_featured: false,
    reviews: [
      { id: 1601, user: "Dilnoza", rating: 5, date: "2024-03-04", comment: "Qalbimga tegdi, Fotih Dumanning asarlari odamni o'zini taftish qilishga undaydi." }
    ]
  },
  {
    id: 17,
    title: "Urush san'ati (The Art of War)",
    author: "Sun Szi",
    category: "Biznes",
    price: 39000,
    old_price: 49000,
    cover_url: "https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?auto=format&fit=crop&w=600&q=80",
    description: "Qadimgi Xitoy harbiy sarkardasining 2500 yillik strategik traktati. Bugungi kunda bu asar nafaqat harbiy sohada, balki biznes, muzokaralar va liderlikda g'alaba qozonish uchun qo'llanma sifatida o'rganiladi.",
    pages: 160,
    year: -500,
    language: "O'zbekcha",
    rating: 4.8,
    reviews_count: 145,
    stock: 17,
    is_featured: false,
    reviews: [
      { id: 1701, user: "Azizbek", rating: 5, date: "2024-01-18", comment: "Muzokaralarda g'alaba qozonish uchun juda kuchli tavsiyalar mavjud." }
    ]
  },
  {
    id: 18,
    title: "Raqamli qal'a (Digital Fortress)",
    author: "Dan Brown",
    category: "Badiiy",
    price: 54000,
    old_price: 68000,
    cover_url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80",
    description: "AQSh Milliy Xavfsizlik Agentligining o'ta maxfiy superkompyuteri yechib bo'lmas shifrlangan kodga duch keladi. Kriptograf Syuzan Fletcher sirli kod ortidagi fitnani fosh etishga intiladi. Triller va kiberxavfsizlik ixlosmandlari uchun.",
    pages: 440,
    year: 1998,
    language: "O'zbekcha",
    rating: 4.8,
    reviews_count: 112,
    stock: 19,
    is_featured: false,
    reviews: [
      { id: 1801, user: "Otabek", rating: 5, date: "2024-02-22", comment: "Den Braun baribir dahshat yozadi. Oxirigacha nafas yutib o'qidim." }
    ]
  },
  {
    id: 19,
    title: "JavaScript: Kuchli tomonlari (The Good Parts)",
    author: "Douglas Crockford",
    category: "IT & Dasturlash",
    price: 68000,
    old_price: 85000,
    cover_url: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?auto=format&fit=crop&w=600&q=80",
    description: "Dunyodagi eng keng tarqalgan dasturlash tili bo'lgan JavaScriptning eng go'zal va kuchli imkoniyatlarini saralab beruvchi durdona asar. Ob'ektlar, funksiyalar, merosxo'rlik va yomon xatolardan saqlanish usullari.",
    pages: 176,
    year: 2008,
    language: "Ruscha / Inglizcha",
    rating: 4.7,
    reviews_count: 94,
    stock: 11,
    is_featured: false,
    reviews: [
      { id: 1901, user: "Javohir Frontend", rating: 5, date: "2024-02-01", comment: "Har bir JS dasturchisi o'qishi kerak bo'lgan asosiy asar." }
    ]
  },
  {
    id: 20,
    title: "Tafakkur durdonalari",
    author: "Jaloliddin Rumiy",
    category: "Tarix & Falsafa",
    price: 49000,
    old_price: 62000,
    cover_url: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=600&q=80",
    description: "Mavlono Jaloliddin Rumiyning 'Masnaviy' va boshqa asarlaridan olingan eng saralangan hikmatlar, masallar va ruhiy saboqlar. Qalb ko'zini ochuvchi va sevgini butun borliq deb biluvchi donolik xazinasi.",
    pages: 272,
    year: 2019,
    language: "O'zbekcha",
    rating: 5.0,
    reviews_count: 275,
    stock: 26,
    is_featured: true,
    reviews: [
      { id: 2001, user: "Sarvinoz", rating: 5, date: "2024-03-09", comment: "Har bir jumlasida ming ma'no yashiringan kitob. Tushkunlikda eng yaxshi hamroh." }
    ]
  }
]
