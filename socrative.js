import got from "got";
import EventEmitter from "node:events";

export default class Socrative extends EventEmitter {
    constructor(pin, name) {
        super();
        this.pin = pin;
        this.name = name;
    }
    async joinGame() {
        // Validate PIN
        try {
            var {headers} = await got.post("https://api.socrative.com/rooms/api/join/", {
                json: {"role":"student","name":this.pin,"tz_offset":300},
            })
            this.sessionId = headers['set-cookie'][0].split("sa=")[1].split(";")[0]
        } catch {
            throw new Error("Invalid PIN")
        }
        // Get Game 
        var {activity_id, id} = await got(`https://api.socrative.com/rooms/api/current-activity/${this.pin}`).json();
        this.id = id;
        // Get Questions
        var {questions} = await got(`https://teacher.socrative.com/quizzes/${activity_id}/student?room=${this.pin}`, {
            headers: {
                cookie: `sa=${this.sessionId};`
            }
        }).json();
        this.questionData = questions.reverse();
        // Join Game
        await got.post(`https://api.socrative.com/students/api/set-name/`, {
            json: {"activity_instance_id":id,"student_name":this.name},
            headers: {
                cookie: `sa=${this.sessionId};`
            }
        })
        // Emit first question
        this.currentQuestion = this.questionData[0];
        this.emitQuestion();

    }
    emitQuestion() {
        switch(this.currentQuestion.type) {
            case "TF": case "MC":
                this.emit("question", this.currentQuestion.question_text, this.currentQuestion.type, this.currentQuestion.answers?.map(i => i.text) || []);
                break;
            case "FR":
                this.emit("question", this.currentQuestion.question_text, this.currentQuestion.type);
                break;
        }
    }
    async answer(a) {
        console.log(a);
        if (this.currentQuestion.type == "TF" || this.currentQuestion.type == "MC") {
            var data = await got.post("https://api.socrative.com/students/api/responses/", {
                headers: {
                    cookie: `sa=${this.sessionId};`
                },
                json: {"question_id":this.currentQuestion.question_id,"activity_instance_id":this.id,"selection_answers":[{"answer_id":this.currentQuestion.answers?.filter(i => i.text == a)[0].id}],"text_answers":[],"answer_ids":`${this.currentQuestion.answers?.filter(i => i.text == a)[0].id}`}
            }).json();
        } else if (this.currentQuestion.type == "FR") {
            var data = await got.post("https://api.socrative.com/students/api/responses/", {
                headers: {
                    cookie: `sa=${this.sessionId};`
                },
                json: {"question_id":this.currentQuestion.question_id,"activity_instance_id":this.id,"selection_answers":[],"text_answers":[a],"answer_ids":""}
            }).json();
        }
        this.emit("answer", data.is_correct, data.correct_answers, data.explanation)
        if (this.questionData.indexOf(this.currentQuestion) != this.questionData.length - 1) {
            this.currentQuestion = this.questionData[this.questionData.indexOf(this.currentQuestion) + 1]
            this.emitQuestion();
        } else {
            this.emit("end")
        }
    }
}