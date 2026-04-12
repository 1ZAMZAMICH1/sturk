
const GIST_ID = '422713639bb29643abef3fef6c220400';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || 'YOUR_TOKEN_HERE';

const data = [
  {
    "id": "1",
    "attractionId": "1775738882463",
    "hotelId": "",
    "restaurantId": "",
    "title_ru": "Городище Отрар",
    "title_kz": "Отырар қалашығы",
    "title_en": "The Otrar Settlement",
    "desc_ru": "археологический памятник, представляющий собой остатки древнего города с сохранившимися фрагментами стен, мечетей и жилых кварталов.",
    "desc_kz": "ежелгі қаланың қалдықтары, қабырғаларының үзінділері, мешіттері мен тұрғын кварталдары сақталған археологиялық ескерткіш.",
    "desc_en": "is an archaeological site featuring the remains of the ancient city, including preserved wall fragments, mosques, and residential quarters.",
    "pos": "42.85081062,68.30377158",
    "icon": "https://res.cloudinary.com/dyuywnfy3/image/upload/v1775898160/Gemini_Generated_Image_52sc5h52sc5h52sc_1_mhn2hd.png",
    "type": "sight"
  },
  {
    "id": "2",
    "attractionId": "1775742562636",
    "hotelId": "",
    "restaurantId": "",
    "title_ru": "Пещера Акмечеть",
    "title_kz": "Ақмешіт үңгірі",
    "title_en": "Akmechet Cave",
    "desc_ru": "уникальный природный объект и сакральное место, представляющее собой огромный известняковый зал с собственным микроклиматом и деревьями внутри.",
    "desc_kz": "бірегей табиғи нысан және киелі орын. Бұл ішінде өзіндік микроклиматы мен ағаштары бар алып әктас залы.",
    "desc_en": "is a unique natural site and a sacred place, consisting of a vast limestone chamber with its own microclimate and trees growing inside.",
    "pos": "43.00661905,69.70011995",
    "icon": "https://res.cloudinary.com/dyuywnfy3/image/upload/v1775898853/Gemini_Generated_Image_nb3mk4nb3mk4nb3m_drvhoi.png",
    "type": "sight"
  }
];

async function repair() {
    console.log('Starting repair...');
    const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        files: {
          "map_points.json": {
            content: JSON.stringify(data, null, 2)
          }
        }
      })
    });
    if (response.ok) console.log('REPAIRED!');
    else console.log('FAILED', await response.text());
}
repair();
