# Socrative.JS
> Version 1.0.0

## How To Install
To install `Socrative.JS`, run the command `npm i socrative.js`.

Once installed, you can import socrative.js into your program.

## How To Import an ESM Module (like socrative.js)
### Using ESM:
The recommanded way to import an ESM module is to switch your project to ESM as well. To do this, you to need to add the following like to your `package.json` file.
```json
"type":"module"
```
Once your package type is set to module, you can add
```js
import Socrative from "socrative.js"
``` 
to the top your script.

### Using CommonJS:
You may also import Socrative trough CommonJS with the following statement:
```js
var Socrative = (await import("socrative.js")).default;
```

## How to use Socrative.JS
Socrative.JS is relatively easy to use compared to `Blooket.JS` and `Quizlet.JS`. The reason for this is that `Socrative.JS` does ***not*** use **WebSockets**.
### Events
Socrative.JS contains 3 events.
- #### **`question`**

The `question` event is emitted when it is time to answe a question. The question event returns 3 paramters. The first one is the question name (`String`), the second one is the question type (`String`), and the third one changes depending on the question.

1. If the question is a True/False (type: `TF`) or Multiple Choice (type: `MC`), the third paramater is the choices (`Array`)
2. If the question is a written question (type: `FR`), there is no third paramater

---

- #### **`answer`**

The `answer` event is emitted when the client has sent the server your answer for a question. This event returns 3 parameters. The first one is if you were correct or not (`Boolean`), the second is the correct answers (`Array`). The third parameter is the explanation (`String`)

---
- #### **`end`**
The `end` event is emitted when all questions have been answered. This event returns no parameters

### Functions
Socrative.JS contains 2 functions and a constructor.
- #### **`constructor(pin, name)`**

The `constructor` requires the room pin, and your name. This initalizes the class but does not join the game.

---
- #### **`joinGame()`**

The `joinGame` function validates your PIN and joins the game. After joining, you will receive your first `question` event.

---
- #### **`answer(a)`**

The `answer(a)` function takes your answer (`String`) and sends it to the server. You are supposed to use this function is conjuction with the `question` event.

### Constants
Socrative.JS also has constants. I recommend not messing with them, but here they are.
- `name` (`String`)

Your Name

- `pin` (`String`)

The Room PIN/Code

- `currentQuestion` (`Object`)

The current question data

- `questionData` (`Array`)

The data for all the questions

- `sessionId` (`String`)

The client's session ID.


## Example
```js
import Socrative from "socrative.js";

var game = new Socrative("P1NC0D3", "Socrative.JS Bot"); // Create a new instance
game.joinGame(); // Join the game
game.on("question", (q, t, o) => {
    if (t == "TF" || t == "MC") {
        game.answer(o[0]); // If the question is "True or False" or a "Multiple Choice" question
    } else {
        game.answer("Socrative.JS is awesome") // answer for Open Ended questions
    }
})
game.on("answer", (c, a, e) => {
    console.log(
        `You were ${c ? "correct" : "wrong"}, the correct answer was ${a[0] || "under review"}. The reason for that is ${e || "not listed"}`
    ) // Console.log details about your answer
})
game.on("end", () => {
    console.log("The game has ended") // The game is over
})
```
