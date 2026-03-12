const { By, until } = require('selenium-webdriver');
const { createDriver, fillField } = require('./helpers/driver');

describe('E2E — Gestion des tâches', () => {
  let driver;

  const login = async () => {
    await driver.get('http://localhost:3000/login');
    await driver.wait(until.elementLocated(By.css('form')), 10000);
    await driver.sleep(500);
    await fillField(driver, By.css('input[type="email"]'), 'admin@test.com');
    await fillField(driver, By.css('input[type="password"]'), 'password');
    await driver.findElement(By.css('button[type="submit"]')).click();
    await driver.wait(until.urlContains('/dashboard'), 10000);
    await driver.sleep(500);
  };

  const ouvrirModaleTache = async () => {
  const btn = await driver.wait(
    until.elementLocated(By.css('button.btn-primary')),
    8000
  );
  await btn.click();
  await driver.wait(until.elementLocated(By.css('.modal')), 5000);
  await driver.sleep(300);
};

  beforeAll(async () => {
    driver = await createDriver();
  }, 30000);

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  test('affiche le dashboard après connexion', async () => {
    await login();
    const url = await driver.getCurrentUrl();
    expect(url).toContain('/dashboard');
  });

  test('ouvre la modale de création de tâche', async () => {
    await login();
    await ouvrirModaleTache();

    const titreInput = await driver.findElement(By.css('input[name="title"]'));
    expect(await titreInput.isDisplayed()).toBe(true);
  });

  test('créer une nouvelle tâche et la voir apparaître', async () => {
    await login();
    await ouvrirModaleTache();

    const titreTache = `Tâche E2E ${Date.now()}`;

    await fillField(driver, By.css('input[name="title"]'), titreTache);
    await fillField(driver, By.css('textarea[name="description"]'), 'Créée par Selenium');

    await driver.findElement(By.css('button.btn-primary')).click();

    await driver.wait(
      until.elementLocated(By.xpath(`//*[contains(text(),'${titreTache}')]`)),
      8000
    );
    const el = await driver.findElement(By.xpath(`//*[contains(text(),'${titreTache}')]`));
    expect(await el.isDisplayed()).toBe(true);
  });

  test('créer une tâche avec priorité haute', async () => {
    await login();
    await ouvrirModaleTache();

    const titreTache = `Priorité E2E ${Date.now()}`;
    await fillField(driver, By.css('input[name="title"]'), titreTache);

    const prioritySelect = await driver.findElement(By.css('select[name="priority"]'));
    await prioritySelect.sendKeys('Haute');

    await driver.findElement(By.css('button.btn-primary')).click();

    await driver.wait(
      until.elementLocated(By.xpath(`//*[contains(text(),'${titreTache}')]`)),
      8000
    );
    const el = await driver.findElement(By.xpath(`//*[contains(text(),'${titreTache}')]`));
    expect(await el.isDisplayed()).toBe(true);
  });

  test('annuler la création ferme la modale', async () => {
    await login();
    await ouvrirModaleTache();

    await driver.findElement(By.css('button.btn-secondary')).click();
    await driver.sleep(500);

    const modales = await driver.findElements(By.css('.modal'));
    expect(modales.length).toBe(0);
  });

  test('déconnexion → redirige vers le login', async () => {
    await login();

    const logoutBtn = await driver.wait(
      until.elementLocated(By.xpath("//button[contains(text(),'Déconnexion') or contains(text(),'Logout') or contains(text(),'Se déconnecter')]")),
      8000
    );
    await logoutBtn.click();

    await driver.wait(until.urlContains('/login'), 5000);
    const url = await driver.getCurrentUrl();
    expect(url).toContain('/login');
  });
});