'use strict';

//Prevent FOUC (Flash of Unstyled Content)
document.addEventListener('DOMContentLoaded', () => {
    const app = document.querySelector('.app');
    app.classList.remove('no-fouc');
});

(async function () {
    //Store promise from fetch data
    const getKrData = fetchJSONData('src/heroesData.json');

    function fetchJSONData(url) {
        return fetch(url)
            .then((response) => {
                if (response.status !== 200) {
                    console.log('Looks like there was a problem. Status Code: ' +
                        response.status);
                    return;
                }
                return response.json();
            })
            .then((json) => {
                return json;
            })
            .catch((err) => {
                console.log('Fetch Error :-S', err);
            });
    }

    //krData store required 'database'
    const krData = await getKrData; //Wait for promises to be solved before continue the code

    initialize();

    //Sets up app logic. Contains and declares all required variables, functions.
    function initialize() {
        //Grab all the UI elements that need to manipulate
        const krClassesIcon = document.querySelectorAll('.classes-list__icon');
        const krHeroesAvatarContent = document.querySelector('.kr-heroes');
        const krHeroesAvatarContainer = document.querySelector('.heroes-list');
        const heroMenuBrand = document.querySelector('.hero-menu__brand');
        const heroMenuItems = document.querySelectorAll('.hero-menu__item');
        const leftContentContainer = document.querySelector('.left-content__container');
        const heroProfile = document.querySelector('.placeholder__profile');
        const heroCommon = document.querySelector('.placeholder__common');
        const heroSkills = document.querySelector('.placeholder__skills');
        const heroTranscend = document.querySelector('.placeholder__transcend');
        const heroWeapon = document.querySelector('.unique-weapon');
        const heroTreasureS2 = document.querySelector('.treasure-s2');
        const heroTreasureS3 = document.querySelector('.treasure-s3');
        const skillDetail = document.querySelector('.skill-detail');
        const mainHeroInfo = document.querySelector('.main-info');
        const menuItemProfile = document.querySelector('.menu-item-profile');

        //krHeroesData containts all kr heroes
        const krHeroesData = krData.hero;
        const uniqueStatsData = krData.uniqueItemStat;
        const transcendData = krData.transcend;

        //krHeroesAvatar contains hero avatar UI elements which will be assigned later
        let krHeroesAvatar;

        //menuTypeArr contains all the options which available from hero-menu
        const menuTypeArr = ['Profile', 'Common', 'Skills', 'Transcend',
            'UW', 'UT S2', 'UT S3'];

        //Default unique star for unique items
        let uniqueStar = 0;

        //krHero hold data of the current hero
        //menuType hold the current hero-menu
        let krHero;
        let menuType;

        let hasLinkedSkill = false;

        //Handle everything that needed on first page load
        (function handleOnFirstLoad() {
            loadHeroesAvatar();
            //Grab hero avatar UI elements that need to manipulate
            krHeroesAvatar = document.querySelectorAll('.heroes-list__avatar');
            addEventForHeroesAvatar();

            //Check if the hash is not empty
            if (location.hash !== '') {
                const heroName = getHeroNameFromHash();
                //Check if hero name is invalid
                if (getKrHero(heroName) === undefined) {
                    location.href = '/';
                }
                //If hero name is valid, assign current hero data to krHero
                krHero = getKrHero(heroName);

                menuType = getMenuTypeFromHash();
                //Check if menuType is invalid
                if (menuTypeArr.indexOf(menuType) === -1) {
                    location.href = '/';
                }
            } else {
                //If the hash is empty, set default of the current hero data to the frist hero
                //set default of the current hero-menu
                krHero = krHeroesData[0];
                menuType = 'Common';
            }

            changeHeroAvatarSelected(krHero.name);
            changeMenuItemSelected(menuType);
            changeHeroMenuBrand(krHero.name);
            loadLeftHeroImage(krHero.name);
            loadHeroInfo();
            scrollHeroAvatarIntoView(krHero.name);
        })();

        //Handle when hash change
        onhashchange = handleOnHashChange;

        function handleOnHashChange() {
            changeHeroMenuBrand(krHero.name);
            loadLeftHeroImage(krHero.name);
            loadHeroInfo();
        }

        //Get data of kr hero
        function getKrHero(heroName) {
            const index = findHeroIndex(heroName);
            return krHeroesData[index];
        }

        function findHeroIndex(heroName) {
            return krHeroesData.findIndex((hero) => hero.name === heroName);
        }

        function loadHeroesAvatar() {
            let html = '';
            krHeroesData.forEach((hero) => {
                html += `
                <li class="heroes-list__item list-inline-item">
                    <img class="heroes-list__avatar img-thumbnail lazyload"
                        src="data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA="
                        data-src="images/avatars/${hero.name}.png"
                        alt="${hero.name}">
                </li>
            `;
            });
            krHeroesAvatarContainer.innerHTML = html;
        }

        function addEventForHeroesAvatar() {
            krHeroesAvatar.forEach((avatar) => {
                avatar.addEventListener('click', handleHeroAvatarOnClick);
            });
        }

        function handleHeroAvatarOnClick() {
            const heroName = this.alt;
            krHero = getKrHero(heroName);
            changeHeroAvatarSelected(heroName);
            changeHash();
        }

        function changeHeroAvatarSelected(heroName) {
            krHeroesAvatar.forEach((avatar) => {
                const avatarName = avatar.alt;
                avatar.classList.toggle(
                    'heroes-list__avatar--selected',
                    avatarName === heroName
                );
            });
        }

        function scrollHeroAvatarIntoView(heroName) {
            const index = findHeroIndex(heroName);
            krHeroesAvatar[index].scrollIntoView(
                { behavior: "instant", block: "end", inline: "center" }
            );
        }

        function changeHash() {
            //Ex: location.hash = 'hero=Kasel&menu=Common';
            location.hash = `hero=${krHero.name}&menu=${menuType}`;
        }

        function checkValidHashFormat(hashStr) {
            return (hashStr.indexOf('hero=') !== -1) &&
                (hashStr.indexOf('&menu=') !== -1);
        }

        function getHeroNameFromHash() {
            const hashStr = location.hash;

            if (checkValidHashFormat(hashStr) === false) {
                return '';
            }

            return hashStr.substring(
                hashStr.indexOf('hero=') + 5,
                hashStr.indexOf('&menu=')
            );
        }

        function getMenuTypeFromHash() {
            const hashStr = location.hash;

            if (checkValidHashFormat(hashStr) === false) {
                return '';
            }

            return hashStr.substring(hashStr.indexOf('menu=') + 5);
        }

        function changeHeroMenuBrand(heroName) {
            heroMenuBrand.innerHTML = `
                <img class="hero-menu__brand-img"
                    src="images/avatars/${heroName}.png"
                    alt="${heroName}"> ${heroName}
            `;
        }

        function loadLeftHeroImage(heroName) {
            if (leftContentContainer.getAttribute('data-hero-name') !== heroName) {
                changeLeftHeroImage(heroName);
                leftContentContainer.setAttribute('data-hero-name', heroName);
            }
        }

        function changeLeftHeroImage(heroName) {
            const html = `
                <img class="left-content__hero-image lazyload"
                    src="data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA="
                    data-src="images/heroes/${heroName}/${heroName}.png"
                    alt="${heroName}">
            `;
            leftContentContainer.innerHTML = html;
        }

        //Handle events when click on Kr classes icon
        (function addEvenForKrClassIconOnClick() {
            krClassesIcon.forEach((krClass) => {
                krClass.addEventListener('click', handleKrClassIconOnClick);
            });
        })();

        function handleKrClassIconOnClick() {
            krClassesIcon.forEach((krClass) => {
                krClass.classList.remove('classes-list__icon--selected');
            });
            this.classList.add('classes-list__icon--selected');
            const krClass = this.getAttribute('data-class-type');
            sortHeroesByClass(krClass);
        }

        function sortHeroesByClass(krClass) {
            krHeroesAvatar.forEach((avatar) => {
                if (krClass === 'All') {
                    avatar.parentNode.classList.remove('hidden');
                    return;
                }
                const heroName = avatar.alt;
                const heroIndex = findHeroIndex(heroName);
                avatar.parentNode.classList.toggle(
                    'hidden',
                    (krHeroesData[heroIndex].class !== krClass)
                );
            });
        }

        //Handle events when click on hero menu item
        (function addEventForHeroMenuItemOnClick() {
            heroMenuItems.forEach((item) => {
                item.addEventListener('click', handleMenuItemOnClick);
            });
        })();

        function handleMenuItemOnClick() {
            menuType = this.innerHTML.replace(/\s/g, '-');
            changeHash();
        }

        function changeMenuItemSelected(menuType) {
            heroMenuItems.forEach((item) => {
                const itemMenuType = item.innerHTML.replace(/\s/g, '-');
                item.classList.toggle('active', itemMenuType === menuType);
            });
        }

        function loadHeroInfo() {
            hideAllHeroInfo();
            checkHeroHasProfile();

            switch (menuType) {
                case 'Profile': loadHeroProfile(krHero.name); break;
                case 'Common': loadHeroCommon(krHero.name, krHero.class); break;
                case 'Skills': loadHeroSkills(krHero.name); break;
                case 'Transcend': loadHeroTranscend(krHero.name, krHero.class); break;
                case 'UW': loadHeroWeapon(krHero.name); break;
                case 'UT-S2': loadHeroTreasureS2(krHero.name); break;
                case 'UT-S3': loadHeroTreasureS3(krHero.name); break;
                default: loadHeroCommon(krHero.name, krHero.class);
            }
        }

        function hideAllHeroInfo() {
            closeSkillDetail();
            heroProfile.classList.add('hidden');
            heroCommon.classList.add('hidden');
            heroSkills.classList.add('hidden');
            heroTranscend.classList.add('hidden');
            heroWeapon.classList.add('hidden');
            heroTreasureS3.classList.add('hidden');
            heroTreasureS2.classList.add('hidden');
        }

        //Hero Profile
        function loadHeroProfile(heroName) {
            if (checkHeroHasProfile() === true) {
                if (heroProfile.getAttribute('data-hero-name') !== heroName) {
                    changeHeroProfile(heroName);
                    heroProfile.setAttribute('data-hero-name', heroName);
                }
                heroProfile.classList.remove('hidden');
            }
        }
        function checkHeroHasProfile() {
            if (krHero.hasProfile === false) {
                disableAndChangeHeroProfileMenuButton();
                return false;
            } else {
                menuItemProfile.classList.remove('disabled');
                return true;
            }
        }

        function disableAndChangeHeroProfileMenuButton() {
            menuItemProfile.classList.add('disabled');
            menuItemProfile.classList.remove('show');
            if (menuType === 'Profile') {
                menuType = 'Common';
                changeHash();
                changeMenuItemSelected(menuType);
            }
        }

        function changeHeroProfile(heroName) {
            const html = `
                <img class="placeholder__img"
                    src="images/heroes/${heroName}/Profile.png"
                    alt="${heroName} Profile">
                <img class="placeholder__img"
                    src="images/heroes/${heroName}/Story.png"
                    alt="${heroName} Story">
            `;
            heroProfile.innerHTML = html;
        }

        //Hero Common
        function loadHeroCommon(heroName, classType) {
            if (heroCommon.getAttribute('data-hero-name') !== heroName) {
                changeHeroCommon(heroName, classType);
                heroCommon.setAttribute('data-hero-name', heroName);
            }
            heroCommon.classList.remove('hidden');
        }

        function changeHeroCommon(heroName, classType) {
            const html = `
                <img class="placeholder__img"
                    src="images/heroes/${heroName}/Basic-Info.png"
                    alt="${heroName} Basic Info">
                <img class="placeholder__img"
                    src="images/common/${classType}-Basic-Stats.png"
                    alt="${heroName} Basic Stats">
                <img class="placeholder__img"
                    src="images/common/${classType}-Additional-Options.png"
                    alt="${heroName} Additional Options">
            `;
            heroCommon.innerHTML = html;
        }

        //Hero Skills
        function loadHeroSkills(heroName) {
            if (heroSkills.getAttribute('data-hero-name') !== heroName) {
                changeHeroSkills(heroName);
                heroSkills.setAttribute('data-hero-name', heroName);
            }
            heroSkills.classList.remove('hidden');
        }

        function changeHeroSkills(heroName) {
            heroSkills.innerHTML = getHeroSkills(heroName);
            if (hasLinkedSkill === true) {
                addEventForSwapSkillButton();
                hasLinkedSkill === false;
            }
            addEventForHeroSkills();
        }

        function getHeroSkills(heroName) {
            let responseHTML = '';
            for (let i = 1; i <= 4; i++) {
                const skillNum = 's' + i;

                if (krHero[skillNum].hasOwnProperty('linked')) {
                    responseHTML += getLinkedSkillHTML(heroName, skillNum);
                    hasLinkedSkill = true;
                } else {
                    responseHTML += `
                        <img class="skills__img"
                            src="images/heroes/${heroName}/skills/${skillNum}.png"
                            alt="${skillNum}">
                    `;
                }
            }
            return responseHTML;
        }

        function getLinkedSkillHTML(heroName, skillNum) {
            const responseHTML = `
                <div class="linked-skill">
                    <img class="linked-skill__img skills__img"
                        src="images/heroes/${heroName}/skills/${skillNum}.png"
                        alt="${skillNum}"
                        data-linked-skill="${skillNum}">
                    <img class="linked-skill__img skills__img hidden"
                        src="images/heroes/${heroName}/skills/${skillNum}_2.png"
                        alt="${skillNum}_2"
                        data-linked-skill="${skillNum}">
                    <div class="linked-skill__skill-swap" data-swap-skill="${skillNum}"></div>
                </div>
            `;
            return responseHTML;
        }

        function addEventForSwapSkillButton() {
            const swapSkillBtn = document.querySelectorAll('.linked-skill__skill-swap');
            swapSkillBtn.forEach((swapBtn) => {
                swapBtn.addEventListener('click', swapSkill);
            });
        }

        function swapSkill() {
            const skillNum = this.getAttribute('data-swap-skill');
            const skills = document.querySelectorAll(
                `.linked-skill__img[data-linked-skill="${skillNum}"]`
            );

            skills.forEach((skill) => {
                skill.classList.toggle('hidden');
            });
        }

        function addEventForHeroSkills() {
            const skills = document.querySelectorAll('.skills__img');
            skills.forEach((skill) => {
                skill.addEventListener('click', showSkillDetail);
            });
        }

        function showSkillDetail() {
            const skillNum = this.alt;
            
            skillDetail.innerHTML = getSkillDetail(skillNum);
            if (skillNum.includes('_2') || krHero[skillNum].hasOwnProperty('linked')) {
                addEventForSkillDetailSwap(skillNum);
            }
            mainHeroInfo.classList.add('hidden');
            skillDetail.classList.remove('hidden');
            addEventForSkillDetail();
        }

        function getSkillDetail(skillNum) {
            const skillDesc = skillNum.includes('_2')
                ? `${krHero[skillNum.substring(0, 2)].linked.description}`
                : `${krHero[skillNum].description}`;

            let responseHTML = `
                <div class="skill-detail__info">
                    ${skillDesc}
                </div>
                <img class="skill-detail__img"
                    src="images/heroes/${krHero.name}/skills/${skillNum}-Att.png"
                    alt="${skillNum} Attribute">
                <img class="skill-detail__img-show-att skill-detail--show-att-btn"
                    src="images/icons/Show-Skill-Attributes.png"
                    alt="Show Skill Attributes">
                <img class="skill-detail__img-hide-att skill-detail--show-att-btn hidden"
                    src="images/icons/Hide-Skill-Attributes.png"
                    alt="Hide Skill Attributes">
                <div class="skill-detail__close-btn"></div>
            `;

            if (krHero[skillNum.substring(0, 2)].hasOwnProperty('linked')) {
                responseHTML += `<div class="skill-detail__skill-swap"></div>`;
            }

            return responseHTML;
        }

        function addEventForSkillDetailSwap(skillNum) {
            const swapSkillBtn = document.querySelector('.skill-detail__skill-swap');
            swapSkillBtn.addEventListener('click', () => {
                swapSkillDetail(skillNum);
                addEventForSkillDetail();
            });
        }

        function swapSkillDetail(skillNum) {
            let newSkillNum;

            //Ex: skillNum = 's1_2' or 's1'
            if (skillNum.substring(2) === "") {
                newSkillNum = skillNum + "_2";
                skillDetail.innerHTML = getSkillDetail(newSkillNum);
                addEventForSkillDetailSwap(newSkillNum);
            } else {
                newSkillNum = skillNum.substring(0, 2);
                skillDetail.innerHTML = getSkillDetail(newSkillNum);
                addEventForSkillDetailSwap(newSkillNum);
            }
        }

        function addEventForSkillDetail() {
            const skillInfo = document.querySelector('.skill-detail__info');
            const btnShowSkillAtt = document.querySelector(
                '.skill-detail__img-show-att'
            );
            const btnHideSkillAtt = document.querySelector(
                '.skill-detail__img-hide-att'
            );
            const btnCloseSkillDetail = document.querySelector(
                '.skill-detail__close-btn'
            );

            btnShowSkillAtt.addEventListener('click', () => {
                showSkillAttribute(skillInfo, btnShowSkillAtt, btnHideSkillAtt);
            });
            btnHideSkillAtt.addEventListener('click', () => {
                hideSkillAttribute(skillInfo, btnShowSkillAtt, btnHideSkillAtt);
            });
            btnCloseSkillDetail.addEventListener('click', closeSkillDetail);
        }

        function showSkillAttribute(skillInfo, btnShowSkillAtt, btnHideSkillAtt) {
            skillInfo.classList.toggle('hidden');
            btnShowSkillAtt.classList.toggle('hidden');
            btnHideSkillAtt.classList.toggle('hidden');
        }

        function hideSkillAttribute(skillInfo, btnShowSkillAtt, btnHideSkillAtt) {
            skillInfo.classList.toggle('hidden');
            btnShowSkillAtt.classList.toggle('hidden');
            btnHideSkillAtt.classList.toggle('hidden');
        }

        function closeSkillDetail() {
            skillDetail.classList.add('hidden');
            mainHeroInfo.classList.remove('hidden');
        }

        //Hero Transcend
        function loadHeroTranscend(heroName, classType) {
            if (heroTranscend.getAttribute('data-hero-name') !== heroName) {
                changeHeroTranscend(heroName, classType);
                heroTranscend.setAttribute('data-hero-name', heroName);
            }
            heroTranscend.classList.remove('hidden');
        }

        function changeHeroTranscend(heroName, classType) {
            let responseHTML = getTranscendPerk1HTML('All');
            responseHTML += getTranscendPerk2HTML(classType);
            responseHTML += getTranscendPerk3HTML(heroName);
            responseHTML += getTranscendPerk5HTML(heroName);

            heroTranscend.innerHTML = responseHTML;
        }

        function getTranscendPerk1HTML(transcendKey) {
            const perkText = getTranscendPerk1and2ItemHTML(transcendKey);
            const responseHTML = `
                <div class="perk transcend__perk1">
                    <img class="perk__background-img"
                        src="images/icons/perk1.png" alt="">
                    <div class="perk__container">
                        <ul class="perk__list list-inline row">
                            ${perkText}
                        </ul>
                    </div>
                </div>
            `;
            return responseHTML;
        }

        function getTranscendPerk2HTML(classType) {
            const perkText = getTranscendPerk1and2ItemHTML(classType);
            const responseHTML = `
                <div class="perk transcend__perk2">
                    <img class="perk__background-img"
                        src="images/icons/perk2.png" alt="">
                    <div class="perk__container">
                        <ul class="perk__list list-inline row">
                            ${perkText}
                        </ul>
                    </div>
                </div>
            `;
            return responseHTML;
        }

        function getTranscendPerk1and2ItemHTML(classType) {
            let responseHTML = '';
            const repeatTimes = 4;

            for (let i = 1; i <= repeatTimes; i++) {
                //Ex: transcend['All']['perk1']
                const perk = transcendData[`${classType}`][`perk${i}`];
                const imgName = perk.name.replace(/\s/g, '-');
                responseHTML += `
                    <li class="perk__list--item list-inline-item col-3">
                        <img class="perk__img"
                            src="images/transcend/${imgName}.png"
                            alt="${perk.name}">
                        <span class="tooltiptext tooltiptext--text${i}">
                            <h5 class="tooltiptext__h5">${perk.name}</h5>
                            <h6 class="tooltiptext__h6">${perk.description}</h6>
                        </span>
                    </li>
                `;
            }
            return responseHTML;
        }

        function getTranscendPerk3HTML(heroName) {
            const perkText = getTranscendPerk3ItemHTML(heroName);
            const responseHTML = `
                <div class="perk transcend__perk3">
                    <img class="perk__background-img"
                        src="images/icons/perk3.png" alt="">
                    <div class="perk__container">
                        <ul class="perk__list list-inline row">
                            ${perkText}
                        </ul>
                    </div>
                </div>
            `;
            return responseHTML;
        }

        function getTranscendPerk3ItemHTML(heroName) {
            let responseHTML = '';
            const repeatTimes = 4;
            for (let i = 1; i <= repeatTimes; i++) {
                const textNum = (i % 2 !== 0) ? 1 : 3;
                const textNum2 = (i % 2 !== 0) ? 2 : 4;
                const skillNum = 's' + i;
                const perkName = krHero[skillNum].hasOwnProperty('linked')
                    ? `${krHero[skillNum].name} / ${krHero[skillNum].linked.name}`
                    : `${krHero[skillNum].name}`;
                responseHTML += `
                    <li class="perk__list--item list-inline-item col-3">
                        <img class="perk__img"
                            src="images/heroes/${heroName}/transcend/s${i}-Light.png"
                            alt="s${i}-Light">
                        <span class="tooltiptext tooltiptext--text${textNum}">
                            <h5 class="tooltiptext__h5">${perkName} [LIGHT]</h5>
                            <h6 class="tooltiptext__h6">${krHero[skillNum].light}</h6>
                        </span>
                    </li>
                    <li class="perk__list--item list-inline-item col-3">
                        <img class="perk__img"
                            src="images/heroes/${heroName}/transcend/s${i}-Dark.png"
                            alt="s${i}-Dark">
                        <span class="tooltiptext tooltiptext--text${textNum2}">
                            <h5 class="tooltiptext__h5">${perkName} [DARK]</h5>
                            <h6 class="tooltiptext__h6">${krHero[skillNum].dark}</h6>
                        </span>
                    </li>
                `;
            }
            return responseHTML;
        }

        function getTranscendPerk5HTML(heroName) {
            const responseHTML = `
                <div class="perk transcend__perk5">
                    <img class="perk__background-img"
                        src="images/icons/perk5.png" alt="">
                    <div class="perk__container">
                        <ul class="perk__list list-inline row">
                            <li class="perk__list--item list-inline-item col-3">
                                <img class="perk__img"
                                    src="images/heroes/${heroName}/transcend/${heroName}-Light.png"
                                    alt="${heroName}-Light">
                                <span class="tooltiptext tooltiptext--text1">
                                    <h5 class="tooltiptext__h5">${krHero.name} [LIGHT]</h5>
                                    <h6 class="tooltiptext__h6">${krHero.t5.light}</h6>
                                </span>
                            </li>
                            <li class="perk__list--item list-inline-item col-3">
                                <img class="perk__img"
                                    src="images/heroes/${heroName}/transcend/${heroName}-Dark.png"
                                    alt="${heroName}-Dark">
                                <span class="tooltiptext tooltiptext--text2">
                                    <h5 class="tooltiptext__h5">${krHero.name} [DARK]</h5>
                                    <h6 class="tooltiptext__h6">${krHero.t5.dark}</h6>
                                </span>
                            </li>
                            <li class="perk__list--item list-inline-item col-3"></li>
                            <li class="perk__list--item list-inline-item col-3"></li>
                        </ul>
                    </div>
                </div>
            `;
            return responseHTML;
        }

        //Hero Weapon
        function loadHeroWeapon(heroName) {
            uniqueStar = 0;
            if (heroWeapon.getAttribute('data-hero-name') !== heroName) {
                changeHeroWeapon();
                heroWeapon.setAttribute('data-hero-name', heroName);
            }
            handleUniqueStarChange('uw', uniqueStar);
            heroWeapon.classList.remove('hidden');
        }

        function changeHeroWeapon() {
            const itemData = krHero.uw;
            heroWeapon.innerHTML = getUniqueItemHTML('uw', itemData);
            addEventForUniqueItem('uw');
        }

        //Hero Treasure
        function loadHeroTreasureS2(heroName) {
            uniqueStar = 0;
            if (heroTreasureS2.getAttribute('data-hero-name') !== heroName) {
                changeHeroTreasure('ut-s2');
                heroTreasureS2.setAttribute('data-hero-name', heroName);
            }
            handleUniqueStarChange('ut-s2', uniqueStar);
            heroTreasureS2.classList.remove('hidden');
        }

        function loadHeroTreasureS3(heroName) {
            uniqueStar = 0;
            if (heroTreasureS3.getAttribute('data-hero-name') !== heroName) {
                changeHeroTreasure('ut-s3');
                heroTreasureS3.setAttribute('data-hero-name', heroName);
            }
            handleUniqueStarChange('ut-s3', uniqueStar);
            heroTreasureS3.classList.remove('hidden');
        }

        function changeHeroTreasure(treasure) {
            if (treasure === 'ut-s2') {
                const itemData = krHero.s2.ut;
                heroTreasureS2.innerHTML = getUniqueItemHTML(treasure, itemData);
            } else {
                const itemData = krHero.s3.ut;
                heroTreasureS3.innerHTML = getUniqueItemHTML(treasure, itemData);
            }
            addEventForUniqueItem(treasure);
        }

        function getUniqueItemHTML(itemType, itemData) {
            let statType;
            let itemStat;

            if (itemType === 'uw') {
                statType = 'ATK';
                itemStat = uniqueStatsData.weaponAtk[krHero.class][0];
            } else {
                statType = 'HP';
                itemStat = uniqueStatsData.treasureHp[0];
            }
            const responseHTML = `
                <div class="unique-item__banner">
                    <p class="unique-item__banner-text">
                        ${itemData.name}
                    </p>
                </div>
                <div class="unique-item__basic-info row">
                    <div class="${itemType}__img unique-item__basic-info--left-col col-4">
                        <img class="unique-item__img"
                            src="images/heroes/${krHero.name}/${itemType}.png"
                            alt="${itemType}">
                    </div>
                    <div class="unique-item__basic-info--right-col col-8">
                        <div class="unique-item__text row">
                            <div class="unique-item--left-text col-5">
                                ${statType}
                            </div>
                            <div class="${itemType}__stat unique-item--right-text col-7">${itemStat}</div>
                        </div>
                        <div class="unique-item__star">
                            <i class="${itemType}__left-arrow fa fa-arrow-alt-circle-left
                                unique-item__arrow"></i>
                            <i class="${itemType}__star fa fa-star"></i>
                            <i class="${itemType}__star fa fa-star"></i>
                            <i class="${itemType}__star fa fa-star"></i>
                            <i class="${itemType}__star fa fa-star"></i>
                            <i class="${itemType}__star fa fa-star"></i>
                            <i class="${itemType}__right-arrow fa fa-arrow-alt-circle-right
                                unique-item__arrow"></i>
                        </div>
                    </div>
                </div>
                <div class="${itemType}__description unique-item__area-text">
                    ${itemData.description[0]}
                </div>
                <div class="${itemType}__introduction unique-item__area-text hidden">
                    ${itemData.story}
                </div>
                <div class="unique-item__img-button-wrapper row">
                    <div class="col-6 unique-item__img-button-wrapper--padding-left">
                        <img class="${itemType}__unique-option unique-item__img-button hidden"
                            src="images/icons/Unique-Option.png" alt="">
                        <img class="${itemType}__unique-option-actived unique-item__img-button"
                            src="images/icons/Unique-Option-Actived.png" alt="">
                    </div>
                    <div class="col-6 unique-item__img-button-wrapper--padding-right">
                        <img class="${itemType}__item-introduction unique-item__img-button"
                            src="images/icons/Item-Introduction.png" alt="">
                        <img class="${itemType}__item-introduction-actived unique-item__img-button hidden"
                            src="images/icons/Item-Introduction-Actived.png" alt="">
                    </div>
                </div>
            `;
            return responseHTML;
        }

        function addEventForUniqueItem(itemType) {
            addEventForLeftArrow(itemType);
            addEventForRightArrow(itemType);
            addEventForUniqueItemButtons(itemType);
        }

        function addEventForLeftArrow(itemType) {
            const leftArrow = document.querySelector(`.${itemType}__left-arrow`);
            leftArrow.addEventListener('click', () => {
                uniqueStar = (uniqueStar - 1) < 0 ? 0 : uniqueStar - 1;
                handleUniqueStarChange(itemType, uniqueStar);
            });
        }

        function addEventForRightArrow(itemType) {
            const rightArrow = document.querySelector(`.${itemType}__right-arrow`);
            rightArrow.addEventListener('click', () => {
                uniqueStar = (uniqueStar + 1) > 5 ? 5 : uniqueStar + 1;
                handleUniqueStarChange(itemType, uniqueStar);
            });
        }

        function handleUniqueStarChange(itemType, uniqueStar) {
            const itemStat = document.querySelector(`.${itemType}__stat`);
            const itemDescription = document.querySelector(`.${itemType}__description`);
            if (itemType === 'uw') {
                itemStat.innerHTML = uniqueStatsData.weaponAtk[krHero.class][uniqueStar];
                itemDescription.innerHTML = krHero.uw.description[uniqueStar];
            } else {
                itemStat.innerHTML = uniqueStatsData.treasureHp[uniqueStar];
                const responseHTML = itemType === 'ut-s2'
                    ? krHero.s2.ut.description[uniqueStar]
                    : krHero.s3.ut.description[uniqueStar];
                itemDescription.innerHTML = responseHTML;
            }

            changeUniqueStarSelected(itemType, uniqueStar);
        }

        function changeUniqueStarSelected(itemType, uniqueStar) {
            const stars = document.querySelectorAll(`.${itemType}__star`);
            for (let i = 0; i < 5; i++) {
                stars[i].classList.remove('checked');
                if (i < uniqueStar) {
                    stars[i].classList.add('checked');
                }
            }
        }

        function addEventForUniqueItemButtons(itemType) {
            const uniqueOption = document.querySelector(`.${itemType}__unique-option`);
            const uniqueOptionActived = document.querySelector(
                `.${itemType}__unique-option-actived`
            );
            const itemIntroduction = document.querySelector(
                `.${itemType}__item-introduction`
            );
            const itemIntroductionActived = document.querySelector(
                `.${itemType}__item-introduction-actived`
            );
            const uniqueItemDesc = document.querySelector(`.${itemType}__description`);
            const uniqueItemIntro = document.querySelector(
                `.${itemType}__introduction`
            );

            uniqueOption.addEventListener('click', () => {
                showUniqueItemOption(uniqueItemDesc, uniqueItemIntro);
                showUniqueOptionActivedButton(uniqueOption, uniqueOptionActived);
                hideItemItroActivedButton(itemIntroduction, itemIntroductionActived);
            });

            itemIntroduction.addEventListener('click', () => {
                showUniqueItemIntro(uniqueItemDesc, uniqueItemIntro);
                hideUniqueOptionActivedButton(uniqueOption, uniqueOptionActived);
                showItemItroActivedButton(itemIntroduction, itemIntroductionActived);
            });
        }

        function showUniqueItemOption(uniqueItemDesc, uniqueItemIntro) {
            uniqueItemDesc.classList.remove('hidden');
            uniqueItemIntro.classList.add('hidden');
        }

        function showUniqueItemIntro(uniqueItemDesc, uniqueItemIntro) {
            uniqueItemDesc.classList.add('hidden');
            uniqueItemIntro.classList.remove('hidden');
        }

        function showUniqueOptionActivedButton(uniqueOption, uniqueOptionActived) {
            uniqueOption.classList.add('hidden');
            uniqueOptionActived.classList.remove('hidden');
        }

        function hideUniqueOptionActivedButton(uniqueOption, uniqueOptionActived) {
            uniqueOption.classList.remove('hidden');
            uniqueOptionActived.classList.add('hidden');
        }

        function showItemItroActivedButton(itemIntroduction, itemIntroductionActived) {
            itemIntroduction.classList.add('hidden');
            itemIntroductionActived.classList.remove('hidden');
        }

        function hideItemItroActivedButton(itemIntroduction, itemIntroductionActived) {
            itemIntroduction.classList.remove('hidden');
            itemIntroductionActived.classList.add('hidden');
        }


        (function addEventForHeroesAvatarOnScroll() {
            krHeroesAvatarContent.addEventListener(
                'wheel', handleHorizontalScroll, { passive: false }
            );
        })();

        function handleHorizontalScroll(e) {
            krHeroesAvatarContent.scrollLeft += e.deltaY * 1.5;
            e.preventDefault();
        }
    }
})();
