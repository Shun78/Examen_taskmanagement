const { By, until } = require('selenium-webdriver');
const { createDriver, fillField } = require('./helpers/driver');

const BASE_URL = 'http://localhost:3000/login';

describe('E2E — Page de connexion', () => {
  let driver;

  beforeAll(async () => {
    driver = await createDriver();
  }, 30000);

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  beforeEach(async () => {
    await driver.get(BASE_URL);
    await driver.wait(until.elementLocated(By.css('form')), 10000);
    await driver.sleep(500);
  });

  test('affiche le formulaire de connexion', async () => {
    const emailInput    = await driver.findElement(By.css('input[type="email"]'));
    const passwordInput = await driver.findElement(By.css('input[type="password"]'));
    const submitBtn     = await driver.findElement(By.css('button[type="submit"]'));

    expect(await emailInput.isDisplayed()).toBe(true);
    expect(await passwordInput.isDisplayed()).toBe(true);
    expect(await submitBtn.isDisplayed()).toBe(true);
  });

  test('connexion réussie avec bons identifiants', async () => {
    await fillField(driver, By.css('input[type="email"]'), 'admin@test.com');
    await fillField(driver, By.css('input[type="password"]'), 'password');
    await driver.findElement(By.css('button[type="submit"]')).click();

    await driver.wait(until.urlContains('/dashboard'), 10000);
    const url = await driver.getCurrentUrl();
    expect(url).toContain('/dashboard');
  });

  test('mauvais mot de passe → message d\'erreur visible', async () => {
    await fillField(driver, By.css('input[type="email"]'), 'admin@test.com');
    await fillField(driver, By.css('input[type="password"]'), 'mauvais_mdp');
    await driver.findElement(By.css('button[type="submit"]')).click();

    await driver.wait(until.elementLocated(By.css('.error-message')), 5000);
    const erreur = await driver.findElement(By.css('.error-message')).getText();
    expect(erreur.length).toBeGreaterThan(0);
  });

  test('champs vides → le formulaire ne se soumet pas', async () => {
    await driver.findElement(By.css('button[type="submit"]')).click();
    await driver.sleep(1000);

    const url = await driver.getCurrentUrl();
    expect(url).toContain('/login');
  });
});