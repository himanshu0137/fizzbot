const domain = 'https://api.noopschallenge.com'
const containerElement = document.getElementById('container');
const messageElement = document.getElementById('message');
const rulesElement = document.getElementById('rules');
const numbersElement = document.getElementById('numbers');
const exampleResponseElement = document.getElementById('exampleResponse');
const answerElement = document.getElementById('answer');
const sendElement = document.getElementById('send');

function randomNumberGenerator(max, min = 0) {
    return Math.round(Math.random() * (max - min)) + min;
}
function clearAll(parentContainer) {
    parentContainer.childNodes.forEach(v => {
        v.textContent = '';
    });
}
function onAnswer(answer, url) {
    const data = {
        answer: answer
    };
    return postQuestion(url, data);
}

function render(question, url) {
    clearAll(containerElement);
    answerElement.value = '';
    messageElement.innerText = question.message || '';
    rulesElement.innerText = JSON.stringify(question.rules) || '';
    numbersElement.innerText = question.numbers || '';
    exampleResponseElement.innerText = question.exampleResponse ? Object.entries(question.exampleResponse)[0].join(' - ') : '';
    if (question.nextQuestion) {
        sendElement.onclick = () => {
            getQuestion(question.nextQuestion).then(nextQues => render(nextQues, question.nextQuestion));
        };
    }
    else {
        sendElement.onclick = () => {
            if (!answerElement.value) return;
            onAnswer(answerElement.value, url).then(result => {
                switch (result.result) {
                    case 'correct': return getQuestion(result.nextQuestion).then(nextQues => render(nextQues, result.nextQuestion));
                    case 'interview complete': return showComplete(result);
                    case 'wrong': return showWrong();
                    default: console.log(result);
                }
            });
        }
    }
}
function start(ques_url) {
    getQuestion(ques_url).then(q => render(q, ques_url));
}

function getQuestion(ques_url) {
    return fetch(domain + ques_url)
        .then(response => response.json());
}

function showComplete(result) {
    clearAll(containerElement);
    messageElement.innerText = result.message;
}

function showWrong() {
    clearAll(containerElement);
    messageElement.innerText = 'You lose refresh page to restart';
}

function postQuestion(ques_url, data) {
    return fetch(domain + ques_url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    }).then(response => {
        if (response.status === 200) return response.json();
        if (response.status === 400) return { result: 'wrong' };
    });
}

start('/fizzbot');
