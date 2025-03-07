const autoImport = require("./compiler/importing/autoImport")
const tokenize = require("./compiler/organize/tokenize")

const clearComments = require("./compiler/organize/clearComments")

const parseVectors = require('./compiler/sections/parseVectors')
const parseImports = require("./compiler/sections/parseImports")
const parseSettings = require("./compiler/sections/parseSettings")
const parseModesAndSwitches = require("./compiler/sections/parseModesAndSwitches")

const compile = require("./compiler/compile/compile")
const setSettings = require("./compiler/compile/setSettings")
const setInputVectors = require('./compiler/compile/setInputVectors')

const fs = require("fs")

class Compiler {
    // Script information and built-in functions
    #script
    #tokens
    #model
    #builtIn

    // New, for inputting vectors
    #inputVectors

    #fileName

    // References to check after organization
    #checkLater
    #settings

    // For passing private fields to other functions
    #context

    constructor(fileName) {
        this.#fileName = fileName
        this.#script = fs.readFileSync(fileName, 'utf-8')
        this.#tokens = []
        this.#builtIn = ["@goto", "@end", "@if", "@elseif", "@else"]
        this.#checkLater = []
        this.#inputVectors = {}
        this.#model = {
            "IMPORTS": {},
            "SETTINGS": {
                "name": "",
                "mode": "$DEFAULT",
                "switches": [],
                "repeat": "OFF"
            },
            "VECTORS": {},
            "MODES": ["$DEFAULT"],
            "SWITCHES": [],
            "FUNCS": {},
            "MACRO": []
        }
        this.#initContext()

        // Call functions to fill model information (#organize is called in compile)
        autoImport(this.#context, `${__dirname}/simkey-imports/std/.autoimport`)
        autoImport(this.#context, `${process.cwd()}/.autoimport`)

        // Tokenize and clear all the comments
        tokenize(this.#context)
        clearComments(this.#context)

        parseModesAndSwitches(this.#context)
        parseImports(this.#context)
        parseSettings(this.#context)
        parseVectors(this.#context)
        
        // Imported function to scan over document and parse before this handling
        if (this.#model.IMPORTS["CALL.BEFORE"]) {
            this.#model.IMPORTS["CALL.BEFORE"](this.#tokens, this.#model)
        }
    }

    #initContext() {
        this.#context = {
            update: (property, set) => {
                switch(property) {
                    case 'fileName':
                        this.#fileName = set
                        break
                    case 'script':
                        this.#script = set
                    case 'tokens':
                        this.#tokens = set
                        break
                    case 'builtIn':
                        this.#builtIn = set
                        break
                    case 'checkLater':
                        this.#checkLater = set
                        break
                    case 'inputVectors':
                        this.#inputVectors = set
                        break
                    case 'model':
                        this.#model = set
                        break
                    case 'settings':
                        this.#settings = set
                        break
                    default:
                        ThrowError(5300, { AT: property })
                }
                this.#getContext()
            }
        }
        this.#getContext()
    }

    #getContext() {
        this.#context.fileName = this.#fileName
        this.#context.script = this.#script
        this.#context.tokens = this.#tokens
        this.#context.builtIn = this.#builtIn
        this.#context.checkLater = this.#checkLater,
        this.#context.model = this.#model
        this.#context.settings = this.#settings,
        this.#context.inputVectors = this.#inputVectors
    }

    compile(fileName) {
        compile(this.#context, fileName)
    }

    setSettings(object) {
        setSettings(this.#context, object)
    }

    setInputVectors(object) {
        setInputVectors(this.#context, object)
    }

    getInputVectors() {
        return JSON.parse(JSON.stringify(this.#inputVectors))
    }

    // Modes
    getModes() {
        return JSON.parse(JSON.stringify(this.#model.MODES))
    }

    // Switches
    getSwitches() {
        return JSON.parse(JSON.stringify(this.#model.SWITCHES))
    }

    // Settings
    getSettings() {
        return JSON.parse(JSON.stringify(this.#model.SETTINGS))
    }
}

module.exports = Compiler