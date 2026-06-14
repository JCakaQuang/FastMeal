import { By, until } from "selenium-webdriver";

export async function runLoginTests(driver, baseUrl) {
  await driver.get(baseUrl);

  const loginBtn = await driver.wait(
    until.elementLocated(By.xpath("//button[normalize-space()='Đăng nhập']")),
    10000,
  );
  await loginBtn.click();

  await driver.wait(
    until.elementLocated(By.xpath("//h2[contains(.,'ĐĂNG NHẬP')]")),
    10000,
  );

  const testIdentifier = `invalid_user_${Date.now()}`;
  await driver.findElement(By.css("input[placeholder='Email hoặc username']")).sendKeys(testIdentifier);
  await driver.findElement(By.css("input[placeholder='Nhập mật khẩu']")).sendKeys("wrongpass");

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    await driver.findElement(By.xpath("//button[normalize-space()='ĐĂNG NHẬP']")).click();
    await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(),'Tài khoản hoặc mật khẩu không đúng')]")),
      10000,
    );
    await driver.wait(async () => {
      const button = await driver.findElement(By.xpath("//button[normalize-space()='ĐĂNG NHẬP']"));
      return button.isEnabled();
    }, 10000);
  }

  await driver.findElement(By.xpath("//button[normalize-space()='ĐĂNG NHẬP']")).click();

  await driver.wait(
    until.elementLocated(By.xpath("//*[contains(text(),'Xác minh captcha')]")),
    10000,
  );
  await driver.wait(
    until.elementLocated(
      By.xpath("//*[contains(text(),'Bạn đã đăng nhập sai quá 5 lần liên tiếp')]"),
    ),
    10000,
  );
  await driver.wait(
    until.elementLocated(By.css("input[placeholder='Nhập kết quả captcha']")),
    10000,
  );
}
