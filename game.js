const gameObjects = [
    { name: 'きのこ', size: 80 },
    { name: 'ねずみ', size: 100 },
    { name: 'ひよこ', size: 120 },
    { name: 'にわとり', size: 150 },
    { name: 'ぺんぎん', size: 200 },
    { name: 'あざらし', size: 210 },
    { name: 'くま', size: 240 },
    { name: 'ぱんだ', size: 270 },
    { name: 'かえる', size: 300 },
    { name: 'はーと', size: 330 }
];

const characters = [
    {
        name: 'アイナ',
        unlocked: true,
        images: [null, null, null],
        specialImage: null,
        unlockScores: [2500, 3200, 4000],
        backgroundImage: 'images/アイナ_背景.PNG',
        description: 'メタバース空間「XANA」でマリコによって生み出された女のコ。マリコの予想を超えて確固たる自我を持ち、メタバースでの生活を楽しんでいる'
    },
    {
        name: '小雨',
        unlocked: false,
        images: [null, null, null],
        specialImage: null,
        unlockScores: [4000, 4500, 5000],
        backgroundImage: 'images/小雨_背景.PNG',
        description: '現実世界で近所に住んでいるお姉さん。実は職業は…'
    },
    {
        name: 'エレン',
        unlocked: false,
        images: [null, null, null],
        specialImage: null,
        unlockScores: [5000, 5500, 6000],
        backgroundImage: 'images/エレン_背景.PNG',
        description: 'XANA内の学校「GENESIS学園」に務める女性教師。落ち着いた物腰で生徒からの信頼も厚い。実は現実世界では１０歳の女の子。ふとしたきっかけでXANAに迷い込んでしまう'
    },
    {
        name: 'マリコ',
        unlocked: false,
        images: [null, null, null],
        specialImage: null,
        unlockScores: [6000, 6500, 7000],
        backgroundImage: 'images/マリコ_背景.PNG',
        description: 'GENESIS学園に通う女子高生。XANAがなぜ誕生したのかの謎を知る、秘密が多い女のコ'
    }
];

let currentCharacter = characters[0];
let nextObject;
let nextNextObject;
let fallingObjects = [];
let gameArea;
let isGameOver = false;
let score = 0;
let lastTime;
const GAME_OVER_LINE = 100;
let highScores = [];

function initGame() {
    gameArea = document.getElementById('game-area');
    gameArea.style.width = '600px';
    gameArea.style.height = '800px';
    showTitleScreen();
}

function showTitleScreen() {
    gameArea.innerHTML = '';
    const titleScreen = document.createElement('div');
    titleScreen.id = 'title-screen';
    titleScreen.style.backgroundImage = 'url("images/タイトル.PNG")';

    const title = document.createElement('h1');
    title.textContent = 'GENESISま～じ！';
    title.className = 'fade-in';
    titleScreen.appendChild(title);

    const menuContainer = document.createElement('div');
    menuContainer.id = 'menu-container';

    const menuItems = [
        { text: 'ゲームスタート', action: showCharacterSelectScreen },
        { text: 'ハイスコア', action: showHighScores },
        { text: 'ギャラリー', action: showGallery },
        { text: 'ゲーム説明', action: showGameInstructions }
    ];

    menuItems.forEach((item, index) => {
        const button = document.createElement('button');
        button.textContent = item.text;
        button.addEventListener('click', item.action);
        button.style.animation = `fadeIn 0.5s ease-in-out ${index * 0.1}s forwards`;
        button.style.opacity = '0';
        menuContainer.appendChild(button);
    });

    titleScreen.appendChild(menuContainer);
    gameArea.appendChild(titleScreen);
}

