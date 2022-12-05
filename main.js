#!/usr/bin/env node
import path from 'node:path'
import {readFile, writeFile} from 'node:fs/promises'

const inputFileName = path.basename(process.argv[2])
const outputFileName = inputFileName.slice(0,-3) + ".asm"

const source = await readFile(inputFileName)
                .then(file => file.toString())
                .catch(err => err.message)

const output = await writeFile(outputFileName, "translated code here")
                .catch(err => err.message)


