// Returns the pixel at x,y
function getPixel(INFO, num1OrVector, num2) {
    let x, y = 0

    // First input is array
    if (Array.isArray(num1OrVector)) {
        // Treat first one as num if num2 is passed
        if (num2 != undefined) {
            x = num1OrVector[0]
            y = num2
        }

        // Shouldnt happen; just in case
        else if (num1OrVector.length < 2) {
            throw new Error("Vector given to @getPixel is too small. AT: " + num1OrVector)
        }

        // Only vector passed in
        else {
            x = num1OrVector[0]
            y = num1OrVector[1]
        }
    }

    // Second input does not exist & first was not an array
    else if (num2 === undefined) {
        throw new Error("Did not specify the second number in @getPixel call even though no vector was passed. AT: " + num1OrVector)
    }

    // Straightforward
    else {
        x = num1OrVector
        y = num2
    }

    const res = [0, 0, 0]
    INFO.ROBOT.getPixelColor(x, y, res)

    // Return array
    return res
}

module.exports = { FUNCTION: getPixel, TAKES: { PARAMS: "[VECTOR | NUM, NUM:OPTIONAL]" }}