function showCharacterSelectScreen() {
    gameArea.innerHTML = '';
    const selectScreen = document.createElement('div');
    selectScreen.id = 'character-select-screen';

    const title = document.createElement('h2');
    title.textContent = 'キャラクター選択';
    title.className = 'fade-in';
    selectScreen.appendChild(title);

    const characterContainer = document.createElement('div');
    characterContainer.id = 'character-buttons';

    const characterInfo = document.createElement('div');
    characterInfo.id = 'character-info';

    characters.forEach((char, index) => {
        const charButton = document.createElement('button');
        charButton.textContent = char.name;
        charButton.disabled = !char.unlocked;
        charButton.addEventListener('click', () => startGameWithCharacter(char));
        charButton.style.animation = `fadeIn 0.5s ease-in-out ${index * 0.1}s forwards`;
        charButton.style.opacity = '0';

        charButton.addEventListener('mouseover', () => {
            selectScreen.style.backgroundImage = `url('${char.backgroundImage}')`;
            characterInfo.textContent = char.description;
            characterInfo.classList.add('visible');
        });

        charButton.addEventListener('mouseout', () => {
            selectScreen.style.backgroundImage = '';
            characterInfo.classList.remove('visible');
        });

        characterContainer.appendChild(charButton);
    });

    selectScreen.appendChild(characterContainer);
    selectScreen.appendChild(characterInfo);

    const backButton = document.createElement('button');
    backButton.textContent = '戻る';
    backButton.addEventListener('click', showTitleScreen);
    backButton.className = 'fade-in';
    selectScreen.appendChild(backButton);

    gameArea.appendChild(selectScreen);
}

function startGameWithCharacter(character) {
    currentCharacter = character;
    gameArea.innerHTML = '';
    
    const scoreElement = document.createElement('div');
    scoreElement.id = 'score';
    scoreElement.textContent = 'Score: 0';
    gameArea.appendChild(scoreElement);

    const titleElement = document.createElement('div');
    titleElement.id = 'game-title';
    titleElement.textContent = 'GENESISま～じ！';
    gameArea.appendChild(titleElement);

    const gamePlayArea = document.createElement('div');
    gamePlayArea.id = 'game-play-area';
    gamePlayArea.style.backgroundImage = 'url("images/背景.PNG")';

    gameArea.appendChild(gamePlayArea);

    createNextObject();
    document.addEventListener('mousemove', moveNextObject);
    document.addEventListener('mouseup', dropObject);
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
    resetGame();
}

function resetGame() {
    isGameOver = false;
    score = 0;
    fallingObjects = [];
    updateScore();
    createGameOverLine();
}

function createGameOverLine() {
    const gamePlayArea = document.getElementById('game-play-area');
    const line = document.createElement('div');
    line.id = 'game-over-line';
    line.style.top = `${GAME_OVER_LINE}px`;
    
    const lineLabel = document.createElement('div');
    lineLabel.textContent = 'ゲームオーバーライン';
    line.appendChild(lineLabel);
    
    gamePlayArea.appendChild(line);
}

function createRandomObject() {
    const randomIndex = Math.floor(Math.random() * 3);
    return {
        type: gameObjects[randomIndex],
        x: gameArea.offsetWidth / 2,
        y: gameObjects[randomIndex].size / 2,
        rotation: 0,
        velocity: { x: 0, y: 0 },
        acceleration: { x: 0, y: 980 }
    };
}

function createNextObject() {
    if (nextNextObject) {
        nextObject = nextNextObject;
    } else {
        nextObject = createRandomObject();
    }
    nextNextObject = createRandomObject();
    updateNextObjectsDisplay();
}

function moveNextObject(event) {
    if (isGameOver) return;
    const rect = gameArea.getBoundingClientRect();
    nextObject.x = Math.max(nextObject.type.size / 2, Math.min(event.clientX - rect.left, gameArea.offsetWidth - nextObject.type.size / 2));
    updateNextObjectPosition();
}

function updateNextObjectPosition() {
    const gamePlayArea = document.getElementById('game-play-area');
    const nextObjectElement = document.getElementById('next-object') || createGameObjectElement('next-object');
    updateObjectElement(nextObjectElement, nextObject);
    gamePlayArea.appendChild(nextObjectElement);
    showDropPreview();
}

