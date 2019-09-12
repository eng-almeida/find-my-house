import puppeteer from 'puppeteer';
import randomUserAgent from 'random-useragent';

import {
  getParamValueFromURL,
  setParamValueToURL,
} from '../utils/url-helpers';
import Rental from '../types/rental/rental.interface';

export default async () => {
  const browser = await puppeteer.launch({ headless: false, devtools: true }); // 
  const context = await browser.createIncognitoBrowserContext();

  const results: Rental[] = [];

  async function processPage(url: string) {
    const page = await context.newPage();
    await page.setUserAgent(randomUserAgent.getRandom() || '5.0(Windows NT 10.0; Win64; x64) AppleWebKit / 537.36(KHTML, like Gecko) Chrome / 69.0.3497.100 Safari / 537.36');
    await page.goto(url);

    const currentPage = +(getParamValueFromURL(url, 'pagina') || 1);
    const rentals = await page.evaluate(() => {
      const extractNumber = (str: string): number | null => {
        return +(str.replace('€/mês', '').replace('.', ''))
      };

      const calculatePagesNumber = () => {
        const DEFAUT_PAGES_NUMBER = 1;
        const totalResultsEl: HTMLElement | null = document.querySelector('.current-level .breadcrumb-info');
        if (!totalResultsEl) {
          return DEFAUT_PAGES_NUMBER;
        }
        const totalResults = extractNumber(totalResultsEl.innerText);
        return totalResults ? Math.ceil(totalResults / 30) : DEFAUT_PAGES_NUMBER;
      }

      const pages = calculatePagesNumber();

      const getDataFromRental = (rowEl: HTMLElement, className: string) => {
        if (!rowEl) {
          return '';
        }

        const textEl: HTMLElement | null = rowEl.querySelector(`.${className}`);
        if (!textEl) {
          return '';
        }
        return textEl.innerText.trim();
      }

      const getLinkFromRental = (rowEl: HTMLElement) => {
        if (!rowEl) {
          return '';
        }

        const linkEl: HTMLLinkElement | null = rowEl.querySelector('.item-link');
        if (!linkEl) {
          return '';
        }
        return linkEl.href.trim();
      }

      const rentalRowsEl = document.querySelectorAll<HTMLElement>('.items-container article');
      const data = Array.from(rentalRowsEl).map(tr => ({
        price: extractNumber(getDataFromRental(tr, 'item-price')) || 0,
        title: getDataFromRental(tr, 'item-link '),
        type: getDataFromRental(tr, 'item-detail'),
        area: extractNumber(getDataFromRental(tr, 'offer-item-area')) || 0,
        link: getLinkFromRental(tr),
      }));
      return Promise.resolve({ data, pages });
    });

    results.push(...rentals.data);

    if (currentPage < rentals.pages) {
      let nextUrl = `${url}pagina-${currentPage + 1}`;
      if (getParamValueFromURL(url, 'pagina')) {
        nextUrl = setParamValueToURL(url, 'pagina', (currentPage + 1).toString());
      }
      await processPage(nextUrl);
    }

    return results;
  }

  const rentals = await processPage('https://www.idealista.pt/arrendar-casas/vila-nova-de-gaia/');
  await browser.close();
  return rentals;
}