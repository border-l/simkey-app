// Finds the closing bracket in #tokens
module.exports = (context, index, searchArray = context.tokens) => {
    let search = []

    // Find pair of brackets
    if (searchArray[index] === "start") {
        search = ["start", "end"]
    }
    else if (searchArray[index] === "[") {
        search = ["[", "]"]
    }
    else if (searchArray[index] === "{") {
        search = ["{", "}"]
    }

    // No pair
    else {
        return -1
    }

    // Depth of brackets
    let counter = 0

    for (let i = index + 1; i < searchArray.length; i++) {
        // Closing bracket
        if (searchArray[i] === search[1]) {
            if (counter === 0) {
                return i
            }

            counter--
        }

        // Opening bracket
        else if (searchArray[i] === search[0]) {
            counter++
        }
    }

    return -1
}