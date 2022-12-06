const address = {
    local: "LCL",
    argument: "ARG",
    this: "THIS",
    that: "THAT",
}

class CodeWriter {
    constructor(tokens, filename) {
        this.tokens = tokens
        this.filename = filename
    }

    writeCode() {
        var code = ""
        this.tokens.forEach(token => {
            if(token.type === 'POP' || token.type === 'PUSH') {
                code += this.writePopAndPush(token)
            }
        });
        return code
    }

    writePopAndPush(token) {
        var codeblock = ""
        if(token.segment === "constant") {
            codeblock += 
            `
            @${token.i}
            D=A
            @SP
            A=M
            M=D
            @SP
            M=M+1
            `
        }

        return codeblock
    }


}

export default CodeWriter