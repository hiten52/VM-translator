#!/usr/bin/env node
import path from 'node:path'
import {readFile, writeFile} from 'node:fs/promises'

import Parser from './Parser.js'
import CodeWriter from './CodeWriter.js'

const inputFileName = path.basename(process.argv[2])
const outputFileName = inputFileName.slice(0,-3) + ".asm"

const source = await readFile(inputFileName)
                .then(file => file.toString())
                .catch(err => err.message)

let tokens = new Parser(source).createTokens()
let code = new CodeWriter(tokens, inputFileName).writeCode()

const output = await writeFile(outputFileName, code)
                .catch(err => err.message)


