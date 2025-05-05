
import managerFinanceImg from '../img/my-projects/qw.jpg';
import managerFinanceImg2x from '../img/my-projects/qw-x2-min.jpg';

import vegetablesImg from '../img/my-projects/vegetables.jpg';
import vegetablesImg2x from '../img/my-projects/vegetables-x2-min.jpg';

import discoverImg from '../img/my-projects/discover.jpg';
import discoverImg2x from '../img/my-projects/discover-x2-min.jpg';

import transformYourImg from '../img/my-projects/transform-your.jpg';
import transformYourImg2x from '../img/my-projects/transform-your-x2-min.jpg';

import traditionsUkraineImg from '../img/my-projects/traditions-ukraine.jpg';
import traditionsUkraineImg2x from '../img/my-projects/traditions-ukarain-x2-min.jpg';

import getBodyImg from '../img/my-projects/get-body.jpg';
import getBodyImg2x from '../img/my-projects/get-body-x2-min.jpg';

import miminoImg from '../img/my-projects/mimino.jpg';
import miminoImg2x from '../img/my-projects/mimino-x2-min.jpg';

import brandImg from '../img/my-projects/brand.jpg';
import brandImg2x from '../img/my-projects/brand-x2-min.jpg';

import freshImg from '../img/my-projects/fresh.jpg';
import freshImg2x from '../img/my-projects/fresh-x2-min.jpg';

import turnYourImg from '../img/my-projects/turn-your.jpg';
import turnYourImg2x from '../img/my-projects/turn-your-x2-min.jpg';

import arrowIcon from '../img/symbol-defs.svg#icon-arrow';

const projects = [
    {
        title: "House MarketPlace",
        image: managerFinanceImg,
        image2x: managerFinanceImg2x,
        techStack: "Find and list houses for sale or for rent. This is a React / Firebase v9 project from the React Front To Back 2022 course.",
        link: "https://github.com/Max6711/house-marketplace",
        alt: "Wallet Webservice Project",
        svg: arrowIcon
    },
    {
        title: "The Shop App",
        image: vegetablesImg,
        image2x: vegetablesImg2x,
        techStack: "React, JavaScript, Node JS, Git",
        link: "https://github.com/Max6711/ShopMarketPLace",
        alt: "Green harvest",
        svg: arrowIcon
    },
    {
        title: "Cryptocurrency Website",
        image: discoverImg,
        image2x: discoverImg2x,
        techStack: "React, JavaScript, Tailwind Css, Node JS, Git",
        link: "https://github.com/Max6711/CryptocurrencyMW",
        alt: "English Exellence",
        svg: arrowIcon
    },
    {
        title: "Web Service",
        image: transformYourImg,
        image2x: transformYourImg2x,
        techStack: "NextJS, TypeScript, Git",
        link: "https://github.com/Max6711/WebService",
        alt: "Transform your",
        svg: arrowIcon
    },
    {
        title: "Ukraine traditions webservice (Coming soon)",
        image: traditionsUkraineImg,
        image2x: traditionsUkraineImg2x,
        techStack: "React, JavaScript, Node JS, Git",
        link: "https://github.com/Max6711",
        alt: "Ukraine traditions",
        svg: arrowIcon
    },
    {
        title: "Stay Healthy webservice (Coming soon)",
        image: getBodyImg,
        image2x: getBodyImg2x,
        techStack: "React, JavaScript, Node JS, Git",
        link: "https://github.com/Max6711",
        alt: "Stay Healthy",
        svg: arrowIcon
    },
    {
        title: "Mimino webservice (Coming soon)",
        image: miminoImg,
        image2x: miminoImg2x,
        techStack: "React, JavaScript, Node JS, Git",
        link: "https://github.com/Max6711",
        alt: "Mimino",
        svg: arrowIcon
    },
    {
        title: "Transformation with a Touch of the Brush webservice (Coming soon)",
        image: brandImg,
        image2x: brandImg2x,
        techStack: "React, JavaScript, Node JS, Git",
        link: "https://github.com/Max6711",
        alt: "Transformation with a Touch of the Brush",
        svg: arrowIcon
    },
    {
        title: "Fresh harvest box webservice (Coming soon)",
        image: freshImg,
        image2x: freshImg2x,
        techStack: "React, JavaScript, Node JS, Git",
        link: "https://github.com/Max6711",
        alt: "Fresh harvest box",
        svg: arrowIcon
    },
    {
        title: "Transform your business webservice (Coming soon)",
        image: turnYourImg,
        image2x: turnYourImg2x,
        techStack: "React, JavaScript, Node JS, Git",
        link: "https://github.com/Max6711",
        alt: "Transform your business",
        svg: arrowIcon
    }
];


    let currentIndex = 0;
    const projectsPerPage = 3;
    let observer;

    function loadProjects() {
        const projectListEl = document.querySelector('.project-list');
        const projectsToLoad = projects.slice(currentIndex, currentIndex + projectsPerPage);

        const projectsItems = projectsToLoad.map(({image, image2x, alt, techStack, title, link, svg }, index) => {
            const directionClass = (currentIndex + index) % 2 === 0 ? 'left' : 'right';
            return `
            <li class="project-item ${directionClass}">
                <img  srcset="${image} 1x, ${image2x} 2x" src="${image}"  alt="${alt}" class="project-image">
                <div class="project-content">
                    <p class="project-tech">${techStack}</p>
                    <div class="project-name-btn">
                        <h3 class="project-name">${title}</h3>
                        <div class="centered">
                            <button type="button" class="project-button">
                                <a href="${link}" class="project-link" target="_blank">VISIT
                                    <svg class="project-icon">
                                        <use href="${svg}"></use>
                                    </svg>
                                </a>
                            </button>
                        </div>
                    </div>
                </div>
            </li>
            `;
        }).join('');

        projectListEl.innerHTML += projectsItems;
        
        
        const newProjectItems = document.querySelectorAll('.project-item:not(.observed)');
        newProjectItems.forEach((item) => {
            observer.observe(item);
            item.classList.add('observed');
        });
        
        currentIndex += projectsPerPage;
    

        if (currentIndex >= projects.length) {
            document.querySelector('.load-more').style.display = 'none';
        }
    }

    document.querySelector('.load-more').addEventListener('click', loadProjects);

    observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                observer.unobserve(entry.target);
            }
        });
    });
    loadProjects();
