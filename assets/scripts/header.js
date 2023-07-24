(() => {
    setHeaderHeight = () => {
        const root = document.documentElement;
        const height = document.querySelector('header').clientHeight;
        root.style.setProperty('--header-height',  `${height}px`);
    }
    
    window.addEventListener('load', setHeaderHeight);
    window.addEventListener('resize', setHeaderHeight);
    setHeaderHeight();
})();