import { URL, URLSearchParams } from 'url';

export const getQueryParamValue = (url: string, queryParam: string) =>  {
  if(!url || !queryParam) {
    return null;
  }
  return new URLSearchParams(new URL(url).search).get(queryParam);
}

export const getParamValueFromURL = (urlStr: string, value: string) => {
  if (!urlStr || !value) {
    return null;
  }
  const url = new URL(urlStr);
  const match = url.pathname.split('/').find((path) => path.includes(value));
  if (match) {
    return match.split('-')[1];
  }
}

export const setParamValueToURL = (url: string, queryParam: string, queryParamValue: string) => {
  if (!url || !queryParam || !queryParamValue) {
    return '';
  }

  const resultUrl = new URL(url);
  const match = resultUrl.pathname.split('/').find((path) => path.includes(queryParam));
  if (match) {
    return url.replace(match, `${queryParam}-${queryParamValue}`);
  } else {
    return url;
  }
}
      
export const setQueryParamValue = (url: string, queryParam: string, queryParamValue: string) =>  {
  if(!url || !queryParam || !queryParamValue) {
    return '';
  }

  const resultUrl = new URL(url);
  const resultUrlSearchParams = new URLSearchParams(resultUrl.search);
  resultUrlSearchParams.set(queryParam, queryParamValue);
  resultUrl.search = resultUrlSearchParams.toString();
  return resultUrl.toString();
}