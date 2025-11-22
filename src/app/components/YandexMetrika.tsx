'use client';

import { useEffect, useState } from 'react';

const YandexMetrika = () => {
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (cookieConsent === 'accepted') {
      setConsent(true);
    }
  }, []);

  if (!consent) return null;

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(m,e,t,r,i,k,a){m[i]=m[i]function(){(m[i].a=m[i].a[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js?id=105383661','ym');ym(105383661,'init',{ssr:true,webvisor:true,clickmap:true,ecommerce:"dataLayer",accurateTrackBounce:true,trackLinks:true});`,
        }}
      />
      <noscript>
        <div>
          <img
            src="https://mc.yandex.ru/watch/105383661"
            style={{ position: 'absolute', left: '-9999px' }}
            alt=""
           loading="lazy"/>
        </div>
      </noscript>
    </>
  );
};

export default YandexMetrika;