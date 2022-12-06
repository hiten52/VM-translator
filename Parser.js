import keywords from "./keywords.js"

class Parser {
    constructor(source) {
        this.source = source.trim().split(/\r?\n/)
        this.tokens = []
    }

    createTokens() {
        this.source.forEach((line) => {
            line = line.trim().split(/\s+/)
            this.createToken(line)
        });

        return this.tokens
    }

    createToken(line) {
        let word = line[0]
        switch (word) {
            case keywords.ADD || keywords.SUBTRACT || keywords.NEGATIVE 
              || keywords.NOT || keywords.OR || keywords.AND || keywords.GREATER_THAN
              || keywords.LESS_THAN || keywords.EQUAL :
                this.tokens.push({type:"ARITHMETIC", value:word})
                break
            case keywords.POP :
                this.tokens.push({type:"POP", segment: line[1], i:line[2]})
                break
            case keywords.PUSH :
                this.tokens.push({type:"PUSH", segment: line[1], i:line[2]})
                break
            default :
                throw new Error(`Invalid keyword ${word}`)
        }
    }   
}

export default Parser