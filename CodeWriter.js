const address = {
    local: "LCL",
    argument: "ARG",
    this: "THIS",
    that: "THAT",
    temp: "5",
    and: "&",
    or: "|",
    not: "!"
}

class CodeWriter {
    constructor(tokens, filename) {
        this.tokens = tokens
        this.filename = filename.slice(0,-3)
        this.counter = 0
    }

    writeCode() {
        var code = ""
        this.tokens.forEach(token => {
            if(token.type === 'POP' || token.type === 'PUSH') {
                code += this.writePopAndPush(token)
            } else if(token.type === 'ARITHMETIC') {
                code += this.writeArithmetic(token)
            } else if(token.type === 'LABEL') {
                code += this.writeLabel(token)
            }
        });
        return code
    }

    writeBootstrap() {
        var codeblock = ""
        codeblock += 
        `
        @256
        D=A
        @SP
        M=D

        @Bootstrap$ret
        D=A
        @SP
        A=M
        M=D
        @SP
        M=M+1

        @LCL
        D=M
        @SP
        A=M
        M=D
        @SP
        M=M+1

        @ARG
        D=M
        @SP
        A=M
        M=D
        @SP
        M=M+1

        @THIS
        D=M
        @SP
        A=M
        M=D
        @SP
        M=M+1

        @THAT
        D=M
        @SP
        A=M
        M=D
        @SP
        M=M+1

        @SP
        D=M
        @5
        D=D-A
        @ARG
        M=D

        @SP
        D=M
        @LCL
        M=D

        @Sys.init
        0;JMP

        (@Bootstrap$ret)
        `
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
            @${token.i}
            D=A
            @${lable}
            D=D+M`

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
        } else if(token.segment === "pointer") {
            var lable;
            if(token.i === '0')lable = "THIS"
            else lable = "THAT"
            if(token.type === "POP") {
                codeblock +=`
                @SP
                M=M-1
                A=M
                D=M
                @${lable}
                M=D
                `
            } else if(token.type === "PUSH") {
                codeblock +=
                `
                @${lable}
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

    writeArithmetic(token) {
        var codeblock = 
        `
        @SP
        M=M-1
        A=M
        D=M`

        if(token.value === "add") {
            codeblock += 
            `
            @SP
            M=M-1
            A=M
            M=M+D
            @SP
            M=M+1`
        } else if(token.value === "sub") {
            codeblock += 
            `
            @SP
            M=M-1
            A=M
            M=M-D
            @SP
            M=M+1`
        } else if(token.value === "neg" || token.value === "not") {
            var op;
            if(token.value === "neg")op = '-'
            else op='!'
            codeblock +=
            `
            D=${op}M
            M=D
            @SP
            M=M+1`
        } else if(token.value === "eq" || token.value === "gt" || token.value === "lt") {
            var command = token.value.toUpperCase()
            codeblock += 
            `
            @SP
            M=M-1
            A=M
            D=M-D
            @${command}${this.counter}
            D;J${command}
            D=0
            @FINAL_${command}${this.counter}
            0;JEQ
            (${command}${this.counter})
            D=-1
            (FINAL_${command}${this.counter++})
            @SP
            A=M
            M=D
            @SP
            M=M+1
            `
        } else if(token.value === 'and' || token.value === 'or') {
            codeblock += 
            `
            @SP
            M=M-1
            A=M
            D=${token.value === 'not'? "" :"D"}${address[token.value]}M
            M=D
            @SP
            M=M+1
            `
        }
        return codeblock
    }

    writeLabel(token) {
        var codeblock = ""
        if(token.subtype === "label")
            codeblock+=`(${token.value})`
        else if(token.subtype === "goto") {
            codeblock += 
            `
            @${token.value}
            0;JMP
            `
        } else if (token.subtype === "if-goto") {
            codeblock += 
            `
            @SP
            M=M-1
            A=M
            D=M
            @${token.value}
            D;JGT
            `
        }
        return codeblock
    }
}

export default CodeWriter