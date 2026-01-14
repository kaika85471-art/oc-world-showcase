let CONFIG = {};
let seriesList = [];
let shopData = [];

const startBtn = document.getElementById('start-btn');
const splashScreen = document.getElementById('splash-screen');
const mainStage = document.getElementById('main-stage');
const worldStage = document.getElementById('world-stage');
const profileStage = document.getElementById('profile-stage');
const bgm = document.getElementById('bgm');
const bgmToggle = document.getElementById('bgm-toggle');

const commBtn = document.getElementById('comm-btn');
const commModal = document.getElementById('comm-modal');
const shopBtn = document.getElementById('shop-btn');
const shopModal = document.getElementById('shop-modal');

const worldImg = document.getElementById('world-img');
const worldTitle = document.getElementById('world-title');
const worldDesc = document.getElementById('world-desc');

const carouselContainer = document.querySelector('.carousel-container');
const tabsContainer = document.getElementById('series-tabs');
const prevCharBtn = document.getElementById('prev-char');
const nextCharBtn = document.getElementById('next-char');

let currentSeriesIndex = 0;
let currentSlide = 0;
let slideInterval;
let currentFilteredChars = [];

async function initWebsite() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();

        CONFIG = data.creatorInfo;
        seriesList = data.seriesList;
        shopData = data.shopData;

        renderStaticContent();
        renderSeriesTabs();

        if (seriesList.length > 0 && seriesList[0].characters.length > 0) {
            switchSeries(0);
        }

        bindEvents();
        console.log("網站初始化成功！");
    } catch (error) {
        console.error("無法讀取 data.json", error);
    }
}

function renderSeriesTabs() {
    tabsContainer.innerHTML = '';
    seriesList.forEach((series, index) => {
        const btn = document.createElement('button');
        btn.className = index === 0 ? 'tab-btn active' : 'tab-btn';
        btn.innerText = series.seriesName;
        btn.onclick = () => switchSeries(index);
        tabsContainer.appendChild(btn);
    });
}

