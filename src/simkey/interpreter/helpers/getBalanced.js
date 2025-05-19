// Gets balanced expr, with index being the beginning of it in array, starting with "("
function getBalanced(index, array) {
    let i
    let str = ""
    let balanced = 0

    for (i = index; i < array.length; i++) {
        token = array[i]

        for (let x = 0; x < token.length; x++) {
            if (token[x] === "(") balanced -= 1
            else if (token[x] === ")") balanced += 1
        }

        str += " " + token
        if (balanced === 0) return [str, i]
    }

    return [str, i]
}

module.exports = getBalanced