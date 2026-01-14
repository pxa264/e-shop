const {getRequestConfig} = require('next-intl/server');

module.exports = getRequestConfig(async ({requestLocale}) => {
  let locale = await requestLocale;
 
  if (!locale || !['zh', 'en'].includes(locale)) {
    locale = 'zh';
  }
 
  return {
    locale,
    messages: require(`../messages/${locale}.json`)
  };
});
