import { URL, URLSearchParams } from 'url';

export const getQueryParamValue = (url: string, queryParam: string) =>  {
  if(!url || !queryParam) {
    return null;
  }
  return new URLSearchParams(new URL(url).search).get(queryParam);
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