function showDropPreview() {
    const gamePlayArea = document.getElementById('game-play-area');
    const previewElement = document.getElementById('drop-preview') || createDropPreviewElement();
    previewElement.style.left = `${nextObject.x - 1}px`;
    previewElement.style.height = `${gamePlayArea.offsetHeight}px`;
    gamePlayArea.appendChild(previewElement);
}

function createDropPreviewElement() {
    const element = document.createElement('div');
    element.id = 'drop-preview';
    return element;
}

function createGameObjectElement(id) {
    const element = document.createElement('div');
    element.id = id;
    element.className = 'game-object';
    return element;
}

function updateObjectElement(element, obj) {
    element.style.width = `${obj.type.size}px`;
    element.style.height = `${obj.type.size}px`;
    element.style.left = `${obj.x - obj.type.size / 2}px`;
    element.style.top = `${obj.y - obj.type.size / 2}px`;
    element.style.transform = `rotate(${obj.rotation}deg)`;
    element.style.backgroundImage = `url('images/${obj.type.name}.PNG')`;
    element.style.backgroundSize = '98% 98%';
}

function updateNextObjectsDisplay() {
    const gamePlayArea = document.getElementById('game-play-area');
    const nextObjectsContainer = document.getElementById('next-objects-container') || createNextObjectsContainer();

    const nextElement = document.getElementById('next-object') || createGameObjectElement('next-object');
    updateObjectElement(nextElement, nextObject);

    const nextNextElement = document.getElementById('next-next-object') || createGameObjectElement('next-next-object');
    updateObjectElement(nextNextElement, nextNextObject);

    nextObjectsContainer.appendChild(nextElement);
    nextObjectsContainer.appendChild(nextNextElement);
    gamePlayArea.appendChild(nextObjectsContainer);
}

function createNextObjectsContainer() {
    const container = document.createElement('div');
    container.id = 'next-objects-container';

    const nextLabel = document.createElement('div');
    nextLabel.className = 'next-label';
    nextLabel.textContent = 'Next';

    const nextNextLabel = document.createElement('div');
    nextNextLabel.className = 'next-label';
    nextNextLabel.textContent = 'After';

    container.appendChild(nextLabel);
    container.appendChild(document.createElement('div'));
    container.appendChild(nextNextLabel);
    container.appendChild(document.createElement('div'));

    return container;
}

function dropObject() {
    if (isGameOver) return;
    const droppedObject = { ...nextObject, y: nextObject.type.size / 2 };
    fallingObjects.push(droppedObject);
    createNextObject();
}

function gameLoop(currentTime) {
    if (isGameOver) return;

    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    updatePhysics(deltaTime);
    checkCollisions();
    renderObjects();
    checkGameOver();

    requestAnimationFrame(gameLoop);
}

function updatePhysics(deltaTime) {
    const gamePlayArea = document.getElementById('game-play-area');
    fallingObjects.forEach(obj => {
        obj.velocity.x += obj.acceleration.x * deltaTime;
        obj.velocity.y += obj.acceleration.y * deltaTime;
        obj.x += obj.velocity.x * deltaTime;
        obj.y += obj.velocity.y * deltaTime;

        if (obj.x < obj.type.size / 2) {
            obj.x = obj.type.size / 2;
            obj.velocity.x *= -0.5;
        } else if (obj.x > gamePlayArea.offsetWidth - obj.type.size / 2) {
            obj.x = gamePlayArea.offsetWidth - obj.type.size / 2;
            obj.velocity.x *= -0.5;
        }

        if (obj.y > gamePlayArea.offsetHeight - obj.type.size / 2) {
            obj.y = gamePlayArea.offsetHeight - obj.type.size / 2;
            obj.velocity.y *= -0.5;
            obj.velocity.x *= 0.9;
        }

        obj.velocity.x *= 0.99;
        obj.velocity.y *= 0.99;

        if (Math.abs(obj.velocity.x) < 0.1) obj.velocity.x = 0;
        if (Math.abs(obj.velocity.y) < 0.1) obj.velocity.y = 0;

        obj.rotation += obj.velocity.x * 0.1;
    });
}

