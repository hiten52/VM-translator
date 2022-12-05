#!/usr/bin/env node
const fileName = process.argv[2]

import {readFile} from 'node:fs/promises'
const source = await readFile(fileName).then(file => file.toString())


