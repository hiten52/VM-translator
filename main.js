#!/usr/bin/env node
import path from 'node:path'
import { lstatSync } from 'node:fs'
import {readFile, writeFile, readdir} from 'node:fs/promises'

import Parser from './Parser.js'
import CodeWriter from './CodeWriter.js'

var files = []

const input = path.basename(process.argv[2])
const isDir = lstatSync(input).isDirectory()
var outputFileName
var inputPath = input

if(isDir) {
    outputFileName = input + ".asm"
    files = await readdir(input);
} else {
    outputFileName = input.slice(0,-3) + ".asm"
    files.push(input)
}

var code = ""
for (const inputFileName of files) {
    if(inputFileName.slice(-3) !== '.vm')continue
    if(isDir)inputPath = path.join(input, inputFileName)
    const source = await readFile(inputPath)
        .then(file => file.toString())
        .catch(err => err.message)

    let tokens = new Parser(source).createTokens()
    code += new CodeWriter(tokens, inputFileName).writeCode()
}

const output = await writeFile(outputFileName, code)
    .catch(err => err.message)