function checkCollisions() {
    for (let i = 0; i < fallingObjects.length; i++) {
        for (let j = i + 1; j < fallingObjects.length; j++) {
            if (isColliding(fallingObjects[i], fallingObjects[j])) {
                resolveCollision(fallingObjects[i], fallingObjects[j]);
                if (fallingObjects[i].type === fallingObjects[j].type) {
                    mergeObjects(i, j);
                    return;
                }
            }
        }
    }
}

function isColliding(obj1, obj2) {
    const distance = Math.sqrt((obj1.x - obj2.x) ** 2 + (obj1.y - obj2.y) ** 2);
    return distance < (obj1.type.size + obj2.type.size) / 2 - 0.1;
}

function resolveCollision(obj1, obj2) {
    const dx = obj2.x - obj1.x;
    const dy = obj2.y - obj1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const overlap = (obj1.type.size + obj2.type.size) / 2 - distance;

    if (overlap > 0) {
        const angle = Math.atan2(dy, dx);
        const moveX = overlap * Math.cos(angle) / 2;
        const moveY = overlap * Math.sin(angle) / 2;

        obj1.x -= moveX * 1.001;
        obj1.y -= moveY * 1.001;
        obj2.x += moveX * 1.001;
        obj2.y += moveY * 1.001;

        const v1 = Math.sqrt(obj1.velocity.x ** 2 + obj1.velocity.y ** 2);
        const v2 = Math.sqrt(obj2.velocity.x ** 2 + obj2.velocity.y ** 2);
        const direction1 = Math.atan2(obj1.velocity.y, obj1.velocity.x);
        const direction2 = Math.atan2(obj2.velocity.y, obj2.velocity.x);

        const newVx1 = v1 * Math.cos(direction1 - angle);
        const newVy1 = v1 * Math.sin(direction1 - angle);
        const newVx2 = v2 * Math.cos(direction2 - angle);
        const newVy2 = v2 * Math.sin(direction2 - angle);

        obj1.velocity.x = (newVx1 * (obj1.type.size - obj2.type.size) + 2 * obj2.type.size * newVx2) / (obj1.type.size + obj2.type.size) * Math.cos(angle) + newVy1 * Math.cos(angle + Math.PI/2);
        obj1.velocity.y = (newVx1 * (obj1.type.size - obj2.type.size) + 2 * obj2.type.size * newVx2) / (obj1.type.size + obj2.type.size) * Math.sin(angle) + newVy1 * Math.sin(angle + Math.PI/2);
        obj2.velocity.x = (newVx2 * (obj2.type.size - obj1.type.size) + 2 * obj1.type.size * newVx1) / (obj1.type.size + obj2.type.size) * Math.cos(angle) + newVy2 * Math.cos(angle + Math.PI/2);
        obj2.velocity.y = (newVx2 * (obj2.type.size - obj1.type.size) + 2 * obj1.type.size * newVx1) / (obj1.type.size + obj2.type.size) * Math.sin(angle) + newVy2 * Math.sin(angle + Math.PI/2);

        obj1.velocity.x *= 0.98;
        obj1.velocity.y *= 0.98;
        obj2.velocity.x *= 0.98;
        obj2.velocity.y *= 0.98;
    }
}

function mergeObjects(index1, index2) {
    const obj1 = fallingObjects[index1];
    const obj2 = fallingObjects[index2];
    const newIndex = gameObjects.indexOf(obj1.type) + 1;
    if (newIndex < gameObjects.length) {
        const newObj = {
            type: gameObjects[newIndex],
            x: (obj1.x + obj2.x) / 2,
            y: (obj1.y + obj2.y) / 2,
            rotation: 0,
            velocity: { x: 0, y: 0 },
            acceleration: { x: 0, y: 980 }
        };
        fallingObjects.splice(Math.max(index1, index2), 1);
        fallingObjects.splice(Math.min(index1, index2), 1, newObj);
        score += newIndex * 10;
        updateScore();
        checkUnlockables();
        if (newIndex === gameObjects.length - 1) {
            activateSpecialEffect();
        }
    }
}

