"use client";

import Script from 'next/script';
import { useEffect } from 'react';

export function GoogleTranslateScript() {
    useEffect(() => {
        // @ts-ignore
        window.googleTranslateElementInit = () => {
            // @ts-ignore
            new window.google.translate.TranslateElement({
                pageLanguage: 'fr',
                includedLanguages: 'fr,en,es,zh-CN,de,it',
                autoDisplay: false,
                // @ts-ignore
                layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
            }, 'google_translate_element');
        };
    }, []);

    return (
        <>
            <div id="google_translate_element" style={{ display: 'none' }}></div>
            <Script
                src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
                strategy="afterInteractive"
            />
        </>
    );
}

declare global {
    interface Window {
        googleTranslateElementInit: () => void;
        google: any;
    }
}
