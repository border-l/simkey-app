const readline = require('readline/promises')
let Errors = require("./ErrorOverview")

// Input interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

// Dialog options, handles dialog
async function Asker() {
    // Breaks when "END" is inputted
    while (true) {
        // Get and split response and clear before response
        const options = (await rl.question("Options (es, fne, fce, fnl, fcl, fc, fn, r, END) ")).split(" ")
        console.clear()

        // Handle each case
        switch (options[0]) {
            // "Error Search"
            case "es":
                console.log(Errors.Types.fromName)
                break
            // "From Name Error"
            case "fne":
                console.log(Errors.Types.fromName[options[1] + "Error"])
                break
            // "From Code Error"
            case "fce":
                console.log(Errors.Types.fromCode[options[1]])
                break
            // "From Code List"
            case "fcl":
                console.log(getErrorList(options[1]))
                break
            // "From Name List"
            case "fnl":
                console.log(getErrorList(Errors.Types.fromName[options[1] + "Error"]))
                break
            // "From Code"
            case "fc":
                console.log(Errors.Codes[options[1]])
                break
            // "From Name"
            case "fn":
                console.log(Errors.Errors[options[1]])
                break
            // "Reload"
            case "r":
                Errors = forceReload("./ErrorOverview")
                break
            // Stops program
            case "END":
                break
            // Invalid option
            default:
                console.log("Not a valid option")
                break
        }

        // Stop loop
        if (options[0] === "END") {
            break
        }

        // Empty line
        console.log()
    }

    // Done inputting
    rl.close()
}

// Reload module to get new errors
function forceReload(modulePath) {
    // Getting actual path
    const resolvedPath = require.resolve(modulePath);

    // Delete all the cache if it exists
    if (require.cache[resolvedPath]) {
        require.cache[resolvedPath].children.forEach((child) => {
            delete require.cache[child.id];
        });

        delete require.cache[resolvedPath];
    }

    // Returns new require
    return require(modulePath);
}

// Gets list by code
function getErrorList(Code) {
    // Return object
    let l = {}

    // Goes through codes, checks if errors are under them
    for (const code in Errors.Codes) {
        if (Number(code) - (Number(code) % 1000) === Number(Code)) {
            l[code] = Errors.Codes[code]
        }
    }

    return l
}

// Start dialog
Asker()