function renderObjects() {
    const gamePlayArea = document.getElementById('game-play-area');
    gamePlayArea.innerHTML = '';
    createGameOverLine();
    fallingObjects.forEach((obj, index) => {
        const element = createGameObjectElement(`object-${index}`);
        updateObjectElement(element, obj);
        gamePlayArea.appendChild(element);
    });
    updateNextObjectPosition();
}

function activateSpecialEffect() {
    unlockSpecialImage(currentCharacter);
    alert('特別画像ゲット！');
    fallingObjects = [];
    score += 1000;
    updateScore();
}

function checkGameOver() {
    if (fallingObjects.some(obj => obj.y - obj.type.size / 2 < GAME_OVER_LINE && Math.abs(obj.velocity.y) < 0.1)) {
        isGameOver = true;
        updateHighScores(score);
        alert(`ゲームオーバー\nスコア: ${score}`);
        showTitleScreen();
    }
}

function updateScore() {
    const scoreElement = document.getElementById('score');
    if (scoreElement) {
        scoreElement.textContent = `Score: ${score}`;
    }
}

function checkUnlockables() {
    const currentCharIndex = characters.findIndex(char => char.name === currentCharacter.name);
    const currentChar = characters[currentCharIndex];

    for (let i = 0; i < currentChar.unlockScores.length; i++) {
        if (score >= currentChar.unlockScores[i] && !currentChar.images[i]) {
            unlockImage(currentChar, i);
            if (i === 1 && currentCharIndex < characters.length - 1) {
                unlockNextCharacter(currentCharIndex);
            }
        }
    }
}

function unlockImage(character, imageIndex) {
    character.images[imageIndex] = `images/${character.name}_${imageIndex + 1}.PNG`;
    showUnlockedImage(character.images[imageIndex]);
    addToGallery(character.name, character.images[imageIndex]);
}

function unlockSpecialImage(character) {
    if (!character.specialImage) {
        character.specialImage = `images/${character.name}_特別.PNG`;
        showUnlockedImage(character.specialImage);
        addToGallery(character.name, character.specialImage);
    }
}

function showUnlockedImage(imageSrc) {
    const unlockedImage = document.createElement('img');
    unlockedImage.src = imageSrc;
    unlockedImage.className = 'unlocked-image';
    gameArea.appendChild(unlockedImage);

    setTimeout(() => {
        unlockedImage.remove();
        alert('新しい画像がギャラリーに追加されました！');
    }, 3000);
}

function unlockNextCharacter(currentCharIndex) {
    characters[currentCharIndex + 1].unlocked = true;
    alert(`新しいキャラクター「${characters[currentCharIndex + 1].name}」がアンロックされました！`);
}

function addToGallery(characterName, imageSrc) {
    console.log(`${characterName}の画像 ${imageSrc} がギャラリーに追加されました。`);
}

function updateHighScores(newScore) {
    highScores.push(newScore);
    highScores.sort((a, b) => b - a);
    highScores = highScores.slice(0, 10);
}

function showHighScores() {
    gameArea.innerHTML = '';
    const highScoreScreen = document.createElement('div');
    highScoreScreen.id = 'high-score-screen';

    const title = document.createElement('h2');
    title.textContent = 'ハイスコア';
    highScoreScreen.appendChild(title);

    const scoreList = document.createElement('ol');
    highScores.forEach(score => {
        const listItem = document.createElement('li');
        listItem.textContent = score;
        scoreList.appendChild(listItem);
    });
    highScoreScreen.appendChild(scoreList);

    const backButton = document.createElement('button');
    backButton.textContent = '戻る';
    backButton.addEventListener('click', showTitleScreen);
    highScoreScreen.appendChild(backButton);

    gameArea.appendChild(highScoreScreen);
}

