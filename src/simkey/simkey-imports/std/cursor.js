// Moves cursor to location
function cursor(INFO, num1OrVector, num2) {
    let x, y = 0

    // First input is array
    if (Array.isArray(num1OrVector)) {
        // Shouldnt happen; just in case
        if (num1OrVector.length < 2) {
            throw new Error("Vector given to @delay is too small.")
        }
        
        // Treat first one as num if num2 is passed
        if (num2 != undefined) {
            x = num1OrVector[0]
            y = num2
        }

        // Only vector passed in
        else {
            x = num1OrVector[0]
            y = num1OrVector[1]
        }
    }

    // Second input does not exist & first was not an array
    else if (num2 === undefined) {
        throw new Error("Did not specify the second number even though no vector was passed.")
    }

    // Straightforward
    else {
        x = num1OrVector
        y = num2
    }

    // Move to rounded x,y
    return `c${Math.round(x)},${Math.round(y)}`
}

module.exports = { FUNCTION: cursor, TAKES: { PARAMS: "[VECTOR | NUM, NUM:OPTIONAL]", BLOCK: false } }