const { Builder, until } = require('selenium-webdriver');
const edge = require('selenium-webdriver/edge');
const edgedriver = require('ms-chromium-edge-driver');
const path = require('path');

const createDriver = async () => {
  const options = new edge.Options();
  options.addArguments('--headless=new');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--disable-gpu');
  options.addArguments('--window-size=1280,720');

  const driverPath = path.join(__dirname, '../../drivers/msedgedriver.exe');
  const service = new edge.ServiceBuilder(driverPath);

  const driver = await new Builder()
    .forBrowser('MicrosoftEdge')
    .setEdgeOptions(options)
    .setEdgeService(service)
    .build();

  return driver;
};

const waitAndClick = async (driver, locator, timeout = 8000) => {
  const { until } = require('selenium-webdriver');
  const el = await driver.wait(until.elementLocated(locator), timeout);
  await driver.wait(until.elementIsVisible(el), timeout);
  await el.click();
  return el;
};

const fillField = async (driver, locator, value, timeout = 8000) => {
  const el = await driver.wait(until.elementLocated(locator), timeout);
  await driver.wait(until.elementIsVisible(el), timeout);
  await el.clear();
  await el.sendKeys(value);
};
module.exports = { createDriver, waitAndClick, fillField };