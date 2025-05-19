function vector_equal (arg1, arg2) {
    if (!Array.isArray(arg1) || !Array.isArray(arg2)) {

    }

    if (arg1.some(val => isNaN(val) || typeof val !== "number") || arg2.some(val => isNaN(val) || typeof val !== "number")) {

    }

    if (arg1.length !== arg2.length) return false

    for (let i = 0; i < Math.max(arg1.length, arg2.length); i++) {
        if (arg1[i] !== arg2[i]) return false
    }

    return true
}

module.exports = vector_equal