function switchSeries(index) {
    currentSeriesIndex = index;
    const allTabs = document.querySelectorAll('.tab-btn');
    allTabs.forEach((btn, i) => {
        if (i === index) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    currentFilteredChars = seriesList[index].characters.map(char => ({
        ...char,
        belongsToSeriesIndex: index
    }));

    carouselContainer.innerHTML = '';
    currentFilteredChars.forEach((char, i) => {
        const slide = document.createElement('div');
        slide.className = i === 0 ? 'char-slide active' : 'char-slide';
        const cleanStory = char.story.trim();
        const cleanSettings = char.settings ? char.settings.trim() : "";

        slide.innerHTML = `
            <div class="char-visual"><img src="${char.img}" class="char-img"></div>
            <div class="char-info">
                <div class="char-name-block"><h2 class="char-name">${char.name}</h2><h3 class="char-role">${char.role}</h3></div>
                <div class="info-toggle-group"><button class="info-btn active" onclick="toggleCharInfo(this, 'story', ${i})">背景故事</button><button class="info-btn" onclick="toggleCharInfo(this, 'settings', ${i})">角色設定</button></div>
                <div class="info-display-box" id="info-box-${i}">${cleanStory}</div>
            </div>
        `;
        carouselContainer.appendChild(slide);
    });

    currentSlide = 0;
    updateCharNavButtons();
    if (slideInterval) { clearInterval(slideInterval); slideInterval = setInterval(nextCharSlide, 8000); }
}

window.toggleCharInfo = function (btn, type, charIndex) {
    const parent = btn.parentElement;
    parent.querySelectorAll('.info-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const textBox = document.getElementById(`info-box-${charIndex}`);
    const charData = currentFilteredChars[charIndex];
    textBox.style.opacity = 0;
    setTimeout(() => {
        if (type === 'story') { textBox.innerText = charData.story.trim(); } else { textBox.innerText = charData.settings ? charData.settings.trim() : ""; }
        textBox.style.opacity = 1;
    }, 200);
}

function updateCharNavButtons() {
    if (currentFilteredChars.length > 1) { prevCharBtn.classList.add('visible'); nextCharBtn.classList.add('visible'); }
    else { prevCharBtn.classList.remove('visible'); nextCharBtn.classList.remove('visible'); }
}

function nextCharSlide() {
    const slides = carouselContainer.querySelectorAll('.char-slide');
    if (slides.length <= 1) return;
    slides[currentSlide].classList.remove("active");
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add("active");
}

function prevCharSlide() {
    const slides = carouselContainer.querySelectorAll('.char-slide');
    if (slides.length <= 1) return;
    slides[currentSlide].classList.remove("active");
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    slides[currentSlide].classList.add("active");
}

function renderStaticContent() {
    document.getElementById('creator-name').innerText = CONFIG.name;
    document.getElementById('creator-tagline').innerText = CONFIG.tagline || "";
    document.getElementById('creator-bio').innerText = CONFIG.bio;
    document.getElementById('creator-avatar').src = CONFIG.avatar;
    document.getElementById("biz-email").innerText = CONFIG.businessEmail;

    // 版權文字：同時渲染兩個位置
    document.getElementById('copyright-footer').innerText = CONFIG.copyrightText || "";
    const mobileFooter = document.getElementById('copyright-footer-mobile');
    if (mobileFooter) mobileFooter.innerText = CONFIG.copyrightText || "";

    if (CONFIG.splashBgImages && CONFIG.splashBgImages.length > 0) {
        const marquee = document.getElementById('splash-marquee');
        let imgHtml = "";
        CONFIG.splashBgImages.forEach(src => { imgHtml += `<img src="${src}">`; });
        marquee.innerHTML = imgHtml + imgHtml + imgHtml;
    }

    if (CONFIG.acceptCommission) { commBtn.innerText = "委託資訊"; commBtn.classList.remove('disabled'); commBtn.onclick = () => commModal.classList.add("active"); }
    else { commBtn.innerText = "未開放委託"; commBtn.classList.add('disabled'); commBtn.onclick = null; }

    if (CONFIG.hasShop) { shopBtn.innerText = "作品賣場"; shopBtn.classList.remove('disabled'); shopBtn.onclick = () => shopModal.classList.add("active"); }
    else { shopBtn.innerText = "未設置賣場"; shopBtn.classList.add('disabled'); shopBtn.onclick = null; }

    const socialContainer = document.getElementById('social-links-container');
    socialContainer.innerHTML = '';
    socialContainer.className = "social-dashboard";
    const getUrl = (pName) => { const s = CONFIG.socials.find(x => x.platform.toLowerCase() === pName.toLowerCase()); return s ? s.url : ""; };
    const pixivUrl = getUrl("Pixiv");
    const pixivHtml = `<div class="social-row-wide"><a href="${pixivUrl || '#'}" target="_blank" class="dash-btn ${pixivUrl ? '' : 'disabled'}">Pixiv</a></div>`;
    const fbUrl = getUrl("Facebook"); const igUrl = getUrl("Instagram"); const xUrl = getUrl("Twitter/X"); const dcUrl = getUrl("Discord");
    const gridHtml = `<div class="social-grid">
            <a href="${fbUrl || '#'}" target="_blank" class="dash-btn social-square ${fbUrl ? '' : 'disabled'}"><img src="icon_fb.png" alt="FB"></a>
            <a href="${igUrl || '#'}" target="_blank" class="dash-btn social-square ${igUrl ? '' : 'disabled'}"><img src="icon_ig.png" alt="IG"></a>
            <a href="${xUrl || '#'}" target="_blank" class="dash-btn social-square ${xUrl ? '' : 'disabled'}"><img src="icon_x.png" alt="X"></a>
            <a href="${dcUrl || '#'}" target="_blank" class="dash-btn social-square ${dcUrl ? '' : 'disabled'}"><img src="icon_discord.png" alt="DC"></a>
        </div><div class="social-separator"></div>`;
    const fanboxUrl = getUrl("Fanbox"); const patreonUrl = getUrl("Patreon");
    const supportHtml = `<div class="social-row-wide"><a href="${fanboxUrl || '#'}" target="_blank" class="dash-btn social-list-item ${fanboxUrl ? '' : 'disabled'}">Fanbox</a><a href="${patreonUrl || '#'}" style="margin-top:5px;" target="_blank" class="dash-btn social-list-item ${patreonUrl ? '' : 'disabled'}">Patreon</a></div><div class="social-separator"></div>`;
    const ytUrl = getUrl("Youtube"); const twitchUrl = getUrl("Twitch");
    const mediaHtml = `<div class="social-row-media">
            <a href="${ytUrl || '#'}" target="_blank" class="dash-btn media-btn ${ytUrl ? 'active' : 'disabled'}"><img src="icon_yt.png" alt="YT"><span class="media-status">${ytUrl ? '已設置' : '未設置'}</span></a>
            <a href="${twitchUrl || '#'}" target="_blank" class="dash-btn media-btn ${twitchUrl ? 'active' : 'disabled'}"><img src="icon_twitch.png" alt="Twitch"><span class="media-status">${twitchUrl ? '已設置' : '未設置'}</span></a>
        </div>`;
    socialContainer.innerHTML = pixivHtml + gridHtml + supportHtml + mediaHtml;

    const shopBtnContainer = document.getElementById('shop-buttons-container');
    shopBtnContainer.innerHTML = '';
    CONFIG.shopLinks.forEach(item => {
        const btn = document.createElement("a"); btn.href = item.url; btn.target = "_blank"; btn.className = "custom-shop-btn"; btn.innerText = item.label; shopBtnContainer.appendChild(btn);
    });
    const marqueeTrack = document.getElementById('shop-marquee');
    let html = "";
    if (shopData && shopData.length > 0) { shopData.forEach(imgUrl => { html += `<div class="marquee-item"><img src="${imgUrl}"></div>`; }); marqueeTrack.innerHTML = html.repeat(4); }
    handleNavigationLogic();
}

function handleNavigationLogic() {
    const toWorldBtn = document.getElementById("to-world-hint");
    const backToWorldBtn = document.getElementById("back-to-world");
    if (!CONFIG.hasWorldView) { toWorldBtn.innerText = "Profile ▼"; backToWorldBtn.innerText = "▲ Char"; }
}

function bindEvents() {
    function goToSection(section) {
        document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
        setTimeout(() => section.classList.add("active"), 100);
        window.scrollTo(0, 0);
    }
    function loadLinkedWorld() {
        const targetSeries = seriesList[currentSeriesIndex];
        worldImg.style.opacity = 0;
        setTimeout(() => {
            if (targetSeries.world) {
                worldImg.src = targetSeries.world.img;
                worldTitle.innerText = targetSeries.world.title;
                worldDesc.innerText = targetSeries.world.desc;
            }
            worldImg.style.opacity = 1;
        }, 300);
    }
    startBtn.addEventListener("click", () => {
        bgm.play().then(() => { bgmToggle.innerText = "🎵 BGM: ON"; }).catch(() => { bgmToggle.innerText = "🎵 BGM: OFF"; });
        goToSection(mainStage);
        slideInterval = setInterval(nextCharSlide, 8000);
    });
    document.getElementById("to-world-hint").addEventListener("click", () => {
        clearInterval(slideInterval);
        if (CONFIG.hasWorldView) { loadLinkedWorld(); goToSection(worldStage); } else { goToSection(profileStage); }
    });
    document.getElementById("to-profile-hint").addEventListener("click", () => goToSection(profileStage));
    document.getElementById("back-to-splash").addEventListener("click", () => { clearInterval(slideInterval); goToSection(splashScreen); });
    document.getElementById("back-to-char").addEventListener("click", () => { goToSection(mainStage); slideInterval = setInterval(nextCharSlide, 8000); });
    document.getElementById("back-to-world").addEventListener("click", () => { if (CONFIG.hasWorldView) { goToSection(worldStage); } else { goToSection(mainStage); slideInterval = setInterval(nextCharSlide, 8000); } });
    document.getElementById("back-home-btn").addEventListener("click", () => { goToSection(splashScreen); currentSlide = 0; });
    nextCharBtn.addEventListener("click", () => { clearInterval(slideInterval); nextCharSlide(); slideInterval = setInterval(nextCharSlide, 8000); });
    prevCharBtn.addEventListener("click", () => { clearInterval(slideInterval); prevCharSlide(); slideInterval = setInterval(nextCharSlide, 8000); });
    bgmToggle.addEventListener("click", () => { if (bgm.paused) { bgm.play(); bgmToggle.innerText = "🎵 BGM: ON"; } else { bgm.pause(); bgmToggle.innerText = "🎵 BGM: OFF"; } });
    const shareBtn = document.getElementById("share-btn");
    shareBtn.addEventListener("click", () => {
        const text = `${CONFIG.shareText} ${window.location.href}`;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                const originalText = shareBtn.innerText; shareBtn.innerText = "✅ Copied!"; shareBtn.style.borderColor = "#00d2ff"; shareBtn.style.color = "#00d2ff";
                setTimeout(() => { shareBtn.innerText = "🔗 Share Link"; shareBtn.style.borderColor = ""; shareBtn.style.color = ""; }, 2000);
            }).catch(err => { prompt("請手動複製連結：", text); });
        } else { prompt("請手動複製連結：", text); }
    });
    document.querySelector(".close-comm").addEventListener("click", () => commModal.classList.remove("active"));
    document.querySelector(".close-shop").addEventListener("click", () => shopModal.classList.remove("active"));
    window.addEventListener("click", (e) => { if (e.target === commModal) commModal.classList.remove("active"); if (e.target === shopModal) shopModal.classList.remove("active"); });
    document.addEventListener("contextmenu", e => e.preventDefault());
}

initWebsite();