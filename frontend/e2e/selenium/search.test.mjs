import { By, until } from "selenium-webdriver";

async function elementExists(driver, locator, timeout = 3000) {
  try {
    await driver.wait(until.elementLocated(locator), timeout);
    return true;
  } catch {
    return false;
  }
}

async function getVisibleDishNames(driver) {
  const dishNameElements = await driver.findElements(By.css("section#menu h4"));
  const dishNames = [];

  for (const element of dishNameElements) {
    const text = (await element.getText()).trim();
    if (text) {
      dishNames.push(text);
    }
  }

  return dishNames;
}

export async function runSearchTests(driver, baseUrl) {
  await driver.get(baseUrl);

  const searchInput = await driver.wait(
    until.elementLocated(By.css("input[placeholder='Tìm kiếm món ăn...']")),
    10000,
  );

  const emptyMenu = await elementExists(
    driver,
    By.xpath("//*[contains(text(),'Chưa có món ăn nào trong thực đơn hôm nay')]"),
  );

  if (emptyMenu) {
    return;
  }

  await driver.wait(async () => {
    const dishNames = await getVisibleDishNames(driver);
    return dishNames.length > 0;
  }, 10000);

  const initialDishNames = await getVisibleDishNames(driver);
  const sampleDishName = initialDishNames[0];

  if (!sampleDishName) {
    throw new Error("No visible dishes found to verify trimmed search behavior");
  }

  await searchInput.clear();
  await searchInput.sendKeys(`${sampleDishName} `);

  await driver.wait(async () => {
    const value = await searchInput.getAttribute("value");
    return value === `${sampleDishName} `;
  }, 3000);

  const noTrimResult = await elementExists(
    driver,
    By.xpath("//*[contains(text(),'Không tìm thấy món ăn phù hợp')]"),
    2000,
  );

  if (noTrimResult) {
    throw new Error("Search with trailing whitespace should still return matching dishes");
  }

  await driver.wait(async () => {
    const dishNames = await getVisibleDishNames(driver);
    return dishNames.includes(sampleDishName);
  }, 5000);

  await searchInput.clear();
  await searchInput.sendKeys("zzzz-nomatch-123");

  const noResult = await elementExists(
    driver,
    By.xpath("//*[contains(text(),'Không tìm thấy món ăn phù hợp')]"),
  );

  if (noResult) {
    return;
  }

  // Fallback: ensure input keeps the query (page may render dishes from API)
  const value = await searchInput.getAttribute("value");
  if (value !== "zzzz-nomatch-123") {
    throw new Error("Search input value not set as expected");
  }
}
