// Finds the next or in expression
module.exports = (condition, index) => {
    // Check chars after the index for |
    for (let i = index + 1; i < condition.length; i++) {
        if (condition[i] === "|") {
            return i
        }
    }

    // Go to end
    return condition.length
}