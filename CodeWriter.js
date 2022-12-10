const address = {
    local: "LCL",
    argument: "ARG",
    this: "THIS",
    that: "THAT",
    temp: "5"
}

class CodeWriter {
    constructor(tokens, filename) {
        this.tokens = tokens
        this.filename = filename.slice(0,-3)
    }

    writeCode() {
        var code = ""
        this.tokens.forEach(token => {
            if(token.type === 'POP' || token.type === 'PUSH') {
                code += this.writePopAndPush(token)
            } else if(token.type === 'ARITHMETIC') {
                code += this.writeArithmetic(token)
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
        } else if (token.segment === "local" || token.segment === "argument" || token.segment === "this" || token.segment === "that" || token.segment === "temp") {
            let lable = address[token.segment]
            codeblock += 
            `
            @${lable}
            D=M
            @${token.i}
            D=D+A`

            if(token.type === "POP") {
                codeblock +=`
                @R13
                M=D 
                @SP
                M=M-1
                A=M
                D=M
                @R13
                A=M
                M=D
                `
            } else if(token.type === "PUSH") {
                codeblock +=
                `
                A=D
                D=M
                @SP
                A=M
                M=D
                @SP
                M=M+1
                `
            }
        } else if(token.segment === "static") {
            if(token.type === "POP") {
                codeblock +=`
                @SP
                M=M-1
                A=M
                D=M
                @${this.filename}.${token.i}
                M=D
                `
            } else if(token.type === "PUSH") {
                codeblock +=
                `
                @${this.filename}.${token.i}
                D=M
                @SP
                A=M
                M=D
                @SP
                M=M+1
                `
            }
        }
        return codeblock
    }
}

export default CodeWriter