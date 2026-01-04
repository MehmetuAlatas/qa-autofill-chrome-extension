const statusEl = document.getElementById("status");
const presetEl = document.getElementById("preset");
const btn = document.getElementById("fillBtn");

// Updates the popup UI status message and styling
const setStatus = (type, text) => {
  statusEl.className = `status ${type}`;
  statusEl.textContent = text;
};

btn.addEventListener("click", async () => {
  try {
    btn.disabled = true;
    btn.textContent = "Filling form...";

    // Get the currently active tab
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    const preset = presetEl.value;

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (presetName) => {
        // Run the autofill logic inside the active page context (simplest approach).
        // We can refactor this into a separate content script later if needed.

        const randInt = (min, max) =>
          Math.floor(Math.random() * (max - min + 1)) + min;

        const pick = (arr) => arr[randInt(0, arr.length - 1)];

        // English/global sample data pools
        const firstNames = [
          "John",
          "Michael",
          "David",
          "Emily",
          "Sarah",
          "Emma",
          "Olivia",
          "Daniel",
          "James",
          "Sophia",
        ];

        const lastNames = [
          "Smith",
          "Johnson",
          "Brown",
          "Taylor",
          "Anderson",
          "Thomas",
          "Jackson",
          "White",
          "Harris",
          "Martin",
        ];

        const streets = [
          "Main St.",
          "Oak Street",
          "Maple Avenue",
          "Pine Road",
          "Cedar Lane",
          "Elm Street",
        ];

        const districts = [
          "Downtown",
          "Midtown",
          "Uptown",
          "Central",
          "West Side",
          "East Side",
        ];

        const cities = [
          "New York",
          "Los Angeles",
          "Chicago",
          "San Francisco",
          "Seattle",
          "Austin",
        ];

        // Safe, non-real domains for testing
        const safeDomains = ["example.com", "testmail.com", "mail.test"];

        // Generates a neutral/international-style phone number (for testing only)
        const genPhone = () => {
          const start = randInt(200, 999); // area-like prefix
          let rest = "";
          for (let i = 0; i < 7; i++) rest += randInt(0, 9);
          return `${start}${rest}`; // 10 digits total
        };

        // Generates a strong random password
        const genPassword = () => {
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

          pwd = pwd
            .split("")
            .sort(() => Math.random() - 0.5)
            .join("");

          return pwd;
        };

        // Builds one full random dataset for form filling
        const makeRandomData = () => {
          const firstName = pick(firstNames);
          const lastName = pick(lastNames);
          const uniq = Date.now().toString().slice(-6) + randInt(10, 99);

          const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${uniq}`;
          const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}+${uniq}@${pick(
            safeDomains
          )}`;
          const password = genPassword();
          const address = `${pick(streets)} ${randInt(10, 999)}, ${pick(
            districts
          )}, ${pick(cities)}`;

          return {
            firstName,
            lastName,
            email,
            username,
            password,
            address,
            phone: genPhone(),
          };
        };

        const data = makeRandomData();

        // Sets the value and triggers common framework events (React/Angular/etc.)
        const setValue = (el, value) => {
          if (!el || el.disabled || el.readOnly) return false;
          el.focus();
          el.value = value;
          el.dispatchEvent(new Event("input", { bubbles: true }));
          el.dispatchEvent(new Event("change", { bubbles: true }));
          el.blur();
          return true;
        };

        // Tries multiple selectors and returns the first match
        const findBySelectors = (selectors) => {
          for (const sel of selectors) {
            const el = document.querySelector(sel);
            if (el) return el;
          }
          return null;
        };

        // Common selector variations for typical form fields
        const selectorsMap = {
          firstName: [
            'input[name="firstName"]',
            'input[name="firstname"]',
            'input[id*="first"][id*="name" i]',
            'input[placeholder*="First" i]',
            'input[placeholder*="Name" i]',
          ],
          lastName: [
            'input[name="lastName"]',
            'input[name="lastname"]',
            'input[id*="last"][id*="name" i]',
            'input[placeholder*="Last" i]',
            'input[placeholder*="Surname" i]',
          ],
          email: [
            'input[type="email"]',
            'input[name="email"]',
            'input[id*="email" i]',
            'input[placeholder*="email" i]',
          ],
          username: [
            'input[name="username"]',
            'input[id*="user" i]',
            'input[placeholder*="username" i]',
            'input[placeholder*="user name" i]',
          ],
          confirmPassword: [
            'input[name*="confirm" i][type="password"]',
            'input[id*="confirm" i][type="password"]',
            'input[placeholder*="confirm" i][type="password"]',
            'input[placeholder*="re-enter" i][type="password"]',
          ],
          address: [
            'input[name="address"]',
            'input[id*="address" i]',
            'input[placeholder*="address" i]',
          ],
          phone: [
            'input[type="tel"]',
            'input[name*="phone" i]',
            'input[id*="phone" i]',
            'input[placeholder*="phone" i]',
            'input[placeholder*="mobile" i]',
          ],
        };

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

        // Password & confirm password handling
        const allPasswordInputs = Array.from(
          document.querySelectorAll('input[type="password"]')
        );
        const confirmEl = findBySelectors(selectorsMap.confirmPassword);

        if (confirmEl) {
          const passEl =
            allPasswordInputs.find((p) => p !== confirmEl) ||
            allPasswordInputs[0];
          results.push(["password", setValue(passEl, data.password)]);
          results.push(["confirmPassword", setValue(confirmEl, data.password)]);
        } else if (allPasswordInputs.length >= 2) {
          results.push([
            "password",
            setValue(allPasswordInputs[0], data.password),
          ]);
          results.push([
            "confirmPassword",
            setValue(allPasswordInputs[1], data.password),
          ]);
        } else if (allPasswordInputs.length === 1) {
          results.push([
            "password",
            setValue(allPasswordInputs[0], data.password),
          ]);
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

        const okCount = results.filter((r) => r[1]).length;
        const fail = results.filter((r) => !r[1]).map((r) => r[0]);

        console.log("QA Autofill ✅ Random data generated:", data);
        return { okCount, total: results.length, fail, data };
      },
      args: [preset],
    });

    const { okCount, total, fail } = results[0].result;

    if (okCount === total) {
      setStatus("ok", `✅ Success: ${okCount}/${total} fields filled.`);
    } else if (okCount > 0) {
      setStatus(
        "warn",
        `⚠️ Partial success: ${okCount}/${total} filled. Missing: ${fail.join(
          ", "
        )}`
      );
    } else {
      setStatus(
        "err",
        "❌ No fields detected. This page may use different naming conventions."
      );
    }

    btn.textContent = "Fill Form";
    btn.disabled = false;
  } catch (e) {
    console.error(e);
    setStatus("err", "❌ An error occurred. Check the console for details.");
    btn.textContent = "Fill Form";
    btn.disabled = false;
  }
});