function showGallery() {
    gameArea.innerHTML = '';
    const galleryScreen = document.createElement('div');
    galleryScreen.id = 'gallery-screen';

    const title = document.createElement('h2');
    title.textContent = 'ギャラリー';
    galleryScreen.appendChild(title);

    characters.forEach(char => {
        const charSection = document.createElement('div');
        charSection.className = 'character-gallery';
        
        const charName = document.createElement('h3');
        charName.textContent = char.name;
        charSection.appendChild(charName);

        const createImage = (src, alt, isSpecial = false) => {
            if (src) {
                const imgElement = document.createElement('img');
                imgElement.src = src;
                imgElement.alt = alt;
                if (isSpecial) imgElement.className = 'special-image';
                imgElement.addEventListener('click', () => showFullsizeImage(src));
                charSection.appendChild(imgElement);
            }
        };

        char.images.forEach((img, index) => createImage(img, `${char.name}の画像${index + 1}`));
        createImage(char.specialImage, `${char.name}の特別画像`, true);

        galleryScreen.appendChild(charSection);
    });

    const backButton = document.createElement('button');
    backButton.textContent = '戻る';
    backButton.addEventListener('click', showTitleScreen);
    galleryScreen.appendChild(backButton);

    gameArea.appendChild(galleryScreen);
}

function showFullsizeImage(src) {
    const container = document.createElement('div');
    container.className = 'fullsize-image-container';
    
    const img = document.createElement('img');
    img.src = src;
    img.className = 'fullsize-image';
    
    container.appendChild(img);
    container.addEventListener('click', () => container.remove());
    
    document.body.appendChild(container);
}

function showGameInstructions() {
    gameArea.innerHTML = '';
    const instructionsScreen = document.createElement('div');
    instructionsScreen.id = 'instructions-screen';

    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'content-wrapper';

    const title = document.createElement('h2');
    title.textContent = 'ゲーム説明';
    contentWrapper.appendChild(title);

    const instructions = `
        「GENESISま～じ！」へようこそ！
        不思議なメタバース空間「XANA」ここに迷い込んだあなたは、素敵な少女たちと出会います。動物たちとともに、この素晴らしいな世界を楽しみましょう♡

        遊び方：
        1. 画面上部から落ちてくるオブジェクトを操作し、同じ種類のオブジェクト同士を合体させましょう。
        2. オブジェクトは左右に移動でき、クリックすると落下します。
        3. 同じ種類のオブジェクトが接触すると、より大きな新しいオブジェクトに進化します。
        4. オブジェクトを進化させてスコアを獲得し、高得点を目指しましょう。

        ゲームオーバー：
        - 積み上がったオブジェクトが画面上部の赤いラインに到達するとゲームオーバーです。

        キャラクター：
        - ゲームを進めると、新しいキャラクターがアンロックされます。
        - 各キャラクターには、スコアに応じて解放される画像があります。
        - 最大で3枚の画像をギャラリーに追加することができます。

        特殊効果：
        - 最大サイズのオブジェクト「はーと」を作ると、特別なボーナスが発動します。
        - 「はーと」を2つ合体させると、特殊効果とともに使用キャラクターの特別な画像が見られるかもしれません！

        戦略：
        - オブジェクトを効率的に配置し、大きな連鎖反応を起こすことでより高いスコアを獲得できます。
        - 画面の両端を有効活用し、空間を効率的に使いましょう。

        チャレンジ：
        - 高スコアを目指し、すべてのキャラクターをアンロックしましょう。
        - 各キャラクターの特別な画像をすべて集めることに挑戦してください。
        - 友達とスコアを競い合い、最高の「GENESISま～じ！」プレイヤーを目指しましょう！

        それでは、楽しんでプレイしてください！
    `;

    const instructionsText = document.createElement('p');
    instructionsText.innerHTML = instructions.replace(/\n/g, '<br>');
    contentWrapper.appendChild(instructionsText);

    instructionsScreen.appendChild(contentWrapper);

    const backButton = document.createElement('button');
    backButton.textContent = '戻る';
    backButton.addEventListener('click', showTitleScreen);
    instructionsScreen.appendChild(backButton);

    gameArea.appendChild(instructionsScreen);
}

window.onload = () => {
    initGame();
};