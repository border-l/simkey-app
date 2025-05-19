// Sets default delay (hold & wait)
function delay(INFO, num1OrVector, num2) {
    let hold, wait = 0

    // First input is an array
    if (Array.isArray(num1OrVector)) {
        // Treat first one as number if num2 is passed
        if (num2 != undefined) {
            hold = num1OrVector[0]
            wait = num1OrVector[1]
        }
    
        // Shouldnt happen; just in case
        else if (num1OrVector.length < 2) {
            throw new Error("Vector given to @delay is too small. AT: " + num1OrVector)
        }

        // Only vector passed in
        else {
            hold = num1OrVector[0]
            wait = num1OrVector[1]
        }
    }

    // Second input does not exist & first was not an array
    else if (num2 === undefined) {
        throw new Error("Did not specify the second number for @cursor even though no vector was passed. AT: " + num1OrVector)
    }

    // Straightforward
    else {
        hold = num1OrVector
        wait = num2
    }

    // Neither can be less than 0
    if (hold < 0 || wait < 0) {
        throw new Error("Hold or wait value in @delay call is less than 0. HOLD: " + hold + ", WAIT: " + wait)
    }

    // Round them and set DEF
    INFO.DEF[0] = Math.round(hold)
    INFO.DEF[1] = Math.round(wait)
}

module.exports = { FUNCTION: delay, TAKES: { PARAMS: "[VECTOR | NUM, NUM:OPTIONAL]", BLOCK: false } }