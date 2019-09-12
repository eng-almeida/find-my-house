import puppeteer from 'puppeteer';

import { 
  getQueryParamValue, 
  setQueryParamValue 
} from '../utils/url-helpers';
import Rental from '../types/rental/rental.interface';

export default async () => {
  const browser = await puppeteer.launch({ headless: false, devtools: true }); // 
  const page = await browser.newPage();
  const results: Rental[] = [];

  async function processPage(url: string) {
    await page.goto(url);

    const currentPage = +(getQueryParamValue(url, 'page') || 1);
    const rentals = await page.evaluate(() => {
      const extractNumber = (str: string): number | null => {
        const match = str.replace(' ', '').match(/([0-9]+)/);
        return match && +match[1];
      };

      const calculatePagesNumber = () => {
        const DEFAUT_PAGES_NUMBER = 1;
        const totalResultsEl: HTMLElement | null = document.querySelector('.before-offers .offers-index');
        if(!totalResultsEl) {
          return DEFAUT_PAGES_NUMBER;
        }
        const totalResults = extractNumber(totalResultsEl.innerText);
        return totalResults ? Math.ceil(totalResults/ 72) : DEFAUT_PAGES_NUMBER;
      }

      const pages = calculatePagesNumber(); 
      
      const getDataFromRental = (rowEl: HTMLElement, className: string) => {
        if(!rowEl) {
          return '';
        }

        const textEl: HTMLElement | null = rowEl.querySelector(`.${className}`);
        if(!textEl) {
          return '';
        }
        return textEl.innerText.trim();
      }

      const getLinkFromRental = (rowEl: HTMLElement) => {
        if(!rowEl) {
          return '';
        }
        
        const linkEl: HTMLLinkElement | null = rowEl.querySelector('.offer-item-header a');
        if(!linkEl) {
          return '';
        }
        return linkEl.href.trim();
      }

      const rentalRowsEl = document.querySelectorAll<HTMLElement>('.section-listing__row-content article');
      const data = Array.from(rentalRowsEl).map(tr => ({
        price: extractNumber(getDataFromRental(tr, 'offer-item-price')) || 0,
        title: getDataFromRental(tr, 'offer-item-title'),
        type: getDataFromRental(tr, 'offer-item-rooms'),
        area: extractNumber(getDataFromRental(tr, 'offer-item-area')) || 0,
        link: getLinkFromRental(tr),
      }));
      return Promise.resolve({ data, pages });
    });
    
    results.push(...rentals.data);

    if(currentPage < rentals.pages) {
      let nextUrl = `${url}&page=${currentPage + 1}`;
      if(getQueryParamValue(url, 'page')) {
        nextUrl = setQueryParamValue(url, 'page', (currentPage + 1).toString());
      }
      
      await processPage(nextUrl);
    }

    return results;
  }

  const rentals = await processPage('https://www.imovirtual.com/arrendar/apartamento/bonfim-porto/?nrAdsPerPage=72');
  await browser.close();
  return rentals;
}