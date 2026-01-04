(() => {
  // =========================
  // 1) RANDOM DATA GENERATORS
  // =========================
  const randInt = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const pick = (arr) => arr[randInt(0, arr.length - 1)];

  const randomString = (len) => {
    const chars = "abcdefghijklmnopqrstuvwxyz";
    let out = "";
    for (let i = 0; i < len; i++) out += chars[randInt(0, chars.length - 1)];
    return out;
  };

  const firstNames = [
    "Mustafa",
    "Ahmet",
    "Mehmet",
    "Ayse",
    "Fatma",
    "Elif",
    "Zeynep",
    "Mert",
    "Deniz",
    "Ece",
  ];
  const lastNames = [
    "Yilmaz",
    "Kaya",
    "Demir",
    "Sahin",
    "Celik",
    "Aydin",
    "Arslan",
    "Dogan",
    "Kilic",
    "Aslan",
  ];
  const streets = [
    "Vatan Cd.",
    "Mehmet Akif Sk.",
    "Bagdat Cd.",
    "Inonu Cd.",
    "Gaziosmanpasa Sk.",
    "Sehitler Cd.",
  ];
  const districts = [
    "Kadikoy",
    "Besiktas",
    "Sisli",
    "Cankaya",
    "Konak",
    "Nilufer",
    "Muratpasa",
  ];
  const cities = ["Istanbul", "Ankara", "Izmir", "Bursa", "Antalya"];

  // Email için: gerçek domaini spam’lememek adına örnek domain kullanıyoruz.
  const safeDomains = ["example.com", "test.com", "mail.test"];

  const genPhoneTR = () => {
    // TR formatına yakın: 5XXXXXXXXX
    const start = "5" + randInt(0, 9);
    let rest = "";
    for (let i = 0; i < 8; i++) rest += randInt(0, 9);
    return start + rest; // 10 haneli
  };

  const genPassword = () => {
    // Basit ama güçlü: 1 büyük + 1 küçük + 1 rakam + 1 özel + toplam 10-14
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const digits = "0123456789";
    const special = "!@#$%*?";
    const len = randInt(10, 14);

    let pwd =
      upper[randInt(0, upper.length - 1)] +
      lower[randInt(0, lower.length - 1)] +
      digits[randInt(0, digits.length - 1)] +
      special[randInt(0, special.length - 1)];

    const all = upper + lower + digits + special;
    while (pwd.length < len) pwd += all[randInt(0, all.length - 1)];

    // Karıştır
    pwd = pwd
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
    return pwd;
  };

  const makeRandomData = () => {
    const firstName = pick(firstNames);
    const lastName = pick(lastNames);
    const uniq = Date.now().toString().slice(-6) + randInt(10, 99); // çakışmayı azaltır

    const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${uniq}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}+${uniq}@${pick(
      safeDomains
    )}`;
    const password = genPassword();
    const address = `${pick(streets)} No:${randInt(1, 120)}, ${pick(
      districts
    )}, ${pick(cities)}`;

    return {
      firstName,
      lastName,
      email,
      username,
      password,
      address,
      phone: genPhoneTR(),
    };
  };

  const data = makeRandomData();

  // =========================
  // 2) HELPERS: FIND + SET
  // =========================
  const setValue = (el, value) => {
    if (!el) return false;

    // readonly/disabled ise doldurma
    if (el.disabled || el.readOnly) return false;

    el.focus();
    el.value = value;

    // SPA frameworkleri için event tetikle
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.blur();
    return true;
  };

  const findBySelectors = (selectors) => {
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
    return null;
  };

  // =========================
  // 3) SELECTOR MAP (GENERIC)
  // =========================
  const selectorsMap = {
    firstName: [
      'input[name="firstName"]',
      'input[name="firstname"]',
      'input[id*="first"][id*="name" i]',
      'input[placeholder*="First" i]',
      'input[placeholder*="Ad" i]',
    ],
    lastName: [
      'input[name="lastName"]',
      'input[name="lastname"]',
      'input[id*="last"][id*="name" i]',
      'input[placeholder*="Last" i]',
      'input[placeholder*="Soyad" i]',
    ],
    email: [
      'input[type="email"]',
      'input[name="email"]',
      'input[id*="email" i]',
      'input[placeholder*="email" i]',
      'input[placeholder*="e-posta" i]',
    ],
    username: [
      'input[name="username"]',
      'input[id*="user" i]',
      'input[placeholder*="username" i]',
      'input[placeholder*="kullanıcı" i]',
    ],
    password: [
      'input[type="password"][name="password"]',
      'input[type="password"][id*="password" i]',
      'input[type="password"]',
    ],
    confirmPassword: [
      'input[name*="confirm" i][type="password"]',
      'input[id*="confirm" i][type="password"]',
      'input[placeholder*="confirm" i][type="password"]',
      'input[placeholder*="doğrula" i][type="password"]',
    ],
    address: [
      'input[name="address"]',
      'input[id*="address" i]',
      'input[placeholder*="address" i]',
      'input[placeholder*="adres" i]',
    ],
    phone: [
      'input[type="tel"]',
      'input[name*="phone" i]',
      'input[id*="phone" i]',
      'input[placeholder*="phone" i]',
      'input[placeholder*="telefon" i]',
    ],
  };

  // =========================
  // 4) FILL LOGIC
  // =========================
  const results = [];

  results.push([
    "firstName",
    setValue(findBySelectors(selectorsMap.firstName), data.firstName),
  ]);
  results.push([
    "lastName",
    setValue(findBySelectors(selectorsMap.lastName), data.lastName),
  ]);
  results.push([
    "email",
    setValue(findBySelectors(selectorsMap.email), data.email),
  ]);
  results.push([
    "username",
    setValue(findBySelectors(selectorsMap.username), data.username),
  ]);

  // Password/Confirm logic
  const allPasswordInputs = Array.from(
    document.querySelectorAll('input[type="password"]')
  );
  const confirmEl = findBySelectors(selectorsMap.confirmPassword);

  if (confirmEl) {
    const passEl =
      allPasswordInputs.find((p) => p !== confirmEl) || allPasswordInputs[0];
    results.push(["password", setValue(passEl, data.password)]);
    results.push(["confirmPassword", setValue(confirmEl, data.password)]);
  } else if (allPasswordInputs.length >= 2) {
    results.push(["password", setValue(allPasswordInputs[0], data.password)]);
    results.push([
      "confirmPassword",
      setValue(allPasswordInputs[1], data.password),
    ]);
  } else if (allPasswordInputs.length === 1) {
    results.push(["password", setValue(allPasswordInputs[0], data.password)]);
  } else {
    results.push(["password", false]);
  }

  results.push([
    "address",
    setValue(findBySelectors(selectorsMap.address), data.address),
  ]);
  results.push([
    "phone",
    setValue(findBySelectors(selectorsMap.phone), data.phone),
  ]);

  // =========================
  // 5) FEEDBACK
  // =========================
  const okCount = results.filter((r) => r[1]).length;
  const fail = results.filter((r) => !r[1]).map((r) => r[0]);

  console.log("QA Autofill ✅ Random data used:", data);
  console.log(`QA Autofill: ${okCount}/${results.length} alan dolduruldu.`);
  if (fail.length) console.warn("Doldurulamayan alanlar:", fail);

  // İstersen mini toast gösterebiliriz (sonraki adım).
})();
