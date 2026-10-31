// DayZ Chernarus Tactical Map Database
// World Size: 15360m x 15360m (DayZ Standard Coordinate Grid)
// Reference: DayZ.xam.nu & Bohemia Interactive Official Coordinates

window.DAYZ_DATA = {
  mapSize: 15360,
  categories: {
    towns: { name: "Cities & Towns", icon: "🏙️", color: "#64b5f6" },
    military: { name: "Military Bases", icon: "🎖️", color: "#e53935" },
    water: { name: "Water Wells", icon: "💧", color: "#29b6f6" },
    medical: { name: "Hospitals & Medical", icon: "🏥", color: "#00e676" },
    police: { name: "Police Stations", icon: "👮", color: "#ffb300" },
    fire: { name: "Fire Stations", icon: "🚒", color: "#ff7043" },
    supermarket: { name: "Supermarkets & Stores", icon: "🛒", color: "#ff8a65" },
    industrial: { name: "Industrial & Docks", icon: "🏭", color: "#90a4ae" },
    hunting: { name: "Hunting Stands & Camps", icon: "🦌", color: "#8d6e63" },
    fuel: { name: "Fuel & Gas Stations", icon: "⛽", color: "#ab47bc" },
    toxic: { name: "Contaminated Gas Zones", icon: "☣️", color: "#76ff03" },
    heli: { name: "Heli Crash Spawns", icon: "🚁", color: "#f06292" },
    landmarks: { name: "Landmarks & Castles", icon: "🏰", color: "#ffd54f" }
  },

  locations: [
    // ==========================================
    // --- MAJOR CITIES & TOWNS ---
    // ==========================================
    { id: "c1", name: "Черногорск", en: "Chernogorsk", type: "towns", x: 6500, y: 2500, tier: 1, desc: "Massive coastal industrial city. High loot density, hospital, police station, harbor, supermarket, and residential high-rises." },
    { id: "c2", name: "Электрозаводск", en: "Elektrozavodsk", type: "towns", x: 10400, y: 2200, tier: 1, desc: "Huge eastern coastal hub. Major power plant, two hospitals, police station, harbor, and primary fresh spawn area." },
    { id: "c3", name: "Березино", en: "Berezino", type: "towns", x: 12200, y: 9300, tier: 1, desc: "Sprawling northeast coastal port. High medical supplies, lumber yard, harbor docks, and apartments." },
    { id: "c4", name: "Североград", en: "Severograd", type: "towns", x: 8000, y: 12700, tier: 3, desc: "Major northern metropolis. Quarry, central church, hospital, police department, and rail yards." },
    { id: "c5", name: "Новодмитровск", en: "Novodmitrovsk", type: "towns", x: 11400, y: 14300, tier: 2, desc: "Giant industrial metropolis. Massive smokestacks, train yards, and towering city hall." },
    { id: "c6", name: "Светлоярск", en: "Svetlojarsk", type: "towns", x: 13900, y: 13200, tier: 1, desc: "Picturesque northeast seaside town. Cathedral, port terminal, police, and doctor's clinic." },
    { id: "c7", name: "Зеленогорск", en: "Zelenogorsk", type: "towns", x: 2600, y: 5300, tier: 2, desc: "Southwestern tactical crossroads. Rail yards, supermarket, and major military garrison." },
    { id: "c8", name: "Старый Собор", en: "Stary Sobor", type: "towns", x: 6000, y: 7700, tier: 2, desc: "Heart of central Chernarus. Historic military tent camp and trade hub." },
    { id: "c9", name: "Новый Собор", en: "Novy Sobor", type: "towns", x: 7000, y: 7600, tier: 2, desc: "Rural central agricultural town. Orthodox church, police station, and farming barns." },
    { id: "c10", name: "Выбор", en: "Vybor", type: "towns", x: 3800, y: 8900, tier: 3, desc: "Strategic gateway town to Northwest Airfield. Police station, supermarket, and fuel station." },
    { id: "c11", name: "Кабанино", en: "Kabanino", type: "towns", x: 5300, y: 8600, tier: 2, desc: "Crossroads village directly south of NWAF. Frequent ambush zone." },
    { id: "c12", name: "Горка", en: "Gorka", type: "towns", x: 9500, y: 8800, tier: 2, desc: "Forested inland town. Prominent police station, clinic, and farming barns." },
    { id: "c13", name: "Солнечный", en: "Solnichniy", type: "towns", x: 13400, y: 6200, tier: 1, desc: "East coast industrial quarry town. Factory, gas station, and coast highway." },
    { id: "c14", name: "Камышово", en: "Kamyshovo", type: "towns", x: 12000, y: 3500, tier: 1, desc: "Quiet seaside settlement. High frequency of fresh spawn skirmishes and coastal police." },
    { id: "c15", name: "Каменка", en: "Kamenka", type: "towns", x: 1800, y: 2200, tier: 1, desc: "Far southwestern edge of the map. Coastal village, old lighthouse, and railway tracks." },
    { id: "c16", name: "Павлово", en: "Pavlovo", type: "towns", x: 1700, y: 3800, tier: 2, desc: "Southwest farming town situated directly next to the toxic military base." },
    { id: "c17", name: "Балота", en: "Balota", type: "towns", x: 4400, y: 2400, tier: 1, desc: "Coastal transit town right next to the coastal airfield." },
    { id: "c18", name: "Красностав", en: "Krasnostav", type: "towns", x: 11100, y: 12300, tier: 2, desc: "Northeastern valley town. Doctor's clinic, police post, and close to NEAF." },
    { id: "c19", name: "Гришино", en: "Grishino", type: "towns", x: 5900, y: 10300, tier: 3, desc: "Northern town sitting right on the eastern perimeter of the airfield." },
    { id: "c20", name: "Могилевка", en: "Mogilevka", type: "towns", x: 7500, y: 5100, tier: 1, desc: "Central woodland village. Church, hunting lodge, and police house." },
    { id: "c21", name: "Поляна", en: "Polana", type: "towns", x: 10700, y: 8100, tier: 2, desc: "Manufacturing crossroads town with lumber warehouse." },
    { id: "c22", name: "Старое", en: "Staroye", type: "towns", x: 10100, y: 5400, tier: 1, desc: "Farming hamlet nestled in the hills with a police house and tents nearby." },
    { id: "c23", name: "Мышкино", en: "Myshkino", type: "towns", x: 2000, y: 7300, tier: 2, desc: "Far western outpost town near the western tent encampment." },
    { id: "c24", name: "Пустошка", en: "Pustoshka", type: "towns", x: 3000, y: 7900, tier: 2, desc: "Western farming center with sprawling fields and grain silos." },
    { id: "c25", name: "Лопатино", en: "Lopatino", type: "towns", x: 2700, y: 9900, tier: 3, desc: "Northwestern crossroads town right below Tisy approach." },

    // ==========================================
    // --- CITY URBAN DISTRICTS & LANDMARKS ---
    // ==========================================
    // CHERNOGORSK SUB-DISTRICTS
    { id: "ud_ch1", name: "Черно — Портовые доки", en: "Cherno Harbor Docks", type: "industrial", x: 6700, y: 2320, desc: "Massive sea cargo container yard, industrial gantry cranes, warehouse piers." },
    { id: "ud_ch2", name: "Черно — Гостиница и высотки", en: "Cherno High-Rise Apartments", type: "towns", x: 6350, y: 2600, desc: "Cluster of 5-story Soviet panel apartments. Prime rooftop sniper perches." },
    { id: "ud_ch3", name: "Черно — Западный вокзал", en: "Cherno Train Station", type: "industrial", x: 6220, y: 2420, desc: "Rail depot and cargo platforms. Crowbars, sledgehammers, and maintenance tools." },
    { id: "ud_ch4", name: "Черно — Супермаркет", en: "Cherno Supermarket", type: "supermarket", x: 6580, y: 2610, desc: "City supermarket. Packed with food cans, sodas, matches, and backpacks." },
    { id: "ud_ch5", name: "Черно — Промзона и завод", en: "Cherno Industrial Factory", type: "industrial", x: 6850, y: 2460, desc: "Smokestacks, sheet metal factories, car repair garages, generator rooms." },
    { id: "ud_ch6", name: "Черно — Собор св. Георгия", en: "Cherno Cathedral", type: "landmarks", x: 6490, y: 2540, desc: "Large historic stone church overlooking the downtown square." },

    // ELEKTROZAVODSK SUB-DISTRICTS
    { id: "ud_el1", name: "Электро — ТЭЦ (Электростанция)", en: "Elektro Power Station", type: "industrial", x: 10450, y: 2480, desc: "Gigantic electric plant turbine halls, heavy industrial tools, wiring, and high ladder perches." },
    { id: "ud_el2", name: "Электро — Морской причал", en: "Elektro Harbor Pier", type: "industrial", x: 10320, y: 2050, desc: "Docks, fishing boats, nets, hooks, and coastal shipping sheds." },
    { id: "ud_el3", name: "Электро — Супермаркет", en: "Elektro Supermarket", type: "supermarket", x: 10420, y: 2280, desc: "Central grocery store opposite the town square fountain." },
    { id: "ud_el4", name: "Электро — Школа и интернат", en: "Elektro High School", type: "towns", x: 10520, y: 2320, desc: "Two-story U-shaped schoolhouse with classrooms and office loot." },
    { id: "ud_el5", name: "Электро — Лесопилка", en: "Elektro Lumber Yard", type: "industrial", x: 10720, y: 2280, desc: "Timber stacks, axes, chainsaws, saws, sharpening stones, and nails." },

    // BEREZINO SUB-DISTRICTS
    { id: "ud_be1", name: "Березино — Портовый терминал", en: "Berezino Port Terminal", type: "industrial", x: 12380, y: 9240, desc: "Large shipping crane cranes, dry dock, cargo containers." },
    { id: "ud_be2", name: "Березино — Стройплощадка", en: "Berezino High-Rise Construction", type: "industrial", x: 12050, y: 9260, desc: "Unfinished concrete skyscraper tower. Elite sniper vantage point." },
    { id: "ud_be3", name: "Березино — Супермаркет", en: "Berezino Supermarket", type: "supermarket", x: 12020, y: 9060, desc: "Southern residential grocery store." },
    { id: "ud_be4", name: "Березино — Лесокомбинат", en: "Berezino Lumber Mill", type: "industrial", x: 12150, y: 8850, desc: "Massive wood processing facility with high frequency of building materials." },

    // SEVEROGRAD SUB-DISTRICTS
    { id: "ud_sv1", name: "Североград — Горный карьер", en: "Severograd Quarry", type: "industrial", x: 7650, y: 12620, desc: "Deep open-pit limestone quarry, rock crusher machines, and mining sheds." },
    { id: "ud_sv2", name: "Североград — Супермаркет", en: "Severograd Supermarket", type: "supermarket", x: 8080, y: 12710, desc: "Northern district shopping market." },
    { id: "ud_sv3", name: "Североград — Ж/Д Вокзал", en: "Severograd Rail Terminus", type: "industrial", x: 8250, y: 12580, desc: "Major northern train depot and maintenance workshops." },

    // NOVODMITROVSK SUB-DISTRICTS
    { id: "ud_nd1", name: "Новодмитровск — Дом правительства", en: "Novodmitrovsk Town Hall", type: "landmarks", x: 11410, y: 14480, desc: "Chernarus' tallest skyscraper hall with panoramic sniper roof access." },
    { id: "ud_nd2", name: "Новодмитровск — Металлургический комбинат", en: "Novo Industrial Foundry", type: "industrial", x: 11620, y: 14210, desc: "Sprawling heavy machinery factories, catwalks, and fuel reserves." },

    // ZELENOGORSK SUB-DISTRICTS
    { id: "ud_zg1", name: "Зеленогорск — Супермаркет", en: "Zelenogorsk Supermarket", type: "supermarket", x: 2680, y: 5360, desc: "One of the most frequented supermarkets in southwest Chernarus." },
    { id: "ud_zg2", name: "Зеленогорск — Ж/Д Узел", en: "Zeleno Railway Yard", type: "industrial", x: 2540, y: 5260, desc: "Rail siding and cargo wagons right next to the military base." },

    // VYBOR SUB-DISTRICTS
    { id: "ud_vy1", name: "Выбор — Универмаг", en: "Vybor General Store", type: "supermarket", x: 3860, y: 8940, desc: "Key provisioning stop for food and ammo before NWAF incursions." },

    // ==========================================
    // --- MILITARY BASES, DETAILED SECTORS & AIRFIELDS ---
    // ==========================================
    { id: "m1", name: "Северо-западный аэродром (СЗА)", en: "NWAF (Northwest Airfield)", type: "military", x: 4700, y: 10200, tier: 4, desc: "The deadliest PvP zone in DayZ. Dual asphalt runways, ATC tower, dozens of barracks, hangars, and Tier 4 military assault gear." },
    { id: "m1_atc", name: "СЗА — Диспетчерская вышка (ATC)", en: "NWAF ATC Tower", type: "military", x: 4680, y: 10320, tier: 4, desc: "Air Traffic Control tower. High-tier military loot and 360-degree runway view." },
    { id: "m1_bar", name: "СЗА — Северные казармы", en: "NWAF North Barracks", type: "military", x: 4350, y: 10650, tier: 4, desc: "Dense cluster of barracks buildings. High spawn rate of assault rifles, plates, and attachments." },
    { id: "m1_tents", name: "СЗА — Палаточный городок", en: "NWAF Tent City", type: "military", x: 4120, y: 10980, tier: 4, desc: "Dozens of military camo tents loaded with field gear and ammunition crates." },
    { id: "m1_han", name: "СЗА — Южные ангары", en: "NWAF South Hangars", type: "military", x: 4950, y: 9780, tier: 4, desc: "Reinforced aircraft hangars and vehicle inspection pits." },

    { id: "m2", name: "Военная база Тисы", en: "Tisy Military Base", type: "military", x: 1600, y: 14200, tier: 4, desc: "Endgame northern base. Underground bunker corridors, missile silos, radar dishes, landmines, elite military weaponry." },
    { id: "m2_rad", name: "Тисы — Радиолокационный купол", en: "Tisy Radar Domes", type: "military", x: 1520, y: 14350, tier: 4, desc: "Enormous golf-ball radar antennas on northern mountain crest." },
    { id: "m2_bunk", name: "Тисы — Ракетные шахты и бункеры", en: "Tisy Underground Silos", type: "military", x: 1680, y: 14120, tier: 4, desc: "Underground subterranean missile tunnels with heavy weapon spawns." },

    { id: "m3", name: "Северо-восточный аэродром", en: "NEAF (Krasnostav Airstrip)", type: "military", x: 12100, y: 12600, tier: 3, desc: "Northeastern airstrip with aircraft hangars, control tower, and military tents." },
    { id: "m4", name: "Аэродром Балота", en: "Balota Airstrip", type: "military", x: 4900, y: 2400, tier: 2, desc: "Coastal military strip. Control tower, guard huts, and military tents." },
    { id: "m5", name: "Военная база Каменск", en: "Kamensk Military Base", type: "military", x: 7800, y: 14600, tier: 3, desc: "Northern mountain installation. Multiple barracks, guard towers, and vehicle bays." },
    { id: "m6", name: "Военный городок Зеленогорск", en: "Zelenogorsk Military", type: "military", x: 2700, y: 5300, tier: 3, desc: "Barracks complex and vehicle depot situated right at the railway terminus." },
    { id: "m7", name: "Палаточный лагерь Мышкино", en: "Myshkino Military Tents", type: "military", x: 1900, y: 7300, tier: 3, desc: "Huge open field military tent camp. High sniper danger from overlooking hills." },
    { id: "m8", name: "Палаточный лагерь Старый Собор", en: "Stary Sobor Military Camp", type: "military", x: 6000, y: 7700, tier: 3, desc: "High traffic central military tent base with heavy weapon spawns." },
    { id: "m9", name: "Военная база Павлово", en: "Pavlovo Military Camp", type: "military", x: 1900, y: 3300, tier: 3, desc: "Tier 3 military installation covered in lethal permanent toxic gas." },
    { id: "m10", name: "Три Креста (Форпост)", en: "Tri Kresta Outpost", type: "military", x: 700, y: 14500, tier: 4, desc: "Extreme northwestern border outpost with military containers and watchtower." },
    { id: "m11", name: "Блокпост Кабанино", en: "Kabanino Road Checkpoint", type: "military", x: 5420, y: 8480, tier: 2, desc: "Road barrier with sandbags, military camo container, and ammo crates." },
    { id: "m12", name: "Военная база Синисток", en: "Sinystok Military Encampment", type: "military", x: 1420, y: 12240, tier: 3, desc: "Remote northwest forest base with three barracks and guard post." },

    // ==========================================
    // --- WATER WELLS & PUMPS ---
    // ==========================================
    { id: "w1", name: "Черногорск (Центр)", en: "Cherno Center Well", type: "water", x: 6550, y: 2580, desc: "Clean drinking water pump in the downtown courtyard." },
    { id: "w2", name: "Черногорск (Запад)", en: "Cherno West Well", type: "water", x: 6320, y: 2410, desc: "Water pump near the railway apartments." },
    { id: "w2_b", name: "Черногорск (Восточный причал)", en: "Cherno East Harbor Well", type: "water", x: 6780, y: 2490, desc: "Freshwater pump located near the eastern industrial road." },
    { id: "w3", name: "Электрозаводск (Площадь)", en: "Elektro Town Square Well", type: "water", x: 10450, y: 2260, desc: "Central town square drinking fountain pump." },
    { id: "w4", name: "Электрозаводск (Восток)", en: "Elektro East Well", type: "water", x: 10620, y: 2190, desc: "Clean water pump located in eastern residential sector." },
    { id: "w4_b", name: "Электрозаводск (Западная церковь)", en: "Elektro West Church Well", type: "water", x: 10240, y: 2280, desc: "Well positioned behind the western red-brick church." },
    { id: "w5", name: "Березино (Юг)", en: "Berezino South Well", type: "water", x: 11980, y: 9120, desc: "Water well situated near the southern market." },
    { id: "w6", name: "Березино (Север)", en: "Berezino North Well", type: "water", x: 12350, y: 9550, desc: "Northern drinking well behind the primary school." },
    { id: "w7", name: "Старый Собор (Колодец)", en: "Stary Sobor Well", type: "water", x: 6040, y: 7750, desc: "Water pump in the middle of town near the church." },
    { id: "w8", name: "Новый Собор (Колодец)", en: "Novy Sobor Well", type: "water", x: 7020, y: 7660, desc: "Clean water pump beside the village churchyard." },
    { id: "w9", name: "Выбор (Колодец)", en: "Vybor Well", type: "water", x: 3820, y: 8910, desc: "Essential water refill before venturing into NWAF." },
    { id: "w10", name: "Зеленогорск (Вокзал)", en: "Zelenogorsk Station Well", type: "water", x: 2640, y: 5320, desc: "Water well located adjacent to train depot." },
    { id: "w11", name: "Североград (Колодец)", en: "Severograd Well", type: "water", x: 8050, y: 12720, desc: "Public well in the town avenue." },
    { id: "w12", name: "Камышово (Колодец)", en: "Kamyshovo Well", type: "water", x: 12040, y: 3540, desc: "Crucial freshwater pump for coastal fresh spawns." },
    { id: "w13", name: "Каменка (Колодец)", en: "Kamenka Well", type: "water", x: 1820, y: 2240, desc: "Southwest fresh water pump." },
    { id: "w14", name: "Горка (Колодец)", en: "Gorka Well", type: "water", x: 9520, y: 8840, desc: "Village water well by the road." },
    { id: "w15", name: "Светлоярск (Колодец)", en: "Svetlojarsk Well", type: "water", x: 13920, y: 13240, desc: "Town center well by the harbor park." },

    // ==========================================
    // --- HOSPITALS & MEDICAL CLINICS ---
    // ==========================================
    { id: "h1", name: "Городская больница Черногорска", en: "Cherno City Hospital", type: "medical", x: 6440, y: 2710, desc: "Three-story hospital: IV start kits, saline, tetracycline, multivitamins, blood bags." },
    { id: "h2", name: "Центральная больница Электро", en: "Elektro Central Hospital", type: "medical", x: 10480, y: 2340, desc: "Major medical facility in western Elektrozavodsk." },
    { id: "h3", name: "Больница Березино", en: "Berezino Main Hospital", type: "medical", x: 11920, y: 9120, desc: "Large regional hospital with ambulances parked outside." },
    { id: "h4", name: "Больница Северограда", en: "Severograd Hospital", type: "medical", x: 7980, y: 12820, desc: "Northern regional healthcare clinic and pharmacy." },
    { id: "h5", name: "Клиника Новодмитровска", en: "Novodmitrovsk Clinic", type: "medical", x: 11420, y: 14410, desc: "Urban medical post with surgery supplies." },
    { id: "h6", name: "Полевой госпиталь Красностава", en: "Krasnostav Field Clinic", type: "medical", x: 11190, y: 12280, desc: "Medical tent clinic beside the runway." },
    { id: "h7", name: "Клиника Зеленогорска", en: "Zelenogorsk Medical Clinic", type: "medical", x: 2730, y: 5410, desc: "Suburban medical clinic with antibiotics and bandages." },
    { id: "h8", name: "Медпункт Выбора", en: "Vybor Medical Station", type: "medical", x: 3780, y: 8930, desc: "Quick medical stop for trauma and blood treatment." },

    // ==========================================
    // --- POLICE STATIONS ---
    // ==========================================
    { id: "p1", name: "Управление полиции Черно", en: "Chernogorsk Police HQ", type: "police", x: 6620, y: 2590, desc: "Main police department. Shotguns, MP5s, stab vests, 9mm ammo." },
    { id: "p2", name: "Отдел полиции Электро", en: "Elektro Police Station", type: "police", x: 10380, y: 2120, desc: "Two-story police station with lockup cells and armory." },
    { id: "p3", name: "Полиция Березино", en: "Berezino Police Station", type: "police", x: 12040, y: 9080, desc: "Coastal police station by the main avenue." },
    { id: "p4", name: "Полиция Зеленогорска", en: "Zelenogorsk Police Dept", type: "police", x: 2720, y: 5320, desc: "Rail depot police outpost." },
    { id: "p5", name: "Полиция Выбора", en: "Vybor Police Station", type: "police", x: 3850, y: 8880, desc: "High value early weapon spawns on way to NWAF." },
    { id: "p6", name: "Полиция Северограда", en: "Severograd Police Station", type: "police", x: 8120, y: 12690, desc: "Large northern district police office." },
    { id: "p7", name: "Полицейский пост Горка", en: "Gorka Police Post", type: "police", x: 9580, y: 8890, desc: "Yellow-brick police building with roof access." },
    { id: "p8", name: "Полиция Светлоярска", en: "Svetlojarsk Police Station", type: "police", x: 13950, y: 13210, desc: "Northeast coast precinct." },
    { id: "p9", name: "Полицейский пост Солнечный", en: "Solnichniy Police Post", type: "police", x: 13420, y: 6210, desc: "Coastal checkpoint station." },
    { id: "p10", name: "Полицейский участок Камышово", en: "Kamyshovo Police Station", type: "police", x: 12080, y: 3510, desc: "Coastal police station right on the beach avenue." },

    // ==========================================
    // --- FIRE STATIONS ---
    // ==========================================
    { id: "f1", name: "Пожарная часть Черногорска", en: "Cherno Fire Station", type: "fire", x: 6700, y: 2620, desc: "Fire station tower. Fire axes, turnout gear, firefighter jackets." },
    { id: "f2", name: "Пожарная часть Электро", en: "Elektro Fire Station", type: "fire", x: 10220, y: 2240, desc: "Fire department tower with rooftop vantage point." },
    { id: "f3", name: "Пожарная часть аэродрома СЗА", en: "NWAF Fire Station", type: "fire", x: 4620, y: 10180, desc: "Airfield crash rescue building with military and medical loot." },

    // ==========================================
    // --- FUEL & GAS STATIONS ---
    // ==========================================
    { id: "g1", name: "АЗС Черногорск (Запад)", en: "Cherno West Fuel Station", type: "fuel", x: 6150, y: 2600, desc: "Fuel pumps for refilling jerry cans and vehicles." },
    { id: "g2", name: "АЗС Черногорск (Восток)", en: "Cherno East Fuel Station", type: "fuel", x: 6880, y: 2520, desc: "East exit fuel station." },
    { id: "g3", name: "АЗС Электрозаводск", en: "Elektro West Fuel Station", type: "fuel", x: 10120, y: 2150, desc: "Coastal roadside gas pumps." },
    { id: "g4", name: "АЗС Солнечный", en: "Solnichniy Gas Station", type: "fuel", x: 13390, y: 6080, desc: "Highway gas station along the eastern shoreline." },
    { id: "g5", name: "АЗС Березино", en: "Berezino Highway Fuel", type: "fuel", x: 12100, y: 8920, desc: "Dual bay fuel station." },
    { id: "g6", name: "АЗС Старый Собор", en: "Stary Sobor Fuel Station", type: "fuel", x: 6120, y: 7810, desc: "Central inland fuel hub." },
    { id: "g7", name: "АЗС Выбор", en: "Vybor Crossroads Fuel", type: "fuel", x: 3920, y: 8840, desc: "Key vehicle refueling point near airfield." },
    { id: "g8", name: "АЗС Североград", en: "Severograd Fuel Station", type: "fuel", x: 7840, y: 12590, desc: "Northern highway fueling depot." },
    { id: "g9", name: "АЗС Зеленогорск", en: "Zelenogorsk South Fuel", type: "fuel", x: 2580, y: 5180, desc: "Roadside fuel stop leaving south of town." },

    // ==========================================
    // --- HUNTING STANDS & CAMPS ---
    // ==========================================
    { id: "h_camp1", name: "Охотничий лагерь Тулга", en: "Tulga Hunting Camp", type: "hunting", x: 12850, y: 4420, desc: "Forested summer camp cabins. Hunting rifles (Blaze, Mosin, Tundra), scopes, and thermal gear." },
    { id: "h_camp2", name: "Охотничий лагерь Близнецы", en: "Black Forest Hunting Camp", type: "hunting", x: 7200, y: 9800, desc: "Deep forest cabin retreat with hunting knives, crossbows, and boots." },
    { id: "h_camp3", name: "Охотничий лагерь Святослав", en: "Svyatoy Hunting Camp", type: "hunting", x: 3450, y: 13800, desc: "Northern alpine cabins with warm clothing and high-powered rifles." },
    { id: "h_stand1", name: "Охотничья вышка (Горка)", en: "Gorka Deer Stand", type: "hunting", x: 9280, y: 9140, desc: "Elevated wooden hunting perch in woodland glade." },
    { id: "h_stand2", name: "Охотничья вышка (Зуб)", en: "Zub Hill Deer Stand", type: "hunting", x: 6720, y: 5890, desc: "Deer stand overlooking wild animal feeding grounds." },

    // ==========================================
    // --- CONTAMINATED / TOXIC STATIC GAS ZONES ---
    // ==========================================
    { id: "x1", name: "Затонувший корабль Рифы", en: "Rify Shipwreck (Static Gas Zone)", type: "toxic", x: 14100, y: 11600, tier: 4, desc: "Massive beached cargo ship surrounded by permanent toxic gas. Top-tier endgame loot (M4A1, LAR, AUR). Full NBC suit & gas mask with filter required." },
    { id: "x2", name: "Военная база Павлово (Газ)", en: "Pavlovo Base (Static Gas Zone)", type: "toxic", x: 1900, y: 3300, tier: 4, desc: "Permanent toxic artillery barrage zone. High-tier military crates (VSS, AS VAL, high cap mags). NBC gear mandatory." },

    // ==========================================
    // --- HELICOPTER CRASH SPAWNS ---
    // ==========================================
    { id: "hc1", name: "Крушение вертолета (Зелёная Гора)", en: "Green Mountain Heli Crash", type: "heli", x: 3700, y: 5900, desc: "Dynamic Mi-8 or UH-1Y Venom crash site. High probability of rare assault rifles and ghillie components." },
    { id: "hc2", name: "Крушение вертолета (Лопатино)", en: "Lopatino Heli Crash", type: "heli", x: 2800, y: 10400, desc: "Western plains helicopter crash spawn." },
    { id: "hc3", name: "Крушение вертолета (Кабанино)", en: "Kabanino Heli Crash", type: "heli", x: 5100, y: 8400, desc: "Southern airfield approach crash site." },
    { id: "hc4", name: "Крушение вертолета (Чёртов Замок)", en: "Devil's Castle Heli Crash", type: "heli", x: 6800, y: 11400, desc: "Hillside crash site below the medieval castle." },
    { id: "hc5", name: "Крушение вертолета (Кумырна)", en: "Kumyrna Heli Crash", type: "heli", x: 8300, y: 5900, desc: "Inland forest clearing crash spawn." },

    // ==========================================
    // --- LANDMARKS & CASTLES (Default: Unchecked) ---
    // ==========================================
    { id: "l1", name: "Замок Зуб", en: "Zub Castle", type: "landmarks", x: 6500, y: 5600, desc: "High hill fortress offering 360-degree sniper visibility across the southern valley." },
    { id: "l2", name: "Замок Рог", en: "Rog Castle", type: "landmarks", x: 11200, y: 4300, desc: "Ancient stone fortress ruins overlooking the eastern coastline." },
    { id: "l3", name: "Чёртов Замок", en: "Devil's Castle", type: "landmarks", x: 6900, y: 11450, desc: "Dramatic medieval castle ruin in the northern highlands." },
    { id: "l4", name: "Замок Крон", en: "Kron Castle", type: "landmarks", x: 3400, y: 7400, desc: "Western mountain fortress ruins overlooking the Pustoshka valley." },
    { id: "l5", name: "Радиовышка Зелёная Гора", en: "Green Mountain Radio Tower", type: "landmarks", x: 3700, y: 6000, desc: "Tallest broadcasting tower in southern Chernarus. Major landmark with security compound." },
    { id: "l6", name: "Радиостанция Алтарь", en: "Altar Communications Tower", type: "landmarks", x: 8150, y: 9080, desc: "Central high-gain radar and satellite communications dishes." },
    { id: "l7", name: "Пик Козлова (Снайперский холм)", en: "Pik Kozlova (Elektro Sniper Hill)", type: "landmarks", x: 9700, y: 2800, desc: "Renowned sniper mountain looking directly down onto Elektrozavodsk." },
    { id: "l8", name: "Маяк Каменка", en: "Kamenka Lighthouse", type: "landmarks", x: 1850, y: 1980, desc: "Iconic red-and-white coastal navigation beacon on southwest tip." },
    { id: "l9", name: "Маяк Три Долины", en: "Three Valleys Lighthouse", type: "landmarks", x: 13100, y: 4800, desc: "Cliffside lighthouse perched above the rocky shoreline." },
    { id: "l10", name: "Остров Скалистый", en: "Skalisty Island", type: "landmarks", x: 13300, y: 1700, desc: "Remote southern offshore island with lighthouse, stone keep, and fishing shacks." }
  ]
};
