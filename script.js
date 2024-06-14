const quizContainer = document.getElementById('quiz-container');
const questionElement = document.getElementById('question');
const answersElement = document.getElementById('answers');
const nextButton = document.getElementById('next-btn');
const timerElement = document.getElementById('timer');
const timerContainer = document.getElementById('timer-container');
const scoreContainer = document.getElementById('score-container');

let currentQuestionIndex = 0;
let questions = [];
let countdownTimer;
let score = 0;
const TOTAL_TIME_PER_QUESTION = 15;

async function fetchQuestions() {
    const response = await fetch('https://opentdb.com/api.php?amount=10&type=multiple');
    const data = await response.json();
    questions = data.results.map(formatQuestion);
    startQuiz();
}

function formatQuestion(questionData) {
    const formattedQuestion = {
        question: questionData.question,
        answers: [...questionData.incorrect_answers]
    };
    formattedQuestion.correctAnswer = Math.floor(Math.random() * 4);
    formattedQuestion.answers.splice(formattedQuestion.correctAnswer, 0, questionData.correct_answer);
    return formattedQuestion;
}

function startQuiz() {
    loadProgress();
    showQuestion(questions[currentQuestionIndex]);
    startTimer();
}

function showQuestion(question) {
    resetAnswersStyle();
    questionElement.innerHTML = question.question;
    answersElement.innerHTML = '';
    question.answers.forEach((answer, index) => {
        const button = document.createElement('button');
        button.innerHTML = answer;
        button.addEventListener('click', () => selectAnswer(index, question.correctAnswer));
        answersElement.appendChild(button);
    });
}

function selectAnswer(selectedIndex, correctIndex) {
    clearInterval(countdownTimer);
    const buttons = answersElement.getElementsByTagName('button');
    if (selectedIndex === correctIndex) {
        buttons[selectedIndex].style.backgroundColor = 'green';
        score++;
    } else {
        buttons[selectedIndex].style.backgroundColor = 'red';
        buttons[correctIndex].style.backgroundColor = 'green';
    }
    nextButton.style.display = 'block';
    saveProgress();
    setTimeout(() => {
        moveToNextQuestion();
    }, 2000);
}

function startTimer() {
    let timeLeft = TOTAL_TIME_PER_QUESTION;
    updateTimer(timeLeft);

    countdownTimer = setInterval(() => {
        timeLeft--;
        updateTimer(timeLeft);
        if (timeLeft <= 0) {
            clearInterval(countdownTimer);
            handleTimeout();
        }
    }, 1000);
}

function updateTimer(seconds) {
    timerElement.textContent = `Time Remaining: ${seconds} seconds`;
}

function handleTimeout() {
    const buttons = answersElement.getElementsByTagName('button');
    Array.from(buttons).forEach(button => {
        if (!button.style.backgroundColor) {
            button.style.backgroundColor = 'red';
        }
    });
    const correctIndex = questions[currentQuestionIndex].correctAnswer;
    buttons[correctIndex].style.backgroundColor = 'green';
    setTimeout(() => {
        moveToNextQuestion();
    }, 2000);
}

function resetAnswersStyle() {
    const buttons = answersElement.getElementsByTagName('button');
    Array.from(buttons).forEach(button => {
        button.style.backgroundColor = '';
    });
}

function moveToNextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        resetAnswersStyle();
        showQuestion(questions[currentQuestionIndex]);
        startTimer();
        nextButton.style.display = 'none';
    } else {
        showFinalScore();
    }
}

function showFinalScore() {
    quizContainer.innerHTML = `
        <div id="score-container">
            <h2>Quiz Completed!</h2>
            <p>Your Score: ${score} out of ${questions.length}</p>
        </div>
    `;
    clearProgress();
}

function saveProgress() {
    const progress = {
        currentQuestionIndex,
        score,
        questions
    };
    localStorage.setItem('quizProgress', JSON.stringify(progress));
}

function loadProgress() {
    const savedProgress = localStorage.getItem('quizProgress');
    if (savedProgress) {
        const { currentQuestionIndex: savedIndex, score: savedScore, questions: savedQuestions } = JSON.parse(savedProgress);
        currentQuestionIndex = savedIndex;
        score = savedScore;
        questions = savedQuestions;
    }
}

function clearProgress() {
    localStorage.removeItem('quizProgress');
}

fetchQuestions();
