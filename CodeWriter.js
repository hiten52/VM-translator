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
        this.functionList = []
    }

    writeCode() {
        var code = ""
        code += this.writeBootstrap()
        this.tokens.forEach(token => {
            if(token.type === 'POP' || token.type === 'PUSH') {
                code += this.writePopAndPush(token)
            } else if(token.type === 'ARITHMETIC') {
                code += this.writeArithmetic(token)
            } else if(token.type === 'LABEL') {
                code += this.writeLabel(token)
            } else if(token.type === 'FUNCTION') {
                code += this.writeFunction(token)
            } else if(token.type === 'CALL') {
                code += this.writeCall(token)
            } else if(token.type === 'RETURN') {
                code += this.writeReturn()
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
        D=D-1
        D=D-1
        D=D-1
        D=D-1
        D=D-1
        @ARG
        M=D
        @SP
        D=M
        @LCL
        M=D
        @Sys.init
        0;JMP
        (Bootstrap$ret)
        `
        return codeblock
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
            D=D+${token.segment === 'temp'?'A':'M'}`

            if(token.type === "POP") {
                codeblock +=`
                @frame
                M=D 
                @SP
                M=M-1
                A=M
                D=M
                @frame
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
            codeblock+=`(${this.functionList[this.functionList.length-1]}\$${token.value})`
        else if(token.subtype === "goto") {
            codeblock += 
            `
            @${this.functionList[this.functionList.length-1]}\$${token.value}
            0;JMP
            `
        } else if (token.subtype === "if-goto") {
            codeblock += 
            `
            @SP
            M=M-1
            A=M
            D=M
            @${this.functionList[this.functionList.length-1]}\$${token.value}
            D;JNE
            `
        }
        return codeblock
    }

    writeFunction(token) {
        this.functionList.push(token.name)

        var codeblock = ""
        var nvars = +token.nvars
        codeblock += 
        `
        (${token.name})
        `

        for(let i=0; i<nvars; i++)
        codeblock+=
        `
        @0
        D=A
        @SP
        A=M
        M=D
        @SP
        M=M+1
        `
        return codeblock
    }

    writeCall(token) {
        var codeblock = ""
        codeblock+=
        `
        @${token.name}$ret.${this.counter}
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

        D=M
        @${5+(+token.nvars)}
        D=D-A
        @ARG
        M=D

        @SP
        D=M
        @LCL
        M=D

        @${token.name}
        0;JMP

        (${token.name}$ret.${this.counter++})
        `
        return codeblock
    }

    writeReturn() {
        var codeblock=""
        codeblock +=
        `
        @LCL
        D=M
        @frame
        M=D

        @5
        D=D-A
        A=D
        D=M
        @return
        M=D

        @SP
        M=M-1
        A=M
        D=M
        @ARG
        A=M
        M=D

        @ARG
        D=M+1
        @SP
        M=D

        @frame
        D=M
        @1
        D=D-A
        A=D
        D=M
        @THAT
        M=D

        @frame
        D=M
        @2
        D=D-A
        A=D
        D=M
        @THIS
        M=D

        @frame
        D=M
        @3
        D=D-A
        A=D
        D=M
        @ARG
        M=D

        @frame
        D=M
        @4
        D=D-A
        A=D
        D=M
        @LCL
        M=D

        @return
        A=M
        0;JMP
        `
        return codeblock
    }

    
}

export default CodeWriter