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
            case keywords.ADD:
            case keywords.SUBTRACT:
            case keywords.NEGATIVE:
            case keywords.NOT:
            case keywords.OR:
            case keywords.AND:
            case keywords.GREATER_THAN:
            case keywords.LESS_THAN:
            case keywords.EQUAL:
                this.tokens.push({type:"ARITHMETIC", value:word})
                break
            case keywords.POP :
                this.tokens.push({type:"POP", segment:line[1], i:line[2]})
                break
            case keywords.PUSH :
                this.tokens.push({type:"PUSH", segment:line[1], i:line[2]})
                break
            case keywords.LABEL:
            case keywords.GOTO:
            case keywords.IFGOTO:
                this.tokens.push({type:"LABEL", subtype:word, value:line[1]})
                break
            case keywords.FUNCTION:
                this.tokens.push({type:"FUNCTION", name:line[1], nvars:line[2]})
                break
            case keywords.CALL:
                this.tokens.push({type:"CALL", name:line[1], nvars:line[2]})
                break
            case keywords.RETURN:
                this.tokens.push({type:"RETURN"})
                break
            default :
                console.log(`Invalid keyword ${word}`)
        }
    }   
}

export default Parser