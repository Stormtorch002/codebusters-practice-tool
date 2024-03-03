const { createApp } = Vue;

const choose = arr => arr[Math.floor(Math.random() * arr.length)];

const shuffleArray = arr => arr
    .map(a => [Math.random(), a])
    .sort((a, b) => a[0] - b[0])
    .map(a => a[1]);

const letters = {
    "A": 0,
    "B": 1,
    "C": 2,
    "D": 3,
    "E": 4,
    "F": 5,
    "G": 6,
    "H": 7,
    "I": 8,
    "J": 9,
    "K": 10,
    "L": 11,
    "M": 12,
    "N": 13,
    "O": 14,
    "P": 15,
    "Q": 16,
    "R": 17,
    "S": 18,
    "T": 19,
    "U": 20,
    "V": 21,
    "W": 22,
    "X": 23,
    "Y": 24,
    "Z": 25,
}

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const app = createApp({
    data() {
        return {
            alphabet: alphabet,
            original: "",
            author: "",
            encode: [...Array(26).keys()],
            decode: Array(26).fill(-1),
            difficulty: getDefaultDifficulty(),
            patristocrat: false,
            problemIndex: 0,
        }
    },
    computed: {
        plaintext() {
            if (!this.patristocrat) return this.original;
            return Array.from(this.original).filter(x => alphabet.includes(x)).reduce((acc, curr, idx) => idx % 5 === 0 ? acc + " " + curr : acc + curr);
        },
        ciphertext() {
            return Array.prototype.map.call(this.plaintext, x => {
                if (alphabet.includes(x) && x != " ") {
                    return alphabet[this.encode[letters[x]]];
                } else {
                    return x;
                }
            }).join("");
        },
        decodedMessage() {
            return Array.prototype.map.call(this.ciphertext, x => {
                if (alphabet.includes(x) && x != " ") {
                    return this.decodeLetter(x);
                } else {
                    return x;
                }
            }).join("");
        },
        isSolved() {
            return this.decodedMessage == this.plaintext;
        },
    },
    methods: {
        letterToIdx(x) {
            return letters[x];
        },
        keyDown(e, letter, textIndex) {
            if (e.code == "ArrowLeft" && textIndex) {
                this.focusPrev(textIndex);
                e.preventDefault();
            }
            if (e.code == "ArrowRight" && textIndex) {
                this.focusNext(textIndex);
                e.preventDefault();
            }
            if (e.code == "Backspace") {
                this.decode[letters[letter]] = -1;
                e.preventDefault();
            }
        },
        beforeInput(e, letter, textIndex) {
            e.preventDefault();
            if (!e.data) return;
            const key = e.data[0].toUpperCase();
            if (!alphabet.includes(key)) return;
            this.decode[letters[letter]] = letters[key];
            if (textIndex) this.focusNext(textIndex);
        },
        focusPrev(textIndex) {
            do {
                textIndex--;
            } while (!this.decodable(this.ciphertext[textIndex]))
            this.$refs.inputs[textIndex].focus();
        },
        focusNext(textIndex) {
            const originalTextIndex = textIndex;
            do {
                textIndex++;
                if (textIndex >= this.$refs.inputs.length) {
                    textIndex = originalTextIndex; 
                    break;
                }
            } while (!this.decodable(this.ciphertext[textIndex]))
            if (this.$refs.inputs[textIndex]) {
                this.$refs.inputs[textIndex].focus();
            }
        },
        isDupe(x) {
            let already = false;
            for (let i = 0; i < this.decode.length; i++) {
                if (alphabet[this.decode[i]] == x) {
                    if (already) return true;
                    already = true;
                }
            }
            return false;
        },
        randomMap() {
            let map;
            do {
                map = shuffleArray([...Array(26).keys()]);
            } while (map.some((x, i) => x == i));
            return map;
        },
        decodable(x) {
            return alphabet.includes(x);
        },
        decodeLetter(x) {
            if (!alphabet.includes(x)) return x;
            if (this.decode[letters[x]] > -1) return alphabet[this.decode[letters[x]]];
            else return "";
        },
        changeDifficulty(difficulty) {
            if (difficulty == this.difficulty) return;
            setDefaultDifficulty(difficulty);
            this.difficulty = difficulty;
            this.newProblem();
        },
        togglePatristocrat() {
            this.patristocrat = !this.patristocrat;
        },
        countLetter(str, letter) {
            var regExp = new RegExp(letter, "g");
            return (str.match(regExp) || []).length;
        },
        zip(...rows) {
            return [...rows[0]].map((_, c) => rows.map(row => row[c]));
        },
        newProblem() {
            const randomIndex = Math.floor(Math.random() * QUOTES[this.difficulty].length);
            this.setProblemByIndex(randomIndex);
        },
        promptForCustomIndex() {
            let index = prompt("Enter the problem # you want to solve:");
            if (index[0] === "#") {
                index = index.substring(1);
            }
            let difficulty = this.difficulty;
            if (['E','M','H'].includes(index[0])) {
                difficulty = ['E','M','H'].indexOf(index[0]);
                index = index.substring(1);
            }
            if (index !== null && !isNaN(index)) {
                index = parseInt(index);
                if (index >= 0 && index < QUOTES[difficulty].length) {
                    this.difficulty = difficulty;
                    this.setProblemByIndex(index);
                }
                else {
                    alert("Problem doesn't exist.");
                }
            }
            else {
                alert("Invalid input.");
            }
        },
        setProblemByIndex(index) {
            const quote = QUOTES[this.difficulty][index];
            this.original = quote.text.toUpperCase();
            this.author = quote.author;
            this.encode = this.randomMap();
            this.decode = Array(26).fill(-1);
            this.problemIndex = index; 
        },
    },
    created() {
        this.newProblem();
    }
}).mount("#main");
